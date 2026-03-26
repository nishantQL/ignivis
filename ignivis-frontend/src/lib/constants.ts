export const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === "production" 
    ? "https://ignivis-production.up.railway.app" 
    : "http://localhost:8000");

