import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDistricts } from '../../store/districtSlice';
import { MapPin, Search, Filter, Layers, Users, TrendingUp, Edit2, Plus } from 'lucide-react';

const DistrictsTable = () => {
    const dispatch = useDispatch();
    const { districts, loading } = useSelector(state => state.district);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');

    useEffect(() => {
        dispatch(fetchDistricts());
    }, [dispatch]);

    const filteredDistricts = districts.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.nameNepali?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProvince = selectedProvince === '' || d.province === selectedProvince;
        return matchesSearch && matchesProvince;
    });

    const provinces = [...new Set(districts.map(d => d.province))].filter(Boolean);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-4 flex-grow">
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find district via name..."
                            className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="p-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px] font-bold text-slate-600"
                        value={selectedProvince}
                        onChange={(e) => setSelectedProvince(e.target.value)}
                    >
                        <option value="">Filter by Province</option>
                        {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-100 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Territory
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 text-center animate-pulse"><div className="w-12 h-12 bg-slate-200 rounded-full mx-auto mb-4"></div><p className="font-bold text-slate-300">Synchronizing Atlas...</p></div>
                ) : filteredDistricts.map((district) => (
                    <div key={district._id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                <MapPin className="w-8 h-8" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{district.province}</p>
                                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">Verified</span>
                            </div>
                        </div>

                        <div className="space-y-1 mb-8">
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">{district.name}</h3>
                            <p className="text-lg font-black text-slate-300 italic">{district.nameNepali}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Layers className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Constituencies</span>
                                </div>
                                <p className="text-xl font-black text-slate-800 tracking-tighter">{district.totalConstituencies}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl">
                                <div className="flex items-center gap-2 text-slate-400 mb-1">
                                    <Users className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Total Voters</span>
                                </div>
                                <p className="text-xl font-black text-slate-800 tracking-tighter">
                                    {district.demographics?.voters?.total?.toLocaleString() || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                            <button className="flex items-center gap-2 text-xs font-black text-indigo-600 uppercase tracking-widest hover:translate-x-1 transition-transform">
                                <TrendingUp className="w-4 h-4" /> View Map Stats
                            </button>
                            <button className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition">
                                <Edit2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DistrictsTable;
