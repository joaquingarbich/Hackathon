import * as React from "react"
import { cn } from "@/lib/utils"
import { claseInput } from "./input"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(claseInput, "field-sizing-content h-auto min-h-24 py-3 leading-normal", className)} {...props} />
}

export { Textarea }
