// import { useEffect, useMemo, useCallback } from "react";
// import { useForm, useWatch } from "react-hook-form";
// import useBranchesApi from "../feature-modules/phase3/api";
// import { renderField } from "../common/utils/renderField";
// import { toCsv } from "../feature-modules/phase3/helperfunc";
// import p3Filter from "../core/json/phsae3Filter";

// interface FilterValues {
//   branches?: any;
//   states?: any;
//   stockBucket?: any;
//   saleBucket?: any;
//   transitQty?: any;
//   localHbtClass?: any;
//   globalHbtClass?: any;
//   localimport?: any;
//   [k: string]: any;
// }

// /* ------------------------------------------------------------------
//    Base defaults – SHOWN BY DEFAULT in badges
//    ------------------------------------------------------------------ */
// const BASE_DEFAULT_FILTERS: Partial<FilterValues> = {
//   branches: null,
//   states: null,
//   stockBucket: [
//     { value: "91-120 Days", label: "91-120 Days" },
//     { value: "121-150 Days", label: "121-150 Days" },
//     { value: "151-180 Days", label: "151-180 Days" },
//     { value: "181-360 Days", label: "181-360 Days" },
//     { value: "360+ Days", label: "360+ Days" },
//   ],
//   saleBucket: [{ value: "0 Qty", label: "0 Qty" }],
//   transitQty: [{ value: "0", label: "0" }],
//   localimport: null,
//   localHbtClass: null,
//   globalHbtClass: null,
// };

// /* ------------------------------------------------------------------
//    sessionStorage helpers – SKIP empty arrays
//    ------------------------------------------------------------------ */
// const STORAGE_KEY_PREFIX = "phase3-filter-";

// const loadPersisted = (field: keyof FilterValues) => {
//   try {
//     const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + field);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
//   } catch {
//     return null;
//   }
// };

// const savePersisted = (field: keyof FilterValues, value: any) => {
//   try {
//     const isEmpty =
//       value === null ||
//       value === undefined ||
//       (Array.isArray(value) && value.length === 0);
//     const key = STORAGE_KEY_PREFIX + field;
//     if (isEmpty) {
//       sessionStorage.removeItem(key);
//     } else {
//       sessionStorage.setItem(key, JSON.stringify(value));
//     }
//     // notify same-tab listeners to refresh UI
//     try {
//       window.dispatchEvent(new Event("phase3-filters-updated"));
//     } catch {
//       // ignore if dispatch fails in weird environments
//     }
//   } catch {
//     // ignore quota or parse errors
//   }
// };

// /* ------------------------------------------------------------------
//    Helper: get all persisted filters
//    ------------------------------------------------------------------ */
// export const getCurrentFilters = (): Partial<FilterValues> => {
//   const fields: (keyof FilterValues)[] = [
//     "branches",
//     "states",
//     "stockBucket",
//     "saleBucket",
//     "transitQty",
//     "localHbtClass",
//     "globalHbtClass",
//     "localimport",
//   ];
//   const filters: Partial<FilterValues> = {};

//   fields.forEach((field) => {
//     const stored = sessionStorage.getItem(STORAGE_KEY_PREFIX + field);
//     if (stored) {
//       try {
//         filters[field] = JSON.parse(stored);
//       } catch {
//         filters[field] = null;
//       }
//     } else {
//       filters[field] = null;
//     }
//   });
//   return filters;
// };

// /* ------------------------------------------------------------------
//    Main Hook – UPDATED TO PERSIST DEFAULTS ON FIRST LOAD
//    ------------------------------------------------------------------ */
// export const useReportFilters = (
//   extraDefaultValues: Partial<FilterValues> = {}
// ) => {
//   const { branches, states, fetchAll, dropdowns } = useBranchesApi();

//   /* --------------------------------------------------------------
//        1. Load persisted values + Initialize defaults if missing
//        -------------------------------------------------------------- */
//   const persistedDefaults = useMemo(() => {
//     const fields: (keyof FilterValues)[] = [
//       "branches",
//       "states",
//       "stockBucket",
//       "saleBucket",
//       "transitQty",
//       "localHbtClass",
//       "globalHbtClass",
//       "localimport",
//     ];
//     const defaults: Partial<FilterValues> = { ...BASE_DEFAULT_FILTERS };

