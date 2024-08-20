import { StorefrontApiClient, createStorefrontApiClient } from "@shopify/storefront-api-client"
import { AdminApiClient, createAdminApiClient } from "@shopify/admin-api-client"
import { Prisma, PrismaClient } from '@prisma/client'

let client: StorefrontApiClient
let prisma: PrismaClient

export const locales = ["en-US", "en-GB", "en-CA", "en-AU"]
export const defaultLocale = "en-AU"

export function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
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