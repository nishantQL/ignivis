"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"
import Webcam from "react-webcam"
import { MapPin, Camera, Activity, User, ArrowRight, Loader2 } from "lucide-react"
import { API_URL } from "@/lib/constants"

export default function AnalysisPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("ignivis_token")) {
      router.push("/login")
    }
  }, [router])
  
  // Unified Form State
  const [formData, setFormData] = useState({
    age: 30,
    gender: "male",
    waterIntake: 2,
    sleepDuration: 7,
    latitude: null as number | null,
    longitude: null as number | null,
    bodyTemperature: 37.0,
    heartRate: 75,
    faceImageBase64: null as string | null
  })

  // ML Scores State
  const [scores, setScores] = useState({
    env: 0,
    phys: 0,
    face: 0,
    skin: 0,
    faceTemp: 37.0
  })

  const nextStep = () => {
    setStep(prev => prev < 4 ? prev + 1 : prev)
  }

  const prevStep = () => {
    setStep(prev => prev > 1 ? prev - 1 : prev)
  }

  // STEP 2: Geolocation & Environment ML
  const requestLocation = async () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          
          setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }))
          
          try {
            // 1. Get Live Temperature
            const meteoRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
            const meteoData = await meteoRes.json()
            const realTemp = meteoData.current_weather?.temperature || 35.0

            // 2. Predict Environment Score
            const envRes = await fetch(`${API_URL}/api/environment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                temp: realTemp,
                humidity: 60, // Defaults requested
                uv: 5,
                aqi: 80
              })
            })
            const envData = await envRes.json()
            
            setScores(prev => ({ ...prev, env: envData.env_score }))
            setLoading(false)
            nextStep()

          } catch (err) {
            console.error("Environment API Error", err)
            setLoading(false)
            nextStep()
          }
        },
        (error) => {
          console.error("Error getting location", error)
          setLoading(false)
          nextStep()
        }
      )
    } else {
      setLoading(false)
      nextStep()
    }
  }

  // STEP 3: Face Scan ML
  const webcamRef = useRef<Webcam>(null)
  
  const captureFace = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setFormData(prev => ({ ...prev, faceImageBase64: imageSrc }))
      
      try {
        setLoading(true)
        
        // 1. Manually extract Base64 to Blob to prevent Browser Promise Freezing
        const base64Data = imageSrc.split(',')[1]
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'image/jpeg' })
        
        const fd = new FormData()
        fd.append("file", blob, "scan.jpg")
        
        // 2. Add AbortController to force throw an error if the connection hangs for more than 15s
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000)

        const faceRes = await fetch(`${API_URL}/api/face`, {
          method: "POST",
          body: fd,
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (!faceRes.ok) {
           throw new Error(`API Error: ${faceRes.status}`)
        }
        
        const faceData = await faceRes.json()
        setScores(prev => ({ 
          ...prev, 
          face: faceData.face_score,
          skin: faceData.skin_score,
          faceTemp: faceData.face_temp || 37.0
        }))
        
        // Auto-update body temp slider from face_temp inference
        setFormData(prev => ({ ...prev, bodyTemperature: faceData.face_temp || 37.0 }))
        
        setLoading(false)
        setTimeout(() => nextStep(), 1500)

      } catch (err) {
        console.error("Face API Error:", err)
        setLoading(false)
        nextStep()
      }
    }
  }, [webcamRef])

  // STEP 4: Physiological & Final ML
  const submitAnalysis = async () => {
    setLoading(true)
    try {
      // 1. Predict Physiological Score
      const physRes = await fetch(`${API_URL}/api/physiological`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body_temp: formData.bodyTemperature,
          heart_rate: formData.heartRate
        })
      })
      if (!physRes.ok) throw new Error(`Phys API Failed: ${physRes.status}`)
      
      const physData = await physRes.json()
      const finalPhysScore = physData.phys_score

      const token = localStorage.getItem("ignivis_token")
      const finalRes = await fetch(`${API_URL}/api/final`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          env: scores.env || 0.0,
          phys: finalPhysScore || 0.0,
          face: scores.face || 0.0,
          skin: scores.skin || 0.0,
          sleep: formData.sleepDuration || 7,
          water: formData.waterIntake || 2.0,
          age: formData.age || 30,
          gender: formData.gender || "unknown"
        })
      })
      if (!finalRes.ok) {
        const errorData = await finalRes.json().catch(() => ({}));
        console.error("Final API 422 Error Detailed:", errorData);
        throw new Error(`Final API Failed: ${finalRes.status}. Details: ${JSON.stringify(errorData.detail || errorData)}`);
      }
      
      const finalData = await finalRes.json()

      // 3. Save Payload for Dashboard
      const dashboardPayload = {
        final: finalData,
        env: scores.env,
        phys: finalPhysScore,
        face: scores.face,
        skin: scores.skin,
        sleep: formData.sleepDuration,
        water: formData.waterIntake,
        age: formData.age,
        gender: formData.gender
      }
      
      localStorage.setItem("ignivis_analysis", JSON.stringify(dashboardPayload))
      router.push("/dashboard")
      
    } catch (error) {
      console.error(error)
      alert("Failed to aggregate intelligence. " + error)
      setLoading(false)
    }
  }

  // --- Step Rendering ---

  const renderStepIcon = () => {
    switch(step) {
      case 1: return <User className="w-8 h-8 text-primary" />
      case 2: return <MapPin className="w-8 h-8 text-purple-500" />
      case 3: return <Camera className="w-8 h-8 text-accent" />
      case 4: return <Activity className="w-8 h-8 text-red-500" />
      default: return <User className="w-8 h-8 text-primary" />
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-6 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background elements */}
      <div className="absolute top-0 w-full h-full bg-grid-white/[0.02] bg-[size:32px]"></div>

      <div className="max-w-xl w-full relative z-10">
        
        {/* Progress header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex gap-2 w-full max-w-sm mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-primary shadow-[0_0_10px_rgba(255,69,0,0.5)]' : 'bg-white/10'}`} />
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-full backdrop-blur-md">
            {renderStepIcon()}
            <span className="font-semibold text-lg tracking-wider uppercase text-white/90">
              Step {step} of 4
            </span>
          </div>
        </div>

        {/* Step Content Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <GlassCard className="p-8 md:p-10">
              
              {/* STEP 1: USER DETAILS */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Personal Details</h2>
                    <p className="text-foreground/60 text-sm">Basic information to contextualize your physiological markers.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Age: {formData.age}</label>
                      <input 
                        type="range" min="10" max="100" 
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                        className="w-full accent-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Gender</label>
                      <select 
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      >
                        <option value="male" className="bg-zinc-900 text-white">Male</option>
                        <option value="female" className="bg-zinc-900 text-white">Female</option>
                        <option value="other" className="bg-zinc-900 text-white">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Water Intake Today: {formData.waterIntake} Liters</label>
                      <input 
                        type="range" min="0" max="6" step="0.5"
                        value={formData.waterIntake}
                        onChange={(e) => setFormData({...formData, waterIntake: Number(e.target.value)})}
                        className="w-full accent-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Sleep Last Night: {formData.sleepDuration} Hours</label>
                      <input 
                        type="range" min="0" max="12" step="0.5"
                        value={formData.sleepDuration}
                        onChange={(e) => setFormData({...formData, sleepDuration: Number(e.target.value)})}
                        className="w-full accent-primary"
                      />
                    </div>
                  </div>

                  <Button className="w-full mt-6" onClick={nextStep}>
                    Next Step <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* STEP 2: LOCATION */}
              {step === 2 && (
                <div className="space-y-6 text-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Climate Intelligence</h2>
                    <p className="text-foreground/60 text-sm">We need your location to access live API data for Temperature, Humidity, AQI, and UV Index.</p>
                  </div>
                  
                  <div className="py-8 flex justify-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse-slow">
                        <MapPin className="w-10 h-10 text-purple-400" />
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="secondary" 
                    className="w-full" 
                    onClick={requestLocation}
                    isLoading={loading}
                  >
                    {loading ? "Detecting & Modeling..." : "Detect Location automatically"}
                  </Button>
                  <div className="flex justify-between items-center mt-4 px-2">
                    <button onClick={prevStep} className="text-sm text-foreground/40 hover:text-white transition-colors">
                      ← Back
                    </button>
                    <button onClick={nextStep} className="text-sm text-foreground/40 hover:text-white transition-colors">
                      Skip or enter manually →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: FACE SCAN */}
              {step === 3 && (
                <div className="space-y-6 text-center">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Face Stress Scan</h2>
                    <p className="text-foreground/60 text-sm">Using deep learning to detect visual markers of exhaustion.</p>
                  </div>
                  
                  <div className="relative rounded-2xl overflow-hidden border-2 border-white/10 bg-black aspect-video flex items-center justify-center auto-cols-auto">
                    {formData.faceImageBase64 ? (
                       // eslint-disable-next-line @next/next/no-img-element
                      <img src={formData.faceImageBase64} alt="Captured face" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {formData.faceImageBase64 && (
                      <div className="absolute inset-0 bg-accent/20 flex flex-col items-center justify-center backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 text-white animate-spin mb-4" />
                        <span className="font-semibold text-white tracking-widest">ANALYZING IN OPENCV...</span>
                      </div>
                    )}
                    
                    {!formData.faceImageBase64 && (
                       <div className="absolute inset-x-0 top-1/2 h-[2px] bg-accent/50 animate-pulse-slow w-full" style={{boxShadow: "0 0 10px #3b82f6"}}></div>
                    )}
                  </div>

                  {!formData.faceImageBase64 ? (
                    <Button variant="outline" className="w-full" onClick={captureFace} isLoading={loading}>
                      {loading ? "Processing Inference..." : <><Camera className="mr-2 w-4 h-4" /> Capture Face</>}
                    </Button>
                  ) : (
                    <div className="flex gap-4 w-full">
                      <Button variant="outline" className="flex-1 border-white/20 hover:bg-white/10" disabled={loading} onClick={() => {
                        setFormData(prev => ({...prev, faceImageBase64: null}))
                        setScores(prev => ({...prev, face: 0, skin: 0, faceTemp: 37.0}))
                      }}>
                         Retake Photo
                      </Button>
                      <Button disabled className="flex-1 bg-green-500/20 text-green-400 border-none cursor-not-allowed">
                        {loading ? "Processing..." : "Captured ✓"}
                      </Button>
                    </div>
                  )}
                  
                  {scores.face > 0 && (
                    <div className="text-sm text-primary font-mono mt-2 animate-pulse">
                      ML Scanned Face Heat: {Number(scores.faceTemp || 37.0).toFixed(1)} Unit
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 px-2">
                    <button onClick={prevStep} className="text-sm text-foreground/40 hover:text-white transition-colors">
                      ← Back
                    </button>
                    <button onClick={nextStep} className="text-sm text-foreground/40 hover:text-white transition-colors">
                      Skip Face Scan →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PHYSIOLOGICAL */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Physiological Markers</h2>
                    <p className="text-foreground/60 text-sm">Input your current body temperature and resting heart rate. (Auto-adjusted if Face Scan completed)</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Body Temperature (°C): {Number(formData.bodyTemperature || 37.0).toFixed(1)}</label>
                      <input 
                        type="range" min="30.0" max="45.0" step="0.1"
                        value={formData.bodyTemperature}
                        onChange={(e) => setFormData({...formData, bodyTemperature: Number(e.target.value)})}
                        className="w-full accent-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Heart rate (BPM): {formData.heartRate}</label>
                      <input 
                        type="range" min="40" max="200" step="1"
                        value={formData.heartRate}
                        onChange={(e) => setFormData({...formData, heartRate: Number(e.target.value)})}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button variant="outline" disabled={loading} onClick={prevStep} className="flex-none px-6 text-white/80">
                      Back
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white" 
                      onClick={submitAnalysis}
                      isLoading={loading}
                    >
                      {loading ? "Aggregating ML..." : "Generate Final Risk Score"}
                    </Button>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