//     fields.forEach((f) => {
//       const stored = loadPersisted(f);
//       if (stored !== null) {
//         defaults[f] = stored;
//       } else if (BASE_DEFAULT_FILTERS[f] != null) {
//         // Persist base default if nothing is stored
//         savePersisted(f, BASE_DEFAULT_FILTERS[f]);
//         defaults[f] = BASE_DEFAULT_FILTERS[f];
//       }
//     });

//     return defaults;
//   }, []);

//   /* --------------------------------------------------------------
//        2. Initialise form
//        -------------------------------------------------------------- */
//   const form = useForm<FilterValues>({
//     mode: "onBlur",
//     defaultValues: {
//       ...BASE_DEFAULT_FILTERS,
//       ...persistedDefaults,
//       ...extraDefaultValues,
//     },
//   });

//   /* --------------------------------------------------------------
//        3. Fetch dropdowns
//        -------------------------------------------------------------- */
//   useEffect(() => {
//     fetchAll();
//   }, [fetchAll]);

//   /* --------------------------------------------------------------
//        4. Sync form → sessionStorage (skip empty)
//        -------------------------------------------------------------- */
//   useEffect(() => {
//     const subscription = form.watch((value, { name }) => {
//       if (!name) return;
//       const field = name as keyof FilterValues;
//       const val = value[field];
//       savePersisted(field, val);
//     });
//     return () => subscription.unsubscribe();
//   }, [form]);

//   /* --------------------------------------------------------------
//        5. Watch all form values for live badge updates
//        -------------------------------------------------------------- */
//   const watchedValues =
//     (useWatch({ control: form.control }) as Partial<FilterValues>) || {};

//   /* --------------------------------------------------------------
//        6. Select options
//        -------------------------------------------------------------- */
//   const selectOptions = useMemo(
//     () => ({
//       branches,
//       states,
//       stockBucket: dropdowns.Stock_Bucket || [],
//       saleBucket: dropdowns.Sales_Bucket || [],
//       transitQty: dropdowns.Transit_Qty || [],
//       localHbtClass: dropdowns.Local_HBT || [],
//       globalHbtClass: dropdowns.Global_HBT || [],
//       localimport: dropdowns.Local_Import || [],
//     }),
//     [branches, states, dropdowns]
//   );

//   /* --------------------------------------------------------------
//        7. Render field wrapper
//        -------------------------------------------------------------- */
//   const renderFieldWrapper = useCallback(
//     (field: any, key: string) =>
//       renderField({
//         field,
//         form,
//         options: field.props?.name
//           ? selectOptions[field.props.name as keyof typeof selectOptions] || []
//           : [],
//         key,
//       }),
//     [form, selectOptions]
//   );

//   /* --------------------------------------------------------------
//        8. Payload builder
//        -------------------------------------------------------------- */
//   const buildPayload = useCallback(
//     (data: FilterValues) => ({
//       branchCode: toCsv(data.branches) || "",
//       state: toCsv(data.states) || "",
//       Local_HBT: toCsv(data.localHbtClass) || "",
//       Global_HBT: toCsv(data.globalHbtClass) || "",
//       Stock_Bucket: toCsv(data.stockBucket) || "",
//       Sales_Bucket: toCsv(data.saleBucket) || "",
//       Transit_Qty: toCsv(data.transitQty) || "",
//       Local_Import: toCsv(data.localimport) || "",
//       ...data,
//     }),
//     []
//   );

//   const onSubmit = useCallback(
//     (cb: (payload: any) => void) => (raw: FilterValues) => {
//       const payload = buildPayload(raw);
//       cb(payload);
//     },
//     [buildPayload]
//   );

//   /* --------------------------------------------------------------
//        9. Selected Filters Summary – LIVE + PERSISTED + DEFAULTS
//        -------------------------------------------------------------- */
//   const selectedFiltersSummary = useMemo(() => {
//     const summary: { label: string; values: string[] }[] = [];

