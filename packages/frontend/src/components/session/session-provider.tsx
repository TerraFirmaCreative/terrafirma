"use client"

import { auth } from "@/actions/auth"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

const Auth = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams()
  const [authenticating, setAuthenticating] = useState<boolean>(true)

  useEffect(() => {
    const authParam = searchParams?.get('auth')
    auth(authParam).then(() => setAuthenticating(false))
  }, [])

  return (
    !authenticating && children
  )
}

const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense>
      <Auth>
        {children}
      </Auth>
    </Suspense>
  )
}

export default SessionProvider