import { ApiType, shopifyApiProject } from "@shopify/api-codegen-preset"

export default {
  schema: "https://shopify.dev/storefront-graphql-direct-proxy",
  documents: ["*.ts", "!node_modules"],
  projects: {
    storefront: {
      ...shopifyApiProject({
        apiType: ApiType.Storefront,
        apiVersion: "2024-04",
        outputDir: "./types",
        "module": "storefront"
      }),
      extensions: {
        codegen: {
          pluckConfig: {
            gqlMagicComment: 'gqlstorefront'
          }
        }
      }
    },
    admin: shopifyApiProject({
      apiType: ApiType.Admin,
      apiVersion: "2024-04",
      outputDir: "./types",
      "module": "admin"
    }),
  },
}