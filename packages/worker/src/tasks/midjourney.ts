import express from "express"
import OpenAI from "openai"
import config, { mjClient, prisma } from "../config"
import { MJMessage } from "midjourney"
import { ImagineData } from "@terrafirma/rest/src/types"
import { trimPrompt } from "../utils"

export const router = express.Router()

const openai = new OpenAI({
  apiKey: config.OPENAI_KEY
})

export async function updateTaskProgress(taskId: string, progress: string, progressUri: string) {
  console.log("PROGRESS", progress, progressUri)
  try {
    await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        progress: progress,
        progressUri: progressUri
      }
    })
  }
  catch (e) {
    console.log(`Error: Could not update progress for task ${taskId}: ${e}`)
  }
}

export const generateCustomText = async (prompt: string) => {
  const descriptions: string[] = (await openai.chat.completions.create({
    "model": "gpt-3.5-turbo-0125",
    "messages": [
      { role: "user", content: `Imagine an image using the following promp: ['${prompt}']. This image will be the design of a yoga mat to be sold. Create an insightful caption for this mat. Include only the caption in your response, without any quotation or speech marks. Use only commas and full stops in your punctuation` },
    ],
    "n": 4,
  })).choices.map((choice) => choice.message.content ?? "Failed to generate description")

  const titlePromises = descriptions.map((desc, i) => {
    return (
      openai.chat.completions.create({
        "model": "gpt-3.5-turbo-0125",
        "messages": [
          { role: "user", content: `Imagine an image using the following promp: ['${prompt}']. This image will be the design of a yoga mat to be sold. Create an insightful caption for this mat.` },
          { role: "system", content: desc },
          { role: "user", content: `Create an meaningful-sounding title for this image less than 5 words` }
        ]
      }).then((title) => {
        return title.choices[0].message.content?.split("").filter((char) => char != '"').join("") ?? `Design #${i}`
      })
    )
  })

  return (await Promise.all(titlePromises)).map((title, i) => {
    return {
      title: title,
      description: descriptions[i]
    }
  })
}

export const imagineMats = async (taskId: string, prompt: string): Promise<(MJMessage | null)[]> => {
  const Imagine: MJMessage | null = await mjClient.Imagine(
    `${prompt} --ar 1:3`,
    (uri, progress) => {
      updateTaskProgress(taskId, progress, uri)
    }
  )

  console.log("Imagine", Imagine)
  let separated: Promise<MJMessage | null>[] = []
  for (let i = 0; i < 4; i++) {
    separated.push(mjClient.Custom({
      msgId: <string>Imagine!.id,
      flags: Imagine!.flags,
      customId: Imagine!.options!.at(i)!.custom
    }))
  }

  return ([Imagine, ...await Promise.all(separated)])
}

export const createVariants = async (taskId: string, prompt: string, imagineData: ImagineData, index: 1 | 2 | 3 | 4): Promise<(MJMessage | null)> => {
  console.log("createVariants()", imagineData)
  const variants: MJMessage | null = await mjClient.Variation({
    index: index, //Original Imagine index 1-5
    msgId: imagineData.imagineId,
    hash: imagineData.imagineHash,
    flags: 0,
    content: `${trimPrompt(imagineData.imaginePrompt)} ${prompt} --ar 1:3`,
    loading: (uri, progress) => {
      updateTaskProgress(taskId, progress, uri)
    }
  },
  )

  console.log("Variations made", variants)
  return variants
}