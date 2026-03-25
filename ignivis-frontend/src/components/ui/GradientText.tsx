import React from "react"
import { cn } from "@/lib/utils"

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "accent"
  as?: React.ElementType
}

export function GradientText({ children, className, variant = "primary", as: Component = "span" }: GradientTextProps) {
  return (
    <Component
      className={cn(
        variant === "primary" ? "text-gradient" : "text-gradient-accent",
        className
      )}
    >
      {children}
    </Component>
  )
}
