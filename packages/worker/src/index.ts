import config, { mjClient, sqsClient, transporter } from "./config"
import { ReceiveMessageCommand } from "@aws-sdk/client-sqs"
import { ImagineTask, ImagineVariantsTask, TaskMessage } from "./types/worker"
import { TaskType } from '@prisma/client'
import { imagineTask, imagineVariantsTask } from "./tasks"
import Handlebars from "handlebars"
import taskDoneHtml from './email/task-done'
import { spawn } from "child_process"

async function handleMessage(message: TaskMessage) {
  console.log("here", message)
  const task = message
  if (task) {
    switch (task.Body.type) {
      case TaskType.Imagine:
        imagineTask(task as ImagineTask)
        break
      case TaskType.ImagineVariants:
        imagineVariantsTask(task as ImagineVariantsTask)
        break
      default:
        break
    }
  }

  return
}

async function receiveMessages() {
  const response = await sqsClient.send(new ReceiveMessageCommand({
    QueueUrl: process.env.SQS_URL,
    MaxNumberOfMessages: 1,
    WaitTimeSeconds: 1,
  }))

  if (response.Messages) {
    console.info("Messages received: ", response.Messages.length)
    console.log(response.Messages?.at(0)?.Body)
    response.Messages?.map((message) => {
      handleMessage({
        ...message,
        Body: JSON.parse(message.Body!)
      })
    })
  }
}

async function main() {
  await mjClient.init()

  receiveMessages()
  setInterval(receiveMessages, config.MJ_COOLDOWN_MS)
}

main()
