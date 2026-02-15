import React from 'react';
import { formatVoteCount } from '../../utils/electionHelpers';

const CandidateCard = ({ candidate, totalVotes, onClick }) => {
  const votePercentage = totalVotes ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
  
  const statusColors = {
    elected: 'bg-green-100 text-green-800 border-green-200',
    leading: 'bg-blue-100 text-blue-800 border-blue-200',
    trailing: 'bg-orange-100 text-orange-800 border-orange-200',
    lost: 'bg-red-100 text-red-800 border-red-200',
    withdrawn: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="flex items-start space-x-4">
        {/* Candidate Image/Icon */}
        <div className="relative">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: candidate.party?.color || '#94A3B8' }}
          >
            {candidate.imageUrl ? (
              <img 
                src={candidate.imageUrl} 
                alt={candidate.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              candidate.name?.charAt(0) || '?'
            )}
          </div>
          
          {/* Party Symbol */}
          {candidate.party?.symbol && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center text-xs">
              {candidate.party.symbol}
            </div>
          )}
        </div>

        {/* Candidate Info */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-gray-900">{candidate.name}</h3>
              <p className="text-sm text-gray-500">{candidate.party?.name}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${statusColors[candidate.status] || 'bg-gray-100 text-gray-800'}`}>
              {candidate.status?.toUpperCase() || 'CONTESTING'}
            </span>
          </div>

          {/* Vote Stats */}
          <div className="mt-4">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-gray-500">Votes</span>
              <span className="font-bold text-gray-900">{formatVoteCount(candidate.votes || 0)}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${votePercentage}%`,
                  backgroundColor: candidate.party?.color || '#94A3B8'
                }}
              />
            </div>
            
            <div className="flex justify-between items-center text-xs mt-1">
              <span className="text-gray-400">Vote Share</span>
              <span className="font-semibold text-gray-700">{votePercentage}%</span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
            <span>Constituency {candidate.constituency}</span>
            {candidate.margin && (
              <span className="text-green-600 font-medium">Margin: {candidate.margin}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;