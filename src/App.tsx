import React, { Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import Loading from "./components/common/Loading";
import NotFound from "./components/common/NotFound";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { PerformanceMonitor } from "./hooks/usePerformanceMonitoring";

// Lazy loaded components for better performance
import {
  LazyAdvancedDashboard,
  LazyTrustMetrics,
  LazySentimentAnalysis,
  LazyDemographicAnalysis,
  preloadComponents,
} from "./components/common/LazyComponents";

// Regular dashboard for faster initial load
import Dashboard from "./components/Dashboard/Dashboard";

const App: React.FC = () => {
  useEffect(() => {
    // Preload components after initial render
    const timer = setTimeout(() => {
      preloadComponents();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Header />
          <main className="app-main">
            <Suspense fallback={<Loading message="Loading page..." />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route
                  path="/advanced-dashboard"
                  element={<LazyAdvancedDashboard />}
                />
                <Route path="/trust-metrics" element={<LazyTrustMetrics />} />
                <Route
                  path="/sentiment-analysis"
                  element={<LazySentimentAnalysis />}
                />
                <Route
                  path="/demographic-analysis"
                  element={<LazyDemographicAnalysis />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          {process.env.NODE_ENV === "development" && <PerformanceMonitor />}
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
