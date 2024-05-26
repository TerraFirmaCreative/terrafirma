export type CreateStoreItemDto = {
  title: string,
  quantity: number,
  image_url: string,
  description: string
  variantId?: string
}

export type CartItemDto = {
  id: string,
  quantity: number
}

export type CartDto = {
  id: string,
  checkoutUrl: string,
  lines: {
    edges: {
      node: {
        id: string,
        quantity: number
        merchandise: {
          id: string
          product?: any
        }
      }
    }[]
  }
}

export type CartLineDto = {
  id: string,
  merchandiseId: string,
  quantity: number,
}
