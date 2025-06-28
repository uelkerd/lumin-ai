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
      try {
        setLoading(true);
        // Fetch data for different demographic segments in parallel
        const [allData, age1825Data, age2640Data] = await Promise.all([
          getTrustMetrics({ demographic: "all" }),
          getTrustMetrics({ demographic: "age: 18-25" }),
          getTrustMetrics({ demographic: "age: 26-40" }),
        ]);

        // Combine and add a 'series' property
        const combinedData = [
          ...allData.map((d) => ({ ...d, series: "All" })),
          ...age1825Data.map((d) => ({ ...d, series: "Age: 18-25" })),
          ...age2640Data.map((d) => ({ ...d, series: "Age: 26-40" })),
        ];
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
