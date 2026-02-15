import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const ResultSemiCircle = ({ candidates = [], totalVotes = 100, width = 400, height = 200 }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!candidates.length || !svgRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous

        const radius = Math.min(width, height * 2) / 2;
        const innerRadius = radius * 0.6;

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${height})`);

        const pie = d3.pie()
            .startAngle(-Math.PI / 2)
            .endAngle(Math.PI / 2)
            .value(d => d.votes)
            .sort(null);

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        const arcs = g.selectAll("arc")
            .data(pie(candidates))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => d.data.party?.color || d.data.color || '#ccc')
            .attr("stroke", "white")
            .style("stroke-width", "2px");

        arcs.append("title")
            .text(d => `${d.data.name} (${d.data.party?.name || 'N/A'}): ${d.data.votes} votes`);

    }, [candidates, totalVotes, width, height]);

    return (
        <div className="flex flex-col items-center">
            <svg ref={svgRef} width={width} height={height}></svg>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {candidates.map((cand, i) => (
                    <div key={i} className="flex items-center">
                        <span
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: cand.party?.color || cand.color || '#ccc' }}
                        ></span>
                        <span>{cand.name}: <span className="font-bold">{cand.votes}</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResultSemiCircle;
