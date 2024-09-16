"use client"

import { cn, } from "@/lib/utils"
import { Badge } from "./badge"
import {
  toast
} from "@/hooks/use-toast"
import { CopyIcon } from "lucide-react"
const ClipboardBadge = ({ clip, children, className }: { className?: string, clip: string, children: React.ReactNode }) => {
  return (
    <Badge
      className={cn(className, " cursor-pointer pl-4")}
      variant="secondary"
      onClick={() => {
        navigator.clipboard.writeText(clip)
        toast({ title: "Copied prompt!", description: clip })
      }}>
      {children}
      <CopyIcon className="stroke-1 p-1 ml-2 h-6" />
    </Badge>
  )
}

export default ClipboardBadge