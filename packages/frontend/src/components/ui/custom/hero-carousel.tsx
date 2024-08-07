"use client"
import { cn, formatPrice, shopifyIdToUrlId } from "@/lib/utils"
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../carousel"
import { useState, useEffect } from "react"
import Autoplay, { } from "embla-carousel-autoplay"
import { getExistingCustomMats } from "@/gateway/store"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

const PreviouslyMadeCarousel = () => {
  const [api, setApi] = useState<CarouselApi>()
  const [products, setProducts] = useState<any[] | undefined>([])

  const params: { locale: string } | null = useParams()

  useEffect(() => {
    if (!api) return
    // listen to api events here

  }, [api])

  const fetchMats = async () => {
    setProducts(await getExistingCustomMats(params?.locale ?? "AU"))
  }

  useEffect(() => {
    fetchMats()
  }, [])

  return (
    <Carousel
      setApi={setApi}
      opts={{
        align: "center",
        loop: true,
        startIndex: 2

      }}
      plugins={[
        Autoplay({
          delay: 1000,
          stopOnInteraction: false,
        }),
      ]}
      className="w-screen overflow-hidden"
    >
      <CarouselContent>
        {products?.map((product: any) => {
          return (
            <CarouselItem key={product.id} className={cn("basis-1/6 py-0")}>
              <Link href={`/browse/${shopifyIdToUrlId(product.id)}`}>
                <div className="rounded-lg overflow-clip relative w-[calc(100vw/6.6)] h-[calc(300vw/6.6)] justify-center z-50">
                  <Image
                    src={product.featuredImage?.url ?? ""}
                    alt={product.title}
                    fill
                    sizes={"20vw"}
                    className="hover:brightness-75 transition-all cursor-pointer -z-10"
                  />
                  <div className="relative bg-slate-800 text-center p-4 w-full h-full bg-opacity-0 hover:bg-opacity-50 cursor-pointer transition-all">
                    <div className="flex flex-col h-full justify-center my-auto text-white opacity-0 hover:opacity-100 transition-all mix-blend-difference">
                      <div className="flex flex-col justify-center text-xl font-bold h-3/5">
                        {product.title.toUpperCase().split("[")[0].split("").filter((char: string) => char != '"').join("")}
                      </div>
                      <div className="text-xl h-1/5">{formatPrice(product.priceRange.maxVariantPrice)}</div>
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          )
        })}
      </CarouselContent>
    </Carousel >
  )
}

export default PreviouslyMadeCarousel