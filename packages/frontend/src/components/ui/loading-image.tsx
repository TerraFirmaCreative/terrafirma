"use client"
import { ImageProps } from "next/image"
import { useState } from "react"
import Image from "next/image"

export const LoadingImage = (props: ImageProps) => {
  const [visible, setVisible] = useState(false)

  return (
    <>
      {!visible && <div className="w-32 h-32 bg-transparent border-l-4 border-slate-800 rounded-[64px] animate-spin"></div>}
      <Image className={visible ? "invisible" : "visible"} {...props} onLoad={() => setVisible(true)} />
    </>

  )
}