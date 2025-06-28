import React, { useEffect, useState } from "react";
import { getDemographics } from "../../src/api";
import * as d3 from "d3";

interface DemographicData {
  demographic_category: string;
  demographic_segment: string;
  trust_score: number;
  statistical_significance: string;
  confidence_interval: [number, number];
}

const DemographicAnalysisChart: React.FC = () => {
  const [data, setData] = useState<DemographicData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const margin = { top: 20, right: 30, bottom: 40, left: 90 };
  const [selectedCategory, setSelectedCategory] = useState<string>("age");

  const demographicCategories = [
    "age",
    "education",
    "income",
    "regional",
    "political-affiliation",
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const demographicData = await getDemographics({
          demographic: selectedCategory,
        });
        setData(demographicData);
      } catch (err) {
        setError("Failed to fetch demographic data.");
        console.error("Error fetching demographic data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory]);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    // Clear previous chart elements
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand().range([0, width]).padding(0.1);

    const y = d3.scaleLinear().range([height, 0]);

    // Filter out empty or duplicate demographic_segment values
    const filteredData = data
      .filter(
        (d) => d.demographic_segment && d.demographic_segment.trim() !== "",
      )
      .filter(
        (d, i, arr) =>
          arr.findIndex(
            (item) => item.demographic_segment === d.demographic_segment,
          ) === i,
      );

    x.domain(filteredData.map((d) => d.demographic_segment));
    y.domain([0, d3.max(filteredData, (d) => d.trust_score) || 1]); // Ensure y-domain starts at 0

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    g.append("g").call(d3.axisLeft(y));

    // Add bars
    g.selectAll(".bar")
      .data(filteredData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.demographic_segment)!)
      .attr("y", (d) => y(d.trust_score))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.trust_score))
      .attr("fill", "steelblue"); // You can add more sophisticated coloring later
  }, [data, selectedCategory]); // Redraw chart when data or selectedCategory changes

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <div>
      <h2>Demographic Analysis</h2>
      <div style={{ marginBottom: "10px" }}>
        Select Demographic Category:
        <select value={selectedCategory} onChange={handleCategoryChange}>
          {demographicCategories.map((category) => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {loading && <p>Loading demographic data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {data && (
        <div>
          <svg ref={svgRef} width="600" height="400" /> {/* Add SVG element */}
        </div>
      )}
    </div>
  );
};

export default DemographicAnalysisChart;
