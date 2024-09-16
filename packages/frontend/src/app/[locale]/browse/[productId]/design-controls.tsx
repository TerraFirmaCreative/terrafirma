"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CreationContext } from "@/components/ui/providers/creation-context"
import { GenerateImageParams } from "@/lib/types/image.dto"
import { yupResolver } from "@hookform/resolvers/yup"
import { ImagineData, Product } from "@prisma/client"
import { WandSparkles } from "lucide-react"
import { useContext, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import * as yup from "yup"

const DesignControls = ({ product }: { product: Product & { imagineData?: ImagineData | null } | null | undefined }) => {
  const { products, vary, inProgress, refreshProducts } = useContext(CreationContext)
  const [promptOpen, setPromptOpen] = useState(false)

  const promptSchema = yup.object({
    prompt: yup.string().required(),
  })

  const form = useForm<yup.InferType<typeof promptSchema>>({
    resolver: yupResolver(promptSchema),
  })

  const onSubmit: SubmitHandler<GenerateImageParams> = (data) => {
    vary(product!.imagineIndex, product!.imagineData!, data.prompt)
    setPromptOpen(false)
  }

  return (
    <>
      {!inProgress && product?.allowVariants &&
        <>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setPromptOpen(true)}><WandSparkles size="15" className="mr-2" />Redesign</Button>
          <Dialog open={promptOpen} onOpenChange={setPromptOpen}>
            <DialogContent className="py-3 px-5">
              <form className="flex flex-row p-0" onSubmit={form.handleSubmit(onSubmit)}>
                <WandSparkles strokeWidth={1.5} /><input {...form.register("prompt")} placeholder="Make it more colourful!" className="w-full mx-2 outline-none" />
              </form>
            </DialogContent>
          </Dialog>
        </>
      }
    </>
  )
}

export default DesignControls