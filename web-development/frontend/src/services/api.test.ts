import { vi, describe, it, expect, afterEach } from "vitest";
import api, { fetchDashboardData } from "./api";
import { DashboardData } from "../types/dashboard";

describe("API Service", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchDashboardData", () => {
    it("should fetch dashboard data successfully", async () => {
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

      const getSpy = vi.spyOn(api, "get").mockResolvedValue({ data: mockData });

      const data = await fetchDashboardData();

      expect(data).toEqual(mockData);
      expect(getSpy).toHaveBeenCalledWith("/dashboard");
    });

    it("should handle errors when fetching dashboard data", async () => {
      const errorMessage = "Network Error";
      const getSpy = vi
        .spyOn(api, "get")
        .mockRejectedValue(new Error(errorMessage));

      await expect(fetchDashboardData()).rejects.toThrow(errorMessage);
      expect(getSpy).toHaveBeenCalledWith("/dashboard");
    });
  });
});
