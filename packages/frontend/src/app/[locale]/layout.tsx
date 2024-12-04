import type { Metadata } from "next"

import "./globals.css"
import { cn, parseLocale } from "@/lib/utils"
import CartProvider from "@/components/ui/providers/cart-context"
import CreationProvider from "@/components/ui/providers/creation-context"
import MainMenu from "@/components/ui/header"
import { HomeIcon, LayoutDashboardIcon, PaintbrushIcon } from "lucide-react"
import { getPages } from "@/gateway/cms"
import SessionProvider from "@/components/persistent/session-provider"
import { geistSans, lato, playfairDisplay } from "@/lib/fonts"
import { getAvailableLocalization } from "@/gateway/store"
import { Toaster } from "@/components/ui/toaster"
import Banner from "@/components/ui/banner"
import { GoogleAnalytics } from "@next/third-parties/google"
import { locales } from "@/config"
import { TooltipProvider } from "@/components/ui/tooltip"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Custom AI-Generated Yoga Mats | Unique, Eco-Friendly & Premium Quality",
  description: "Discover our premium custom AI-generated yoga mats, featuring unique designs created from your prompts. Made with eco-friendly microfiber suede and natural rubber, our lightweight, 3mm thick mats offer comfort and style. Shop now for a one-of-a-kind yoga experience with personalized, high-quality mats.",
  alternates: {
    "canonical": "terrafirmacreative.com/en-AU",
    "languages": {
      "en-CA": "terrafirmacreative.com/en-CA",
      "en-US": "terrafirmacreative.com/en-US",
      "en-GB": "terrafirmacreative.com/en-GB"
    }
  }
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale: locale }))
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode,
  params: { locale: string }
}>) {

  const [pages, localization] = await Promise.all([
    getPages(),
    getAvailableLocalization()
  ])

  // Check current locale is available in store
  const [languageCode, countryCode] = parseLocale(params.locale)

  if (!localization?.availableCountries.some(
    (availableCountry) => (availableCountry.isoCode == countryCode)
  )) {
    // TODO: How do we handle this?
  }

  const menuItems = [
    {
      href: "/",
      text: "Home",
      icon: <HomeIcon strokeWidth={2} size="1.2rem" />
    },
    {
      href: "/designs",
      text: "My Designs",
      icon: <PaintbrushIcon strokeWidth={2} size="1.2rem" />
    },
    {
      href: "/browse",
      text: "Browse",
      icon: <LayoutDashboardIcon strokeWidth={2} size="1.2rem" />
    },
  ]

  const moreMenuItems = pages.map((page) => {
    return {
      href: `/pages/${page.handle}`,
      text: page.title ?? "",
      icon: <></>
    }
  })

  const [language, region] = parseLocale(params.locale)

  return (
    <html lang={language} className="h-full">
      <GoogleAnalytics gaId="G-QNLBHNGSJ6" />
      <Script type="text/javascript" src="https://af.uppromote.com/tracking_third_party.js?shop=e38601-2.myshopify.com" />
      <body className={cn(geistSans.variable, playfairDisplay.variable, lato.variable, "bg-zinc-50 font-sans min-h-full relative h-fit")}>
        <header className="relative w-full">
          <Banner />
        </header>
        <main className="w-full h-full">
          <TooltipProvider>
            <SessionProvider>
              <CartProvider locale={params.locale}>
                <CreationProvider>
                  <MainMenu menuItems={menuItems} moreMenuItems={moreMenuItems} />
                  {children}
                </CreationProvider>
              </CartProvider>
            </SessionProvider>
          </TooltipProvider>
        </main>
        <Toaster />
      </body>
    </html>
  )
}
