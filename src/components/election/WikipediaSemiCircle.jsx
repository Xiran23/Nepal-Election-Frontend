import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const WikipediaSemiCircle = ({ 
  candidates = [], 
  totalVotes = 100,
  width = 400, 
  height = 200,
  showPercentages = true,
  onCandidateClick 
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!candidates.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radius = Math.min(width, height * 2) / 2;
    const innerRadius = radius * 0.4; // Thicker ring for better visibility

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height})`);

    // Prepare data
    const total = candidates.reduce((sum, c) => sum + c.votes, 0);
    const pieData = candidates.map(c => ({
      ...c,
      percentage: (c.votes / total) * 100
    }));

    const pie = d3.pie()
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2)
      .value(d => d.votes)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .padAngle(0.02)
      .padRadius(radius);

    // Draw semi-circle segments
    const arcs = g.selectAll("path")
      .data(pie(pieData))
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", d => d.data.party?.color || d.data.color || '#CBD5E1')
      .attr("stroke", "white")
      .attr("stroke-width", "2")
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("opacity", 0.8)
          .attr("stroke-width", "4");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("opacity", 1)
          .attr("stroke-width", "2");
      })
      .on("click", (event, d) => {
        if (onCandidateClick) {
          onCandidateClick(d.data);
        }
      });

    // Add dots for each candidate (Wikipedia style)
    arcs.each(function(d, i) {
      const angle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      const dotRadius = radius * 0.7;
      const x = Math.cos(angle) * dotRadius;
      const y = Math.sin(angle) * dotRadius;

      // Dot circle
      d3.select(this.parentNode)
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 18)
        .attr("fill", d.data.party?.color || d.data.color || '#CBD5E1')
        .attr("stroke", "white")
        .attr("stroke-width", "3")
        .style("cursor", "pointer")
        .on("click", () => onCandidateClick?.(d.data));

      // Candidate number
      d3.select(this.parentNode)
        .append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("text-anchor", "middle")
        .attr("dy", "0.3em")
        .attr("fill", "white")
        .attr("font-size", "10px")
        .attr("font-weight", "bold")
        .style("pointer-events", "none")
        .text(i + 1);
    });

    // Add total votes in center
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .attr("fill", "#4B5563")
      .attr("font-size", "12px")
      .text("Total Votes");

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("fill", "#1F2937")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text(total.toLocaleString());

  }, [candidates, totalVotes, width, height, onCandidateClick]);

  return (
    <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-sm">
      <svg ref={svgRef} width={width} height={height}></svg>
      
      {/* Legend with dots */}
      <div className="mt-6 grid grid-cols-2 gap-4 w-full">
        {candidates.map((candidate, index) => (
          <div 
            key={index} 
            className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition cursor-pointer"
            onClick={() => onCandidateClick?.(candidate)}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 shadow-md"
              style={{ backgroundColor: candidate.party?.color || candidate.color || '#CBD5E1' }}
            >
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{candidate.name}</p>
              <p className="text-xs text-gray-500">{candidate.party?.name}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm">{candidate.votes.toLocaleString()}</p>
              {showPercentages && (
                <p className="text-xs text-gray-500">
                  {((candidate.votes / totalVotes) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WikipediaSemiCircle;