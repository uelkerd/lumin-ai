import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DataPoint {
  date: string;
  value: number;
}

interface TrustTrendChartProps {
  data: DataPoint[];
}

const TrustTrendChart: React.FC<TrustTrendChartProps> = ({ data }) => {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{formatDate(label)}</p>
          <p className="tooltip-value">
            Trust Score: <span>{payload[0].value.toFixed(1)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="trust-trend-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="rgba(255,255,255,0.7)"
          />
          <YAxis 
            domain={[
              (dataMin: number) => Math.floor(dataMin - 5), 
              (dataMax: number) => Math.ceil(dataMax + 5)
            ]}
            stroke="rgba(255,255,255,0.7)"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            name="Trust Score"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: "#0f172a" }}
            activeDot={{ r: 8, strokeWidth: 0, fill: "#8b5cf6" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrustTrendChart;