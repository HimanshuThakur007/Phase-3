import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ExpenseDataState {
  modalData: any;
  viewType: number;
  recType: number;
}

const initialState: ExpenseDataState = {
  modalData: null,
  viewType: 1,
  recType: 1,
};

const expenseDataSlice = createSlice({
  name: "expenseData",
  initialState,
  reducers: {
    setModalData(state, action: PayloadAction<any>) {
      state.modalData = action.payload;
    },
    setViewType(state, action: PayloadAction<number>) {
      state.viewType = action.payload;
    },
    setRecType(state, action: PayloadAction<number>) {
      state.recType = action.payload;
    },
    resetExpenseData(state) {
      state.modalData = null;
      state.viewType = 1;
      state.recType = 1;
    },
  },
});

export const { setModalData, setViewType, setRecType, resetExpenseData } =
  expenseDataSlice.actions;
export default expenseDataSlice.reducer;
