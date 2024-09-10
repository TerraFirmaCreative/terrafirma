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
