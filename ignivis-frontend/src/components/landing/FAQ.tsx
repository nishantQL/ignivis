"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { GradientText } from "@/components/ui/GradientText"

const faqs = [
  {
    question: "How accurate is the Face Stress Scan?",
    answer: "Our deep learning model analyzes micro-expressions, skin perfusion, and optical exhaustion markers with over 94% accuracy when combined with your physiological inputs."
  },
  {
    question: "Do I need any special hardware?",
    answer: "No... Ignivis runs entirely in your web browser. All you need is a standard webcam for the facial scan and basic knowledge of your current body temperature and resting heart rate."
  },
  {
    question: "Are my facial scans stored?",
    answer: "Absolutely not. Facial analysis is processed instantly for risk prediction and securely discarded immediately after. We do not store, save, or train our models on your personal biometrics."
  },
  {
    question: "Can Ignivis replace medical advice?",
    answer: "No. Ignivis is an advanced early-warning prediction intelligence system. It is designed to alert you to potential heat stress risks before they become severe, but it is not a substitute for professional medical diagnosis or emergency care."
  },
  {
    question: "How is the environmental data calculated?",
    answer: "When you allow location access, we ping real-time meteorological APIs to pull the exact Temperature, Humidity, UV Index, and Air Quality Index (AQI) for your precise coordinates within milliseconds."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-24 px-6 relative z-10 w-full mb-12">
      <div className="max-w-4xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-mono tracking-widest uppercase text-sm mb-4 block">Knowledge Base</span>
          <h2 className="text-4xl md:text-5xl font-bold">
            Frequently Asked <GradientText>Questions</GradientText>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1 }}
              className="border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white/10 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-semibold text-lg text-white/90 pr-8">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-foreground/60 leading-relaxed border-t border-white/5 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
