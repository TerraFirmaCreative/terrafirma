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
    const hasLocale = locales.some((l) => pathname.startsWith(`/${l}`) || pathname == `/${l}`)

    const acceptLanguage = { 'accept-language': (request.headers.get('accept-language') ?? defaultLocale) }

    const preferredLocale = request.cookies.get('preferredLocale')?.value
    if (preferredLocale) {
      acceptLanguage["accept-language"] = [preferredLocale, acceptLanguage["accept-language"]].join(",")
    }

    const locale = match(new Negotiator({ headers: acceptLanguage }).languages(), locales, defaultLocale)

    if (!hasLocale) {
      request.nextUrl.pathname = `/${locale}${pathname}`
      const response = NextResponse.redirect(request.nextUrl)
      response.cookies.set({
        name: "preferredLocale",
        value: locale,
        expires: 86400000,
        maxAge: 86400,
      })
      return response
    }

    if (locale != pathname.split('/').at(1)) {
      const response = NextResponse.redirect(request.nextUrl)
      response.cookies.set({
        name: "preferredLocale",
        value: pathname.split('/').at(1)!,
        expires: 86400000,
        maxAge: 86400,
      })
      return response
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