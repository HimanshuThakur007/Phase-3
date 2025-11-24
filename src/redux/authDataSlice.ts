import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the shape of the decrypted data
interface DecryptedData {
  ID?: number;
  IsSuperUser?: boolean;
  Name?: string;
  IsActive?: boolean;
  [key: string]: any; // Allow additional fields from mainCompany
}

// Define the initial state
interface AuthDataState {
  decryptedData: DecryptedData | null;
}

const initialState: AuthDataState = {
  decryptedData: null,
};

// Create the slice
const authDataSlice = createSlice({
  name: "authData",
  initialState,
  reducers: {
    setDecryptData: (state, action: PayloadAction<DecryptedData>) => {
      state.decryptedData = action.payload;
    },
    clearDecryptData: (state) => {
      state.decryptedData = null;
    },
  },
});

// Export actions
export const { setDecryptData, clearDecryptData } = authDataSlice.actions;

// Export reducer
export default authDataSlice.reducer;
