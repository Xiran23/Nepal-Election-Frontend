import React from 'react';

const MapLegend = () => {
  const parties = [
    { name: 'Nepali Congress', color: '#32CD32', seats: 89 },
    { name: 'CPN-UML', color: '#DC143C', seats: 78 },
    { name: 'CPN-Maoist', color: '#8B0000', seats: 32 },
    { name: 'RSP', color: '#FF8C00', seats: 20 },
    { name: 'PSP-N', color: '#4169E1', seats: 12 },
    { name: 'Others', color: '#94A3B8', seats: 24 }
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200 z-10">
      <h4 className="font-bold text-gray-800 mb-3 text-sm">Party Position</h4>
      <div className="space-y-2">
        {parties.map((party, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center">
              <span 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: party.color }}
              />
              <span className="font-medium text-gray-700">{party.name}</span>
            </div>
            <span className="font-bold text-gray-900 ml-4">{party.seats}</span>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-200 mt-3 pt-3">
        <div className="flex items-center text-xs">
          <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2" />
          <span className="text-gray-600">Hovered District</span>
        </div>
        <div className="flex items-center text-xs mt-1">
          <span className="w-3 h-3 border-2 border-gray-400 rounded-full mr-2" />
          <span className="text-gray-600">Constituency (click for details)</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;