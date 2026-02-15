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
      .on("mouseover", function (event, d) {
        d3.select(this)
          .attr("opacity", 0.8)
          .attr("stroke-width", "4");
      })
      .on("mouseout", function () {
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
    arcs.each(function (d, i) {
      const angle = d.startAngle + (d.endAngle - d.startAngle) / 2;
      const dotRadius = radius * 0.7;
      const x = Math.cos(angle) * dotRadius;
      const y = Math.sin(angle) * dotRadius;

      const group = d3.select(this.parentNode).append("g");

      if (d.data.party?.logo) {
        const clipId = `logo-clip-${i}`;

        // Define a unique clip-path for this specific dot
        group.append("defs")
          .append("clipPath")
          .attr("id", clipId)
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 18);

        // Circular Logo Image (no border)
        group.append("image")
          .attr("href", d.data.party.logo)
          .attr("x", x - 18)
          .attr("y", y - 18)
          .attr("width", 36)
          .attr("height", 36)
          .attr("clip-path", `url(#${clipId})`)
          .attr("preserveAspectRatio", "xMidYMid slice")
          .style("cursor", "pointer")
          .on("click", () => onCandidateClick?.(d.data));
      } else {
        // Fallback: Plain circle with party color and number
        group.append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 18)
          .attr("fill", d.data.party?.color || d.data.color || '#CBD5E1')
          .style("cursor", "pointer")
          .on("click", () => onCandidateClick?.(d.data));

        group.append("text")
          .attr("x", x)
          .attr("y", y)
          .attr("text-anchor", "middle")
          .attr("dy", "0.3em")
          .attr("fill", "white")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .style("pointer-events", "none")
          .text(i + 1);
      }
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
    <div className="flex flex-col lg:flex-row-reverse items-center lg:items-start justify-between bg-white p-6 rounded-[4px] border border-gray-100 gap-8">
      <div className="flex-shrink-0">
        <svg ref={svgRef} width={width} height={height}></svg>
      </div>

      {/* Legend with dots */}
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 w-full">
        {candidates.map((candidate, index) => (
          <div
            key={index}
            className="flex items-center p-3 hover:bg-gray-50 rounded-[4px] border border-transparent hover:border-gray-100 transition cursor-pointer"
            onClick={() => onCandidateClick?.(candidate)}
          >
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden mr-4"
            >
              {candidate.party?.logo ? (
                <img
                  src={candidate.party.logo}
                  alt={candidate.party.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: candidate.party?.color || candidate.color || '#CBD5E1' }}
                >
                  {index + 1}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 truncate">{candidate.name}</p>
              <p className="text-xs text-gray-500 font-medium truncate">{candidate.party?.name}</p>
            </div>
            <div className="text-right ml-4">
              <p className="font-bold text-gray-900">{candidate.votes.toLocaleString()}</p>
              {showPercentages && (
                <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
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