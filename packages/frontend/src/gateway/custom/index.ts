"use server"
import { getPrisma } from "@/config"
import { GeneratedItemDto, ImagineData } from "@/lib/types/image.dto"
import { trimPrompt } from "@/lib/utils"
import { User } from "@prisma/client"
import { cookies } from "next/headers"

/*
*  Store actions here are all within the context of generating custom mats.
* Consider separating generic store actions into /store route in the future.
*/

export const getPrompts = async () => {
  const prompts = await getPrisma().imagineData.findMany({
    "take": 10,
    "select": {
      "imaginePrompt": true
    },
    "orderBy": {
      createdAt: "desc"
    }
  })

  return prompts.map((prompt) => trimPrompt(prompt.imaginePrompt).split(" ").slice(0, 10).join(" "))
}

export const getUser = async (): Promise<Partial<User> | null> => {
  const token = cookies().get('token')?.value
  console.log("TOKEN", token)
  if (!token) return null

  const user = await getPrisma().user.findFirst({
    where: {
      token: token
    },
    select: {
      "email": true,
    }
  })

  return user
}