// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { useLocation } from "react-router-dom";

// type SavedSummary = { label: string; values: string[] };

// const STORAGE_KEY_PREFIX = "phase3-filter-";

// /* ------------------------------------------------------------------
//    2. All other filters (stockBucket is handled specially)
//    ------------------------------------------------------------------ */
// const CONFIG: { key: string; label: string }[] = [
//   { key: "branches", label: "Branches" },
//   { key: "states", label: "States" },
//   { key: "saleBucket", label: "Sales Bucket" },
//   { key: "transitQty", label: "Transit Qty" },
//   { key: "localHbtClass", label: "Local HBT" },
//   { key: "globalHbtClass", label: "Global HBT" },
//   { key: "localimport", label: "Local Import" },
// ];

// /* ------------------------------------------------------------------
//    3. Helpers
//    ------------------------------------------------------------------ */
// const toLabel = (item: any): string | null => {
//   if (item == null) return null;
//   if (typeof item === "string" || typeof item === "number") return String(item);
//   if (typeof item === "object") {
//     if ("label" in item && item.label) return String(item.label);
//     if ("value" in item && item.value) return String(item.value);
//     try {
//       return JSON.stringify(item);
//     } catch {
//       return String(item);
//     }
//   }
//   return String(item);
// };

// const readPersisted = (key: string): any | null => {
//   try {
//     const raw = sessionStorage.getItem(STORAGE_KEY_PREFIX + key);
//     if (!raw) return null;
//     const parsed = JSON.parse(raw);
//     const empty =
//       parsed == null ||
//       (Array.isArray(parsed) && parsed.length === 0) ||
//       (typeof parsed === "object" &&
//         !Array.isArray(parsed) &&
//         Object.keys(parsed).length === 0) ||
//       (typeof parsed === "string" && parsed.trim() === "");
//     return empty ? null : parsed;
//   } catch {
//     return null;
//   }
// };

// /* ------------------------------------------------------------------
//    4. Main component
//    ------------------------------------------------------------------ */
// const ShowSavedFilters: React.FC = () => {
//   const location = useLocation();

//   /* --------------------------------------------------------------
//      4.1 enable / bucket from navigation state (safe!)
//      -------------------------------------------------------------- */
//   const { enable, bucket } = useMemo(() => {
//     const state = location?.state ?? {};
//     return { enable: state.enable ?? 0, bucket: state.bucket ?? null };
//   }, [location?.state]);

//   /* --------------------------------------------------------------
//      4.2 Build the summary – **re‑runs on every storage/custom event**
//      -------------------------------------------------------------- */
//   const buildSummary = useCallback((): SavedSummary[] => {
//     const out: SavedSummary[] = [];

//     // ---- normal persisted filters -------------------------------------------------
//     CONFIG.forEach(({ key, label }) => {
//       const val = readPersisted(key);
//       if (!val) return;
//       const arr = Array.isArray(val) ? val : [val];
//       const labels = arr.map(toLabel).filter(Boolean) as string[];
//       if (labels.length) out.push({ label, values: labels });
//     });

//     // ---- stockBucket – conditional ------------------------------------------------
//     let stockVals: string[] = [];

//     if (enable === 1 && bucket) {
//       stockVals = [String(bucket)];
//     } else {
//       const persisted = readPersisted("stockBucket");
//       if (persisted) {
//         const arr = Array.isArray(persisted) ? persisted : [persisted];
//         stockVals = arr.map(toLabel).filter(Boolean) as string[];
//       }
//       // if (!stockVals.length) {
//       //   stockVals = DEFAULT_STOCK_BUCKET.map((i) => i.label);
//       // }
//     }

//     if (stockVals.length)
//       out.push({ label: "Stock Bucket", values: stockVals });

//     return out;
//   }, [enable, bucket]);

//   const [summary, setSummary] = useState<SavedSummary[]>(buildSummary);

//   /* --------------------------------------------------------------
//      4.3 Force a re‑render when sessionStorage or custom event fires
//      -------------------------------------------------------------- */
//   const refresh = useCallback(() => {
//     setSummary(buildSummary());
//   }, [buildSummary]);

//   useEffect(() => {
//     // initial render
//     refresh();

//     const onStorage = (e: StorageEvent) => {
//       if (!e.key || e.key.startsWith(STORAGE_KEY_PREFIX)) refresh();
//     };
//     const onCustom = () => refresh();

