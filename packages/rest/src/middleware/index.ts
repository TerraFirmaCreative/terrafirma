import express, { NextFunction } from "express"
import { prisma } from "../config"
import { sessions } from "../session/session"
import { User } from "@prisma/client"

export async function auth(req: express.Request, res: express.Response, next: NextFunction) {
  // const token = req.cookies['token']

  // if (!token) 

  // let token = req.cookies['token']
  // let user: User
  // if (token && sessions.has(token)) {
  //   user = await prisma.user.findUniqueOrThrow({
  //     include: {
  //       tasks: {
  //         select: {
  //           status: true,
  //         }
  //       }
  //     },
  //     where: {
  //       token: token,
  //     }
  //   })

  //   console.log(token)
  // }
  // else {
  //   user = await prisma.user.upsert({
  //     create: {
  //       token: token
  //     },
  //     update: {
  //       token: token
  //     },
  //     where: {
  //       token: token
  //     },
  //     include: {
  //       tasks: {
  //         select: {
  //           status: true,
  //         }
  //       }
  //     }
  //   })
  // }

  // sessions.set(token, user)
  next()
}