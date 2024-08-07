import { type ClassValue, clsx } from "clsx"
import { ReadonlyURLSearchParams } from "next/navigation"
import { twMerge } from "tailwind-merge"
import { CurrencyCode, MoneyV2 } from "./types/graphql"
import { currencies } from "./locale/currencies"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const createUrl = (pathname: string, params: URLSearchParams | ReadonlyURLSearchParams) => {
  const paramsString = params.toString()
  const queryString = `${paramsString.length ? '?' : ''}${paramsString}`

  return `${pathname}${queryString}`
}

export const trimPrompt = (prompt: string) => prompt.split(" - ").at(0)?.slice(2, -2).split("--").at(0) ?? ""

export const shopifyIdToUrlId = (shopifyId: string): string =>
  shopifyId.split('/').at(-1) ?? ""

export const urlIdToShopifyId = (urlId: string): string =>
  `gid://shopify/Product/${urlId}`

export const formatPrice = (price: MoneyV2) => `
  ${currencies[price.currencyCode.toString()].symbol_native}${Number(price.amount).toFixed(2)}`

export const formatTitle = (title: string) =>
  title.split("[").at(0)

export const readStream = async (stream: ReadableStream<Uint8Array>) => {
  const reader = stream.getReader()

  let acc = ''
  let finished = false
  while (!finished) {
    const { value, done } = await reader.read()

    finished = done

    if (value) {
      acc += new TextDecoder().decode(value)
    }
  }

  return acc
}

export const parseLocale = (locale: string) => locale.split('-')
