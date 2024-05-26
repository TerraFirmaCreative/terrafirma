"use server"
import { getStorefrontClient } from "@/config"

/*
 *  Server actions for fetching CDN data
 */

export const getPages = async (): Promise<CMSPageData[]> => {
  const query = `#graphql
    query getPages {
      metaobjects(first: 10, type: "Page") {
        edges {
          node {
            handle
            fields {
              key
              value
            }
          }
        }
      }
    }
  `
  const pagesResponse = await getStorefrontClient().request(query)

  if (pagesResponse.data) {

    const pages = pagesResponse.data.metaobjects.edges.map(({ node }) => {
      return {
        handle: node.handle,
        ...Object.fromEntries(node.fields.map((field) => {
          return [field.key, field.value]
        }))
      }
    })

    return pages
  }

  return []
}

export type CMSPageData = {
  handle: string,
  title?: string,
  description?: string
  headline?: string
  content?: string
}
export const getPage = async (handle: string): Promise<CMSPageData | null> => {
  const query = `#graphql
    query getPage($handle: MetaobjectHandleInput) {
      metaobject(handle: $handle) {
        handle
        fields {
          key
          value
        }
      }
    }
  `
  const pageResponse = await getStorefrontClient().request(query, {
    variables: {
      handle: {
        handle: handle,
        type: "page"
      }
    }
  })

  if (pageResponse.data?.metaobject) {
    const page: CMSPageData = {
      handle: pageResponse.data?.metaobject?.handle,
      ...Object.fromEntries(pageResponse.data?.metaobject.fields.map((field) => {
        return [field.key, field.value]
      }))
    }

    return page
  }

  return null
}