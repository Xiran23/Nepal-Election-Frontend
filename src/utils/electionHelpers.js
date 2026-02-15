// Calculate vote percentage
export const calculateVotePercentage = (votes, totalVotes) => {
  if (!totalVotes) return 0;
  return ((votes / totalVotes) * 100).toFixed(2);
};

// Determine election status
export const getElectionStatus = (election) => {
  const now = new Date();
  const start = new Date(election.startDate);
  const end = new Date(election.endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'completed';
  return 'ongoing';
};

// Calculate margin of victory
export const calculateMargin = (winnerVotes, runnerUpVotes) => {
  const margin = winnerVotes - runnerUpVotes;
  const percentage = ((margin / winnerVotes) * 100).toFixed(2);
  return { margin, percentage };
};

// Format vote count
export const formatVoteCount = (votes) => {
  if (votes >= 1000000) {
    return (votes / 1000000).toFixed(2) + 'M';
  }
  if (votes >= 100000) {
    return (votes / 100000).toFixed(2) + 'L';
  }
  if (votes >= 1000) {
    return (votes / 1000).toFixed(1) + 'K';
  }
  return votes.toString();
};

// Calculate voter turnout
export const calculateTurnout = (votesCast, totalVoters) => {
  if (!totalVoters) return 0;
  return ((votesCast / totalVoters) * 100).toFixed(2);
};

// Group results by party
export const groupByParty = (candidates) => {
  const partyMap = {};
  
  candidates.forEach(candidate => {
    const party = candidate.party?.name || 'Independent';
    if (!partyMap[party]) {
      partyMap[party] = {
        party,
        candidates: [],
        totalVotes: 0,
        seats: 0,
        color: candidate.party?.color || '#94A3B8'
      };
    }
    partyMap[party].candidates.push(candidate);
    partyMap[party].totalVotes += candidate.votes || 0;
    if (candidate.status === 'elected') {
      partyMap[party].seats += 1;
    }
  });
  
  return Object.values(partyMap).sort((a, b) => b.totalVotes - a.totalVotes);
};

// Generate result timeline
export const generateTimeline = (results) => {
  return results
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    .map(result => ({
      time: new Date(result.timestamp).toLocaleTimeString(),
      seats: result.seats,
      votes: result.votes,
      parties: result.parties
    }));
};

// Compare elections
export const compareElections = (election1, election2) => {
  const comparison = {
    year1: election1.year,
    year2: election2.year,
    turnoutChange: election2.voterTurnout - election1.voterTurnout,
    partyChanges: {},
    seatChanges: {}
  };
  
  // Compare party performance
  const parties1 = groupByParty(election1.candidates || []);
  const parties2 = groupByParty(election2.candidates || []);
  
  parties2.forEach(party2 => {
    const party1 = parties1.find(p => p.party === party2.party);
    comparison.seatChanges[party2.party] = party2.seats - (party1?.seats || 0);
    comparison.partyChanges[party2.party] = party2.totalVotes - (party1?.totalVotes || 0);
  });
  
  return comparison;
};

// Get leading candidates
export const getLeadingCandidates = (candidates, limit = 3) => {
  return candidates
    .filter(c => c.status !== 'withdrawn')
    .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    .slice(0, limit);
};

// Calculate required votes to win
export const calculateRequiredToWin = (totalVotes, candidates) => {
  const sorted = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  if (sorted.length < 2) return 0;
  
  const leaderVotes = sorted[0].votes || 0;
  const runnerUpVotes = sorted[1].votes || 0;
  const remainingVotes = totalVotes - sorted.reduce((sum, c) => sum + (c.votes || 0), 0);
  
  return {
    leader: leaderVotes,
    runnerUp: runnerUpVotes,
    margin: leaderVotes - runnerUpVotes,
    remaining: remainingVotes,
    needed: runnerUpVotes - leaderVotes + 1
  };
};