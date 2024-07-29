import type { Metadata } from "next"

import "./globals.css"
import { cn } from "@/lib/utils"
import CartProvider from "@/components/ui/store/cart-context"
import CreationProvider from "@/components/ui/custom/creation-context"
import MainMenu from "@/components/ui/header"
import { HomeIcon, LayoutDashboardIcon, PaintbrushIcon } from "lucide-react"
import { getPages } from "@/gateway/cms"
import SessionProvider from "@/components/session/session-provider"
import { geistSans, lato, playfairDisplay, robotoSerif } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "Terra Firma Creative",
  description: "Custom made yoga mat designs",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pages = await getPages()
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
            <CartProvider>
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
