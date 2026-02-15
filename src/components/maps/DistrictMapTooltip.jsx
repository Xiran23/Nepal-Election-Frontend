import React from 'react';

const DistrictMapTooltip = ({ district, position }) => {
  if (!district) return null;

  return (
    <div
      className="bg-white rounded-xl shadow-2xl p-4 z-50 border-l-4 pointer-events-none"
      style={{
        position: 'absolute',
        left: '15px',
        top: '-160px',
        borderLeftColor: district.color || '#3B82F6',
        minWidth: '280px',
        maxWidth: '320px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{district.name}</h3>
          <p className="text-sm text-gray-500">{district.nameNepali}</p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-semibold">
          {district.province}
        </span>
      </div>

      {/* Constituencies Info */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Constituencies:</span>
          <span className="font-bold text-gray-900">{district.total_constituencies || district.constituencies || 1}</span>
        </div>

        {/* Constituency dots preview */}
        <div className="flex space-x-1 mt-1">
          {[...Array(district.total_constituencies || district.constituencies || 1)].map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: district.partyColors?.[i] || '#CBD5E1' }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Election Results Preview */}
      {district.winner ? (
        <div className="bg-gray-50 rounded-lg p-2 text-sm">
          <p className="text-xs text-gray-500 mb-1">Current Leading Party</p>
          <div className="flex items-center justify-between">
            <span className="font-semibold">{district.winner.party}</span>
            <span className="text-green-600 font-bold">{district.winner.margin}+</span>
          </div>

          {/* Vote Share */}
          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${district.winner.voteShare || 60}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span>Vote Share</span>
            <span className="font-bold">{district.winner.voteShare || 60}%</span>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-2 text-center text-sm text-gray-500">
          Results being counted...
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 text-xs text-gray-400 flex justify-between items-center">
        <span>Click for detailed view</span>
        <span className="flex items-center">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
          Live
        </span>
      </div>
    </div>
  );
};

export default DistrictMapTooltip;