import { adminClient } from "../config"
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
  console.log("Starting", productId, imageUrl)
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

      console.log(`Received ${images.length} projection mapped images`)
      const image_urls = await Promise.all(images.map((encoded: string, i) =>
        uploadImage(sharp(Buffer.from(encoded, "base64")), crypto.randomUUID())
      ))
      console.log("Uploaded images to S3")

      image_urls.forEach((url) => {
        addProductMedia(productId, url)
        console.log("Created product media")
      })
    }
    catch (e) {
      console.log(e)
    }
  })

  child.stderr.on('data', (data: Buffer) => {
    console.log("Child process error: ", data.toString('ascii'))
  })

  child.on('error', (err) => {
    console.log("Child process error:", err)
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

export async function createProduct(item: CreateProductItem): Promise<CreatedProductVariant> {
  const query = `#gqladmin
    mutation createProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
      productCreate(input: $input, media: $media) {
        product {
          id
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  `
  const uuid = crypto.randomUUID()
  const input = {
    status: "ACTIVE",
    title: `${item.title} [${uuid.toUpperCase()}]`,
    vendor: "Terrafirm Creative",
    descriptionHtml: item.description,
    customProductType: "Yoga Mat",
    variants: { // Might be deprecated
      price: "70"
    },
    tags: `Custom`
    // TODO: Add hidden metafield
  }

  const media = [
    {
      mediaContentType: "IMAGE",
      originalSource: item.url
    }
  ]

  const product = await adminClient.request(query, {
    variables: {
      input: input,
      media: media
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
    // productId: product.data?.productCreate.product.variants.edges[0].node.id,
    productId: product.data?.productCreate.product.id,
    imageUrl: item.url // TODO: Upload image to S3, optimize and serve. OR find a way to wait for shopify image to be READY status
  }
}