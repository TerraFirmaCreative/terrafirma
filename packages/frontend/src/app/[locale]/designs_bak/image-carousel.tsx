"use client"
import { cn } from "@/lib/utils"
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../components/ui/carousel"
import Image from "next/image"
import {
  useState,
  useEffect,
  SetStateAction,
  Dispatch,
} from "react"
import { ProductWithImagineData } from "../../../components/ui/providers/creation-context"

const GeneratedImageCarousel = ({
  products,
  setSelected,
}: {
  products: ProductWithImagineData[]
  setSelected: Dispatch<SetStateAction<number>>
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!api) return

    setSelected(0)
    setSelectedIndex(0)
    api.on("select", () => {
      setSelected(api.selectedScrollSnap())
      setSelectedIndex(api.selectedScrollSnap())
    })
  }, [api])

  useEffect(() => {
    selectImage(products.length - 1)
  }, [products])

  const selectImage = (index: number) => {
    if (api) {
      api?.scrollTo(index)
    }
  }
  console.log(api?.selectedScrollSnap())
  return (
    <>
      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-10 lg:py-16 md:py-32 sm:py-20 py-2">
          {products.map((item, index) => {
            return (
              <CarouselItem
                key={index}
                className={cn("pl-10 sm:basis-[34%]", {
                  "z-50": index == api?.selectedScrollSnap(),
                })}
              >
                <Image
                  className={cn(
                    "mx-auto object-cover rounded-lg cursor-pointer transition-transform",
                    { "sm:scale-110": index == api?.selectedScrollSnap() },
                  )}
                  width="640"
                  height="1904"
                  alt="Yoga mat design"
                  onClick={() => {
                    selectImage(index)
                  }}
                  src={item?.shopifyProduct?.featuredImage?.url ?? item?.discordImageUrl ?? ""}
                />
              </CarouselItem>
            )
          })}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        <div className="flex justify-center flex-row gap-4 h-6 overflow-hidden">
          {products.map((item, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 bg-gray-300 hover:scale-110 hover:bg-gray-400 cursor-pointer rounded-[50%]",
                { "scale-150 bg-gray-400": index == api?.selectedScrollSnap() }
              )}
              onClick={() => {
                selectImage(index)
              }}
            />
          ))}
        </div>
      </Carousel>
    </>
  )
}

export default GeneratedImageCarousel
