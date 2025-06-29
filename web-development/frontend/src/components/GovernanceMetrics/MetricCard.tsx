import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: string;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  format?: 'number' | 'percent' | 'currency';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  description,
  trend = 'neutral',
  trendValue = 0,
  format = 'number'
}) => {
  const formatValue = (val: number): string => {
    switch (format) {
      case 'percent':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      default:
        return val.toLocaleString(undefined, { maximumFractionDigits: 1 });
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  const getTrendClass = () => {
    switch (trend) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      default:
        return 'trend-neutral';
    }
  };

  return (
    <div className="metric-card">
      <div className="metric-title">
        <span className="metric-icon">{icon}</span>
        {title}
      </div>
      <div className="metric-value">{formatValue(value)}</div>
      <div className="metric-description">{description}</div>
      {trendValue !== 0 && (
        <div className={`metric-trend ${getTrendClass()}`}>
          <span className="trend-icon">{getTrendIcon()}</span>
          <span className="trend-value">{trendValue.toFixed(1)}%</span>
          <span className="trend-period">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;