import axios from "axios";
import { TrustMetricsData } from "./types";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTrustMetrics = async (params?: {
  demographic?: string;
  wave?: string;
}): Promise<TrustMetricsData[]> => {
  try {
    const response = await api.get("/data-science/trust-metrics", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching trust metrics:", error);
    throw error; // Re-throw the error for handling in components
  }
};

export const getDemographics = async (params: {
  demographic: string;
  wave?: string;
}) => {
  try {
    const response = await api.get("/data-science/demographics", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching demographics:", error);
    throw error;
  }
};

export const getCorrelations = async (params?: {
  wave?: string;
  demographic?: string;
}) => {
  try {
    const response = await api.get("/data-science/correlations", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching correlations:", error);
    throw error;
  }
};

export const analyzeSentiment = async (text: string) => {
  try {
    const response = await api.post("/deep-learning/sentiment-analysis", {
      text,
    });
    return response.data;
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    throw error;
  }
};

export const batchAnalyzeSentiment = async (texts: string[]) => {
  try {
    const response = await api.post("/deep-learning/batch-sentiment-analysis", {
      texts,
    });
    return response.data;
  } catch (error) {
    console.error("Error batch analyzing sentiment:", error);
    throw error;
  }
};

export const getSentimentTrends = async (params?: {
  theme?: string;
  timeframe?: string;
}) => {
  try {
    const response = await api.get("/deep-learning/sentiment-trends", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching sentiment trends:", error);
    throw error;
  }
};
