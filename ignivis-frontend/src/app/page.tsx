import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { TechStack } from "@/components/landing/TechStack"
import { Testimonials } from "@/components/landing/Testimonials"
import { FAQ } from "@/components/landing/FAQ"
import { Footer } from "@/components/layout/Footer"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Hero />
      <Features />
      <HowItWorks />
      <TechStack />
      <Testimonials />
      <FAQ />
      <Footer />
    </main>
  )
}
