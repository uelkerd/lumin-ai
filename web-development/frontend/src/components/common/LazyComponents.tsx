import React, { Suspense, ComponentType } from "react";
import Loading from "./Loading";
import ErrorBoundary from "./ErrorBoundary";

// Lazy load heavy components for better performance
export const LazyAdvancedDashboard = React.lazy(() =>
  import("../DataVisualization/AdvancedDashboard").catch(() => ({
    default: () => <div>Failed to load Advanced Dashboard</div>,
  })),
);

export const LazyTrustMetrics = React.lazy(() =>
  import("../GovernanceMetrics/TrustMetrics").catch(() => ({
    default: () => <div>Failed to load Trust Metrics</div>,
  })),
);

export const LazySentimentAnalysis = React.lazy(() =>
  import("../DataVisualization/SentimentAnalysis").catch(() => ({
    default: () => <div>Failed to load Sentiment Analysis</div>,
  })),
);

export const LazyDemographicAnalysis = React.lazy(() =>
  import("../GovernanceMetrics/DemographicAnalysis").catch(() => ({
    default: () => <div>Failed to load Demographic Analysis</div>,
  })),
);

// Lazy load heavy third-party components
export const LazyRechartsComponents = React.lazy(() =>
  import("recharts")
    .then((module) => ({
      default: module,
    }))
    .catch(() => ({
      default: () => <div>Charts unavailable</div>,
    })),
);

export const LazyD3Components = React.lazy(() =>
  import("d3")
    .then((module) => ({
      default: module,
    }))
    .catch(() => ({
      default: () => <div>D3 visualizations unavailable</div>,
    })),
);

export const LazyFramerMotion = React.lazy(() =>
  import("framer-motion")
    .then((module) => ({
      default: module.motion,
    }))
    .catch(() => ({
      default: ({ children, ...props }: any) => (
        <div {...props}>{children}</div>
      ),
    })),
);

// Higher-order component for lazy loading with comprehensive error handling
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  loadingMessage?: string;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  children,
  fallback,
  errorFallback = (
    <div className="error-container">Failed to load component</div>
  ),
  loadingMessage = "Loading component...",
}) => {
  const loadingFallback = fallback || <Loading message={loadingMessage} />;

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={loadingFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};

// Enhanced preload functionality with error handling
export const preloadComponents = () => {
  const preloadPromises = [
    import("../DataVisualization/AdvancedDashboard"),
    import("../GovernanceMetrics/TrustMetrics"),
    import("../DataVisualization/SentimentAnalysis"),
    import("../GovernanceMetrics/DemographicAnalysis"),
    import("recharts"),
    import("framer-motion"),
  ];

  Promise.allSettled(preloadPromises).then((results) => {
    const failed = results.filter((result) => result.status === "rejected");
    if (failed.length > 0) {
      console.warn(`Failed to preload ${failed.length} components`);
    }
  });
};

// Component for preloading on user interaction with enhanced tracking
export const PreloadTrigger: React.FC<{
  onHover?: boolean;
  onFocus?: boolean;
  component: string;
  children: React.ReactNode;
}> = ({ onHover = true, onFocus = true, component, children }) => {
  const [preloaded, setPreloaded] = React.useState(false);

  const handlePreload = React.useCallback(() => {
    if (preloaded) return;

    const preloadMap: Record<string, () => Promise<any>> = {
      dashboard: () => import("../DataVisualization/AdvancedDashboard"),
      "trust-metrics": () => import("../GovernanceMetrics/TrustMetrics"),
      sentiment: () => import("../DataVisualization/SentimentAnalysis"),
      demographics: () => import("../GovernanceMetrics/DemographicAnalysis"),
      recharts: () => import("recharts"),
      "framer-motion": () => import("framer-motion"),
    };

    const preloadFn = preloadMap[component];
    if (preloadFn) {
      preloadFn()
        .then(() => setPreloaded(true))
        .catch((error) =>
          console.warn(`Failed to preload ${component}:`, error),
        );
    }
  }, [component, preloaded]);

  return (
    <div
      onMouseEnter={onHover ? handlePreload : undefined}
      onFocus={onFocus ? handlePreload : undefined}
    >
      {children}
    </div>
  );
};

// Route-based lazy loading wrapper
export const LazyRoute: React.FC<{
  component: ComponentType<any>;
  fallback?: React.ReactNode;
  [key: string]: any;
}> = ({ component: Component, fallback, ...props }) => {
  return (
    <LazyWrapper fallback={fallback}>
      <Component {...props} />
    </LazyWrapper>
  );
};

// Feature module lazy loader
export const createLazyFeature = (
  importFn: () => Promise<{ default: ComponentType<any> }>,
) => {
  return React.lazy(() =>
    importFn().catch((error) => {
      console.error("Failed to load feature module:", error);
      return {
        default: () => (
          <div className="error-container">
            <h2>Feature Unavailable</h2>
            <p>
              This feature could not be loaded. Please try refreshing the page.
            </p>
          </div>
        ),
      };
    }),
  );
};
