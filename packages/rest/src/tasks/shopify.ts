import { adminGqlClient } from "../config"
import { shopifyIdToUrlId } from "../utils"

type CreateProductItem = {
  title: string,
  description: string,
  url: string,
  prompt: string
}

// export async function watermarkMedia(url: string, uuid: string) {
//   const originalBuffer = await fetch(url, {
//     "method": "GET",
//     "cache": "no-cache",
//   }).then((res) => {
//     return res.arrayBuffer()
//   })

//   const original = sharp(originalBuffer).resize({ width: 640, height: 1920 })

//   // const watermarked = sharp(
//   //   "./src/assets/image/yoga_mask.png"
//   // )

//   // await Promise.all([watermarked.metadata().then((metadata) => {
//   //   console.log(`Metadata MASK:: W: ${metadata.width} H: ${metadata.height}`)
//   // }),
//   // sharp(original).metadata().then((metadata) => {
//   //   console.log(`Metadata OG:: W: ${metadata.width} H: ${metadata.height}`)
//   // })
//   // ])

//   const watermarked: Buffer = await original.composite([
//     {
//       input: "./src/assets/image/yoga_mask.png",
//       tile: true,
//       blend: "multiply"
//     },
//     {
//       input: "./src/assets/image/yoga_top.png",
//       tile: true,
//       blend: "add"
//     },

//   ]).toFormat("png").toBuffer()
//   console.log(process.env.S3_BUCKET_ID)
//   s3Client.send(
//     new PutObjectCommand({
//       Bucket: process.env.S3_BUCKET_ID ?? "",
//       Key: `${uuid}.png`,
//       Body: watermarked
//     })
//   )

//   return url
// }
export type CreatedProductVariant = {
  variantId: string,
  imageUrl: string
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

  const product = await adminGqlClient.request(query, {
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
  await adminGqlClient.request(publicationQuery, {
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
    variantId: product.data?.productCreate.product.variants.edges[0].node.id,
    imageUrl: item.url // TODO: Upload image to S3, optimize and serve. OR find a way to wait for shopify image to be READY status
  }
}

export async function getProductsById(ids: string[]) {
  if (ids.length == 0) return []

  const joined = ids.map(id => `id:${shopifyIdToUrlId(id)}`).join(" OR ")
  const query = `#graphql
    query getProductsById($query: String) {
      products(first: 10, query: $query) {
        edges {
          node {
            id
            title
            description
            featuredImage {
              url
            }
            priceRange {
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges{
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `

  const products = await adminGqlClient.request(query, {
    variables: {
      query: `(${joined})`,
    }
  })

  return products.data?.products.edges ?? []
}