//     const config = [
//       { key: "branches", label: "Branches", options: branches },
//       { key: "states", label: "States", options: states },
//       {
//         key: "stockBucket",
//         label: "Stock Bucket",
//         options: dropdowns.Stock_Bucket || [],
//       },
//       {
//         key: "saleBucket",
//         label: "Sales Bucket",
//         options: dropdowns.Sales_Bucket || [],
//       },
//       {
//         key: "transitQty",
//         label: "Transit Qty",
//         options: dropdowns.Transit_Qty || [],
//       },
//       {
//         key: "localHbtClass",
//         label: "Local HBT",
//         options: dropdowns.Local_HBT || [],
//       },
//       {
//         key: "globalHbtClass",
//         label: "Global HBT",
//         options: dropdowns.Global_HBT || [],
//       },
//       {
//         key: "localimport",
//         label: "Local Import",
//         options: dropdowns.Local_Import || [],
//       },
//     ];

//     const resolveLabel = (item: any, options: any[]) => {
//       if (item == null) return null;
//       if (typeof item === "string" || typeof item === "number") {
//         const s = String(item);
//         const opt = options.find(
//           (o: any) => String(o.value) === s || String(o.label) === s
//         );
//         return opt?.label ?? s;
//       }
//       if (typeof item === "object") {
//         if (item.label) return item.label;
//         if (item.value) {
//           const s = String(item.value);
//           const opt = options.find(
//             (o: any) => String(o.value) === s || String(o.label) === s
//           );
//           return opt?.label ?? s;
//         }
//         return String(item);
//       }
//       return String(item);
//     };

//     config.forEach(({ key, label, options }) => {
//       const rawSelected = (watchedValues as any)?.[key];

//       // Prefer live watched value; if empty array/null/undefined, fall back to persisted defaults or base defaults
//       let selected = rawSelected;
//       if (
//         (selected === null ||
//           selected === undefined ||
//           (Array.isArray(selected) && selected.length === 0)) &&
//         (persistedDefaults as any)?.[key]
//       ) {
//         selected = (persistedDefaults as any)[key];
//       }
//       if (
//         (selected === null ||
//           selected === undefined ||
//           (Array.isArray(selected) && selected.length === 0)) &&
//         (BASE_DEFAULT_FILTERS as any)?.[key]
//       ) {
//         selected = (BASE_DEFAULT_FILTERS as any)[key];
//       }

//       if (!selected || (Array.isArray(selected) && selected.length === 0))
//         return;

//       const labels = Array.isArray(selected)
//         ? selected.map((v: any) => resolveLabel(v, options)).filter(Boolean)
//         : [resolveLabel(selected, options)].filter(Boolean);

//       if (labels.length > 0) {
//         summary.push({ label, values: labels });
//       }
//     });

//     return summary;
//   }, [watchedValues, branches, states, dropdowns, persistedDefaults]);

//   /* --------------------------------------------------------------
//        10. Clear All Filters – Reset to defaults & re-persist
//        -------------------------------------------------------------- */
//   const clearAllFilters = useCallback(() => {
//     // Reset form to base defaults
//     form.reset(BASE_DEFAULT_FILTERS);

//     // Clear sessionStorage first
//     Object.keys(BASE_DEFAULT_FILTERS).forEach((field) =>
//       sessionStorage.removeItem(STORAGE_KEY_PREFIX + field)
//     );

//     // Re-persist base defaults so they survive refresh
//     Object.entries(BASE_DEFAULT_FILTERS).forEach(([k, v]) => {
//       const key = k as keyof FilterValues;
//       if (v != null && !(Array.isArray(v) && v.length === 0)) {
//         savePersisted(key, v);
//       }
//     });

//     window.dispatchEvent(new Event("phase3-filters-updated"));
//   }, [form]);

