import React from "react"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"
import { Button } from "@/components/ui/Button"

export function Footer() {
  return (
    <footer className="w-full relative z-10 overflow-hidden pb-8 mt-12">
      {/* Soft Connection Gradient to blend with TechStack */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-orange-500"></div>
              <span className="text-xl font-black tracking-widest text-white">IGNIVIS</span>
            </div>
            <p className="text-foreground/60 text-sm leading-relaxed mb-6">
              Empowering individuals with AI-driven heat stress intelligence to ensure safety and well-being in changing climates.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-foreground/40 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-foreground/40 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/in/divya-vashistha-073255345/" className="text-foreground/40 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide">Platform</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-foreground/60 hover:text-primary transition-colors text-sm">How it Works</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-primary transition-colors text-sm">Intelligence Engine</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-primary transition-colors text-sm">Physiological Models</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-primary transition-colors text-sm">API Documentation</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 tracking-wide">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-foreground/60 hover:text-primary transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-primary transition-colors text-sm">Research Papers</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-primary transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-foreground/60 hover:text-primary transition-colors text-sm">Contact Support</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-white font-semibold mb-4 tracking-wide">Stay Updated</h3>
            <p className="text-foreground/60 text-sm mb-4">
              Subscribe to our newsletter for the latest AI health research.
            </p>
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              <Button size="sm" className="w-full">Subscribe</Button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-foreground/40 text-sm">
            © {new Date().getFullYear()} Ignivis Intelligence. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-foreground/40 hover:text-white transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-foreground/40 hover:text-white transition-colors text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
