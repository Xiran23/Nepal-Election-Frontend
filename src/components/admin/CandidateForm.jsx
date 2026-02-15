import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchParties } from '../../store/partySlice';
import { fetchDistricts } from '../../store/districtSlice';
import { apiPost, apiPut } from '../../services/api';
import { UserPlus, Save, X, Upload, Check } from 'lucide-react';

const CandidateForm = ({ candidate, onSave, onCancel }) => {
    const dispatch = useDispatch();
    const { parties } = useSelector(state => state.party);
    const { districts } = useSelector(state => state.district);

    const [formData, setFormData] = useState({
        name: '',
        nameNepali: '',
        party: '',
        district: '',
        constituency: 1,
        electionYear: 2084,
        electionType: 'federal',
        imageUrl: '',
        bio: '',
        age: '',
        education: '',
        profession: '',
        status: 'trailing'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        dispatch(fetchParties());
        dispatch(fetchDistricts());
    }, [dispatch]);

    useEffect(() => {
        if (candidate) {
            setFormData({
                ...candidate,
                party: candidate.party?._id || candidate.party || '',
                district: candidate.district?._id || candidate.district || '',
                age: candidate.age || '',
                education: candidate.education || '',
                profession: candidate.profession || ''
            });
        }
    }, [candidate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (candidate?._id) {
                await apiPut(`/candidates/${candidate._id}`, formData);
            } else {
                await apiPost('/candidates', formData);
            }
            onSave();
        } catch (err) {
            setError(err.message || 'Failed to save candidate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <UserPlus className="w-6 h-6" />
                    <h3 className="font-bold text-xl">{candidate ? 'Edit Candidate' : 'Add New Candidate'}</h3>
                </div>
                <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-full transition">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100 italic">
                        * {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name (English)</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="e.g. Gagan Thapa"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Name (Nepali)</label>
                        <input
                            name="nameNepali"
                            value={formData.nameNepali}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="e.g. गगन थापा"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Political Party</label>
                        <select
                            name="party"
                            value={formData.party}
                            onChange={handleChange}
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        >
                            <option value="">Select Party...</option>
                            <option value="Independent">Independent</option>
                            {parties.map(p => (
                                <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Photo URL</label>
                        <div className="relative">
                            <input
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="https://example.com/photo.jpg"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-slate-200 overflow-hidden flex items-center justify-center border border-slate-300">
                                {formData.imageUrl ? (
                                    <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="w-4 h-4 text-slate-400" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">District</label>
                        <select
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            required
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        >
                            <option value="">Select District...</option>
                            {districts.map(d => (
                                <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Constituency No.</label>
                        <input
                            type="number"
                            name="constituency"
                            value={formData.constituency}
                            onChange={handleChange}
                            min="1"
                            max="6"
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Education</label>
                        <input
                            name="education"
                            value={formData.education}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        >
                            <option value="trailing">Trailing</option>
                            <option value="leading">Leading</option>
                            <option value="elected">Elected</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Small Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition h-24"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-5 h-5" />
                                {candidate ? 'Update Candidate' : 'Create Candidate'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CandidateForm;
