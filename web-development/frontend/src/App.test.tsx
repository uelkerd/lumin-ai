import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import * as api from "./api"; // Import the api module to mock it

// Mock the getTrustMetrics function
jest.mock("./api", () => ({
  getTrustMetrics: jest.fn(),
}));

const mockGetTrustMetrics = api.getTrustMetrics as jest.Mock;

test("renders TrustMetricsDashboard after fetching data", async () => {
  // Mock the API response
  mockGetTrustMetrics.mockResolvedValue([
    { wave: 1, year: 2023, trust_score: 0.5, demographic_segment: "all" },
  ]);

  render(<App />);

  // Check for loading state (optional, but good practice)
  expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

  // Wait for the dashboard to be rendered
  await waitFor(() => {
    expect(
      screen.getByText(/Trust Metrics Dashboard/i)
    ).toBeInTheDocument();
  });

  // Ensure the loading text is gone
  expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
});
