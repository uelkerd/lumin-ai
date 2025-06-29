import React, { useState, useEffect, useCallback } from "react";
import Loading from "../common/Loading";
import MetricCard from "./MetricCard";
import TrustTrendChart from "../DataVisualization/TrustTrendChart";
import DemographicComparison from "../DataVisualization/DemographicComparison";

const TrustMetrics: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>("1y");

  // In a real app, this would fetch from an API
  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Memoized callbacks to prevent recreation on each render
  const handleTimeRangeOneYear = useCallback(() => setTimeRange("1y"), []);
  const handleTimeRangeThreeYears = useCallback(() => setTimeRange("3y"), []);
  const handleTimeRangeAllTime = useCallback(() => setTimeRange("all"), []);

  if (loading) {
    return <Loading message="Loading trust metrics data..." />;
  }

  return (
    <div className="trust-metrics-container fade-in">
      <h1>Democratic Trust Metrics</h1>
      <p className="section-description">
        Comprehensive analysis of trust in democratic institutions based on
        Austria Democracy Radar data
      </p>

      <div className="time-range-selector">
        <button
          className={timeRange === "1y" ? "active" : ""}
          onClick={handleTimeRangeOneYear}
        >
          1 Year
        </button>
        <button
          className={timeRange === "3y" ? "active" : ""}
          onClick={handleTimeRangeThreeYears}
        >
          3 Years
        </button>
        <button
          className={timeRange === "all" ? "active" : ""}
          onClick={handleTimeRangeAllTime}
        >
          All Time
        </button>
      </div>

      <div className="metrics-grid">
        <MetricCard
          title="Institutional Trust"
          value={68.3}
          icon="🏛️"
          description="Trust in government institutions"
          trend="up"
          trendValue={1.7}
        />
        <MetricCard
          title="Process Satisfaction"
          value={62.1}
          icon="⚖️"
          description="Satisfaction with democratic processes"
          trend="up"
          trendValue={0.9}
        />
        <MetricCard
          title="Democratic Efficacy"
          value={57.8}
          icon="🗣️"
          description="Perceived effectiveness of participation"
          trend="down"
          trendValue={1.2}
        />
      </div>

      <div className="chart-container">
        <h2 className="chart-title">Trust Evolution Over Time</h2>
        <TrustTrendChart
          data={[
            { date: "2022-01", value: 65.2 },
            { date: "2022-02", value: 65.8 },
            { date: "2022-03", value: 66.3 },
            { date: "2022-04", value: 66.9 },
            { date: "2022-05", value: 67.2 },
            { date: "2022-06", value: 67.5 },
            { date: "2022-07", value: 67.8 },
            { date: "2022-08", value: 67.3 },
            { date: "2022-09", value: 67.1 },
            { date: "2022-10", value: 67.6 },
            { date: "2022-11", value: 68.0 },
            { date: "2022-12", value: 68.3 },
          ]}
        />
      </div>

      <div className="chart-container">
        <h2 className="chart-title">Demographic Trust Comparison</h2>
        <DemographicComparison />
      </div>

      <div className="methodology-section">
        <h3>Methodology</h3>
        <p>
          Trust metrics are calculated using composite indices from Austria
          Democracy Radar survey responses. The indices combine institutional
          trust, process satisfaction, and democratic efficacy measures with
          appropriate statistical validation (Cronbach's alpha {">"} 0.7).
        </p>
      </div>
    </div>
  );
};

export default TrustMetrics;
