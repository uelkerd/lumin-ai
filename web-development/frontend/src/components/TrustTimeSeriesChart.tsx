import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface TrustDataPoint {
  wave: number;
  year: number;
  trust_score: number;
  confidence_interval: [number, number];
  demographic_segment: string;
}

interface TrustTimeSeriesChartProps {
  data: TrustDataPoint[];
}

const TrustTimeSeriesChart: React.FC<TrustTimeSeriesChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const containerWidth = 800; // Use a larger container width for better visualization
    const containerHeight = 500; // Use a larger container height
    const margin = { top: 20, right: 50, bottom: 50, left: 60 }; // Adjust margins
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    // Clear previous chart
    svg.selectAll('*').remove();

    // Set up SVG dimensions
    svg.attr('width', containerWidth)
       .attr('height', containerHeight);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const initialXScale = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([0, width]);

    const initialYScale = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.trust_score) as number])
      .range([height, 0]);

    let xScale = initialXScale;
    let yScale = initialYScale;

    // Add X axis
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d'))); // Format as integer years

    // Add Y axis
    const yAxis = g.append('g').call(d3.axisLeft(yScale));

    // Define the line
    const line = d3.line<TrustDataPoint>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.trust_score));

    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10]) // Allow zooming up to 10x
      .translateExtent([[0, 0], [width, height]]) // Restrict pan to the chart area
      .on('zoom', (event) => {
        const transform = event.transform;

        // Update scales based on zoom
        xScale = transform.rescaleX(initialXScale);
        yScale = transform.rescaleY(initialYScale);

        // Update axes
        xAxis.call(d3.axisBottom(xScale).tickFormat(d3.format('d')));
        yAxis.call(d3.axisLeft(yScale));

        // Update line path with new scales
        const updatedLine = d3.line<TrustDataPoint>()
          .x((d) => xScale(d.year))
          .y((d) => yScale(d.trust_score));
        path.attr('d', updatedLine(data) as any);
      });

    svg.call(zoom as any); // Apply zoom behavior to the SVG

  }, [data]); // Redraw chart when data changes

  return (
    <svg ref={svgRef}></svg>
  );
};

export default TrustTimeSeriesChart;