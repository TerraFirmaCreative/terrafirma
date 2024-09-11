"use client"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { CreationContext } from "@/components/ui/providers/creation-context"
import { formatPrice, shopifyIdToUrlId, trimPrompt } from "@/lib/utils"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { WandSparkles } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { SubmitHandler, useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { GenerateImageParams } from "@/lib/types/image.dto"
import ProductTile from "@/components/ui/product-tile"

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

  return (
    <>
      <div className="mt-20 flex flex-col justify-center w-full">
        <section id="recent-creations" className="px-[20%]">
          <h1 className="text-5xl font-light text-gray-700 py-8">Your recent creations</h1>
          <Badge>{trimPrompt(products.at(0)?.imagineData?.imaginePrompt ?? "")}</Badge>
          <div className="
            lg:grid-cols-[repeat(4,1fr)]
            sm:grid-cols-[repeat(2,1fr)]
            grid-cols-[repeat(2,1fr)]
            grid justify-center grid-flow-row-dense gap-2 pt-4
          ">
            {products.slice(0, 4).map((product) =>
              <Link key={product!.id} href={`/browse/${shopifyIdToUrlId(product!.shopifyProduct!.id)}`}>
                <div key={product!.id} className="overflow-clip relative border rounded-lg shadow">
                  <AspectRatio ratio={1 / 3}>
                    <Image
                      src={product!.shopifyProduct!.featuredImage?.url}
                      alt={product!.shopifyProduct!.title}
                      fill
                      sizes="20vw"
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
            )}
          </div>
        </section>
        <section id="previous-creations" className="border-t mt-4 text-center flex flex-col justify-center">
          <div className="
            lg:grid-cols-[repeat(7,1fr)]
            md:grid-cols-[repeat(5,1fr)]
            sm:grid-cols-[repeat(3,1fr)]
            grid-cols-[repeat(2,1fr)]
            grid justify-center grid-flow-row-dense gap-2 p-4"
          >
            {products.slice(4).map((product) => <ProductTile key={product.id} product={product.shopifyProduct!} />)}
          </div>
        </section>
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