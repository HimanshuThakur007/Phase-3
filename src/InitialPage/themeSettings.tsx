import React, { useCallback, useEffect, useState } from "react";
import { Settings, ChevronDown, ChevronUp } from "react-feather";
import { useDispatch } from "react-redux";
import { Link, useLocation, useParams } from "react-router-dom";
import ImageWithBasePath from "../common/component/ImageWithBasePath";
import useFetch from "../hooks/useFetch";
import { useReportFilters } from "../hooks/useReportFilters";
import { toCsv } from "../feature-modules/phase3/helperfunc";
import { ReportFilterRow } from "../feature-modules/phase3/ReportFilterRow";
import {
  setBranchSchemeSummaries,
  setComparisonSummaries,
  setDepartmentSummaries,
  setError,
  setItemSummaries,
  setLoading,
  setSummaries,
} from "../redux/phase3Slice";
import {
  fetchFailure,
  fetchStart,
  fetchSuccess,
  clearData,
} from "../redux/reportDetailSlice";
import { useDebouncedCallback } from "use-debounce";
// import { RootState } from "../redux/store";
// import { useSelector } from "react-redux";
import { fetchDashboardData } from "../redux/dashboardSlice";

// Define layout and theme types
type ThemeMode = "light_mode" | "dark_mode";
type LayoutStyle = "default" | "box" | "collapsed" | "horizontal" | "modern";
type NavColor = "light" | "grey" | "dark";

