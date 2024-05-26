"use server"
import { NextRequest, NextResponse } from "next/server"
import { cookies, headers } from "next/headers"

const openRoutes: string[] = []
const internalRoutes = ['/api/notify', '/api/ws']

export async function middleware(request: NextRequest) {
  if (openRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  if (internalRoutes.includes(request.nextUrl.pathname)) {
    const auth = headers().get('Authorization')

    if (auth == null || auth!.split('Basic ').at(1) !== process.env.TERRAFIRMA_AUTH_KEY) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}