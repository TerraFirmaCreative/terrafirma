"use client"
import { Button } from "@/components/ui/button"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { CreationContext } from "@/components/ui/custom/creation-context"
import GeneratedImageCarousel from "@/components/ui/custom/image-carousel"
import { FormDescription } from "@/components/ui/form"
import { GenerateImageParams } from "@/lib/types/image.dto"
import { yupResolver } from "@hookform/resolvers/yup"
import { AspectRatio } from "@radix-ui/react-aspect-ratio"
import { ArrowRightIcon } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import Image from "next/image"
import * as yup from "yup"
import { cn } from "@/lib/utils"
import { randomInt } from "crypto"

const promptSchema = yup.object({
  prompt: yup.string().required(),
})

const PromptResults = () => {
  const { inProgress, products, progress, progressUri } = useContext(CreationContext)

  const imageCrops = ["origin-top-left", "origin-top-right", "origin-bottom-left", "origin-bottom-right"]
  const [quadUrl, setQuadUrl] = useState<string | null | undefined>(progressUri)

  useEffect(() => {
    if (!inProgress && progress != "0%") setQuadUrl(products.at(-1)?.discordImageUrl)
    else setQuadUrl(progressUri)
  }, [inProgress])

  return (
    <div className="w-full flex flex-col justify-center">
      <Carousel opts={{ align: 'center' }}>
        <CarouselContent className="-ml-10">
          {inProgress ?
            imageCrops.map((crop, i) =>
              progressUri &&
              <CarouselItem key={i} className="pl-10 lg:basis-1/4 sm:basis-1/3">
                <div className="w-[200px] h-[600px] overflow-clip">
                  <div className={cn(crop, "scale-[2.0]")}>
                    <Image
                      className="blur-sm fade-in-10 fade-out-10"
                      alt="Progress Image"
                      width="640"
                      height="1904"
                      sizes="50vw"
                      src={progressUri} />
                  </div>
                </div>
              </CarouselItem>
            )
            :
            <></>
          }
        </CarouselContent>
      </Carousel>
    </div>
  )
}

const PromptForm = ({ prompts }: { prompts: string[] }) => {
  const { create, inProgress, products } = useContext(CreationContext)
  const form = useForm<yup.InferType<typeof promptSchema>>({
    resolver: yupResolver(promptSchema),
  })

  const [promptText, setPromptText] = useState<string>()
  const promptIndex = useRef(0)

  const onSubmit: SubmitHandler<GenerateImageParams> = (data) => {
    create(data.prompt)
  }

  const typePrompt = async (prompt: string) => {
    let joined = ""
    for (const char of prompt.split("")) {
      joined += char
      await new Promise(resolve => setTimeout(resolve, 50))
      setPromptText(joined)
    }
  }

  const updatePrompt = async () => {
    typePrompt(prompts.at(promptIndex.current % prompts.length) ?? "").then(() => {
      promptIndex.current++
      setTimeout(updatePrompt, 5000)
    })
  }

  useEffect(() => {
    updatePrompt()
    console.log(prompts)
  }, [])

  return (
    <>
      <section id="prompt-section">
        <div className="w-full flex flex-col sm:gap-16 gap-6 pt-10">
          <div className="font-serif font-medium px-8">
            <span className=" lg:text-9xl text-7xl">
              Unique Yoga Mats <br />
            </span>
            <span className="sm:text-5xl text-xl italic font-normal pl-5">Designed by you.</span>
          </div>
          {!inProgress && (
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="text-center">
                <div className="flex flex-row justify-center sm:gap-4 gap-2 px-4">
                  <input
                    {...form.register("prompt")}
                    className=" bg-white border-gray-300 border px-4 text-slate-700 transition-all placeholder-slate-500 sm:text-xl text-sm sm:h-16 h-10 w-full max-w-4xl focus:outline-black outline outline-0 focus:outline-1"
                    // className=" bg-white border-gray-300 border sm:rounded-md rounded-md px-4 text-slate-700 transition-all placeholder-slate-500 sm:text-xl text-sm sm:h-16 h-10 w-full max-w-4xl focus:outline-black outline outline-0 focus:outline-1"
                    placeholder={`${promptText}`}
                  />
                  <Button
                    onClick={form.handleSubmit(onSubmit)}
                    className="sm:h-16 sm:w-16 h-10 w-10 sm:rounded-none rounded-none p-3"
                  // className="sm:h-16 sm:w-16 h-10 w-10 sm:rounded-md rounded-md p-3"
                  >
                    <ArrowRightIcon strokeWidth="2" />
                  </Button>
                </div>
              </div>
            </form>
          )}
          {/* <PromptResults /> */}
        </div>
      </section>
    </>
  )
}

export default PromptForm
