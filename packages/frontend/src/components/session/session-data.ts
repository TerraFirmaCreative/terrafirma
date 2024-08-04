import { User } from "@prisma/client"

/*
*  We only use this to store keep track of real user token in-memory and not fetch from the DB every time.
*/

// TODO: Use redis in future. 
export const sessions: Map<string, Session> = new Map()

export type Session = User