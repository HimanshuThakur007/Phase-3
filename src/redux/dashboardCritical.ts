import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashBoardState {
  dashboardCritical: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DashBoardState = {
  dashboardCritical: [],
  loading: false,
  error: null,
};

const dashboardCriticalSlice = createSlice({
  name: "dashboardCritical",
  initialState,
  reducers: {
    setDashboardCriticalData(state, action: PayloadAction<any[]>) {
      state.dashboardCritical = action.payload;
      state.error = null; // Clear error on success
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const { setDashboardCriticalData, setLoading, setError } =
  dashboardCriticalSlice.actions;
export default dashboardCriticalSlice.reducer;
