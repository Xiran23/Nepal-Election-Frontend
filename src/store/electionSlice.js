import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet } from '../services/api';
import { getPartyColor } from '../utils/mapHelpers';

// Async thunks
export const fetchLiveResults = createAsyncThunk(
  'election/fetchLiveResults',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet('/results/live');
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchDistrictElectionData = createAsyncThunk(
  'election/fetchDistrictData',
  async (districtId, { rejectWithValue }) => {
    try {
      const response = await apiGet(`/districts/${districtId}/election-results`);
      return { districtId, data: response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConstituencyResults = createAsyncThunk(
  'election/fetchConstituencyResults',
  async ({ districtId, constituencyNo }, { rejectWithValue }) => {
    try {
      const response = await apiGet(`/constituencies/${districtId}/${constituencyNo}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchNationalSummary = createAsyncThunk(
  'election/fetchNationalSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet('/results/national-summary');
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchElections = createAsyncThunk(
  'election/fetchElections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet('/elections');
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCurrentElection = createAsyncThunk(
  'election/fetchCurrentElection',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiGet('/elections/current');
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  liveResults: [],
  districtResults: {},
  constituencyData: null,
  nationalSummary: {
    totalSeats: 275,
    counted: 0,
    parties: {
      'Nepali Congress': { seats: 0, votes: 0, color: '#32CD32' },
      'CPN-UML': { seats: 0, votes: 0, color: '#DC143C' },
      'CPN-Maoist': { seats: 0, votes: 0, color: '#8B0000' },
      'RSP': { seats: 0, votes: 0, color: '#FF8C00' },
      'PSP-N': { seats: 0, votes: 0, color: '#4169E1' },
      'Others': { seats: 0, votes: 0, color: '#94A3B8' }
    },
    voterTurnout: 0,
    lastUpdated: null
  },
  elections: [],
  currentElection: null,
  status: 'idle',
  error: null,
  loading: false
};

const electionSlice = createSlice({
  name: 'election',
  initialState,
  reducers: {
    updateLocalResult: (state, action) => {
      const { districtId, constituencyNo, data } = action.payload;
      if (!state.districtResults[districtId]) {
        state.districtResults[districtId] = {};
      }
      if (!state.districtResults[districtId][constituencyNo]) {
        state.districtResults[districtId][constituencyNo] = {};
      }
      state.districtResults[districtId][constituencyNo] = data;
      
      // Update national summary based on local data
      if (data.winner) {
        const party = data.winner.party;
        if (state.nationalSummary.parties[party]) {
          state.nationalSummary.parties[party].seats += 1;
        } else {
          state.nationalSummary.parties['Others'].seats += 1;
        }
        state.nationalSummary.counted += 1;
      }
    },
    
    clearElectionData: (state) => {
      state.districtResults = {};
      state.constituencyData = null;
      state.nationalSummary = initialState.nationalSummary;
    },
    
    updateVoterTurnout: (state, action) => {
      state.nationalSummary.voterTurnout = action.payload;
    },
    
    setLastUpdated: (state, action) => {
      state.nationalSummary.lastUpdated = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Live Results
      .addCase(fetchLiveResults.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchLiveResults.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.liveResults = action.payload;
        state.error = null;
      })
      .addCase(fetchLiveResults.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch District Election Data
      .addCase(fetchDistrictElectionData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDistrictElectionData.fulfilled, (state, action) => {
        state.loading = false;
        const { districtId, data } = action.payload;
        state.districtResults[districtId] = data;
        
        // Update party colors in data
        if (data.constituencies) {
          data.constituencies.forEach(constituency => {
            if (constituency.winner) {
              constituency.winner.color = getPartyColor(constituency.winner.party);
            }
          });
        }
      })
      .addCase(fetchDistrictElectionData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Constituency Results
      .addCase(fetchConstituencyResults.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConstituencyResults.fulfilled, (state, action) => {
        state.loading = false;
        state.constituencyData = action.payload;
      })
      .addCase(fetchConstituencyResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch National Summary
      .addCase(fetchNationalSummary.fulfilled, (state, action) => {
        state.nationalSummary = action.payload;
      })
      
      // Fetch Elections
      .addCase(fetchElections.fulfilled, (state, action) => {
        state.elections = action.payload;
      })
      
      // Fetch Current Election
      .addCase(fetchCurrentElection.fulfilled, (state, action) => {
        state.currentElection = action.payload;
      });
  }
});

export const { 
  updateLocalResult, 
  clearElectionData, 
  updateVoterTurnout, 
  setLastUpdated 
} = electionSlice.actions;

export default electionSlice.reducer;

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { apiGet } from '../services/api';

// export const fetchLiveResults = createAsyncThunk(
//   'election/fetchLiveResults',
//   async () => {
//     const response = await apiGet('/results/live');
//     return response;
//   }
// );

// export const fetchDistrictElectionData = createAsyncThunk(
//   'election/fetchDistrictData',
//   async (districtId) => {
//     const response = await apiGet(`/districts/${districtId}/results`);
//     return response;
//   }
// );

// const electionSlice = createSlice({
//   name: 'election',
//   initialState: {
//     liveResults: [],
//     districtResults: {},
//     nationalSummary: {
//       totalSeats: 275,
//       counted: 0,
//       parties: {}
//     },
//     status: 'idle',
//     error: null
//   },
//   reducers: {
//     updateLocalResult: (state, action) => {
//       const { districtId, data } = action.payload;
//       state.districtResults[districtId] = data;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchLiveResults.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchLiveResults.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.liveResults = action.payload;
//       })
//       .addCase(fetchDistrictElectionData.fulfilled, (state, action) => {
//         const { districtId, data } = action.meta.arg;
//         state.districtResults[districtId] = data;
//       });
//   }
// });

// export const { updateLocalResult } = electionSlice.actions;
// export default electionSlice.reducer;


// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { apiGet } from '../services/api';

// export const fetchElections = createAsyncThunk(
//     'election/fetchElections',
//     async () => {
//         const response = await apiGet('/elections');
//         return response;
//     }
// );

// export const fetchCurrentElection = createAsyncThunk(
//     'election/fetchCurrentElection',
//     async () => {
//         const response = await apiGet('/elections/current');
//         return response;
//     }
// );

// const electionSlice = createSlice({
//     name: 'election',
//     initialState: {
//         elections: [],
//         currentElection: null,
//         status: 'idle',
//         error: null,
//     },
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchElections.pending, (state) => {
//                 state.status = 'loading';
//             })
//             .addCase(fetchElections.fulfilled, (state, action) => {
//                 state.status = 'succeeded';
//                 state.elections = action.payload;
//             })
//             .addCase(fetchElections.rejected, (state, action) => {
//                 state.status = 'failed';
//                 state.error = action.error.message;
//             })
//             .addCase(fetchCurrentElection.fulfilled, (state, action) => {
//                 state.currentElection = action.payload;
//             });
//     },
// });

// export default electionSlice.reducer;
