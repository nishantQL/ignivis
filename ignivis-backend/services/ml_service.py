import os
import joblib
import gc
from functools import lru_cache

# Cache for loaded models
_model_cache = {}

def load_model(model_name: str):
    """
    Lazy loads and caches ML models using memory mapping (mmap)
    to minimize RAM usage on limited environments like Railway (512MB).
    """
    global _model_cache
    
    if model_name in _model_cache:
        return _model_cache[model_name]
    
    # Path to models directory
    if model_name == "stress_skin_model.joblib":
        model_path = os.path.join("/tmp", model_name)
        # Fallback to local models directory if not in /tmp
        if not os.path.exists(model_path):
             model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", model_name))
    else:
        model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models", model_name))
        
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}")
        
    print(f"[ML Service] Lazy loading {model_name} with mmap_mode='r'...")
    
    # mmap_mode='r' tells joblib to map the file on disk instead of loading it entirely into RAM
    model = joblib.load(model_path, mmap_mode='r')
    _model_cache[model_name] = model
    
    # Trigger garbage collection to clean any overhead during loading
    gc.collect()
    
    return model

def predict_env(features):
    model = load_model("environment_model.joblib")
    return model.predict(features)

def predict_phys(features):
    model = load_model("heat_stress_model.joblib")
    return model.predict(features)

def predict_face(features):
    model = load_model("face_temp_fatigue_heatmap_model.joblib")
    return model.predict(features)

def predict_skin(features):
    model = load_model("stress_skin_model.joblib")
    return model.predict(features)
