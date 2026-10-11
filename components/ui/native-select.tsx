import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"
import { claseInput } from "./input"

// shadcn/ui NativeSelect adaptado: el <select> nativo (mejor en móvil y sin JS) con el estilo de Input.
type NativeSelectProps = React.ComponentProps<"select">

function NativeSelect({ className, ...props }: NativeSelectProps) {
  return (
    <div className={cn("group/native-select relative w-full has-[select:disabled]:opacity-50", className)} data-slot="native-select-wrapper">
      <select data-slot="native-select" className={cn(claseInput, "appearance-none pr-10")} {...props} />
      <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3.5 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </div>
  )
}

function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

export { NativeSelect, NativeSelectOption }
