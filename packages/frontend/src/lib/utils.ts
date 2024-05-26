import { type ClassValue, clsx } from "clsx"
import { ReadonlyURLSearchParams } from "next/navigation"
import { twMerge } from "tailwind-merge"
import { CurrencyCode, MoneyV2 } from "./types/graphql"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
  const paramsString = params.toString()
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`

  return `${pathname}${queryString}`
}

export const currencySymbol = (currencyCode: CurrencyCode): string => {
  const map = new Map<CurrencyCode, string>([
    [CurrencyCode.Aud, "$"]
  ])


  return map.get(currencyCode) ?? currencyCode as string
}

export const shopifyIdToUrlId = (shopifyId: string): string =>
  shopifyId.split('/').at(-1) ?? ""

export const urlIdToShopifyId = (urlId: string): string =>
  `gid://shopify/Product/${urlId}`

export const formatPrice = (price: MoneyV2) => `
  ${currencySymbol(price.currencyCode)}${Number(price.amount).toFixed(2)}`

export const formatTitle = (title: string) =>
  title.split("[").at(0)