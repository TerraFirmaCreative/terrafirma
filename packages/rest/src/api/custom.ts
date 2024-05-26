import express from "express"
import { adminGqlClient, mjClient, storefrontClient } from "../config"
import { CartLineDto, GeneratedItemDto } from "../types/store.dto"
import { createVariants, generateCustomText, imagineMats } from "../tasks/midjourney"
import { createProduct } from "../tasks/shopify"
import { ImagineData } from "../types/image.dto"
import { remoteImage, splitQuadImage, uploadImage } from "../tasks/image"
import sharp, { Sharp } from "sharp"
import { sanitisePrompt } from "../utils"
import { slowDown } from "express-slow-down"

export const router = express.Router()

router.use(slowDown({
  windowMs: 3000,
  delayAfter: 1,
  delayMs: (hits) => hits * 3000,
}))

router.route("").get(async (req, res) => {
  const info = await mjClient.Info() // Can use this to find out if job should be queued
  // BUT it means sending twice as many requests.
  // Instead, we can wait for failure? 
  // No, lets keep track of amount in another way.

  res.status(200).json(info)
})

router.route("").post(async (req, res) => {
  const prompt: string = sanitisePrompt(req.body.prompt)

  const [customText, imaginedImages] = await Promise.all([generateCustomText(prompt), imagineMats(prompt)])

  const createProductItems = []
  for (let i = 0; i < 4; i++) {
    if (imaginedImages[i + 1] == null) res.status(500).json("Failed to generate image.")
    createProductItems.push(
      createProduct({
        description: customText[i].description,
        title: customText[i].title,
        url: imaginedImages[i + 1]!.uri,
        prompt: prompt
      })
    )
  }
  const createdProductVariants = await Promise.all(createProductItems)

  const generatedMatsReturn: GeneratedItemDto[] = createdProductVariants.map((variant, i) => {
    return {
      title: customText[i].title,
      description: customText[i].description,
      url: variant.imageUrl,
      variantId: variant.variantId,
      imagineData: {
        imagineFlags: imaginedImages[0]!.flags!,
        imagineHash: imaginedImages[0]!.hash!,
        imaginePrompt: req.body.prompt,
        imagineId: imaginedImages[0]!.id!
      },
      allowVariants: true
    }
  })

  console.log("POST /custom returning ::", generatedMatsReturn)
  res.status(200).json(generatedMatsReturn)
})

type VariantParams = {
  imagineData: ImagineData
  index: 1 | 2 | 3 | 4
}
router.route("/variant").post(async (req, res) => {
  const params: VariantParams = req.body.params
  params.imagineData.imaginePrompt = sanitisePrompt(params.imagineData.imaginePrompt)

  console.log(params)
  const [customText, variantQuad] = await Promise.all([
    generateCustomText(params.imagineData.imaginePrompt), // attach new prompt onto here
    createVariants(params.imagineData, params.index)
  ])

  const variants: Sharp[] = await splitQuadImage(sharp(await remoteImage(variantQuad!.uri)))
  const variantUrls: string[] = await Promise.all(variants.map((variant, i) => { return uploadImage(variant, `${variantQuad!.hash}_V${i}`) }))

  const createProductItems = []
  for (let i = 0; i < 4; i++) {
    createProductItems.push(
      createProduct({
        description: customText[i].description,
        title: customText[i].title,
        url: variantUrls[i],
        prompt: params.imagineData.imaginePrompt
      })
    )
  }
  const createdProductVariants = await Promise.all(createProductItems)

  const generatedMatsReturn: GeneratedItemDto[] = createdProductVariants.map((variant, i) => {
    return {
      title: customText[i].title,
      description: customText[i].description,
      url: variant.imageUrl,
      variantId: variant.variantId,
      imagineData: params.imagineData,
      allowVariants: false
    }
  })

  res.status(200).json(generatedMatsReturn)
})

router.route("/cart").post(async (req, res) => {
  const query = `#gqlstorefront
  mutation createCart {
    cartCreate {
      cart {
        id
        checkoutUrl
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ...on ProductVariant {
                  id
                }
              }
            }
          }
        }
      }
    }
  }
  `
  const cart = await storefrontClient.request(query)

  res.status(200).json(cart.data.cartCreate.cart)
})

router.route("/cart/:cartId").post(async (req, res) => {
  const cartId = `gid://shopify/Cart/${req.params.cartId}`
  const variantId = req.body.variantId
  const quantity = req.body.quantity

  const query = `#gqlstorefront
    mutation addCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ...on ProductVariant {
                    id
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `

  const response = await storefrontClient.request(query, {
    variables: {
      cartId: cartId,
      lines: [
        {
          quantity: quantity,
          merchandiseId: variantId
        }
      ]
    }
  })

  res.status(200).json(response.data.cartLinesAdd.cart)
})

router.route("/cart/:cartId").put(async (req, res) => {
  const cartId = `gid://shopify/Cart/${req.params.cartId}`
  const cartLines: CartLineDto[] = req.body

  const response = await storefrontClient.request(`#gqlstorefront
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ...on ProductVariant {
                    id
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `, {
    variables: {
      cartId: cartId,
      lines: cartLines
    }
  })

  res.status(200).json(response.data?.cartLinesUpdate.cart)
})