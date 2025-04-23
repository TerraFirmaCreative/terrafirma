import { S3Client } from "@aws-sdk/client-s3"
import { SQSClient } from "@aws-sdk/client-sqs"
import { createAdminApiClient } from "@shopify/admin-api-client"
import { createStorefrontApiClient } from "@shopify/storefront-api-client"
import { Midjourney } from "midjourney"
import { PrismaClient } from "@prisma/client"
import * as dotenv from 'dotenv'
import * as nodemailer from 'nodemailer'
import pino from "pino"
import { io } from "socket.io-client"

dotenv.config()

export const prisma = new PrismaClient({ "datasourceUrl": process.env.DATABASE_URL! })

export const socket = io(process.env.WS_URL ?? "ws://localhost:3000", {
  autoConnect: true
})

const Config = {
  PRODUCT_PRICE: "80.00",
  SQS_URL: process.env.SQS_URL!,
  MAX_TASK_COUNT: parseInt(process.env.MAX_TASK_COUNT ?? '1'),
  MJ_COOLDOWN_MS: parseInt(process.env.MJ_COOLDOWN_MS ?? '3000'),
  OPENAI_KEY: process.env.OPENAI_KEY ?? "",
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ?? "",
  SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN ?? "",
  SHOPIFY_API_SECRET_KEY: process.env.SHOPIFY_API_SECRET_KEY ?? "",
  SHOPIFY_ADMIN_ACCESS_TOKEN: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ?? "",
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? ""
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

export const sqsClient = new SQSClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_KEY ?? ""
  }
})

export const adminClient = createAdminApiClient({
  storeDomain: Config.SHOPIFY_STORE_DOMAIN,
  apiVersion: "2024-07",
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
  Debug: false,
})

export const s3Client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_KEY ?? ""
  }
})

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: "no-reply@terrafirmacreative.com",
    serviceClient: process.env.GOOGLE_SERVICE_CLIENT ?? "",
    privateKey: process.env.GOOGLE_SERVICE_PRIV_KEY ?? ""
  }
})

export default Config