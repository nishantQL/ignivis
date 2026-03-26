from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from pydantic import BaseModel
import numpy as np
import gc

from services.ml_service import predict_env, predict_phys, predict_face, predict_skin
from utils.image_processing import process_face_image

router = APIRouter()

# --- Request Models ---

class EnvironmentRequest(BaseModel):
    temp: float = 35.0
    humidity: float = 60.0
    uv: float = 5.0
    aqi: float = 80.0

class PhysiologicalRequest(BaseModel):
    body_temp: float = 37.0
    heart_rate: int = 75

# --- Endpoints ---

@router.post("/environment")
async def analyze_environment(req: EnvironmentRequest):
    features = np.array([[req.temp, req.humidity, req.uv, req.aqi]])
    score = float(predict_env(features)[0])
    
    # Explicitly clear features array for memory
    del features
    gc.collect()
    
    return { "env_score": round(score, 1) }

@router.post("/physiological")
async def analyze_physiological(req: PhysiologicalRequest):
    respiratory_rate = req.heart_rate / 4.0
    spo2 = 96.0
    features = np.array([[req.body_temp, req.heart_rate, respiratory_rate, spo2]])
    score = float(predict_phys(features)[0])
    
    del features
    gc.collect()
    
    return { "phys_score": round(score, 1) }

@router.post("/face")
async def analyze_face_stress(file: UploadFile = File(...)):
    contents = await file.read()
    
    # Use optimized image processing service
    mean_val, std_val, max_val, var_val = process_face_image(contents)
    
    # Free binary contents RAM
    del contents
    
    if mean_val is None:
        raise HTTPException(status_code=400, detail="Invalid image file or processing failure")

    # 1. Face Score Prediction
    face_features = np.array([[mean_val, std_val, max_val]])
    face_score = float(predict_face(face_features)[0])

    # 2. Skin Score Prediction 
    skin_features = np.array([[mean_val, var_val]])
    skin_score = float(predict_skin(skin_features)[0])

    # 3. Cleanup
    del face_features
    del skin_features
    gc.collect()

    return {
        "face_score": round(face_score, 1),
        "skin_score": round(skin_score, 1),
        "face_temp": round(mean_val, 1)
    }
