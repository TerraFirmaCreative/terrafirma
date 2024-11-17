import * as dotenv from 'dotenv'
import '@shopify/shopify-api/adapters/node'
import { createAdminApiClient, createAdminRestApiClient } from '@shopify/admin-api-client'
import { createStorefrontApiClient } from '@shopify/storefront-api-client'
import { Midjourney } from 'midjourney'
import { S3Client } from '@aws-sdk/client-s3'
import { PrismaClient } from '@prisma/client'
import { SQSClient } from '@aws-sdk/client-sqs'
import pino from 'pino'

console.log(process.env.NODE_ENV)

dotenv.config()

export const prisma = new PrismaClient({ "datasourceUrl": process.env.DATABASE_URL! })

const hooks = {
  logMethod(inputArgs: any, method: any): any {
    if (inputArgs.length >= 2) {
      const arg1 = inputArgs.shift()
      const arg2 = inputArgs.shift()
      return method.apply(this, [arg2, arg1, ...inputArgs])
    }
    return method.apply(this, inputArgs)
  },
}

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "debug",
  transport: {
    target: 'pino/file',
    options: {
      destination: process.env.NODE_ENV == "production" ? `${process.env.LOG_DIR}` : 1
    }
  }
})

// export const logger = console

const Config = {
  OPENAI_KEY: process.env.OPENAI_KEY ?? "",
  ETSY_SHOP_ID: process.env.ETSY_SHOP_ID ?? "",
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ?? "",
  SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  SHOPIFY_API_SECRET_KEY: process.env.SHOPIFY_API_SECRET_KEY ?? "",
  SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "",
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? ""
}

export const adminClient = createAdminRestApiClient({
  storeDomain: Config.SHOPIFY_STORE_DOMAIN,
  apiVersion: "2024-01",
  accessToken: Config.SHOPIFY_ADMIN_ACCESS_TOKEN
})

export const adminGqlClient = createAdminApiClient({
  storeDomain: Config.SHOPIFY_STORE_DOMAIN,
  apiVersion: "2024-01",
  accessToken: Config.SHOPIFY_ADMIN_ACCESS_TOKEN
})

export const storefrontClient = createStorefrontApiClient({
  storeDomain: Config.SHOPIFY_STORE_DOMAIN,
  apiVersion: "2024-01",
  publicAccessToken: Config.SHOPIFY_STOREFRONT_ACCESS_TOKEN
})

export const mjClient = new Midjourney({
  ServerId: process.env.MJ_SERVER_ID,
  ChannelId: process.env.MJ_CHANNEL_ID,
  SalaiToken: process.env.MJ_SALAI_TOKEN ?? "",
})

export const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_KEY ?? ""
  }
})

export const sqsClient = new SQSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_KEY ?? ""
  }
})

export default Config