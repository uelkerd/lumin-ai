import React, { useEffect, useState } from "react";
import { getTrustMetrics } from "../api";
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
      try {
        setLoading(true);
        const data = await getTrustMetrics();
        setTrustMetrics(data);
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
        <div>
          <TrustTimeSeriesChart data={trustMetrics} />
          <pre>{JSON.stringify(trustMetrics, null, 2)}</pre>
        </div>
      ) : (
        <p>No trust metrics data available.</p>
      )}
    </div>
  );
};

export default TrustMetricsDashboard;