//     window.addEventListener("storage", onStorage);
//     window.addEventListener(
//       "phase3-filters-updated",
//       onCustom as EventListener
//     );

//     return () => {
//       window.removeEventListener("storage", onStorage);
//       window.removeEventListener(
//         "phase3-filters-updated",
//         onCustom as EventListener
//       );
//     };
//   }, [refresh]);

//   /* --------------------------------------------------------------
//      4.4 Render
//      -------------------------------------------------------------- */
//   if (!summary.length) return null;

//   return (
//     <div className="mb-2">
//       {/* Header */}
//       <div className="d-flex align-items-center mb-1">
//         <h6 className="mb-0 fw-semibold text-muted">
//           <i className="bi bi-funnel me-2" style={{ opacity: 0.7 }}></i>
//           Active Filters
//         </h6>
//       </div>

//       {/* Chips */}
//       <div className="d-flex flex-wrap gap-2 align-items-center">
//         {summary.map((filter, i) => (
//           <div
//             key={i}
//             className="d-flex align-items-center flex-wrap gap-1 p-2 rounded-2 border"
//             style={{
//               fontSize: "0.825rem",
//               minWidth: "140px",
//               maxWidth: "100%",
//               backgroundColor: "#f8fafc",
//               border: "1px solid #e2e8f0",
//               boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
//             }}
//           >
//             <span
//               className="fw-bold text-nowrap"
//               style={{
//                 fontSize: "0.75rem",
//                 color: "#475569",
//                 marginRight: "6px",
//               }}
//               title={filter.label}
//             >
//               {filter.label}:
//             </span>
//             <div className="d-flex flex-wrap gap-1">
//               {filter.values.map((val, idx) => (
//                 <span
//                   key={idx}
//                   className="px-2 py-1 rounded-1 text-truncate d-inline-block"
//                   style={{
//                     fontSize: "0.75rem",
//                     fontWeight: 500,
//                     backgroundColor: "#dbeafe",
//                     color: "#1d4ed8",
//                     lineHeight: 1.2,
//                     maxWidth: "180px",
//                   }}
//                   title={val}
//                 >
//                   {val}
//                 </span>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ShowSavedFilters;

// ShowSavedFilters.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getActiveFiltersSummary, SavedSummary } from "./phase3ActiveFilters";

const ShowSavedFilters: React.FC = () => {
  const location = useLocation();

  // const { enable, bucket } = useMemo(() => {
  //   const state = location?.state ?? {};
  //   return { enable: state.enable ?? 0, bucket: state.bucket ?? null };
  // }, [location?.state]);

  const buildSummary = useCallback((): SavedSummary[] => {
    // pass location.state so stockBucket override is honored
    return getActiveFiltersSummary(location?.state);
  }, [location?.state]);

  const [summary, setSummary] = useState<SavedSummary[]>(buildSummary);

  const refresh = useCallback(() => {
    setSummary(buildSummary());
  }, [buildSummary]);

  useEffect(() => {
    // initial render
    refresh();

    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith("phase3-filter-")) refresh();
    };
    const onCustom = () => refresh();

    window.addEventListener("storage", onStorage);
    window.addEventListener(
      "phase3-filters-updated",
      onCustom as EventListener
    );

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(
        "phase3-filters-updated",
        onCustom as EventListener
      );
    };
  }, [refresh]);

  if (!summary.length) return null;

  return (
    <div className="mb-2">
      <div className="d-flex align-items-center mb-1">
        <h6 className="mb-0 fw-semibold text-muted">
          <i className="bi bi-funnel me-2" style={{ opacity: 0.7 }}></i>
          Active Filters
        </h6>
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-center">
        {summary.map((filter, i) => (
          <div
            key={i}
            className="d-flex align-items-center flex-wrap gap-1 p-2 rounded-2 border"
            style={{
              fontSize: "0.825rem",
              minWidth: "140px",
              maxWidth: "100%",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            }}
          >
            <span
              className="fw-bold text-nowrap"
              style={{
                fontSize: "0.75rem",
                color: "#475569",
                marginRight: "6px",
              }}
              title={filter.label}
            >
              {filter.label}:
            </span>
            <div className="d-flex flex-wrap gap-1">
              {filter.values.map((val, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-1 text-truncate d-inline-block"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    backgroundColor: "#dbeafe",
                    color: "#1d4ed8",
                    lineHeight: 1.2,
                    maxWidth: "180px",
                  }}
                  title={val}
                >
                  {val}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShowSavedFilters;
