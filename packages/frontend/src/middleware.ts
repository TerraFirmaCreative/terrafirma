"use server"
import { NextRequest, NextResponse } from "next/server"
import { cookies, headers } from "next/headers"

const openRoutes: string[] = ['/api/notify', '/api/orders/update']
const internalRoutes = ['/api/ws']

export async function middleware(request: NextRequest) {
  if (openRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next()
  }

  if (internalRoutes.includes(request.nextUrl.pathname)) {
    const auth = headers().get('Authorization')

    if (auth == null || auth!.split('Bearer ').at(1) !== process.env.AUTH_SECRET) {
      return NextResponse.json("Forbidden", { status: 403 })
    }
  }

  return NextResponse.next()
}