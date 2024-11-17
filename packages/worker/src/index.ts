import config, { logger, mjClient, sqsClient } from "./config"
import { ReceiveMessageCommand } from "@aws-sdk/client-sqs"
import { ImagineTask, ImagineVariantsTask, TaskMessage } from "./types/worker"
import { TaskType } from '@prisma/client'
import { imagineTask, imagineVariantsTask } from "./tasks"

async function handleMessage(message: TaskMessage) {
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
    logger.info(`Messages received: ${response.Messages.length}`)
    logger.info(response.Messages?.at(0)?.Body)
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
