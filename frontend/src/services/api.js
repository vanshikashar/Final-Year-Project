import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

export const getAlerts = () => api.get("/api/alerts");
export const getHealth = () => api.get("/api/health");

export const detectAnomaly = (metrics) =>
  api.post("/api/detect", metrics);