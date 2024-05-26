export function sanitisePrompt(prompt: string) {
  return prompt.split("").filter((c) => {
    return ((c >= '0' && c <= '9')
      || (c >= 'A' && c <= 'Z')
      || (c >= 'a' && c <= 'z')
      || (c == ' ')
      || (c == ',')
      || (c == '.')
    )
  }).join("")
}

export const shopifyIdToUrlId = (shopifyId: string): string =>
  shopifyId.split('/').at(-1) ?? ""

export const urlIdToShopifyId = (urlId: string): string =>
  `gid://shopify/Product/${urlId}`
