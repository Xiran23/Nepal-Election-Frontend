import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import WikipediaSemiCircle from '../components/election/WikipediaSemiCircle';
import CandidateCard from '../components/election/CandidateCard';
import { fetchConstituencyResults, setSelectedYear } from '../store/electionSlice';
import { fetchCandidatesByConstituency } from '../store/candidateSlice';
import { formatVoteCount, calculateMargin } from '../utils/electionHelpers';

const ConstituencyPage = () => {
  const { districtId, constituencyNo } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState('results');

  const { constituencyData, loading, selectedYear } = useSelector(state => state.election);
  const { constituencyCandidates } = useSelector(state => state.candidate);
  const isOnline = useSelector(state => state.offline.isOnline);

  useEffect(() => {
    dispatch(fetchConstituencyResults({ districtId, constituencyNo, year: selectedYear }));
    dispatch(fetchCandidatesByConstituency({ districtId, constituencyNo, electionYear: selectedYear }));
  }, [districtId, constituencyNo, dispatch, selectedYear]);

  const handleCandidateClick = (candidate) => {
    navigate(`/candidates/${candidate.id}`);
  };

  const totalVotes = constituencyCandidates?.reduce((sum, c) => sum + (c.votes || 0), 0) || 0;
  const winner = constituencyCandidates?.find(c => c.status === 'elected' || c.status === 'leading');
  const runnerUp = constituencyCandidates?.find(c => c !== winner && c.status !== 'withdrawn');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to={`/districts/${districtId}`} className="hover:text-blue-600 capitalize">
            {districtId}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-semibold">Constituency {constituencyNo}</span>
        </nav>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
                {districtId} - Constituency {constituencyNo}
              </h1>
              <div className="flex items-center space-x-4 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                  प्रदेश {constituencyData?.province || '3'}
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {isOnline ? 'Live' : 'Cached Data'}
                </span>
              </div>
            </div>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => dispatch(setSelectedYear(parseInt(e.target.value)))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2084}>Election 2084</option>
              <option value={2022}>Election 2022</option>
            </select>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Total Voters</p>
              <p className="text-2xl font-bold text-gray-900">
                {constituencyData?.totalVoters?.toLocaleString() || '89,450'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Votes Cast</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalVotes.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Turnout</p>
              <p className="text-2xl font-bold text-green-600">
                {constituencyData?.turnout || '72.5'}%
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-500">Candidates</p>
              <p className="text-2xl font-bold text-gray-900">
                {constituencyCandidates?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-t-2xl shadow-lg border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-4 font-medium text-sm transition-colors relative ${activeTab === 'results'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Election Results
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`px-6 py-4 font-medium text-sm transition-colors relative ${activeTab === 'candidates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Candidates
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-medium text-sm transition-colors relative ${activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Election History
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Results Tab */}
              {activeTab === 'results' && (
                <div className="space-y-8">
                  {/* Winner Card */}
                  {winner && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold text-green-700 uppercase tracking-wider">
                            Winner
                          </span>
                          <h2 className="text-2xl font-bold text-gray-900 mt-1">{winner.name}</h2>
                          <p className="text-green-600 font-semibold">{winner.party?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">
                            {winner.votes?.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {((winner.votes / totalVotes) * 100).toFixed(2)}% of votes
                          </p>
                          {runnerUp && (
                            <p className="text-sm text-gray-600 mt-1">
                              Margin: {calculateMargin(winner.votes, runnerUp.votes).margin.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Wikipedia Style Chart */}
                  <div className="flex justify-center my-8">
                    <WikipediaSemiCircle
                      candidates={constituencyCandidates?.map(c => ({
                        name: c.name,
                        votes: c.votes || 0,
                        party: {
                          name: c.party?.name,
                          color: c.party?.color
                        }
                      })) || []}
                      totalVotes={totalVotes}
                      width={600}
                      height={300}
                      onCandidateClick={handleCandidateClick}
                    />
                  </div>
                </div>
              )}

              {/* Candidates Tab */}
              {activeTab === 'candidates' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {constituencyCandidates?.map(candidate => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      totalVotes={totalVotes}
                      onClick={() => handleCandidateClick(candidate)}
                    />
                  ))}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Previous Election Results
                  </h3>
                  {[2079, 2074, 2070].map(year => (
                    <div key={year} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Election {year}</span>
                        <button className="text-blue-600 text-sm hover:underline">
                          View Details →
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Winner: {year === 2079 ? 'Sher Bahadur Deuba' :
                          year === 2074 ? 'Khadga Prasad Oli' : 'Sushil Koirala'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConstituencyPage;