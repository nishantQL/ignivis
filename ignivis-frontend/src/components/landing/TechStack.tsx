"use client"

import React from "react"
import { motion } from "framer-motion"
import { GradientText } from "@/components/ui/GradientText"

const techStack = [
  { 
    name: "FastAPI", 
    category: "High-Performance Backend", 
    bg: "from-[#009688]/30 to-[#009688]/5", 
    border: "border-[#009688]/40", 
    glow: "group-hover:shadow-[0_0_40px_rgba(0,150,136,0.3)]", 
    delay: 0 
  },
  { 
    name: "OpenCV", 
    category: "Computer Vision", 
    bg: "from-red-500/30 to-red-500/5", 
    border: "border-red-500/40", 
    glow: "group-hover:shadow-[0_0_40px_rgba(239,68,68,0.3)]", 
    delay: 0.1 
  },
  { 
    name: "Deep Learning", 
    category: "Neural Networks", 
    bg: "from-purple-500/30 to-purple-500/5", 
    border: "border-purple-500/40", 
    glow: "group-hover:shadow-[0_0_40px_rgba(168,85,247,0.3)]", 
    delay: 0.2 
  },
  { 
    name: "Random Forest", 
    category: "Environment Models", 
    bg: "from-blue-500/30 to-blue-500/5", 
    border: "border-blue-500/40", 
    glow: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]", 
    delay: 0.3 
  },
  { 
    name: "Next.js 15", 
    category: "React Architecture", 
    bg: "from-white/20 to-white/5", 
    border: "border-white/20", 
    glow: "group-hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]", 
    delay: 0.4 
  },
  { 
    name: "Tailwind v4", 
    category: "Styling Engine", 
    bg: "from-cyan-500/30 to-cyan-500/5", 
    border: "border-cyan-500/40", 
    glow: "group-hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]", 
    delay: 0.5 
  },
]

export function TechStack() {
  return (
    <section className="pt-32 pb-16 px-6 relative z-10 w-full">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Animated Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <span className="text-foreground/50 font-mono tracking-widest uppercase text-sm mb-4 block font-semibold">
            Under The Hood
          </span>
          <h2 className="text-4xl md:text-5xl font-bold">
            Powered by <GradientText variant="accent">Advanced Tech</GradientText>
          </h2>
        </motion.div>

        {/* Floating Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 w-full">
          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.6, 
                delay: tech.delay, 
                type: "spring", 
                stiffness: 100 
              }}
              className="relative group h-full cursor-pointer"
            >
              {/* Continuous Floating Animation */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ 
                  duration: 4 + tech.delay, // varying speeds so they aren't fully synchronized
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="h-full"
              >
                <div 
                  className={`relative h-full w-full rounded-3xl p-8 border ${tech.border} bg-gradient-to-br ${tech.bg} backdrop-blur-md transition-all duration-500 ${tech.glow} hover:-translate-y-2 overflow-hidden`}
                >
                  {/* Hover Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-[100%] group-hover:translate-y-[0%]"></div>
                  
                  <div className="relative z-10 flex flex-col items-center text-center h-full justify-center">
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">{tech.name}</h3>
                    <p className="text-white/60 font-medium text-sm uppercase tracking-widest">{tech.category}</p>
                  </div>
                  
                  {/* Decorative glowing dot in corner */}
                  <div className="absolute top-6 right-6 flex items-center justify-center w-3 h-3">
                    <div className="absolute w-full h-full bg-white/30 rounded-full group-hover:animate-ping"></div>
                    <div className="relative w-1.5 h-1.5 bg-white/70 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
