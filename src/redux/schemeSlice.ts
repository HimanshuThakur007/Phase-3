// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { RootState } from './store';

// // -------------------------------------------------
// //  Types
// // -------------------------------------------------
// export interface SchemeFormValues {
//   schemeType: number | null;
//   schemeGroup: number | null;
//   // add any other fields that come from the form
// }

// export interface SavedScheme {
//   /** Unique id – we generate it when saving */
//   id: string;
//   /** The whole grid row that opened the modal */
//   row: Record<string, any>;
//   /** Values the user typed in the modal */
//   form: SchemeFormValues;
//   /** Timestamp – handy for UI */
//   savedAt: string;
// }

// // -------------------------------------------------
// //  Slice
// // -------------------------------------------------
// interface SchemeState {
//   /** All saved schemes */
//   savedSchemes: SavedScheme[];
// }

// const initialState: SchemeState = {
//   savedSchemes: [],
// };

// export const schemeSlice = createSlice({
//   name: 'scheme',
//   initialState,
//   reducers: {
//     /** Save = row + form values */
//     saveScheme(
//       state,
//       action: PayloadAction<{
//         row: Record<string, any>;
//         form: SchemeFormValues;
//       }>
//     ) {
//       const { row, form } = action.payload;

//       // generate a stable id from the primary key(s) of the row
//       const primaryKey = row['Item Code'] ?? row['Branch Code'] ?? row['Department'];
//       const id = `${primaryKey}-${Date.now()}`;

//       const newEntry: SavedScheme = {
//         id,
//         row,
//         form,
//         savedAt: new Date().toISOString(),
//       };

//       // If the same primary key already exists → replace, otherwise push
//       const existingIdx = state.savedSchemes.findIndex(
//         (s) => s.row['Item Code'] === primaryKey
//       );
//       if (existingIdx > -1) {
//         state.savedSchemes[existingIdx] = newEntry;
//       } else {
//         state.savedSchemes.push(newEntry);
//       }
//     },

//     /** Delete by id */
//     deleteScheme(state, action: PayloadAction<string>) {
//       state.savedSchemes = state.savedSchemes.filter(
//         (s) => s.id !== action.payload
//       );
//     },

//     /** Optional: clear everything */
//     clearAllSchemes(state) {
//       state.savedSchemes = [];
//     },
//   },
// });

// // -------------------------------------------------
// //  Export actions
// // -------------------------------------------------
// export const { saveScheme, deleteScheme, clearAllSchemes } = schemeSlice.actions;

// // -------------------------------------------------
// //  Selectors (optional but handy)
// // -------------------------------------------------
// export const selectSavedSchemes = (state: RootState) => state.scheme.savedSchemes;
// export const selectSchemeById =
//   (id: string) => (state: RootState) =>
//     state.scheme.savedSchemes.find((s:any) => s.id === id);

// // -------------------------------------------------
// //  Reducer
// // -------------------------------------------------
// export default schemeSlice.reducer;


// src/redux/schemeSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { RootState } from './store';

// // -------------------------------------------------
// // Types
// // -------------------------------------------------
// export interface SchemeFormValues {
//   schemeType: number | null;
//   schemeGroup: number | null;
//   displayType?: string | null;
// }

// export interface SavedScheme {
//   id: string;
//   row: Record<string, any>;
//   form: SchemeFormValues;
//   savedAt: string;
// }

// interface SchemeState {
//   savedSchemes: SavedScheme[];
// }

// const initialState: SchemeState = {
//   savedSchemes: [],
// };

// export const schemeSlice = createSlice({
//   name: 'scheme',
//   initialState,
//   reducers: {
//     saveScheme(
//       state,
//       action: PayloadAction<{
//         row: Record<string, any>;
//         form: SchemeFormValues;
//       }>
//     ) {
//       const { row, form } = action.payload;
//       const primaryKey = row['Item Code'] ?? row['Branch Code'] ?? row['Department'] ?? Date.now();
//       const id = `${primaryKey}-${Date.now()}`;

//       const newEntry: SavedScheme = {
//         id,
//         row,
//         form,
//         savedAt: new Date().toISOString(),
//       };

//       const existingIdx = state.savedSchemes.findIndex(
//         (s) => s.row['Item Code'] === primaryKey
//       );
//       if (existingIdx > -1) {
//         state.savedSchemes[existingIdx] = newEntry;
//       } else {
//         state.savedSchemes.push(newEntry);
//       }
//     },

//     deleteScheme(state, action: PayloadAction<string>) {
//       state.savedSchemes = state.savedSchemes.filter((s) => s.id !== action.payload);
//     },

//     clearAllSchemes(state) {
//       state.savedSchemes = [];
//     },
//   },
// });

// export const { saveScheme, deleteScheme, clearAllSchemes } = schemeSlice.actions;

// export const selectSavedSchemes = (state: RootState) => state.scheme.savedSchemes;

// export default schemeSlice.reducer;


// redux/schemeSlice.ts
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { RootState } from "./store";

// export interface SchemeFormValues {
//   schemeType: number | null;
//   schemeGroup: number | null;
//   displayType?: string | null;
// }

// export interface SavedScheme {
//   id: string;
//   itemCode: string;
//   branchCode?: string;
//   data: Record<string, any>; // full row + appliedScheme
//   savedAt: string;
// }

// interface SchemeState {
//   savedSchemes: SavedScheme[];
// }

// const initialState: SchemeState = {
//   savedSchemes: [],
// };

