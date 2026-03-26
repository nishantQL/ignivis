import cv2
import numpy as np
import gc

def process_face_image(contents: bytes):
    """
    Optimized face scanning using resizing and explicit memory cleanup.
    """
    # 1. Decode image
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Explicitly delete buffer to save RAM
    del nparr
    
    if img is None:
        return None, None, None, None
        
    # 2. Resize image for faster processing and lower memory usage (Max width 640px)
    h, w = img.shape[:2]
    if w > 640:
        scale = 640 / w
        img = cv2.resize(img, (640, int(h * scale)))
        
    # 3. Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Delete color image early if not needed
    del img
    
    # 4. Cascade Detection
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) == 0:
        face_crop = gray
    else:
        x, y, w, h = faces[0]
        face_crop = gray[y:y+h, x:x+w]
        
    # 5. Extract features for ML
    mean_val = float(np.mean(face_crop))
    std_val = float(np.std(face_crop))
    max_val = float(np.max(face_crop))
    var_val = float(np.var(face_crop))
    
    # 6. Cleanup
    del gray
    del face_crop
    gc.collect()
    
    return mean_val, std_val, max_val, var_val
