import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet } from '../services/api';

// Async thunks (named exports)
export const fetchCandidates = createAsyncThunk(
  'candidate/fetchCandidates',
  async ({ district, party, electionYear, page = 1 } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (district) params.append('district', district);
      if (party) params.append('party', party);
      if (electionYear) params.append('electionYear', electionYear);
      if (page) params.append('page', page);

      const response = await apiGet(`/candidates?${params.toString()}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCandidateById = createAsyncThunk(
  'candidate/fetchCandidateById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiGet(`/candidates/${id}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCandidatesByConstituency = createAsyncThunk(
  'candidate/fetchByConstituency',
  async ({ districtId, constituencyNo, electionYear }, { rejectWithValue }) => {
    try {
      const url = electionYear
        ? `/candidates/constituency/${districtId}/${constituencyNo}?electionYear=${electionYear}`
        : `/candidates/constituency/${districtId}/${constituencyNo}`;
      const response = await apiGet(url);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  candidates: [],
  selectedCandidate: null,
  constituencyCandidates: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  },
  filters: {
    district: null,
    party: null,
    status: null
  },
  status: 'idle',
  loading: false,
  error: null
};

// Create slice
const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    clearSelectedCandidate: (state) => {
      state.selectedCandidate = null;
    },

    setCandidateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    clearCandidateFilters: (state) => {
      state.filters = initialState.filters;
    },

    updateCandidateVotes: (state, action) => {
      const { id, votes, status } = action.payload;

      const candidate = state.candidates.find(c => c.id === id);
      if (candidate) {
        candidate.votes = votes;
        candidate.status = status;
      }

      const constituencyCandidate = state.constituencyCandidates.find(c => c.id === id);
      if (constituencyCandidate) {
        constituencyCandidate.votes = votes;
        constituencyCandidate.status = status;
      }

      if (state.selectedCandidate?.id === id) {
        state.selectedCandidate.votes = votes;
        state.selectedCandidate.status = status;
      }
    },

    sortCandidates: (state, action) => {
      const { field, order } = action.payload;
      state.candidates.sort((a, b) => {
        if (order === 'asc') {
          return a[field] > b[field] ? 1 : -1;
        } else {
          return a[field] < b[field] ? 1 : -1;
        }
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.candidates = action.payload.data || action.payload;
        state.pagination = action.payload.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: state.candidates.length
        };
        state.error = null;
      })
      .addCase(fetchCandidates.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCandidateById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCandidateById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCandidate = action.payload;
      })
      .addCase(fetchCandidateById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCandidatesByConstituency.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCandidatesByConstituency.fulfilled, (state, action) => {
        state.loading = false;
        state.constituencyCandidates = action.payload;
      })
      .addCase(fetchCandidatesByConstituency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Export actions (named exports)
export const {
  clearSelectedCandidate,
  setCandidateFilters,
  clearCandidateFilters,
  updateCandidateVotes,
  sortCandidates
} = candidateSlice.actions;

// Export selectors (named exports)
export const selectAllCandidates = (state) => state.candidate.candidates;
export const selectSelectedCandidate = (state) => state.candidate.selectedCandidate;
export const selectConstituencyCandidates = (state) => state.candidate.constituencyCandidates;
export const selectCandidatesLoading = (state) => state.candidate.loading;
export const selectCandidatesError = (state) => state.candidate.error;
export const selectCandidatesPagination = (state) => state.candidate.pagination;

// Export reducer as default
export default candidateSlice.reducer;