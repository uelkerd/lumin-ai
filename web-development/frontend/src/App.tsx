import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Dashboard from "./components/Dashboard/Dashboard";
import TrustMetrics from "./components/GovernanceMetrics/TrustMetrics";
import SentimentAnalysis from "./components/DataVisualization/SentimentAnalysis";
import DemographicAnalysis from "./components/GovernanceMetrics/DemographicAnalysis";
import NotFound from "./components/common/NotFound";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trust-metrics" element={<TrustMetrics />} />
            <Route path="/sentiment-analysis" element={<SentimentAnalysis />} />
            <Route
              path="/demographic-analysis"
              element={<DemographicAnalysis />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
