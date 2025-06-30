import axios, { AxiosResponse, AxiosError } from "axios";
import { DashboardData, SentimentResult } from "../types/dashboard";

// Base API URL - would come from environment variables in a real app
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for adding auth tokens, etc.
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling common errors and logging
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time in development
    if (process.env.NODE_ENV === "development" && response.config.metadata) {
      const endTime = new Date();
      const duration =
        endTime.getTime() - response.config.metadata.startTime.getTime();
      console.log(
        `API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`,
      );
    }

    return response;
  },
  (error: AxiosError) => {
    console.error("API Error:", error);

    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          break;
        case 403:
          // Forbidden
          console.error("Access forbidden:", data);
          break;
        case 404:
          // Not found
          console.error("Resource not found:", error.config?.url);
          break;
        case 429:
          // Rate limited
          console.error("Rate limit exceeded");
          break;
        case 500:
          // Server error
          console.error("Server error:", data);
          break;
        default:
          console.error("HTTP error:", status, data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network error - no response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  },
);

// API functions with proper error handling and typing
export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await api.get("/dashboard");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    // Return mock data as fallback
    return getMockDashboardData();
  }
};

export const fetchTrustMetrics = async (timeRange: string = "1y") => {
  try {
    const response = await api.get(`/trust-metrics`, {
      params: { timeRange },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch trust metrics:", error);
    throw new Error("Unable to load trust metrics. Please try again later.");
  }
};

export const fetchDemographicAnalysis = async (demographic: string = "age") => {
  try {
    const response = await api.get(`/demographics/analysis`, {
      params: { segment: demographic },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch demographic analysis:", error);
    throw new Error(
      "Unable to load demographic analysis. Please try again later.",
    );
  }
};

export const analyzeSentiment = async (
  text: string,
): Promise<SentimentResult> => {
  try {
    if (!text.trim()) {
      throw new Error("Text cannot be empty");
    }

    const response = await api.post("/ml/sentiment", { text });
    return response.data;
  } catch (error) {
    console.error("Failed to analyze sentiment:", error);
    throw new Error("Unable to analyze sentiment. Please try again later.");
  }
};

// Health check endpoint
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get("/health", { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
};

// Mock data fallback for development
const getMockDashboardData = (): DashboardData => ({
  trustScore: 72.5,
  transparencyIndex: 68.3,
  participationRate: 45.2,
  sentimentScore: 0.65,
  trustTrend: [
    { date: "2023-01", value: 68.2 },
    { date: "2023-02", value: 69.5 },
    { date: "2023-03", value: 70.1 },
    { date: "2023-04", value: 71.3 },
    { date: "2023-05", value: 72.0 },
    { date: "2023-06", value: 72.5 },
  ],
  recentUpdates: [
    {
      id: 1,
      title: "Trust score increased by 2.3%",
      date: "2023-06-15",
    },
    {
      id: 2,
      title: "New governance data integrated",
      date: "2023-06-10",
    },
    {
      id: 3,
      title: "Sentiment analysis model updated",
      date: "2023-06-05",
    },
  ],
});

// Utility functions for API management
export const createApiCache = () => {
  const cache = new Map();
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  return {
    get: (key: string) => {
      const item = cache.get(key);
      if (item && Date.now() - item.timestamp < CACHE_DURATION) {
        return item.data;
      }
      cache.delete(key);
      return null;
    },
    set: (key: string, data: any) => {
      cache.set(key, { data, timestamp: Date.now() });
    },
    clear: () => cache.clear(),
    size: () => cache.size,
  };
};

// Create global API cache instance
export const apiCache = createApiCache();

// Cached API wrapper
export const withCache = async <T>(
  key: string,
  apiCall: () => Promise<T>,
): Promise<T> => {
  const cached = apiCache.get(key);
  if (cached) {
    return cached;
  }

  const result = await apiCall();
  apiCache.set(key, result);
  return result;
};

export default api;
