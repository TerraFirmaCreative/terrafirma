"use server"
import { getSessions } from "@/components/session/persistent-data"
import { getPrisma } from "@/config"
import { cookies } from "next/headers"

async function retrieveUser(userId: string) {
  const user = await getPrisma().user.findUnique({
    where: {
      id: userId
    }
  })

  if (user) {
    getSessions().set(userId, user)
    cookies().set({
      name: 'token',
      value: userId,
      expires: 2419200000,
      maxAge: 2419200,
    })
  }

  return user
}

export async function auth(authParam?: string | null) {
  if (authParam) {
    const user = await getPrisma().user.findUnique({
      where: {
        token: authParam
      }
    })

    if (user) {
      getSessions().set(authParam, user)
      cookies().set({
        name: 'token',
        value: authParam,
        expires: 2419200000,
        maxAge: 2419200,
      })
    }
  }

  const token = cookies().get('token')
  // TODO: Check DB after checking session just in case?
  if (!token || !(getSessions().has(token.value) || retrieveUser(token.value))) {
    const newToken = crypto.randomUUID().replace("-", "")

    const user = await getPrisma().user.create({
      data: {
        "token": newToken
      }
    })

    getSessions().set(newToken, user)
    cookies().set({
      name: 'token',
      value: newToken,
      expires: 2419200000,
      maxAge: 2419200,
    })
  }
  else {
    cookies().set({
      name: 'token',
      value: token.value,
      expires: 2419200000,
      maxAge: 2419200,
    })
  }
}