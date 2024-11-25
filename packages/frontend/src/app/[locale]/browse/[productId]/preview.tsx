"use client"

import ImageMagnifier from "@/components/ui/image-magnifier"
import { GetProductQuery } from "@/lib/types/graphql"
import { cn } from "@/lib/utils"
import { sendGAEvent } from "@next/third-parties/google"
import Image from "next/image"
import { useEffect, useState } from "react"

const Preview = ({ product }: { product: GetProductQuery['product'] }) => {
  const [selected, setSelected] = useState<number>(0)

  useEffect(() => {
    if (product) {
      sendGAEvent('event', 'view_item', {
        currency: product.priceRange.maxVariantPrice.currencyCode,
        value: product.priceRange.maxVariantPrice.amount,
        items: [
          {
            item_id: product.id,
            item_name: product.title,
            price: product.priceRange.maxVariantPrice.amount
          }
        ]
      })
    }
  }, [product])

  return (
    <div className="relative w-full lg:w-2/5">
      <div className="z-10 absolute float-left left-0 top-1/2 -translate-y-1/2 justify-center gap-4 py-4 px-2 flex flex-col">
        {product?.images.edges.map((edge, i) =>
          <Image
            key={edge.node.url}
            className={cn("w-20 h-20 object-contain bg-white rounded-md border cursor-pointer hover:opacity-100 transition-opacity", selected != i && "opacity-50")}
            alt={edge.node.altText ?? "Preview thumbnail"}
            src={edge.node.url}
            width="80"
            height="80"
            sizes={"80px"}
            onClick={() => { setSelected(i) }}
          />
        )}
      </div>
      <div className="flex flex-col p-8 justify-top  items-center">
        {selected == 0 ?
          <div className="h-3/4 w-[calc(75vh/3)] drop-shadow-md aspect-[calc(13/35)]">
            <ImageMagnifier
              alt={`Product image for ${product?.id}`}
              src={product?.images.edges.at(selected)?.node.url}
              sizes={selected == 0 ? "20vw" : "40vw"}
              className={cn("w-full h-full rounded-lg cursor-zoom-in", selected != 0 && "object-contain")}
              width="130"
              height="350"
            />
          </div>
          :
          <div className="h-full w-full drop-shadow-md">
            <ImageMagnifier
              alt={`Product image for ${product?.id}`}
              src={product?.images.edges.at(selected)?.node.url}
              sizes={"(max-width: 1024px) 90vw, 40vw"}
              className={cn("w-full h-full cursor-zoom-in", selected != 0 && "object-contain")}
              width="100"
              height="100"
            />
          </div>
        }
      </div>
    </div>
  )
}

export default Preview