// src/store/slices/reportDetailSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ReportDetailItem {
    [key: string]: any;
}

interface ReportDetailState {
    data: ReportDetailItem[];
    loading: boolean;
    error: string | null;
}

const initialState: ReportDetailState = {
    data: [],
    loading: false,
    error: null,
};

const reportDetailSlice = createSlice({
    name: 'reportDetail',
    initialState,
    reducers: {
        fetchStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchSuccess(state, action: PayloadAction<ReportDetailItem[]>) {
            state.loading = false;
            state.data = action.payload;
        },
        fetchFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
            state.data = [];
        },
        clearData(state) {
            state.data = [];
            state.error = null;
            state.loading = false;
        },
    },
});

export const { fetchStart, fetchSuccess, fetchFailure, clearData } =
    reportDetailSlice.actions;

export default reportDetailSlice.reducer;