const ThemeSettings: React.FC = () => {
  const dispatch: any = useDispatch();
  const callFetch = useFetch();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<boolean>(false);

  // === SINGLE COLLAPSE STATE: Only one section open at a time ===
  const [openSection, setOpenSection] = useState<"filters" | "theme" | null>(
    null
  );
  // const summaries = useSelector((s: RootState) => s.phase3.summaries);
  // const departmentSummaries = useSelector((s: RootState) => s.phase3.departmentSummaries);
  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("openThemeSection") as
      | "filters"
      | "theme"
      | null;
    setOpenSection(saved ?? "filters"); // Default: filters open
  }, []);

  // Save to localStorage whenever it changes
  useEffect(() => {
    if (openSection) {
      localStorage.setItem("openThemeSection", openSection);
    } else {
      localStorage.removeItem("openThemeSection");
    }
  }, [openSection]);

  // Toggle function: Ensures only one section is open
  const toggleSection = (section: "filters" | "theme") => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  // Theme state
  const getInitialTheme = (): ThemeMode => {
    const storedTheme = localStorage.getItem("colorschema") as ThemeMode;
    if (storedTheme) return storedTheme;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    return prefersDark ? "dark_mode" : "light_mode";
  };

  const [layoutColor, setLayoutColor] = useState<ThemeMode>(getInitialTheme());
  const [layoutView, setLayoutView] = useState<LayoutStyle>(
    (localStorage.getItem("layoutStyling") as LayoutStyle) || "default"
  );
  const [layoutTheme, setLayoutTheme] = useState<NavColor>(
    (localStorage.getItem("layoutThemeColors") as NavColor) || "light"
  );

  const pathname = location.pathname;
  const basePath = pathname.split("/")[1] || "";
  const selectedDepartment = (location.state as any)?.department ?? "";
  const selectedBranch = (location.state as any)?.branchCode ?? "";
  const itemCode = (location.state as any)?.itemCode ?? "";
  const { enable, bucket } = location?.state ?? {};
  console.log("searching loc", enable, bucket);
  // const dep_Item = location.state
  // console.log("dep_Item", dep_Item)

  // Report Filters Hook
  const {
    form,
    onSubmit: onFilterSubmit,
    ReportFilterRowProps,
  } = useReportFilters();

  // Build full payload
  const buildPayload = useCallback(() => {
    const values = form.getValues();

    const basePayload = {
      branchCode: toCsv(values.branches) || "",
      state: toCsv(values.states) || "",
      Local_HBT: toCsv(values.localHbtClass) || "",
      Global_HBT: toCsv(values.globalHbtClass) || "",
      Stock_Bucket: enable === 1 ? bucket : toCsv(values.stockBucket) || "",
      Sales_Bucket: toCsv(values.saleBucket) || "",
      Transit_Qty: toCsv(values.transitQty) || "",
      Local_Import: toCsv(values.localimport) || "",
    };
    console.log("basePayload", basePayload);

    if (basePath === "dynamictable" && id) {
      return {
        ...basePayload,
        department: selectedDepartment || "",
        branchCode: selectedBranch || basePayload.branchCode,
        itemCode: itemCode || "",
      };
    }

    return basePayload;
  }, [form, basePath, id, selectedDepartment, selectedBranch, itemCode]);

  const fetchData = useCallback(
    async (payload: any) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Reset all data
      dispatch(setSummaries([]));
      dispatch(setDepartmentSummaries([]));
      dispatch(setItemSummaries([]));
      dispatch(setComparisonSummaries([]));
      dispatch(setBranchSchemeSummaries([]));

      try {
        // Run all 5 API calls in parallel
        const [
          branchRes,
          deptRes,
          itemRes,
          comparisonRes,
          branchSchemeRes, // New API
        ] = await Promise.all([
          callFetch<{ status: string; summaries?: any[] }>(
            "hbt-summary",
            "POST",
            payload
          ).catch(() => ({ got: null })),
          callFetch<any>("hbt-summary-department", "POST", payload).catch(
            () => ({ got: null })
          ),
          callFetch<any>("hbt-summary-item", "POST", payload).catch(() => ({
            got: null,
          })),
          callFetch<any>("hbt-summary-item-schemes", "POST", payload).catch(
            () => ({ got: null })
          ),
          callFetch<any>("hbt-summary-branch-schemes", "POST", payload).catch(
            () => ({ got: null })
          ),
        ]);

        // 1. Branch Summary
        const branches =
          branchRes.got?.status === "ok" ? branchRes.got.summaries || [] : [];
        dispatch(setSummaries(branches));

        // 2. Department Summary
        const deptData = deptRes.got;
        const deptArr = Array.isArray(deptData)
          ? deptData
          : deptData?.departments ??
            deptData?.department_summaries ??
            (deptData?.status === "ok"
              ? deptData.summaries || deptData.data || []
              : []);
        dispatch(setDepartmentSummaries(deptArr));

        // 3. Item Summary (old)
        const itemData = itemRes.got;
        const itemArr = Array.isArray(itemData)
          ? itemData
          : itemData?.status === "ok"
          ? itemData.summaries || []
          : [];
        dispatch(setItemSummaries(itemArr));

        // 4. Item + Scheme Summary
        const comparisonData = comparisonRes.got;
        if (
          comparisonData?.status === "ok" &&
          Array.isArray(comparisonData.summaries)
        ) {
          dispatch(setComparisonSummaries(comparisonData.summaries));
        } else if (comparisonData?.status === "ok" && comparisonData.data) {
          const arr = Array.isArray(comparisonData.data)
            ? comparisonData.data
            : [];
          dispatch(setComparisonSummaries(arr));
        } else {
          dispatch(setComparisonSummaries([]));
        }

        // 5. NEW: Branch + Scheme Summary (hbt-summary-branch-schemes)
        const branchSchemeData = branchSchemeRes.got;
        if (branchSchemeData?.status === "ok") {
          const summaries = Array.isArray(branchSchemeData.summaries)
            ? branchSchemeData.summaries
            : branchSchemeData.data && Array.isArray(branchSchemeData.data)
            ? branchSchemeData.data
            : [];
          dispatch(setBranchSchemeSummaries(summaries));
        } else {
          dispatch(setBranchSchemeSummaries([]));
        }
      } catch (e: any) {
        const msg = e?.message || "Failed to load data";
        dispatch(setError(msg));
        console.error("fetchData error:", msg, e);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [callFetch, dispatch]
  );
  // Fetch detail data

  // const fetchDetail = useCallback(
  //   async (payload: any) => {
  //     dispatch(clearData());
  //     dispatch(fetchStart());
  //     console.log("Functions running");
  //     try {
  //       const { got } = await callFetch<any>("get-hbtsync-data", "POST", {
  //         branchCode: selectedBranch || payload.branchCode || "",
  //         department: selectedDepartment || payload.department || "",
  //         itemCode: itemCode || payload.itemCode || "",
  //         ...payload,
  //       });

  //       let processed: any[] = [];

  //       // Helper: safely parse numeric-like strings to numbers, otherwise return null
  //       const safeNumber = (v: any) => {
  //         if (v === null || v === undefined || v === "") return null;
  //         if (typeof v === "number") return Number.isFinite(v) ? v : null;
  //         const s = String(v).replace(/,/g, "").trim();
  //         if (s === "") return null;
  //         const n = Number(s);
  //         return Number.isFinite(n) ? n : null;
  //       };

  //       // Canonical mapping: for each canonical key list possible source keys (ordered)
  //       const FIELD_MAP: Record<string, string[]> = {
  //         // branch-level
  //         Branch_Code: [
  //           "Branch_Code",
  //           "branchCode",
  //           "branch_code",
  //           "Branch Code",
  //         ],
  //         Branch_Name: [
  //           "Branch_Name",
  //           "branchName",
  //           "branch_name",
  //           "Branch Name",
  //         ],
  //         Item_Code: ["Item_Code", "item_code", "Item Code", "itemCode"],
  //         Item_Name: [
  //           "Item_Name",
  //           "item_name",
  //           "ItemName",
  //           "itemName",
  //           "itemname",
  //         ],
  //         category: [
  //           "category",
  //           "Category",
  //           "item_category",
  //           "item_cat",
  //           "cat",
  //         ],
  //         subcategory: [
  //           "subcategory",
  //           "sub_category",
  //           "SubCategory",
  //           "subcat",
  //           "sub_category_name",
  //         ],
  //         description: [
  //           "description",
  //           "item_desc",
  //           "item_description",
  //           "Item_Desc",
  //           "desc",
  //         ],
  //         Department: [
  //           "Department",
  //           "department",
  //           "item_department",
  //           "Item Department",
  //         ],
  //         item_sub_category: [
  //           "item_sub_category",
  //           "sub_category",
  //           "subCategory",
  //           "Item_Sub_Category",
  //           "itemSubCategory",
  //         ],
  //         item_status: [
  //           "item_status",
  //           "status",
  //           "Item_Status",
  //           "ItemStatus",
  //           "active_inactive",
  //           "is_active",
  //         ],
  //         exp_imp_sur: ["exp_imp_sur", "expImpSur", "exp_imp", "exp_imp_surr"],

  //         // numeric-ish
  //         Site_Qtys: [
  //           "Site_Qtys",
  //           "site_qty",
  //           "site_qtys",
  //           "Site_Qtys",
  //           "total_site_qty",
  //         ],
  //         Total_Sale_Qty: [
  //           "Total_Sale_Qty",
  //           "total_sale_qty",
  //           "TotalSaleQty",
  //           "Total Sale Qty",
  //         ],
  //         Total_Sale_Val: [
  //           "Total_Sale_Val",
  //           "total_sale_val",
  //           "TotalSaleVal",
  //           "Total Sale Val",
  //         ],
  //         Local_HBT_Class: [
  //           "Local_HBT_Class",
  //           "local_hbt_class",
  //           "Local HBT Class",
  //         ],
  //         Global_HBT_Class: [
  //           "Global_HBT_Class",
  //           "global_hbt_class",
  //           "Global HBT Class",
  //         ],
  //         Stock_Remarks: ["Stock_Remarks", "stock_remarks", "Stock Remarks"],
  //         Stock_Days_Diff: [
  //           "Stock_Days_Diff",
  //           "stock_days_diff",
  //           "Stock Days Diff",
  //         ],
  //         Stock_Bucket: ["Stock_Bucket", "stock_bucket", "Stock Bucket"],
  //         Sales_Bucket: ["Sales_Bucket", "sales_bucket", "Sales Bucket"],
  //         Str_Stk_Sp_Value: [
  //           "Str_Stk_Sp_Value",
  //           "str_stk_sp_value",
  //           "Str Stk Sp Value",
  //         ],
  //         Tax_Per_Qty: ["Tax_Per_Qty", "tax_per_qty", "Tax Per Qty"],
  //         Mrgn_Per_Qty: ["Mrgn_Per_Qty", "mrgn_per_qty", "Mrgn Per Qty"],
  //         Ttl_Mrgn: ["Ttl_Mrgn", "ttl_mrgn", "Ttl Mrgn", "Total_Mrgn"],
  //         scheme_type: ["scheme_type", "schemeType", "Scheme_Type"],
  //         scheme_group: ["scheme_group", "schemeGroup", "Scheme_Group"],
  //         state: ["state", "State", "branch_state", "branchState"],
  //         balance_bin_stock: ["balance_bin_stock", "Balance Bin Stock"],
  //         po_qty:["po_qty", "Po Qty"]
  //         // dates / timestamps
  //         // process_date: ["process_date", "processDate", "process date"],
  //         // uploaded_on: ["uploaded_on", "uploadedOn", "uploaded"],
  //         // created_at: ["created_at", "createdAt"],
  //         // updated_at: ["updated_at", "updatedAt"],

  //         // new item metadata
  //       };

  //       // Helper: pull first present field from object using FIELD_MAP (case-insensitive)
  //       const extractField = (obj: any, canonical: string): any => {
  //         const candidates = FIELD_MAP[canonical] ?? [canonical];
  //         if (!obj) return null;
  //         for (const k of candidates) {
  //           if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
  //         }
  //         // case-insensitive fallback
  //         const objKeys = Object.keys(obj);
  //         for (const k of candidates) {
  //           const fk = objKeys.find(
  //             (kk) => kk.toLowerCase() === String(k).toLowerCase()
  //           );
  //           if (fk) return obj[fk];
  //         }
  //         return null;
  //       };

  //       // Helper: normalize a single item object
  //       const normalizeItem = (it: any, parentBranch?: any) => {
  //         const normalized: Record<string, any> = {
  //           Item_Code: extractField(it, "Item_Code"),
  //           Item_Name: extractField(it, "Item_Name"),
  //           Department: extractField(it, "Department"),

  //           // new metadata
  //           category: extractField(it, "category"),
  //           subcategory: extractField(it, "subcategory"),
  //           description: extractField(it, "description"),
  //           Branch_Code:
  //             extractField(it, "Branch_Code") ??
  //             (parentBranch ? extractField(parentBranch, "Branch_Code") : null),
  //           Branch_Name:
  //             extractField(it, "Branch_Name") ??
  //             (parentBranch ? extractField(parentBranch, "Branch_Name") : null),
  //           state: extractField(it, "state"),
  //           item_status:
  //             extractField(it, "item_status") ?? extractField(it, "status"),
  //           exp_imp_sur: extractField(it, "exp_imp_sur"),

  //           // numeric-ish fields coerced where possible
  //           Site_Qtys: safeNumber(extractField(it, "Site_Qtys")),
  //           Total_Sale_Qty: safeNumber(extractField(it, "Total_Sale_Qty")),
  //           Total_Sale_Val: safeNumber(extractField(it, "Total_Sale_Val")),
  //           Local_HBT_Class: extractField(it, "Local_HBT_Class"),
  //           Global_HBT_Class: extractField(it, "Global_HBT_Class"),
  //           Stock_Remarks: extractField(it, "Stock_Remarks"),
  //           Stock_Days_Diff: safeNumber(extractField(it, "Stock_Days_Diff")),
  //           Stock_Bucket: extractField(it, "Stock_Bucket"),
  //           Sales_Bucket: extractField(it, "Sales_Bucket"),
  //           Str_Stk_Sp_Value: safeNumber(extractField(it, "Str_Stk_Sp_Value")),
  //           Tax_Per_Qty: safeNumber(extractField(it, "Tax_Per_Qty")),
  //           Mrgn_Per_Qty: safeNumber(extractField(it, "Mrgn_Per_Qty")),
  //           Ttl_Mrgn: safeNumber(extractField(it, "Ttl_Mrgn")),
  //           scheme_type: extractField(it, "scheme_type"),
  //           scheme_group: extractField(it, "scheme_group"),
  //           balance_bin_stock: extractField(it, "balance_bin_stock"),
  //           po_qty:extractField(it, "po_qty")
  //         };

  //         return normalized;
  //       };

  //       // Helper: extract items array robustly from a branch object
  //       const extractItemsFromBranch = (b: any) => {
  //         if (!b) return [];
  //         if (Array.isArray(b.items)) return b.items;
  //         if (Array.isArray(b.Items)) return b.Items;
  //         if (Array.isArray(b.ITEMS)) return b.ITEMS;
  //         if (Array.isArray(b.ItemsList)) return b.ItemsList;
  //         if (Array.isArray(b.itemsList)) return b.itemsList;
  //         // some responses use "Items" inside root, some use "items" — check common wrappers
  //         if (Array.isArray(b.Items)) return b.Items;
  //         // fallback: if object itself looks like an item (has Item_Code) return as single-element array
  //         const hasItemCode =
  //           b &&
  //           (b.Item_Code ||
  //             b.item_code ||
  //             b.ItemCode ||
  //             b["Item Code"] ||
  //             b.itemCode);
  //         if (hasItemCode) return [b];
  //         return [];
  //       };

  //       // Normalize depending on response shape (branched vs flat)
  //       if (id === "2") {
  //         // branched response expected: normalize branches, flatten items
  //         const branches = Array.isArray(got)
  //           ? got
  //           : got?.departments ??
  //             got?.summaries ??
  //             got?.branches ??
  //             (got?.items
  //               ? Array.isArray(got.items)
  //                 ? got.items
  //                 : [got]
  //               : []);

  //         const items = (branches || []).flatMap((b: any) => {
  //           const rawItems = extractItemsFromBranch(b);
  //           return rawItems.map((it: any) => normalizeItem(it, b));
  //         });

  //         processed = itemCode
  //           ? items.filter((it: any) =>
  //               String(it.Item_Code ?? "")
  //                 .toLowerCase()
  //                 .includes(String(itemCode).toLowerCase())
  //             )
  //           : items;
  //       } else {
  //         // non-branch flow: expect array of items or wrapper shapes
  //         const rawItems = Array.isArray(got)
  //           ? got
  //           : got?.departments ??
  //             got?.department_summaries ??
  //             (got?.status === "ok" ? got.summaries : []) ??
  //             got?.items ??
  //             [];

  //         const arr = Array.isArray(rawItems) ? rawItems : [];
  //         processed = arr.map((it: any) => normalizeItem(it));
  //       }

  //       // dispatch normalized data
  //       dispatch(fetchSuccess(processed));
  //     } catch (e: any) {
  //       dispatch(fetchFailure(e?.message ?? "Failed to load detail data"));
  //     }
  //   },
  //   [callFetch, dispatch, id, selectedBranch, selectedDepartment, itemCode]
  // );

  //   const fetchDetail = useCallback(
  //   async (payload: any) => {
  //     dispatch(clearData());
  //     dispatch(fetchStart());
  //     console.log("Functions running");
  //     try {
  //       const { got } = await callFetch<any>("get-hbtsync-data", "POST", {
  //         branchCode: selectedBranch || payload.branchCode || "",
  //         department: selectedDepartment || payload.department || "",
  //         itemCode: itemCode || payload.itemCode || "",
  //         ...payload,
  //       });

  //       let processed: any[] = [];

  //       // Helper: safely parse numeric-like strings to numbers, otherwise return null
  //       const safeNumber = (v: any) => {
  //         if (v === null || v === undefined || v === "") return null;
  //         if (typeof v === "number") return Number.isFinite(v) ? v : null;
  //         const s = String(v).replace(/,/g, "").trim();
  //         if (s === "") return null;
  //         const n = Number(s);
  //         return Number.isFinite(n) ? n : null;
  //       };

  //       // Canonical mapping: for each canonical key list possible source keys (ordered)
  //       const FIELD_MAP: Record<string, string[]> = {
  //         // branch-level
  //         Branch_Code: ["Branch_Code", "branchCode", "branch_code", "Branch Code"],
  //         Branch_Name: ["Branch_Name", "branchName", "branch_name", "Branch Name"],
  //         Item_Code: ["Item_Code", "item_code", "Item Code", "itemCode"],
  //         Item_Name: ["Item_Name", "item_name", "ItemName", "itemName", "itemname"],
  //         category: ["category", "Category", "item_category", "item_cat", "cat"],
  //         subcategory: [
  //           "subcategory",
  //           "sub_category",
  //           "SubCategory",
  //           "subcat",
  //           "sub_category_name",
  //         ],
  //         description: ["description", "item_desc", "item_description", "Item_Desc", "desc"],
  //         Department: ["Department", "department", "item_department", "Item Department"],
  //         item_sub_category: [
  //           "item_sub_category",
  //           "sub_category",
  //           "subCategory",
  //           "Item_Sub_Category",
  //           "itemSubCategory",
  //         ],
  //         item_status: [
  //           "item_status",
  //           "status",
  //           "Item_Status",
  //           "ItemStatus",
  //           "active_inactive",
  //           "is_active",
  //         ],
  //         exp_imp_sur: ["exp_imp_sur", "expImpSur", "exp_imp", "exp_imp_surr"],

  //         // numeric-ish
  //         Site_Qtys: ["Site_Qtys", "site_qty", "site_qtys", "Site_Qtys", "total_site_qty"],
  //         Total_Sale_Qty: ["Total_Sale_Qty", "total_sale_qty", "TotalSaleQty", "Total Sale Qty"],
  //         Total_Sale_Val: ["Total_Sale_Val", "total_sale_val", "TotalSaleVal", "Total Sale Val"],
  //         Local_HBT_Class: ["Local_HBT_Class", "local_hbt_class", "Local HBT Class"],
  //         Global_HBT_Class: ["Global_HBT_Class", "global_hbt_class", "Global HBT Class"],
  //         Stock_Remarks: ["Stock_Remarks", "stock_remarks", "Stock Remarks"],
  //         Stock_Days_Diff: ["Stock_Days_Diff", "stock_days_diff", "Stock Days Diff"],
  //         Stock_Bucket: ["Stock_Bucket", "stock_bucket", "Stock Bucket"],
  //         Sales_Bucket: ["Sales_Bucket", "sales_bucket", "Sales Bucket"],
  //         Str_Stk_Sp_Value: ["Str_Stk_Sp_Value", "str_stk_sp_value", "Str Stk Sp Value"],
  //         Tax_Per_Qty: ["Tax_Per_Qty", "tax_per_qty", "Tax Per Qty"],
  //         Mrgn_Per_Qty: ["Mrgn_Per_Qty", "mrgn_per_qty", "Mrgn Per Qty"],
  //         Ttl_Mrgn: ["Ttl_Mrgn", "ttl_mrgn", "Ttl Mrgn", "Total_Mrgn"],
  //         scheme_type: ["scheme_type", "schemeType", "Scheme_Type"],
  //         scheme_group: ["scheme_group", "schemeGroup", "Scheme_Group"],
  //         state: ["state", "State", "branch_state", "branchState"],
  //         balance_bin_stock: ["balance_bin_stock", "Balance Bin Stock", "balanceBinStock"],
  //         po_qty: ["po_qty", "Po Qty", "poQty"],
  //       };

  //       // Helper: pull first present field from object using FIELD_MAP (case-insensitive)
  //       const extractField = (obj: any, canonical: string): any => {
  //         const candidates = FIELD_MAP[canonical] ?? [canonical];
  //         if (!obj) return null;
  //         for (const k of candidates) {
  //           if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
  //         }
  //         // case-insensitive fallback
  //         const objKeys = Object.keys(obj);
  //         for (const k of candidates) {
  //           const fk = objKeys.find((kk) => kk.toLowerCase() === String(k).toLowerCase());
  //           if (fk) return obj[fk];
  //         }
  //         return null;
  //       };

  //       // Helper: normalize a single item object
  //       const normalizeItem = (it: any, parentBranch?: any) => {
  //         const normalized: Record<string, any> = {
  //           Item_Code: extractField(it, "Item_Code"),
  //           Item_Name: extractField(it, "Item_Name"),
  //           Department: extractField(it, "Department"),

  //           // new metadata
  //           category: extractField(it, "category"),
  //           subcategory: extractField(it, "subcategory"),
  //           description: extractField(it, "description"),
  //           Branch_Code:
  //             extractField(it, "Branch_Code") ??
  //             (parentBranch ? extractField(parentBranch, "Branch_Code") : null),
  //           Branch_Name:
  //             extractField(it, "Branch_Name") ??
  //             (parentBranch ? extractField(parentBranch, "Branch_Name") : null),
  //           state: extractField(it, "state"),
  //           item_status: extractField(it, "item_status") ?? extractField(it, "status"),
  //           exp_imp_sur: extractField(it, "exp_imp_sur"),

  //           // numeric-ish fields coerced where possible
  //           Site_Qtys: safeNumber(extractField(it, "Site_Qtys")),
  //           Total_Sale_Qty: safeNumber(extractField(it, "Total_Sale_Qty")),
  //           Total_Sale_Val: safeNumber(extractField(it, "Total_Sale_Val")),
  //           Local_HBT_Class: extractField(it, "Local_HBT_Class"),
  //           Global_HBT_Class: extractField(it, "Global_HBT_Class"),
  //           Stock_Remarks: extractField(it, "Stock_Remarks"),
  //           Stock_Days_Diff: safeNumber(extractField(it, "Stock_Days_Diff")),
  //           Stock_Bucket: extractField(it, "Stock_Bucket"),
  //           Sales_Bucket: extractField(it, "Sales_Bucket"),
  //           Str_Stk_Sp_Value: safeNumber(extractField(it, "Str_Stk_Sp_Value")),
  //           Tax_Per_Qty: safeNumber(extractField(it, "Tax_Per_Qty")),
  //           Mrgn_Per_Qty: safeNumber(extractField(it, "Mrgn_Per_Qty")),
  //           Ttl_Mrgn: safeNumber(extractField(it, "Ttl_Mrgn")),
  //           scheme_type: extractField(it, "scheme_type"),
  //           scheme_group: extractField(it, "scheme_group"),
  //           balance_bin_stock: safeNumber(extractField(it, "balance_bin_stock")),
  //           po_qty: safeNumber(extractField(it, "po_qty")),
  //         };

  //         return normalized;
  //       };

  //       // Helper: extract items array robustly from a branch object
  //       const extractItemsFromBranch = (b: any) => {
  //         if (!b) return [];
  //         if (Array.isArray(b.items)) return b.items;
  //         if (Array.isArray(b.Items)) return b.Items;
  //         if (Array.isArray(b.ITEMS)) return b.ITEMS;
  //         if (Array.isArray(b.ItemsList)) return b.ItemsList;
  //         if (Array.isArray(b.itemsList)) return b.itemsList;
  //         // fallback: if object itself looks like an item (has Item_Code) return as single-element array
  //         const hasItemCode =
  //           b &&
  //           (b.Item_Code ||
  //             b.item_code ||
  //             b.ItemCode ||
  //             b["Item Code"] ||
  //             b.itemCode);
  //         if (hasItemCode) return [b];
  //         return [];
  //       };

  //       // parseCodes: normalize selected item code(s) from state or payload into array of lower-trimmed codes
  //       const parseCodes = (raw: any): string[] => {
  //         if (raw == null) return [];
  //         if (Array.isArray(raw)) {
  //           return raw
  //             .map((x) => (x == null ? "" : String(x).trim()))
  //             .filter((s) => s !== "")
  //             .map((s) => s.toLowerCase());
  //         }
  //         // string path: accept comma-separated or single value
  //         const asStr = String(raw);
  //         const parts = asStr.split(",").map((p) => p.trim()).filter((p) => p !== "");
  //         return parts.map((p) => p.toLowerCase());
  //       };

  //       // determine filter codes from: (itemCode state) || (payload.itemCode) || none
  //       const filterCodes =
  //         parseCodes(itemCode ?? payload?.itemCode ?? got?.applied_itemCode ?? null);

  //       // Normalize depending on response shape (branched vs flat)
  //       if (id === "2") {
  //         // branched response expected: normalize branches, flatten items
  //         const branches = Array.isArray(got)
  //           ? got
  //           : got?.departments ??
  //             got?.summaries ??
  //             got?.branches ??
  //             (got?.items ? (Array.isArray(got.items) ? got.items : [got]) : []);

  //         const items = (branches || []).flatMap((b: any) => {
  //           const rawItems = extractItemsFromBranch(b);
  //           return rawItems.map((it: any) => normalizeItem(it, b));
  //         });

  //         processed =
  //           filterCodes.length > 0
  //             ? items.filter((it: any) => {
  //                 const code = String(it.Item_Code ?? "").toLowerCase().trim();
  //                 return filterCodes.includes(code);
  //               })
  //             : items;
  //       } else {
  //         // non-branch flow: expect array of items or wrapper shapes
  //         const rawItems = Array.isArray(got)
  //           ? got
  //           : got?.departments ??
  //             got?.department_summaries ??
  //             (got?.status === "ok" ? got.summaries : []) ??
  //             got?.items ??
  //             [];

  //         const arr = Array.isArray(rawItems) ? rawItems : [];
  //         const normalized = arr.map((it: any) => normalizeItem(it));
  //         processed =
  //           filterCodes.length > 0
  //             ? normalized.filter((it: any) => {
  //                 const code = String(it.Item_Code ?? "").toLowerCase().trim();
  //                 return filterCodes.includes(code);
  //               })
  //             : normalized;
  //       }

  //       // dispatch normalized data
  //       dispatch(fetchSuccess(processed));
  //     } catch (e: any) {
  //       dispatch(fetchFailure(e?.message ?? "Failed to load detail data"));
  //     }
  //   },
  //   [callFetch, dispatch, id, selectedBranch, selectedDepartment, itemCode]
  // );

  const fetchDetail = useCallback(
    async (payload: any) => {
      dispatch(clearData());
      dispatch(fetchStart());
      console.log("Functions running");

      try {
        const { got } = await callFetch<any>("get-hbtsync-data", "POST", {
          branchCode: selectedBranch || payload.branchCode || "",
          department: selectedDepartment || payload.department || "",
          itemCode: itemCode || payload.itemCode || "",
          ...payload,
        });

        let processed: any[] = [];

        // ──────────────────────────────────────────────────────────────
        // Helper utilities (same as before)
        // ──────────────────────────────────────────────────────────────
        const safeNumber = (v: any) => {
          if (v === null || v === undefined || v === "") return null;
          if (typeof v === "number") return Number.isFinite(v) ? v : null;
          const s = String(v).replace(/,/g, "").trim();
          if (s === "") return null;
          const n = Number(s);
          return Number.isFinite(n) ? n : null;
        };

        const FIELD_MAP: Record<string, string[]> = {
          /* ... your full map ... */
        };

        const extractField = (obj: any, canonical: string): any => {
          const candidates = FIELD_MAP[canonical] ?? [canonical];
          if (!obj) return null;
          for (const k of candidates) {
            if (Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
          }
          const lower = canonical.toLowerCase();
          for (const k of Object.keys(obj)) {
            if (k.toLowerCase() === lower) return obj[k];
          }
          return null;
        };

        const normalizeItem = (it: any, parentBranch?: any) => {
          const normalized: Record<string, any> = {
            Item_Code: extractField(it, "Item_Code"),
            Item_Name: extractField(it, "Item_Name"),
            Department: extractField(it, "Department"),

            category: extractField(it, "category"),
            subcategory: extractField(it, "subcategory"),
            description: extractField(it, "description"),
            Branch_Code:
              extractField(it, "Branch_Code") ??
              (parentBranch ? extractField(parentBranch, "Branch_Code") : null),
            Branch_Name:
              extractField(it, "Branch_Name") ??
              (parentBranch ? extractField(parentBranch, "Branch_Name") : null),
            state: extractField(it, "state"),
            item_status:
              extractField(it, "item_status") ?? extractField(it, "status"),
            exp_imp_sur: extractField(it, "exp_imp_sur"),

            Site_Qtys: safeNumber(extractField(it, "Site_Qtys")),
            Total_Sale_Qty: safeNumber(extractField(it, "Total_Sale_Qty")),
            Total_Sale_Val: safeNumber(extractField(it, "Total_Sale_Val")),
            Local_HBT_Class: extractField(it, "Local_HBT_Class"),
            Global_HBT_Class: extractField(it, "Global_HBT_Class"),
            Stock_Remarks: extractField(it, "Stock_Remarks"),
            Stock_Days_Diff: safeNumber(extractField(it, "Stock_Days_Diff")),
            Stock_Bucket: extractField(it, "Stock_Bucket"),
            Sales_Bucket: extractField(it, "Sales_Bucket"),
            Str_Stk_Sp_Value: safeNumber(extractField(it, "Str_Stk_Sp_Value")),
            Tax_Per_Qty: safeNumber(extractField(it, "Tax_Per_Qty")),
            Mrgn_Per_Qty: safeNumber(extractField(it, "Mrgn_Per_Qty")),
            Ttl_Mrgn: safeNumber(extractField(it, "Ttl_Mrgn")),
            scheme_type: extractField(it, "scheme_type"),
            scheme_group: extractField(it, "scheme_group"),
            balance_bin_stock: safeNumber(
              extractField(it, "balance_bin_stock")
            ),
            po_qty: safeNumber(extractField(it, "po_qty")),
          };

          return normalized;
        };

        const extractItemsFromBranch = (b: any) => {
          if (!b) return [];
          if (Array.isArray(b.items)) return b.items;
          if (Array.isArray(b.Items)) return b.Items;
          if (Array.isArray(b.ITEMS)) return b.ITEMS;
          if (Array.isArray(b.ItemsList)) return b.ItemsList;
          if (Array.isArray(b.itemsList)) return b.itemsList;
          const hasItemCode =
            b &&
            (b.Item_Code ||
              b.item_code ||
              b.ItemCode ||
              b["Item Code"] ||
              b.itemCode);
          return hasItemCode ? [b] : [];
        };

        const parseCodes = (raw: any): string[] => {
          if (!raw) return [];
          if (Array.isArray(raw)) {
            return raw
              .map((x) => String(x ?? "").trim())
              .filter(Boolean)
              .map((s) => s.toLowerCase());
          }
          return String(raw)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((s) => s.toLowerCase());
        };

        const filterCodes = parseCodes(
          itemCode ?? payload?.itemCode ?? got?.applied_itemCode ?? null
        );

        // ──────────────────────────────────────────────────────────────
        // Unified handling – both id === "1" and id === "2" now use the
        // exact same branched → flatten → normalize → filter logic
        // ──────────────────────────────────────────────────────────────
        const isBranchedFlow = id === "1" || id === "2";

        if (isBranchedFlow) {
          // Expected shape: array of branches OR wrapper with .branches/.departments/.summaries etc.
          const branches = Array.isArray(got)
            ? got
            : got?.branches ??
              got?.departments ??
              got?.summaries ??
              got?.items ??
              (Array.isArray(got.items) ? got.items : []);

          const allItems = (branches || []).flatMap((branch: any) => {
            const rawItems = extractItemsFromBranch(branch);
            return rawItems.map((item: any) => normalizeItem(item, branch));
          });

          processed =
            filterCodes.length > 0
              ? allItems.filter((it: any) =>
                  filterCodes.includes(
                    String(it.Item_Code ?? "")
                      .trim()
                      .toLowerCase()
                  )
                )
              : allItems;
        } else {
          // Fallback flat flow (kept for any other id values)
          const rawItems = Array.isArray(got)
            ? got
            : got?.departments ??
              got?.department_summaries ??
              got?.items ??
              got?.summaries ??
              [];

          const arr = Array.isArray(rawItems) ? rawItems : [];
          const normalized = arr.map((it: any) => normalizeItem(it));

          processed =
            filterCodes.length > 0
              ? normalized.filter((it: any) =>
                  filterCodes.includes(
                    String(it.Item_Code ?? "")
                      .trim()
                      .toLowerCase()
                  )
                )
              : normalized;
        }

        dispatch(fetchSuccess(processed));
      } catch (e: any) {
        dispatch(fetchFailure(e?.message ?? "Failed to load detail data"));
      }
    },
    [callFetch, dispatch, id, selectedBranch, selectedDepartment, itemCode]
  );

  // Unified fetch trigger
  const triggerFetch = useCallback(() => {
    const payload = buildPayload();
    if (basePath === "dynamictable") {
      fetchDetail(payload);
    } else if (basePath === "summaries") {
      fetchData(payload);
      // console.log("hsahs");
    } else if (basePath === "") {
      dispatch(fetchDashboardData(payload));
      fetchData(payload);
    } else if (basePath === "stock-comparison") {
      fetchData(payload);
    }
  }, [basePath, buildPayload, fetchData, fetchDetail]);

  const debouncedTriggerFetch = useDebouncedCallback(triggerFetch, 500);

  // Initial fetch + re-fetch on route/filter changes
  useEffect(() => {
    debouncedTriggerFetch();
  }, [debouncedTriggerFetch, basePath, id]);

  // Handle filter submit
  const handleFilterSubmit = form.handleSubmit((values) => {
    (onFilterSubmit as any)(values);
    console.log("vvvvvvv", values);
    debouncedTriggerFetch();
    // console.log("Else")
  });

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-layout-mode", layoutColor);
    document.documentElement.setAttribute("data-layout-style", layoutView);
    document.documentElement.setAttribute("data-nav-color", layoutTheme);
    localStorage.setItem("colorschema", layoutColor);
  }, [layoutColor, layoutView, layoutTheme]);

  const applyTheme = (theme: ThemeMode, userOverride = false) => {
    setLayoutColor(theme);
    localStorage.setItem("colorschema", theme);
    if (userOverride) localStorage.setItem("userThemeOverride", "true");
    dispatch({ type: "SET_THEME", payload: theme });
    document.documentElement.setAttribute("data-layout-mode", theme);
  };

  // System theme sync
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("userThemeOverride")) {
        applyTheme(e.matches ? "dark_mode" : "light_mode");
      }
    };
    if (!localStorage.getItem("userThemeOverride")) {
      const initial = mediaQuery.matches ? "dark_mode" : "light_mode";
      if (layoutColor !== initial) applyTheme(initial);
    }
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [layoutColor]);

  const showSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    setShow((prev) => !prev);
  };

  const darkThemes = () => applyTheme("dark_mode", true);
  const lightThemes = () => applyTheme("light_mode", true);

  // const layoutGrey = () => {
  //   localStorage.setItem("layoutThemeColors", "grey");
  //   setLayoutTheme("grey");
  // };
  // const layoutDark = () => {
  //   localStorage.setItem("layoutThemeColors", "dark");
  //   setLayoutTheme("dark");
  // };
  // const layoutLight = () => {
  //   localStorage.setItem("layoutThemeColors", "light");
  //   setLayoutTheme("light");
  // };

  const resetData = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("colorschema");
    localStorage.removeItem("layoutStyling");
    localStorage.removeItem("layoutThemeColors");
    localStorage.removeItem("userThemeOverride");
    localStorage.removeItem("openThemeSection");

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const initialTheme = mediaQuery.matches ? "dark_mode" : "light_mode";

    setLayoutColor(initialTheme);
    setLayoutView("default");
    setLayoutTheme("light");
    applyTheme(initialTheme);
    document.documentElement.setAttribute("data-layout-style", "default");
    document.documentElement.setAttribute("data-nav-color", "light");
    setOpenSection("filters");
  };

  return (
    <>
      {/* Theme Toggle Button */}
      <div className="customizer-links" id="setdata">
        <ul className="sticky-sidebar">
          <li className="sidebar-icons" onClick={showSettings}>
            <Link
              to="#"
              onClick={(e) => e.preventDefault()}
              className="navigation-add"
              data-bs-toggle="tooltip"
              data-bs-placement="left"
              title="Theme & Filters"
            >
              <Settings className="feather-five" />
            </Link>
          </li>
        </ul>
      </div>

      {/* Theme Settings Panel */}
      <div
        className={`sidebar-settings nav-toggle ${show ? "show-settings" : ""}`}
        id="layoutDiv"
      >
        <div className="sidebar-content sticky-sidebar-one">
          <div className="sidebar-header">
            <div className="sidebar-theme-title">
              <h5>Theme & Filters</h5>
              <p>Customize theme and apply report filters</p>
            </div>
            <div className="close-sidebar-icon d-flex">
              <Link
                to="#"
                className="sidebar-refresh me-2"
                onClick={resetData}
                title="Reset"
              >
                ⟳
              </Link>
              <Link
                className="sidebar-close"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShow(false);
                }}
              >
                X
              </Link>
            </div>
          </div>

          <div className="sidebar-body p-0">
            <form>
              {/* === FILTERS SECTION === */}
              <div className="theme-mode mb-3">
                <div
                  className="theme-head d-flex justify-content-between align-items-center cursor-pointer p-3 border-bottom"
                  onClick={() => toggleSection("filters")}
                >
                  <div>
                    <h6>Report Filters</h6>
                    <p className="mb-0">Filter data across all reports</p>
                  </div>
                  {openSection === "filters" ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>

                {openSection === "filters" && (
                  <div className="p-3 border-bottom">
                    <ReportFilterRow
                      {...ReportFilterRowProps}
                      onSubmit={handleFilterSubmit}
                    />
                  </div>
                )}
              </div>

              {/* === THEME SECTION === */}
              <div className="theme-mode mb-0">
                <div
                  className="theme-head d-flex justify-content-between align-items-center cursor-pointer p-3 border-bottom"
                  onClick={() => toggleSection("theme")}
                >
                  <div>
                    <h6>Theme Settings</h6>
                    <p className="mb-0">
                      Light & Dark modes, navigation colors
                    </p>
                  </div>
                  {openSection === "theme" ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </div>

                {openSection === "theme" && (
                  <div className="p-3">
                    {/* Light / Dark Mode */}
                    <div className="row mb-3">
                      <div className="col-xl-6">
                        <div className="layout-wrap">
                          <div className="d-flex align-items-center">
                            <div
                              className="status-toggle d-flex align-items-center me-2"
                              onClick={lightThemes}
                            >
                              <input
                                type="radio"
                                name="theme-mode"
                                id="light_mode"
                                className="check"
                                checked={layoutColor === "light_mode"}
                                onChange={lightThemes}
                              />
                              <label
                                htmlFor="light_mode"
                                className="checktoggles"
                              >
                                <ImageWithBasePath
                                  src="assets/light.png"
                                  alt="Light"
                                />
                                <span className="theme-name">Light Mode</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-6">
                        <div className="layout-wrap">
                          <div className="d-flex align-items-center">
                            <div
                              className="status-toggle d-flex align-items-center me-2"
                              onClick={darkThemes}
                            >
                              <input
                                type="radio"
                                name="theme-mode"
                                id="dark_mode"
                                className="check"
                                checked={layoutColor === "dark_mode"}
                                onChange={darkThemes}
                              />
                              <label
                                htmlFor="dark_mode"
                                className="checktoggles"
                              >
                                <ImageWithBasePath
                                  src="assets/dark.png"
                                  alt="Dark"
                                />
                                <span className="theme-name">Dark Mode</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Footer */}
            <div className="sidebar-footer p-3">
              <div className="row g-2">
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={triggerFetch}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    title="Apply filters and reload reports"
                  >
                    <Settings size={16} />
                    Show Reports
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-secondary w-100"
                    onClick={resetData}
                  >
                    Reset to System Default
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemeSettings;
