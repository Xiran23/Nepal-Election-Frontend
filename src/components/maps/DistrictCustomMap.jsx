import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getPathBoundingBox, geoJsonToSvgPath } from '../../utils/mapHelpers';

const DistrictCustomMap = ({ districtName, province }) => {
    const [geoData, setGeoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredUnit, setHoveredUnit] = useState(null);
    const svgRef = useRef(null);

    const getProvinceFolder = (provinceVal) => {
        const folders = {
            1: 'koshi_province_1_districts',
            'koshi': 'koshi_province_1_districts',
            2: 'madhesh_province_2_districts',
            'madhesh': 'madhesh_province_2_districts',
            3: 'bagmati_province_3_districts',
            'bagmati': 'bagmati_province_3_districts',
            4: 'gandaki_province_4_districts',
            'gandaki': 'gandaki_province_4_districts',
            5: 'lumbini_province_5_districts',
            'lumbini': 'lumbini_province_5_districts',
            6: 'karnali_province_6_districts',
            'karnali': 'karnali_province_6_districts',
            7: 'sudurpashchim_province_7_districts',
            'sudurpashchim': 'sudurpashchim_province_7_districts'
        };
        const key = typeof provinceVal === 'string' ? provinceVal.toLowerCase() : provinceVal;
        return folders[key] || null;
    };

    useEffect(() => {
        if (!districtName) return;

        const formatName = (str) => {
            return str.split(/[\s_]+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');
        };

        const provinceFolder = getProvinceFolder(province);
        const formattedName = formatName(districtName);

        const tryVariations = async () => {
            const variations = [
                `/data/maps-of-districts/${provinceFolder}/${formattedName}.geojson`,
                `/data/maps-of-districts/${provinceFolder}/${formattedName.charAt(0).toUpperCase() + formattedName.slice(1).toLowerCase()}.geojson`,
                `/data/Darchula.geojson`,
                `/data/${formattedName}.geojson`
            ];

            for (const path of variations) {
                try {
                    const res = await fetch(path);
                    if (res.ok) {
                        const data = await res.json();
                        setGeoData(data);
                        setLoading(false);
                        return;
                    }
                } catch (e) { continue; }
            }
            setError("Map not found");
            setLoading(false);
        };

        setLoading(true);
        tryVariations();
    }, [districtName, province]);

    // Calculate dynamic projection to fit SVG
    const mapPaths = useMemo(() => {
        if (!geoData || !geoData.features) return [];

        // 1. Get global bounding box for the entire district
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        geoData.features.forEach(f => {
            const bbox = getPathBoundingBox(f.geometry.coordinates, f.geometry.type);
            if (bbox.minX !== Infinity) {
                minX = Math.min(minX, bbox.minX);
                minY = Math.min(minY, bbox.minY);
                maxX = Math.max(maxX, bbox.maxX);
                maxY = Math.max(maxY, bbox.maxY);
            }
        });

        const width = maxX - minX;
        const height = maxY - minY;
        const padding = 40;
        const svgW = 800;
        const svgH = 500;

        const scaleX = (svgW - padding * 2) / width;
        const scaleY = (svgH - padding * 2) / height;
        const scale = Math.min(scaleX, scaleY);

        const centerLat = (minY + maxY) / 2;
        const aspectCorrection = Math.cos(centerLat * Math.PI / 180);
        const finalScaleX = scale * aspectCorrection;

        const offsetX = (svgW - width * finalScaleX) / 2;
        const offsetY = (svgH - height * scale) / 2;

        const projectionFn = (lon, lat) => ({
            x: (lon - minX) * finalScaleX + offsetX,
            y: (maxY - lat) * scale + offsetY
        });

        return geoData.features.map((f, i) => ({
            id: i,
            path: geoJsonToSvgPath(f.geometry.coordinates, projectionFn, f.geometry.type),
            properties: f.properties
        }));
    }, [geoData]);

    if (loading) return <div className="h-64 flex items-center justify-center">Loading SVG Map...</div>;
    if (error) return <div className="h-64 flex items-center justify-center text-gray-400">Custom map not available</div>;

    return (
        <div className="relative w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-inner p-4 group">
            <div className="absolute top-4 left-4 z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    Custom SVG Vector Engine
                </span>
            </div>

            <svg
                viewBox="0 0 800 500"
                className="w-full h-auto max-h-[500px]"
                preserveAspectRatio="xMidYMid meet"
            >
                {mapPaths.map((unit) => (
                    <path
                        key={unit.id}
                        d={unit.path}
                        fill={hoveredUnit === unit.id ? "#3b82f6" : "#f1f5f9"}
                        stroke={hoveredUnit === unit.id ? "#2563eb" : "#cbd5e1"}
                        strokeWidth={hoveredUnit === unit.id ? "2" : "1"}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredUnit(unit.id)}
                        onMouseLeave={() => setHoveredUnit(null)}
                    />
                ))}
            </svg>

            {/* Sub-unit Label Overlay */}
            <div className="mt-4 flex flex-wrap gap-2">
                {mapPaths.map((unit) => {
                    const name = unit.properties?.FIRST_GaPa || unit.properties?.GaPa || unit.properties?.NAME || 'Unit';
                    return (
                        <div
                            key={unit.id}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${hoveredUnit === unit.id
                                    ? 'bg-blue-600 text-white shadow-md transform scale-105'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            {name}
                        </div>
                    );
                })}
            </div>

            {/* Floating Info */}
            {hoveredUnit !== null && (
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur shadow-lg border border-blue-100 p-3 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Localized Unit</p>
                    <p className="text-sm font-bold text-slate-800">
                        {mapPaths[hoveredUnit].properties?.FIRST_GaPa || mapPaths[hoveredUnit].properties?.GaPa || mapPaths[hoveredUnit].properties?.NAME}
                    </p>
                    <p className="text-xs text-slate-500">
                        {mapPaths[hoveredUnit].properties?.FIRST_Type || mapPaths[hoveredUnit].properties?.TYPE || 'Rural Municipality'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default DistrictCustomMap;
