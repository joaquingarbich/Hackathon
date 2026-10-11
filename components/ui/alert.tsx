import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// shadcn/ui Alert con los tonos de estado (aviso = observaciones, peligro = alerta, info = marca).
const alertVariants = cva(
  "relative grid w-full gap-1 rounded-2xl border px-4 py-3.5 text-left text-[0.9375rem] has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 *:[svg]:row-span-2 *:[svg]:mt-0.5 *:[svg]:size-5 *:[svg]:text-current",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        info: "border-[color-mix(in_srgb,var(--primary)_25%,transparent)] bg-secondary text-secondary-foreground",
        aviso: "border-observaciones-borde/40 bg-observaciones-fondo text-observaciones",
        peligro: "border-alerta-borde/40 bg-alerta-fondo text-alerta",
        exito: "border-verificado-borde/40 bg-verificado-fondo text-verificado",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Alert({ className, variant, role = "note", ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role={role} className={cn(alertVariants({ variant }), className)} {...props} />
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("font-semibold leading-snug", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("leading-normal [&_a]:font-semibold [&_a]:text-current [&_a]:underline", className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }
