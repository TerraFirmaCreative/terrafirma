import express from "express"
import { sanitisePrompt } from "../../../utils"
import { sqsClient } from "../../../config"
import { SendMessageCommand } from "@aws-sdk/client-sqs"
import { TaskStatus, TaskType } from "@prisma/client"
import { ImagineData } from "../../../types/image.dto"
import { prisma } from "../../../config"

export const router = express.Router()

router.route("").post(async (req, res) => {
  const prompt = sanitisePrompt(req.body.prompt ?? "")
  const token = req.cookies['token']

  if (!token) {
    return res.status(400).json("Bad Request")
  }

  try {
    const task = await prisma.task.create({
      data: {
        status: TaskStatus.Queued,
        type: TaskType.Imagine,
        user: {
          "connect": {
            "token": token
          }
        }
      },
      include: {
        user: true
      }
    })

    await sqsClient.send(new SendMessageCommand(
      {
        QueueUrl: process.env.SQS_URL ?? "",
        MessageBody: JSON.stringify({
          "userId": task.userId,
          "taskId": task.id,
          "prompt": prompt,
          "type": TaskType.Imagine
        })
      }
    ))

    res.status(201).json({
      id: task.id,
      status: task.status
    })
  }
  catch (e) {
    console.error("Error creating task for", token, ":", e)
    return res.status(500).json("Internal Server Error")
  }
})

export type ImagineVariantsPostParams = {
  srcImagineData: ImagineData,
  prompt?: string,
  index: number
}

router.route("/variants").post(async (req, res) => {
  const prompt = sanitisePrompt(req.body.prompt ?? "")
  const imagineData = req.body.srcImagineData
  const token = req.cookies['token']

  if (!token) {
    return res.status(400).json("Bad Request")
  }

  try {
    const task = await prisma.task.create({
      data: {
        status: TaskStatus.Queued,
        type: TaskType.ImagineVariants,
        user: {
          connect: {
            token: token
          }
        },
      },
      include: {
        user: true
      }
    })
    await sqsClient.send(new SendMessageCommand(
      {
        QueueUrl: process.env.SQS_URL ?? "",
        MessageBody: JSON.stringify({
          "userId": task.userId,
          "srcImagineData": imagineData,
          "index": req.body.index,
          "taskId": task.id,
          "prompt": prompt,
          "type": TaskType.ImagineVariants
        })
      }
    ))

    res.status(201).json({
      id: task.id,
      status: task.status
    })
  }
  catch (e) {
    console.error("Error creating task for", token, ":", e)
    return res.status(500).json("Internal Server Error")
  }
})