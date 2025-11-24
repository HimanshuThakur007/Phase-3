import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { set } from "lodash";

export type SavedScheme = {
  itemCode?: string;
  branchCode?: string;
  data: any; // merged object of row + scheme
  savedAt: string;
};

interface Phase3State {
  summaries: any[];
  departmentSummaries: any[];
  itemSummaries: any[];
  comparisonSummaries: any[];
  branchSchemeSummaries: any[];
  loading: boolean;
  error: string | null;
  activeTab: "department" | "branch" | "item";
  tableHeight: string;
  savedSchemes: SavedScheme[];
}

const initialState: Phase3State = {
  summaries: [],
  departmentSummaries: [],
  itemSummaries: [],
  comparisonSummaries: [],
  branchSchemeSummaries: [],
  loading: false,
  error: null,
  activeTab: "department",
  tableHeight: "600px",
  savedSchemes: [],
};

// Helper to normalize itemCode from many possible field names
const getItemCodeFromRow = (row: any): string | undefined => {
  if (!row) return undefined;
  const raw =
    row?.["Item Code"] ??
    row?.itemCode ??
    row?.ItemCode ??
    row?.item_code ??
    row?.Item_Code ??
    row?.itemcode ??
    undefined;
  if (raw === undefined || raw === null) return undefined;
  const trimmed = String(raw).trim();
  return trimmed === "" ? undefined : trimmed;
};

// Helper to normalize branchCode from many possible field names
const getBranchCodeFromRow = (row: any): string | undefined => {
  if (!row) return undefined;
  const raw =
    row?.branchCode ??
    row?.Branch_Code ??
    row?.BranchCode ??
    row?.branch_code ??
    row?.branch ??
    row?.Branch ??
    undefined;
  if (raw === undefined || raw === null) return undefined;
  const trimmed = String(raw).trim();
  return trimmed === "" ? undefined : trimmed;
};

const mergeRowAndScheme = (row: any, scheme: any) => {
  // scheme keys overwrite row keys on collisions
  return { ...(row || {}), ...(scheme || {}) };
};