//   /* --------------------------------------------------------------
//        11. Return
//        -------------------------------------------------------------- */
//   return {
//     form,
//     selectOptions,
//     renderFieldWrapper,
//     onSubmit,
//     selectedFiltersSummary,
//     clearAllFilters,
//     ReportFilterRowProps: {
//       properties: p3Filter.properties,
//       renderField: renderFieldWrapper,
//     },
//   } as const;
// };

// export default useReportFilters;

import { useEffect, useMemo, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import useBranchesApi from "../feature-modules/phase3/api";
import { renderField } from "../common/utils/renderField";
import { toCsv } from "../feature-modules/phase3/helperfunc";
import p3Filter from "../core/json/phsae3Filter";

interface FilterValues {
  branches?: any;
  states?: any;
  stockBucket?: any;
  saleBucket?: any;
  transitQty?: any;
  localHbtClass?: any;
  globalHbtClass?: any;
  localimport?: any;
  [k: string]: any;
}

/* ------------------------------------------------------------------
   Base defaults – SHOWN BY DEFAULT in badges
   ------------------------------------------------------------------ */
const BASE_DEFAULT_FILTERS: Partial<FilterValues> = {
  branches: null,
  states: null,

  // Canonical order *you originally showed* (kept as base defaults)
  stockBucket: [
    { value: "91-120 Days", label: "91-120 Days" },
    { value: "121-150 Days", label: "121-150 Days" },
    { value: "151-180 Days", label: "151-180 Days" },
    { value: "181-360 Days", label: "181-360 Days" },
    { value: "360+ Days", label: "360+ Days" },
  ],

  saleBucket: [{ value: "0 Qty", label: "0 Qty" }],
  transitQty: [{ value: "0", label: "0" }],
  localimport: null,
  localHbtClass: null,
  globalHbtClass: null,
};

/* ------------------------------------------------------------------
   sessionStorage helpers – SKIP empty arrays
   ------------------------------------------------------------------ */
const STORAGE_KEY_PREFIX = "phase3-filter-";

const loadPersisted = (field: keyof FilterValues) => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + field);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
};

const savePersisted = (field: keyof FilterValues, value: any) => {
  try {
    const isEmpty =
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0);
    const key = STORAGE_KEY_PREFIX + field;

    if (isEmpty) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }

    try {
      window.dispatchEvent(new Event("phase3-filters-updated"));
    } catch {}
  } catch {}
};

/* ------------------------------------------------------------------
   Helper to parse numeric lower-bound from a range-like string.
   Examples:
     "0-15 Days"   -> 0
     "16-30"       -> 16
     "360+ Days"   -> 360
     "91 - 120"    -> 91
   Returns NaN if not parseable.
   ------------------------------------------------------------------ */
const parseRangeLower = (input: string): number => {
  if (!input || typeof input !== "string") return NaN;
  const s = input.trim();

  // match "123-456" or "123 - 456" (capture left number)
  const dashMatch = s.match(/^(\d+)\s*-\s*\d+/);
  if (dashMatch) return Number(dashMatch[1]);

  // match "123+" (e.g., "360+ Days")
  const plusMatch = s.match(/^(\d+)\s*\+/);
  if (plusMatch) return Number(plusMatch[1]);

  // match single number like "0" or "15"
  const numMatch = s.match(/^(\d+)$/);
  if (numMatch) return Number(numMatch[1]);

  return NaN;
};

/* ------------------------------------------------------------------
   ORDER SELECTED ITEMS BASED ON OPTIONS ARRAY
   - If options look like numeric ranges (0-15, 16-30, 360+), items
     are ordered by the numeric lower bound ascending.
   - If numeric parse fails for options, fallback to options array order.
   - Unknown/extra selected items (not present in options) are appended
     after known items preserving their relative selection order.
   ------------------------------------------------------------------ */
