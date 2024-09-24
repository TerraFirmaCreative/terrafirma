"use client"
import { formatPrice, shopifyIdToUrlId } from "@/lib/utils"
import Image from "next/image"
import {
  useState, SetStateAction,
  Dispatch
} from "react"
import { ProductWithImagineData } from "../../../components/ui/providers/creation-context"
import Link from "@/components/ui/util/link-locale"
import { AspectRatio } from "@/components/ui/aspect-ratio"

const DesignGrid = ({
  products,
  setSelected,
}: {
  products: ProductWithImagineData[]
  setSelected: Dispatch<SetStateAction<number>>
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <>
      <div className="
        lg:grid-cols-[repeat(4,1fr)]
        md:grid-cols-[repeat(3,1fr)]
        sm:grid-cols-[repeat(2,1fr)]
        grid-cols-[repeat(2,1fr)]
        grid justify-center grid-flow-row-dense w-full gap-2 h-full p-2
      ">
        {products.map((product) =>
          <Link key={product!.id} href={`/browse/${shopifyIdToUrlId(product!.id)}`}>
            <div key={product!.id} className="overflow-clip relative border">
              <AspectRatio ratio={1 / 3}>
                <Image
                  src={product!.shopifyProduct?.featuredImage?.url ?? product!.discordImageUrl}
                  alt="Design Preview"
                  fill
                  sizes="20vw"
                />
                <div className="relative text-center w-full h-full bottom-0 opacity-0 hover:opacity-100 cursor-pointer transition-all">
                  <div className="flex flex-col h-full justify-end my-auto text-white transition-all">
                    <div className="bg-slate-900 py-6 flex flex-col justify-center">
                      <div className="flex font-serif flex-col justify-center text-wrap text-2xl font-bold">
                        {product!.shopifyProduct?.title.toUpperCase().split("[")[0].split("").filter((char: string) => char != '"').join("")}
                      </div>
                      <div className="text-xl h-1/5">{formatPrice(product!.shopifyProduct?.priceRange?.maxVariantPrice!)}</div>
                    </div>
                  </div>
                </div>
              </AspectRatio>
            </div>
          </Link>
        )}
      </div>
    </>
  )
}

export default DesignGrid
