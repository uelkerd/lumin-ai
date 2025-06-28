import React, { useEffect, useState } from "react";
import { getTrustMetrics } from "../../src/api";
import TrustTimeSeriesChart from "./TrustTimeSeriesChart";
import { TrustMetricsData } from "../types";

const TrustMetricsDashboard: React.FC = () => {
  const [trustMetrics, setTrustMetrics] = useState<TrustMetricsData[] | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrustMetrics = async () => {
      const demographicSegments = ["all", "age: 18-25", "age: 26-40"];
      try {
        setLoading(true);
        // Fetch data for different demographic segments in parallel
        const promises = demographicSegments.map((demographic) =>
          getTrustMetrics({ demographic }),
        );
        const results = await Promise.all(promises);

        // Combine and add a 'series' property
        const combinedData = results.flatMap((data, index) =>
          data.map((d) => ({ ...d, series: demographicSegments[index] })),
        );

        setTrustMetrics(combinedData);
      } catch (err) {
        setError("Failed to fetch trust metrics data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrustMetrics();
  }, []);

  if (loading) {
    return <div>Loading trust metrics...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Trust Metrics Dashboard</h2>
      {trustMetrics && trustMetrics.length > 0 ? (
        <TrustTimeSeriesChart data={trustMetrics} />
      ) : (
        <p>No trust metrics data available.</p>
      )}
    </div>
  );
};

export default TrustMetricsDashboard;
