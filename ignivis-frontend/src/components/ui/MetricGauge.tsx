"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MetricGaugeProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
  getColor?: (val: number) => string
}

export function MetricGauge({ 
  value, 
  max = 100, 
  size = 200, 
  strokeWidth = 16,
  label = "Score",
  className,
  getColor
}: MetricGaugeProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / max) * circumference

  // Default color strategy based on heat risk meaning
  const getRiskColor = (val: number) => {
    if (val < 40) return "#22c55e" // Green - Safe
    if (val < 75) return "#eab308" // Yellow - Warning
    return "#ff4500" // Red - High Risk
  }

  const strokeColor = getColor ? getColor(value) : getRiskColor(value)

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      {/* Background Track */}
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
        />
        {/* Progress Track */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${strokeColor}80)` }}
        />
      </svg>
      
      {/* Inner Label */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold"
          style={{ color: strokeColor }}
        >
          {Math.round(value)}
        </motion.span>
        {label && <span className="text-sm text-gray-400 mt-1 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  )
}
