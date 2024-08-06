import { adminGqlClient } from "../config"
import { shopifyIdToUrlId } from "../utils"

type CreateProductItem = {
  title: string,
  description: string,
  url: string,
  prompt: string
}

/*
* Code for watermarking images before adding them on shopify. Keeping here for future need.
*/

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