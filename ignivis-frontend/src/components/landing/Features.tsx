"use client"

import React from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/GlassCard"
import { ThermometerSun, HeartPulse, ScanFace, BrainCircuit } from "lucide-react"

const features = [
  {
    icon: <ThermometerSun className="w-8 h-8 text-orange-500" />,
    title: "Environmental Intelligence",
    description: "Real-time analysis of temperature, humidity, AQI, and UV index based on your exact location."
  },
  {
    icon: <HeartPulse className="w-8 h-8 text-red-500" />,
    title: "Physiological Monitoring",
    description: "Evaluates your core body temperature and heart rate to determine internal stress levels."
  },
  {
    icon: <ScanFace className="w-8 h-8 text-accent" />,
    title: "Face Stress Detection",
    description: "Uses Deep Learning & OpenCV to analyze facial signs of exhaustion, dehydration, and fatigue."
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-purple-500" />,
    title: "AI Decision Engine",
    description: "Synthesizes all modal inputs through a unified algorithm to deliver a personalized risk score."
  }
]

export function Features() {
  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Multi-Modal Data Fusion
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground/60 max-w-2xl mx-auto text-lg"
          >
            We don't just check the weather. Our system analyzes four different vectors of your context.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard hoverEffect className="h-full">
                <div className="mb-4 bg-white/5 p-3 rounded-xl inline-block">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                <p className="text-foreground/70 leading-relaxed text-sm">
                  {feat.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
