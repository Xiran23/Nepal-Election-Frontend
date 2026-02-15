
export const mockNationalSummary = {
    totalSeats: 275,
    counted: 265,
    parties: {
        'Nepali Congress': { seats: 89, votes: 892345, color: '#32CD32' },
        'CPN-UML': { seats: 78, votes: 823456, color: '#DC143C' },
        'CPN-Maoist': { seats: 32, votes: 345678, color: '#8B0000' },
        'RSP': { seats: 21, votes: 298765, color: '#FF8C00' },
        'RPP': { seats: 14, votes: 198765, color: '#FFD700' },
        'Jams': { seats: 6, votes: 87654, color: '#808080' },
        'Others': { seats: 25, votes: 456789, color: '#94A3B8' }
    },
    voterTurnout: 68.5,
    lastUpdated: new Date().toISOString()
};

export const mockCandidates = [
    {
        _id: '1',
        name: 'Sher Bahadur Deuba',
        party: { name: 'Nepali Congress', color: '#32CD32' },
        district: { name: 'Dadeldhura' },
        constituency: '1',
        votes: 25534,
        status: 'elected',
        age: 77,
        education: 'Master in Political Science',
        profession: 'Politician',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Sher_Bahadur_Deuba_2018.jpg/220px-Sher_Bahadur_Deuba_2018.jpg',
        bio: 'Sher Bahadur Deuba is a Nepalese politician and former Prime Minister of Nepal. He has served as the president of the Nepali Congress since 2016.'
    },
    {
        _id: '2',
        name: 'K.P. Sharma Oli',
        party: { name: 'CPN-UML', color: '#DC143C' },
        district: { name: 'Jhapa' },
        constituency: '5',
        votes: 42345,
        status: 'elected',
        age: 71,
        education: 'Honorary PhD',
        profession: 'Politician',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/K_P_Sharma_Oli_in_London_%28crop%29.jpg/220px-K_P_Sharma_Oli_in_London_%28crop%29.jpg',
        bio: 'Khadga Prasad Sharma Oli is a Nepalese politician and former Prime Minister of Nepal. He is the chairman of the Communist Party of Nepal (Unified Marxist–Leninist).'
    },
    {
        _id: '3',
        name: 'Pushpa Kamal Dahal',
        party: { name: 'CPN-Maoist', color: '#8B0000' },
        district: { name: 'Gorkha' },
        constituency: '2',
        votes: 26103,
        status: 'elected',
        age: 68,
        education: 'Master in Public Administration',
        profession: 'Politician',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Pushpa_Kamal_Dahal_%22Prachanda%22.jpg/220px-Pushpa_Kamal_Dahal_%22Prachanda%22.jpg',
        bio: 'Pushpa Kamal Dahal, commonly known as Prachanda, is a Nepalese politician and former Prime Minister of Nepal. He is the chairman of the Communist Party of Nepal (Maoist Centre).'
    },
    {
        _id: '4',
        name: 'Rabi Lamichhane',
        party: { name: 'RRSP', color: '#FF8C00' },
        district: { name: 'Chitwan' },
        constituency: '2',
        votes: 54176,
        status: 'elected',
        age: 49,
        education: 'Bachelor Degree',
        profession: 'Journalist / Politician',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Rabi_Lamichhane.jpg/220px-Rabi_Lamichhane.jpg',
        bio: 'Rabi Lamichhane is a Nepalese politician and former television presenter. He is the president of the Rastriya Swatantra Party.'
    },
    {
        _id: '5',
        name: 'Gagan Thapa',
        party: { name: 'Nepali Congress', color: '#32CD32' },
        district: { name: 'Kathmandu' },
        constituency: '4',
        votes: 21302,
        status: 'elected',
        age: 46,
        education: 'Master in Sociology',
        profession: 'Politician',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Gagan_Thapa.jpg/220px-Gagan_Thapa.jpg',
        bio: 'Gagan Kumar Thapa is a Nepalese politician and youth leader who is currently serving as the General Secretary of the Nepali Congress.'
    }
];

export const mockDistrictResults = (districtId) => ({
    districtId,
    name: 'District ' + districtId,
    totalVoters: 150000,
    counted: 150000,
    constituencies: [
        {
            constituency: 1,
            candidates: [
                {
                    candidate: { name: 'Sher Bahadur Deuba', party: { name: 'Nepali Congress', color: '#32CD32' } },
                    votes: 25534
                },
                {
                    candidate: { name: 'Sagar Dhakal', party: { name: 'Independent', color: '#808080' } },
                    votes: 13000
                },
                {
                    candidate: { name: 'Karna Malla', party: { name: 'BP Congress', color: '#0000FF' } },
                    votes: 5000
                }
            ]
        },
        {
            constituency: 2,
            candidates: [
                {
                    candidate: { name: 'Rabi Lamichhane', party: { name: 'RSP', color: '#FF8C00' } },
                    votes: 54176
                },
                {
                    candidate: { name: 'Umesh Shrestha', party: { name: 'Nepali Congress', color: '#32CD32' } },
                    votes: 14000
                },
                {
                    candidate: { name: 'Krishna Bhakta Pokhrel', party: { name: 'CPN-UML', color: '#DC143C' } },
                    votes: 11000
                }
            ]
        },
        {
            constituency: 3,
            candidates: [
                {
                    candidate: { name: 'Gagan Thapa', party: { name: 'Nepali Congress', color: '#32CD32' } },
                    votes: 21302
                },
                {
                    candidate: { name: 'Rajan Bhattarai', party: { name: 'CPN-UML', color: '#DC143C' } },
                    votes: 13855
                }
            ]
        }
    ]
});

export const mockConstituencyData = (districtId, constituencyNo) => ({
    districtId,
    constituencyNo,
    totalVotes: 50000,
    validVotes: 48000,
    candidates: [
        { ...mockCandidates[0], votes: 20000 },
        { ...mockCandidates[1], votes: 15000 },
        { ...mockCandidates[2], votes: 8000 },
        { ...mockCandidates[3], votes: 5000 }
    ]
});
