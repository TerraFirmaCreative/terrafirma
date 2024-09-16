import { ImagineTask, ImagineVariantsTask } from "../types/worker"
import { sanitisePrompt } from "@terrafirma/rest/src/utils"
import { createVariants, generateCustomText, imagineMats } from "./midjourney"
import { createProduct, uploadShopify } from "./shopify"
import config, { logger, prisma, sqsClient, transporter } from "../config"
import { TaskStatus } from "@prisma/client"
import { remoteImage, splitQuadImage } from "./image"
import sharp, { Sharp } from "sharp"
import { DeleteMessageCommand } from "@aws-sdk/client-sqs"
import { taskDoneTemplate } from "../email"

export const imagineTask = async (task: ImagineTask) => {
  const prompt = sanitisePrompt(task.Body.prompt)
  logger.info("imagineTask()")

  try {
    const [customText, imaginedImages] = await Promise.all([generateCustomText(prompt), imagineMats(task.Body.taskId, prompt)])

    const createProductItems = []
    for (let i = 0; i < 4; i++) {
      if (imaginedImages[i + 1] == null) throw "Failed to generate image"
      createProductItems.push(
        createProduct({
          description: customText[i].description,
          title: customText[i].title,
          url: imaginedImages[i + 1]!.uri,
          prompt: prompt
        })
      )
    }
    const createdProducts = await Promise.all(createProductItems)

    logger.debug(JSON.stringify({
      "products": createdProducts.map((product) => {
        return {
          "product_id": product.productId,
        }
      })
    }))

    if (process.env.PROJECTION_API_URL) {
      setTimeout(() =>
        fetch(process.env.PROJECTION_API_URL!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "products": createdProducts.map((product) => {
              return {
                "product_id": product.productId,
              }
            })
          })
        }), 10000)
    }

    const [taskRecord,] = await prisma.$transaction([
      prisma.task.update({
        where: {
          id: task.Body.taskId,
        },
        data: {
          status: TaskStatus.Complete,
        }
      }),
      prisma.imagineData.create({
        data: {
          imagineFlags: imaginedImages[0]!.flags,
          imaginePrompt: imaginedImages[0]!.content,
          imagineHash: imaginedImages[0]!.hash!,
          imagineId: imaginedImages[0]!.id!,
          Product: {
            createMany: {
              data: createdProducts.map((product, i) => {
                return {
                  createdById: task.Body.userId,
                  discordImageUrl: product.imageUrl,
                  shopifyProductId: product.productId,
                  allowVariants: true,
                  imagineIndex: i + 1
                }
              })
            }
          }
        }
      })
    ])
    logger.info("transaction complete")

    const user = await prisma.user.findUnique({
      "where": {
        id: task.Body.userId
      },
      "select": {
        email: true,
        token: true
      },
    })

    if (taskRecord.updateUser && user?.email) {
      await transporter.sendMail({
        "to": user?.email,
        "subject": "Your designs are ready",
        html: taskDoneTemplate({ accessLink: `https://terrafirmacreative.com/designs?auth=${user?.token}` }),
      })
      logger.debug(`https://terrafirmacreative.com/designs?auth=${user?.token}`)
    }

    logger.info("Task Successful, deleting...")
    await sqsClient.send(new DeleteMessageCommand({
      "QueueUrl": config.SQS_URL,
      "ReceiptHandle": task.ReceiptHandle
    }))
  }
  catch (e) {
    logger.error(`${task.Body.userId} Error: ${e}`)
    await prisma.task.update({
      where: {
        id: task.Body.taskId
      },
      data: {
        status: TaskStatus.Failed
      }
    })

    console.info("Task Failed, deleting...")
    await sqsClient.send(new DeleteMessageCommand({
      "QueueUrl": config.SQS_URL,
      "ReceiptHandle": task.ReceiptHandle
    }))

    return
  }
}

export const imagineVariantsTask = async (task: ImagineVariantsTask) => {
  const prompt = sanitisePrompt(task.Body.prompt)
  logger.debug(`BODY: ${task.Body}`)
  try {
    const [customText, variantQuad] = await Promise.all([
      generateCustomText(prompt),
      createVariants(task.Body.taskId, prompt, task.Body.srcImagineData, task.Body.index)
    ])

    const variants: Sharp[] = await splitQuadImage(sharp(await remoteImage(variantQuad!.uri)))
    logger.debug("variants split")
    const variantUrls = await uploadShopify(variants)
    console.log(variantUrls)
    logger.debug("images uploaded")
    const createProductItems = []
    for (let i = 0; i < 4; i++) {
      createProductItems.push(
        createProduct({
          description: customText[i].description,
          title: customText[i].title,
          url: variantUrls[i],
          prompt: prompt
        })
      )
    }
    const createdProducts = await Promise.all(createProductItems)

    logger.debug(JSON.stringify({
      "products": createdProducts.map((product) => {
        return {
          "product_id": product.productId,
        }
      })
    }))

    if (process.env.PROJECTION_API_URL) {
      setTimeout(() =>
        fetch(process.env.PROJECTION_API_URL!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "products": createdProducts.map((product) => {
              return {
                "product_id": product.productId,
              }
            })
          })
        }), 10000)
    }

    logger.info("Created shopify products")
    const { id: _, ...newImagineData } = task.Body.srcImagineData
    const [taskRecord,] = await prisma.$transaction([
      prisma.task.update({
        where: {
          id: task.Body.taskId,
        },
        data: {
          status: TaskStatus.Complete,
        }
      }),
      prisma.imagineData.create({
        "data": {
          imagineId: variantQuad!.id!,
          imagineFlags: variantQuad!.flags,
          imagineHash: variantQuad!.hash!,
          imaginePrompt: variantQuad!.content,
          Product: {
            createMany: {
              data: createdProducts.map((product, i) => {
                return {
                  createdById: task.Body.userId,
                  "discordImageUrl": product.imageUrl,
                  "shopifyProductId": product.productId,
                  "allowVariants": false,
                  imagineIndex: i + 1
                }
              })
            }
          }
        },
      })
    ])

    const user = await prisma.user.findUnique({
      "where": {
        id: task.Body.userId
      },
      "select": {
        email: true,
        token: true
      }
    })

    if (taskRecord.updateUser && user?.email) {
      await transporter.sendMail({
        "to": user?.email,
        "subject": "Your designs are ready",
        html: taskDoneTemplate({ accessLink: `https://terrafirmacreative.com/designs?auth=${user?.token}` }),
      })
      logger.debug(`https://terrafirmacreative.com/designs?auth=${user?.token}`)
    }
  }
  catch (e) {
    logger.error(`${task.Body.userId} Error: ${e}`)
    await prisma.task.update({
      where: {
        id: task.Body.taskId
      },
      data: {
        status: TaskStatus.Failed
      }
    })

    return
  }

  logger.info("Success: deleting task")
  await sqsClient.send(new DeleteMessageCommand({
    "QueueUrl": config.SQS_URL,
    "ReceiptHandle": task.ReceiptHandle
  }))
}