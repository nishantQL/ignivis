import requests

def test_api():
    print("Testing /physiological")
    res1 = requests.post("http://localhost:8000/api/physiological", json={"body_temp": 38.0, "heart_rate": 80})
    print(res1.status_code, res1.text)
    
    print("Testing /final")
    res2 = requests.post("http://localhost:8000/api/final", json={"env": 50.0, "phys": 50.0, "face": 50.0, "skin": 50.0, "sleep": 7, "water": 2.0, "age": 30, "gender": "male"})
    print(res2.status_code, res2.text)

if __name__ == "__main__":
    test_api()
