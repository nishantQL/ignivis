"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/Button"
import { GradientText } from "@/components/ui/GradientText"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  // @ts-ignore
  const [params, setParams] = useState<any>(null)
  
  useEffect(() => {
    // Simple way to avoid next/navigation searchParams sync bug in some Next versions
    setParams(new URLSearchParams(window.location.search))
  }, [])

  const isRegistered = params?.get("registered") === "true"

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The backend expects UserCreate shape for simplicity
        body: JSON.stringify({ email: formData.email, password: formData.password, username: "login_attempt" })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.detail || "Failed to login")
      }
      
      // Store token
      localStorage.setItem("ignivis_token", data.access_token)
      // Trigger global event for navbar sync if needed, or just redirect
      window.dispatchEvent(new Event("auth_change"))
      
      router.push("/analysis")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-foreground/60 text-sm">Access the <GradientText variant="accent">Intelligence Engine</GradientText></p>
          </div>

          {isRegistered && !error && (
             <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Registration successful! Please log in.
             </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <ShieldAlert className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground/80">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="agent@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-foreground/80">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button variant="secondary" type="submit" className="w-full mt-6" isLoading={loading}>
              Secure Login <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/60">
            Need an account? <button onClick={() => router.push('/register')} className="text-accent hover:underline">Register here</button>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
