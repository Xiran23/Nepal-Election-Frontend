import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet, apiPost, apiPut, apiDelete } from '../services/api';

export const fetchParties = createAsyncThunk(
    'party/fetchParties',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet('/parties');
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const createParty = createAsyncThunk(
    'party/createParty',
    async (partyData, { rejectWithValue }) => {
        try {
            const response = await apiPost('/parties', partyData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const partySlice = createSlice({
    name: 'party',
    initialState: {
        parties: [],
        status: 'idle',
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchParties.fulfilled, (state, action) => {
                state.parties = action.payload;
                state.status = 'succeeded';
            })
            .addCase(createParty.fulfilled, (state, action) => {
                state.parties.push(action.payload);
            });
    }
});

export default partySlice.reducer;
