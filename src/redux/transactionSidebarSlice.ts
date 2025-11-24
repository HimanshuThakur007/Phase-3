import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MenuItem {
  MenuID: number;
  Name: string;
  RepID: string;
  ParentId: number;
  Link: string;
  Icon: string;
  TranType: number;
  SubmenuItems: MenuItem[];
}

interface SidebarState {
  navigationTranData: MenuItem[];
  loading: boolean;
  error: string | null;
}

const initialState: SidebarState = {
  navigationTranData: [],
  loading: false,
  error: null,
};

const transactionSidebarSlice = createSlice({
  name: "transidebar",
  initialState,
  reducers: {
    setTranNavigationData(state, action: PayloadAction<MenuItem[]>) {
      state.navigationTranData = action.payload;
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

export const { setTranNavigationData, setLoading, setError } =
  transactionSidebarSlice.actions;
export default transactionSidebarSlice.reducer;
