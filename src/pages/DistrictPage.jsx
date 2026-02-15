import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ResultSemiCircle from '../components/election/ResultSemiCircle';
import DistrictMap from '../components/maps/DistrictMap';
import DistrictCustomMap from '../components/maps/DistrictCustomMap';
import { fetchDistrictDetails } from '../store/districtSlice';
import constituencyData from '../data/nepal-constituencies.json';

const DistrictPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const { selectedDistrict: apiDistrict, status } = useSelector((state) => state.district);
    const [mapMode, setMapMode] = useState('svg'); // 'svg' or 'leaflet'

    useEffect(() => {
        if (id) {
            dispatch(fetchDistrictDetails(id));
        }
    }, [id, dispatch]);

    // Fallback logic: If API doesn't have district info, use local JSON
    const localDistrict = constituencyData.districts[id?.toLowerCase()];

    // Merge or choose source
    const selectedDistrict = apiDistrict || (localDistrict ? {
        name: localDistrict.name,
        province: localDistrict.province.replace('Province ', ''),
        totalConstituencies: localDistrict.total_constituencies,
        population: 'N/A', // fallback
        demographics: {
            voters: {
                total: localDistrict.constituencies.reduce((acc, c) => acc + (c.voters || 0), 0)
            }
        },
        isFallback: true
    } : null);

    if (status === 'loading' && !selectedDistrict) return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header />
            <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <Footer />
        </div>
    );

    if (!selectedDistrict && status !== 'loading') return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header />
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8">
                <div className="text-6xl mb-4">🤷‍♂️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">District Not Found</h2>
                <p className="text-gray-600 mb-6">The district "{id}" could not be found in our database.</p>
                <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Return Home</Link>
            </div>
            <Footer />
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">

                {/* Breadcrumb */}
                <nav className="text-sm mb-6 text-slate-500">
                    <Link to="/" className="hover:text-blue-600 transition">Home</Link>
                    <span className="mx-2">/</span>
                    <span className="text-slate-800 font-semibold capitalize">{selectedDistrict?.name}</span>
                </nav>

                <div className="flex flex-col md:flex-row justify-between items-start mb-8 border-b border-slate-200 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 capitalize">
                                {selectedDistrict?.name} <span className="text-slate-400 font-light">District</span>
                            </h1>
                            {selectedDistrict?.isFallback && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">Local Data</span>
                            )}
                        </div>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full uppercase tracking-wider">
                            Province {selectedDistrict?.province}
                        </span>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">Total Registered Voters</div>
                        <div className="text-2xl font-bold text-slate-800">{selectedDistrict?.demographics?.voters?.total?.toLocaleString() || 'N/A'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar / Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4 text-lg">District Overview</h3>
                            <ul className="space-y-4 text-sm">
                                <li className="flex justify-between border-b border-slate-50 pb-2">
                                    <span className="text-slate-500">Constituencies</span>
                                    <span className="font-semibold">{selectedDistrict?.totalConstituencies || 0}</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-50 pb-2">
                                    <span className="text-slate-500">Registered Voters</span>
                                    <span className="font-semibold">{selectedDistrict?.demographics?.voters?.total?.toLocaleString() || 'N/A'}</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-50 pb-2">
                                    <span className="text-slate-500">Polling Stations</span>
                                    <span className="font-semibold">142</span>
                                </li>
                                <li className="flex justify-between border-b border-slate-50 pb-2">
                                    <span className="text-slate-500">Map Resolution</span>
                                    <span className="font-semibold text-blue-600">High Precision</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-lg text-white">
                            <h3 className="font-bold mb-2">District Navigation</h3>
                            <p className="text-blue-100 text-sm leading-relaxed mb-4">
                                Use the toggle to switch between a clean Custom Vector map and an Interactive Satellite/Street map.
                            </p>
                            <div className="flex bg-blue-900/40 p-1 rounded-xl">
                                <button
                                    onClick={() => setMapMode('svg')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${mapMode === 'svg' ? 'bg-white text-blue-600 shadow-md' : 'text-blue-200 hover:text-white'}`}
                                >
                                    Custom SVG
                                </button>
                                <button
                                    onClick={() => setMapMode('leaflet')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${mapMode === 'leaflet' ? 'bg-white text-blue-600 shadow-md' : 'text-blue-200 hover:text-white'}`}
                                >
                                    Interactive
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content / Map & Constituencies */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center">
                                <span className="w-1.5 h-6 bg-red-600 rounded mr-3"></span>
                                District Map & Sub-units
                            </h2>
                            <div className="hidden md:flex bg-slate-200 p-1 rounded-lg">
                                <button
                                    onClick={() => setMapMode('svg')}
                                    className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${mapMode === 'svg' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    SVG
                                </button>
                                <button
                                    onClick={() => setMapMode('leaflet')}
                                    className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${mapMode === 'leaflet' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Leaflet
                                </button>
                            </div>
                        </div>

                        {mapMode === 'svg' ? (
                            <DistrictCustomMap
                                districtName={selectedDistrict?.name}
                                province={selectedDistrict?.province}
                            />
                        ) : (
                            <DistrictMap
                                districtName={selectedDistrict?.name}
                                province={selectedDistrict?.province}
                            />
                        )}

                        <h2 className="text-xl font-bold text-slate-800 flex items-center">
                            <span className="w-1.5 h-6 bg-red-600 rounded mr-3"></span>
                            Election Results by Constituency
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[...Array(selectedDistrict?.totalConstituencies || 0)].map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="text-center mb-6">
                                        <h3 className="font-bold text-lg text-slate-800 mb-1">Constituency {i + 1}</h3>
                                        <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">COUNTING PROGRESS: 100%</span>
                                    </div>

                                    <div className="flex justify-center mb-6">
                                        <ResultSemiCircle
                                            width={280}
                                            height={140}
                                            candidates={[
                                                { name: 'Candidate A', votes: 15420, party: { name: 'CPN-UML', color: '#DC143C' } },
                                                { name: 'Candidate B', votes: 12500, party: { name: 'NC', color: '#008000' } },
                                                { name: 'Candidate C', votes: 8900, party: { name: 'RSP', color: '#003893' } }
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-400 mb-2">
                                            <span>Candidate</span>
                                            <span>Votes</span>
                                        </div>
                                        {/* Mock List Items - in real app, map based on data */}
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-50 border-l-4 border-red-600">
                                            <span className="font-medium text-slate-700">Surya Thapa (UML)</span>
                                            <span className="font-bold">15,420</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-white">
                                            <span className="font-medium text-slate-600">Gagan Thapa (NC)</span>
                                            <span className="font-bold text-slate-500">12,500</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DistrictPage;
