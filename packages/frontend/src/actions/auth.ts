"use server"
import { sessions } from "@/components/session/session-data"
import { getPrisma } from "@/config"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function auth(authParam?: string | null) {
  if (authParam) {
    const user = await getPrisma().user.findUnique({
      where: {
        token: authParam
      }
    })
    console.log(user)
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

  if (!token || !sessions.has(token.value)) {
    // Guest mode if something is wrong
    console.log("New user", token && sessions.has(token.value))
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
    console.log("existing user")
    cookies().set({
      name: 'token',
      value: token.value,
      expires: 1200000,
      maxAge: 1200,
    })
  }
}