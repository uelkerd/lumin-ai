import axios from "axios";
import { DashboardData, SentimentResult } from "../types/dashboard";

// Base API URL - would come from environment variables in a real app
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API functions
export const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get("/dashboard");
  return response.data;
};

export const fetchTrustMetrics = async (timeRange: string = "1y") => {
  const response = await api.get(`/trust-metrics?timeRange=${timeRange}`);
  return response.data;
};

export const fetchDemographicAnalysis = async (demographic: string = "age") => {
  const response = await api.get(
    `/demographics/analysis?segment=${demographic}`,
  );
  return response.data;
};

export const analyzeSentiment = async (
  text: string,
): Promise<SentimentResult> => {
  const response = await api.post("/ml/sentiment", { text });
  return response.data;
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);

    // You can add custom error handling here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default api;
