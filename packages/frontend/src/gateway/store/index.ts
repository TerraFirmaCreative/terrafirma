"use server"
import { GetProductQuery, ProductSortKeys } from "@/lib/types/graphql"
import { getAdminClient, getStorefrontClient } from '@/config'
import { shopifyIdToUrlId } from "@/lib/utils"
import { GetProductsByIdQuery } from "../../../types/storefront.generated"

export const getExistingCustomMats = async () => {
  const query = `#graphql
    query customProducts($first: Int, $sortKey: ProductSortKeys, $query: String) {
      products(first: $first, sortKey: $sortKey, query: $query) {
        edges {
          node {
            id
            title
            featuredImage {
              url
            }
            priceRange {
              maxVariantPrice {
                currencyCode
                amount
              }
            }
          }
        }
      }
    }
  `
  return (await getStorefrontClient().request(query, {
    variables: {
      first: 20,
      sortKey: ProductSortKeys.BestSelling,
      query: "tag:Custom"
    }
  })).data?.products.edges.map((edge: any) =>
    edge.node
  )
}

export type FilterParams = {
  cursor?: string,
  sortKey?: ProductSortKeys,
  reverse?: boolean
  priceRange?: number[],
  productTag?: string
}

export const getPaginatedProducts = async (params: FilterParams) => {
  const query = `#graphql
    query paginatedProducts($first: Int, $sortKey: ProductSortKeys, $query: String, $reverse: Boolean, $after: String) {
      products(first: $first, sortKey: $sortKey, query: $query, reverse: $reverse, after: $after) {
        edges {
          cursor
          node {
            id
            title
            featuredImage {
              url
            }
            priceRange {
              maxVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `
  return (await getStorefrontClient().request(query, {
    variables: {
      first: 20,
      sortKey: params.sortKey ?? ProductSortKeys.CreatedAt,
      query: `tag:${params.productTag ?? 'Public'} variants.price:>=${params.priceRange?.at(0)?.toString() ?? '0'} variants.price:<=${params.priceRange?.at(1)?.toString() ?? '200'}`,
      reverse: params.reverse,
      after: params.cursor
    },
  })).data?.products.edges
}

export const getProductsById = async (ids: string[]): Promise<GetProductsByIdQuery['products']['edges']> => {
  if (ids.length == 0) return []

  const joined = ids.map(id => `id:${shopifyIdToUrlId(id)}`).join(" OR ")
  console.log(joined)
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

  const products = await getAdminClient().request(query, {
    variables: {
      query: `(${joined})`,
    }
  })

  return products.data?.products.edges ?? []
}

export const getProduct = async (productId: string): Promise<GetProductQuery['product']> => {
  const query = `#graphql
    query getProduct($id: ID!) {
      product(id: $id) {
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
  `

  return (await getStorefrontClient().request(query, {
    variables: {
      id: productId
    }
  })).data?.product
}

