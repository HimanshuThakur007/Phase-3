import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FormState {
  formValues: Record<string, any>;
}

const initialState: FormState = {
  formValues: {},
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    updateFormValues: (
      state,
      action: PayloadAction<{ key: string; value: any }>
    ) => {
      state.formValues[action.payload.key] = action.payload.value;
    },
    resetFormValues: (state) => {
      state.formValues = {};
    },
  },
});

export const { updateFormValues, resetFormValues } = formSlice.actions;
export default formSlice.reducer;