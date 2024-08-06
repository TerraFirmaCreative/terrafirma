"use server"
import { getPrisma } from "@/config"
import { GeneratedItemDto, ImagineData } from "@/lib/types/image.dto"
import { trimPrompt } from "@/lib/utils"

/*
*  Store actions here are all within the context of generating custom mats.
* Consider separating generic store actions into /store route in the future.
*/

export const getPrompts = async () => {
  const prompts = await getPrisma().imagineData.findMany({
    "take": 50,
    "select": {
      "imaginePrompt": true
    }
  })

  return prompts.map((prompt) => trimPrompt(prompt.imaginePrompt).split(" ").slice(0, 10).join(" "))
}

export const generateItems = async (prompt: string): Promise<GeneratedItemDto[]> => {
  // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
  const res: Response = await fetch(`${process.env.REST_API_URL}/custom`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: prompt
    },),
    cache: "no-store" //Enable caching to relieve spam
  })

  if (res.status != 200 || !res.ok) throw new Error("Custom mat creation failed")

  const payload: GeneratedItemDto[] = await res.json()
  console.log("POST /custom", payload)
  return payload
}

export type VariantParams = {
  imagineData: ImagineData
  index: 1 | 2 | 3 | 4
}
export const generateVariants = async (params: VariantParams) => {
  const startTime = new Date().getTime()
  // process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
  const res: Response = await fetch(`${process.env.REST_API_URL}/custom/variant`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      params: params
    },),
    cache: "no-store"
  })

  if (res.status != 200 || !res.ok) throw new Error("Variant generation failed")

  const payload: GeneratedItemDto[] = await res.json()
  return payload
}