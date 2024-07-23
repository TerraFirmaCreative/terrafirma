import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import { readStream } from "@/lib/utils"

export async function POST(req: NextRequest) {
  try {
    const body = await readStream(req.body!)
    console.log(`POST /api/orders/update :: ${body}`)
    fs.appendFile(`${process.env.LOG_DIR}/fulfillment-notifications.log`, `${body}\n`, {
      flag: 'a+'
    }, (err) => {
      if (err) {
        console.log(err)
      }
    })

    return NextResponse.json(body)
  }
  catch (e) {
    console.log("/orders/update Error reading request body")
  }

  return NextResponse.json({}, { status: 200 })
}