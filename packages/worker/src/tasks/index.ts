import { ImagineTask, ImagineVariantsTask } from "../types/worker"
import { sanitisePrompt } from "@terrafirma/rest/src/utils"
import { createVariants, generateCustomText, imagineMats } from "./midjourney"
import { createProduct } from "./shopify"
import config, { prisma, sqsClient } from "../config"
import { TaskStatus } from "@prisma/client"
import { remoteImage, splitQuadImage, uploadImage } from "./image"
import sharp, { Sharp } from "sharp"
import { DeleteMessageCommand } from "@aws-sdk/client-sqs"

export const imagineTask = async (task: ImagineTask) => {
  const prompt = sanitisePrompt(task.Body.prompt)
  console.log("imagineTask()")
  try {
    const [customText, imaginedImages] = await Promise.all([generateCustomText(prompt), imagineMats(prompt)])

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
    console.log("here")
    await prisma.$transaction([
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
          imaginePrompt: task.Body.prompt,
          imagineHash: imaginedImages[0]!.hash!,
          imagineId: imaginedImages[0]!.id!,
          Product: {
            createMany: {
              data: createdProducts.map((product) => {
                return {
                  createdById: task.Body.userId,
                  discordImageUrl: product.imageUrl,
                  shopifyProductId: product.productId,
                  allowVariants: true
                }
              })
            }
          }
        }
      })
    ])
    console.log("transaction complete")

    const user = await prisma.user.findUnique({
      "where": {
        id: task.Body.userId
      },
      "select": {
        email: true,
        token: true
      }
    })

    if (user?.email) {
      // Email user
      // await transporter.sendMail({
      //   "to": user.email,
      //   "subject": "Your designs are ready",
      //   html: Handlebars.compile(taskDoneHtml)({ accessLink: "hello" }),
      // })
      console.log(`https://terrafirmacreative.com/designs?auth=${user?.token}`)
    }
  }
  catch (e) {
    // axois frontend something went wrong & update task in db
    console.error(task.Body.userId, "Error:", e)
    prisma.task.update({
      where: {
        id: task.Body.taskId
      },
      data: {
        status: TaskStatus.Failed
      }
    })

    return
  }

  console.log("Deleting task")
  await sqsClient.send(new DeleteMessageCommand({
    "QueueUrl": config.SQS_URL,
    "ReceiptHandle": task.ReceiptHandle
  })) // TODO: We should only do this in the event of success. if fail, notify frontend ws
}

export const imagineVariantsTask = async (task: ImagineVariantsTask) => {
  const prompt = sanitisePrompt(task.Body.prompt)
  console.log("BODY: ", task.Body)
  try {
    const [customText, variantQuad] = await Promise.all([
      generateCustomText(prompt),
      createVariants(task.Body.prompt, task.Body.srcImagineData, task.Body.index)
    ])

    const variants: Sharp[] = await splitQuadImage(sharp(await remoteImage(variantQuad!.uri)))
    console.log("variants split")
    const variantUrls: string[] = await Promise.all(variants.map((variant, i) => { return uploadImage(variant, `${variantQuad!.hash}_V${i}`) }))
    console.log("images uploaded")
    const createProductItems = []
    for (let i = 0; i < 4; i++) {
      createProductItems.push(
        createProduct({
          description: customText[i].description,
          title: customText[i].title,
          url: variantUrls[i],
          prompt: task.Body.srcImagineData.imaginePrompt
        })
      )
    }
    const createdProducts = await Promise.all(createProductItems)
    console.log("created shopify products")
    const { id: _, ...newImagineData } = task.Body.srcImagineData
    await prisma.$transaction([
      prisma.task.update({
        where: {
          id: task.Body.taskId,
        },
        data: {
          status: TaskStatus.Complete,
        }
      }),
      // prisma.imagineData.create({
      //   data: {

      //     ...task.Body.srcImagineData, // omit id here
      //     Product: {
      //       createMany: {
      //         data: createdProducts.map((product) => {
      //           return {
      //             createdById: task.Body.userId,
      //             "discordImageUrl": product.imageUrl,
      //             "shopifyProductId": product.productId,
      //             "allowVariants": false
      //           }
      //         })
      //       }
      //     }
      //   }
      // }),
      prisma.imagineData.upsert({
        where: {
          id: task.Body.srcImagineData.id!
        },
        "update": {
          ...task.Body.srcImagineData,
          Product: {
            createMany: {
              data: createdProducts.map((product) => {
                return {
                  createdById: task.Body.userId,
                  "discordImageUrl": product.imageUrl,
                  "shopifyProductId": product.productId,
                  "allowVariants": false
                }
              })
            }
          }
        },
        "create": {
          ...newImagineData,
          Product: {
            createMany: {
              data: createdProducts.map((product) => {
                return {
                  createdById: task.Body.userId,
                  "discordImageUrl": product.imageUrl,
                  "shopifyProductId": product.productId,
                  "allowVariants": false
                }
              })
            }
          }
        }
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

    if (user?.email) {
      // Email user
      // await transporter.sendMail({
      //   "to": user.email,
      //   "subject": "Your designs are ready",
      //   html: Handlebars.compile(taskDoneHtml)({ accessLink: "hello" }),
      // })
      console.log(`https://terrafirmacreative.com/designs?auth=${user?.token}`)
    }
  }
  catch (e) {
    // axios frontend something went wrong & update task in db
    console.error(task.Body.userId, "Error:", e)
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

  console.log("Success: deleting task")
  await sqsClient.send(new DeleteMessageCommand({
    "QueueUrl": config.SQS_URL,
    "ReceiptHandle": task.ReceiptHandle
  })) // TODO: We should only do this in the event of success. if fail, notify frontend ws
}