"use client"
import { GeneratedItemDto } from "@/lib/types/image.dto"
import { useContext, useEffect, useState } from "react"
import GeneratedImageCarousel from "../../ui/custom/image-carousel"
import { CartContext, CartControls } from "@/components/ui/store/cart-context"

const CustomMatStore = ({ items, params }: { items: GeneratedItemDto[], params: { locale: string } }) => {
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    document.getElementById("submit-content")?.scrollIntoView({ "behavior": "smooth" })
  }, [])

  return (
    <>
      <div id="submit-content" className="flex flex-col min-h-screen w-screen bg-slate-100">
        <div className="flex flex-row justify-between align-center min-h-screen">
          <div className="px-16 pt-20 gap-10 align-center w-1/2 h-full flex flex-col justify-center items-center">
            {/* <GeneratedImageCarousel items={items} setSelected={setSelected} /> */}
          </div>
          <div className="flex flex-col w-1/2 py-16 bg-white h-screen px-16 overflow-scroll">
            <h1 className=" text-slate-800 font-semibold text-4xl leading-loose">{items[selected].title}</h1>
            <div className=" text-lg"><i>$70.00</i></div>
            <div className="flex flex-col gap-2 py-4">
              <CartControls variantId={items[selected].variantId} />
              <p className=" font-light leading-relaxed py-4">
                {items[selected].description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CustomMatStore