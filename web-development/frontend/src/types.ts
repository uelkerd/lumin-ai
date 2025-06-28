export interface TrustMetricsData {
  wave: number;
  year: number;
  trust_score: number;
  confidence_interval: [number, number];
  demographic_segment: string;
}
