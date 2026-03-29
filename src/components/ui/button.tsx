import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "danger"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    // Clases base para mantener la fricción cero y la interacción suave
    const baseClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border)] disabled:pointer-events-none disabled:opacity-50"
    
    const variants = {
      default: "bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-opacity-90 shadow-sm",
      secondary: "bg-[var(--accent-soft)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] shadow-sm",
      outline: "border border-[var(--border)] bg-transparent hover:bg-[var(--muted)] text-[var(--foreground)]",
      ghost: "hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
      link: "text-[var(--foreground)] underline-offset-4 hover:underline",
      danger: "bg-red-500/10 text-red-600 hover:bg-red-500/20",
    }

    const sizes = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
      icon: "h-9 w-9",
    }

    return (
      <button
        className={cn(baseClass, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
