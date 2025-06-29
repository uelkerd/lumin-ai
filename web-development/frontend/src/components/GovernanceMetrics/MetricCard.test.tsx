import React from "react";
import { render, screen } from "@testing-library/react";
import MetricCard from "./MetricCard";
import { describe, it, expect } from "vitest";

describe("MetricCard", () => {
  it("renders the metric card with the correct data", () => {
    render(
      <MetricCard
        title="Institutional Trust"
        value={68.3}
        icon="🏛️"
        description="Trust in government institutions"
        trend="up"
        trendValue={1.7}
      />
    );

    expect(screen.getByText("Institutional Trust")).toBeInTheDocument();
    expect(screen.getByText("68.3")).toBeInTheDocument();
    expect(screen.getByText("🏛️")).toBeInTheDocument();
    expect(
      screen.getByText("Trust in government institutions")
    ).toBeInTheDocument();
    expect(screen.getByText("↑")).toBeInTheDocument();
    expect(screen.getByText("1.7%")).toBeInTheDocument();
  });
}); 