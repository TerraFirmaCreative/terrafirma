"use client"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { CreationContext } from "@/components/ui/providers/creation-context"
import { formatPrice, shopifyIdToUrlId, trimPrompt } from "@/lib/utils"
import Link from "@/components/ui/util/link-locale"
import { useContext, useEffect, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { CopyIcon, WandSparkles } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SubmitHandler, useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { GenerateImageParams } from "@/lib/types/image.dto"
import ProductTile from "@/components/ui/product-tile"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

const Page = () => {
  const { products, create, inProgress, refreshProducts, } = useContext(CreationContext)

  const [fetching, setFetching] = useState<boolean>(true)

  const [promptOpen, setPromptOpen] = useState(false)

  const promptSchema = yup.object({
    prompt: yup.string().required().default(""),
  })

  const form = useForm<yup.InferType<typeof promptSchema>>({
    resolver: yupResolver(promptSchema),
  })

  const onSubmit: SubmitHandler<GenerateImageParams> = (data) => {
    create(data.prompt)
    setPromptOpen(false)
  }

  useEffect(() => {
    refreshProducts().then(() => {
      setFetching(false)
    })
  }, [])

  if (products.length < 1) return (
    <div className="-mt-20 bg-gradient-to-b from-[#eda96d] to-orange-50 to-[50vh] flex flex-col text-center gap-4 items-center justify-center h-screen w-full">
      <h1 className="text-6xl">🧐</h1>
      <h2 className="text-3xl font-light">{"Looks pretty empty"}</h2>
      <p className="text-gray-700">Your custom yoga mat designs will appear here.</p>
      <Link href="/">
        <Button>Let Your Imagination Flow</Button>
      </Link>
    </div>
  )

  return (
    <>
      <div className="bg-gradient-to-b from-[#eda96d] to-orange-50 to-[50vh] -mt-20 pt-20 flex flex-col justify-center w-full">
        <section id="recent-creations" className="flex flex-col gap-4 items-center">
          <Carousel
            className="w-[calc(100%-120px)] max-w-4xl"
            opts={{
              loop: true,
              align: "start"
            }}
          >
            <h1 className="font-serif text-5xl text-center text-gray-900 py-8">Your recent creations</h1>
            <Badge
              className="self-start my-2 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(trimPrompt(trimPrompt(products.at(0)!.imagineData!.imaginePrompt)))
                toast({ title: "Copied prompt!", description: trimPrompt(products.at(0)!.imagineData!.imaginePrompt) })
              }}
            >
              {trimPrompt(products.at(0)!.imagineData!.imaginePrompt)} <CopyIcon className="stroke-2 p-1 ml-2 h-6" />
            </Badge>
            <CarouselContent>
              {products.slice(0, 4).map((product) =>
                <CarouselItem key={product.id} className="basis-1/2 md:basis-1/4">
                  <Link href={`/browse/${shopifyIdToUrlId(product!.shopifyProduct!.id)}`}>
                    <div className="overflow-clip relative border rounded-lg shadow">
                      <AspectRatio ratio={1 / 3}>
                        <Image
                          src={product!.shopifyProduct!.featuredImage?.url}
                          alt={product!.shopifyProduct!.title}
                          fill
                          sizes="(max-width: 715px) 50vw, 20vw"
                        />
                        <div className="relative text-center w-full h-full bottom-0 opacity-0 hover:opacity-100 cursor-pointer transition-all">
                          <div className="flex flex-col h-full justify-end my-auto text-white transition-all">
                            <div className="bg-slate-900 py-6 flex flex-col justify-center">
                              <div className="flex font-serif flex-col justify-center text-wrap text-2xl font-bold">
                                {product!.shopifyProduct!.title.toUpperCase().split("[")[0].split("").filter((char: string) => char != '"').join("")}
                              </div>
                              <div className="text-xl h-1/5">{formatPrice(product!.shopifyProduct!.priceRange.maxVariantPrice)}</div>
                            </div>
                          </div>
                        </div>
                      </AspectRatio>
                    </div>
                  </Link>
                </CarouselItem>
              )}
            </CarouselContent>
            <CarouselNext />
            <CarouselPrevious />
          </Carousel>
        </section>
        {products.length > 4 &&
          <section id="previous-creations" className="flex flex-col py-4 justify-center items-center">
            <div className="flex flex-row flex-wrap justify-center gap-4 text-center w-[calc(100%-120px)] max-w-4xl">
              <h2 className="font-serif text-3xl basis-full pt-4 ">Past creations</h2>
              {products.slice(4).map((product) =>
                <div key={product.id} className="md:basis-[calc(25%-12px)] basis-[calc(50%-8px)]">
                  <ProductTile key={product.id} product={product.shopifyProduct!} />
                </div>
              )}
            </div>
          </section>
        }
      </div>

      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="py-3 px-5">
          <form className="flex flex-row p-0" onSubmit={form.handleSubmit(onSubmit)}>
            <WandSparkles strokeWidth={1.5} /><input {...form.register("prompt")} placeholder="The most personal, imaginative yoga mat design yet" className="w-full mx-2 outline-none" />
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Page