// export const schemeSlice = createSlice({
//   name: "scheme",
//   initialState,
//   reducers: {
//     saveScheme(
//       state,
//       action: PayloadAction<{
//         itemCode: string;
//         branchCode?: string;
//         data: Record<string, any>;
//       }>
//     ) {
//       const { itemCode, branchCode, data } = action.payload;
//       const id = branchCode ? `${itemCode}-${branchCode}` : `${itemCode}-global`;

//       const newEntry: SavedScheme = {
//         id,
//         itemCode,
//         branchCode,
//         data,
//         savedAt: new Date().toISOString(),
//       };

//       const existingIdx = state.savedSchemes.findIndex((s) => s.id === id);
//       if (existingIdx > -1) {
//         state.savedSchemes[existingIdx] = newEntry;
//       } else {
//         state.savedSchemes.push(newEntry);
//       }
//     },

//     removeSavedSchemeByItemCode(
//       state,
//       action: PayloadAction<string | { itemCode: string; branchCode: string }>
//     ) {
//       const payload = action.payload;
//       let idToRemove: string;

//       if (typeof payload === "string") {
//         idToRemove = `${payload}-global`;
//       } else {
//         idToRemove = `${payload.itemCode}-${payload.branchCode}`;
//       }

//       state.savedSchemes = state.savedSchemes.filter((s) => s.id !== idToRemove);
//     },

//     clearAllSchemes(state) {
//       state.savedSchemes = [];
//     },

//     clearDataAfterSave(state) {
//       state.savedSchemes = state.savedSchemes.map((s) => ({
//         ...s,
//         data: {},
//       }));
//     },
//   },
// });

// export const {
//   saveScheme,
//   removeSavedSchemeByItemCode,
//   clearAllSchemes,
//   clearDataAfterSave,
// } = schemeSlice.actions;

// export const selectSavedSchemes = (state: RootState) =>
//   state.scheme?.savedSchemes ?? [];

// export default schemeSlice.reducer;


// redux/schemeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface SchemeFormValues {
  schemeType: number | null;
  schemeGroup: number | null;
  displayType?: string | null;
}

export interface SavedScheme {
  id: string;
  itemCode?: string;
  branchCode?: string | null;
  data: Record<string, any>;
  savedAt: string;
}

interface SchemeState {
  savedSchemes: SavedScheme[];
}

const initialState: SchemeState = {
  savedSchemes: [],
};

type SaveSchemePayloadLegacy = {
  // legacy payload used by Phase3Page
  row: Record<string, any>;
  scheme: Record<string, any>;
};

type SaveSchemePayloadNew = {
  // new payload shape used elsewhere
  itemCode: string;
  branchCode?: string | null;
  data: Record<string, any>;
};

type SaveSchemeAction = SaveSchemePayloadNew | SaveSchemePayloadLegacy;

const makeId = (itemCode?: string, branchCode?: string | null) => {
  const ic = (itemCode ?? "").toString().trim();
  if (!ic) {
    // fallback id for pure data-only entries
    return `__data__-${Math.random().toString(36).slice(2, 9)}`;
  }
  return branchCode ? `${ic}-${String(branchCode).trim()}` : `${ic}-global`;
};

export const schemeSlice = createSlice({
  name: "scheme",
  initialState,
  reducers: {
    saveScheme(state, action: PayloadAction<SaveSchemeAction>) {
      // support both legacy and new payload shapes
      let itemCode: string | undefined;
      let branchCode: string | undefined | null;
      let data: Record<string, any> = {};

      const payload = action.payload as any;

      // If legacy shape { row, scheme }
      if (payload && payload.row && payload.scheme) {
        const row = payload.row || {};
        // try common row keys for itemCode / branchCode
        itemCode =
          row.itemCode ??
          row["Item Code"] ??
          row.ItemCode ??
          row.item_code ??
          row.itemcode ??
          undefined;
        branchCode =
          row.branchCode ??
          row.branch_code ??
          row.BranchCode ??
          row.Branch_Code ??
          row.branch ??
          row.Branch ??
          undefined;
        data = payload.scheme ?? {};
      } else {
        // new shape { itemCode, branchCode?, data }
        itemCode = payload.itemCode ?? undefined;
        branchCode = payload.branchCode ?? undefined;
        data = payload.data ?? {};
      }

      const id = makeId(itemCode, branchCode ?? null);

      const newEntry: SavedScheme = {
        id,
        itemCode,
        branchCode: branchCode === undefined ? null : branchCode,
        data,
        savedAt: new Date().toISOString(),
      };

      const existingIdx = state.savedSchemes.findIndex((s) => s.id === id);
      if (existingIdx > -1) {
        state.savedSchemes[existingIdx] = newEntry;
      } else {
        state.savedSchemes.push(newEntry);
      }
    },

    removeSavedSchemeByItemCode(
      state,
      action: PayloadAction<
        string | { itemCode: string; branchCode?: string | null }
      >
    ) {
      const payload = action.payload;
      let idToRemove: string;

      if (typeof payload === "string") {
        // treat as itemCode -> remove global entry
        idToRemove = `${payload}-global`;
      } else {
        const branch = payload.branchCode ?? null;
        idToRemove = makeId(payload.itemCode, branch);
      }
      state.savedSchemes = state.savedSchemes.filter((s) => s.id !== idToRemove);
    },

    clearAllSchemes(state) {
      state.savedSchemes = [];
    },

    clearDataAfterSave(state) {
      state.savedSchemes = state.savedSchemes.map((s) => ({
        ...s,
        data: {},
      }));
    },
  },
});

export const {
  saveScheme,
  removeSavedSchemeByItemCode,
  clearAllSchemes,
  clearDataAfterSave,
} = schemeSlice.actions;

export const selectSavedSchemes = (state: RootState) =>
  state.scheme?.savedSchemes ?? [];

export default schemeSlice.reducer;