const phase3Slice = createSlice({
  name: "phase3",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<"department" | "branch" | "item">) => {
      state.activeTab = action.payload;
    },
    setTableHeight: (state, action: PayloadAction<string>) => {
      state.tableHeight = action.payload;
    },

    // Save scheme (no duplicates; merge row + scheme into single object)
    // Will include branchCode (if present) and upsert by itemCode+branchCode when available.
    saveScheme: (state, action: PayloadAction<{ row: any; scheme: any }>) => {
      const { row, scheme } = action.payload;
      const merged = mergeRowAndScheme(row, scheme);

      const itemCode = getItemCodeFromRow(row);
      const branchCode = getBranchCodeFromRow(row);

      // if both itemCode and branchCode are available, upsert by both
      if (itemCode && branchCode) {
        const idx = state.savedSchemes.findIndex(
          (s) =>
            String(s.itemCode ?? "").trim().toLowerCase() === String(itemCode).trim().toLowerCase() &&
            String(s.branchCode ?? "").trim().toLowerCase() === String(branchCode).trim().toLowerCase()
        );
        const entry: SavedScheme = {
          itemCode,
          branchCode,
          data: merged,
          savedAt: new Date().toISOString(),
        };
        if (idx >= 0) {
          state.savedSchemes[idx] = entry;
        } else {
          state.savedSchemes.push(entry);
        }
        return;
      }

      // If itemCode exists but no branch -> upsert by itemCode only (global)
      if (itemCode) {
        const idx = state.savedSchemes.findIndex(
          (s) =>
            String(s.itemCode ?? "").trim().toLowerCase() === String(itemCode).trim().toLowerCase() &&
            (s.branchCode === undefined || s.branchCode === null)
        );
        const entry: SavedScheme = {
          itemCode,
          branchCode: undefined,
          data: merged,
          savedAt: new Date().toISOString(),
        };
        if (idx >= 0) {
          state.savedSchemes[idx] = entry;
        } else {
          state.savedSchemes.push(entry);
        }
        return;
      }

      // If no itemCode, avoid pushing exact duplicate merged objects (branchCode may or may not be present)
      const mergedJson = JSON.stringify(merged);
      const alreadyExists = state.savedSchemes.some((s) => {
        try {
          return JSON.stringify(s.data) === mergedJson && (getBranchCodeFromRow(s.data) ?? s.branchCode) === branchCode;
        } catch {
          return false;
        }
      });

      if (!alreadyExists) {
        state.savedSchemes.push({
          itemCode: undefined,
          branchCode: branchCode ?? undefined,
          data: merged,
          savedAt: new Date().toISOString(),
        });
      }
    },

    // Optional: upsert by Item Code specifically (keeps merged shape)
    saveOrUpdateScheme: (state, action: PayloadAction<{ row: any; scheme: any }>) => {
      const { row, scheme } = action.payload;
      const merged = mergeRowAndScheme(row, scheme);

      const itemCode = getItemCodeFromRow(row);
      const branchCode = getBranchCodeFromRow(row);

      const entry: SavedScheme = {
        itemCode,
        branchCode: branchCode ?? undefined,
        data: merged,
        savedAt: new Date().toISOString(),
      };

      if (itemCode && branchCode) {
        const idx = state.savedSchemes.findIndex(
          (s) =>
            String(s.itemCode ?? "").trim().toLowerCase() === String(itemCode).trim().toLowerCase() &&
            String(s.branchCode ?? "").trim().toLowerCase() === String(branchCode).trim().toLowerCase()
        );
        if (idx >= 0) {
          state.savedSchemes[idx] = entry;
        } else {
          state.savedSchemes.push(entry);
        }
        return;
      }

      if (itemCode) {
        const idx = state.savedSchemes.findIndex(
          (s) =>
            String(s.itemCode ?? "").trim().toLowerCase() === String(itemCode).trim().toLowerCase() &&
            (s.branchCode === undefined || s.branchCode === null)
        );
        if (idx >= 0) {
          state.savedSchemes[idx] = entry;
        } else {
          state.savedSchemes.push(entry);
        }
        return;
      }

      // fallback: behave like insert if no itemCode
      const mergedJson = JSON.stringify(merged);
      const alreadyExists = state.savedSchemes.some((s) => {
        try {
          return JSON.stringify(s.data) === mergedJson && (getBranchCodeFromRow(s.data) ?? s.branchCode) === branchCode;
        } catch {
          return false;
        }
      });
      if (!alreadyExists) {
        state.savedSchemes.push(entry);
      }
    },

    // You can add reducers to set summaries/loading/error after API calls
    setSummaries: (state, action: PayloadAction<any[]>) => {
      state.summaries = action.payload;
    },
    setDepartmentSummaries: (state, action: PayloadAction<any[]>) => {
      state.departmentSummaries = action.payload;
    },
    setItemSummaries: (state, action: PayloadAction<any[]>) => {
      state.itemSummaries = action.payload;
    },
    setComparisonSummaries: (state, action: PayloadAction<any[]>) => {
      state.comparisonSummaries = action.payload;
    },
    setBranchSchemeSummaries: (state, action: PayloadAction<any[]>) => {
      state.branchSchemeSummaries = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    removeSavedSchemeByItemCode: (state, action: PayloadAction<string | { itemCode: string; branchCode?: string }>) => {
      const payload = action.payload;
      if (typeof payload === "string") {
        const itemCode = String(payload).trim().toLowerCase();
        // remove global entries (no branchCode) that match itemCode
        state.savedSchemes = state.savedSchemes.filter(
          (s) =>
            !(
              String(s.itemCode ?? "").trim().toLowerCase() === itemCode &&
              (s.branchCode === undefined || s.branchCode === null)
            )
        );
        return;
      }

      // object payload
      const itemCodeRaw = payload?.itemCode ?? "";
      const branchCodeRaw = payload?.branchCode;
      const itemCode = String(itemCodeRaw).trim().toLowerCase();

      if (branchCodeRaw !== undefined && branchCodeRaw !== null) {
        const branchCode = String(branchCodeRaw).trim().toLowerCase();
        // remove only the entry that matches both itemCode and branchCode
        state.savedSchemes = state.savedSchemes.filter(
          (s) =>
            !(
              String(s.itemCode ?? "").trim().toLowerCase() === itemCode &&
              String(s.branchCode ?? "").trim().toLowerCase() === branchCode
            )
        );
      } else {
        // no branchCode provided -> remove global entries for that itemCode (entries where branchCode is undefined/null)
        state.savedSchemes = state.savedSchemes.filter(
          (s) =>
            !(
              String(s.itemCode ?? "").trim().toLowerCase() === itemCode &&
              (s.branchCode === undefined || s.branchCode === null)
            )
        );
      }
    },

    clearSavedSchemes: (state) => {
      state.savedSchemes = [];
    },
  },
});

export const {
  setActiveTab,
  setTableHeight,
  saveScheme,
  saveOrUpdateScheme,
  setSummaries,
  setDepartmentSummaries,
  setItemSummaries,
  setComparisonSummaries,
  setBranchSchemeSummaries,
  setLoading,
  setError,
  removeSavedSchemeByItemCode,
  clearSavedSchemes,
} = phase3Slice.actions;

export default phase3Slice.reducer;
