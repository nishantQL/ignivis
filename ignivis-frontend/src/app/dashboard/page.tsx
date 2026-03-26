"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { MetricGauge } from "@/components/ui/MetricGauge"
import { GlassCard } from "@/components/ui/GlassCard"
import { Button } from "@/components/ui/Button"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, CloudLightning, Droplets, HeartPulse, ShieldAlert, BrainCircuit, ScanFace, MapPin, Activity } from "lucide-react"

// Expected backend response structure
interface FinalResponse {
  final_score: number
  risk_category: string
  summary: string
  root_cause?: string
  alerts: string[]
  recommendations: string[]
  action_plan: { time: string, action: string }[]
}

export default function DashboardPage() {
  const router = useRouter()
  // @ts-ignore
  const [params, setParams] = useState<any>(null)

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search))

    // Auth Protection
    if (!localStorage.getItem("ignivis_token")) {
      router.push("/login")
    }
  }, [router])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [scores, setScores] = useState({
    env: 0,
    phys: 0,
    face: 0,
    skin: 0
  })

  const [results, setResults] = useState<FinalResponse | null>(null)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const storedData = localStorage.getItem("ignivis_analysis")
        if (!storedData) {
          router.push('/analysis')
          return
        }

        const data = JSON.parse(storedData)

        setScores({
          env: data.env,
          phys: data.phys,
          face: data.face,
          skin: data.skin
        })

        // Fetch dynamic AI reasoning based on raw scores
        const aiRes = await fetch("http://localhost:8000/api/ai-insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            final_score: data.final.final_score,
            env_score: data.env,
            phys_score: data.phys,
            face_score: data.face,
            skin_score: data.skin,
            sleep: data.sleep || 7,
            water: data.water || 2.0,
            age: data.age || 30,
            gender: data.gender || "male"
          })
        })
        if (!aiRes.ok) throw new Error("AI Reasoning Engine Offline")
        const aiData = await aiRes.json()

        setResults({
          final_score: data.final.final_score,
          risk_category: aiData.risk_level,
          summary: aiData.summary,
          root_cause: aiData.root_cause,
          alerts: aiData.alerts,
          recommendations: aiData.recommendations,
          action_plan: aiData.action_plan
        })

        // Fetch User History
        try {
            const token = localStorage.getItem("ignivis_token");
            const histRes = await fetch("http://localhost:8000/api/history", {
            headers: { "Authorization": `Bearer ${token}` }
          })
          if (histRes.ok) {
            const histData = await histRes.json()
            setHistory(histData)
          }
        } catch (e) {
          console.error("History fetch error", e)
        }

      } catch (err) {
        console.error(err)
        setError("Failed to load Intelligence Engine results. Please run analysis again.")
      } finally {
        setLoading(false)
      }
    }

    // Minimum delay to establish connection effect
    setTimeout(() => {
      loadAnalysis()
    }, 1500)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-primary animate-spin"></div>
          <BrainCircuit className="w-12 h-12 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold tracking-widest text-white/90">ANALYZING YOUR CONDITION...</h2>
        <p className="text-foreground/50 mt-2 max-w-sm">Generating AI Health Insights using Gemini pro...</p>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold mb-4">Intelligence Engine Offline</h2>
        <p className="text-foreground/60 max-w-md mb-8">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry Connection</Button>
      </div>
    )
  }

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase() || "") {
      case "safe": return "text-green-500"
      case "moderate": return "text-yellow-500"
      case "high": return "text-red-500"
      default: return "text-primary"
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 max-w-7xl mx-auto space-y-8">

      {/* Header & Main Score Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Metric Card */}
        <GlassCard className="col-span-1 flex flex-col items-center justify-center py-10 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          <h2 className="text-lg font-semibold text-foreground/60 uppercase tracking-widest mb-6">Overall Risk Index</h2>

          <MetricGauge
            value={results.final_score}
            max={100}
            size={240}
            strokeWidth={18}
            label={results.risk_category}
            className="mb-6"
          />

          <div className={`mt-2 flex items-center gap-2 font-bold text-lg ${getRiskColor(results.risk_category || "")}`}>
            {results.risk_category?.toLowerCase() === "high" && <ShieldAlert className="w-6 h-6 animate-pulse" />}
            {results.risk_category?.toLowerCase() === "moderate" && <AlertCircle className="w-6 h-6" />}
            {results.risk_category?.toLowerCase() === "safe" && <CheckCircle2 className="w-6 h-6" />}
            {(results.risk_category || "UNKNOWN").toUpperCase()} RISK
          </div>
        </GlassCard>

        {/* AI Summary and Alerts */}
        <div className="col-span-1 lg:col-span-2 space-y-6 flex flex-col">
          <GlassCard className="flex-1">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BrainCircuit className="text-purple-500 w-6 h-6" />
              AI Risk Analysis & Summary
            </h3>
            <p className="text-lg leading-relaxed text-foreground/80 mb-6">
              {results.summary}
            </p>

            {results.root_cause && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5" /> Root Cause Identified:
                </h4>
                <p className="text-foreground/80 italic">{results.root_cause}</p>
              </div>
            )}

            {results.alerts.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-red-400 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" /> Critical Alerts
                </h4>
                <ul className="space-y-2">
                  {results.alerts.map((alert, i) => (
                    <li key={i} className="flex items-start gap-2 text-red-200/80">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                      {alert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </GlassCard>

          {/* Sub-scores Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlassCard className="p-4 flex flex-col items-center text-center justify-start">
              <MapPin className="text-orange-500 w-6 h-6 mb-2" />
              <div className={`text-3xl font-bold ${scores.env < 30 ? "text-green-400" : scores.env < 60 ? "text-yellow-400" : "text-red-400"}`}>
                {Math.round(scores.env)}
              </div>
              <div className="text-xs text-foreground/50 uppercase mt-1 tracking-widest font-semibold">Environment Score</div>
              <div className="mt-3 text-[10px] text-foreground/40 px-2 leading-relaxed">External heat index based on Weather API UV and Temperature data.</div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col items-center text-center justify-start">
              <HeartPulse className="text-red-500 w-6 h-6 mb-2" />
              <div className={`text-3xl font-bold ${scores.phys < 30 ? "text-green-400" : scores.phys < 60 ? "text-yellow-400" : "text-red-400"}`}>
                {Math.round(scores.phys)}
              </div>
              <div className="text-xs text-foreground/50 uppercase mt-1 tracking-widest font-semibold">Physiological Score</div>
              <div className="mt-3 text-[10px] text-foreground/40 px-2 leading-relaxed">Internal organ heat strain based on Heart Rate and core Body Temp.</div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col items-center text-center justify-start">
              <ScanFace className="text-accent w-6 h-6 mb-2" />
              <div className={`text-3xl font-bold ${scores.face + scores.skin < 30 ? "text-green-400" : scores.face + scores.skin < 60 ? "text-yellow-400" : "text-red-400"}`}>
                {Math.round(scores.face + scores.skin)}
              </div>
              <div className="text-xs text-foreground/50 uppercase mt-1 tracking-widest font-semibold">Vision & Skin Score</div>

              <div className="mt-3 w-full grid grid-cols-2 gap-2 text-[10px] text-foreground/60 border-t border-white/5 pt-3">
                <div className="flex flex-col">
                  <span className="uppercase opacity-70 mb-1">Optical Fatigue</span>
                  <span className={`font-bold text-sm ${scores.face < 15 ? "text-green-400" : scores.face < 30 ? "text-yellow-400" : "text-red-400"}`}>{Math.round(scores.face)}</span>
                </div>
                <div className="flex flex-col border-l border-white/5 pl-2">
                  <span className="uppercase opacity-70 mb-1">Thermal Redness</span>
                  <span className={`font-bold text-sm ${scores.skin < 15 ? "text-green-400" : scores.skin < 30 ? "text-yellow-400" : "text-red-400"}`}>{Math.round(scores.skin)}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Recommendations & Action Plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        <GlassCard>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Droplets className="text-cyan-400 w-6 h-6" />
            Immediate Recommendations
          </h3>
          <ul className="space-y-4">
            {results.recommendations.map((rec, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + (idx * 0.1) }}
                className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5"
              >
                <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-foreground/80">{rec}</span>
              </motion.li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-[50px]"></div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
            <CloudLightning className="text-yellow-400 w-6 h-6" />
            Timeline Action Plan
          </h3>

          <div className="relative border-l-2 border-white/10 ml-4 space-y-8 z-10">
            {results.action_plan.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (idx * 0.2) }}
                className="relative pl-6"
              >
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-yellow-500"></div>
                <h4 className="font-bold text-yellow-400 text-sm tracking-wide uppercase">{item.time}</h4>
                <p className="text-foreground/70 mt-1">{item.action}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>

      </div>

      {/* Historical Progress */}
      {history.length > 0 && (
        <GlassCard className="mt-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
             <Activity className="text-green-400 w-6 h-6" /> 
             Historical Heat Risk Trend
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-foreground/60 text-sm">
                  <th className="pb-3 px-4">Date</th>
                  <th className="pb-3 px-4">Environment</th>
                  <th className="pb-3 px-4">Physiology</th>
                  <th className="pb-3 px-4">Vision & Skin</th>
                  <th className="pb-3 px-4">Final Score</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm">
                    <td className="py-4 px-4">{new Date(record.created_at).toLocaleDateString()} {new Date(record.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td className="py-4 px-4 text-orange-400">{record.env_score.toFixed(1)}</td>
                    <td className="py-4 px-4 text-red-400">{record.phys_score.toFixed(1)}</td>
                    <td className="py-4 px-4 text-accent">{((record.face_score || 0) + (record.skin_score || 0)).toFixed(1)}</td>
                    <td className="py-4 px-4 font-bold text-white tracking-wider">{record.final_score.toFixed(1)} / 100</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
      
      <div className="flex justify-center pt-8">
        <Button variant="outline" onClick={() => router.push('/')}>
          Return to Home
        </Button>
      </div>

    </div>
  )
}
