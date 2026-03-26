import os
import gdown

def download_skin_model():
    # Google Drive File ID specified by User
    file_id = '10y9BQeI3FUpBmLFIN591ReTbNAv1aUr6'
    
    # Resolve absolute path to models directory
    current_dir = os.path.dirname(__file__)
    models_dir = os.path.abspath(os.path.join(current_dir, '..', 'models'))
    destination = os.path.join(models_dir, 'stress_skin_model.joblib')
    
    # Ensure models directory actually exists
    os.makedirs(models_dir, exist_ok=True)
    
    # Skip download if file is completely healthy and present
    if os.path.exists(destination):
        print(f"[Ignivis ML] Skin Model already natively exists at {destination}. Skipping Google Drive download.")
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
        return False

if __name__ == "__main__":
    download_skin_model()
