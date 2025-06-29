import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterPlot,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ErrorBar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardData {
  trustTrends: TrustTrendData[];
  comparativeAnalysis: ComparativeData[];
  distributions: DistributionData[];
  correlations: CorrelationMatrix;
  geographic: GeographicData[];
  outliers: OutlierData[];
}

interface TrustTrendData {
  date: string;
  trustScore: number;
  confidenceInterval: [number, number];
  transparencyIndex: number;
  participationRate: number;
  significance: boolean;
}

interface ComparativeData {
  category: string;
  current: number;
  previous: number;
  change: number;
  significance: "high" | "medium" | "low";
}

interface DistributionData {
  value: number;
  frequency: number;
  percentile: number;
}

interface CorrelationMatrix {
  variables: string[];
  values: number[][];
  significance: number[][];
}

interface GeographicData {
  region: string;
  latitude: number;
  longitude: number;
  trustScore: number;
  population: number;
}

interface OutlierData {
  id: string;
  value: number;
  expected: number;
  deviation: number;
  category: string;
}

const AdvancedDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "1y" | "3y" | "5y"
  >("1y");
  const [selectedMetric, setSelectedMetric] = useState<
    "trust" | "transparency" | "participation"
  >("trust");
  const [loading, setLoading] = useState(true);

  // Professional color palette - colorblind friendly
  const colorPalette = {
    primary: "#2563eb", // Blue
    secondary: "#7c3aed", // Purple
    success: "#059669", // Green
    warning: "#d97706", // Orange
    error: "#dc2626", // Red
    neutral: "#6b7280", // Gray
    accent: "#0891b2", // Cyan
    highlight: "#7c2d12", // Brown
  };

  // Mock data generation with realistic patterns
  const generateMockData = (): DashboardData => {
    const trustTrends: TrustTrendData[] = [];
    const baseDate = new Date("2022-01-01");

    for (let i = 0; i < 24; i++) {
      const date = new Date(baseDate);
      date.setMonth(date.getMonth() + i);

      const trend = 65 + Math.sin(i * 0.3) * 5 + Math.random() * 3;
      const ci: [number, number] = [trend - 2.5, trend + 2.5];

      trustTrends.push({
        date: date.toISOString().slice(0, 7),
        trustScore: trend,
        confidenceInterval: ci,
        transparencyIndex: trend + Math.random() * 10 - 5,
        participationRate: trend * 0.8 + Math.random() * 8,
        significance: Math.random() > 0.3,
      });
    }

    const comparativeAnalysis: ComparativeData[] = [
      {
        category: "Government Trust",
        current: 72.5,
        previous: 68.2,
        change: 6.3,
        significance: "high",
      },
      {
        category: "Transparency Score",
        current: 68.3,
        previous: 65.1,
        change: 4.9,
        significance: "medium",
      },
      {
        category: "Civic Participation",
        current: 45.2,
        previous: 47.8,
        change: -5.4,
        significance: "high",
      },
      {
        category: "Policy Satisfaction",
        current: 58.7,
        previous: 56.3,
        change: 4.3,
        significance: "low",
      },
      {
        category: "Democratic Efficacy",
        current: 61.4,
        previous: 59.8,
        change: 2.7,
        significance: "medium",
      },
    ];

    const distributions: DistributionData[] = [];
    for (let i = 0; i <= 100; i += 2) {
      distributions.push({
        value: i,
        frequency:
          Math.exp(-Math.pow(i - 70, 2) / 200) * 100 + Math.random() * 10,
        percentile: i,
      });
    }

    const correlations: CorrelationMatrix = {
      variables: [
        "Trust",
        "Transparency",
        "Participation",
        "Satisfaction",
        "Efficacy",
      ],
      values: [
        [1.0, 0.78, 0.65, 0.82, 0.71],
        [0.78, 1.0, 0.59, 0.74, 0.68],
        [0.65, 0.59, 1.0, 0.61, 0.77],
        [0.82, 0.74, 0.61, 1.0, 0.69],
        [0.71, 0.68, 0.77, 0.69, 1.0],
      ],
      significance: [
        [0.0, 0.001, 0.003, 0.0, 0.002],
        [0.001, 0.0, 0.005, 0.001, 0.003],
        [0.003, 0.005, 0.0, 0.004, 0.001],
        [0.0, 0.001, 0.004, 0.0, 0.002],
        [0.002, 0.003, 0.001, 0.002, 0.0],
      ],
    };

    const geographic: GeographicData[] = [
      {
        region: "Vienna",
        latitude: 48.2082,
        longitude: 16.3738,
        trustScore: 74.2,
        population: 1897000,
      },
      {
        region: "Graz",
        latitude: 47.0707,
        longitude: 15.4395,
        trustScore: 71.8,
        population: 328000,
      },
      {
        region: "Linz",
        latitude: 48.3069,
        longitude: 14.2858,
        trustScore: 69.5,
        population: 206000,
      },
      {
        region: "Salzburg",
        latitude: 47.8095,
        longitude: 13.055,
        trustScore: 73.1,
        population: 155000,
      },
      {
        region: "Innsbruck",
        latitude: 47.2692,
        longitude: 11.4041,
        trustScore: 70.9,
        population: 132000,
      },
    ];

    const outliers: OutlierData[] = [
      {
        id: "OUT001",
        value: 45.2,
        expected: 68.5,
        deviation: -23.3,
        category: "Rural Trust",
      },
      {
        id: "OUT002",
        value: 89.1,
        expected: 72.3,
        deviation: 16.8,
        category: "Urban Transparency",
      },
      {
        id: "OUT003",
        value: 32.7,
        expected: 58.4,
        deviation: -25.7,
        category: "Youth Participation",
      },
    ];

    return {
      trustTrends,
      comparativeAnalysis,
      distributions,
      correlations,
      geographic,
      outliers,
    };
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData(generateMockData());
      setLoading(false);
    }, 1500);
  }, []);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}:{" "}
              {typeof entry.value === "number"
                ? entry.value.toFixed(2)
                : entry.value}
              {entry.payload?.significance && (
                <span className="ml-2 text-xs">***</span>
              )}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) return <div>No data available</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Democratic Governance Analytics Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Advanced insights into trust, transparency, and civic participation
            patterns
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-4"
        >
          <div className="flex gap-2">
            {(["1y", "3y", "5y"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTimeRange === range
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["trust", "transparency", "participation"] as const).map(
              (metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                    selectedMetric === metric
                      ? "bg-purple-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {metric}
                </button>
              ),
            )}
          </div>
        </motion.div>

        {/* Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Trust Evolution with Confidence Intervals
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trustTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} domain={[60, 80]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                {/* Confidence interval area */}
                <Area
                  type="monotone"
                  dataKey="confidenceInterval"
                  stroke="none"
                  fill={colorPalette.primary}
                  fillOpacity={0.1}
                />

                {/* Main trend line */}
                <Line
                  type="monotone"
                  dataKey="trustScore"
                  stroke={colorPalette.primary}
                  strokeWidth={3}
                  dot={{ fill: colorPalette.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{
                    r: 6,
                    stroke: colorPalette.primary,
                    strokeWidth: 2,
                  }}
                />

                {/* Significance markers */}
                {data.trustTrends.map(
                  (point, index) =>
                    point.significance && (
                      <ReferenceLine
                        key={index}
                        x={point.date}
                        stroke={colorPalette.warning}
                        strokeDasharray="2 2"
                      />
                    ),
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            *** Statistically significant changes (p &lt; 0.05). Shaded area
            represents 95% confidence interval.
          </p>
        </motion.div>

        {/* Comparative Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Year-over-Year Performance Comparison
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.comparativeAnalysis} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="category"
                  stroke="#6b7280"
                  fontSize={12}
                  width={120}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />

                <Bar
                  dataKey="previous"
                  name="Previous Year"
                  fill={colorPalette.neutral}
                />
                <Bar
                  dataKey="current"
                  name="Current Year"
                  fill={colorPalette.primary}
                >
                  {data.comparativeAnalysis.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.significance === "high"
                          ? colorPalette.success
                          : entry.significance === "medium"
                            ? colorPalette.warning
                            : colorPalette.neutral
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>High Significance (p &lt; 0.01)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Medium Significance (p &lt; 0.05)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span>Low Significance (p ≥ 0.05)</span>
            </div>
          </div>
        </motion.div>

        {/* Distribution Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Trust Score Distribution Analysis
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.distributions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="value"
                  stroke="#6b7280"
                  fontSize={12}
                  label={{
                    value: "Trust Score",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  label={{
                    value: "Frequency",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="frequency"
                  stroke={colorPalette.secondary}
                  fill={colorPalette.secondary}
                  fillOpacity={0.6}
                />

                {/* Mean line */}
                <ReferenceLine
                  x={70}
                  stroke={colorPalette.error}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: "Mean: 70.2", position: "topRight" }}
                />

                {/* Quartile lines */}
                <ReferenceLine
                  x={62}
                  stroke={colorPalette.warning}
                  strokeDasharray="2 2"
                  label={{ value: "Q1", position: "top" }}
                />
                <ReferenceLine
                  x={78}
                  stroke={colorPalette.warning}
                  strokeDasharray="2 2"
                  label={{ value: "Q3", position: "top" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Distribution shows normal pattern with slight positive skew. Q1:
            62.0, Median: 70.2, Q3: 78.0, IQR: 16.0
          </p>
        </motion.div>

        {/* Correlation Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Variable Correlation Matrix
          </h2>
          <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
            {data.correlations.variables.map((rowVar, i) =>
              data.correlations.variables.map((colVar, j) => {
                const correlation = data.correlations.values[i][j];
                const significance = data.correlations.significance[i][j];
                const intensity = Math.abs(correlation);
                const isPositive = correlation > 0;

                return (
                  <div
                    key={`${i}-${j}`}
                    className="aspect-square flex items-center justify-center text-xs font-medium rounded"
                    style={{
                      backgroundColor:
                        i === j
                          ? "#f3f4f6"
                          : isPositive
                            ? `rgba(34, 197, 94, ${intensity})`
                            : `rgba(239, 68, 68, ${intensity})`,
                      color: intensity > 0.5 ? "white" : "black",
                    }}
                    title={`${rowVar} vs ${colVar}: r=${correlation.toFixed(3)}, p=${significance.toFixed(3)}`}
                  >
                    {correlation.toFixed(2)}
                    {significance < 0.001 && <span className="ml-1">***</span>}
                    {significance < 0.01 && significance >= 0.001 && (
                      <span className="ml-1">**</span>
                    )}
                    {significance < 0.05 && significance >= 0.01 && (
                      <span className="ml-1">*</span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
          <div className="flex justify-center gap-8 mt-4 text-sm">
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-1"></div>
              <span>Positive</span>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 bg-red-500 rounded mx-auto mb-1"></div>
              <span>Negative</span>
            </div>
            <div className="text-center">
              <span>* p&lt;0.05, ** p&lt;0.01, *** p&lt;0.001</span>
            </div>
          </div>
        </motion.div>

        {/* Geographic Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Regional Trust Score Distribution
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterPlot>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  type="number"
                  dataKey="longitude"
                  stroke="#6b7280"
                  fontSize={12}
                  label={{
                    value: "Longitude",
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="latitude"
                  stroke="#6b7280"
                  fontSize={12}
                  label={{
                    value: "Latitude",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold">{data.region}</p>
                          <p>Trust Score: {data.trustScore.toFixed(1)}</p>
                          <p>Population: {data.population.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter data={data.geographic} fill={colorPalette.accent}>
                  {data.geographic.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.trustScore > 73
                          ? colorPalette.success
                          : entry.trustScore > 70
                            ? colorPalette.warning
                            : colorPalette.error
                      }
                    />
                  ))}
                </Scatter>
              </ScatterPlot>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>High Trust (&gt;73)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Medium Trust (70-73)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Low Trust (&lt;70)</span>
            </div>
          </div>
        </motion.div>

        {/* Outlier Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Outlier Detection and Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.outliers.map((outlier, index) => (
              <div
                key={outlier.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-lg mb-2">
                  {outlier.category}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Observed:</span>
                    <span className="font-medium">
                      {outlier.value.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected:</span>
                    <span className="font-medium">
                      {outlier.expected.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deviation:</span>
                    <span
                      className={`font-medium ${
                        outlier.deviation > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {outlier.deviation > 0 ? "+" : ""}
                      {outlier.deviation.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      Math.abs(outlier.deviation) > 20
                        ? "bg-red-500"
                        : Math.abs(outlier.deviation) > 10
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                    }`}
                    style={{
                      width: `${Math.min(Math.abs(outlier.deviation) * 2, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Outliers identified using modified Z-score method (threshold: |Z|
            &gt; 3.5). Red indicates extreme outliers requiring investigation.
          </p>
        </motion.div>

        {/* Export Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 flex justify-center gap-4"
        >
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Export as PNG
          </button>
          <button className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            Export as HTML
          </button>
          <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Export Data (CSV)
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AdvancedDashboard;
