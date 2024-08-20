import { getPages } from '@/gateway/cms'
import { getPaginatedProducts } from '@/gateway/store'
import { shopifyIdToUrlId } from '@/lib/utils'
import { defaultLocale, locales } from '@/config'
import { MetadataRoute } from 'next'

// Consider using generateSitemaps() for multiple sitemaps for /browse in the future

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const generateAlternates = (pathname: string) => {
    return {
      "languages": Object.fromEntries(locales.map((locale) => [locale, `https://terrafirmacreative.com/${locale}${pathname}`]))
    }
  }

  const pageSiteMaps: MetadataRoute.Sitemap = (await getPages())?.map((page) => {
    return {
      url: `https://terrafirmacreative.com/${defaultLocale}/pages/${page.handle}`,
      lastModified: new Date(),
      changeFrequency: "never",
      priotity: 0.7,
      alternates: generateAlternates("/pages")
    }
  }) ?? []

  const productSitemaps: MetadataRoute.Sitemap = (await getPaginatedProducts({}, "AU"))?.map((product) => {
    return {
      url: `https://terrafirmacreative.com/${defaultLocale}/browse/${shopifyIdToUrlId(product.node.id)}`,
      lastModified: new Date(),
      changeFrequency: "never",
      priotity: 0.2,
      alternates: generateAlternates(`/browse/${shopifyIdToUrlId(product.node.id)}`)
    }
  }) ?? []

  return [
    {
      url: `https://terrafirmacreative.com/${defaultLocale}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: generateAlternates(``)
    },
    {
      url: `https://terrafirmacreative.com/${defaultLocale}/designs`,
      lastModified: new Date(),
      changeFrequency: "never",
      priority: 0.5,
      alternates: generateAlternates(`/designs`)
    },
    ...pageSiteMaps,
    ...productSitemaps,
  ]
}
