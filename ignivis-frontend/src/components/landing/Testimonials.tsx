"use client"

import React from "react"
import { motion } from "framer-motion"
import { GradientText } from "@/components/ui/GradientText"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Dr. Elena Rostova",
    role: "Occupational Health Specialist",
    content: "Ignivis completely bridges the gap between environmental monitoring and actual human physiological response. It's an indispensable early-warning tool for outdoor workers.",
    rating: 5,
    avatarColor: "bg-blue-500"
  },
  {
    name: "Marcus Chen",
    role: "Marathon Athlete",
    content: "I use this system before my intense summer training sessions. The facial stress scan picked up on my exhaustion markers before I even consciously felt symptoms. Incredible tech.",
    rating: 5,
    avatarColor: "bg-orange-500"
  },
  {
    name: "Sarah Jenkins",
    role: "Site Safety Manager",
    content: "The action plans generated are highly specific and immediate. We've integrated Ignivis as a mandatory check for our construction operators during heatwaves.",
    rating: 5,
    avatarColor: "bg-purple-500"
  },
  {
    name: "Dr. James Aris",
    role: "Climate Researcher",
    content: "Combining localized hyper-granular weather APIs directly with biometric inputs is exactly the direction proactive predictive health needs to go.",
    rating: 5,
    avatarColor: "bg-teal-500"
  }
]

export function Testimonials() {
  return (
    <section className="py-24 px-6 relative z-10 w-full overflow-hidden">
      {/* Background glow specific to this section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-accent font-mono tracking-widest uppercase text-sm mb-4 block animate-pulse">Wall of Love</span>
          <h2 className="text-4xl md:text-5xl font-bold">
            Trusted by <GradientText variant="accent">Professionals</GradientText>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -5 }}
              className="relative p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-lg shadow-2xl group"
            >
              <Quote className="absolute top-6 right-8 w-12 h-12 text-white/5 -z-10 group-hover:text-accent/10 transition-colors duration-500" />
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              
              <p className="text-foreground/80 leading-relaxed text-lg mb-8 italic">
                "{t.content}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className={`w-12 h-12 rounded-full ${t.avatarColor} flex items-center justify-center shadow-lg`}>
                  <span className="text-white font-bold text-lg">{t.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="text-white font-bold">{t.name}</h4>
                  <p className="text-foreground/50 text-sm tracking-wide">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
