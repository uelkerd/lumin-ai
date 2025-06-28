const express = require("express");
const app = express();
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const asyncHandler = require("./utils/asyncHandler");
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3001; // Or another port as needed

// Mock Data based on refined API specifications
const mockTrustMetrics = [
  {
    wave: 10,
    year: 2023,
    trust_score: 0.65,
    confidence_interval: [0.63, 0.67],
    demographic_segment: "all",
  },
  {
    wave: 10,
    year: 2023,
    trust_score: 0.7,
    confidence_interval: [0.68, 0.72],
    demographic_segment: "age: 18-25",
  },
  {
    wave: 9,
    year: 2022,
    trust_score: 0.62,
    confidence_interval: [0.6, 0.64],
    demographic_segment: "all",
  },
];

const mockDemographics = [
  {
    demographic_category: "age",
    demographic_segment: "18-25",
    trust_score: 0.7,
    statistical_significance: "p < 0.05",
    confidence_interval: [0.68, 0.72],
  },
  {
    demographic_category: "age",
    demographic_segment: "26-40",
    trust_score: 0.65,
    statistical_significance: "p > 0.05",
    confidence_interval: [0.63, 0.67],
  },
];

const mockCorrelations = {
  correlation_matrix: {
    trust_score: {
      sentiment_score: 0.75,
      age: -0.2,
    },
    sentiment_score: {
      trust_score: 0.75,
      education: 0.3,
    },
  },
  description:
    "Correlation matrix showing relationships between key variables.",
};

const mockSentimentResponse = {
  sentiment: "positive",
  confidence: 0.85,
  interpretation_guidance:
    "The model is highly confident that the sentiment is positive.",
};

const mockBatchSentimentResponse = [
  {
    text: "Text 1 to analyze.",
    sentiment: "neutral",
    confidence: 0.6,
  },
  {
    text: "Text 2 to analyze.",
    sentiment: "negative",
    confidence: 0.92,
  },
];

const mockSentimentTrends = [
  {
    time_period: "2022",
    average_sentiment: 0.15,
    sentiment_distribution: { positive: 0.4, neutral: 0.35, negative: 0.25 },
  },
  {
    time_period: "2023",
    average_sentiment: 0.2,
    sentiment_distribution: { positive: 0.45, neutral: 0.3, negative: 0.25 },
  },
];

// Simulate API calls with a delay
const simulateApiCall = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 100); // 100ms delay
  });
};

const getTrustMetricsMock = () => simulateApiCall(mockTrustMetrics);
const getDemographicsMock = () => simulateApiCall(mockDemographics);
const getCorrelationsMock = () => simulateApiCall(mockCorrelations);
const analyzeSentimentMock = () => simulateApiCall(mockSentimentResponse);
const batchAnalyzeSentimentMock = () =>
  simulateApiCall(mockBatchSentimentResponse);
const getSentimentTrendsMock = () => simulateApiCall(mockSentimentTrends);

// Basic GET endpoint
app.get("/api/data", (req, res) => {
  res.json({ message: "Backend MVP is running." });
});

// API endpoints using mock data
app.get(
  "/api/v1/data-science/trust-metrics",
  asyncHandler(async (req, res) => {
    const data = await getTrustMetricsMock();
    res.json(data);
  })
);

app.get(
  "/api/v1/data-science/demographics",
  asyncHandler(async (req, res) => {
    const data = await getDemographicsMock();
    res.json(data);
  })
);

app.get(
  "/api/v1/data-science/correlations",
  asyncHandler(async (req, res) => {
    const data = await getCorrelationsMock();
    res.json(data);
  })
);

app.post(
  "/api/v1/deep-learning/sentiment-analysis",
  asyncHandler(async (req, res) => {
    const data = await analyzeSentimentMock();
    res.json(data);
  })
);

app.post(
  "/api/v1/deep-learning/batch-sentiment-analysis",
  asyncHandler(async (req, res) => {
    const data = await batchAnalyzeSentimentMock();
    res.json(data);
  })
);

app.get(
  "/api/v1/deep-learning/sentiment-trends",
  asyncHandler(async (req, res) => {
    const data = await getSentimentTrendsMock();
    res.json(data);
  })
);

// Error handling middleware should be last
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend MVP listening at http://localhost:${port}`);
});
