"use server"
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { match } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import { defaultLocale, locales } from "./config"

const internalRoutes: string[] = [""]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Server action (use for rate-limiting)
  // if (request.method == "POST") {
  // }

  // Redirect to locale if not present (ignore locale for /api routes)
  if (!pathname.startsWith('/api/')) {
    const acceptLanguage = { 'accept-language': request.headers.get('accept-language') ?? defaultLocale }
    const locale = match(new Negotiator({ headers: acceptLanguage }).languages(), locales, defaultLocale)

    const hasLocale = locales.some((l) => pathname.startsWith(`/${l}`) || pathname == `/${l}`)

    if (!hasLocale) {
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
    '/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
}