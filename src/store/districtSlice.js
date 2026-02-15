import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet } from '../services/api';

export const fetchDistricts = createAsyncThunk(
    'district/fetchDistricts',
    async () => {
        const response = await apiGet('/districts');
        return response;
    }
);

export const fetchDistrictDetails = createAsyncThunk(
    'district/fetchDistrictDetails',
    async (id) => {
        const response = await apiGet(`/districts/${id}`);
        return response;
    }
);

const districtSlice = createSlice({
    name: 'district',
    initialState: {
        districts: [],
        selectedDistrict: null,
        status: 'idle',
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDistricts.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchDistricts.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.districts = action.payload;
            })
            .addCase(fetchDistricts.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchDistrictDetails.fulfilled, (state, action) => {
                state.selectedDistrict = action.payload;
            });
    },
});

export default districtSlice.reducer;
