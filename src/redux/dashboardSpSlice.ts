import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashBoardState {
  dashboardSpData: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DashBoardState = {
  dashboardSpData: [],
  loading: false,
  error: null,
};

const dashboardSpSlice = createSlice({
  name: "dashboardSp",
  initialState,
  reducers: {
    setDashboardSpData(state, action: PayloadAction<any[]>) {
      state.dashboardSpData = action.payload;
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

export const { setDashboardSpData, setLoading, setError } =
  dashboardSpSlice.actions;
export default dashboardSpSlice.reducer;
