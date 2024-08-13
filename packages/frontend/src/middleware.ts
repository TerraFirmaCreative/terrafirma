"use server"
import { NextRequest, NextResponse } from "next/server"
import { cookies, headers } from "next/headers"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"

const internalRoutes: string[] = [""]

const locales = ["en-US", "en-GB", "en-CA", "en-AU"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip for /api routes
  if (!pathname.startsWith('/api/')) {
    // Redirect to locale if not present
    const acceptLanguage = { 'accept-language': request.headers.get('accept-language') ?? undefined }
    const locale = match(new Negotiator({ headers: acceptLanguage }).languages(), locales, "en-AU")

    const hasPathname = locales.some((l) => pathname.startsWith(`/${l}`) || pathname == `/${l}`)

    if (!hasPathname) {
      request.nextUrl.pathname = `/${locale}/${pathname}`
      return NextResponse.redirect(request.nextUrl)
    }
  }

  // Require auth for certain routes
  if (internalRoutes.includes(pathname)) {
    const auth = headers().get('Authorization')

    if (auth == null || auth!.split('Bearer ').at(1) !== process.env.AUTH_SECRET) {
      return NextResponse.json("Forbidden", { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
}