import React, { useMemo } from 'react';

const ParliamentChart = ({
    data,
    totalSeats = 275,
    width = 600,
    height = 300
}) => {
    const { dots, standardizedData } = useMemo(() => {
        // 1. Standardize data
        const cleanData = (data || []).map(d => ({
            name: d.name || d.party?.name || 'Unknown',
            seats: d.seats || d.votes || 0,
            color: d.color || d.party?.color || '#CBD5E1'
        }));

        // 2. Generate semi-circle points
        const points = [];
        const rows = Math.max(4, Math.floor(width / 40)); // Scale rows based on width

        // Anchor the semi-circle at the bottom-center of the SVG area
        const centerX = width / 2;
        const centerY = height - 20; // Leave space for labels at bottom

        // Calculate max radius that fits in the semi-circle box
        // Width constraint: radius <= width/2
        // Height constraint: radius <= height (minus margins)
        const maxRadius = Math.min(centerX - 10, centerY - 10);
        const innerRadius = maxRadius * 0.3;

        // Create rows
        let seatsPerRow = [];
        let totalCapacity = 0;

        // Distribute seats roughly proportional to arc length
        for (let i = 0; i < rows; i++) {
            const r = innerRadius + (maxRadius - innerRadius) * (i / (rows - 1));
            // Just push radius for now
            seatsPerRow.push(r);
        }

        const totalRadiusSum = seatsPerRow.reduce((a, b) => a + b, 0);

        // Map radius to seat count
        seatsPerRow = seatsPerRow.map(r => Math.round((r / totalRadiusSum) * totalSeats));

        // Fix rounding errors to match totalSeats exactly
        let currentTotal = seatsPerRow.reduce((a, b) => a + b, 0);
        let diff = totalSeats - currentTotal;

        let rowIndex = rows - 1;
        while (diff !== 0) {
            if (diff > 0) {
                seatsPerRow[rowIndex]++;
                diff--;
            } else {
                if (seatsPerRow[rowIndex] > 0) {
                    seatsPerRow[rowIndex]--;
                    diff++;
                }
            }
            rowIndex = (rowIndex - 1 + rows) % rows;
        }

        // Generate coordinates

        // Expand data into individual seats
        const allSeats = [];
        cleanData.forEach(party => {
            for (let k = 0; k < party.seats; k++) {
                allSeats.push({ ...party });
            }
        });

        // Fill remaining with vacant/gray if needed
        while (allSeats.length < totalSeats) {
            allSeats.push({ name: 'Vacant', color: '#E2E8F0', seats: 0 });
        }

        // Assign positions
        let currentSeatIndex = 0;

        // Iterate rows
        for (let i = 0; i < rows; i++) {
            const r = innerRadius + (maxRadius - innerRadius) * (i / (rows - 1));
            const count = seatsPerRow[i];
            const angleStep = Math.PI / (count > 1 ? count - 1 : 1);

            for (let j = 0; j < count; j++) {
                if (currentSeatIndex >= allSeats.length) break;

                const angle = Math.PI - (j * angleStep); // 180 to 0
                const x = centerX + r * Math.cos(angle);
                const y = centerY - r * Math.sin(angle);

                points.push({
                    x, y,
                    r: Math.max(2, width / 60), // Responsive dot size
                    ...allSeats[currentSeatIndex]
                });
                currentSeatIndex++;
            }
        }

        return { dots: points, standardizedData: cleanData };
    }, [data, totalSeats, width, height]);

    const totalCount = standardizedData.reduce((acc, curr) => acc + curr.seats, 0);

    return (
        <div className="flex flex-col items-center w-full">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                {dots.map((dot, i) => (
                    <circle
                        key={i}
                        cx={dot.x}
                        cy={dot.y}
                        r={dot.r}
                        fill={dot.color}
                        className="transition-all duration-300 hover:opacity-80"
                    >
                        <title>{dot.name}</title>
                    </circle>
                ))}

                {/* Center Label for Total */}
                <text
                    x={width / 2}
                    y={height - 5}
                    textAnchor="middle"
                    className="text-xs font-bold fill-slate-500 uppercase tracking-widest"
                >
                    Total: {totalCount}
                </text>
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 text-xs">
                {standardizedData.filter(d => d.seats > 0).map((party, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                        <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: party.color }}
                        />
                        <span className="text-slate-600 font-medium">
                            {party.name} <span className="font-bold text-slate-800">({party.seats})</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParliamentChart;
