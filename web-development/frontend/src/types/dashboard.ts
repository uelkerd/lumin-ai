export interface DataPoint {
  date: string;
  value: number;
}

export interface Update {
  id: number;
  title: string;
  date: string;
}

export interface DashboardData {
  trustScore: number;
  transparencyIndex: number;
  participationRate: number;
  sentimentScore: number;
  trustTrend: DataPoint[];
  recentUpdates: Update[];
}

export interface MetricData {
  title: string;
  value: number;
  icon: string;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  explanation: {
    key_phrases: string[];
    feature_importance: Record<string, number>;
  };
}