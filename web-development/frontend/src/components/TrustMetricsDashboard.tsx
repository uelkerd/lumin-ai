import React, { useEffect, useState } from 'react';
import { getTrustMetrics } from '../../src/api';
import TrustTimeSeriesChart from './TrustTimeSeriesChart';

interface TrustMetricsData {
  wave: number;
  year: number;
  trust_score: number;
  confidence_interval: [number, number];
  demographic_segment: string;
  series?: string; // Add a series property to identify the data series
}

const TrustMetricsDashboard: React.FC = () => {
  const [trustMetrics, setTrustMetrics] = useState<TrustMetricsData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrustMetrics = async () => {
      try {
        setLoading(true);
        // Fetch data for different demographic segments
        const allData = await getTrustMetrics({ demographic: 'all' });
        const age1825Data = await getTrustMetrics({ demographic: 'age: 18-25' });
        const age2640Data = await getTrustMetrics({ demographic: 'age: 26-40' });

        // Combine and add a 'series' property
        const combinedData = [
          ...allData.map(d => ({ ...d, series: 'All' })),
          ...age1825Data.map(d => ({ ...d, series: 'Age: 18-25' })),
          ...age2640Data.map(d => ({ ...d, series: 'Age: 26-40' })),
        ];
        setTrustMetrics(combinedData);
      } catch (err) {
        setError('Failed to fetch trust metrics data.');
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
      {trustMetrics && trustMetrics.length > 0 ? ( <TrustTimeSeriesChart data={trustMetrics} /> ) : (
        <p>No trust metrics data available.</p>
      )}
    </div>
  );
};

export default TrustMetricsDashboard;