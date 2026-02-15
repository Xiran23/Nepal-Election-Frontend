import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Component to auto-zoom and center the map to the GeoJSON data
const AutoCenter = ({ data }) => {
    const map = useMap();
    useEffect(() => {
        if (data) {
            const geoJsonLayer = L.geoJSON(data);
            map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
        }
    }, [data, map]);
    return null;
};

const DistrictMap = ({ districtName, province }) => {
    const [geoData, setGeoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getProvinceFolder = (provinceVal) => {
        // Handle both number (7) and string names ('Sudurpashchim')
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

        // Try to handle different naming conventions
        // 1. Title Case (Darchula)
        // 2. Underscores to Spaces and Capitalize (West Rukum)
        // 3. Lowercase (darchula)

        const formatName = (str) => {
            return str.split(/[\s_]+/)
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(''); // Join without spaces for some conventions (e.g. WestRukum) or keep it if file has spaces
        };

        const provinceFolder = getProvinceFolder(province);
        const formattedName = formatName(districtName);

        if (!provinceFolder) {
            // If no province folder, just try root data
            fetch(`/data/${formattedName}.geojson`)
                .then(res => res.json())
                .then(data => { setGeoData(data); setLoading(false); })
                .catch(() => { setError("Province unknown and map not found in root"); setLoading(false); });
            return;
        }

        const tryVariations = async () => {
            const variations = [
                `/data/maps-of-districts/${provinceFolder}/${formattedName}.geojson`,
                `/data/maps-of-districts/${provinceFolder}/${formattedName.charAt(0).toUpperCase() + formattedName.slice(1).toLowerCase()}.geojson`,
                `/data/Darchula.geojson`, // Specific fallback for the file currently open
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
                } catch (e) {
                    continue;
                }
            }

            setError("District map not found in any expected location");
            setLoading(false);
        };

        setLoading(true);
        tryVariations();
    }, [districtName, province]);

    const onEachFeature = (feature, layer) => {
        const subUnitName = feature.properties?.FIRST_GaPa || feature.properties?.GaPa || feature.properties?.NAME || 'Unknown';
        const type = feature.properties?.FIRST_Type || feature.properties?.TYPE || '';

        layer.bindTooltip(`
            <div class="p-1">
                <div class="font-bold">${subUnitName}</div>
                <div class="text-xs text-gray-500">${type}</div>
            </div>
        `, { sticky: true });

        layer.on({
            mouseover: (e) => {
                e.target.setStyle({
                    fillOpacity: 0.8,
                    weight: 2,
                    color: '#2563eb',
                    fillColor: '#bfdbfe'
                });
            },
            mouseout: (e) => {
                e.target.setStyle({
                    fillOpacity: 0.5,
                    weight: 1,
                    color: 'white',
                    fillColor: '#3b82f6'
                });
            }
        });
    };

    if (loading) return (
        <div className="h-[400px] flex items-center justify-center bg-slate-50 rounded-xl border border-gray-100">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <span className="text-gray-400 text-sm">Loading district map...</span>
            </div>
        </div>
    );

    if (error) return (
        <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-gray-100 text-center p-4">
            <div className="text-gray-400 mb-2 font-mono text-xs text-gray-300">
                /data/maps-of-districts/.../{districtName}.geojson
            </div>
            <p className="text-gray-500 text-sm">Map data not available for this district.</p>
        </div>
    );

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 relative z-0">
            <MapContainer
                center={[28.3949, 84.1240]}
                zoom={9}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {geoData && (
                    <>
                        <GeoJSON
                            data={geoData}
                            style={() => ({
                                fillColor: '#3b82f6',
                                weight: 1,
                                opacity: 1,
                                color: 'white',
                                fillOpacity: 0.5
                            })}
                            onEachFeature={onEachFeature}
                        />
                        <AutoCenter data={geoData} />
                    </>
                )}
            </MapContainer>
        </div>
    );
};

export default DistrictMap;
