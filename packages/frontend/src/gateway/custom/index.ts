"use server"
import { GeneratedItemDto, ImagineData } from "@/lib/types/image.dto"
import { CartDto, CartLineDto } from "@/lib/types/store.dto"

/*
*  Store actions here are all within the context of generating custom mats.
* Consider separating genric store actions into /store route in the future.
*/

export const generateItems = async (prompt: string): Promise<GeneratedItemDto[]> => {
  // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
  const res: Response = await fetch(`${process.env.REST_API_URL}/custom`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: prompt
    },),
    cache: "no-store" //Enable caching to relieve spam
  })

  if (res.status != 200 || !res.ok) throw new Error("Custom mat creation failed")

  const payload: GeneratedItemDto[] = await res.json()
  console.log("POST /custom", payload)
  return payload
}

export type VariantParams = {
  imagineData: ImagineData
  index: 1 | 2 | 3 | 4
}
export const generateVariants = async (params: VariantParams) => {
  const startTime = new Date().getTime()
  // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
  const res: Response = await fetch(`${process.env.REST_API_URL}/custom/variant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      params: params
    },),
    cache: "no-store"
  })

  if (res.status != 200 || !res.ok) throw new Error("Variant generation failed")

  const payload: GeneratedItemDto[] = await res.json()
  return payload
}

export const createCart = async () => {
  // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
  const res: Response = await fetch(`${process.env.REST_API_URL}/custom/cart`, {
    method: "POST",
    cache: "no-store"
  })
  if (res.status != 200 || !res.ok) throw new Error("Cart creation failed")

  const cart: CartDto = await res.json()
  return cart
}

export const addToCart = async (cartId: string, variantId: string, quantity: number) => {
  const cartNumber: string = cartId.split("/").splice(-1)[0]

  // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
  const res: Response = await fetch(`${process.env.REST_API_URL}/custom/cart/${cartNumber}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      variantId: variantId,
      quantity: quantity,
    })
  })
  if (res.status != 200 || !res.ok) throw new Error("Cart creation failed")

  const cart: CartDto = await res.json()

  return cart
}

export const mutateCart = async (cartId: string, cartLines: CartLineDto[]) => {
  const cartNumber: string = cartId.split("/").splice(-1)[0]
  // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
  const res: Response = await fetch(`${process.env.REST_API_URL}/custom/cart/${cartNumber}`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(cartLines)
  })
  if (res.status != 200 || !res.ok) throw new Error("Cart muttation failed")

  const cart: CartDto = await res.json()

  return cart
}