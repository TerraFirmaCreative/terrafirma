import { Roboto_Serif, Playfair_Display } from "next/font/google"
import { GeistSans } from "geist/font/sans"

export const robotoSerif = Roboto_Serif({
  weight: "variable",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-roboto-serif"
})

export const playfairDisplay = Playfair_Display({
  weight: "variable",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-playfair-display"
})

export const geistSans = GeistSans