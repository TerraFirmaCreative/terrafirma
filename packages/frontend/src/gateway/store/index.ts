"use server"
import { CartLineInput, CartLineUpdateInput, CountryCode, GetProductQuery, ProductSortKeys, SearchSortKeys } from "@/lib/types/graphql"
import { getStorefrontClient } from '@/config'
import { parseLocale, shuffle } from "@/lib/utils"
import { CartLineDto } from "@/lib/types/store.dto"
import { useParams } from "next/navigation"
import { RandomProductsQuery, SearchPredictionsQuery } from "../../../types/storefront.generated"

/*
*  Store actions here are all related to fetching products for the common storefront functionality
*/


export const getExistingCustomMats = async (locale: string) => {
  const [_, countryCode] = parseLocale(locale)
  const query = `#graphql
    query customProducts($first: Int, $sortKey: ProductSortKeys, $query: String, $countryCode: CountryCode) @inContext(country: $countryCode) {
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
      query: "tag:Custom",
      countryCode: countryCode as CountryCode
    }
  })).data?.products.edges.map((edge: any) =>
    edge.node
  )
}

export const getSearchPredictions = async (query: string, locale: string): Promise<SearchPredictionsQuery["predictiveSearch"]> => {
  const [_, countryCode] = parseLocale(locale)
  const predictionsQuery = await getStorefrontClient().request(`#graphql
    query searchPredictions($query: String!, $countryCode: CountryCode) @inContext(country: $countryCode) {
      predictiveSearch(query: $query) {
        queries {
          text
          styledText
        }
        products {
          id
          title
          featuredImage {
            url
          }
        }
      }
    }
  `, {
    variables: {
      query: query,
      countryCode: countryCode as CountryCode
    }
  })

  return predictionsQuery.data?.predictiveSearch
}

export type SearchParams = {
  cursor?: string,
  sortKey?: SearchSortKeys,
  reverse?: boolean
  priceRange?: number[],
  productTag?: string
}
export const searchProducts = async (query: string, params: SearchParams, locale: string) => {
  const [_, countryCode] = parseLocale(locale)
  const searchQuery = await getStorefrontClient().request(`#graphql
    query searchPaginatedProducts($first: Int, $sortKey: SearchSortKeys, $query: String!, $reverse: Boolean, $after: String, $productFilters: [ProductFilter!] $countryCode: CountryCode) @inContext(country: $countryCode) {
      search(first: $first, sortKey: $sortKey, query: $query, reverse: $reverse, after: $after, productFilters: $productFilters, prefix: LAST) {
        edges {
          cursor
          node {
            ...on Product {
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
    }
`, {
    variables: {
      first: 20,
      sortKey: params.sortKey ?? SearchSortKeys.Relevance,
      query: query,
      reverse: params.reverse,
      after: params.cursor,
      productFilters: [
        {
          price: {
            min: params?.priceRange?.at(0) ?? 0,
            max: params?.priceRange?.at(1) ?? 200
          }
        }
      ],
      countryCode: countryCode as CountryCode
    }
  })

  return searchQuery.data?.search.edges
}

export const getRandomProducts = async (): Promise<RandomProductsQuery["products"]["edges"]> => {
  const query = `#graphql
  query randomProducts {
    products(first: 70, sortKey: ID) {
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
  const edges = shuffle((await getStorefrontClient().request(query)).data?.products.edges ?? [])

  return edges
}

export type FilterParams = {
  cursor?: string,
  sortKey?: ProductSortKeys,
  reverse?: boolean
  priceRange?: number[],
  productTag?: string
}
export const getPaginatedProducts = async (params: FilterParams, locale: string) => {
  const [_, countryCode] = parseLocale(locale)
  const query = `#graphql
    query paginatedProducts($first: Int, $sortKey: ProductSortKeys, $query: String, $reverse: Boolean, $after: String, $countryCode: CountryCode) @inContext(country: $countryCode) {
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
      query: `variants.price:>=${params.priceRange?.at(0)?.toString() ?? '0'} variants.price:<=${params.priceRange?.at(1)?.toString() ?? '200'}`,
      reverse: params.reverse ?? true,
      after: params.cursor,
      countryCode: countryCode as CountryCode
    },
  })).data?.products.edges
}

export const getProductsById = async (ids: string[], locale: string) => {
  if (ids.length == 0) return []
  const [_, countryCode] = parseLocale(locale)

  const productsQuery = await getStorefrontClient().request(`#graphql
    query getProductsById($ids: [ID!]!, $countryCode: CountryCode) @inContext(country: $countryCode) {
      nodes(ids: $ids) {
        ... on Product {
          id
          title
          createdAt
          description
          featuredImage {
            url
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
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
  `, {
    "variables": {
      "ids": ids,
      countryCode: countryCode as CountryCode
    }
  })

  return productsQuery.data?.nodes ?? []
}

export const getProduct = async (productId: string, locale: string): Promise<GetProductQuery['product']> => {
  const [_, countryCode] = parseLocale(locale)

  const query = `#graphql
    query getProduct($id: ID!, $countryCode: CountryCode) @inContext(country: $countryCode) {
      product(id: $id) {
        id
        title
        createdAt
        description
        featuredImage {
          url
        }
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
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
      id: productId,
      countryCode: countryCode as CountryCode
    }
  })).data?.product
}

export const getCollections = async (query: string, locale: string) => {
  const [_, countryCode] = parseLocale(locale)
  const collectionsQuery = await getStorefrontClient().request(`#graphql
    query getCollections($query: String, $countryCode: CountryCode) @inContext(country: $countryCode) {
      collections(first:20, query: $query) {
        nodes {
          id
          title
          description
          image {
            url
          }
          products(first:100) {
            nodes {
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
    }
  `, {
    variables: {
      query: query,
      countryCode: countryCode as CountryCode
    }
  })

  return collectionsQuery.data?.collections.nodes ?? []
}

export const createCart = async (locale: string) => {
  console.log("createCart()")
  const [languageCode, countryCode] = parseLocale(locale)
  const cartCreate = await getStorefrontClient().request(`#graphql 
    mutation createCart($input: CartInput) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ...on ProductVariant {
                    id
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `, {
    variables: {
      input: {
        buyerIdentity: {
          countryCode: countryCode as CountryCode
        }
      }
    }
  })
  console.log(cartCreate.errors)
  return cartCreate.data?.cartCreate?.cart
}

export const addToCart = async (cartId: string, variantId: string, quantity: number) => {
  console.log("addToCart()")
  const addCart = await getStorefrontClient().request(`#graphql
    mutation addCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ...on ProductVariant {
                    id
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `, {
    variables: {
      cartId: cartId,
      lines: [
        {
          quantity: quantity,
          merchandiseId: variantId
        }
      ],
    },
  })

  return addCart.data?.cartLinesAdd?.cart
}

export const mutateCart = async (cartId: string, cartLines: CartLineUpdateInput[]) => {
  console.log("mutateCart()")
  const updateCart = await getStorefrontClient().request(`#graphql
    mutation updateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ...on ProductVariant {
                    id
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `, {
    variables: {
      cartId: cartId,
      lines: cartLines,
    },
  })

  return updateCart.data?.cartLinesUpdate?.cart
}

export const getAvailableLocalization = async () => {
  const localization = await getStorefrontClient().request(`#graphql
    query GetLocalization {
      localization {
        availableCountries {
          isoCode
          name
          currency {
            symbol
            isoCode
            name
          }
        }
      }
    }
  `)

  return localization.data?.localization
}
