import { createSlice } from "@reduxjs/toolkit";

// Define TypeScript interface for dashboard modal configuration
export interface DashboardModalConfig {
  title?: string;
  size?: "sm" | "lg" | "xl";
  centered?: boolean;
  closeButton?: boolean;
  className?: string;
  backdrop?: boolean | "static";
}

interface DashboardModalState {
  isOpen: boolean;
  config: DashboardModalConfig | null;
}

const initialState: DashboardModalState = {
  isOpen: false,
  config: null,
};

const dashboardModalSlice = createSlice({
  name: "dashboardModal",
  initialState,
  reducers: {
    openDashboardModal(state) {
      state.isOpen = true;
      state.config = null;
    },
    closeDashboardModal(state) {
      state.isOpen = false;
      state.config = null;
    },
  },
});

export const { openDashboardModal, closeDashboardModal } =
  dashboardModalSlice.actions;
export default dashboardModalSlice.reducer;