const orderByOptions = (selected: any[], options: any[]) => {
  if (!Array.isArray(selected) || !Array.isArray(options)) return selected;

  // Build maps: key -> option index, key -> numeric lower bound (if parseable)
  const indexMap = new Map<string, number>();
  const lowerMap = new Map<string, number>(); // may contain NaN

  options.forEach((o: any, idx: number) => {
    const raw = o?.value ?? o?.label ?? o;
    const key = String(raw);
    indexMap.set(key, idx);

    const parsed = parseRangeLower(String(raw));
    if (!Number.isNaN(parsed)) lowerMap.set(key, parsed);
  });

  // Partition selected into known (present in options) and unknown
  const known: any[] = [];
  const unknown: any[] = [];
  selected.forEach((item) => {
    const raw = item?.value ?? item?.label ?? item;
    const key = String(raw);
    if (indexMap.has(key)) known.push(item);
    else unknown.push(item);
  });

  // Determine whether numeric ordering is applicable:
  // if at least one known option has a parsed numeric lower bound,
  // we'll sort known items by numeric lower bound (NaN treated as +Infinity),
  // otherwise we fallback to ordering by options index.
  const anyNumeric = Array.from(lowerMap.values()).some(
    (v) => !Number.isNaN(v)
  );

  if (anyNumeric) {
    known.sort((a, b) => {
      const ka = String(a?.value ?? a?.label ?? a);
      const kb = String(b?.value ?? b?.label ?? b);
      const la = lowerMap.has(ka)
        ? lowerMap.get(ka)!
        : Number.POSITIVE_INFINITY;
      const lb = lowerMap.has(kb)
        ? lowerMap.get(kb)!
        : Number.POSITIVE_INFINITY;
      if (la !== lb) return la - lb;
      // tie-breaker: use option index if available, else stable relative order
      return (indexMap.get(ka) ?? 0) - (indexMap.get(kb) ?? 0);
    });
  } else {
    // Fallback: preserve canonical option order
    known.sort((a, b) => {
      const ka = String(a?.value ?? a?.label ?? a);
      const kb = String(b?.value ?? b?.label ?? b);
      return (indexMap.get(ka) ?? 0) - (indexMap.get(kb) ?? 0);
    });
  }

  return [...known, ...unknown];
};

/* ------------------------------------------------------------------
   Helper: get all persisted filters
   ------------------------------------------------------------------ */
export const getCurrentFilters = (): Partial<FilterValues> => {
  const fields: (keyof FilterValues)[] = [
    "branches",
    "states",
    "stockBucket",
    "saleBucket",
    "transitQty",
    "localHbtClass",
    "globalHbtClass",
    "localimport",
  ];

  const filters: Partial<FilterValues> = {};

  fields.forEach((field) => {
    const stored = sessionStorage.getItem(STORAGE_KEY_PREFIX + field);
    if (stored) {
      try {
        filters[field] = JSON.parse(stored);
      } catch {
        filters[field] = null;
      }
    } else {
      filters[field] = null;
    }
  });
  return filters;
};

/* ------------------------------------------------------------------
   Main Hook – UPDATED TO PERSIST DEFAULTS ON FIRST LOAD
   ------------------------------------------------------------------ */
