"use server"
import { sessions } from "@/components/session/session-data"
import { getPrisma } from "@/config"
import { cookies } from "next/headers"

async function retrieveUser(userId: string) {
  const user = await getPrisma().user.findUnique({
    where: {
      id: userId
    }
  })

  if (user) {
    sessions.set(userId, user)
    cookies().set({
      name: 'token',
      value: userId,
      expires: 1200000,
      maxAge: 1200,
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
      sessions.set(authParam, user)
      cookies().set({
        name: 'token',
        value: authParam,
        expires: 1200000,
        maxAge: 1200,
      })
    }
  }

  const token = cookies().get('token')
  // TODO: Check DB after checking session just in case?
  if (!token || !(sessions.has(token.value) || retrieveUser(token.value))) {
    const newToken = crypto.randomUUID().replace("-", "")

    const user = await getPrisma().user.create({
      data: {
        "token": newToken
      }
    })

    sessions.set(newToken, user)
    cookies().set({
      name: 'token',
      value: newToken,
      expires: 1200000,
      maxAge: 1200,
    })
  }
  else {
    cookies().set({
      name: 'token',
      value: token.value,
      expires: 1200000,
      maxAge: 1200,
    })
  }
}