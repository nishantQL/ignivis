"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"
import Webcam from "react-webcam"
import { MapPin, Camera, Activity, User, ArrowRight, Loader2 } from "lucide-react"

export default function AnalysisPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem("ignivis_token")) {
      router.push("/login")
    }
  }, [router])
  
  // Form State
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

  // Mock processing for steps
  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      submitAnalysis()
    }
  }

  const submitAnalysis = async () => {
    setLoading(true)
    // Simulate API calls and redirect to dashboard
    try {
      // In a real app we'd call the FastAPI endpoints here
      // /api/environment
      // /api/face
      // /api/physiological
      // /api/final
      
      // For now we simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save data locally to retrieve in dashboard (simplified state transfer)
      if (typeof window !== "undefined") {
        localStorage.setItem("ignivis_analysis", JSON.stringify(formData))
        router.push("/dashboard")
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  // Geolocation
  const requestLocation = () => {
    setLoading(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }))
          setLoading(false)
          nextStep()
        },
        (error) => {
          console.error("Error getting location", error)
          setLoading(false)
          // proceed anyway with manual or default
          nextStep()
        }
      )
    } else {
      setLoading(false)
      nextStep()
    }
  }

  // Webcam Capture
  const webcamRef = React.useRef<Webcam>(null)
  const captureFace = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setFormData(prev => ({ ...prev, faceImageBase64: imageSrc }))
      // Auto advance after short delay to show captured image
      setTimeout(() => nextStep(), 1500)
    }
  }, [webcamRef])

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
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
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
                    {loading ? "Detecting..." : "Detect Location automatically"}
                  </Button>
                  <button onClick={nextStep} className="text-sm text-foreground/40 hover:text-white transition-colors">
                    Skip or enter manually
                  </button>
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
                        <span className="font-semibold text-white tracking-widest">ANALYZING...</span>
                      </div>
                    )}
                    
                    {!formData.faceImageBase64 && (
                       <div className="absolute inset-x-0 top-1/2 h-[2px] bg-accent/50 animate-pulse-slow w-full" style={{boxShadow: "0 0 10px #3b82f6"}}></div>
                    )}
                  </div>

                  {!formData.faceImageBase64 ? (
                    <Button variant="outline" className="w-full" onClick={captureFace}>
                      <Camera className="mr-2 w-4 h-4" /> Capture Face
                    </Button>
                  ) : (
                    <Button disabled className="w-full bg-white/10 border-none text-white/50">
                      Processing...
                    </Button>
                  )}
                  
                  <button onClick={nextStep} className="text-sm text-foreground/40 hover:text-white transition-colors">
                    Skip Face Scan
                  </button>
                </div>
              )}

              {/* STEP 4: PHYSIOLOGICAL */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Physiological Markers</h2>
                    <p className="text-foreground/60 text-sm">Input your current body temperature and resting heart rate.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Body Temperature (°C): {formData.bodyTemperature.toFixed(1)}</label>
                      <input 
                        type="range" min="35.0" max="42.0" step="0.1"
                        value={formData.bodyTemperature}
                        onChange={(e) => setFormData({...formData, bodyTemperature: Number(e.target.value)})}
                        className="w-full accent-red-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Heart Rate (BPM): {formData.heartRate}</label>
                      <input 
                        type="range" min="40" max="200" step="1"
                        value={formData.heartRate}
                        onChange={(e) => setFormData({...formData, heartRate: Number(e.target.value)})}
                        className="w-full accent-red-500"
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400" 
                    onClick={submitAnalysis}
                    isLoading={loading}
                  >
                    {loading ? "Generating Intelligence..." : "Generate Final Risk Score"}
                  </Button>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
