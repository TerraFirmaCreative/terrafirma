import { StorefrontApiClient, createStorefrontApiClient } from "@shopify/storefront-api-client"
import { AdminApiClient, createAdminApiClient } from "@shopify/admin-api-client"
// import { Server } from "socket.io"
import { Prisma, PrismaClient } from '@prisma/client'

// export let io: Server

// export function initIo(server: any) {
//   console.log("Initialising socket.io")
//   io = new Server(server)
//   return io
// }

let client: StorefrontApiClient
let adminClient: AdminApiClient
let prisma: PrismaClient

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

export function getAdminClient() {
  if (!adminClient) {
    adminClient = createAdminApiClient({
      storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
      apiVersion: "2024-01",
      accessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN!
    })
  }

  return adminClient
}

export function getStorefrontClient() {
  if (!client) {
    client = createStorefrontApiClient({
      storeDomain: process.env.SHOPIFY_STORE_DOMAIN!,
      apiVersion: "2024-01",
      publicAccessToken: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!
    })
  }

  return client
}