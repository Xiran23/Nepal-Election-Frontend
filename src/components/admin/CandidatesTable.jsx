import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCandidates } from '../../store/candidateSlice';
import { fetchDistricts } from '../../store/districtSlice';
import { Edit2, Trash2, Plus, Search, Filter, User } from 'lucide-react';
import { apiDelete } from '../../services/api';
import CandidateForm from './CandidateForm';

const CandidatesTable = () => {
    const dispatch = useDispatch();
    const { candidates, loading } = useSelector(state => state.candidate);
    const { districts } = useSelector(state => state.district);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCandidate, setEditingCandidate] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grouped'

    useEffect(() => {
        dispatch(fetchCandidates());
        dispatch(fetchDistricts());
    }, [dispatch]);

    const handleDelete = async (id) => {
        if (window.confirm('WARNING: Are you sure you want to delete this candidate? This action cannot be undone.')) {
            try {
                await apiDelete(`/candidates/${id}`);
                dispatch(fetchCandidates());
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const handleEdit = (candidate) => {
        setEditingCandidate(candidate);
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingCandidate(null);
        setIsFormOpen(true);
    };

    const handleFormComplete = () => {
        setIsFormOpen(false);
        setEditingCandidate(null);
        dispatch(fetchCandidates());
    };

    const filteredCandidates = candidates.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.party?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDistrict = selectedDistrict === '' || c.district?._id === selectedDistrict || c.district === selectedDistrict;
        return matchesSearch && matchesDistrict;
    });

    const groupedData = filteredCandidates.reduce((acc, candidate) => {
        const dName = candidate.district?.name || 'Unassigned';
        const cNo = candidate.constituency || 0;
        if (!acc[dName]) acc[dName] = {};
        if (!acc[dName][cNo]) acc[dName][cNo] = [];
        acc[dName][cNo].push(candidate);
        return acc;
    }, {});

    if (isFormOpen) {
        return (
            <CandidateForm
                candidate={editingCandidate}
                onSave={handleFormComplete}
                onCancel={() => setIsFormOpen(false)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search name or party..."
                            className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                    >
                        <option value="">All Districts</option>
                        {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('grouped')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${viewMode === 'grouped' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            By Constituency
                        </button>
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
                >
                    <Plus className="w-4 h-4" /> Add Candidate
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {viewMode === 'table' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Profile</th>
                                    <th className="px-6 py-4">Candidate Information</th>
                                    <th className="px-6 py-4">Party & Status</th>
                                    <th className="px-6 py-4">Area</th>
                                    <th className="px-6 py-4 text-right">System Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-20"><div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></td></tr>
                                ) : filteredCandidates.map((candidate) => (
                                    <tr key={candidate._id || candidate.id} className="hover:bg-slate-50/80 transition">
                                        <td className="px-6 py-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center">
                                                {candidate.imageUrl ? (
                                                    <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="text-slate-300 w-6 h-6" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{candidate.name}</div>
                                            <div className="text-xs text-slate-400 font-medium">{candidate.nameNepali}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase w-fit">
                                                    {candidate.party?.name || 'Independent'}
                                                </span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase w-fit ${candidate.status === 'leading' || candidate.status === 'elected'
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {candidate.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-slate-600">District: {candidate.district?.name || 'N/A'}</div>
                                            <div className="text-xs text-slate-400 font-medium tracking-tight">Constituency No. {candidate.constituency}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(candidate)}
                                                    className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition shadow-sm bg-white border border-slate-100"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(candidate._id || candidate.id)}
                                                    className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition shadow-sm bg-white border border-slate-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-8 space-y-12">
                        {Object.entries(groupedData).map(([district, constituencies]) => (
                            <div key={district} className="space-y-6">
                                <h3 className="text-lg font-black text-slate-800 border-b-2 border-slate-100 pb-2 inline-block px-4">{district}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.entries(constituencies).map(([cNo, districtCandidates]) => (
                                        <div key={cNo} className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                                            <div className="text-xs font-black text-slate-400 uppercase mb-4 flex justify-between">
                                                <span>Constituency {cNo}</span>
                                                <span className="bg-blue-100 text-blue-600 px-2 rounded-full">{districtCandidates.length}</span>
                                            </div>
                                            <div className="space-y-4">
                                                {districtCandidates.map(c => (
                                                    <div key={c._id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                                            {c.imageUrl ? <img src={c.imageUrl} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-slate-300" />}
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <div className="text-sm font-bold text-slate-800 truncate">{c.name}</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                                                                {c.party?.name || 'Independent'}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-400 hover:text-blue-600 transition"><Edit2 className="w-3 h-3" /></button>
                                                            <button onClick={() => handleDelete(c._id)} className="p-1.5 text-slate-400 hover:text-red-600 transition"><Trash2 className="w-3 h-3" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidatesTable;
