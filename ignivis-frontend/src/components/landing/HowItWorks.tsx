"use client"

import React from "react"
import { motion } from "framer-motion"
import { GradientText } from "@/components/ui/GradientText"

const steps = [
  { num: "01", title: "Input Data", desc: "Share your age, gender, and recent lifestyle habits." },
  { num: "02", title: "Scan Environment", desc: "Auto-detect location for granular weather algorithms." },
  { num: "03", title: "Analyze Physiology", desc: "Input heart rate & body temp markers." },
  { num: "04", title: "Detect Facial Stress", desc: "A brief webcam scan for optical exhaustion signs." },
  { num: "05", title: "Generate Intelligence", desc: "Receive immediate predictions & action plans." },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          
          <div className="md:w-1/2">
            <motion.h2 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold leading-tight mb-6"
            >
              How <GradientText>Ignivis</GradientText> Work Flow Integrates
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-foreground/70 text-lg mb-8"
            >
              Five simple steps to get a comprehensive, medical-grade estimation of your immediate heat stress risk profile.
            </motion.p>
          </div>

          <div className="md:w-1/2 relative w-full border-l border-white/10 pl-8 space-y-12">
            {steps.map((step, idx) => (
              <motion.div 
                key={step.num}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.15 }}
                className="relative"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-background border-4 border-primary z-10"></div>
                
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <span className="text-primary/70 font-mono text-xl">{step.num}</span> 
                  {step.title}
                </h3>
                <p className="text-foreground/60 mt-2">{step.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
