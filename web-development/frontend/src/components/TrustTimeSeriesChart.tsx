
import React, { useState, useEffect } from 'react';

interface DataPoint {
  date: string;
  trust: number;
  transparency: number;
  participation: number;
  accountability: number;
}

const TrustTimeSeriesChart: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('trust');

  useEffect(() => {
    // Simulate API call with mock time series data
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: DataPoint[] = [
        { date: '2024-01', trust: 6.8, transparency: 7.5, participation: 6.2, accountability: 7.1 },
        { date: '2024-02', trust: 6.9, transparency: 7.6, participation: 6.3, accountability: 7.0 },
        { date: '2024-03', trust: 7.0, transparency: 7.8, participation: 6.5, accountability: 7.2 },
        { date: '2024-04', trust: 7.1, transparency: 7.9, participation: 6.6, accountability: 7.3 },
        { date: '2024-05', trust: 7.0, transparency: 8.0, participation: 6.7, accountability: 7.4 },
        { date: '2024-06', trust: 7.2, transparency: 8.1, participation: 6.8, accountability: 7.5 },
      ];
      
      setData(mockData);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const metrics = [
    { key: 'trust', label: 'Overall Trust', color: '#29B6F6' },
    { key: 'transparency', label: 'Transparency', color: '#10B981' },
    { key: 'participation', label: 'Participation', color: '#F59E0B' },
    { key: 'accountability', label: 'Accountability', color: '#EF4444' }
  ];

  const maxValue = Math.max(...data.map(d => Math.max(d.trust, d.transparency, d.participation, d.accountability)));
  const minValue = Math.min(...data.map(d => Math.min(d.trust, d.transparency, d.participation, d.accountability)));

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <div className="loading-text">Loading time series data...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Metric Selector */}
      <div className="flex flex-wrap gap-sm mb-lg justify-center">
        {metrics.map((metric) => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`btn ${selectedMetric === metric.key ? 'btn-primary' : 'btn-secondary'}`}
            style={selectedMetric === metric.key ? {} : { borderColor: metric.color }}
          >
            <span 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.color }}
            ></span>
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="relative" style={{ height: '300px' }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 800 300"
          className="overflow-visible"
        >
          {/* Grid Lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="60"
              y1={50 + i * 50}
              x2="740"
              y2={50 + i * 50}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map(i => {
            const value = (maxValue - (maxValue - minValue) * (i / 4)).toFixed(1);
            return (
              <text
                key={i}
                x="45"
                y={55 + i * 50}
                fill="var(--color-silver-grey)"
                fontSize="12"
                textAnchor="end"
              >
                {value}
              </text>
            );
          })}

          {/* X-axis labels */}
          {data.map((point, index) => (
            <text
              key={index}
              x={60 + (index * 680) / (data.length - 1)}
              y="275"
              fill="var(--color-silver-grey)"
              fontSize="12"
              textAnchor="middle"
            >
              {point.date}
            </text>
          ))}

          {/* Chart Lines */}
          {selectedMetric === 'all' ? (
            // Show all metrics
            metrics.map((metric) => {
              const points = data.map((point, index) => {
                const x = 60 + (index * 680) / (data.length - 1);
                const y = 50 + ((maxValue - point[metric.key as keyof DataPoint]) / (maxValue - minValue)) * 200;
                return `${x},${y}`;
              }).join(' ');

              return (
                <polyline
                  key={metric.key}
                  points={points}
                  fill="none"
                  stroke={metric.color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-lg"
                />
              );
            })
          ) : (
            // Show selected metric
            (() => {
              const selectedMetricData = metrics.find(m => m.key === selectedMetric);
              if (!selectedMetricData) return null;

              const points = data.map((point, index) => {
                const x = 60 + (index * 680) / (data.length - 1);
                const y = 50 + ((maxValue - point[selectedMetric as keyof DataPoint]) / (maxValue - minValue)) * 200;
                return `${x},${y}`;
              }).join(' ');

              return (
                <>
                  {/* Gradient fill */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={selectedMetricData.color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={selectedMetricData.color} stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill */}
                  <polygon
                    points={`60,250 ${points} 740,250`}
                    fill="url(#chartGradient)"
                  />
                  
                  {/* Line */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke={selectedMetricData.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-lg"
                  />
                  
                  {/* Data points */}
                  {data.map((point, index) => {
                    const x = 60 + (index * 680) / (data.length - 1);
                    const y = 50 + ((maxValue - point[selectedMetric as keyof DataPoint]) / (maxValue - minValue)) * 200;
                    return (
                      <circle
                        key={index}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={selectedMetricData.color}
                        stroke="white"
                        strokeWidth="2"
                        className="drop-shadow-md"
                      />
                    );
                  })}
                </>
              );
            })()
          )}
        </svg>
      </div>

      {/* Chart Statistics */}
      <div className="mt-lg p-md glass-card">
        <div className="grid grid-cols-3 gap-lg text-center">
          <div>
            <div className="text-lg font-semibold gradient-text">
              {data.length > 0 ? data[data.length - 1][selectedMetric as keyof DataPoint] : '--'}
            </div>
            <div className="text-sm text-silver-grey">Current Value</div>
          </div>
          <div>
            <div className="text-lg font-semibold" style={{ color: '#10B981' }}>
              +{data.length > 0 ? ((data[data.length - 1][selectedMetric as keyof DataPoint] - data[0][selectedMetric as keyof DataPoint]) * 100 / data[0][selectedMetric as keyof DataPoint]).toFixed(1) : 0}%
            </div>
            <div className="text-sm text-silver-grey">Total Change</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-electric">
              {data.length > 0 ? ((data.reduce((sum, point) => sum + point[selectedMetric as keyof DataPoint], 0)) / data.length).toFixed(1) : '--'}
            </div>
            <div className="text-sm text-silver-grey">Average</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustTimeSeriesChart;
