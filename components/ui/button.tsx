import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

// shadcn/ui Button adaptado: 44 px mínimo (táctil), texto 16 px, foco sólido (globals.css)
// y respuesta al presionar (.pulsable: scale 0.97 en 160 ms ease-out). Nunca `transition: all`.
const buttonVariants = cva(
  "pulsable group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-transparent text-base font-semibold whitespace-nowrap no-underline select-none disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-marca hover:bg-primary-hover",
        outline: "border-border bg-card text-foreground shadow-suave hover:border-input hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_srgb,var(--secondary),var(--primary)_10%)]",
        ghost: "text-foreground hover:bg-muted",
        destructive: "bg-alerta-fondo text-alerta hover:bg-[color-mix(in_srgb,var(--alerta-fondo),var(--alerta)_10%)]",
        link: "h-auto! px-0! text-enlace underline-offset-4 hover:underline active:scale-100!",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-10 gap-1.5 rounded-lg px-3 text-[0.9375rem] [&_svg:not([class*='size-'])]:size-4",
        lg: "h-13 px-5 text-[1.0625rem]",
        xl: "h-15 rounded-2xl px-6 text-lg",
        icon: "size-11",
        "icon-lg": "size-13 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
