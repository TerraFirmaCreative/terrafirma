"use client"
import { addToCart, createCart, mutateCart } from "@/gateway/store"
import { Cart, CartLineDto } from "@/lib/types/store.dto"
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from "react"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "../sheet"
import { MinusIcon, PlusIcon } from "lucide-react"
import { Button } from "../button"
import Link from "next/link"
import { CartLineUpdateInput, CreateCartMutation, GetProductQuery } from "@/lib/types/graphql"
import { sendGAEvent } from "@next/third-parties/google"

export const CartContext = createContext<{
  cart: NonNullable<CreateCartMutation["cartCreate"]>["cart"] | undefined,
  setCart: Dispatch<SetStateAction<Cart | undefined>>,
  cartOpen: boolean,
  setCartOpen: Dispatch<SetStateAction<boolean>>
}>({ cart: undefined, setCart: () => { }, cartOpen: false, setCartOpen: () => { } })

const CartProvider = ({ children, locale }: { children: React.ReactNode, locale: string }) => {
  const [cart, setCart] = useState<Cart | undefined>()
  const [cartOpen, setCartOpen] = useState<boolean>(false)

  useEffect(() => {
    if (!cart) {
      createCart(locale).then((cart) => setCart(cart))
    }
  }, [])

  useEffect(() => {
    console.log(cartOpen)
    if (cartOpen && cart) {
      sendGAEvent('event', 'view_cart', {
        currency: cart.cost.totalAmount.currencyCode,
        value: cart.cost.totalAmount.amount,
        items: cart.lines.edges.map((edge) => ({
          item_id: edge.node.merchandise.id,
          item_name: edge.node.merchandise.product.title,
          quantity: edge.node.quantity
        }))
      })
    }
  }, [cartOpen])

  const cartMutate = async (quantity: number, cartLine: CartLineDto) => {
    if (cart) {
      const newCartLines: CartLineUpdateInput[] = cart.lines.edges.map((edge) => {
        const newLine: CartLineUpdateInput = {
          id: edge.node.id,
          merchandiseId: edge.node.merchandise.id,
          quantity: edge.node.id == cartLine.id ? quantity : edge.node.quantity
        }

        return newLine
      })

      setCart({
        ...cart,
        lines: {
          edges: cart.lines.edges.filter((edge) =>
            !(edge.node.id == cartLine.id && quantity == 0)
          ).map((edge) => {
            return {
              node: {
                id: edge.node.id,
                merchandise: edge.node.merchandise,
                cost: edge.node.cost,
                quantity: edge.node.id == cartLine.id ? quantity : edge.node.quantity
              }
            }
          })
        }
      })

      mutateCart(cart.id, newCartLines)
    }
  }

  return (
    <>
      <CartContext.Provider value={{ cart: cart, setCart: setCart, cartOpen: cartOpen, setCartOpen: setCartOpen }}>
        {children}
      </CartContext.Provider>

      <Sheet
        open={cartOpen}
        onOpenChange={() => {
          setCartOpen(!cartOpen)
        }}
      >
        <SheetContent className="overflow-y-scroll">
          <SheetHeader>
            <SheetTitle>
              Shopping Cart
            </SheetTitle>
            <SheetDescription>
              You can review your items before their purchase here.
            </SheetDescription>
          </SheetHeader>
          {
            cart?.lines.edges.length ?? 0 ?
              <div className="flex flex-col gap-2 py-4">
                <div className="flex flex-row justify-between py-2 text-sm font-medium">
                  <div >Item</div>
                  <div >Quantity</div>
                </div>
                {
                  cart?.lines.edges.map((edge) =>
                    <div key={edge.node.id} className="flex flex-row justify-between py-2 items-center">
                      <div className="pt-2 font-light">
                        {(edge.node.merchandise.product?.title as string).split('[')[0]}
                      </div>
                      <div className="flex flex-row gap-2">

                        <div className="flex flex-row border rounded-md">
                          <div
                            className="text-center p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              sendGAEvent('event', 'remove_from_cart', {
                                currency: edge.node.cost.totalAmount.currencyCode,
                                value: edge.node.cost.totalAmount.amount,
                                items: [{
                                  item_id: edge.node.merchandise.id,
                                  item_name: edge.node.merchandise.product.title,
                                  quantity: 1
                                }]
                              })
                              cartMutate(edge.node.quantity - 1, {
                                ...edge.node,
                                merchandiseId: edge.node.merchandise.id
                              })
                            }}
                          ><MinusIcon className="w-3" /></div>
                          <div className="p-2 text-center border-x text-gray-600 cursor-default">{(edge.node.quantity)}</div>
                          <div
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              sendGAEvent('event', 'add_to_cart', {
                                currency: edge.node.cost.totalAmount.currencyCode,
                                value: edge.node.cost.totalAmount.amount,
                                items: [{
                                  item_id: edge.node.merchandise.id,
                                  item_name: edge.node.merchandise.product.title,
                                  quantity: 1
                                }]
                              })
                              cartMutate(edge.node.quantity + 1, {
                                ...edge.node,
                                merchandiseId: edge.node.merchandise.id
                              })
                            }}
                          >
                            <PlusIcon className="w-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
              </div>
              :
              <div className="flex flex-col justify-start text-center py-8 text-sm font-medium">
                <span>Cart Empty</span>
                <span className=" font-normal text-slate-600">
                  Click the button below to continue shopping.
                </span>
              </div>
          }
          <div className="py-4">
            <SheetClose className="w-full">
              <Button variant="outline" className="w-full">Continue Shopping</Button>
            </SheetClose>
          </div>
          {(cart?.lines.edges.length ?? 0) > 0 &&
            <div>
              <Link href={cart?.checkoutUrl ?? `/`} onClick={() => {
                if (cart) {
                  sendGAEvent('event', 'begin_checkout', {
                    currency: cart.cost.totalAmount.currencyCode,
                    value: cart.cost.totalAmount.amount,
                    items: cart.lines.edges.map((edge) => ({
                      item_id: edge.node.merchandise.id,
                      item_name: edge.node.merchandise.product.title,
                      quantity: edge.node.quantity
                    }))
                  })
                }
              }}>
                <Button className="w-full">Checkout</Button>
              </Link>
            </div>}
        </SheetContent>
      </Sheet>
    </>
  )
}

export const CartControls = ({ product }: { product: NonNullable<GetProductQuery["product"]> }) => {
  const [quantity, setQuantity] = useState<number>(1)
  const { cart, setCart, setCartOpen } = useContext(CartContext)

  const cartAdd = async () => {
    if (cart) {
      setQuantity(1)
      setCartOpen(true)
      setCart(await addToCart(cart.id, product.variants.edges.at(0)!.node.id, quantity))
      sendGAEvent('event', 'add_to_cart', {
        currency: product.priceRange.maxVariantPrice.currencyCode,
        value: product.priceRange.maxVariantPrice.amount,
        items: [{
          item_id: product.variants.edges.at(0)!.node.id,
          item_name: product.title,
          price: product.priceRange.maxVariantPrice.amount,
          quantity: quantity
        }]
      })
    }
  }

  return (
    <div className="flex flex-row justify-start gap-2">
      <div className="flex flex-row h-10 outline-1 outline outline-gray-200 rounded-md">
        <div
          className="px-4 py-2 border-r border-1 hover:bg-gray-100 cursor-pointer"
          onClick={() => setQuantity(Math.max(0, quantity - 1))}
        >
          <MinusIcon className="w-3" />
        </div>
        <div className="p-2 min-w-10 text-center">{quantity}</div>
        <div
          className="px-4 py-2 border-l border-1 hover:bg-gray-100 cursor-pointer"
          onClick={() => setQuantity(quantity + 1)}
        >
          <PlusIcon className="w-3" />
        </div>
      </div>
      <Button variant="outline" onClick={() => cartAdd()}>Add to Cart</Button>
    </div>
  )
}

export default CartProvider