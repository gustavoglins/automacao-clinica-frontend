import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-[#2563eb] text-white hover:bg-[#1d4ed8] focus-visible:ring-[#2563eb]",
        success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500",
        warning: "bg-yellow-400 text-white hover:bg-yellow-500 focus-visible:ring-yellow-400",
        danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
        "outline-primary": "border border-[#2563eb] text-[#2563eb] hover:bg-[#2563eb] hover:text-white",
        "outline-success": "border border-green-600 bg-background text-green-600 hover:bg-green-600 hover:text-white",
        "outline-warning": "border border-yellow-400 bg-background text-yellow-500 hover:bg-yellow-400 hover:text-white",
        "outline-danger": "border border-red-600 bg-background text-red-600 hover:bg-red-600 hover:text-white",
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        // outline: "border border-input bg-background hover:bg-primary/100 hover:text-white",
        outline: "border border-gray-300 bg-white text-gray-800 hover:bg-stone-50 hover:text-gray-900 shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        classic: "border border-gray-300 bg-white text-gray-800 hover:bg-stone-50 hover:text-gray-900 shadow-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        xs: "h-7 rounded-lg px-4 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
