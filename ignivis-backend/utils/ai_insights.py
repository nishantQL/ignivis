import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

load_dotenv()

# Configure the API key
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

# The model initialization
# Falling back to gemini-2.5-flash because gemini-1.5-flash has region unavailability causing 404 strings.
try:
    model = genai.GenerativeModel("gemini-2.5-flash")
except Exception as e:
    model = None

def fallback_insights(data):
    if data.get("final_score", 0) < 30:
        risk = "Safe"
        summary = "Low heat stress risk. Maintain hydration."
    elif data.get("final_score", 0) < 60:
        risk = "Moderate"
        summary = "Moderate heat stress detected. Take precautions."
    else:
        risk = "High"
        summary = "High heat stress risk. Immediate action required. Gemini Quota Offline."

    return {
        "summary": summary,
        "risk_level": risk,
        "root_cause": "Environmental and physiological factors combined",
        "alerts": ["Monitor hydration", "Avoid heat exposure"],
        "recommendations": ["Drink water", "Rest in cool area"],
        "action_plan": [
            {"time": "Now", "action": "Drink water"},
            {"time": "Next Hour", "action": "Rest and monitor"}
        ]
    }

def generate_ai_insights(data):
    if not model or not api_key:
        return fallback_insights(data)
        
    prompt = f"""
    You are an elite, highly-detailed occupational health AI assistant analyzing multi-modal heat stress telemetry.
    Generate a comprehensive, highly-personalized report based strictly on the following biomarker and environmental analytics:

    Final Aggregate Risk Score: {data.get('final_score', 0)}/100
    External Environment Heat Metric: {data.get('env_score', 0)}/100
    Internal Physiological Strain: {data.get('phys_score', 0)}/100
    Facial Optical Exhaustion: {data.get('face_score', 0)}/100
    Skin Thermal Variance: {data.get('skin_score', 0)}/100
    Sleep Deficit: {data.get('sleep', 7)} cumulative hours
    Hydration Profile: {data.get('water', 2)} liters consumed
    Age: {data.get('age', 30)}
    Gender: {data.get('gender', 'unknown')}

    Return your output EXACTLY matching this JSON structure, ensuring the text is conversational, highly detailed, and medical-grade:
    {{
      "summary": "Write a highly detailed, empathetic 3-to-4 sentence paragraph deeply explaining their exact systemic heat-stress situation and tying together the metrics.",
      "risk_level": "Safe | Moderate | High",
      "root_cause": "Write a full 2-sentence explanation detailing exactly which specific metric (environment vs physiology vs vision) is independently driving their risk score.",
      "alerts": [
        "A highly detailed, 12-word critical alert regarding a specific metric anomaly.",
        "A specific, detailed warning regarding their hydration deficit, sleep deprivation, or ambient temperature."
      ],
      "recommendations": [
        "A detailed, personalized lifestyle adaptation regarding their sleep schedule or water intake pacing.",
        "A specific biological or environmental mitigation tactic to stabilize their thermal skin variance."
      ],
      "action_plan": [
        {{"time": "Now", "action": "A very specific, highly-detailed immediate protocol to execute right now to drop core temperature."}},
        {{"time": "Next 1 Hour", "action": "A detailed follow-up behavioral action to maintain stabilization."}},
        {{"time": "Next 2-4 Hours", "action": "A long-term stabilizing directive to permanently exit heat stress."}}
      ]
    }}
    
    Ensure NO markdown backticks like ```json wrapper in the output string. Output only raw JSON.
    """
    
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up markdown formatting if Gemini includes it
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
            
        if text.endswith("```"):
            text = text[:-3]
            
        return json.loads(text.strip())
    except Exception as e:
        print("Gemini API Error:", e)
        return fallback_insights(data)
