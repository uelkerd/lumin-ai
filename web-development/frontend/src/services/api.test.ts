import { vi, describe, it, expect, afterEach } from 'vitest';
import api, { fetchDashboardData, fetchTrustMetrics, fetchDemographicAnalysis, analyzeSentiment } from './api';
import { DashboardData } from '../types/dashboard';

describe('API Service', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchDashboardData', () => {
    it('should fetch dashboard data successfully', async () => {
      const mockData: DashboardData = {
        trustMetrics: {
          institutionalTrust: 68.3,
          processSatisfaction: 62.1,
          democraticEfficacy: 57.8,
        },
        sentimentAnalysis: {
          positive: 50,
          neutral: 20,
          negative: 30,
        },
        trustTrend: [],
        demographicComparison: {
          age: [],
          region: [],
        },
      };

      const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockData });

      const data = await fetchDashboardData();

      expect(data).toEqual(mockData);
      expect(getSpy).toHaveBeenCalledWith('/dashboard');
    });

    it('should handle errors when fetching dashboard data', async () => {
      const errorMessage = 'Network Error';
      const getSpy = vi.spyOn(api, 'get').mockRejectedValue(new Error(errorMessage));

      await expect(fetchDashboardData()).rejects.toThrow(errorMessage);
      expect(getSpy).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('fetchTrustMetrics', () => {
    it('should fetch trust metrics successfully', async () => {
      const mockData = { metrics: [{ date: '2023-01-01', value: 75 }] };
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockData });

      const data = await fetchTrustMetrics('1y');

      expect(data).toEqual(mockData);
      expect(getSpy).toHaveBeenCalledWith('/trust-metrics?timeRange=1y');
    });

    it('should handle errors when fetching trust metrics', async () => {
      const errorMessage = 'Network Error';
      const getSpy = vi.spyOn(api, 'get').mockRejectedValue(new Error(errorMessage));

      await expect(fetchTrustMetrics('1y')).rejects.toThrow(errorMessage);
      expect(getSpy).toHaveBeenCalledWith('/trust-metrics?timeRange=1y');
    });
  });

  describe('fetchDemographicAnalysis', () => {
    it('should fetch demographic analysis successfully', async () => {
      const mockData = { analysis: [{ group: '18-24', value: 60 }] };
      const getSpy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockData });

      const data = await fetchDemographicAnalysis('age');

      expect(data).toEqual(mockData);
      expect(getSpy).toHaveBeenCalledWith('/demographics/analysis?segment=age');
    });

    it('should handle errors when fetching demographic analysis', async () => {
      const errorMessage = 'Network Error';
      vi.spyOn(api, 'get').mockRejectedValue(new Error(errorMessage));

      await expect(fetchDemographicAnalysis('age')).rejects.toThrow(errorMessage);
    });
  });

  describe('analyzeSentiment', () => {
    it('should analyze sentiment successfully', async () => {
      const mockData = { sentiment: 'positive', score: 0.9 };
      const postSpy = vi.spyOn(api, 'post').mockResolvedValue({ data: mockData });

      const data = await analyzeSentiment('This is great!');

      expect(data).toEqual(mockData);
      expect(postSpy).toHaveBeenCalledWith('/ml/sentiment', { text: 'This is great!' });
    });

    it('should handle errors when analyzing sentiment', async () => {
      const errorMessage = 'Network Error';
      vi.spyOn(api, 'post').mockRejectedValue(new Error(errorMessage));

      await expect(analyzeSentiment('This is great!')).rejects.toThrow(errorMessage);
    });
  });
}); 