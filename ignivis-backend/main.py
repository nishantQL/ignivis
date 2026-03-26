from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta
import random
import time
import cv2
import numpy as np

from database import engine, get_db
import models
import auth
import os
import joblib

from utils.download_models import download_skin_model

# Run Google Drive Downloader immediately upon boot
download_skin_model()

# Systematically load all ML Models statically into Server State Memory
print("[Ignivis State] Loading ML Models into RAM...")
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "models"))
env_model = joblib.load(os.path.join(MODELS_DIR, "environment_model.joblib"))
phys_model = joblib.load(os.path.join(MODELS_DIR, "heat_stress_model.joblib"))
face_model = joblib.load(os.path.join(MODELS_DIR, "face_temp_fatigue_heatmap_model.joblib"))
skin_model = joblib.load(os.path.join(MODELS_DIR, "stress_skin_model.joblib"))
print("[Ignivis State] All Models Activated.")

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

# JWT Security Definition
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            raise credentials_exception
        token_data = auth.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    body = await request.body()
    print(f"=== 422 VALIDATION ERROR ===")
    print(f"Errors: {exc.errors()}")
    print(f"Body Payload: {body.decode()}")
    print(f"============================")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body.decode()}
    )

class EnvironmentRequest(BaseModel):
    temp: float
    humidity: float
    uv: float
    aqi: float

class PhysiologicalRequest(BaseModel):
    body_temp: float
    heart_rate: int

class FinalScoreRequest(BaseModel):
    env: float
    phys: float
    face: float
    skin: float
    sleep: int
    water: float
    age: int
    gender: str

class AiInsightsRequest(BaseModel):
    final_score: float
    env_score: float
    phys_score: float
    face_score: float
    skin_score: float
    sleep: int
    water: float
    age: int
    gender: str


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
    windspeed = 5.0
    features = np.array([[req.temp, req.humidity, windspeed, req.uv]])
    score = float(env_model.predict(features)[0])
    return { "env_score": round(score, 1) }

@app.post("/api/physiological")
async def get_physiological_score(req: PhysiologicalRequest):
    respiratory_rate = req.heart_rate / 4.0
    spo2 = 96.0
    features = np.array([[req.body_temp, req.heart_rate, respiratory_rate, spo2]])
    score = float(phys_model.predict(features)[0])
    return { "phys_score": round(score, 1) }

@app.post("/api/face")
async def analyze_face_stress(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)

    if len(faces) == 0:
        face_crop = gray
    else:
        x, y, w, h = faces[0]
        face_crop = gray[y:y+h, x:x+w]

    mean_val = float(np.mean(face_crop))
    std_val = float(np.std(face_crop))
    max_val = float(np.max(face_crop))
    var_val = float(np.var(face_crop))

    face_features = np.array([[mean_val, std_val, max_val]])
    face_score = float(face_model.predict(face_features)[0])

    skin_features = np.array([[mean_val, var_val]])
    skin_score = float(skin_model.predict(skin_features)[0])

    return {
        "face_score": round(face_score, 1),
        "skin_score": round(skin_score, 1),
        "face_temp": round(mean_val, 1)
    }

@app.post("/api/ai-insights")
def get_ai_insights(req: AiInsightsRequest):
    from utils.ai_insights import generate_ai_insights
    return generate_ai_insights(req.model_dump())

@app.post("/api/final")
async def get_final_score(req: FinalScoreRequest, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    base_score = (req.env * 0.3) + (req.phys * 0.4) + (req.face * 0.15) + (req.skin * 0.15)
    
    lifestyle_modifier = 0
    if req.water < 2: lifestyle_modifier += 15
    elif req.water >= 4: lifestyle_modifier -= 10
    if req.sleep < 6: lifestyle_modifier += 10
        
    final_score = max(0.0, min(100.0, base_score + lifestyle_modifier))
    
    if final_score < 40:
        risk_category = "Safe"
        summary = "Low risk of heat stress. Maintain hydration."
        alerts = []
        recommendations = ["Drink water periodically", "Wear light clothing"]
    elif final_score < 75:
        risk_category = "Moderate"
        summary = "Moderate risk. Elevated environmental or physiological indicators present."
        alerts = ["Risk of dehydration"]
        recommendations = ["Drink 500ml of water immediately", "Seek a shaded or cool area"]
    else:
        risk_category = "High"
        summary = "HIGH risk of heat stress! Immediate action required."
        alerts = ["Avoid outdoor exposure completely", "Elevated heat stress potential"]
        recommendations = ["Move to an air-conditioned room", "Rest immediately"]

    payload = {
        "final_score": round(float(final_score), 1),
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

    # Asynchronously persist to Postgres via SQLAlchemy immediately before returning
    db_result = models.AnalysisResult(
        user_id=current_user.id,
        env_score=req.env,
        phys_score=req.phys,
        face_score=req.face,
        skin_score=req.skin,
        final_score=final_score
    )
    db.add(db_result)
    db.commit()

    return payload

@app.get("/api/history")
def get_user_history(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    results = db.query(models.AnalysisResult).filter(models.AnalysisResult.user_id == current_user.id).order_by(models.AnalysisResult.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "env_score": r.env_score,
            "phys_score": r.phys_score,
            "face_score": r.face_score,
            "skin_score": r.skin_score,
            "final_score": r.final_score,
            "created_at": r.created_at.isoformat()
        } for r in results
    ]
