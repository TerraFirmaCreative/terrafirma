import { NextRequest, NextResponse } from "next/server"
import fs from 'fs'
import { readStream } from "@/lib/utils"
import { LucideSkull } from "lucide-react"

export async function GET(req: NextRequest) {
  const SKU: string | null = req.nextUrl.searchParams.get("sku")
  if (!SKU || SKU.length < 1) {
    return NextResponse.json({
      "MATGEN01": 1000,
      "MATGEN": 1000
    }, { status: 200 })
  } else {
    const stock = {}
    Object.defineProperty(stock, SKU as string, 1000)
    return NextResponse.json(stock, { status: 200 })
  }
}