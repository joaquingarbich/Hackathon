import * as React from "react"
import { cn } from "@/lib/utils"

// shadcn/ui Input adaptado: 48 px, 16 px siempre (evita el zoom de iOS), borde de control 3:1 y foco sólido.
const claseInput =
  "h-12 w-full min-w-0 rounded-xl border border-input bg-card px-3.5 text-base text-foreground shadow-suave transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-muted-foreground file:mr-3 file:inline-flex file:h-9 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:text-[0.9375rem] file:font-semibold file:text-secondary-foreground focus-visible:border-ring focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ring)_18%,transparent)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus-visible:shadow-[0_0_0_4px_color-mix(in_srgb,var(--destructive)_18%,transparent)]"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(claseInput, type === "file" && "h-auto py-2", className)} {...props} />
}

export { Input, claseInput }
