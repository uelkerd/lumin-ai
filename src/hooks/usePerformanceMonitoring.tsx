import { useEffect, useState } from "react";
import React from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  cacheHitRate: number;
}

interface WebVitals {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [webVitals, setWebVitals] = useState<Partial<WebVitals>>({});
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        switch (entry.entryType) {
          case "navigation":
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics((prev) => ({
              ...prev!,
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              renderTime:
                navEntry.domContentLoadedEventEnd -
                navEntry.domContentLoadedEventStart,
              TTFB: navEntry.responseStart - navEntry.requestStart,
            }));
            break;

          case "paint":
            if (entry.name === "first-contentful-paint") {
              setWebVitals((prev) => ({ ...prev, FCP: entry.startTime }));
            }
            break;

          case "largest-contentful-paint":
            setWebVitals((prev) => ({ ...prev, LCP: entry.startTime }));
            break;

          case "first-input":
            const fidEntry = entry as PerformanceEventTiming;
            setWebVitals((prev) => ({
              ...prev,
              FID: fidEntry.processingStart - fidEntry.startTime,
            }));
            break;

          case "layout-shift":
            if (!(entry as any).hadRecentInput) {
              setWebVitals((prev) => ({
                ...prev,
                CLS: (prev.CLS || 0) + (entry as any).value,
              }));
            }
            break;
        }
      });
    });

    // Observe different performance entry types
    observer.observe({
      entryTypes: [
        "navigation",
        "paint",
        "largest-contentful-paint",
        "first-input",
        "layout-shift",
      ],
    });

    // Memory usage monitoring
    const memoryInterval = setInterval(() => {
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        setMetrics((prev) =>
          prev
            ? {
                ...prev,
                memoryUsage: memory.usedJSHeapSize / memory.totalJSHeapSize,
              }
            : null,
        );
      }
    }, 5000);

    return () => {
      observer.disconnect();
      clearInterval(memoryInterval);
    };
  }, [isMonitoring]);

  const startMonitoring = () => setIsMonitoring(true);
  const stopMonitoring = () => setIsMonitoring(false);

  const getPerformanceScore = (): number => {
    if (!webVitals.FCP || !webVitals.LCP || !webVitals.FID || !webVitals.CLS) {
      return 0;
    }

    // Scoring based on Core Web Vitals thresholds
    const fcpScore =
      webVitals.FCP <= 1800 ? 100 : webVitals.FCP <= 3000 ? 50 : 0;
    const lcpScore =
      webVitals.LCP <= 2500 ? 100 : webVitals.LCP <= 4000 ? 50 : 0;
    const fidScore = webVitals.FID <= 100 ? 100 : webVitals.FID <= 300 ? 50 : 0;
    const clsScore =
      webVitals.CLS <= 0.1 ? 100 : webVitals.CLS <= 0.25 ? 50 : 0;

    return Math.round((fcpScore + lcpScore + fidScore + clsScore) / 4);
  };

  const getBundleAnalysis = async () => {
    // Analyze bundle size and composition
    const modules = await import("../utils/bundleAnalyzer");
    return modules.analyzeBundleSize();
  };

  return {
    metrics,
    webVitals,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getPerformanceScore,
    getBundleAnalysis,
  };
};

// Performance monitoring component
export const PerformanceMonitor: React.FC = () => {
  const {
    metrics,
    webVitals,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getPerformanceScore,
  } = usePerformanceMonitoring();

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in development
  }

  const score = getPerformanceScore();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <h3 className="text-sm font-semibold mb-2">Performance Monitor</h3>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Score:</span>
          <span
            className={
              score >= 90
                ? "text-green-600"
                : score >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
            }
          >
            {score}/100
          </span>
        </div>
        {webVitals.FCP && (
          <div className="flex justify-between">
            <span>FCP:</span>
            <span>{Math.round(webVitals.FCP)}ms</span>
          </div>
        )}
        {webVitals.LCP && (
          <div className="flex justify-between">
            <span>LCP:</span>
            <span>{Math.round(webVitals.LCP)}ms</span>
          </div>
        )}
        {webVitals.FID && (
          <div className="flex justify-between">
            <span>FID:</span>
            <span>{Math.round(webVitals.FID)}ms</span>
          </div>
        )}
        {webVitals.CLS && (
          <div className="flex justify-between">
            <span>CLS:</span>
            <span>{webVitals.CLS.toFixed(3)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
