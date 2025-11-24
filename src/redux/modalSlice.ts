import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReactNode } from "react";

// Define TypeScript interfaces for modal configuration
export interface ModalConfig {
  title?: string;
  content: ReactNode;
  footerButtons?: Array<{
    label: string;
    variant?: string;
    onClick: () => void;
    disabled?: boolean;
  }>;
  size?: "sm" | "lg" | "xl";
  centered?: boolean;
  closeButton?: boolean;
  className?: string;
  backdrop?: boolean | "static";
}

interface ModalState {
  isOpen: boolean;
  config: ModalConfig | null;
}

const initialState: ModalState = {
  isOpen: false,
  config: null,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<ModalConfig>) {
      state.isOpen = true;
      state.config = action.payload;
    },
    closeModal(state) {
      state.isOpen = false;
      state.config = null;
    },
  },
});

export const { openModal, closeModal } = modalSlice.actions;
export default modalSlice.reducer;
