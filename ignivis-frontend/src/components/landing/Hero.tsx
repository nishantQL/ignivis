"use client"

import React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { GradientText } from "@/components/ui/GradientText"
import { Activity, ThermometerSun, ShieldAlert } from "lucide-react"
import { useRouter } from "next/navigation"

export function Hero() {
  const router = useRouter()

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center p-6 text-center">


      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] bg-accent/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent via-background/40 to-transparent z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          <span className="text-sm font-medium tracking-wide text-foreground/80">LIVE HEAT STRESS INTELLIGENCE</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-6"
        >
          Predict Heat Stress <br className="hidden md:block" />
          <GradientText>Before It Hits You</GradientText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-foreground/70 max-w-2xl mb-12"
        >
          An active AI-powered system combining climate data, physiological monitoring,
          and vision intelligence to protect you from extreme heat conditions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button size="lg" className="group text-lg" onClick={() => router.push('/analysis')}>
            Start Analysis
            <ShieldAlert className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See How it Works
          </Button>
        </motion.div>

      </div>
    </section>
  )
}
