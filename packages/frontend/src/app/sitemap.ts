import { getPages } from '@/gateway/cms'
import { getPaginatedProducts } from '@/gateway/store'
import { shopifyIdToUrlId } from '@/lib/utils'
import { MetadataRoute } from 'next'

// Consider using generateSitemaps() for multiple sitemaps for /browse in the future

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pageSiteMaps: MetadataRoute.Sitemap = (await getPages())?.map((page) => {
    return {
      url: `https://terrafirmacreative.com/pages/${page.handle}`,
      lastModified: new Date(),
      changeFrequency: "never",
      priotity: 0.7
    }
  }) ?? []

  const productSitemaps: MetadataRoute.Sitemap = (await getPaginatedProducts({}, "AU"))?.map((product) => {
    return {
      url: `https://terrafirmacreative.com/browse/${shopifyIdToUrlId(product.node.id)}`,
      lastModified: new Date(),
      changeFrequency: "never",
      priotity: 0.2
    }
  }) ?? []

  return [
    {
      url: 'https://terrafirmacreative.com',
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...pageSiteMaps,
    {
      url: 'https://terrafirmacreative.com/designs',
      lastModified: new Date(),
      changeFrequency: "never",
      priority: 0.5,
    },
    ...productSitemaps,
  ]
}
