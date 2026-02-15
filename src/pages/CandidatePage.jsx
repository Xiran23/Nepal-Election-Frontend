import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { apiGet } from '../services/api';

const CandidatePage = () => {
    const { id } = useParams();
    const [candidate, setCandidate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                // Ideally this would be in a Redux slice or separate service if complex
                if (id) {
                    const data = await apiGet(`/candidates/${id}`);
                    setCandidate(data);
                } else {
                    // List all (pagination needed in real app)
                    const data = await apiGet(`/candidates`);
                    setCandidate(data); // If list
                }
            } catch (error) {
                console.error("Failed to fetch candidate", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidate();
    }, [id]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    // Handle list view if no ID
    if (!id && Array.isArray(candidate)) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-6">Candidates</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {candidate.map(c => (
                            <div key={c._id} className="bg-white p-4 rounded shadow text-center">
                                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                                    {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" /> : null}
                                </div>
                                <h2 className="font-bold text-lg">{c.name}</h2>
                                <p className="text-gray-600 text-sm">{c.party?.name}</p>
                                <p className="text-gray-500 text-xs mt-1">{c.district?.name} - {c.constituency}</p>
                            </div>
                        ))}
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // Detailed view
    if (!candidate) return <div className="p-10 text-center">Candidate Not Found</div>;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
                    <div className="md:flex">
                        <div className="md:w-1/3 bg-gray-100 p-8 text-center border-r">
                            <div className="w-48 h-48 bg-gray-300 rounded-full mx-auto mb-6 overflow-hidden border-4 border-white shadow">
                                {candidate.imageUrl ? <img src={candidate.imageUrl} alt={candidate.name} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-gray-500">No Photo</div>}
                            </div>
                            <h1 className="text-2xl font-bold mb-2">{candidate.name}</h1>
                            <p className="text-xl text-blue-800 font-semibold mb-4">{candidate.party?.name}</p>

                            <div className="mt-6 text-left space-y-2 text-sm text-gray-600">
                                <p><strong>Age:</strong> {candidate.age}</p>
                                <p><strong>Education:</strong> {candidate.education}</p>
                                <p><strong>Profession:</strong> {candidate.profession}</p>
                            </div>
                        </div>
                        <div className="md:w-2/3 p-8">
                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Election Status</h2>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <p className="text-gray-500 text-sm">District</p>
                                    <p className="font-semibold text-lg">{candidate.district?.name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Constituency</p>
                                    <p className="font-semibold text-lg">{candidate.constituency}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Total Votes</p>
                                    <p className="font-bold text-2xl text-blue-600">{candidate.votes?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Result</p>
                                    <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${candidate.status === 'elected' ? 'bg-green-100 text-green-800' :
                                            candidate.status === 'leading' ? 'bg-blue-100 text-blue-800' :
                                                candidate.status === 'lost' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {candidate.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold mb-4 border-b pb-2">Biography</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {candidate.bio || "No biography available."}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CandidatePage;
