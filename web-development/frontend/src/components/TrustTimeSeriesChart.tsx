import React, { useRef } from "react";
import { TrustDataPoint } from "../types";
import { useTrustTimeSeriesChart } from "../hooks/useTrustTimeSeriesChart";

const TrustTimeSeriesChart: React.FC<{ data: TrustDataPoint[] }> = ({
  data,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const legendRef = useRef<HTMLDivElement | null>(null);

  useTrustTimeSeriesChart(svgRef, tooltipRef, legendRef, data);

  return (
    <div>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          display: "none",
          background: "#f9f9f9",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "5px",
          pointerEvents: "none",
        }}
      />
      <div ref={legendRef} className="legend-container" />
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "500px" }}
      />
    </div>
  );
};

export default TrustTimeSeriesChart;
