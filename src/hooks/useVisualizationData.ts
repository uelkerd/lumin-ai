import { useState, useEffect, useMemo } from "react";

export interface VisualizationFilters {
  dateRange: [Date, Date];
  categories: string[];
  regions: string[];
  significanceLevel: number;
  outlierThreshold: number;
}

export interface DataPoint {
  id: string;
  date: Date;
  value: number;
  category: string;
  region: string;
  metadata: Record<string, any>;
}

export const useVisualizationData = (
  dataSource: string,
  filters: Partial<VisualizationFilters> = {},
) => {
  const [rawData, setRawData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default filters
  const defaultFilters: VisualizationFilters = {
    dateRange: [new Date("2022-01-01"), new Date()],
    categories: [],
    regions: [],
    significanceLevel: 0.05,
    outlierThreshold: 3.5,
  };

  const activeFilters = { ...defaultFilters, ...filters };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // In a real application, this would be an API call
        const response = await fetch(`/api/data/${dataSource}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const data = await response.json();
        setRawData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dataSource]);

  // Filter and process data
  const processedData = useMemo(() => {
    if (!rawData.length) return [];

    return rawData.filter((point) => {
      // Date range filter
      if (
        point.date < activeFilters.dateRange[0] ||
        point.date > activeFilters.dateRange[1]
      ) {
        return false;
      }

      // Category filter
      if (
        activeFilters.categories.length > 0 &&
        !activeFilters.categories.includes(point.category)
      ) {
        return false;
      }

      // Region filter
      if (
        activeFilters.regions.length > 0 &&
        !activeFilters.regions.includes(point.region)
      ) {
        return false;
      }

      return true;
    });
  }, [rawData, activeFilters]);

  // Statistical calculations
  const statistics = useMemo(() => {
    if (!processedData.length) return null;

    const values = processedData.map((d) => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    // Outlier detection using modified Z-score
    const outliers = processedData.filter((point) => {
      const zScore = Math.abs((point.value - mean) / stdDev);
      return zScore > activeFilters.outlierThreshold;
    });

    // Quartiles
    const sortedValues = [...values].sort((a, b) => a - b);
    const q1Index = Math.floor(sortedValues.length * 0.25);
    const q3Index = Math.floor(sortedValues.length * 0.75);
    const q1 = sortedValues[q1Index];
    const q3 = sortedValues[q3Index];
    const median = sortedValues[Math.floor(sortedValues.length * 0.5)];

    return {
      count: values.length,
      mean,
      median,
      stdDev,
      variance,
      min: Math.min(...values),
      max: Math.max(...values),
      q1,
      q3,
      iqr: q3 - q1,
      outliers: outliers.length,
      outliersData: outliers,
    };
  }, [processedData, activeFilters.outlierThreshold]);

  // Correlation analysis
  const correlationAnalysis = useMemo(() => {
    if (!processedData.length) return null;

    // Group data by category for correlation analysis
    const categories = [...new Set(processedData.map((d) => d.category))];
    const correlationMatrix: number[][] = [];

    categories.forEach((cat1, i) => {
      correlationMatrix[i] = [];
      categories.forEach((cat2, j) => {
        const data1 = processedData
          .filter((d) => d.category === cat1)
          .map((d) => d.value);
        const data2 = processedData
          .filter((d) => d.category === cat2)
          .map((d) => d.value);

        if (data1.length === data2.length && data1.length > 1) {
          correlationMatrix[i][j] = calculatePearsonCorrelation(data1, data2);
        } else {
          correlationMatrix[i][j] = i === j ? 1 : 0;
        }
      });
    });

    return {
      categories,
      matrix: correlationMatrix,
    };
  }, [processedData]);

  return {
    data: processedData,
    rawData,
    loading,
    error,
    statistics,
    correlationAnalysis,
    filters: activeFilters,
  };
};

// Helper function to calculate Pearson correlation coefficient
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
  );

  return denominator === 0 ? 0 : numerator / denominator;
}

export default useVisualizationData;
