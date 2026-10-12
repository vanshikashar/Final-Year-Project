
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getHealth = async () => {
  const response = await api.get("/api/health");
  return response.data;
};

export const getMetrics = async () => {
  const response = await api.get("/api/metrics");
  return response.data;
};

export const getAlerts = async () => {
  const response = await api.get("/api/alerts");
  return response.data;
};

export const getLogs = async () => {
  const response = await api.get("/api/logs");
  return response.data;
};

export const detectAnomaly = async (metrics) => {
  const response = await api.post("/api/detect", metrics);
  return response.data;
};

export const updateAlertStatus = async (alertId, status) => {
  const response = await api.patch(
    `/api/alerts/${alertId}/status`,
    { status }
  );

  return response.data;
};

export default api;
