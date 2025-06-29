import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ErrorBar
} from 'recharts';

interface DemographicComparisonProps {
  demographic?: string;
}

const DemographicComparison: React.FC<DemographicComparisonProps> = ({ 
  demographic = 'age' 
}) => {
  // Mock data - in a real app, this would come from an API
  const getData = () => {
    switch (demographic) {
      case 'age':
        return [
          { name: '18-24', value: 58.3, ci: 3.2, significance: '*' },
          { name: '25-34', value: 62.7, ci: 2.8, significance: '**' },
          { name: '35-44', value: 67.1, ci: 2.5, significance: '**' },
          { name: '45-54', value: 70.5, ci: 2.3, significance: '***' },
          { name: '55-64', value: 73.2, ci: 2.4, significance: '***' },
          { name: '65+', value: 75.8, ci: 2.7, significance: '***' },
        ];
      case 'education':
        return [
          { name: 'Primary', value: 62.1, ci: 3.5, significance: '*' },
          { name: 'Secondary', value: 67.8, ci: 2.9, significance: '**' },
          { name: 'Vocational', value: 69.3, ci: 2.7, significance: '**' },
          { name: 'Bachelor', value: 72.5, ci: 2.4, significance: '***' },
          { name: 'Master+', value: 75.2, ci: 2.6, significance: '***' },
        ];
      case 'income':
        return [
          { name: 'Low', value: 59.7, ci: 3.4, significance: '*' },
          { name: 'Lower-Mid', value: 64.3, ci: 3.0, significance: '**' },
          { name: 'Middle', value: 68.9, ci: 2.6, significance: '**' },
          { name: 'Upper-Mid', value: 72.1, ci: 2.5, significance: '***' },
          { name: 'High', value: 74.8, ci: 2.8, significance: '***' },
        ];
      case 'region':
        return [
          { name: 'Vienna', value: 67.2, ci: 2.9, significance: '**' },
          { name: 'Lower Austria', value: 70.5, ci: 3.1, significance: '**' },
          { name: 'Upper Austria', value: 69.8, ci: 3.0, significance: '**' },
          { name: 'Styria', value: 71.3, ci: 3.2, significance: '**' },
          { name: 'Tyrol', value: 72.6, ci: 3.4, significance: '***' },
          { name: 'Carinthia', value: 68.9, ci: 3.3, significance: '**' },
          { name: 'Salzburg', value: 71.8, ci: 3.5, significance: '**' },
          { name: 'Vorarlberg', value: 73.1, ci: 3.7, significance: '***' },
          { name: 'Burgenland', value: 69.4, ci: 3.6, significance: '**' },
        ];
      default:
        return [];
    }
  };

  const data = getData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            Trust Score: <span>{item.value.toFixed(1)}</span>
          </p>
          <p className="tooltip-ci">
            95% CI: ±{data.find(d => d.name === label)?.ci.toFixed(1)}
          </p>
          <p className="tooltip-significance">
            Significance: {data.find(d => d.name === label)?.significance}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="demographic-comparison-chart">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.7)"
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis 
            domain={[0, 100]} 
            stroke="rgba(255,255,255,0.7)"
            label={{ 
              value: 'Trust Score', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: 'rgba(255,255,255,0.7)' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="value" 
            name="Trust Score" 
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
          >
            <ErrorBar 
              dataKey="ci" 
              width={4} 
              strokeWidth={2}
              stroke="#3b82f6" 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="chart-notes">
        <p>Error bars represent 95% confidence intervals</p>
        <p>Significance: * p&lt;0.05, ** p&lt;0.01, *** p&lt;0.001</p>
      </div>
    </div>
  );
};

export default DemographicComparison;