"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { trimPrompt } from "@/lib/utils"
import { CopyIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const PromptDescription = ({ prompt }: { prompt: string }) => {
  return (
    <div className="border rounded-md p-4 font-light w-full">
      <div className="flex flex-row w-full justify-between">
        <h3 className="font-normal">Prompt</h3>
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger>
              <Button
                variant="ghost"
                className="p-2"
                onClick={() => {
                  navigator.clipboard.writeText(trimPrompt(prompt))
                  toast({ title: "Copied prompt!", description: trimPrompt(prompt) })
                }}
              >
                <CopyIcon className="stroke-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Copy Prompt
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {trimPrompt(prompt)}
    </div>
  )
}

export default PromptDescription