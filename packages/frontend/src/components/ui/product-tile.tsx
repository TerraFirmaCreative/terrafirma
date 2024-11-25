"use client"
import { AspectRatio } from "./aspect-ratio"
import Image from "next/image"
import { formatPrice, shopifyIdToUrlId, trimPrompt } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
import { CopyIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { ImagineData, Product } from "@prisma/client"
import { getUserProduct, getUserProducts } from "@/gateway/tasks"
import { GetProductsByIdQuery } from "@/lib/types/graphql"
import { Badge } from "./badge"

const ProductTile = ({ product }: { product: NonNullable<GetProductsByIdQuery["nodes"][0]> }) => {
  const [userProduct, setUserProduct] = useState<Product & { imagineData?: ImagineData | null } | null | undefined>()

  useEffect(() => {
    getUserProduct(product.id).then((p) => {
      setUserProduct(p)
    })
    getUserProducts
  }, [product])

  return (
    <div key={product.id} className="rounded-md overflow-clip relative border">
      <AspectRatio ratio={13 / 35}>
        <Image
          src={product.featuredImage?.url}
          alt={product.title ?? "Design for yoga mat product"}
          fill
          sizes="20vw"
        />
        <div className="relative text-center w-full h-full bottom-0 opacity-0 hover:opacity-100 cursor-pointer transition-all">
          {userProduct?.imagineData &&
            <div
              className="absolute right-0 rounded-full stroke-slate-400 m-4 bg-black shadow-lg"
              onClick={() => {
                navigator.clipboard.writeText(trimPrompt(userProduct.imagineData!.imaginePrompt))
                toast({ title: "Copied prompt!", description: trimPrompt(userProduct.imagineData!.imaginePrompt) })
              }}
            >
              <Tooltip delayDuration={100}>
                <TooltipTrigger>
                  {/* <CopyIcon className="stroke-[1.5] h-full w-full stroke-slate-400 hover:stroke-slate-50 p-2" /> */}
                  <Badge>
                    {trimPrompt(userProduct.imagineData!.imaginePrompt).slice(0, 10)}
                    <CopyIcon className="stroke-2 p-1 ml-2 h-6" />
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Copy prompt
                </TooltipContent>
              </Tooltip>
            </div>
          }
          <Link key={product.id} href={`/browse/${shopifyIdToUrlId(product.id)}`}>
            <div className="flex flex-col h-full w-full justify-end my-auto text-white transition-all">
              <div className="bg-slate-900 py-6 flex flex-col justify-center">
                <div className="flex font-serif flex-col justify-center text-wrap text-2xl font-bold">
                  {product.title.toUpperCase().split("[")[0].split("").filter((char: string) => char != '"').join("")}
                </div>
                <div className="text-xl h-1/5">{formatPrice(product.priceRange.maxVariantPrice)}</div>
              </div>
            </div>
          </Link>
        </div>
      </AspectRatio>
    </div>
  )
}

export default ProductTile