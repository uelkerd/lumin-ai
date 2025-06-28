import { useEffect } from "react";
import * as d3 from "d3";
import { TrustDataPoint } from "../types";

export const useTrustTimeSeriesChart = (
  svgRef: React.RefObject<SVGSVGElement>,
  tooltipRef: React.RefObject<HTMLDivElement>,
  legendRef: React.RefObject<HTMLDivElement>,
  data: TrustDataPoint[],
) => {
  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    const containerWidth = 800;
    const containerHeight = 500;
    const margin = { top: 20, right: 50, bottom: 50, left: 60 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;

    svg.attr("width", containerWidth).attr("height", containerHeight);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const initialXScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.year) as [number, number])
      .range([0, width]);

    const initialYScale = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.confidence_interval[0]) as number,
        d3.max(data, (d) => d.confidence_interval[1]) as number,
      ])
      .range([height, 0]);

    let xScale = initialXScale;
    let yScale = initialYScale;

    const xAxis = g
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    const yAxis = g.append("g").call(d3.axisLeft(yScale));

    const area = d3
      .area<{ year: number; ci: [number, number] }>()
      .x((d) => xScale(d.year))
      .y0((d) => yScale(d.ci[0]))
      .y1((d) => yScale(d.ci[1]));

    const line = d3
      .line<{ year: number; trust_score: number }>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.trust_score));

    const seriesNames = Array.from(new Set(data.map((d) => d.series || "default")));
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(seriesNames);

    const dataBySeries = Array.from(
      d3.group(data, (d) => d.series || "default"),
      ([key, value]) => ({ key, value }),
    );

    const visibilityState: { [key: string]: boolean } = {};
    seriesNames.forEach((name) => (visibilityState[name] = true));

    const drawChart = (transform: d3.ZoomTransform) => {
      xScale = transform.rescaleX(initialXScale);
      yScale = transform.rescaleY(initialYScale);

      xAxis.call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
      yAxis.call(d3.axisLeft(yScale));

      const seriesGroups = g
        .selectAll(".series-group")
        .data(dataBySeries, function (d: any) {
          return d.key;
        });

      seriesGroups.exit().remove();

      const enteringSeriesGroups = seriesGroups
        .enter()
        .append("g")
        .attr("class", "series-group");

      // Area path
      enteringSeriesGroups.append("path").attr("class", "area");
      seriesGroups.merge(enteringSeriesGroups)
        .select(".area")
        .datum(function (d: any) {
          return d.value.map((v: any) => ({
            year: v.year,
            ci: v.confidence_interval,
          }));
        })
        .attr("fill", function (d: any) {
          const parentNode = this.parentNode as Element;
          const seriesKey = (d3.select(parentNode).datum() as any).key;
          return colorScale(seriesKey) as string;
        })
        .attr("opacity", 0.3)
        .attr("d", area as any)
        .style("display", function (d: any) {
           const parentNode = this.parentNode as Element;
           const seriesKey = (d3.select(parentNode).datum() as any).key;
           return visibilityState[seriesKey] ? null : "none";
        });

      // Line path
      enteringSeriesGroups.append("path").attr("class", "line");
      seriesGroups.merge(enteringSeriesGroups)
        .select(".line")
        .datum(function (d: any) {
          return d.value.map((v: any) => ({
            year: v.year,
            trust_score: v.trust_score,
          }));
        })
        .attr("fill", "none")
        .attr("stroke", function (d: any) {
            const parentNode = this.parentNode as Element;
            const seriesKey = (d3.select(parentNode).datum() as any).key;
            return colorScale(seriesKey) as string;
        })
        .attr("stroke-width", 1.5)
        .attr("d", line as any)
        .style("display", function (d: any) {
            const parentNode = this.parentNode as Element;
            const seriesKey = (d3.select(parentNode).datum() as any).key;
            return visibilityState[seriesKey] ? null : "none";
        });

      // Data points
      const dataPoints = seriesGroups.merge(enteringSeriesGroups)
        .selectAll(".data-point")
        .data(function (d: any) { return d.value; });

      dataPoints.exit().remove();

      dataPoints.enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("r", 5)
        .attr("cursor", "pointer")
        .on("mouseover", function (event, d: any) {
          if (tooltipRef.current) {
            const tooltip = d3.select(tooltipRef.current);
            tooltip.style("display", "block");
            tooltip.html(
                `Series: ${d.series}<br/>` +
                `Year: ${d.year}<br/>` +
                `Trust Score: ${d.trust_score.toFixed(2)}<br/>` +
                `CI: [${d.confidence_interval[0].toFixed(2)}, ${d.confidence_interval[1].toFixed(2)}]`
            );
          }
        })
        .on("mousemove", (event) => {
          if (tooltipRef.current) {
            tooltipRef.current.style.left = event.pageX + 10 + "px";
            tooltipRef.current.style.top = event.pageY - 20 + "px";
          }
        })
        .on("mouseout", () => {
          if (tooltipRef.current) {
            tooltipRef.current.style.display = "none";
          }
        })
        .merge(dataPoints)
        .attr("cx", (d: any) => xScale(d.year))
        .attr("cy", (d: any) => yScale(d.trust_score))
        .attr("fill", (d: any) => colorScale(d.series) as string)
        .style("display", (d: any) => (visibilityState[d.series] ? null : "none"));
    };

    drawChart(d3.zoomIdentity);

    const legend = d3.select(legendRef.current);
    legend.selectAll("*").remove();

    const legendItems = legend
      .selectAll(".legend-item")
      .data(seriesNames)
      .enter()
      .append("div")
      .attr("class", "legend-item")
      .style("display", "flex")
      .style("align-items", "center")
      .style("margin-bottom", "5px")
      .style("cursor", "pointer")
      .on("click", (event, seriesName) => {
        visibilityState[seriesName] = !visibilityState[seriesName];
        drawChart(d3.zoomTransform(svg.node() as any));
      });

    legendItems
      .append("div")
      .style("width", "20px")
      .style("height", "20px")
      .style("background-color", (d) => colorScale(d) as string)
      .style("margin-right", "5px");

    legendItems.append("span").text((d) => d);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", (event) => {
        const { transform } = event; // Destructure transform
        drawChart(transform);
      });
    
    // Remove previous zoom listener before attaching a new one
    svg.on(".zoom", null);
    svg.call(zoom);
  }, [data, svgRef, tooltipRef, legendRef]);
}; 