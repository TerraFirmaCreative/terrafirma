import { ReceiveMessageCommandOutput } from '@aws-sdk/client-sqs'
import { TaskType } from '@prisma/client'
import { ImagineData } from '@terrafirma/rest/src/types/image.dto'
import { Message } from '@aws-sdk/client-sqs'

export type TaskMessage = Message & {
  Body: {
    userId: string,
    taskId: string,
    type: TaskType
  }
}

export type ImagineTask = TaskMessage & {
  Body: {
    prompt: string
  }
}

export type ImagineVariantsTask = TaskMessage & {
  Body: {
    prompt: string,
    srcImagineData: ImagineData,
    index: 2 | 1 | 3 | 4
  }
}