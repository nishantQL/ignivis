"use client"

import React, { useState, useEffect } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"

export function Navbar() {
  const router = useRouter()
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const checkAuth = () => {
    setIsAuthenticated(!!localStorage.getItem("ignivis_token"))
  }

  useEffect(() => {
    checkAuth()
    window.addEventListener("auth_change", checkAuth)
    return () => window.removeEventListener("auth_change", checkAuth)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("ignivis_token")
    setIsAuthenticated(false)
    router.push("/login")
  }

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md border-b border-white/10 shadow-lg" : "bg-transparent bg-gradient-to-b from-background/80 to-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => router.push('/')}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-500 shadow-[0_0_15px_rgba(255,69,0,0.5)] group-hover:scale-110 transition-transform"></div>
          <span className="text-xl md:text-2xl font-black tracking-widest text-white">IGNIVIS</span>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3 md:gap-4">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" className="text-foreground/80 hover:text-white" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="primary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-foreground/80 hover:text-white hidden sm:flex" onClick={() => router.push('/login')}>
                Login
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push('/register')}>
                Register
              </Button>
            </>
          )}
        </div>

      </div>
    </motion.header>
  )
}
