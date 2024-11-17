import sharp, { Sharp } from "sharp"
import { s3Client } from "../config"
import { GetObjectCommand, PutObjectCommand, PutObjectCommandOutput } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export async function remoteImage(url: string): Promise<ArrayBuffer> {
  return await fetch(url, {
    method: "GET",
    cache: "no-cache"
  }).then(res => {
    return res.arrayBuffer()
  })
}

export async function uploadImage(image: Sharp, key: string): Promise<string> {
  const res: PutObjectCommandOutput = await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_ID ?? "",
      Key: `${key}.png`,
      Body: await image.toFormat("png").toBuffer(),
      ContentType: "image/png"
    })
  )

  const url = await getSignedUrl(s3Client,
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_ID ?? "",
      Key: `${key}.png`,
      ResponseContentDisposition: "inline",
      ResponseContentType: "image/png"
    }),
    { expiresIn: 300000 })
  return `${url}&response-content-disposition=attachment`
}

export async function splitQuadImage(input: Sharp): Promise<sharp.Sharp[]> {
  const metadata = await input.metadata()
  const output: Sharp[] = []
  const newWidth = Math.floor(metadata.width! / 2)
  const newHeight = Math.floor(metadata.height! / 2)

  let index = 0
  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      output[index] = input.clone().extract({
        top: y * newHeight,
        left: x * newWidth,
        width: newWidth,
        height: newHeight
      }).resize({
        width: newWidth,
        height: newHeight
      })

      index++
    }
  }

  return output
}