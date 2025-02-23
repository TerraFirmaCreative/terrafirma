"use client"
import { createContext, useEffect, useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader } from "../ui/sheet"
import { Button } from "../ui/button"
import { Toast } from "../ui/toast"
import { useToast } from "@/hooks/use-toast"
import { getConsentCookie, setConsentCookie } from "@/actions/consent"
import { GoogleAnalytics } from "@next/third-parties/google"
import Script from "next/script"
import { cn } from "@/lib/utils"

type CookiesContextProps = {
  cookieConsent: boolean
}

const CookiesContext = createContext<CookiesContextProps>({
  cookieConsent: false
})

const CookiesProvider = ({ children }: { children: React.ReactNode }) => {
  const [consent, setConsent] = useState<boolean | undefined>(undefined)
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    const applySavedPreferences = async () => {
      const consent = await getConsentCookie()

      setConsent(consent)
      if (consent === undefined) setOpen(true)
    }

    applySavedPreferences()
  }, [])

  useEffect(() => {
    if (consent !== undefined) {
      setOpen(false)
      setConsentCookie(consent)
    }
  }, [consent])

  return (
    <>
      {consent &&
        <>
          <GoogleAnalytics gaId="G-QNLBHNGSJ6" />
          <Script type="text/javascript" src="https://af.uppromote.com/tracking_third_party.js?shop=e38601-2.myshopify.com" />
        </>
      }
      <CookiesContext.Provider value={{
        cookieConsent: Boolean(consent)
      }}>
        {children}
      </CookiesContext.Provider>

      <div className={cn(!open && "translate-y-[110%]", "transition-transform fixed left-0 bottom-0 m-4 gap-4 max-w-min flex flex-col bg-white rounded-lg p-6 border drop-shadow-md")}>
        <div className="flex flex-row">
          <span className="text-sm">
            We use analytics cookies to improve our website and your experience.
          </span>
          <span className="pl-4 text-5xl">🍪</span>
        </div>
        <div className="flex flex-row gap-4">
          <Button variant="outline" onClick={() => setConsent(false)}>Essential Only</Button>
          <Button variant="default" onClick={() => setConsent(true)}>Accept All</Button>
        </div>
      </div>
    </>
  )
}

export default CookiesProvider