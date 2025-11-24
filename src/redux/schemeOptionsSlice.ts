// src/redux/schemeOptionsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getSchemeTypes, getSchemeGroups } from "./schemeOptionsService";

import { RootState } from "./store";

interface SchemeOptionsState {
  types: any[];
  groups: any[];
  loadingTypes: boolean;
  loadingGroups: boolean;
  typesLoaded: boolean;   // <- prevents re-fetching
  error: string | null;
}

const initialState: SchemeOptionsState = {
  types: [],
  groups: [],
  loadingTypes: false,
  loadingGroups: false,
  typesLoaded: false,
  error: null,
};

// -------------------------------------------------------------------
// Async Thunks
// -------------------------------------------------------------------

/**
 * Fetch all Scheme Types – runs only once per app session
 */
export const fetchSchemeTypes = createAsyncThunk(
  "schemeOptions/fetchTypes",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;

    // If we already have data, skip network call
    if (state.schemeOptions.typesLoaded && state.schemeOptions.types.length > 0) {
      return state.schemeOptions.types;
    }

    try {
      const data = await getSchemeTypes();
      if (!Array.isArray(data)) {
        throw new Error("Invalid response: expected array of scheme types");
      }
      return data as any[];
    } catch (e: any) {
      const message =
        e.response?.data?.message ||
        e.message ||
        "Failed to fetch scheme types";
      return rejectWithValue(message);
    }
  }
);

/**
 * Fetch Scheme Groups for a specific Scheme Type
 */
export const fetchSchemeGroups = createAsyncThunk(
  "schemeOptions/fetchGroups",
  async (typeId: number, { rejectWithValue }) => {
    if (!typeId) return rejectWithValue("Invalid type ID");

    try {
      const data = await getSchemeGroups(typeId);
      if (!Array.isArray(data)) {
        throw new Error("Invalid response: expected array of scheme groups");
      }
      return data as any[];
    } catch (e: any) {
      const message =
        e.response?.data?.message ||
        e.message ||
        "Failed to fetch scheme groups";
      return rejectWithValue(message);
    }
  }
);

// -------------------------------------------------------------------
// Slice
// -------------------------------------------------------------------
const schemeOptionsSlice = createSlice({
  name: "schemeOptions",
  initialState,
  reducers: {
    /** Clear only groups when type changes */
    clearSchemeGroups(state) {
      state.groups = [];
      state.loadingGroups = false;
    },

    /** Optional: manual reset (e.g. logout) */
    resetSchemeOptions(state) {
      state.types = [];
      state.groups = [];
      state.typesLoaded = false;
      state.loadingTypes = false;
      state.loadingGroups = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ==================== Scheme Types ====================
    builder
      .addCase(fetchSchemeTypes.pending, (state) => {
        state.loadingTypes = true;
        state.error = null;
        // Do NOT clear existing data
      })
      .addCase(
        fetchSchemeTypes.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loadingTypes = false;
          state.types = action.payload;
          state.typesLoaded = true;
        }
      )
      .addCase(fetchSchemeTypes.rejected, (state, action) => {
        state.loadingTypes = false;
        state.error = action.payload as string;
        state.types = []; // only clear on error
      });

    // ==================== Scheme Groups ====================
    builder
      .addCase(fetchSchemeGroups.pending, (state) => {
        state.loadingGroups = true;
        state.error = null;
      })
      .addCase(
        fetchSchemeGroups.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loadingGroups = false;
          state.groups = action.payload;
        }
      )
      .addCase(fetchSchemeGroups.rejected, (state, action) => {
        state.loadingGroups = false;
        state.groups = [];
        state.error = action.payload as string;
      });
  },
});

// -------------------------------------------------------------------
// Exports
// -------------------------------------------------------------------
export const { clearSchemeGroups, resetSchemeOptions } = schemeOptionsSlice.actions;
export default schemeOptionsSlice.reducer;