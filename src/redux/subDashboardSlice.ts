// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface SubDashboardState {
//   subDashboardData: any[]; // or `any | null` if it's not always an array
//   loading: boolean;
//   error: string | null;
// }

// const initialState: SubDashboardState = {
//   subDashboardData: [],
//   loading: false,
//   error: null,
// };

// const subDashboardSlice = createSlice({
//   name: "subDashboard",
//   initialState,
//   reducers: {
//     setSubDashboardData(state, action: PayloadAction<any[]>) {
//       state.subDashboardData = action.payload;
//       state.error = null;
//     },
//     setSubDashboardLoading(state, action: PayloadAction<boolean>) {
//       state.loading = action.payload;
//     },
//     setSubDashboardError(state, action: PayloadAction<string>) {
//       state.error = action.payload;
//     },
//   },
// });

// export const {
//   setSubDashboardData,
//   setSubDashboardLoading,
//   setSubDashboardError,
// } = subDashboardSlice.actions;

// export default subDashboardSlice.reducer;

// =========================================================================================================

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SubDashboardState {
  dashData: {
    subDashboardData: any[];
    subDashboardTopCustData: any[];
    subDashboardTopSalesManData: any[];
    subDashboardTopStateData: any[];
    subDashboardTopProductData: any[];
    subDashboardTopCategoryData: any[];
    subDashboardMapData: any[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: SubDashboardState = {
  dashData: {
    subDashboardData: [],
    subDashboardTopCustData: [],
    subDashboardTopSalesManData: [],
    subDashboardTopStateData: [],
    subDashboardTopProductData: [],
    subDashboardTopCategoryData: [],
    subDashboardMapData: [],
  },
  loading: false,
  error: null,
};

const subDashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSubDashboardData(state, action: PayloadAction<any[]>) {
      state.dashData.subDashboardData = action.payload;
      state.error = null;
    },
    setSubDashboardTopCustData(state, action: PayloadAction<any[]>) {
      state.dashData.subDashboardTopCustData = action.payload;
      state.error = null;
    },
    setSubDashboardTopSalesManData(state, action: PayloadAction<any[]>) {
      state.dashData.subDashboardTopSalesManData = action.payload;
      state.error = null;
    },
    setSubDashboardTopStateData(state, action: PayloadAction<any[]>) {
      state.dashData.subDashboardTopStateData = action.payload;
      state.error = null;
    },
    setSubDashboardTopProductData(state, action: PayloadAction<any[]>) {
      state.dashData.subDashboardTopProductData = action.payload;
      state.error = null;
    },
    setSubDashboardTopCategoryData(state, action: PayloadAction<any[]>) {
      state.dashData.subDashboardTopCategoryData = action.payload;
      state.error = null;
    },
    setSubDashboardMapData(state, action: PayloadAction<any[]>) {
      state.dashData.subDashboardMapData = action.payload;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
  },
});

export const {
  setSubDashboardData,
  setSubDashboardTopCustData,
  setSubDashboardTopSalesManData,
  setSubDashboardTopStateData,
  setSubDashboardTopProductData,
  setSubDashboardTopCategoryData,
  setSubDashboardMapData,
  setLoading,
  setError,
} = subDashboardSlice.actions;
export default subDashboardSlice.reducer;
