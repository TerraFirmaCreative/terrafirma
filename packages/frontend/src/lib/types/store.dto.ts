import { CreateCartMutation } from "@/lib/types/graphql"

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

export type Cart = NonNullable<CreateCartMutation["cartCreate"]>["cart"]

export type CartLineDto = {
  id: string,
  merchandiseId: string,
  quantity: number,
}