import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDistricts } from '../../store/districtSlice';
import { apiGet, apiPost } from '../../services/api';
import { Save, RefreshCw, TrendingUp } from 'lucide-react';

const LiveResultsEntry = () => {
    const dispatch = useDispatch();
    const { districts } = useSelector(state => state.district);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [constituency, setConstituency] = useState(1);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        dispatch(fetchDistricts());
    }, [dispatch]);

    useEffect(() => {
        if (selectedDistrict) {
            fetchCandidatesInArea();
        }
    }, [selectedDistrict, constituency]);

    const fetchCandidatesInArea = async () => {
        setLoading(true);
        try {
            const data = await apiGet(`/candidates?district=${selectedDistrict}&constituency=${constituency}`);
            setCandidates(data.map(c => ({
                id: c._id,
                name: c.name,
                party: c.party?.name,
                votes: c.votes || 0,
                status: c.status || 'trailing'
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVoteChange = (id, newVotes) => {
        setCandidates(prev => {
            const updated = prev.map(c => c.id === id ? { ...c, votes: parseInt(newVotes) || 0 } : c);
            // Re-calculate rankings (leading/trailing)
            const sorted = [...updated].sort((a, b) => b.votes - a.votes);
            return updated.map(c => ({
                ...c,
                status: (c.votes > 0 && c.votes === sorted[0].votes) ? 'leading' : 'trailing'
            }));
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save updates for all candidates
            await Promise.all(candidates.map(candidate =>
                apiPut(`/candidates/${candidate.id}`, {
                    votes: candidate.votes,
                    status: candidate.status
                })
            ));
            alert('Live results successfully broadcasted via WebSockets!');
        } catch (err) {
            alert('Error updating results: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-end">
                <div className="flex-grow min-w-[200px]">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Select District</label>
                    <select
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                    >
                        <option value="">Choose District...</option>
                        {districts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                    </select>
                </div>
                <div className="w-32">
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Constituency</label>
                    <input
                        type="number"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        value={constituency}
                        onChange={(e) => setConstituency(e.target.value)}
                        min="1"
                    />
                </div>
                <button
                    onClick={fetchCandidatesInArea}
                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {candidates.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            <h3 className="font-bold">Live Vote Entry</h3>
                        </div>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full uppercase tracking-widest font-bold">Real-time Broadcast</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {candidates.map((candidate) => (
                            <div key={candidate.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                                <div className="flex-grow">
                                    <div className="flex items-center gap-3">
                                        <div className="font-bold text-slate-800">{candidate.name}</div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${candidate.status === 'leading' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {candidate.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-400 font-medium">{candidate.party}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Votes</div>
                                        <input
                                            type="number"
                                            className="w-32 p-2 text-right font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            value={candidate.votes}
                                            onChange={(e) => handleVoteChange(candidate.id, e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Update & Broadcast via WebSockets
                        </button>
                    </div>
                </div>
            ) : (
                selectedDistrict && !loading && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-400">No candidates found for this constituency.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default LiveResultsEntry;
