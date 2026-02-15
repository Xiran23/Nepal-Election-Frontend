import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CustomNepalMap from '../components/maps/CustomNepalMap';
import NepalElectionMap from '../components/maps/NepalElectionMap';
import WikipediaSemiCircle from '../components/election/WikipediaSemiCircle';
import { fetchLiveResults, fetchNationalSummary } from '../store/electionSlice';
import { getPartyColor } from '../utils/mapHelpers';

const HomePage = () => {
  const [showCustomMap, setShowCustomMap] = React.useState(true);
  const dispatch = useDispatch();
  const { liveResults, nationalSummary } = useSelector(state => state.election);

  useEffect(() => {
    dispatch(fetchLiveResults());
    dispatch(fetchNationalSummary());
  }, [dispatch]);

  // Transform partyTally to format expected by WikipediaSemiCircle
  const nationalResult = useMemo(() => {
    if (!nationalSummary?.partyTally?.length) return [
      { name: 'Nepali Congress', votes: 4523120, party: { name: 'NC', color: '#32CD32' } },
      { name: 'CPN-UML', votes: 3987650, party: { name: 'UML', color: '#DC143C' } },
      { name: 'CPN-Maoist', votes: 1876540, party: { name: 'Maoist', color: '#8B0000' } },
      { name: 'RSP', votes: 1234560, party: { name: 'RSP', color: '#FF8C00' } },
      { name: 'PSP-N', votes: 987650, party: { name: 'PSP-N', color: '#4169E1' } },
    ];
    return nationalSummary.partyTally.map(p => ({
      name: p.partyName || p.party,
      votes: p.votes || 0,
      party: { name: p.party, color: p.color || getPartyColor(p.party) }
    })).sort((a, b) => b.votes - a.votes).slice(0, 5);
  }, [nationalSummary]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-bold mb-4">
            🇳🇵 संघीय संसद् निर्वाचन २०८४
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Federal Parliament Election <span className="text-red-600">2084</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real-time results from all 77 districts and 165 constituencies.
            Hover over districts to see detailed information.
          </p>
        </div>

        {/* Live Update Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-xl mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="font-semibold">LIVE UPDATE</span>
          </div>
          <div className="flex space-x-8">
            <div>
              <span className="text-sm opacity-90">Counted</span>
              <span className="ml-2 font-bold">85%</span>
            </div>
            <div>
              <span className="text-sm opacity-90">Voter Turnout</span>
              <span className="ml-2 font-bold">68.5%</span>
            </div>
            <div>
              <span className="text-sm opacity-90">Last Updated</span>
              <span className="ml-2 font-bold">2 min ago</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Map Section - Takes 3 columns */}
          <div className="xl:col-span-3">
            <div className="flex justify-end mb-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex">
                <button
                  onClick={() => setShowCustomMap(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${showCustomMap
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Custom Map
                </button>
                <button
                  onClick={() => setShowCustomMap(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${!showCustomMap
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  Interactive Map
                </button>
              </div>
            </div>
            {showCustomMap ? <CustomNepalMap /> : <NepalElectionMap />}
          </div>

          {/* Sidebar - Takes 1 column */}
          <div className="space-y-6">
            {/* National Result Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                National Result
              </h2>

              {/* Wikipedia-style semi-circle for national result */}
              <WikipediaSemiCircle
                candidates={nationalResult}
                totalVotes={nationalResult.reduce((sum, c) => sum + c.votes, 0)}
                width={300}
                height={150}
                showPercentages={true}
              />
            </div>

            {/* Key Constituencies */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Key Constituencies</h2>
              <div className="space-y-3">
                {[
                  { name: 'Kathmandu-1', candidates: 'PK vs. SS', margin: '1,204', status: 'Close' },
                  { name: 'Jhapa-5', candidates: 'KPO vs. KP', margin: '5,400', status: 'Leading' },
                  { name: 'Chitwan-2', candidates: 'RL vs. SK', margin: '12,000', status: 'Winning' },
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{item.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'Close' ? 'bg-yellow-100 text-yellow-800' :
                        item.status === 'Leading' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.candidates}</p>
                    <p className="text-xs font-bold text-right mt-1">Margin: {item.margin}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Party Position */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-xl p-6">
              <h3 className="font-bold mb-3">Seat Tally</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>NC</span>
                  <span className="font-bold">89</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full">
                  <div className="bg-green-300 h-2 rounded-full" style={{ width: '34%' }} />
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span>UML</span>
                  <span className="font-bold">78</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full">
                  <div className="bg-red-300 h-2 rounded-full" style={{ width: '30%' }} />
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span>Maoist</span>
                  <span className="font-bold">32</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full">
                  <div className="bg-orange-300 h-2 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
              <div className="border-t border-white/20 mt-4 pt-4 text-center text-sm">
                Total: 259 Seats
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;

// const HomePage = () => {
//     const dispatch = useDispatch();
//     const { currentElection, status } = useSelector((state) => state.election);

//     useEffect(() => {
//         dispatch(fetchCurrentElection());
//     }, [dispatch]);

//     return (
//         <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
//             <Header />

//             <main className="flex-grow container mx-auto px-4 py-8 lg:py-12">
//                 {/* Hero Section */}
//                 <div className="mb-12 text-center animate-fade-in-up">
//                     <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-nepalBlue text-sm font-bold mb-4 tracking-wide">
//                         OFFICIAL LEADERBOARD
//                     </span>
//                     <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
//                         Nepal General Election <span className="text-nepalRed">2084</span>
//                     </h1>
//                     <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
//                         Live real-time updates from 77 districts. Interactive visualization of the House of Representatives election results.
//                     </p>
//                 </div>

//                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">

//                     {/* Main Map Card */}
//                     <div className="xl:col-span-2 bg-white p-1 rounded-2xl shadow-xl border border-slate-200 overflow-hidden ring-1 ring-slate-100/50">
//                         <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center rounded-t-xl">
//                             <h2 className="text-xl font-bold text-slate-800 flex items-center">
//                                 <svg className="w-5 h-5 mr-2 text-nepalBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7" /></svg>
//                                 Interactive District Map
//                             </h2>
//                             <div className="flex items-center space-x-4 text-sm font-medium text-slate-500">
//                                 <span>Zoomable</span>
//                                 <span>•</span>
//                                 <span>Clickable</span>
//                             </div>
//                         </div>
//                         <div className="p-1">
//                             <NepalElectionMap />
//                         </div>
//                         <div className="bg-white p-4 border-t border-slate-100 text-sm text-slate-500 flex flex-wrap gap-4 justify-between items-center">
//                             <p>Select any district to see detailed constituency data.</p>
//                             <div className="flex gap-3">
//                                 <span className="flex items-center"><span className="w-2.5 h-2.5 bg-red-600 rounded-full mr-2 shadow-sm"></span>UML</span>
//                                 <span className="flex items-center"><span className="w-2.5 h-2.5 bg-green-600 rounded-full mr-2 shadow-sm"></span>Congress</span>
//                                 <span className="flex items-center"><span className="w-2.5 h-2.5 bg-red-800 rounded-full mr-2 shadow-sm"></span>Maoist</span>
//                                 <span className="flex items-center"><span className="w-2.5 h-2.5 bg-orange-500 rounded-full mr-2 shadow-sm"></span>RSP</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Live Updates & Key Races */}
//                     <div className="space-y-8">
//                         {/* Summary Card */}
//                         <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden">
//                             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>

//                             <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center relative z-10">
//                                 <span className="w-2 h-2 bg-green-500 rounded-full animate-ping mr-2"></span>
//                                 Live Statistics
//                             </h2>

//                             {status === 'loading' ? (
//                                 <div className="space-y-4 animate-pulse">
//                                     <div className="h-4 bg-slate-200 rounded w-3/4"></div>
//                                     <div className="h-4 bg-slate-200 rounded w-1/2"></div>
//                                 </div>
//                             ) : currentElection ? (
//                                 <div className="space-y-6 relative z-10">
//                                     <div className="group">
//                                         <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Votes Cast</p>
//                                         <p className="text-4xl font-black text-slate-800 tabular-nums tracking-tight">
//                                             {currentElection.totalVotesCast?.toLocaleString() || '4,102,300'}
//                                         </p>
//                                     </div>
//                                     <div className="grid grid-cols-2 gap-4">
//                                         <div className="bg-slate-50 p-3 rounded-xl">
//                                             <p className="text-xs text-slate-500 font-bold uppercase">Turnout</p>
//                                             <p className="text-xl font-bold text-green-600">{currentElection.voterTurnout || 68.5}%</p>
//                                         </div>
//                                         <div className="bg-slate-50 p-3 rounded-xl">
//                                             <p className="text-xs text-slate-500 font-bold uppercase">Counted</p>
//                                             <p className="text-xl font-bold text-nepalBlue">85%</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <p className="text-slate-500 italic">Connecting to live feed...</p>
//                             )}
//                         </div>

//                         {/* Key Races Card */}
//                         <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
//                             <h3 className="font-bold text-slate-800 mb-4 text-lg">Key Battlegrounds</h3>
//                             <div className="space-y-4">
//                                 {[
//                                     { place: 'Kathmandu 1', candidate: 'Prakash Man Singh (NC)', status: 'Leading', margin: '+1,204', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
//                                     { place: 'Jhapa 5', candidate: 'K.P. Sharma Oli (UML)', status: 'Leading', margin: '+5,400', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
//                                     { place: 'Chitwan 2', candidate: 'Rabi Lamichhane (RSP)', status: 'Winning', margin: '+12,000', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' }
//                                 ].map((race, idx) => (
//                                     <div key={idx} className={`p-4 rounded-xl border ${race.bg} transition-transform hover:-translate-y-1`}>
//                                         <div className="flex justify-between items-start mb-2">
//                                             <div>
//                                                 <h4 className="font-bold text-slate-800">{race.place}</h4>
//                                                 <p className="text-xs font-medium text-slate-500">{race.candidate}</p>
//                                             </div>
//                                             <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white ${race.color}`}>
//                                                 {race.status}
//                                             </span>
//                                         </div>
//                                         <div className="text-right">
//                                             <p className="text-xs text-slate-400 font-mono">{race.margin} votes</p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                             <button className="w-full mt-6 py-2.5 text-sm font-semibold text-nepalBlue bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
//                                 View All Key Races →
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </main>

//             <Footer />
//         </div>
//     );
// };

// export default HomePage;
