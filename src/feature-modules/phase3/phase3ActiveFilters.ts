/* Shared config used by ShowSavedFilters and other components */
const STORAGE_KEY_PREFIX = "phase3-filter-";

export type SavedSummary = { label: string; values: string[] };

const CONFIG: { key: string; label: string }[] = [
  { key: "branches", label: "Branches" },
  { key: "states", label: "States" },
  { key: "saleBucket", label: "Sales Bucket" },
  { key: "transitQty", label: "Transit Qty" },
  { key: "localHbtClass", label: "Local HBT" },
  { key: "globalHbtClass", label: "Global HBT" },
  { key: "localimport", label: "Local Import" }
];

// Mapping UI keys → backend keys
const BACKEND_KEY_MAP: Record<string, string> = {
  stockBucket: "Stock_Bucket",
  saleBucket: "Sales_Bucket",
  transitQty: "Transit_Qty",
  branches: "Branches",
  states: "States",
  localHbtClass: "Local_HBT",
  globalHbtClass: "Global_HBT",
  localimport: "Local_Import"
};

const toLabel = (item: any): string | null => {
  if (item == null) return null;
  if (typeof item === "string" || typeof item === "number") return String(item);
  if (typeof item === "object") {
    if ("label" in item && item.label) return String(item.label);
    if ("value" in item && item.value) return String(item.value);
    try {
      return JSON.stringify(item);
    } catch {
      return String(item);
    }
  }
  return String(item);
};

export const readPersisted = (key: string): any | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const empty =
      parsed == null ||
      (Array.isArray(parsed) && parsed.length === 0) ||
      (typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        Object.keys(parsed).length === 0) ||
      (typeof parsed === "string" && parsed.trim() === "");
    return empty ? null : parsed;
  } catch {
    return null;
  }
};

/* -------------------------------------------------------
   BUILD HUMAN-FACING SUMMARY (NO CHANGE)
------------------------------------------------------- */
export const getActiveFiltersSummary = (
  locationState?: any
): SavedSummary[] => {
  const state = locationState ?? {};
  const enable = state.enable ?? 0;
  const bucket = state.bucket ?? null;

  const out: SavedSummary[] = [];

  CONFIG.forEach(({ key, label }) => {
    const val = readPersisted(key);
    if (!val) return;
    const arr = Array.isArray(val) ? val : [val];
    const labels = arr.map(toLabel).filter(Boolean) as string[];
    if (labels.length) out.push({ label, values: labels });
  });

  // stock bucket
  let stockVals: string[] = [];
  if (enable === 1 && bucket) {
    stockVals = [String(bucket)];
  } else {
    const persisted = readPersisted("stockBucket");
    if (persisted) {
      const arr = Array.isArray(persisted) ? persisted : [persisted];
      stockVals = arr.map(toLabel).filter(Boolean) as string[];
    }
  }
  if (stockVals.length) out.push({ label: "Stock Bucket", values: stockVals });

  return out;
};

/* -------------------------------------------------------
   🔥 MAIN FUNCTION FOR BACKEND PAYLOAD
   Returns backend-friendly filters:
   { Stock_Bucket: "...", Sales_Bucket:"...", Transit_Qty:"..." }
------------------------------------------------------- */

export const getActiveFiltersRaw = (locationState?: any): any => {
  const state = locationState ?? {};
  const enable = state.enable ?? 0;
  const bucket = state.bucket ?? null;

  const raw: Record<string, any> = {};

  // read all persisted filter keys first
  CONFIG.forEach(({ key }) => {
    const val = readPersisted(key);
    if (val != null) raw[key] = val;
  });

  // handle stock bucket override
  if (enable === 1 && bucket != null) {
    raw.stockBucket = bucket;
    raw._meta = { stockBucketOverriddenByNav: true, navBucket: bucket };
  } else {
    const persisted = readPersisted("stockBucket");
    if (persisted != null) raw.stockBucket = persisted;
    raw._meta = { stockBucketOverriddenByNav: false };
  }

  /* -------------------------
     Convert raw → backend payload
  -------------------------- */

  const backendPayload: Record<string, string> = {};

  const toScalar = (v: any): string => {
    if (v == null) return "";
    if (typeof v === "string" || typeof v === "number") return String(v).trim();
    if (typeof v === "object") {
      if ("value" in v && v.value != null) return String(v.value).trim();
      if ("label" in v && v.label != null) return String(v.label).trim();
      return JSON.stringify(v);
    }
    return String(v);
  };

  for (const [uiKey, backendKey] of Object.entries(BACKEND_KEY_MAP)) {
    if (!(uiKey in raw)) continue;

    const val = raw[uiKey];

    let arr: string[] = [];

    if (Array.isArray(val)) {
      arr = val.map(toScalar).filter(Boolean);
    } else {
      arr = [toScalar(val)].filter(Boolean);
    }

    // remove duplicates
    const unique = [...new Set(arr)];

    if (unique.length > 0) {
      backendPayload[backendKey] = unique.join(",");
    }
  }

  return backendPayload;
};
