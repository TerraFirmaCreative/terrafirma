import { TaskStatus, TaskType } from "@/lib/types/task"
import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import { TextDecoderStream } from "stream/web"

export async function POST(req: NextRequest) {
  console.log("here")
  try {
    const reader = req.body?.getReader()

    let body = ''
    let finished = false
    while (!finished) {
      const { value, done } = await reader!.read()
      if (value) {
        body += new TextDecoder().decode(value)
      }
      if (done) {
        finished = true
      }
    }

    fs.appendFile("/root/notifications/aggregate.txt", body, (err) => {
      if (err) {
        console.log(err)
      }
    })

    return NextResponse.json(body)

  }
  catch (e) {
    console.log("HERE", e)
  }

  return NextResponse.json("hello")
}