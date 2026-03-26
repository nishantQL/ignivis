"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hoverEffect = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass rounded-2xl p-6 relative overflow-hidden",
          hoverEffect && "hover:glass-hover transition-colors duration-300",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </motion.div>
    )
  }
)
GlassCard.displayName = "GlassCard"
