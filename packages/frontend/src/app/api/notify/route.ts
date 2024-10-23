import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import { readStream } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const body = await readStream(req.body!)

    fs.appendFile(`${process.env.LOG_DIR}/shipping-notifications.log`, `${body}\n`, {
      flag: 'a+'
    }, (err) => {
      if (err) {
        console.log(err)
      }
    })

    return NextResponse.json(body)

  }
  catch (e) {
    console.log("/notify Error reading request body")
  }

  return NextResponse.json({}, { status: 200 })
}
