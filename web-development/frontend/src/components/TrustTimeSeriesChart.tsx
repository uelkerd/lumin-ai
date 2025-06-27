import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface TrustDataPoint {
  wave: number;
  year: number;
  trust_score: number;
  confidence_interval: [number, number];
  demographic_segment: string;
  series: string; // Added series property
}

interface TrustTimeSeriesChartProps {
  data: TrustDataPoint[];
}

const TrustTimeSeriesChart: React.FC<TrustTimeSeriesChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const areaRef = useRef<SVGPathElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const legendRef = useRef<HTMLDivElement | null>(null); // Ref for the legend container

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const containerWidth = 800; // Use a larger container width for better visualization
    const containerHeight = 500; // Use a larger container height
    const margin = { top: 20, right: 50, bottom: 50, left: 60 }; // Adjust margins


    // Clear previous chart
    svg.select('g').remove(); // Clear only the chart group
 
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    // Define scales

    const initialXScale = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([0, width]);

    const initialYScale = d3.scaleLinear()
      .domain([d3.min(data, (d) => d.confidence_interval[0]) as number, d3.max(data, (d) => d.confidence_interval[1]) as number])
      .range([height, 0]);

    // Set up SVG dimensions
    svg.attr('width', containerWidth)
       .attr('height', containerHeight);


    let xScale = initialXScale;
    let yScale = initialYScale;

    // Add X axis
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d'))); // Format as integer years

    // Add Y axis
    const yAxis = g.append('g').call(d3.axisLeft(yScale));

    // Define the area for confidence intervals
    const area = d3.area<{ year: number, ci: [number, number] }>() // Use a simplified type for area generator
      .x((d) => xScale(d.year))
      .y0((d) => yScale(d.ci[0]))
      .y1((d) => yScale(d.ci[1]));

    // Define the line
    const line = d3.line<{ year: number, trust_score: number }>() // Use a simplified type for line generator
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.trust_score));

    // Get unique series names
    const seriesNames = Array.from(new Set(data.map(d => d.series)));

    // Define a color scale (you can use a categorical color scale)
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(seriesNames);

    // Group data by series
    const dataBySeries = Array.from(d3.group(data, d => d.series), ([key, value]) => ({ key, value }));

    // Maintain visibility state for each series
    const visibilityState: { [key: string]: boolean } = {};
    seriesNames.forEach(name => visibilityState[name] = true);

    // Function to draw or update chart elements
    const drawChart = (transform: d3.ZoomTransform) => {
      xScale = transform.rescaleX(initialXScale);
      yScale = transform.rescaleY(initialYScale);

      // Update axes
      xAxis.call(d3.axisBottom(xScale).tickFormat(d3.format('d')));
      yAxis.call(d3.axisLeft(yScale));

      // Draw areas and lines for each series
      const seriesGroups = g.selectAll('.series-group')
        .data(dataBySeries, d => d.key);

      seriesGroups.exit().remove();

      const enteringSeriesGroups = seriesGroups.enter()
        .append('g')
        .attr('class', 'series-group');

      // Draw areas (confidence intervals)
      enteringSeriesGroups.append('path').attr('class', 'area');
      seriesGroups.select('.area')
        .datum(d => d.value.map(v => ({ year: v.year, ci: v.confidence_interval }))) // Bind simplified data for area
        .attr('fill', d => colorScale(d3.select(d3.select(this).node()?.parentNode as any).datum()?.key as string) as string)
        .attr('opacity', 0.3)
        .attr('d', area)
        .style('display', d => visibilityState[d3.select(d3.select(this).node()?.parentNode as any).datum()?.key as string] ? null : 'none');

      // Draw lines (trust scores)
      enteringSeriesGroups.append('path').attr('class', 'line');
      seriesGroups.select('.line')
        .datum(d => d.value.map(v => ({ year: v.year, trust_score: v.trust_score }))) // Bind simplified data for line
        .attr('fill', 'none')
        .attr('stroke', d => colorScale(d3.select(d3.select(this).node()?.parentNode as any).datum()?.key as string) as string)
        .attr('stroke-width', 1.5)
        .attr('d', line)
        .style('display', d => visibilityState[d3.select(d3.select(this).node()?.parentNode as any).datum()?.key as string] ? null : 'none');

      // Add circles for data points
      enteringSeriesGroups.selectAll('.data-point').data(d => d.value).enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('r', 5)
        .attr('fill', d => colorScale(d.series) as string)
        .attr('cursor', 'pointer')
        .on('mouseover', (event, d) => {
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'block';
            tooltipRef.current.innerHTML = `Series: ${d.series}<br>Year: ${d.year}<br>Trust Score: ${d.trust_score.toFixed(2)}<br>CI: [${d.confidence_interval[0].toFixed(2)}, ${d.confidence_interval[1].toFixed(2)}]`;
          }
        })
        .on('mousemove', (event) => {
          if (tooltipRef.current) {
            tooltipRef.current.style.left = (event.pageX + 10) + 'px';
            tooltipRef.current.style.top = (event.pageY - 20) + 'px';
          }
        })
        .on('mouseout', () => {
          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
          }
        });

      // Update circle positions
      g.selectAll('.data-point')
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => yScale(d.trust_score))
        .style('display', d => visibilityState[d.series] ? null : 'none');
    };

    // Initialize chart
    drawChart(d3.zoomIdentity);

    // Create Legend
    const legend = d3.select(legendRef.current);
    legend.selectAll('*').remove(); // Clear previous legend

    const legendItems = legend.selectAll('.legend-item')
      .data(seriesNames)
      .enter()
      .append('div')
      .attr('class', 'legend-item')
      .style('display', 'flex')
      .style('align-items', 'center')
      .style('margin-bottom', '5px')
      .style('cursor', 'pointer')
      .on('click', (event, seriesName) => {
        visibilityState[seriesName] = !visibilityState[seriesName];
        // Redraw the chart to reflect the visibility change
        drawChart(d3.zoomTransform(svg.node() as any));
      });

    legendItems.append('div')
      .style('width', '20px')
      .style('height', '20px')
      .style('background-color', d => colorScale(d) as string)
      .style('margin-right', '5px');

    legendItems.append('span')
      .text(d => d);

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10]) // Allow zooming up to 10x
      .translateExtent([[0, 0], [width, height]]) // Restrict pan to the chart area
      .on('zoom', (event) => {
        const transform = event.transform;
        drawChart(transform); // Redraw chart with new transform
      });

    svg.call(zoom as any);

    // Initial draw
    drawChart(d3.zoomIdentity);

  }, [data]); // Re-run effect when data changes

  return (
    <div style={{ position: 'relative' }}>
      <svg ref={svgRef}></svg>
      <div ref={legendRef} className="legend" style={{
        marginTop: '10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}></div>
      <div ref={tooltipRef} className="tooltip" style={{
        position: 'absolute',
        display: 'none',
        padding: '8px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        borderRadius: '4px',
        pointerEvents: 'none', // Allows interaction with the chart underneath
        fontSize: '12px',
        zIndex: 1000 // Ensure tooltip is above other elements
      }}></div>
    </div>
  );
};

export default TrustTimeSeriesChart;