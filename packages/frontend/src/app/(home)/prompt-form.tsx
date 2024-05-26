"use client"
import { Button } from "@/components/ui/button"
import { CreationContext } from "@/components/ui/custom/creation-context"
import { FormDescription } from "@/components/ui/form"
import { GenerateImageParams } from "@/lib/types/image.dto"
import { yupResolver } from "@hookform/resolvers/yup"
import { AspectRatio } from "@radix-ui/react-aspect-ratio"
import { ArrowRightIcon } from "lucide-react"
import { useContext } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import * as yup from "yup"

const promptSchema = yup.object({
  prompt: yup.string().required(),
})

const PromptForm = () => {
  const { create, inProgress, items } = useContext(CreationContext)
  const form = useForm<yup.InferType<typeof promptSchema>>({
    resolver: yupResolver(promptSchema),
  })

  const onSubmit: SubmitHandler<GenerateImageParams> = (data) => {
    create(data.prompt)
  }

  return (
    <>
      <section id="prompt-section">
        <div className="w-full flex flex-col sm:gap-16 gap-6 pt-10">
          <div className="px-8">
            <span className="font-bold lg:text-9xl text-7xl">
              Unique Yoga Mats <br />
            </span>
            <span className="font-bold sm:text-5xl text-xl">Designed by you.</span>
          </div>
          {!inProgress && (
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="text-center">
                <div className="flex flex-row justify-center sm:gap-4 gap-2 px-4">
                  <input
                    {...form.register("prompt")}
                    className=" bg-white border-gray-300 border sm:rounded-xl rounded-md px-4 text-slate-700 transition-all placeholder-slate-500 sm:text-xl text-sm sm:h-16 h-10 w-full max-w-4xl focus:outline-black outline outline-0 focus:outline-1"
                    placeholder="Tell us what inspires you"
                  />
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    className="sm:h-16 sm:w-16 h-10 w-10 sm:rounded-lg rounded-md p-3"
                  >
                    <ArrowRightIcon strokeWidth="2" />
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  )
}

export default PromptForm
