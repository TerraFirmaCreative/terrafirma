import express from "express"
import OpenAI from "openai"
import config, { logger, mjClient, prisma } from "../config"
import { MJMessage } from "midjourney"
import { ImagineData } from "@terrafirma/rest/src/types"
import { trimPrompt } from "../utils"

export const router = express.Router()

const openai = new OpenAI({
  apiKey: config.OPENAI_KEY
})

export async function updateTaskProgress(taskId: string, progress: string, progressUri: string) {
  logger.debug(`PROGRESS ${progress} ${progressUri}`)
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
    logger.error(`Error: Could not update progress for task ${taskId}: ${e}`)
  }
}

export const generateCustomText = async (prompt: string) => {
  try {
    const descriptions: string[] = (await openai.chat.completions.create({
      "model": "gpt-3.5-turbo-0125",
      "max_completion_tokens": 2000,
      "messages": [
        { role: "user", content: `Imagine an image using the following prompt: ['${prompt}']. This image will be the design of a yoga mat to be sold. Create an insightful caption for this mat. Include only the caption in your response, without any quotation or speech marks. Use only commas and full stops in your punctuation` },
      ],
      "n": 4,
    })).choices.map((choice) => choice.message.content ?? "Failed to generate description")

    const titlePromises = descriptions.map((desc, i) => {
      return (
        openai.chat.completions.create({
          "model": "gpt-3.5-turbo-0125",
          "max_completion_tokens": 2000,
          "messages": [
            { role: "user", content: `Imagine an image using the following prompt: ['${prompt}']. This image will be the design of a yoga mat to be sold. Create an insightful caption for this mat.` },
            { role: "system", content: desc },
            { role: "user", content: `Create an meaningful-sounding title for this image less than 5 words` }
          ]
        }).then((title) => {
          return title.choices[0].message.content?.split("").filter((char) => char != '"').join("") ?? `Design #${i}`
        })
      )
    })
    logger.info("Created titles and descriptions")
    return (await Promise.all(titlePromises)).map((title, i) => {
      return {
        title: title,
        description: descriptions[i]
      }
    })
  }
  catch (e) {
    logger.error("OpenAI Error: ", e)
    return new Array(4).fill(0).map((_, i) => ({
      title: `Design #${i}`,
      description: "Generating description failed."
    }))
  }
}

export const imagineMats = async (taskId: string, prompt: string): Promise<(MJMessage | null)[]> => {
  logger.info("Imagine start.")
  const Imagine: MJMessage | null = await mjClient.Imagine(
    `${prompt} --ar 13:35`,
    (uri, progress) => {
      updateTaskProgress(taskId, progress, uri)
    }
  )
  logger.info("Imagine complete.")
  logger.debug(`Imagine data ${Imagine}`)
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
  logger.info(`createVariants() ${imagineData}`)
  const variants: MJMessage | null = await mjClient.Variation({
    index: index, //Original Imagine index 1-5
    msgId: imagineData.imagineId,
    hash: imagineData.imagineHash,
    flags: 0,
    content: `${trimPrompt(imagineData.imaginePrompt)}. ${prompt} --ar 13:35`,
    loading: (uri, progress) => {
      updateTaskProgress(taskId, progress, uri)
    }
  },
  )

  logger.info(`Variations made ${variants}`)
  return variants
}