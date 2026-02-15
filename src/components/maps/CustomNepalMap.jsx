import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import DistrictMapTooltip from './DistrictMapTooltip';
import MapLegend from './MapLegend';
import { fetchDistrictElectionData } from '../../store/electionSlice';
import { getPartyColor, geoJsonToSvgPath, calculateGeoJsonCentroid, getPathBoundingBox } from '../../utils/mapHelpers';

// Import constituency data
import constituencyData from '../../data/nepal-constituencies.json';

// SVG dimensions
const SVG_WIDTH = 800;
const SVG_HEIGHT = 600;
const PADDING = 30;

const MapFilterHeader = ({
    mapLevel,
    setMapLevel,
    selectedProvince,
    setSelectedProvince,
    selectedDistrict,
    setSelectedDistrict,
    selectedMunicipality,
    setSelectedMunicipality,
    provinces,
    districts,
    municipalities,
    onReset
}) => {
    return (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 border-b border-slate-200">
            <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                {['national', 'province', 'district', 'municipality'].map((level) => (
                    <button
                        key={level}
                        onClick={() => setMapLevel(level)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${mapLevel === level
                            ? 'bg-nepalBlue text-white shadow-sm'
                            : 'text-slate-500 hover:bg-slate-50'
                            }`}
                    >
                        {level.toUpperCase()}
                    </button>
                ))}
            </div>

            {mapLevel !== 'national' && (
                <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Province</option>
                    {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            )}

            {(mapLevel === 'district' || mapLevel === 'municipality') && selectedProvince && (
                <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            )}

            {mapLevel === 'municipality' && selectedDistrict && (
                <select
                    value={selectedMunicipality}
                    onChange={(e) => setSelectedMunicipality(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select Municipality</option>
                    {municipalities.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            )}

            <button
                onClick={onReset}
                className="ml-auto p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Reset Filters"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>
    );
};

const PROVINCES = [
    { id: 'koshi_province_1', name: 'Koshi Province', code: '1' },
    { id: 'madhesh_province_2', name: 'Madhesh Province', code: '2' },
    { id: 'bagmati_province_3', name: 'Bagmati Province', code: '3' },
    { id: 'gandaki_province_4', name: 'Gandaki Province', code: '4' },
    { id: 'lumbini_province_5', name: 'Lumbini Province', code: '5' },
    { id: 'karnali_province_6', name: 'Karnali Province', code: '6' },
    { id: 'sudurpashchim_province_7', name: 'Sudurpashchim Province', code: '7' },
];

// Memoized District Component for performance
const DistrictPath = React.memo(({
    feature,
    pathData,
    centroid,
    districtId,
    isHovered,
    color,
    districtResult,
    totalConstituencies,
    onMouseEnter,
    onMouseLeave,
    onClick,
    onConstituencyClick,
    getDistrictName,
    getPartyColor
}) => {
    return (
        <g>
            <path
                id={districtId}
                d={pathData}
                fill={color}
                stroke="#334155"
                strokeWidth={isHovered ? "2" : "1.5"}
                className="district-path cursor-pointer transition-all duration-200"
                style={{
                    filter: isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none',
                    opacity: isHovered ? 1 : 0.85
                }}
                onMouseEnter={(e) => onMouseEnter(feature, e)}
                onMouseLeave={onMouseLeave}
                onClick={() => onClick(feature)}
            />

            {/* Constituency Dots */}
            {totalConstituencies > 0 && centroid.x !== 0 && centroid.y !== 0 && [...Array(Math.min(totalConstituencies, 10))].map((_, i) => {
                const angle = (i / totalConstituencies) * 2 * Math.PI;
                const dotRadius = totalConstituencies > 5 ? 3 : 4;
                const spread = totalConstituencies > 5 ? 12 : 10;
                const dotX = centroid.x + (spread * Math.cos(angle));
                const dotY = centroid.y + (spread * Math.sin(angle));

                return (
                    <g key={`${districtId}-dot-${i}`}>
                        <circle
                            cx={dotX}
                            cy={dotY}
                            r={dotRadius}
                            fill={districtResult?.partyColors?.[i] || getPartyColor('Others')}
                            stroke="#FFFFFF"
                            strokeWidth="1"
                            className="constituency-dot cursor-pointer transition-all duration-200"
                            onClick={(e) => onConstituencyClick(districtId, i + 1, e)}
                        >
                            <title>{`${getDistrictName(feature)} - Constituency ${i + 1}`}</title>
                        </circle>

                        {/* Dot Number */}
                        <text
                            x={dotX}
                            y={dotY}
                            textAnchor="middle"
                            dy="3"
                            fill="white"
                            fontSize="5"
                            fontWeight="bold"
                            className="pointer-events-none select-none"
                        >
                            {i + 1}
                        </text>
                    </g>
                );
            })}

            {/* District Label */}
            {(isHovered || (totalConstituencies || 0) > 3) && centroid.x !== 0 && (
                <text
                    x={centroid.x}
                    y={centroid.y - 15}
                    textAnchor="middle"
                    fill="#1F2937"
                    fontSize="7"
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                    stroke="#FFFFFF"
                    strokeWidth="0.5"
                    paintOrder="stroke"
                >
                    {getDistrictName(feature)}
                </text>
            )}
        </g>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.isHovered === nextProps.isHovered &&
        prevProps.color === nextProps.color &&
        prevProps.districtResult === nextProps.districtResult
    );
});

const CustomNepalMap = ({ year = 2084 }) => {
    const [hoveredDistrict, setHoveredDistrict] = useState(null);
    const [mapLevel, setMapLevel] = useState('national'); // national, province, district, municipality
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedMunicipality, setSelectedMunicipality] = useState('');

    // Lists for dropdowns
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableMunicipalities, setAvailableMunicipalities] = useState([]);

    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const svgRef = useRef(null);
    const gRef = useRef(null);
    const tooltipRef = useRef(null);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const districtResults = useSelector(state => state.election?.districtResults || {});
    const isOnline = useSelector(state => state.offline?.isOnline ?? true);

    // Update available districts when province changes
    useEffect(() => {
        if (selectedProvince) {
            const provinceNum = selectedProvince.split('_').pop();
            const provinceKey = `Province ${provinceNum}`;
            const dists = Object.values(constituencyData.districts)
                .filter(d => d.province === provinceKey)
                .map(d => d.name);
            setAvailableDistricts(dists);
            setSelectedDistrict('');
            setSelectedMunicipality('');
        } else {
            setAvailableDistricts([]);
            setSelectedDistrict('');
            setSelectedMunicipality('');
        }
    }, [selectedProvince]);

    // Update available municipalities when district changes
    useEffect(() => {
        if (selectedDistrict && mapData) {
            // If we are in district view, mapData already contains municipalities
            if (mapLevel === 'district') {
                const munis = mapData.features.map(f =>
                    f.properties.FIRST_GaPa || f.properties.GaPa || f.properties.NAME
                ).filter(Boolean);
                setAvailableMunicipalities([...new Set(munis)]);
            }
        }
    }, [selectedDistrict, mapData, mapLevel]);

    // Main Map Data Fetcher
    useEffect(() => {
        setLoading(true);
        let url = '/data/nepal-districts.geojson';

        if (mapLevel === 'province' && selectedProvince) {
            url = `/data/maps-of-provinces/${selectedProvince}.geojson`;
        } else if (mapLevel === 'district' && selectedProvince && selectedDistrict) {
            const distFile = selectedDistrict.charAt(0).toUpperCase() + selectedDistrict.slice(1);
            url = `/data/maps-of-districts/${selectedProvince}_districts/${distFile}.geojson`;
        } else if (mapLevel === 'municipality' && selectedProvince && selectedDistrict && selectedMunicipality) {
            const distFolder = selectedDistrict.toUpperCase();
            const muniFile = selectedMunicipality;
            url = `/data/maps-of-municipalities/${selectedProvince}/${distFolder}/${muniFile}`;
            if (!url.endsWith('.geojson')) url += '.geojson';
        }

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Map file not found');
                return res.json();
            })
            .then(data => {
                setMapData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading map layout:", err);
                // Fallback to national if specific fails
                if (mapLevel !== 'national') {
                    setMapLevel('national');
                    setSelectedProvince('');
                    setSelectedDistrict('');
                } else {
                    setLoading(false);
                }
            });
    }, [mapLevel, selectedProvince, selectedDistrict, selectedMunicipality]);

    // Load election data for visible items
    useEffect(() => {
        if (mapData && isOnline) {
            mapData.features.forEach(feature => {
                try {
                    const name = feature?.properties?.DIST_EN || feature?.properties?.DISTRICT || feature?.properties?.NAME;
                    if (name) {
                        const id = name.toLowerCase().replace(/\s+/g, '_');
                        dispatch(fetchDistrictElectionData({ districtId: id, year }));
                    }
                } catch (e) { }
            });
        }
    }, [mapData, dispatch, isOnline, year]);

    // Projection calculation
    const { projectionFn } = useMemo(() => {
        if (!mapData || !mapData.features || mapData.features.length === 0) return { projectionFn: null };
        try {
            let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
            mapData.features.forEach(feature => {
                if (!feature?.geometry?.coordinates) return;
                const bbox = getPathBoundingBox(feature.geometry.coordinates, feature.geometry.type);
                if (bbox.minX !== 0 || bbox.maxX !== 0) {
                    minLon = Math.min(minLon, bbox.minX);
                    minLat = Math.min(minLat, bbox.minY);
                    maxLon = Math.max(maxLon, bbox.maxX);
                    maxLat = Math.max(maxLat, bbox.maxY);
                }
            });

            if (minLon === Infinity) return { projectionFn: null };

            const lonRange = maxLon - minLon;
            const latRange = maxLat - minLat;
            const availableWidth = SVG_WIDTH - PADDING * 2;
            const availableHeight = SVG_HEIGHT - PADDING * 2;

            const centerLat = (minLat + maxLat) / 2;
            const aspectCorrection = Math.cos(centerLat * Math.PI / 180);

            const scale = Math.min(availableWidth / (lonRange * aspectCorrection), availableHeight / latRange);
            const offsetX = PADDING + (availableWidth - lonRange * scale * aspectCorrection) / 2;
            const offsetY = PADDING + (availableHeight - latRange * scale) / 2;

            const fn = (lon, lat) => ({
                x: (lon - minLon) * scale * aspectCorrection + offsetX,
                y: (maxLat - lat) * scale + offsetY
            });
            return { projectionFn: fn };
        } catch (error) {
            return { projectionFn: null };
        }
    }, [mapData]);

    const getDistrictName = useCallback((feature) => {
        return feature?.properties?.DIST_EN ||
            feature?.properties?.DISTRICT ||
            feature?.properties?.FIRST_GaPa ||
            feature?.properties?.GaPa ||
            feature?.properties?.NAME ||
            'Unknown';
    }, []);

    const getDistrictId = useCallback((feature) => {
        const name = getDistrictName(feature);
        return name.toLowerCase().replace(/\s+/g, '_');
    }, [getDistrictName]);

    const districtPaths = useMemo(() => {
        if (!mapData?.features || !projectionFn) return [];
        return mapData.features.map(feature => {
            try {
                const pathData = geoJsonToSvgPath(feature.geometry.coordinates, projectionFn, feature.geometry.type);
                const centroid = calculateGeoJsonCentroid(feature.geometry.coordinates, projectionFn, feature.geometry.type);
                return { feature, pathData, centroid, districtId: getDistrictId(feature) };
            } catch (e) {
                return null;
            }
        }).filter(Boolean);
    }, [mapData, projectionFn, getDistrictId]);

    const getDistrictColor = useCallback((feature) => {
        try {
            const districtId = getDistrictId(feature);
            if (hoveredDistrict?.id === districtId) return '#FCD34D';
            const results = districtResults[districtId];
            if (results?.winner) return getPartyColor(results.winner.party);
            return '#E2E8F0';
        } catch (error) {
            return '#E2E8F0';
        }
    }, [districtResults, hoveredDistrict, getDistrictId]);

    const handleMouseEnter = useCallback((feature, event) => {
        const districtId = getDistrictId(feature);
        const name = getDistrictName(feature);
        const results = districtResults[districtId];

        setHoveredDistrict({
            id: districtId,
            name: name,
            province: feature?.properties?.ADM1_EN || selectedProvince,
            ...results
        });

        if (tooltipRef.current) {
            tooltipRef.current.style.display = 'block';
            tooltipRef.current.style.left = `${event.clientX}px`;
            tooltipRef.current.style.top = `${event.clientY}px`;
        }
    }, [districtResults, getDistrictId, getDistrictName, selectedProvince]);

    const handleMouseMove = useCallback((event) => {
        if (tooltipRef.current) {
            tooltipRef.current.style.left = `${event.clientX}px`;
            tooltipRef.current.style.top = `${event.clientY}px`;
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredDistrict(null);
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
    }, []);

    const handleDistrictClick = useCallback((feature) => {
        const name = getDistrictName(feature);
        const districtId = getDistrictId(feature);

        if (mapLevel === 'national' || mapLevel === 'province') {
            // First Priority: Navigate to the full district page (User request)
            navigate(`/districts/${districtId}`);

            // Optional: Also update filters so if they come back, the map is at this level
            // but navigation happens immediately.
            const provinceData = Object.values(constituencyData.districts).find(d => d.name === name);
            if (provinceData) {
                const pNum = provinceData.province.split(' ').pop();
                const pId = PROVINCES.find(p => p.code === pNum)?.id;
                if (pId) {
                    setSelectedProvince(pId);
                    setSelectedDistrict(name);
                }
            }
        } else if (mapLevel === 'district') {
            // Drill down into municipality/wards for the specific district view
            setSelectedMunicipality(name);
            setMapLevel('municipality');
        }
    }, [mapLevel, getDistrictName, getDistrictId, navigate]);

    // Zoom Handling
    useEffect(() => {
        if (!svgRef.current || !gRef.current) return;
        const svg = d3.select(svgRef.current);
        const zoom = d3.zoom().scaleExtent([1, 15]).on('zoom', (event) => {
            d3.select(gRef.current).attr('transform', event.transform);
        });
        svg.call(zoom);
        svg.call(zoom.transform, d3.zoomIdentity);
        return () => svg.on(".zoom", null);
    }, [mapData]);

    const handleReset = () => {
        setMapLevel('national');
        setSelectedProvince('');
        setSelectedDistrict('');
        setSelectedMunicipality('');
    };

    return (
        <div className="relative w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            {/* Filter modes */}
            <MapFilterHeader
                mapLevel={mapLevel}
                setMapLevel={setMapLevel}
                selectedProvince={selectedProvince}
                setSelectedProvince={setSelectedProvince}
                selectedDistrict={selectedDistrict}
                setSelectedDistrict={setSelectedDistrict}
                selectedMunicipality={selectedMunicipality}
                setSelectedMunicipality={setSelectedMunicipality}
                provinces={PROVINCES}
                districts={availableDistricts}
                municipalities={availableMunicipalities}
                onReset={handleReset}
            />

            <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-white border-b border-slate-100">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-nepalBlue rounded-lg text-white shadow-md">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            {mapLevel === 'national' && "Nepal Election Map"}
                            {mapLevel === 'province' && selectedProvince && PROVINCES.find(p => p.id === selectedProvince)?.name}
                            {mapLevel === 'district' && selectedDistrict && `${selectedDistrict} Municipalities`}
                            {mapLevel === 'municipality' && selectedMunicipality && `${selectedMunicipality} Wards`}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium">
                            {loading ? 'Fetching high-resolution data...' : `Interactive ${mapLevel} view`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    {!isOnline && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200 uppercase tracking-tighter mr-2">
                            Offline Mode
                        </span>
                    )}
                    <button onClick={() => d3.select(svgRef.current).transition().call(d3.zoom().scaleBy, 1.5)} className="p-1.5 bg-white rounded-md border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                    <button onClick={() => d3.select(svgRef.current).transition().call(d3.zoom().scaleBy, 0.7)} className="p-1.5 bg-white rounded-md border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <button onClick={handleReset} className="p-1.5 bg-white rounded-md border border-slate-200 hover:bg-slate-50 shadow-sm transition-colors">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4L20 20M20 4L4 20" /></svg>
                    </button>
                </div>
            </div>

            <div
                className="relative bg-slate-50 overflow-hidden"
                onMouseMove={handleMouseMove}
                style={{ height: '600px' }}
            >
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 border-4 border-nepalRed border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-2 text-sm font-bold text-slate-600 uppercase tracking-widest">Loading Map...</p>
                        </div>
                    </div>
                )}

                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                    className="w-full h-full cursor-move"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <g ref={gRef}>
                        {districtPaths.map((item, index) => (
                            <DistrictPath
                                key={`${item.districtId}-${index}`}
                                feature={item.feature}
                                pathData={item.pathData}
                                centroid={item.centroid}
                                districtId={item.districtId}
                                isHovered={hoveredDistrict?.id === item.districtId}
                                color={getDistrictColor(item.feature)}
                                districtResult={districtResults[item.districtId]}
                                totalConstituencies={item.feature?.properties?.CONSTITUENCIES || 0}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onClick={handleDistrictClick}
                                onConstituencyClick={(id, no, e) => {
                                    e.stopPropagation();
                                    navigate(`/districts/${id}/constituency/${no}`);
                                }}
                                getDistrictName={getDistrictName}
                                getPartyColor={getPartyColor}
                            />
                        ))}
                    </g>
                </svg>

                <div
                    ref={tooltipRef}
                    style={{ display: 'none', position: 'fixed', zIndex: 100, pointerEvents: 'none' }}
                >
                    {hoveredDistrict && <DistrictMapTooltip district={hoveredDistrict} position={{ x: 0, y: 0 }} />}
                </div>

                <MapLegend />
            </div>

            {/* Breadcrumbs for navigation */}
            <div className="bg-slate-900 text-white p-3 flex items-center text-[10px] font-bold gap-3 overflow-x-auto whitespace-nowrap">
                <span className="text-slate-500 uppercase tracking-widest border-r border-slate-700 pr-3">Navigation</span>
                <button className="hover:text-nepalRed transition-colors uppercase" onClick={handleReset}>National</button>
                {selectedProvince && (
                    <>
                        <span className="text-slate-700">/</span>
                        <button className="hover:text-nepalRed transition-colors uppercase" onClick={() => setMapLevel('province')}>
                            {selectedProvince.replace(/_/g, ' ')}
                        </button>
                    </>
                )}
                {selectedDistrict && (
                    <>
                        <span className="text-slate-700">/</span>
                        <button className="hover:text-nepalRed transition-colors uppercase" onClick={() => setMapLevel('district')}>
                            {selectedDistrict}
                        </button>
                    </>
                )}
                {selectedMunicipality && (
                    <>
                        <span className="text-slate-700">/</span>
                        <span className="text-nepalRed uppercase">{selectedMunicipality}</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default CustomNepalMap;