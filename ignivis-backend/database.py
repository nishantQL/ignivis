import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

DATABASE_URL = os.getenv("DATABASE_URL")

# --- DATABASE LOGIC ---
if DATABASE_URL:
    # SQLAlchemy 1.4+ deprecated 'postgres://' for 'postgresql://'
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    # 🚨 Warning: Render will exit with status 1 if we try to connect without a URL.
    # We log this clearly for the user in the Render Console.
    print("!!! [FATAL ERROR] DATABASE_URL is not set in the environment variables.")
    print("!!! Please set it in the Render Dashboard (Settings -> Environment Variables).")

# Setup engine with fallback to avoid crash during build if URL is missing
engine = create_engine(
    DATABASE_URL or "sqlite:///./temp_ignivis_build.db", 
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
