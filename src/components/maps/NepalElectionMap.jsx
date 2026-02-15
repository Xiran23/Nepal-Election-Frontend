import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDistrictElectionData } from '../../store/electionSlice';
import { getPartyColor } from '../../utils/mapHelpers';
import constituencyData from '../../data/nepal-constituencies.json';

const NepalElectionMap = () => {
    const [geoData, setGeoData] = useState(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const districtResults = useSelector(state => state.election?.districtResults || {});

    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/data/nepal-districts.geojson')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (!data || !data.features) {
                    throw new Error('Invalid GeoJSON data');
                }
                setGeoData(data);

                // Fetch data for all districts
                data.features.forEach(feature => {
                    const districtName = feature?.properties?.DIST_EN || feature?.properties?.DISTRICT;
                    if (districtName) {
                        const districtId = districtName.toLowerCase().replace(/\s+/g, '_');
                        dispatch(fetchDistrictElectionData(districtId));
                    }
                });
            })
            .catch(err => {
                console.error("Error loading map data:", err);
                setError(err.message);
            });
    }, [dispatch]);

    const onEachDistrict = (feature, layer) => {
        const districtName = feature?.properties?.DIST_EN || feature?.properties?.DISTRICT || 'Unknown';
        const districtId = districtName.toLowerCase().replace(/\s+/g, '_');
        const result = districtResults[districtId];
        const districtInfo = constituencyData.districts[districtId];

        const tooltipContent = `
            <div class="p-1 min-w-[150px]">
                <div class="font-bold border-b border-gray-200 pb-1 mb-1">${districtName}</div>
                <div class="text-xs text-slate-600">
                    <p>Const: ${feature?.properties?.CONSTITUENCIES || districtInfo?.total_constituencies || 'N/A'}</p>
                    <p>Voters: ${feature?.properties?.VOTERS?.toLocaleString() || 'N/A'}</p>
                    ${result && result.winner ? `<div class="mt-2 text-blue-600 font-bold">Leading: ${result.winner.party}</div>` : '<div class="mt-1 italic text-slate-400">No data available</div>'}
                </div>
            </div>
        `;

        layer.bindTooltip(tooltipContent, {
            sticky: true,
            direction: 'top',
            offset: [0, -10],
            className: 'custom-leaflet-tooltip'
        });

        layer.on({
            mouseover: (e) => {
                e.target.setStyle({
                    fillOpacity: 0.7,
                    weight: 2,
                    color: '#666',
                    fillColor: '#FCD34D'
                });
            },
            mouseout: (e) => {
                e.target.setStyle({
                    fillOpacity: 0.5,
                    weight: 1,
                    color: 'white',
                    fillColor: '#3388ff'
                });
            },
            click: () => {
                navigate(`/districts/${districtId}`);
            }
        });
    };

    if (error) {
        return (
            <div className="h-96 flex flex-col items-center justify-center bg-red-50 rounded-lg border border-red-200 p-6 text-center">
                <svg className="w-12 h-12 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-red-700 font-medium">Failed to load map data</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
                <p className="text-gray-500 text-xs mt-4">Please ensure public/data/nepal-districts.geojson exists.</p>
            </div>
        );
    }

    if (!geoData) {
        return (
            <div className="h-[600px] flex items-center justify-center bg-slate-50 rounded-[4px] border border-gray-200">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <span className="text-gray-500 font-medium">Loading Map...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[600px] w-full bg-slate-100 rounded-[4px] overflow-hidden border border-gray-200 relative z-0">
            <MapContainer
                center={[28.3949, 84.1240]}
                zoom={7}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                dragging={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <GeoJSON
                    data={geoData}
                    style={() => ({
                        fillColor: '#3388ff',
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.5
                    })}
                    onEachFeature={onEachDistrict}
                />
            </MapContainer>

            <div className="absolute bottom-4 right-4 bg-white p-4 rounded-[4px] border border-gray-200 z-[1000] text-sm">
                <h4 className="font-bold mb-2">Legend</h4>
                <div className="flex items-center gap-2 mb-1">
                    <span className="w-4 h-4 bg-[#3388ff] opacity-50 border border-black"></span>
                    <span>District</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-4 h-4 bg-[#DC143C] opacity-70 border border-gray-600"></span>
                    <span>Hovered</span>
                </div>
            </div>
        </div>
    );
};

export default NepalElectionMap;
