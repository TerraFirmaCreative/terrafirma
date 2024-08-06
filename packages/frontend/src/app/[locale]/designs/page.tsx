"use client"
import { useContext, useEffect, useState } from "react"
import { CartControls } from "@/components/ui/store/cart-context"
import GeneratedImageCarousel from "@/components/ui/custom/image-carousel"
import { CreationContext } from "@/components/ui/custom/creation-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { WandSparkles } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import * as yup from "yup"
import { SubmitHandler, useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { GenerateImageParams } from "@/lib/types/image.dto"
import { formatTitle, trimPrompt } from "@/lib/utils"


const ViewCustomMats = ({ params }: { params: { locale: string } }) => {
  const [selected, setSelected] = useState(1)
  const [promptOpen, setPromptOpen] = useState(false)
  const { products, vary, inProgress, refreshProducts } = useContext(CreationContext)
  const [fetching, setFetching] = useState<boolean>(true)

  const promptSchema = yup.object({
    prompt: yup.string().required().default(products[selected]?.imagineData?.imaginePrompt),
  })

  const form = useForm<yup.InferType<typeof promptSchema>>({
    resolver: yupResolver(promptSchema),
  })

  const onSubmit: SubmitHandler<GenerateImageParams> = (data) => {
    vary(selected, data.prompt)
    setPromptOpen(false)
  }

  useEffect(() => {
    refreshProducts().then(() => {
      setFetching(false)
    })
  }, [])

  useEffect(() => {
    // form.setValue("prompt", trimPrompt(products.at(selected)?.imagineData?.imaginePrompt ?? ""))
  }, [selected, products])

  if (fetching) return (
    <div className="flex lg:flex-row mt-20 flex-col justify-between align-center min-h-[100vh-5rem] h-screen w-full">
      <div className="lg:w-1/2 px-20 py-10 gap-10 align-center h-full flex flex-row justify-center items-center">
        <div className="w-[150px] h-[450px] bg-gray-200 animate-pulse" />
      </div>
      <div className="flex flex-col lg:w-1/2 gap-8 py-16 bg-white px-16">
        <div className="bg-gray-200 rounded-md h-8 animate-pulse" />
        <div className="pt-4 h-24 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  )

  if (products.length < 1) return (
    <div className="flex flex-col text-center gap-4 items-center justify-center h-screen w-full">
      <h1 className="text-6xl">🧐</h1>
      <h2 className="text-3xl font-light">{"Where'd they all go?"}</h2>
      <p className="text-gray-700">Your custom yoga mat designs will appear here.</p>
      <Link href="/">
        <Button>Let Your Imagination Flow</Button>
      </Link>
    </div>
  )

  return (
    <>
      <div className="flex lg:flex-row mt-20 flex-col justify-between align-center min-h-[calc(100vh-5rem)] h-full">
        <div className="lg:w-1/2 px-20 gap-10 align-center h-full flex flex-col justify-center items-center">
          <GeneratedImageCarousel products={products} setSelected={setSelected} />
        </div>
        <div className="flex flex-col lg:w-1/2 py-16 bg-white px-16">
          <h1 className="text-slate-800 font-semibold text-4xl">{formatTitle(products[selected]!.shopifyProduct?.title ?? "")}</h1>
          <div className="pt-4 text-lg"><i>$70.00</i></div>
          <div className="flex flex-col gap-2 py-4">
            <div className="flex flex-row flex-wrap gap-2">
              <CartControls variantId={products[selected]!.shopifyProduct?.variants.edges[0].node.id ?? ""} />
              {products[selected]!.allowVariants && !inProgress && <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setPromptOpen(true)}><WandSparkles size="15" className="mr-2" />Redesign</Button>}
            </div>
            <p className=" font-light leading-relaxed py-4">
              {products[selected]?.shopifyProduct?.description}
            </p>
          </div>
        </div>
      </div>


      <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
        <DialogContent className="py-3 px-5">
          <form className="flex flex-row p-0" onSubmit={form.handleSubmit(onSubmit)}>
            <WandSparkles strokeWidth={1.5} /><input {...form.register("prompt")} placeholder="Make it more colourful!" className="w-full mx-2 outline-none" />
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewCustomMats