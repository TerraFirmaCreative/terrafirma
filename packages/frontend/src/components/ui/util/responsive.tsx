"use client"
import { useEffect, useLayoutEffect, useState } from "react"

const Responsive = ({ mobile, desktop }: { mobile?: React.ReactNode, desktop?: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  const onResize = () => {
    if (window.innerWidth < 640) setIsMobile(true)
    else setIsMobile(false)
  }

  useEffect(() => {
    onResize()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return (
    <>
      {
        isMobile && mobile
      }
      {
        !isMobile && desktop
      }
    </>
  )
}

export default Responsive