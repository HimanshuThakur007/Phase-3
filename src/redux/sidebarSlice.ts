import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  navigationData: MenuItem[];
  loading: boolean;
  error: string | null;
}

const initialState: SidebarState = {
  navigationData: [],
  loading: false,
  error: null,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setNavigationData(state, action: PayloadAction<MenuItem[]>) {
      state.navigationData = action.payload;
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

export const { setNavigationData, setLoading, setError } = sidebarSlice.actions;
export default sidebarSlice.reducer;