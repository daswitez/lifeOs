import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "knowledge"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const baseClass = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  const variants = {
    default: "bg-[var(--foreground)] text-[var(--background)]",
    secondary: "bg-[var(--accent-soft)] text-[var(--foreground)]",
    outline: "text-[var(--foreground)] border border-[var(--border)]",
    destructive: "bg-red-500/10 text-red-600 border border-red-500/20",
    knowledge: "bg-blue-500/10 text-blue-600 border border-blue-500/20 font-serif italic" // Editorial touch
  }

  return (
    <div className={cn(baseClass, variants[variant], className)} {...props} />
  )
}

export { Badge }
