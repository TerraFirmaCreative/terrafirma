import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { cn } from "@/lib/utils"
import CartProvider from "@/components/ui/store/cart-context"
import CreationProvider from "@/components/ui/custom/creation-context"
import MainMenu from "@/components/ui/header"
import { HomeIcon, PaintbrushIcon } from "lucide-react"
import { getPages } from "@/gateway/cms"
// import { auth } from "@/actions/auth"
import { cookies } from "next/headers"
import { sessions } from "@/components/session/session-data"
import { getPrisma } from "@/config"
import SessionProvider from "@/components/session/session-provider"
// import { io } from "@/config"

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
  ]

  // if (!io) {
  //   await fetch("http://localhost:3000/api/ws", {
  //     headers: {
  //       "Authorization": `Basic ${process.env.AUTH_KEY}`
  //     }
  //   })
  // }

  const moreMenuItems = pages.map((page) => {
    return {
      href: `/pages/${page.handle}`,
      text: page.title ?? "",
      icon: <></>
    }
  })

  return (
    <html lang="en">
      <body className={cn(GeistSans.className, "bg-slate-50")}>
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
