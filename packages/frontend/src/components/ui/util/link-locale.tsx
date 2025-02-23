"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

const LocaleLink = (props: React.ComponentProps<typeof Link>) => {
  const params: { locale: string } = useParams()
  return <Link {...props} href={`/${params.locale}${props.href}`}>{props.children}</Link>
}
export default LocaleLink