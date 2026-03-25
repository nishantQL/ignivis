from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta
import random
import time

from database import engine, get_db
import models
import auth

app = FastAPI(title="Ignivis API - AI Heat Stress Intelligence System")

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EnvironmentRequest(BaseModel):
    latitude: float | None = None
    longitude: float | None = None
    city: str | None = None

class PhysiologicalRequest(BaseModel):
    body_temperature: float
    heart_rate: int

class FinalScoreRequest(BaseModel):
    env_score: float
    phys_score: float
    face_score: float
    age: int
    gender: str
    water_intake: int
    sleep_duration: int


@app.get("/")
def read_root():
    return {"message": "Welcome to Ignivis AI API"}

# --- AUTHENTICATION ROUTES ---

@app.post("/api/auth/register", response_model=auth.UserResponse)
def register_user(user: auth.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=auth.Token)
def login_for_access_token(user_cred: auth.UserCreate, db: Session = Depends(get_db)):
    # We use UserCreate loosely here to catch email/username + password
    # Typically frontend sends email and password
    db_user = db.query(models.User).filter(models.User.email == user_cred.email).first()
    if not db_user or not auth.verify_password(user_cred.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.email, "username": db_user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- ML ENDPOINTS ---

@app.post("/api/environment")
async def get_environment_score(req: EnvironmentRequest):
    # Mocking ML model for environmental score based on location
    # In reality, this would fetch weather data, AQI, UV, Temp, Humidity
    time.sleep(1) # Simulate network/processing delay
    score = random.uniform(20.0, 85.0)
    return {
        "env_score": round(score, 1),
        "details": {
            "temperature": round(random.uniform(25.0, 42.0), 1),
            "humidity": random.randint(30, 90),
            "aqi": random.randint(20, 150),
            "uv_index": round(random.uniform(3.0, 11.0), 1)
        }
    }

@app.post("/api/physiological")
async def get_physiological_score(req: PhysiologicalRequest):
    # Mocking physiological stress score
    time.sleep(0.5)
    
    # Base risk derived from inputs (simple heuristic for mock)
    risk = 0
    if req.body_temperature > 37.5:
        risk += 30
    if req.heart_rate > 100:
        risk += 30
        
    score = min(100.0, risk + random.uniform(5.0, 20.0))
    
    return {
        "phys_score": round(score, 1)
    }

@app.post("/api/face")
async def analyze_face_stress(file: UploadFile = File(...)):
    # Mocking OpenCV Face Stress Detection
    time.sleep(2) # Simulate image processing
    
    # Randomly generate face stress score for mockup
    score = random.uniform(10.0, 45.0)
    
    return {
        "face_score": round(score, 1),
        "filename": file.filename
    }

@app.post("/api/final")
async def get_final_score(req: FinalScoreRequest):
    # Calculate final heat stress score
    time.sleep(1)
    
    # Simple weighted average for mock
    base_score = (req.env_score * 0.4) + (req.phys_score * 0.4) + (req.face_score * 0.2)
    
    # Lifestyle adjustments
    lifestyle_modifier = 0
    if req.water_intake < 2:
        lifestyle_modifier += 15
    elif req.water_intake >= 4:
        lifestyle_modifier -= 10
        
    if req.sleep_duration < 6:
        lifestyle_modifier += 10
        
    final_score = base_score + lifestyle_modifier
    final_score = max(0.0, min(100.0, final_score)) # Clamp between 0-100
    
    # Determine risk category
    if final_score < 40:
        risk_category = "Safe"
        summary = "You are currently at a low risk of heat stress. Maintain your hydration levels."
        alerts = []
        recommendations = ["Drink water periodically", "Wear light clothing"]
    elif final_score < 75:
        risk_category = "Moderate"
        summary = "You are at moderate risk of heat stress. Elevated environmental or physiological indicators present."
        alerts = ["Risk of dehydration"]
        recommendations = ["Drink 500ml of water immediately", "Seek a shaded or cool area", "Avoid strenuous physical activity"]
    else:
        risk_category = "High"
        summary = "You are at HIGH risk of heat stress! Immediate action is required."
        alerts = ["Avoid outdoor exposure completely", "Elevated heart stress potential", "High risk of heat exhaustion"]
        recommendations = ["Move to an air-conditioned room", "Drink electrolytes if possible", "Take rest immediately"]

    return {
        "final_score": round(final_score, 1),
        "risk_category": risk_category,
        "summary": summary,
        "alerts": alerts,
        "recommendations": recommendations,
        "action_plan": [
            {"time": "Now", "action": recommendations[0]},
            {"time": "Next 1 Hour", "action": "Monitor body temperature and rest."},
            {"time": "Next 2-4 Hours", "action": "Avoid exertion and stay hydrated."}
        ]
    }
