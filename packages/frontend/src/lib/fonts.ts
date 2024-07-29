import { Roboto_Serif, Playfair_Display, Montserrat, Lato, Karla, Flow_Circular, Work_Sans } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { CircuitBoard } from "lucide-react"

export const robotoSerif = Roboto_Serif({
  weight: "variable",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-roboto-serif"
})

export const lato = Lato({
  weight: ["100", "300", "400", "700", "900",],
  style: ["normal"],
  subsets: ["latin"],
  variable: "--font-lato"
})

export const playfairDisplay = Playfair_Display({
  weight: "variable",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-playfair-display"
})

export const geistSans = GeistSans