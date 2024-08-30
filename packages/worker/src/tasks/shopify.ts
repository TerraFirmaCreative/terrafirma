import { adminClient, logger } from "../config"
import { spawn } from "child_process"
import sharp, { Sharp } from "sharp"
import { uploadImage } from "./image"

type CreateProductItem = {
  title: string,
  description: string,
  url: string,
  prompt: string
}

export type CreatedProductVariant = {
  productId: string,
  imageUrl: string
}

export async function createProjectionMaps(productId: string, imageUrl: string) {
  logger.info(`Starting ${productId} ${imageUrl}`)
  const child = spawn(process.env.PYTHON_CMD ?? "python3", ['./project.py', productId, imageUrl], {
    cwd: process.env.PROJECTION_MAP_PATH
  })

  let buffer: string = ''
  child.stdout.on('data', async (data: string) => {
    buffer += data
  })

  child.stdout.on('end', async () => {
    try {
      const images = JSON.parse(buffer) as string[]

      logger.info(`Received ${images.length} projection mapped images`)
      const image_urls = await Promise.all(images.map((encoded: string, i) =>
        uploadImage(sharp(Buffer.from(encoded, "base64")), crypto.randomUUID())
      ))
      logger.info("Uploaded images to S3")

      image_urls.forEach((url) => {
        addProductMedia(productId, url)
        logger.info("Created product media")
      })
    }
    catch (e) {
      logger.error(e)
    }
  })

  child.stderr.on('data', (data: Buffer) => {
    logger.error(`Child process error: ${data.toString('ascii')}`)
  })

  child.on('error', (err) => {
    logger.error(`Child process error: ${err}`)
  })
}

export async function addProductMedia(id: string, url: string) {
  const query = `#gqladmin
    mutation addProductMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media {
          mediaErrors {
            message
          }
        }
      }
    }
  `

  await adminClient.request(query, {
    variables: {
      productId: id,
      media: {
        alt: "Product Visualisation",
        mediaContentType: "IMAGE",
        originalSource: url
      }
    }
  })
}

export async function uploadShopify(images: Sharp[]): Promise<string[]> {
  const filenames = images.map(_ => `${crypto.randomUUID()}.png`)
  const stagedUploads = await adminClient.request(`#gqladmin
    mutation stageUpload($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          parameters {
            name
            value
          }
          resourceUrl
          url
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      input: filenames.map(filename => {
        return {
          "filename": filename,
          "httpMethod": "PUT",
          "mimeType": "image/png",
          "resource": "PRODUCT_IMAGE"
        }
      })
    }
  })

  // TODO: dynamically take headers from response
  let i = 0
  for (const stagedTarget of stagedUploads.data?.stagedUploadsCreate.stagedTargets) {
    logger.debug(`${i} ${stagedTarget}`)
    const buffer = await images[i].toBuffer()
    const uploadResponse = await fetch(stagedTarget.resourceUrl, {
      "method": "PUT",
      "body": buffer,
      "headers": {
        "content_type": "image/png",
        "acl": "private"
      }
    })
    logger.debug(`uploadResponse: ${uploadResponse}`)
    i++
  }

  return stagedUploads.data?.stagedUploadsCreate.stagedTargets.map((target: any) => target.url as string)
}

export async function createProduct(item: CreateProductItem): Promise<CreatedProductVariant> {
  const uuid = crypto.randomUUID()
  const input = {
    status: "ACTIVE",
    title: `${item.title} [${uuid.toUpperCase()}]`,
    vendor: "Terra Firma Creative",
    descriptionHtml: item.description,
    customProductType: "Yoga Mat",
    tags: `Custom`
  }

  const media = [
    {
      mediaContentType: "IMAGE",
      originalSource: item.url
    }
  ]

  const product = await adminClient.request(`#gqladmin
    mutation createProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
      productCreate(input: $input, media: $media) {
        product {
          id
          variants(first: 1) {
            edges {
              node {
                id
                inventoryItem {
                  id
                }
              }
            }
          }
        }
      }
    }
  `, {
    variables: {
      input: input,
      media: media
    }
  })

  logger.debug(product.data?.productCreate.product.variants.edges[0].node.id)

  const variantUpdate = await adminClient.request(`#gqladmin
    mutation productVariantUpdate($input: ProductVariantInput!) {
      productVariantUpdate(input: $input) {
        product {
          id
        }
        userErrors {
          message
        }
      }
    }
  `, {
    "variables": {
      "input": {
        id: product.data?.productCreate.product.variants.edges[0].node.id,
        price: "70.00",
        inventoryItem: {
          measurement: {
            weight: {
              unit: "OUNCES",
              value: 64
            }
          },
          sku: "MATGEN"
        },
        inventoryPolicy: "CONTINUE",
      }
    }
  })

  logger.debug(variantUpdate.errors?.message, require('util').inspect(variantUpdate, { depth: null }))

  await adminClient.request(`#gqladmin
    mutation setLocations($id: ID!, $updates: [InventoryBulkToggleActivationInput!]!) {
      inventoryBulkToggleActivation(inventoryItemId: $id, inventoryItemUpdates: $updates) {
        inventoryItem {
          variant {
            product {
              id
            }
          }
        }
        userErrors {
          message
        }
      }
    }
  `, {
    variables: {
      id: product.data?.productCreate.product.variants.edges[0].node.inventoryItem.id,
      updates: [
        {
          activate: true,
          locationId: "gid://shopify/Location/97568981300"
        },
        {
          activate: false,
          "locationId": "gid://shopify/Location/86717694260"
        }
      ]
    }
  })


  const publicationQuery = `#gqladmin
    mutation productPublish($input: ProductPublishInput!) {
      productPublish(input: $input) {
        productPublications {
          channel {
            name
          }
        }
      }
    }
  `
  await adminClient.request(publicationQuery, {
    variables: {
      input: {
        id: product.data?.productCreate.product.id,
        productPublications: [
          {
            publicationId: process.env.SHOPIFY_APP_PUBLICATION_ID
          }
        ]
      }
    }
  })

  return {
    productId: product.data?.productCreate.product.id,
    imageUrl: item.url // TODO: Upload image to S3, optimize and serve. OR find a way to wait for shopify image to be READY status
  }
}