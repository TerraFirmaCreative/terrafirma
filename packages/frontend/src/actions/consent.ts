"use server"
import { cookies } from "next/headers";

export const setConsentCookie = async (consent: boolean) => {
  cookies().set({
    name: "cookieConsent",
    value: JSON.stringify(consent),
    expires: 2419200000,
    maxAge: 2419200
  })
}

export const getConsentCookie = async (): Promise<boolean | undefined> => {
  const consent = cookies().get("cookieConsent")
  return consent ? Boolean(JSON.parse(consent?.value)) : undefined
}