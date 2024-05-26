import { User } from "@prisma/client"

// TODO: Use redis in future
export const sessions: Map<string, Session> = new Map()

export type Session = User