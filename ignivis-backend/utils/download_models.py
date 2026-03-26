import os
import gdown

def download_skin_model():
    # Google Drive File ID specified by User
    file_id = '10y9BQeI3FUpBmLFIN591ReTbNAv1aUr6'
    
    # User requested /tmp for the large model to avoid clutter and potentially handle read-only filesystems
    destination = os.path.join('/tmp', 'stress_skin_model.joblib')
    
    # Ensure /tmp exists (usually does, but for safety)
    os.makedirs('/tmp', exist_ok=True)
    
    # Skip download if file is already present
    if os.path.exists(destination):
        print(f"[Ignivis ML] Skin Model already exists at {destination}. Skipping Google Drive download.")
        return True
    
    print(f"[Ignivis ML] Engaging Model Download from Google Drive to {destination}...")
    url = f'https://drive.google.com/uc?id={file_id}'
    try:
        # Utilizing gdown to bypass Google Drive virus scanning confirmations on large files
        gdown.download(url, destination, quiet=False)
        print("[Ignivis ML] High-Resolution Skin Model downloaded successfully!")
        return True
    except Exception as e:
        print(f"!!! [Ignivis ML] FATAL: Failed to download Skin Model: {e}")
        # Fallback to local models directory for dev if /tmp fails
        return False
