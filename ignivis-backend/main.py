from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os

from database import engine, get_db
import models
import auth
from routes import predict
from utils.download_models import download_skin_model

app = FastAPI(title="Ignivis API - AI Heat Stress Intelligence System")

# ✅ Load model on startup (FIXED)
@app.on_event("startup")
def load_model():
    try:
        download_skin_model()
        print("✅ Model loaded successfully")
    except Exception as e:
        print("❌ Model loading failed:", e)

# ✅ Safe DB initialization
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database connected")
except Exception as e:
    print("❌ Database connection failed:", e)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        from jose import jwt, JWTError
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing username",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication error: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists in current database.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )

# Routes
app.include_router(predict.router, prefix="/api", tags=["Predictive Models"])

# Request models
class LoginRequest(BaseModel):
    email: str
    password: str

class FinalScoreRequest(BaseModel):
    env: float = 0.0
    phys: float = 0.0
    face: float = 0.0
    skin: float = 0.0
    sleep: int = 7
    water: float = 2.0
    age: int = 30
    gender: str = "unknown"

class AiInsightsRequest(BaseModel):
    final_score: float = 0.0
    env_score: float = 0.0
    phys_score: float = 0.0
    face_score: float = 0.0
    skin_score: float = 0.0
    sleep: int = 7
    water: float = 2.0
    age: int = 30
    gender: str = "unknown"

# Root
@app.get("/")
def read_root():
    return {"message": "Ignivis Backend Active 🚀"}

# Auth
@app.post("/api/auth/register")
def register(user: auth.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully"}

@app.post("/api/auth/login")
def login(user: LoginRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not auth.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = auth.create_access_token(data={"username": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# AI Insights
@app.post("/api/ai-insights")
def get_ai_insights(req: AiInsightsRequest):
    from utils.ai_insights import generate_ai_insights
    return generate_ai_insights(req.model_dump())

# Final Score
@app.post("/api/final")
async def get_final_score(
    req: FinalScoreRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    base_score = (req.env * 0.3) + (req.phys * 0.4) + (req.face * 0.15) + (req.skin * 0.15)
    
    lifestyle_modifier = 0
    if req.water < 2:
        lifestyle_modifier += 15
    elif req.water >= 4:
        lifestyle_modifier -= 10
    if req.sleep < 6:
        lifestyle_modifier += 10
        
    final_score = max(0.0, min(100.0, base_score + lifestyle_modifier))
    
    risk_category = "Safe"
    if final_score >= 75:
        risk_category = "High"
    elif final_score >= 40:
        risk_category = "Moderate"

    payload = {
        "final_score": round(float(final_score), 1),
        "risk_category": risk_category,
        "summary": "Heat stress potential analyzed based on real-time inputs.",
        "action_plan": [{"time": "Now", "action": "Calculated risk based on real-time inputs."}]
    }

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

# History
@app.get("/api/history")
def get_user_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(models.AnalysisResult)\
        .filter(models.AnalysisResult.user_id == current_user.id)\
        .order_by(models.AnalysisResult.created_at.desc())\
        .limit(20).all()

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