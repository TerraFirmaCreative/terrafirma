import { ImagineData } from "./image.dto"

export type CreateStoreItemDto = {
  title: string,
  quantity: number,
  image_url: string,
  description: string
}

export type CartItemDto = {
  id: string,
  quantity: number
}

export type GeneratedItemDto = {
  title: string,
  description: string,
  url: string,
  variantId: string
  imagineData?: ImagineData
  allowVariants: boolean
}

export type CartLineDto = {
  id: string,
  merchandiseId: string,
  quantity: number,
}