export const useReportFilters = (
  extraDefaultValues: Partial<FilterValues> = {}
) => {
  const { branches, states, fetchAll, dropdowns } = useBranchesApi();

  /* --------------------------------------------------------------
       1. Load persisted values + Initialize defaults if missing
       -------------------------------------------------------------- */
  const persistedDefaults = useMemo(() => {
    const fields: (keyof FilterValues)[] = [
      "branches",
      "states",
      "stockBucket",
      "saleBucket",
      "transitQty",
      "localHbtClass",
      "globalHbtClass",
      "localimport",
    ];

    const defaults: Partial<FilterValues> = { ...BASE_DEFAULT_FILTERS };

    fields.forEach((f) => {
      const stored = loadPersisted(f);

      if (stored !== null) {
        defaults[f] = stored;
      } else if (BASE_DEFAULT_FILTERS[f] != null) {
        savePersisted(f, BASE_DEFAULT_FILTERS[f]);
        defaults[f] = BASE_DEFAULT_FILTERS[f];
      }
    });

    return defaults;
  }, []);

  /* --------------------------------------------------------------
       2. Initialise form
       -------------------------------------------------------------- */
  const form = useForm<FilterValues>({
    mode: "onBlur",
    defaultValues: {
      ...BASE_DEFAULT_FILTERS,
      ...persistedDefaults,
      ...extraDefaultValues,
    },
  });

  /* --------------------------------------------------------------
       3. Fetch dropdowns
       -------------------------------------------------------------- */
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /* --------------------------------------------------------------
       4. Dropdown options - memoized
       -------------------------------------------------------------- */
  // const selectOptions = useMemo(
  //   () => ({
  //     branches,
  //     states,
  //     stockBucket: dropdowns.Stock_Bucket || [],
  //     saleBucket: dropdowns.Sales_Bucket || [],
  //     transitQty: dropdowns.Transit_Qty || [],
  //     localHbtClass: dropdowns.Local_HBT || [],
  //     globalHbtClass: dropdowns.Global_HBT || [],
  //     localimport: dropdowns.Local_Import || [],
  //   }),
  //   [branches, states, dropdowns]
  // );
  const selectOptions = useMemo(
    () => ({
      branches,
      states,
      stockBucket: orderByOptions(
        dropdowns.Stock_Bucket || [],
        dropdowns.Stock_Bucket || []
      ),
      saleBucket: orderByOptions(
        dropdowns.Sales_Bucket || [],
        dropdowns.Sales_Bucket || []
      ),
      transitQty: orderByOptions(
        dropdowns.Transit_Qty || [],
        dropdowns.Transit_Qty || []
      ),
      localHbtClass: dropdowns.Local_HBT || [],
      globalHbtClass: dropdowns.Global_HBT || [],
      localimport: dropdowns.Local_Import || [],
    }),
    [branches, states, dropdowns]
  );

  /* --------------------------------------------------------------
       5. Sync form → sessionStorage WITH PROPER ORDERING
       -------------------------------------------------------------- */
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (!name) return;

      const field = name as keyof FilterValues;
      let val = value[field];

      // sort array fields based on parsed numeric order or canonical options order
      if (Array.isArray(val)) {
        const opts =
          (selectOptions as any)[field as keyof typeof selectOptions] || [];
        val = orderByOptions(val, opts);
      }

      savePersisted(field, val);
    });

    return () => subscription.unsubscribe();
  }, [form, selectOptions]);

  /* --------------------------------------------------------------
       6. Watch all values for live badge updates
       -------------------------------------------------------------- */
  const watchedValues =
    (useWatch({ control: form.control }) as Partial<FilterValues>) || {};

  /* --------------------------------------------------------------
       7. Render field wrapper
       -------------------------------------------------------------- */
  const renderFieldWrapper = useCallback(
    (field: any, key: string) =>
      renderField({
        field,
        form,
        options: field.props?.name
          ? selectOptions[field.props.name as keyof typeof selectOptions] || []
          : [],
        key,
      }),
    [form, selectOptions]
  );

  /* --------------------------------------------------------------
       8. Payload builder (ensure stockBucket follows numeric order)
       -------------------------------------------------------------- */
  const buildPayload = useCallback(
    (data: FilterValues) => ({
      branchCode: toCsv(data.branches) || "",
      state: toCsv(data.states) || "",
      Local_HBT: toCsv(data.localHbtClass) || "",
      Global_HBT: toCsv(data.globalHbtClass) || "",
      Stock_Bucket: toCsv(
        orderByOptions(data.stockBucket || [], selectOptions.stockBucket)
      ),
      Sales_Bucket: toCsv(data.saleBucket) || "",
      Transit_Qty: toCsv(data.transitQty) || "",
      Local_Import: toCsv(data.localimport) || "",
      ...data,
    }),
    [selectOptions.stockBucket]
  );

  const onSubmit = useCallback(
    (cb: (payload: any) => void) => (raw: FilterValues) => {
      const payload = buildPayload(raw);
      cb(payload);
    },
    [buildPayload]
  );

  /* --------------------------------------------------------------
       9. Selected Filters Summary – SORTED BY NUMERIC RANGE WHEN POSSIBLE
       -------------------------------------------------------------- */
  const selectedFiltersSummary = useMemo(() => {
    const summary: { label: string; values: string[] }[] = [];

    const config = [
      { key: "branches", label: "Branches", options: branches },
      { key: "states", label: "States", options: states },
      {
        key: "stockBucket",
        label: "Stock Bucket",
        options: dropdowns.Stock_Bucket || [],
      },
      {
        key: "saleBucket",
        label: "Sales Bucket",
        options: dropdowns.Sales_Bucket || [],
      },
      {
        key: "transitQty",
        label: "Transit Qty",
        options: dropdowns.Transit_Qty || [],
      },
      {
        key: "localHbtClass",
        label: "Local HBT",
        options: dropdowns.Local_HBT || [],
      },
      {
        key: "globalHbtClass",
        label: "Global HBT",
        options: dropdowns.Global_HBT || [],
      },
      {
        key: "localimport",
        label: "Local Import",
        options: dropdowns.Local_Import || [],
      },
    ];

    const resolveLabel = (item: any, options: any[]) => {
      if (item == null) return null;
      if (typeof item === "string" || typeof item === "number") {
        const s = String(item);
        const opt = options.find(
          (o: any) => String(o.value) === s || String(o.label) === s
        );
        return opt?.label ?? s;
      }
      if (typeof item === "object") {
        if (item.label) return item.label;
        if (item.value) {
          const s = String(item.value);
          const opt = options.find(
            (o: any) => String(o.value) === s || String(o.label) === s
          );
          return opt?.label ?? s;
        }
        return String(item);
      }
      return String(item);
    };

    config.forEach(({ key, label, options }) => {
      // prefer live watched value, fallback to persisted defaults or base defaults
      let selected = (watchedValues as any)?.[key];

      if (
        (selected === null ||
          selected === undefined ||
          (Array.isArray(selected) && selected.length === 0)) &&
        (persistedDefaults as any)?.[key]
      ) {
        selected = (persistedDefaults as any)[key];
      }
      if (
        (selected === null ||
          selected === undefined ||
          (Array.isArray(selected) && selected.length === 0)) &&
        (BASE_DEFAULT_FILTERS as any)?.[key]
      ) {
        selected = (BASE_DEFAULT_FILTERS as any)[key];
      }

      if (!selected || (Array.isArray(selected) && selected.length === 0))
        return;

      // If array, reorder by numeric range lower bound (when possible)
      if (Array.isArray(selected)) {
        selected = orderByOptions(selected, options);
      }

      const labels = Array.isArray(selected)
        ? selected.map((v: any) => resolveLabel(v, options)).filter(Boolean)
        : [resolveLabel(selected, options)].filter(Boolean);

      if (labels.length > 0) {
        summary.push({ label, values: labels });
      }
    });

    return summary;
  }, [watchedValues, branches, states, dropdowns, persistedDefaults]);

  /* --------------------------------------------------------------
       10. Clear All Filters – Reset to defaults & re-persist
       -------------------------------------------------------------- */
  const clearAllFilters = useCallback(() => {
    form.reset(BASE_DEFAULT_FILTERS);

    Object.keys(BASE_DEFAULT_FILTERS).forEach((field) =>
      sessionStorage.removeItem(STORAGE_KEY_PREFIX + field)
    );

    Object.entries(BASE_DEFAULT_FILTERS).forEach(([k, v]) => {
      const key = k as keyof FilterValues;
      if (v != null && !(Array.isArray(v) && v.length === 0)) {
        savePersisted(key, v);
      }
    });

    window.dispatchEvent(new Event("phase3-filters-updated"));
  }, [form]);

  /* --------------------------------------------------------------
       11. Return
       -------------------------------------------------------------- */
  return {
    form,
    selectOptions,
    renderFieldWrapper,
    onSubmit,
    selectedFiltersSummary,
    clearAllFilters,
    ReportFilterRowProps: {
      properties: p3Filter.properties,
      renderField: renderFieldWrapper,
    },
  } as const;
};

export default useReportFilters;
