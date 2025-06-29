import React, { Suspense } from "react";
import Loading from "./Loading";

// Lazy load heavy components for better performance
export const LazyAdvancedDashboard = React.lazy(
  () => import("../DataVisualization/AdvancedDashboard"),
);

export const LazyTrustMetrics = React.lazy(
  () => import("../GovernanceMetrics/TrustMetrics"),
);

export const LazySentimentAnalysis = React.lazy(
  () => import("../DataVisualization/SentimentAnalysis"),
);

export const LazyDemographicAnalysis = React.lazy(
  () => import("../GovernanceMetrics/DemographicAnalysis"),
);

// Higher-order component for lazy loading with error boundary
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback = <Loading message="Loading component..." />,
  errorFallback = (
    <div className="error-container">Failed to load component</div>
  ),
}) => {
  return (
    <Suspense fallback={fallback}>
      <React.ErrorBoundary fallback={errorFallback}>
        {children}
      </React.ErrorBoundary>
    </Suspense>
  );
};

// Preload components for better UX
export const preloadComponents = () => {
  // Preload critical components
  import("../DataVisualization/AdvancedDashboard");
  import("../GovernanceMetrics/TrustMetrics");
  import("../DataVisualization/SentimentAnalysis");
  import("../GovernanceMetrics/DemographicAnalysis");
};

// Component for preloading on user interaction
export const PreloadTrigger: React.FC<{
  onHover?: boolean;
  onFocus?: boolean;
  component: string;
  children: React.ReactNode;
}> = ({ onHover = true, onFocus = true, component, children }) => {
  const handlePreload = () => {
    switch (component) {
      case "dashboard":
        import("../DataVisualization/AdvancedDashboard");
        break;
      case "trust-metrics":
        import("../GovernanceMetrics/TrustMetrics");
        break;
      case "sentiment":
        import("../DataVisualization/SentimentAnalysis");
        break;
      case "demographics":
        import("../GovernanceMetrics/DemographicAnalysis");
        break;
    }
  };

  return (
    <div
      onMouseEnter={onHover ? handlePreload : undefined}
      onFocus={onFocus ? handlePreload : undefined}
    >
      {children}
    </div>
  );
};
