import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchParties } from '../../store/partySlice';
import { Edit2, Trash2, Plus, Search, Flag, Palette } from 'lucide-react';
import { apiPost, apiPut, apiDelete } from '../../services/api';

const PartiesTable = () => {
    const dispatch = useDispatch();
    const { parties, loading } = useSelector(state => state.party);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingParty, setEditingParty] = useState(null);
    const [formData, setFormData] = useState({ name: '', nameNepali: '', symbol: '', color: '#312E81' });

    useEffect(() => {
        dispatch(fetchParties());
    }, [dispatch]);

    const handleEdit = (party) => {
        setEditingParty(party);
        setFormData({ ...party });
        setIsFormOpen(true);
    };

    const handleAdd = () => {
        setEditingParty(null);
        setFormData({ name: '', nameNepali: '', symbol: '', color: '#312E81' });
        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingParty) {
                await apiPut(`/parties/${editingParty._id}`, formData);
            } else {
                await apiPost('/parties', formData);
            }
            setIsFormOpen(false);
            dispatch(fetchParties());
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this party? This will affect all associated candidates.')) {
            try {
                await apiDelete(`/parties/${id}`);
                dispatch(fetchParties());
            } catch (err) {
                alert(err.message);
            }
        }
    };

    if (isFormOpen) {
        return (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <h3 className="font-bold text-xl">{editingParty ? 'Edit Party' : 'Add New Party'}</h3>
                    <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-full">X</button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Party Name (EN)</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Party Name (NP)</label>
                            <input
                                value={formData.nameNepali}
                                onChange={e => setFormData({ ...formData, nameNepali: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Election Symbol (Profile Pic URL)</label>
                            <input
                                value={formData.symbol}
                                onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="https://example.com/symbol.png"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Brand Color</label>
                            <div className="flex gap-3">
                                <input
                                    type="color"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    className="w-12 h-12 rounded-lg cursor-pointer"
                                />
                                <input
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setIsFormOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600">Cancel</button>
                        <button type="submit" className="px-10 py-3 rounded-xl font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">
                            {editingParty ? 'Update Party' : 'Register Party'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Flag className="text-indigo-600 w-5 h-5" /> Registered Parties
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Total: {parties.length} Organizations</p>
                </div>
                <button onClick={handleAdd} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition uppercase tracking-widest">
                    <Plus className="w-4 h-4" /> Register New Party
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-slate-400 font-bold italic">Syncing with Registry...</div>
                ) : parties.map((party) => (
                    <div key={party._id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 translate-x-8 -translate-y-8" style={{ color: party.color }}>
                            <Flag className="w-full h-full" />
                        </div>
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-20 h-20 rounded-2xl flex items-center justify-center border-4 border-slate-50 shadow-inner overflow-hidden relative group-hover:scale-105 transition duration-300">
                                {party.symbol ? (
                                    <img src={party.symbol} alt={party.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-black text-3xl" style={{ backgroundColor: party.color, color: 'white' }}>
                                        {party.name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-grow min-w-0">
                                <h3 className="font-black text-slate-800 truncate leading-tight uppercase tracking-tight">{party.name}</h3>
                                <p className="text-sm font-bold text-slate-400 mb-2">{party.nameNepali}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: party.color }}></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase font-mono tracking-tighter">{party.color}</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-2 border-t border-slate-50 pt-4">
                            <button onClick={() => handleEdit(party)} className="flex-grow flex items-center justify-center gap-2 p-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition font-bold text-xs uppercase tracking-widest">
                                <Edit2 className="w-3 h-3" /> Edit Profile
                            </button>
                            <button onClick={() => handleDelete(party._id)} className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:bg-red-50 hover:text-red-600 transition">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PartiesTable;
