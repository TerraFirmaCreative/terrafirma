import { sessions } from "@/components/session/session-data"
import { getPrisma } from "@/config"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// export async function getSession(token: string | undefined) {
//   "use server"
//   if (token) {
//     return sessions.get(token)
//   }
// }

export async function GET(request: NextRequest) {
  const token = cookies().get('token')

  if (!token || !sessions.has(token.value)) {
    // Guest mode if something is wrong
    const newToken = crypto.randomUUID().replaceAll('-', '')
    const user = await getPrisma().user.create({
      data: {
        "token": newToken
      }
    })

    sessions.set(newToken, user)
    console.log(sessions.has(newToken))
    cookies().set('token', newToken)
  }


  return NextResponse.redirect(new URL('/', request.url))
}