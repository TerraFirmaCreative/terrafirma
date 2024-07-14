import express from "express"
import OpenAI from "openai"
import config, { mjClient } from "../config"
import { MJMessage } from "midjourney"
import { ImagineData } from "@terrafirma/rest/src/types"

export const router = express.Router()

const openai = new OpenAI({
  apiKey: config.OPENAI_KEY
})

export const generateCustomText = async (prompt: string) => {
  const descriptions: string[] = (await openai.chat.completions.create({
    "model": "gpt-3.5-turbo-0125",
    "messages": [
      { role: "user", content: `Using the description words attached below, imagine an image. Come up with a description of the image in less than 100 words. The words are as follow: ${prompt}` },
    ],
    "n": 4
  })).choices.map((choice) => choice.message.content ?? "Failed to generate description")

  const titlePromises = descriptions.map((desc, i) => {
    return (
      openai.chat.completions.create({
        "model": "gpt-3.5-turbo-0125",
        "messages": [
          { role: "user", content: `Using the description words attached below, imagine an image. Come up with a description of the image in less than 100 words. The words are as follow: ${prompt}` },
          { role: "system", content: desc },
          { role: "user", content: `Create an meaningful-sounding title for this image in 3 words` }
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

export const imagineMats = async (prompt: string): Promise<(MJMessage | null)[]> => {
  const Imagine: MJMessage | null = await mjClient.Imagine(`${prompt} --ar 1:3`)
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

export const createVariants = async (prompt: string, imagineData: ImagineData, index: 1 | 2 | 3 | 4): Promise<(MJMessage | null)> => {
  console.log("createVariants()", imagineData)
  const variants: MJMessage | null = await mjClient.Variation({
    index: index, //Original Imagine index 1-5
    msgId: imagineData.imagineId,
    hash: imagineData.imagineHash,
    flags: 0,
    content: `${prompt}::2 --ar 1:3`
  })
  console.log("Variations made", variants)


  /*
  * Received MJ Error: "You can create another upscale for this image."
  */
  // let separated: Promise<MJMessage | null>[] = []
  // for (let i = 0; i < 4; i++) {
  //   separated.push(mjClient.Custom({
  //     msgId: "1227122673554034688",
  //     flags: 0,
  //     customId: "MJ::JOB::upsample::1::55e2c81d-1ca9-41a4-bace-a6d90df495a1",
  //   }))
  // }
  // console.log(separated)
  // const sep = await Promise.all(separated)
  return variants
}