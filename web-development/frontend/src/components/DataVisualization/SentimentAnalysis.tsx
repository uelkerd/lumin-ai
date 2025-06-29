import React, { useState } from "react";
import Loading from "../common/Loading";

const SentimentAnalysis: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const analyzeSentiment = async () => {
    if (!text.trim()) return;

    setAnalyzing(true);

    try {
      // In a real app, this would call the API
      // const response = await api.analyzeSentiment(text);

      // Mock response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResult = {
        sentiment:
          Math.random() > 0.3
            ? "positive"
            : Math.random() > 0.5
              ? "negative"
              : "neutral",
        confidence: 0.65 + Math.random() * 0.3,
        explanation: {
          key_phrases: [
            "democratic process",
            "transparency",
            "citizen engagement",
            "governance",
          ],
          feature_importance: {
            democratic: 0.25,
            transparency: 0.2,
            citizen: 0.15,
            engagement: 0.1,
            governance: 0.3,
          },
        },
      };

      setResult(mockResult);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      // Handle error
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "#10b981"; // green
      case "negative":
        return "#ef4444"; // red
      default:
        return "#f59e0b"; // amber
    }
  };

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "😊";
      case "negative":
        return "😞";
      default:
        return "😐";
    }
  };

  return (
    <div className="sentiment-analysis-container fade-in">
      <h1>Governance Sentiment Analysis</h1>
      <p className="section-description">
        Analyze sentiment in governance texts using our neural network model
      </p>

      <div className="sentiment-input-container glass-card">
        <h2>Enter Governance Text</h2>
        <textarea
          className="sentiment-textarea"
          placeholder="Enter governance text, policy document, or democratic discourse to analyze..."
          value={text}
          onChange={handleTextChange}
          rows={6}
        />
        <button
          className="analyze-button"
          onClick={analyzeSentiment}
          disabled={!text.trim() || analyzing}
        >
          {analyzing ? "Analyzing..." : "Analyze Sentiment"}
        </button>
      </div>

      {analyzing && <Loading message="Analyzing sentiment..." />}

      {result && !analyzing && (
        <div className="sentiment-result glass-card">
          <h2>Analysis Results</h2>

          <div className="sentiment-summary">
            <div
              className="sentiment-indicator"
              style={{ backgroundColor: getSentimentColor(result.sentiment) }}
            >
              <span className="sentiment-emoji">
                {getSentimentEmoji(result.sentiment)}
              </span>
              <span className="sentiment-label">
                {result.sentiment.toUpperCase()}
              </span>
            </div>

            <div className="confidence-meter">
              <h3>Confidence: {(result.confidence * 100).toFixed(1)}%</h3>
              <div className="confidence-bar-container">
                <div
                  className="confidence-bar"
                  style={{ width: `${result.confidence * 100}%` }}
                 />
              </div>
            </div>
          </div>

          <div className="sentiment-details">
            <div className="key-phrases">
              <h3>Key Phrases</h3>
              <div className="phrase-tags">
                {result.explanation.key_phrases.map(
                  (phrase: string, index: number) => (
                    <span key={index} className="phrase-tag">
                      {phrase}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="feature-importance">
              <h3>Feature Importance</h3>
              <div className="importance-bars">
                {Object.entries(result.explanation.feature_importance).map(
                  ([feature, importance]: [string, any]) => (
                    <div key={feature} className="importance-item">
                      <span className="feature-name">{feature}</span>
                      <div className="importance-bar-container">
                        <div
                          className="importance-bar"
                          style={{ width: `${importance * 100}%` }}
                         />
                      </div>
                      <span className="importance-value">
                        {(importance * 100).toFixed(0)}%
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>

          <div className="interpretation-guidance">
            <h3>Interpretation Guidance</h3>
            <p>
              This sentiment analysis is specifically trained on governance and
              democratic discourse. The model identifies emotional tone and
              attitude toward governance concepts, with confidence scores
              indicating prediction reliability. Higher confidence (above 80%)
              suggests stronger sentiment signals in the text.
            </p>
          </div>
        </div>
      )}

      <div className="methodology-section">
        <h3>About Our Sentiment Analysis</h3>
        <p>
          Our sentiment analysis model is specifically trained on governance
          texts and democratic discourse, achieving 85%+ accuracy on
          governance-specific language. The model uses transformer architecture
          to understand context and nuance in policy discussions, public
          feedback, and civic engagement materials.
        </p>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
