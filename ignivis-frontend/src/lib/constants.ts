export const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production"
        ? "https://ignivis.onrender.com"
        : "http://localhost:8000");

