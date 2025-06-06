"use server"
import { auth } from "@/actions/auth"
import { getSessions, shouldAllowRequestRate } from "@/components/session/persistent-data"
import { getPrisma } from "@/config"
import { ImagineData, Product, TaskStatus, TaskType } from "@prisma/client"
import { cookies, headers } from "next/headers"

export type BeginTaskResult = {
  id: string | null,
  status: TaskStatus
}

export type ImagineTaskInput = {
  prompt: string
}

export type ImagineVariantsTaskInput = ImagineTaskInput & {
  srcImagineData: ImagineData,
  index: number
}

type TaskInput = { type: TaskType } & (ImagineTaskInput | ImagineVariantsTaskInput)

export const beginTask = async (task: TaskInput): Promise<BeginTaskResult> => {
  let result: BeginTaskResult = {
    id: null,
    status: TaskStatus.Failed,
  }

  if (!shouldAllowRequestRate(headers())) return result

  if (!cookies().has('token')) {
    await auth()
  }

  const token = cookies().get('token')
  if (!token) return result

  switch (task.type) {
    case TaskType.Imagine:
      try {
        const response = await fetch(`${process.env.REST_API_URL}/tasks/imagine`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Cookie": `token=${token.value}`
          },
          body: JSON.stringify(task),
          cache: "no-cache"
        })

        if (response.status != 201 || !response.ok) throw new Error("Error creating task.")

        const { id, status } = await response.json()

        result = {
          id: id,
          status: status
        }

      }
      catch (e) {
        console.error(e)
      }
      break
    case TaskType.ImagineVariants:
      try {
        const response = await fetch(`${process.env.REST_API_URL}/tasks/imagine/variants`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            "Cookie": `token=${token.value}`
          },
          body: JSON.stringify(task),
          cache: "no-cache"
        })

        if (response.status != 201 || !response.ok) throw new Error("Error creating task.")

        const { id, status } = await response.json() // Crashing here

        result = {
          id: id,
          status: status
        }

      }
      catch (e) {
        console.error(e)
      }
      break
    default:
      break
  }

  return result
}

export const pollTask = async (taskId: string) => {
  const res = await getPrisma().task.findUnique({
    where: {
      id: taskId,
    },
  })

  return res
}

export const getUserProducts = async () => {
  const token = cookies().get('token')
  if (!token) {
    return []
  }

  const products = await getPrisma().product.findMany({
    "where": {
      createdBy: {
        "token": token.value
      }
    },
    "include": {
      imagineData: true
    }
  })

  return products
}

export const getUserProduct = async (productId: string): Promise<Product & { imagineData: ImagineData | null } | null | undefined> => {
  const product = (await getPrisma().product.findFirst({
    where: {
      shopifyProductId: productId
    },
    include: {
      imagineData: true
    }
  }))

  return product
}

export const updateUserEmail = async (email: string) => {
  const token = cookies().get('token')

  if (!token) return

  const user = await getPrisma().user.update({
    "where": {
      "token": token.value
    },
    data: {
      email: email
    }
  })

  getSessions().set(token.value, user)
}

export const updateTaskShouldEmailUser = async (taskId: string, shouldEmail: boolean) => {
  const token = cookies().get('token')

  if (!token) return
  console.log("updating task", taskId, shouldEmail)
  const task = await getPrisma().task.update({
    "where": {
      "id": taskId
    },
    data: {
      "updateUser": shouldEmail
    }
  })
}