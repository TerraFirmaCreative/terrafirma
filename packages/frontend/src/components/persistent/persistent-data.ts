import { User } from "@prisma/client"
import { time } from "console"
import { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers"
import { NextRequest } from "next/server"

/*
*  We only use this to store keep track of real user token in-memory and not fetch from the DB every time.
*/
let sessions: Map<string, Session> = new Map()


export const getSessions = () => {
  if (!sessions) {
    sessions = new Map()
  }
  return sessions
}

/*
* In-memory store for rate limiting. Does not persist between server restarts, and we should purge records older than
*/
const rateLimitRecord: Map<string, number> = new Map()
const RATE_LIMIT_WINDOW: number = 5000

export const shouldAllowRequestRate = (headers: ReadonlyHeaders): boolean => {
  console.log(Array.from(rateLimitRecord.keys()))
  const k = headers.get("x-forwarded-for")
  if (!k) return false
  const prevTime = rateLimitRecord.get(k)
  rateLimitRecord.set(k, new Date().getTime())

  return (!prevTime || new Date().getTime() - prevTime > RATE_LIMIT_WINDOW)
}

export type Session = User