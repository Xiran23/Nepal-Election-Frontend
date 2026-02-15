import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { fetchElections, setSelectedYear } from '../store/electionSlice';

const ElectionResultsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { elections, status } = useSelector((state) => state.election);

    useEffect(() => {
        dispatch(fetchElections());
    }, [dispatch]);

    const handleElectionClick = (year) => {
        dispatch(setSelectedYear(year));
        navigate('/');
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Election Results Archive</h1>

                {status === 'loading' ? (
                    <p>Loading...</p>
                ) : (
                    <div className="space-y-6">
                        {elections.map((election) => (
                            <div
                                key={election._id}
                                onClick={() => handleElectionClick(election.year)}
                                className="bg-white p-6 rounded shadow hover:shadow-lg transition cursor-pointer"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">{election.year} General Election</h2>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${election.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        election.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p className="font-semibold">Voter Turnout</p>
                                        <p>{election.voterTurnout}%</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Total Votes</p>
                                        <p>{election.totalVotesCast?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Date</p>
                                        <p>{new Date(election.startDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ElectionResultsPage;
