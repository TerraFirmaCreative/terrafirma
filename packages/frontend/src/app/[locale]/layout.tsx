import type { Metadata } from "next"

import "./globals.css"
import { cn, parseLocale } from "@/lib/utils"
import CartProvider from "@/components/ui/providers/cart-context"
import CreationProvider from "@/components/ui/providers/creation-context"
import MainMenu from "@/components/ui/header"
import { HomeIcon, LayoutDashboardIcon, PaintbrushIcon } from "lucide-react"
import { getPages } from "@/gateway/cms"
import SessionProvider from "@/components/session/session-provider"
import { geistSans, lato, playfairDisplay } from "@/lib/fonts"
import { getAvailableLocalization } from "@/gateway/store"

export const metadata: Metadata = {
  title: "Terra Firma Creative",
  description: "Custom made yoga mat designs",
  alternates: {
    "canonical": "terrafirmacreative.com/en-AU",
    "languages": {
      "en-CA": "terrafirmacreative.com/en-CA",
      "en-US": "terrafirmacreative.com/en-US",
      "en-GB": "terrafirmacreative.com/en-GB"
    }
  }
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

  return (
    <html lang="en">
      <body className={cn(geistSans.variable, playfairDisplay.variable, lato.variable, "bg-zinc-50 font-sans")}>
        <main className="w-full h-min-screen">
          <SessionProvider>
            <CartProvider locale={params.locale}>
              <CreationProvider>
                <MainMenu menuItems={menuItems} moreMenuItems={moreMenuItems} />
                {children}
              </CreationProvider>
            </CartProvider>
          </SessionProvider>
        </main>
      </body>
    </html>
  )
}
