// import React, { useEffect, useMemo, useCallback, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Wrapper from "../../common/uicomponent/wrapper";
// import GridTable from "../../common/component/GridTable";
// import CenteredLoader from "../../common/component/CenteredLoader";
// import { toNumber, toTitleCase } from "./helperfunc";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../redux/store";
// import {
//   setActiveTab,
//   setTableHeight,
//   saveScheme,
//   // removeSavedSchemeByItemCode,
// } from "../../redux/phase3Slice";
// import {
//   fetchSchemeTypes,
//   fetchSchemeGroups,
//   clearSchemeGroups,
// } from "../../redux/schemeOptionsSlice";
// import { FormProvider, useForm } from "react-hook-form";
// import scheme, { display } from "../../core/json/scheme";
// import { renderField } from "../../common/utils/renderField";
// // import useFetch from "../../hooks/useFetch";

// const SimpleModal: React.FC<{
//   show: boolean;
//   title: string;
//   size?: "sm" | "md" | "lg" | "xl";
//   onClose: () => void;
//   footer?: React.ReactNode;
//   children?: React.ReactNode;
// }> = ({ show, title, size = "md", onClose, footer, children }) => {
//   if (!show) return null;
//   const dlgClass =
//     size === "sm"
//       ? "modal-sm"
//       : size === "lg"
//       ? "modal-lg"
//       : size === "xl"
//       ? "modal-xl"
//       : "";
//   return (
//     <div
//       className="modal fade show d-block"
//       style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
//       tabIndex={-1}
//     >
//       <div className={`modal-dialog ${dlgClass} modal-dialog-centered`}>
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title">{title}</h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={onClose}
//               aria-label="Close"
//             />
//           </div>
//           <div className="modal-body">{children}</div>
//           {footer && <div className="modal-footer">{footer}</div>}
//         </div>
//       </div>
//     </div>
//   );
// };

// const Phase3Page: React.FC = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const location = useLocation();

//   // --- Phase 3 Selectors ---
//   const summaries = useSelector((s: RootState) => s.phase3.summaries);
//   const departmentSummaries = useSelector(
//     (s: RootState) => s.phase3.departmentSummaries
//   );
//   const savedSchemes = useSelector((s: RootState) => s.phase3.savedSchemes);
//   const itemsSummaries = useSelector((s: RootState) => s.phase3.itemSummaries);
//   const compSummaries = useSelector(
//     (s: RootState) => s.phase3.comparisonSummaries
//   );
//   const bSummaries = useSelector(
//     (s: RootState) => s.phase3.branchSchemeSummaries
//   );
//   // console.log("summaries", summaries);
//   const loading = useSelector((s: RootState) => s.phase3.loading);
//   const error = useSelector((s: RootState) => s.phase3.error);
//   const activeTab = useSelector((s: RootState) => s.phase3.activeTab);
//   const tableHeight = useSelector((s: RootState) => s.phase3.tableHeight);

//   // --- Scheme Options Selectors ---
//   const {
//     types: rawSchemeTypes,
//     groups: rawSchemeGroups,
//     loadingTypes,
//     loadingGroups,
//     error: schemeOptionsError,
//   } = useSelector((s: RootState) => s.schemeOptions);

//   // --- simple modal state ---
//   const [modalType, setModalType] = useState<null | "scheme" | "display">(null);
//   const [modalOpen, setModalOpen] = useState(false);

//   // --- Form ---
//   const form = useForm<any>({
//     mode: "onBlur",
//     defaultValues: {
//       startDate: null,
//       endDate: null,
//       schemeType: null,
//       schemeGroup: null,
//       displayType: null,
//     },
//   });
//   const defaultFormValues = {
//     startDate: null,
//     endDate: null,
//     schemeType: null,
//     schemeGroup: null,
//     displayType: null,
//   };

//   const selectedSchemeType = form.watch("schemeType");

//   const { enable } = useMemo(() => {
//     const state = (location as any)?.state ?? {};
//     return {
//       enable: state.enable ?? 0,
//       bucket: state.bucket ?? null,
//     };
//   }, [location]);

//   // fetch scheme types when mounted
//   useEffect(() => {
//     dispatch(fetchSchemeTypes() as any);
//   }, [dispatch]);

//   // when scheme type changes fetch groups
//   useEffect(() => {
//     const id = (selectedSchemeType &&
//       (selectedSchemeType.value ?? selectedSchemeType)) as
//       | number
//       | string
//       | undefined;
//     if (id) {
//       try {
//         form.setValue("schemeGroup", null);
//       } catch {}
//       dispatch(fetchSchemeGroups(Number(id)) as any);
//     } else {
//       dispatch(clearSchemeGroups());
//       try {
//         form.setValue("schemeGroup", null);
//       } catch {}
//     }
//   }, [selectedSchemeType, dispatch, form]);

//   // normalize raw scheme types and groups
//   const schemeTypes = useMemo(() => {
//     if (!Array.isArray(rawSchemeTypes)) return [];
//     return rawSchemeTypes.map((t: any) => {
//       const value =
//         t?.value ?? t?.id ?? t?.type_id ?? t?.code ?? t?.key ?? t?.name ?? "";
//       const label = t?.label ?? t?.name ?? t?.type_name ?? String(value);
//       return { value: String(value), label: String(label), __raw: t };
//     });
//   }, [rawSchemeTypes]);

//   const schemeGroups = useMemo(() => {
//     if (!Array.isArray(rawSchemeGroups)) return [];
//     return rawSchemeGroups.map((g: any) => {
//       const value =
//         g?.value ??
//         g?.id ??
//         g?.group_id ??
//         g?.scheme_group_id ??
//         g?.code ??
//         g?.key ??
//         g?.name ??
//         "";
//       const label =
//         g?.label ?? g?.name ?? g?.group_name ?? g?.title ?? String(value);
//       return { value: String(value), label: String(label), __raw: g };
//     });
//   }, [rawSchemeGroups]);

//   // force remount key for group select
//   const [schemeGroupKey, setSchemeGroupKey] = useState(0);
//   useEffect(() => {
//     setSchemeGroupKey((k) => k + 1);
//   }, [schemeGroups.length]);

//   // helpers to extract codes
//   const getItemCodeFromRow = useCallback((row: any): string | undefined => {
//     const raw =
//       row?.["Item Code"] ??
//       row?.itemCode ??
//       row?.ItemCode ??
//       row?.item_code ??
//       row?.Item_Code ??
//       row?.itemcode ??
//       undefined;
//     if (raw === undefined || raw === null) return undefined;
//     const trimmed = String(raw).trim();
//     return trimmed === "" ? undefined : trimmed;
//   }, []);

//   const getBranchCodeFromRow = useCallback((row: any): string | undefined => {
//     const raw =
//       row?.branchCode ??
//       row?.Branch_Code ??
//       row?.BranchCode ??
//       row?.branch_code ??
//       row?.branch ??
//       row?.Branch ??
//       undefined;
//     if (raw === undefined || raw === null) return undefined;
//     const trimmed = String(raw).trim();
//     return trimmed === "" ? undefined : trimmed;
//   }, []);

//   const findSavedEntryForRow = useCallback(
//     (row: any) => {
//       const itemCode = getItemCodeFromRow(row);
//       const branchCode = getBranchCodeFromRow(row);
//       if (itemCode) {
//         if (branchCode) {
//           return savedSchemes.find(
//             (s: any) =>
//               String(s.itemCode ?? "")
//                 .trim()
//                 .toLowerCase() === String(itemCode).trim().toLowerCase() &&
//               String(s.branchCode ?? "")
//                 .trim()
//                 .toLowerCase() === String(branchCode).trim().toLowerCase()
//           );
//         }
//         const global = savedSchemes.find(
//           (s: any) =>
//             String(s.itemCode ?? "")
//               .trim()
//               .toLowerCase() === String(itemCode).trim().toLowerCase() &&
//             (s.branchCode === undefined || s.branchCode === null)
//         );
//         return global;
//       }
//       try {
//         const rowJson = JSON.stringify(row || {});
//         return savedSchemes.find(
//           (s: any) => JSON.stringify(s.data) === rowJson
//         );
//       } catch {
//         return undefined;
//       }
//     },
//     [savedSchemes, getItemCodeFromRow, getBranchCodeFromRow]
//   );

//   // data transforms (unchanged)
//   const departmentData = useMemo(
//     () =>
//       departmentSummaries.map((d: any) => ({
//         Department: d?.department,
//         "Str Stk": Math.round(d?.total_site_quantity || 0),
//         "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
//         "Sale Qty": Math.round(d?.total_sale_quantity || 0),
//         "Sale Val": Math.round(d?.total_sale_value || 0),
//         "Ttl Mrgn": Math.round(d?.total_ttl_mrgn_value || 0),
//         "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
//         "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
//       })),
//     [departmentSummaries]
//   );

//   const branchData = useMemo(
//     () =>
//       summaries.map((d: any) => ({
//         "Branch Code": d?.branch_code,
//         "Branch Name": d?.branch_name,
//         State: d?.state,
//         "Str Stk": Math.round(d?.total_site_quantity || 0),
//         "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
//         "Sale Qty": Math.round(d?.total_sale_quantity || 0),
//         "Sale Val": Math.round(d?.total_sale_value || 0),
//         "Ttl Mrgn": Math.round(d?.total_ttl_mrgn_value || 0),
//         "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
//         "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
//       })),
//     [summaries]
//   );

//   const itemsData = useMemo(
//     () =>
//       itemsSummaries.map((d: any) => ({
//         "Item Code": d?.item_code,
//         "Item Name": d?.item_name,
//         Department: d?.department,
//         Category: d?.category,
//         "Sub Category": d?.subcategory,
//         "Item Status": d?.active_inactive,
//         Desc: d?.item_desc,
//         "Scheme Type": d?.scheme_type,
//         "Scheme Group": d?.scheme_group,
//         "Str Stk": Math.round(d?.total_site_quantity || 0),
//         "Sale Qty": Math.round(d?.total_sale_quantity || 0),
//         "Sale Val": Math.round(d?.total_sale_value || 0),
//         "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
//         "Ttl Mrgn": Math.round(d?.total_ttl_mrgn_value || 0),
//         "Branch Count": d?.branch_count,
//         "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
//         "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
//       })),
//     [itemsSummaries]
//   );

//   const comparisonData = useMemo(
//     () =>
//       compSummaries.map((d: any) => ({
//         "Item Code": d?.item_code,
//         "Item Name": d?.item_name,
//         Department: d?.department,
//         Category: d?.category,
//         "Sub Category": d?.subcategory,
//         "Item Status": d?.active_inactive,
//         Desc: d?.item_desc,
//         "Scheme Type": d?.scheme_type,
//         "Scheme Group": d?.scheme_group,
//         "New Scheme Type": d?.newSchemeType,
//         "New Scheme Group": d?.newSchemeGroup,
//         "Cur Str Stk": Math.round(d?.total_site_quantity || 0),
//         "Prev Str Stk": Math.round(d?.pending_stock || 0),
//         "Stk Diff": Math.round(d?.stock_difference || 0),
//         "Sale Qty": Math.round(d?.total_sale_quantity || 0),
//         "Sale Val": Math.round(d?.total_sale_value || 0),
//         "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
//         // "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
//         // "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
//       })),
//     [compSummaries]
//   );
//   const branchComparisonData = useMemo(
//     () =>
//       bSummaries.map((d: any) => ({
//         "Item Code": d?.item_code,
//         "Item Name": d?.item_name,
//         "Branch Code": d?.branch_code,
//         "Branch Name": d?.branch_name,
//         Department: d?.department,
//         Category: d?.category,
//         "Sub Category": d?.subcategory,
//         "Item Status": d?.active_inactive,
//         Desc: d?.item_desc,
//         "Scheme Type": d?.scheme_type,
//         "Scheme Group": d?.scheme_group,
//         "New Scheme Type": d?.newSchemeType,
//         "New Scheme Group": d?.newSchemeGroup,
//         "Cur Str Stk": Math.round(d?.total_site_quantity || 0),
//         "Prev Str Stk": Math.round(d?.pending_stock || 0),
//         "Stk Diff": Math.round(d?.stock_difference || 0),
//         "Sale Qty": Math.round(d?.total_sale_quantity || 0),
//         "Sale Val": Math.round(d?.total_sale_value || 0),
//         "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
//         // "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
//         // "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
//       })),
//     [compSummaries]
//   );

//   const makeCols = useCallback(
//     (data: any[]) => {
//       if (!data.length) return [];
//       const first = data[0];
//       const allKeys = Object.keys(first);
//       const totalColumns = allKeys.length;
//       const defaultFlex = totalColumns <= 8 ? 1 : 0;

//       // Define which columns should be pinned to the right in Comparison tab
//       const rightPinnedInComparison = [
//         "Cur Str Stk",
//         "Prev Str Stk",
//         "Stk Diff",
//       ];

//       const cols = allKeys.map((k) => {
//         const isContriColumn = k === "Stk Qty Contri" || k === "Stk Val Contri";
//         const isComparisonKeyColumn = rightPinnedInComparison.includes(k);

//         // Only apply right-pinning logic in comparison tab
//         const shouldPinRight =
//           isContriColumn ||
//           ((activeTab === "comparison" || activeTab === "scomp") &&
//             isComparisonKeyColumn);

//         return {
//           field: k,
//           headerName: toTitleCase(k),
//           sortable: true,
//           resizable: true,
//           filter:
//             typeof first[k] === "string"
//               ? "agTextColumnFilter"
//               : "agNumberColumnFilter",
//           pinned: shouldPinRight ? "right" : null,
//           width: shouldPinRight ? 140 : undefined,
//           lockPosition: shouldPinRight,
//           cellStyle: shouldPinRight ? { textAlign: "right" } : undefined,
//           flex: shouldPinRight ? 0 : defaultFlex,
//           valueFormatter: isContriColumn
//             ? (params: any) => {
//                 const val = params.value;
//                 if (val == null) return "";
//                 const num = parseFloat(val.replace("%", "").trim());
//                 return isNaN(num) ? val : `${num.toFixed(2)}%`;
//               }
//             : undefined,
//           getQuickFilterText: isContriColumn
//             ? (params: any) => {
//                 const val = params.value;
//                 return val
//                   ? parseFloat(val.replace("%", "").trim()).toString()
//                   : "";
//               }
//             : undefined,
//           comparator: isContriColumn
//             ? (a: any, b: any) => {
//                 const numA = parseFloat((a || "").replace("%", "").trim()) || 0;
//                 const numB = parseFloat((b || "").replace("%", "").trim()) || 0;
//                 return numA - numB;
//               }
//             : undefined,
//         };
//       });

//       return cols;
//     },
//     [activeTab]
//   );

//   const deptColumnDefs = useMemo(
//     () => makeCols(departmentData),
//     [departmentData, makeCols]
//   );
//   const branchColumnDefs = useMemo(
//     () => makeCols(branchData),
//     [branchData, makeCols]
//   );
//   const itemColumnDefs = useMemo(
//     () => makeCols(itemsData),
//     [itemsData, makeCols]
//   );
//   const comparisonColumnDefs = useMemo(
//     () => makeCols(comparisonData),
//     [comparisonData, makeCols]
//   );
//   const bcomparisonColumnDefs = useMemo(
//     () => makeCols(branchComparisonData),
//     [comparisonData, makeCols]
//   );
//   const currentData: any =
//     activeTab === "branch"
//       ? branchData
//       : activeTab === "department"
//       ? departmentData
//       : activeTab === "item"
//       ? itemsData
//       : activeTab === "comparison"
//       ? comparisonData
//       : branchComparisonData;

//   const currentColumnDefs: any =
//     activeTab === "branch"
//       ? branchColumnDefs
//       : activeTab === "department"
//       ? deptColumnDefs
//       : activeTab === "item"
//       ? itemColumnDefs
//       : activeTab === "comparison"
//       ? comparisonColumnDefs
//       : bcomparisonColumnDefs;

//   // displayedColumnDefs: add checkbox only for item view and only for rows without applied scheme
//   const displayedColumnDefs = useMemo(() => {
//     const cols: any[] = Array.isArray(currentColumnDefs)
//       ? [...currentColumnDefs]
//       : [];

//     if (activeTab === "item") {
//       const hasCheckboxAlready = cols.some(
//         (c: any) => c.field === "__select__" || c.checkboxSelection
//       );
//       if (!hasCheckboxAlready) {
//         const checkboxCol = {
//           field: "__select__",
//           headerName: "",
//           width: 48,
//           pinned: "left",
//           lockPosition: true,
//           suppressSizeToFit: true,
//           sortable: false,
//           filter: false,
//           resizable: false,
//           // per-row checkbox: only when row doesn't have appliedScheme
//           checkboxSelection: (params: any) => {
//             try {
//               const row = params?.data;
//               const saved = findSavedEntryForRow(row);
//               return !saved?.data?.appliedScheme;
//             } catch (e) {
//               return true;
//             }
//           },
//           // don't show header checkbox since not all rows are selectable
//           headerCheckboxSelection: false,
//           cellRenderer: () => null,
//         };
//         cols.unshift(checkboxCol);
//       }
//     }

//     return cols;
//   }, [currentColumnDefs, activeTab, findSavedEntryForRow]);

//   // selected rows
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);

//   const selectedRowsHandler = (data: any) => {
//     setSelectedRows(data);
//   };

//   // Render fallback field wrapper (keeps your renderField usage)
//   const selectOptions = useMemo(() => {
//     const addKeys = (acc: any, keyBase: string, arr: any[]) => {
//       const camel = keyBase;
//       const snake = keyBase.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
//       const alt1 = keyBase + "Id";
//       const alt1Snake = alt1.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
//       acc[camel] = arr;
//       acc[snake] = arr;
//       acc[alt1] = arr;
//       acc[alt1Snake] = arr;
//       return acc;
//     };
//     const base: any = {};
//     addKeys(base, "schemeType", schemeTypes);
//     addKeys(base, "schemeGroup", schemeGroups);
//     addKeys(base, "displayType", [
//       { value: "Send Shelf Picture", label: "Send Shelf Picture" },
//     ]);
//     return base;
//   }, [schemeTypes, schemeGroups]);

//   const renderFieldWrapper = useCallback(
//     (field: any, key: string) => {
//       const name = (field?.props?.name ?? "") as string;
//       const options = selectOptions[name] ?? [];
//       if (
//         (name === "schemeType" && loadingTypes) ||
//         (name === "schemeGroup" && loadingGroups) ||
//         (name === "scheme_group" && loadingGroups)
//       ) {
//         return (
//           <div key={key} className="p-2">
//             <div
//               className="spinner-border spinner-border-sm text-primary"
//               role="status"
//             >
//               <span className="visually-hidden">Loading…</span>
//             </div>
//           </div>
//         );
//       }

//       const fieldKey =
//         name === "schemeGroup" || name === "scheme_group"
//           ? `${key}-${schemeGroupKey}-${options.length}`
//           : key;

//       return renderField({
//         field,
//         form,
//         options,
//         key: fieldKey,
//       });
//     },
//     [form, selectOptions, loadingTypes, loadingGroups, schemeGroupKey]
//   );

//   // --------------------------
//   // Simple modal open handlers
//   // --------------------------
//   const openSchemeModal = (preset?: any) => {
//     try {
//       form.reset(defaultFormValues);
//       if (preset) {
//         const incomingTypeVal = preset.schemeType?.value ?? preset.schemeType;
//         if (incomingTypeVal !== undefined && incomingTypeVal !== null) {
//           const matchType = schemeTypes.find(
//             (t) => String(t.value) === String(incomingTypeVal)
//           );
//           if (matchType) preset.schemeType = matchType;
//         }
//         if (preset.schemeGroup) {
//           const incomingGroupVal =
//             preset.schemeGroup?.value ?? preset.schemeGroup;
//           const matchGroup = schemeGroups.find(
//             (g) => String(g.value) === String(incomingGroupVal)
//           );
//           if (matchGroup) preset.schemeGroup = matchGroup;
//           else preset.schemeGroup = null;
//         }
//         form.reset(preset);
//       }
//     } catch {}
//     setModalType("scheme");
//     setModalOpen(true);
//   };

//   const openDisplayModal = (preset?: any) => {
//     // setModalPreset(preset ?? null);
//     try {
//       form.reset(defaultFormValues);
//       if (preset) form.reset(preset);
//     } catch {}
//     setModalType("display");
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setModalType(null);
//     // setModalPreset(null);
//     try {
//       form.reset(defaultFormValues);
//     } catch {}
//   };

//   // Save handlers
//   const saveSchemeForSelected = (data: any) => {
//     selectedRows.forEach((row: any) => {
//       const existing = findSavedEntryForRow(row);
//       const existingData = existing?.data ?? {};
//       const schemeToSave = {
//         ...(existingData.appliedDisplay
//           ? { appliedDisplay: existingData.appliedDisplay }
//           : {}),
//         appliedScheme: data,
//       };
//       // keep branch-code logic intact
//       dispatch(
//         saveScheme({
//           row: {
//             ...row,
//             itemCode: getItemCodeFromRow(row),
//             branchCode: getBranchCodeFromRow(row),
//           },
//           scheme: schemeToSave,
//         })
//       );
//     });
//     closeModal();
//   };

//   const saveDisplayForSelected = (data: any) => {
//     selectedRows.forEach((row: any) => {
//       const existing = findSavedEntryForRow(row);
//       const existingData = existing?.data ?? {};
//       const schemeToSave = {
//         ...(existingData.appliedScheme
//           ? { appliedScheme: existingData.appliedScheme }
//           : {}),
//         appliedDisplay: data,
//       };
//       dispatch(
//         saveScheme({
//           row: {
//             ...row,
//             itemCode: getItemCodeFromRow(row),
//             branchCode: getBranchCodeFromRow(row),
//           },
//           scheme: schemeToSave,
//         })
//       );
//     });
//     closeModal();
//   };

//   // Handlers to open from buttons (use preset if single selection has saved data)
//   const openApplySchemeBulk = () => {
//     const preset =
//       selectedRows.length === 1
//         ? findSavedEntryForRow(selectedRows[0])?.data?.appliedScheme ?? null
//         : null;
//     openSchemeModal(preset);
//   };

//   const openApplyDisplayBulk = () => {
//     const preset =
//       selectedRows.length === 1
//         ? findSavedEntryForRow(selectedRows[0])?.data?.appliedDisplay ?? null
//         : null;
//     openDisplayModal(preset);
//   };

//   // Responsive height effect unchanged
//   useEffect(() => {
//     const calculateTableHeight = () => {
//       const windowHeight = window.innerHeight;
//       const windowWidth = window.innerWidth;
//       const headerHeight = 150;
//       const footerHeight = 10;
//       const bottomSpace = 50;
//       const minHeight = 400;
//       const tabletMinWidth = 768;
//       const tabletMaxWidth = 1024;
//       let calculatedHeight: number;

//       if (windowWidth >= 1200) {
//         calculatedHeight =
//           windowHeight - headerHeight - footerHeight - bottomSpace;
//       } else if (
//         windowWidth >= tabletMinWidth &&
//         windowWidth <= tabletMaxWidth
//       ) {
//         const tabletAdjustment = windowWidth < 900 ? 150 : 100;
//         calculatedHeight =
//           windowHeight - headerHeight - footerHeight - tabletAdjustment;
//       } else {
//         calculatedHeight = windowHeight - headerHeight - footerHeight - 100;
//       }

//       dispatch(setTableHeight(`${Math.max(calculatedHeight, minHeight)}px`));
//     };

//     calculateTableHeight();
//     window.addEventListener("resize", calculateTableHeight);
//     window.addEventListener("orientationchange", calculateTableHeight);
//     return () => {
//       window.removeEventListener("resize", calculateTableHeight);
//       window.removeEventListener("orientationchange", calculateTableHeight);
//     };
//   }, [dispatch]);

//   const handleDrillDown = (e: any) => {
//     const colField =
//       e?.colDef?.field ??
//       (typeof e?.column?.getColId === "function"
//         ? e.column.getColId()
//         : null) ??
//       null;
//     if (colField === "__select__") return;

//     const domEvent = e?.event;
//     if (domEvent && domEvent.target) {
//       const targetEl = domEvent.target as HTMLElement;
//       if (
//         targetEl.closest("button") ||
//         targetEl.closest("a") ||
//         targetEl.closest(".no-drill") ||
//         targetEl.closest('input[type="checkbox"]')
//       ) {
//         return;
//       }
//     }

//     if (!e?.data) return;

//     const dept = e.data.Department ?? "";
//     const branch = e.data["Branch Code"] ?? "";
//     const item = e.data["Item Code"] ?? "";

//     if (activeTab === "department" && dept) {
//       navigate("/dynamictable/1", { state: { department: dept } });
//     } else if (activeTab === "branch" && branch) {
//       navigate("/dynamictable/1", { state: { branchCode: branch } });
//     } else if (activeTab === "item" && item) {
//       navigate("/dynamictable/2", { state: { itemCode: item } });
//     }
//   };

//   const totalSummary = useMemo(() => {
//     if (!currentData.length) return {};

//     const keys = Object.keys(currentData[0]);
//     const totals: Record<string, number> = {};

//     // Define which columns should NOT be summed (text/scheme fields)
//     const excludedKeys = [
//       "Department",
//       "Item Code",
//       "Branch Code",
//       "Item Name",
//       "Category",
//       "Sub Category",
//       "Item Status",
//       "Desc",
//       "Scheme Type",
//       "Scheme Group",
//       "New Scheme Type",
//       "New Scheme Group",
//       "Start Date",
//       "End Date",
//       "Display Type",
//       "Branch Name",
//       "State",
//       "Prev Str Stk",
//       "Stk Diff",
//     ];

//     // Only sum numeric columns that are NOT in excluded list and NOT contribution %
//     keys.forEach((k) => {
//       if (k.includes("Contri")) return;
//       if (excludedKeys.includes(k)) return;

//       totals[k] = 0;
//     });

//     // Sum the allowed columns
//     currentData.forEach((row: any) => {
//       Object.keys(totals).forEach((k) => {
//         const n = toNumber(row[k]);
//         if (!Number.isNaN(n)) {
//           totals[k] += n;
//         }
//       });
//     });

//     // Round all totals
//     Object.keys(totals).forEach((k) => {
//       totals[k] = Math.round(totals[k]);
//     });

//     return totals;
//   }, [currentData]);

//   // Modal content builders (simple, native selects for type & group)
//   const SchemeModalBody = (
//     <FormProvider {...form}>
//       <form onSubmit={form.handleSubmit(saveSchemeForSelected)}>
//         <div className="mb-3 small text-muted">
//           Applying scheme to {selectedRows.length} selected row
//           {selectedRows.length > 1 ? "s" : ""}.
//         </div>

//         <div className="row">
//           {Object.entries(scheme.properties).map(([key, field]) => (
//             <div key={key} className="col-lg-6 col-md-6 mb-3">
//               {renderFieldWrapper(field as any, key)}
//             </div>
//           ))}
//         </div>
//       </form>
//     </FormProvider>
//   );

//   const DisplayModalBody = (
//     <FormProvider {...form}>
//       <form onSubmit={form.handleSubmit(saveDisplayForSelected)}>
//         <div className="mb-3 small text-muted">
//           Applying display to {selectedRows.length} selected row
//           {selectedRows.length > 1 ? "s" : ""}.
//         </div>
//         <div className="row">
//           {Object.entries(display.properties).map(([key, field]) => (
//             <div key={key} className="col-lg-12 col-md-12 mb-3">
//               {renderFieldWrapper(field as any, key)}
//             </div>
//           ))}
//         </div>
//       </form>
//     </FormProvider>
//   );

//   // modal footer buttons
//   const modalFooter =
//     modalType === "scheme" ? (
//       <>
//         <button
//           type="button"
//           className="btn btn-secondary"
//           onClick={closeModal}
//         >
//           Close
//         </button>
//         <button
//           type="button"
//           className="btn btn-primary"
//           onClick={() => form.handleSubmit(saveSchemeForSelected)()}
//         >
//           Save
//         </button>
//       </>
//     ) : modalType === "display" ? (
//       <>
//         <button
//           type="button"
//           className="btn btn-secondary"
//           onClick={closeModal}
//         >
//           Close
//         </button>
//         <button
//           type="button"
//           className="btn btn-primary"
//           onClick={() => form.handleSubmit(saveDisplayForSelected)()}
//         >
//           Save
//         </button>
//       </>
//     ) : null;

//   // RENDER
//   return (
//     <Wrapper header="Summaries" subHeader="Report" ExportR={1}>
//       <div className="mb-3">
//         {loading && <CenteredLoader />}

//         {/* Tabs */}
//         <ul className="nav nav-tabs mb-1 pb-1">
//           {(
//             ["department", "branch", "item", "comparison", "scomp"] as const
//           ).map((tab) => {
//             const labels = {
//               department: "Department-wise summary",
//               branch: "Branch-wise summary",
//               item: "Item-wise summary & schemes",
//               comparison: "Item-wise Stock Comparison",
//               scomp: "Item & Branch-wise Stock Comparison",
//             };
//             return (
//               <li className="nav-item" key={tab}>
//                 <button
//                   className={`nav-link px-4 py-2 rounded-top ${
//                     activeTab === tab
//                       ? "active fw-semibold text-primary border-primary"
//                       : "text-muted"
//                   }`}
//                   onClick={() => dispatch(setActiveTab(tab as any))}
//                   style={{
//                     border: "none",
//                     backgroundColor: "transparent",
//                     borderBottom:
//                       activeTab === tab
//                         ? "2px solid #0d6efd"
//                         : "2px solid transparent",
//                   }}
//                 >
//                   {labels[tab]}
//                 </button>
//               </li>
//             );
//           })}
//         </ul>
//         {/* Top bulk controls for item tab */}
//         {activeTab === "item" && (
//           <div className="d-flex gap-2 mb-2 align-items-center">
//             <div className="small text-muted me-2">
//               Selected: <strong>{selectedRows.length}</strong>
//             </div>
//             <button
//               type="button"
//               className="btn btn-sm btn-outline-primary"
//               disabled={selectedRows.length === 0}
//               onClick={openApplySchemeBulk}
//             >
//               Apply Scheme
//             </button>
//             <button
//               type="button"
//               className="btn btn-sm btn-outline-secondary"
//               disabled={selectedRows.length === 0}
//               onClick={openApplyDisplayBulk}
//             >
//               Apply Display
//             </button>
//           </div>
//         )}

//         {/* Active Count + Total Summary */}
//         {!loading && !error && currentData.length > 0 && (
//           <div className="d-flex flex-wrap gap-2 mb-1 align-items-center">
//             <span
//               className="badge bg-primary text-white px-3 py-2 rounded-2 fw-medium"
//               style={{ fontSize: "0.92rem" }}
//             >
//               {activeTab === "department"
//                 ? `${departmentSummaries.length} Department${
//                     departmentSummaries.length !== 1 ? "s" : ""
//                   }`
//                 : activeTab === "branch"
//                 ? `${summaries.length} Branch${
//                     summaries.length !== 1 ? "es" : ""
//                   }`
//                 : activeTab === "item"
//                 ? `${itemsSummaries.length} Item${
//                     itemsSummaries.length !== 1 ? "s" : ""
//                   }`
//                 : activeTab === "comparison"
//                 ? `${compSummaries.length} Item${
//                     compSummaries.length !== 1 ? "s" : ""
//                   }`
//                 : `${bSummaries.length} Item${
//                     bSummaries.length !== 1 ? "s" : ""
//                   }`}
//             </span>

//             {Object.entries(totalSummary).map(([key, value]) => {
//               if (key.includes("Contri")) return null;
//               return (
//                 <span
//                   key={key}
//                   className="badge bg-light text-dark border px-3 py-2 fw-medium"
//                   style={{ fontSize: "0.875rem" }}
//                   title={toTitleCase(key)}
//                 >
//                   <strong>{toTitleCase(key)}:</strong>{" "}
//                   {value.toLocaleString("en-IN")}
//                 </span>
//               );
//             })}
//           </div>
//         )}

//         {/* Loading / Error */}
//         {(loading || error) && (
//           <div className="mb-3">
//             <span
//               className={`badge px-3 py-2 rounded-2 ${
//                 loading ? "bg-info text-white" : "bg-danger text-white"
//               }`}
//               style={{ fontSize: "0.92rem", fontWeight: 500 }}
//             >
//               {loading ? "Loading data..." : "Failed to load data"}
//             </span>
//           </div>
//         )}

//         {/* Scheme Options Error */}
//         {schemeOptionsError && (
//           <div className="alert alert-warning small">
//             Warning: {schemeOptionsError}
//           </div>
//         )}

//         {/* Empty */}
//         {!loading && !error && currentData.length === 0 && (
//           <div className="text-center py-4 text-muted">
//             No data available for the selected view.
//           </div>
//         )}

//         {/* Table */}
//         {!loading && !error && currentData.length > 0 && (
//           <div className="border rounded-2 overflow-hidden shadow-sm">
//             <GridTable
//               rowData={currentData}
//               columnDefs={displayedColumnDefs}
//               enableEditing={false}
//               enableSelection={activeTab === "item" ? true : false}
//               height={tableHeight}
//               onRowClick={enable != 1 && (handleDrillDown as any)}
//               reportHeader={`Phase_3_${activeTab}_Summary`}
//               selectedRowsHandler={selectedRowsHandler}
//             />
//           </div>
//         )}

//         {/* Simple modal */}
//         <SimpleModal
//           show={modalOpen}
//           title={
//             modalType === "scheme"
//               ? `Apply Scheme to ${selectedRows.length} item${
//                   selectedRows.length > 1 ? "s" : ""
//                 }`
//               : modalType === "display"
//               ? `Apply Display to ${selectedRows.length} item${
//                   selectedRows.length > 1 ? "s" : ""
//                 }`
//               : ""
//           }
//           size="lg"
//           onClose={closeModal}
//           footer={modalFooter}
//         >
//           {modalType === "scheme"
//             ? SchemeModalBody
//             : modalType === "display"
//             ? DisplayModalBody
//             : null}
//         </SimpleModal>
//       </div>
//     </Wrapper>
//   );
// };

// export default Phase3Page;

import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Wrapper from "../../common/uicomponent/wrapper";
import GridTable from "../../common/component/GridTable";
import CenteredLoader from "../../common/component/CenteredLoader";
import { toNumber, toTitleCase } from "./helperfunc";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import {
  setActiveTab,
  setTableHeight,
  saveScheme,
  // removeSavedSchemeByItemCode,
} from "../../redux/phase3Slice";
import {
  fetchSchemeTypes,
  fetchSchemeGroups,
  clearSchemeGroups,
} from "../../redux/schemeOptionsSlice";
import { FormProvider, useForm } from "react-hook-form";
import scheme, { display } from "../../core/json/scheme";
import { renderField } from "../../common/utils/renderField";
// import useFetch from "../../hooks/useFetch";

const SimpleModal: React.FC<{
  show: boolean;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  onClose: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ show, title, size = "md", onClose, footer, children }) => {
  if (!show) return null;
  const dlgClass =
    size === "sm"
      ? "modal-sm"
      : size === "lg"
      ? "modal-lg"
      : size === "xl"
      ? "modal-xl"
      : "";
  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className={`modal-dialog ${dlgClass} modal-dialog-centered`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

const Phase3Page: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // --- Phase 3 Selectors ---
  const summaries = useSelector((s: RootState) => s.phase3.summaries);
  const departmentSummaries = useSelector(
    (s: RootState) => s.phase3.departmentSummaries
  );
  const savedSchemes = useSelector((s: RootState) => s.phase3.savedSchemes);
  const itemsSummaries = useSelector((s: RootState) => s.phase3.itemSummaries);
  const compSummaries = useSelector(
    (s: RootState) => s.phase3.comparisonSummaries
  );
  const bSummaries = useSelector(
    (s: RootState) => s.phase3.branchSchemeSummaries
  );
  // console.log("summaries", summaries);
  const loading = useSelector((s: RootState) => s.phase3.loading);
  const error = useSelector((s: RootState) => s.phase3.error);
  const activeTab = useSelector((s: RootState) => s.phase3.activeTab);
  const tableHeight = useSelector((s: RootState) => s.phase3.tableHeight);

  // --- Scheme Options Selectors ---
  const {
    types: rawSchemeTypes,
    groups: rawSchemeGroups,
    loadingTypes,
    loadingGroups,
    error: schemeOptionsError,
  } = useSelector((s: RootState) => s.schemeOptions);

  // --- simple modal state ---
  const [modalType, setModalType] = useState<
    null | "scheme" | "display" | "rowview"
  >(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewRowData, setViewRowData] = useState<any | null>(null);
  console.log("viewRowData", viewRowData);
  // --- Form ---
  const form = useForm<any>({
    mode: "onBlur",
    defaultValues: {
      startDate: null,
      endDate: null,
      schemeType: null,
      schemeGroup: null,
      displayType: null,
    },
  });
  const defaultFormValues = {
    startDate: null,
    endDate: null,
    schemeType: null,
    schemeGroup: null,
    displayType: null,
  };

  const selectedSchemeType = form.watch("schemeType");

  const { enable } = useMemo(() => {
    const state = (location as any)?.state ?? {};
    return {
      enable: state.enable ?? 0,
      bucket: state.bucket ?? null,
    };
  }, [location]);

  // fetch scheme types when mounted
  useEffect(() => {
    dispatch(fetchSchemeTypes() as any);
  }, [dispatch]);

  // when scheme type changes fetch groups
  useEffect(() => {
    const id = (selectedSchemeType &&
      (selectedSchemeType.value ?? selectedSchemeType)) as
      | number
      | string
      | undefined;
    if (id) {
      try {
        form.setValue("schemeGroup", null);
      } catch {}
      dispatch(fetchSchemeGroups(Number(id)) as any);
    } else {
      dispatch(clearSchemeGroups());
      try {
        form.setValue("schemeGroup", null);
      } catch {}
    }
  }, [selectedSchemeType, dispatch, form]);

  // normalize raw scheme types and groups
  const schemeTypes = useMemo(() => {
    if (!Array.isArray(rawSchemeTypes)) return [];
    return rawSchemeTypes.map((t: any) => {
      const value =
        t?.value ?? t?.id ?? t?.type_id ?? t?.code ?? t?.key ?? t?.name ?? "";
      const label = t?.label ?? t?.name ?? t?.type_name ?? String(value);
      return { value: String(value), label: String(label), __raw: t };
    });
  }, [rawSchemeTypes]);

  const schemeGroups = useMemo(() => {
    if (!Array.isArray(rawSchemeGroups)) return [];
    return rawSchemeGroups.map((g: any) => {
      const value =
        g?.value ??
        g?.id ??
        g?.group_id ??
        g?.scheme_group_id ??
        g?.code ??
        g?.key ??
        g?.name ??
        "";
      const label =
        g?.label ?? g?.name ?? g?.group_name ?? g?.title ?? String(value);
      return { value: String(value), label: String(label), __raw: g };
    });
  }, [rawSchemeGroups]);

  // force remount key for group select
  const [schemeGroupKey, setSchemeGroupKey] = useState(0);
  useEffect(() => {
    setSchemeGroupKey((k) => k + 1);
  }, [schemeGroups.length]);

  // helpers to extract codes
  const getItemCodeFromRow = useCallback((row: any): string | undefined => {
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
  }, []);

  const getBranchCodeFromRow = useCallback((row: any): string | undefined => {
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
  }, []);

  const findSavedEntryForRow = useCallback(
    (row: any) => {
      const itemCode = getItemCodeFromRow(row);
      const branchCode = getBranchCodeFromRow(row);
      if (itemCode) {
        if (branchCode) {
          return savedSchemes.find(
            (s: any) =>
              String(s.itemCode ?? "")
                .trim()
                .toLowerCase() === String(itemCode).trim().toLowerCase() &&
              String(s.branchCode ?? "")
                .trim()
                .toLowerCase() === String(branchCode).trim().toLowerCase()
          );
        }
        const global = savedSchemes.find(
          (s: any) =>
            String(s.itemCode ?? "")
              .trim()
              .toLowerCase() === String(itemCode).trim().toLowerCase() &&
            (s.branchCode === undefined || s.branchCode === null)
        );
        return global;
      }
      try {
        const rowJson = JSON.stringify(row || {});
        return savedSchemes.find(
          (s: any) => JSON.stringify(s.data) === rowJson
        );
      } catch {
        return undefined;
      }
    },
    [savedSchemes, getItemCodeFromRow, getBranchCodeFromRow]
  );

  // data transforms (unchanged)
  const departmentData = useMemo(
    () =>
      departmentSummaries.map((d: any) => ({
        Department: d?.department,
        "Str Stk": Math.round(d?.total_site_quantity || 0),
        "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
        "Sale Qty": Math.round(d?.total_sale_quantity || 0),
        "Sale Val": Math.round(d?.total_sale_value || 0),
        "Ttl Mrgn": Math.round(d?.total_ttl_mrgn_value || 0),
        "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
        "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
      })),
    [departmentSummaries]
  );

  const branchData = useMemo(
    () =>
      summaries.map((d: any) => ({
        "Branch Code": d?.branch_code,
        "Branch Name": d?.branch_name,
        State: d?.state,
        "Str Stk": Math.round(d?.total_site_quantity || 0),
        "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
        "Sale Qty": Math.round(d?.total_sale_quantity || 0),
        "Sale Val": Math.round(d?.total_sale_value || 0),
        "Ttl Mrgn": Math.round(d?.total_ttl_mrgn_value || 0),
        "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
        "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
      })),
    [summaries]
  );

  const itemsData = useMemo(
    () =>
      itemsSummaries.map((d: any) => ({
        "Item Code": d?.item_code,
        "Item Name": d?.item_name,
        Department: d?.department,
        Category: d?.category,
        "Sub Category": d?.subcategory,
        "Item Status": d?.active_inactive,
        Desc: d?.item_desc,
        "Scheme Type": d?.scheme_type,
        "Scheme Group": d?.scheme_group,
        "Str Stk": Math.round(d?.total_site_quantity || 0),
        "Sale Qty": Math.round(d?.total_sale_quantity || 0),
        "Sale Val": Math.round(d?.total_sale_value || 0),
        "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
        "Ttl Mrgn": Math.round(d?.total_ttl_mrgn_value || 0),
        "Branch Count": d?.branch_count,
        "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
        "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
      })),
    [itemsSummaries]
  );

  const comparisonData = useMemo(
    () =>
      compSummaries.map((d: any) => ({
        "Item Code": d?.item_code,
        "Item Name": d?.item_name,
        Department: d?.department,
        Category: d?.category,
        "Sub Category": d?.subcategory,
        "Item Status": d?.active_inactive,
        Desc: d?.item_desc,
        "Scheme Type": d?.scheme_type,
        "Scheme Group": d?.scheme_group,
        "New Scheme Type": d?.newSchemeType,
        "New Scheme Group": d?.newSchemeGroup,
        "Cur Str Stk": Math.round(d?.total_site_quantity || 0),
        "Prev Str Stk": Math.round(d?.pending_stock || 0),
        "Stk Diff": Math.round(d?.stock_difference || 0),
        "Sale Qty": Math.round(d?.total_sale_quantity || 0),
        "Applied Filter": d?.scheme_dynamic_data,

        "Sale Val": Math.round(d?.total_sale_value || 0),
        "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
        // "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
        // "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
      })),
    [compSummaries]
  );
  const branchComparisonData = useMemo(
    () =>
      bSummaries.map((d: any) => ({
        "Item Code": d?.item_code,
        "Item Name": d?.item_name,
        "Branch Code": d?.branch_code,
        "Branch Name": d?.branch_name,
        Department: d?.department,
        Category: d?.category,
        "Sub Category": d?.subcategory,
        "Item Status": d?.active_inactive,
        Desc: d?.item_desc,
        "Scheme Type": d?.scheme_type,
        "Scheme Group": d?.scheme_group,
        "New Scheme Type": d?.newSchemeType,
        "New Scheme Group": d?.newSchemeGroup,
        "Cur Str Stk": Math.round(d?.total_site_quantity || 0),
        "Applied Filter": d?.scheme_dynamic_data,
        "Prev Str Stk": Math.round(d?.pending_stock || 0),
        "Stk Diff": Math.round(d?.stock_difference || 0),
        "Sale Qty": Math.round(d?.total_sale_quantity || 0),
        "Sale Val": Math.round(d?.total_sale_value || 0),
        "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
        // "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
        // "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
      })),
    [bSummaries]
  );

  const makeCols = useCallback(
    (data: any[]) => {
      if (!data.length) return [];
      const first = data[0];
      const allKeys = Object.keys(first);
      const totalColumns = allKeys.length;
      const defaultFlex = totalColumns <= 8 ? 1 : 0;

      // Define which columns should be pinned to the right in Comparison tab
      const rightPinnedInComparison = [
        "Cur Str Stk",
        "Prev Str Stk",
        "Stk Diff",
      ];

      const cols = allKeys.map((k) => {
        const isContriColumn = k === "Stk Qty Contri" || k === "Stk Val Contri";
        const isComparisonKeyColumn = rightPinnedInComparison.includes(k);

        // Only apply right-pinning logic in comparison tab
        const shouldPinRight =
          isContriColumn ||
          ((activeTab === "comparison" || activeTab === "scomp") &&
            isComparisonKeyColumn);

        return {
          field: k,
          headerName: toTitleCase(k),
          sortable: true,
          resizable: true,
          filter:
            typeof first[k] === "string"
              ? "agTextColumnFilter"
              : "agNumberColumnFilter",
          pinned: shouldPinRight ? "right" : null,
          width: shouldPinRight ? 140 : undefined,
          lockPosition: shouldPinRight,
          cellStyle: shouldPinRight ? { textAlign: "right" } : undefined,
          flex: shouldPinRight ? 0 : defaultFlex,
          valueFormatter: isContriColumn
            ? (params: any) => {
                const val = params.value;
                if (val == null) return "";
                const num = parseFloat(val.replace("%", "").trim());
                return isNaN(num) ? val : `${num.toFixed(2)}%`;
              }
            : undefined,
          getQuickFilterText: isContriColumn
            ? (params: any) => {
                const val = params.value;
                return val
                  ? parseFloat(val.replace("%", "").trim()).toString()
                  : "";
              }
            : undefined,
          comparator: isContriColumn
            ? (a: any, b: any) => {
                const numA = parseFloat((a || "").replace("%", "").trim()) || 0;
                const numB = parseFloat((b || "").replace("%", "").trim()) || 0;
                return numA - numB;
              }
            : undefined,
        };
      });

      return cols;
    },
    [activeTab]
  );

  const deptColumnDefs = useMemo(
    () => makeCols(departmentData),
    [departmentData, makeCols]
  );
  const branchColumnDefs = useMemo(
    () => makeCols(branchData),
    [branchData, makeCols]
  );
  const itemColumnDefs = useMemo(
    () => makeCols(itemsData),
    [itemsData, makeCols]
  );
  const comparisonColumnDefs = useMemo(
    () => makeCols(comparisonData),
    [comparisonData, makeCols]
  );
  const bcomparisonColumnDefs = useMemo(
    () => makeCols(branchComparisonData),
    [comparisonData, makeCols]
  );
  const currentData: any =
    activeTab === "branch"
      ? branchData
      : activeTab === "department"
      ? departmentData
      : activeTab === "item"
      ? itemsData
      : activeTab === "comparison"
      ? comparisonData
      : branchComparisonData;

  const currentColumnDefs: any =
    activeTab === "branch"
      ? branchColumnDefs
      : activeTab === "department"
      ? deptColumnDefs
      : activeTab === "item"
      ? itemColumnDefs
      : activeTab === "comparison"
      ? comparisonColumnDefs
      : bcomparisonColumnDefs;

  // displayedColumnDefs: add checkbox only for item view and only for rows without applied scheme
  const displayedColumnDefs = useMemo(() => {
    const cols: any[] = Array.isArray(currentColumnDefs)
      ? [...currentColumnDefs]
      : [];

    if (activeTab === "item") {
      const hasCheckboxAlready = cols.some(
        (c: any) => c.field === "__select__" || c.checkboxSelection
      );
      if (!hasCheckboxAlready) {
        const checkboxCol = {
          field: "__select__",
          headerName: "",
          width: 48,
          pinned: "left",
          lockPosition: true,
          suppressSizeToFit: true,
          sortable: false,
          filter: false,
          resizable: false,
          // per-row checkbox: only when row doesn't have appliedScheme
          checkboxSelection: (params: any) => {
            try {
              const row = params?.data;
              const saved = findSavedEntryForRow(row);
              return !saved?.data?.appliedScheme;
            } catch (e) {
              return true;
            }
          },
          // don't show header checkbox since not all rows are selectable
          headerCheckboxSelection: false,
          cellRenderer: () => null,
        };
        cols.unshift(checkboxCol);
      }
    }

    // Add "Applied Filter" button per row for comparison tabs
    if (activeTab === "comparison" || activeTab === "scomp") {
      const hasAppliedFilter = cols.some(
        (c: any) => c.field === "__applied_filter__"
      );
      if (!hasAppliedFilter) {
        const btnCol = {
          field: "__applied_filter__",
          headerName: "",
          width: 140,
          pinned: "left",
          lockPosition: true,
          suppressSizeToFit: true,
          sortable: false,
          filter: false,
          resizable: false,
          cellRenderer: (params: any) => {
            const row = params?.data;
            // render a bootstrap button; clicking opens modal and shows row data
            return (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => openRowModal(row)}
              >
                Applied Filter
              </button>
            );
          },
        };
        cols.unshift(btnCol);
      }
    }

    return cols;
  }, [currentColumnDefs, activeTab, findSavedEntryForRow]);

  // selected rows
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const selectedRowsHandler = (data: any) => {
    setSelectedRows(data);
  };

  // open row modal
  const openRowModal = useCallback((row: any) => {
    setViewRowData(row ?? null);
    setModalType("rowview");
    setModalOpen(true);
  }, []);

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    setViewRowData(null);
    // setModalPreset(null);
    try {
      form.reset(defaultFormValues);
    } catch {}
  };

  // Render fallback field wrapper (keeps your renderField usage)
  const selectOptions = useMemo(() => {
    const addKeys = (acc: any, keyBase: string, arr: any[]) => {
      const camel = keyBase;
      const snake = keyBase.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
      const alt1 = keyBase + "Id";
      const alt1Snake = alt1.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
      acc[camel] = arr;
      acc[snake] = arr;
      acc[alt1] = arr;
      acc[alt1Snake] = arr;
      return acc;
    };
    const base: any = {};
    addKeys(base, "schemeType", schemeTypes);
    addKeys(base, "schemeGroup", schemeGroups);
    addKeys(base, "displayType", [
      { value: "Send Shelf Picture", label: "Send Shelf Picture" },
    ]);
    return base;
  }, [schemeTypes, schemeGroups]);

  const renderFieldWrapper = useCallback(
    (field: any, key: string) => {
      const name = (field?.props?.name ?? "") as string;
      const options = selectOptions[name] ?? [];
      if (
        (name === "schemeType" && loadingTypes) ||
        (name === "schemeGroup" && loadingGroups) ||
        (name === "scheme_group" && loadingGroups)
      ) {
        return (
          <div key={key} className="p-2">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        );
      }

      const fieldKey =
        name === "schemeGroup" || name === "scheme_group"
          ? `${key}-${schemeGroupKey}-${options.length}`
          : key;

      return renderField({
        field,
        form,
        options,
        key: fieldKey,
      });
    },
    [form, selectOptions, loadingTypes, loadingGroups, schemeGroupKey]
  );

  // --------------------------
  // Simple modal open handlers
  // --------------------------
  const openSchemeModal = (preset?: any) => {
    try {
      form.reset(defaultFormValues);
      if (preset) {
        const incomingTypeVal = preset.schemeType?.value ?? preset.schemeType;
        if (incomingTypeVal !== undefined && incomingTypeVal !== null) {
          const matchType = schemeTypes.find(
            (t) => String(t.value) === String(incomingTypeVal)
          );
          if (matchType) preset.schemeType = matchType;
        }
        if (preset.schemeGroup) {
          const incomingGroupVal =
            preset.schemeGroup?.value ?? preset.schemeGroup;
          const matchGroup = schemeGroups.find(
            (g) => String(g.value) === String(incomingGroupVal)
          );
          if (matchGroup) preset.schemeGroup = matchGroup;
          else preset.schemeGroup = null;
        }
        form.reset(preset);
      }
    } catch {}
    setModalType("scheme");
    setModalOpen(true);
  };

  const openDisplayModal = (preset?: any) => {
    // setModalPreset(preset ?? null);
    try {
      form.reset(defaultFormValues);
      if (preset) form.reset(preset);
    } catch {}
    setModalType("display");
    setModalOpen(true);
  };

  // Save handlers
  const saveSchemeForSelected = (data: any) => {
    selectedRows.forEach((row: any) => {
      const existing = findSavedEntryForRow(row);
      const existingData = existing?.data ?? {};
      const schemeToSave = {
        ...(existingData.appliedDisplay
          ? { appliedDisplay: existingData.appliedDisplay }
          : {}),
        appliedScheme: data,
      };
      // keep branch-code logic intact
      dispatch(
        saveScheme({
          row: {
            ...row,
            itemCode: getItemCodeFromRow(row),
            branchCode: getBranchCodeFromRow(row),
          },
          scheme: schemeToSave,
        })
      );
    });
    closeModal();
  };

  const saveDisplayForSelected = (data: any) => {
    selectedRows.forEach((row: any) => {
      const existing = findSavedEntryForRow(row);
      const existingData = existing?.data ?? {};
      const schemeToSave = {
        ...(existingData.appliedScheme
          ? { appliedScheme: existingData.appliedScheme }
          : {}),
        appliedDisplay: data,
      };
      dispatch(
        saveScheme({
          row: {
            ...row,
            itemCode: getItemCodeFromRow(row),
            branchCode: getBranchCodeFromRow(row),
          },
          scheme: schemeToSave,
        })
      );
    });
    closeModal();
  };

  // Handlers to open from buttons (use preset if single selection has saved data)
  const openApplySchemeBulk = () => {
    const preset =
      selectedRows.length === 1
        ? findSavedEntryForRow(selectedRows[0])?.data?.appliedScheme ?? null
        : null;
    openSchemeModal(preset);
  };

  const openApplyDisplayBulk = () => {
    const preset =
      selectedRows.length === 1
        ? findSavedEntryForRow(selectedRows[0])?.data?.appliedDisplay ?? null
        : null;
    openDisplayModal(preset);
  };

  // Responsive height effect unchanged
  useEffect(() => {
    const calculateTableHeight = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const headerHeight = 150;
      const footerHeight = 10;
      const bottomSpace = 50;
      const minHeight = 400;
      const tabletMinWidth = 768;
      const tabletMaxWidth = 1024;
      let calculatedHeight: number;

      if (windowWidth >= 1200) {
        calculatedHeight =
          windowHeight - headerHeight - footerHeight - bottomSpace;
      } else if (
        windowWidth >= tabletMinWidth &&
        windowWidth <= tabletMaxWidth
      ) {
        const tabletAdjustment = windowWidth < 900 ? 150 : 100;
        calculatedHeight =
          windowHeight - headerHeight - footerHeight - tabletAdjustment;
      } else {
        calculatedHeight = windowHeight - headerHeight - footerHeight - 100;
      }

      dispatch(setTableHeight(`${Math.max(calculatedHeight, minHeight)}px`));
    };

    calculateTableHeight();
    window.addEventListener("resize", calculateTableHeight);
    window.addEventListener("orientationchange", calculateTableHeight);
    return () => {
      window.removeEventListener("resize", calculateTableHeight);
      window.removeEventListener("orientationchange", calculateTableHeight);
    };
  }, [dispatch]);

  const handleDrillDown = (e: any) => {
    const colField =
      e?.colDef?.field ??
      (typeof e?.column?.getColId === "function"
        ? e.column.getColId()
        : null) ??
      null;
    if (colField === "__select__") return;

    const domEvent = e?.event;
    if (domEvent && domEvent.target) {
      const targetEl = domEvent.target as HTMLElement;
      if (
        targetEl.closest("button") ||
        targetEl.closest("a") ||
        targetEl.closest(".no-drill") ||
        targetEl.closest('input[type="checkbox"]')
      ) {
        return;
      }
    }

    if (!e?.data) return;

    const dept = e.data.Department ?? "";
    const branch = e.data["Branch Code"] ?? "";
    const item = e.data["Item Code"] ?? "";

    if (activeTab === "department" && dept) {
      navigate("/dynamictable/1", { state: { department: dept } });
    } else if (activeTab === "branch" && branch) {
      navigate("/dynamictable/1", { state: { branchCode: branch } });
    } else if (activeTab === "item" && item) {
      navigate("/dynamictable/2", { state: { itemCode: item } });
    }
  };

  const totalSummary = useMemo(() => {
    if (!currentData.length) return {};

    const keys = Object.keys(currentData[0]);
    const totals: Record<string, number> = {};

    // Define which columns should NOT be summed (text/scheme fields)
    const excludedKeys = [
      "Department",
      "Item Code",
      "Branch Code",
      "Item Name",
      "Category",
      "Sub Category",
      "Item Status",
      "Desc",
      "Scheme Type",
      "Scheme Group",
      "New Scheme Type",
      "New Scheme Group",
      "Start Date",
      "End Date",
      "Display Type",
      "Branch Name",
      "State",
      "Prev Str Stk",
      "Stk Diff",
    ];

    // Only sum numeric columns that are NOT in excluded list and NOT contribution %
    keys.forEach((k) => {
      if (k.includes("Contri")) return;
      if (excludedKeys.includes(k)) return;

      totals[k] = 0;
    });

    // Sum the allowed columns
    currentData.forEach((row: any) => {
      Object.keys(totals).forEach((k) => {
        const n = toNumber(row[k]);
        if (!Number.isNaN(n)) {
          totals[k] += n;
        }
      });
    });

    // Round all totals
    Object.keys(totals).forEach((k) => {
      totals[k] = Math.round(totals[k]);
    });

    return totals;
  }, [currentData]);

  // Modal content builders (simple, native selects for type & group)
  const SchemeModalBody = (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(saveSchemeForSelected)}>
        <div className="mb-3 small text-muted">
          Applying scheme to {selectedRows.length} selected row
          {selectedRows.length > 1 ? "s" : ""}.
        </div>

        <div className="row">
          {Object.entries(scheme.properties).map(([key, field]) => (
            <div key={key} className="col-lg-6 col-md-6 mb-3">
              {renderFieldWrapper(field as any, key)}
            </div>
          ))}
        </div>
      </form>
    </FormProvider>
  );

  const DisplayModalBody = (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(saveDisplayForSelected)}>
        <div className="mb-3 small text-muted">
          Applying display to {selectedRows.length} selected row
          {selectedRows.length > 1 ? "s" : ""}.
        </div>
        <div className="row">
          {Object.entries(display.properties).map(([key, field]) => (
            <div key={key} className="col-lg-12 col-md-12 mb-3">
              {renderFieldWrapper(field as any, key)}
            </div>
          ))}
        </div>
      </form>
    </FormProvider>
  );

  // Row view modal body: show key/value pairs for the clicked row
  // const RowViewModalBody = (
  //   <div>
  //     {!viewRowData ? (
  //       <div className="text-muted">No data</div>
  //     ) : (
  //       <div className="table-responsive">
  //         {viewRowData["Applied Filter"]}
  //         {/* <table className="table table-sm table-borderless mb-0">
  //           <tbody>
  //             {Object.entries(viewRowData).map(([k, v]) => (
  //               <tr key={k}>
  //                 <th style={{ width: 180, verticalAlign: "top" }}>
  //                   {toTitleCase(k)}
  //                 </th>
  //                 <td style={{ whiteSpace: "pre-wrap" }}>{String(v ?? "")}</td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table> */}
  //       </div>
  //     )}
  //   </div>
  // );
  const RowViewModalBody = (
    <div>
      {!viewRowData ? (
        <div className="text-muted">No data</div>
      ) : (
        <div className="table-responsive">
          {viewRowData["Applied Filter"] && (
            <div className="bg-dark text-white p-4 rounded-lg w-100 font-monospace">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex gap-2">
                  <div
                    className="rounded-circle bg-danger"
                    style={{ width: "12px", height: "12px" }}
                  ></div>
                  <div
                    className="rounded-circle bg-warning"
                    style={{ width: "12px", height: "12px" }}
                  ></div>
                  <div
                    className="rounded-circle bg-success"
                    style={{ width: "12px", height: "12px" }}
                  ></div>
                </div>
                <p className="mb-0 small text-muted">bash</p>
              </div>
              <div className="mt-3">
                {(() => {
                  try {
                    const parsed = JSON.parse(viewRowData["Applied Filter"]);
                    const filters = parsed._applied_filters || {};

                    return (
                      <div>
                        {/* <p className="text-success mb-1">$ Applied filters</p> */}
                        <div className="mb-1" style={{ fontSize: "0.85rem" }}>
                          {Object.entries(filters).map(([key, value]) => (
                            <div key={key} className="mb-1">
                              <span className="text-info">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                        {/* <p className="text-success mb-0">$</p> */}
                      </div>
                    );
                  } catch (e) {
                    return (
                      <div>
                        <p className="text-success mb-1">$ show filters</p>
                        <p className="text-white mb-1">
                          {viewRowData["Applied Filter"]}
                        </p>
                        <p className="text-success mb-0">$</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
  // modal footer buttons
  const modalFooter =
    modalType === "scheme" ? (
      <>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={closeModal}
        >
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => form.handleSubmit(saveSchemeForSelected)()}
        >
          Save
        </button>
      </>
    ) : modalType === "display" ? (
      <>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={closeModal}
        >
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => form.handleSubmit(saveDisplayForSelected)()}
        >
          Save
        </button>
      </>
    ) : (
      <>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={closeModal}
        >
          Close
        </button>
      </>
    );

  // RENDER
  return (
    <Wrapper header="Summaries" subHeader="Report" ExportR={1}>
      <div className="mb-3">
        {loading && <CenteredLoader />}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-1 pb-1">
          {(
            ["department", "branch", "item", "comparison", "scomp"] as const
          ).map((tab) => {
            const labels: any = {
              department: "Department-wise summary",
              branch: "Branch-wise summary",
              item: "Item-wise summary & schemes",
              comparison: "Item-wise Stock Comparison",
              scomp: "Item & Branch-wise Stock Comparison",
            };
            return (
              <li className="nav-item" key={tab}>
                <button
                  className={`nav-link px-4 py-2 rounded-top ${
                    activeTab === tab
                      ? "active fw-semibold text-primary border-primary"
                      : "text-muted"
                  }`}
                  onClick={() => dispatch(setActiveTab(tab as any))}
                  style={{
                    border: "none",
                    backgroundColor: "transparent",
                    borderBottom:
                      activeTab === tab
                        ? "2px solid #0d6efd"
                        : "2px solid transparent",
                  }}
                >
                  {labels[tab]}
                </button>
              </li>
            );
          })}
        </ul>
        {/* Top bulk controls for item tab */}
        {activeTab === "item" && (
          <div className="d-flex gap-2 mb-2 align-items-center">
            <div className="small text-muted me-2">
              Selected: <strong>{selectedRows.length}</strong>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              disabled={selectedRows.length === 0}
              onClick={openApplySchemeBulk}
            >
              Apply Scheme
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={selectedRows.length === 0}
              onClick={openApplyDisplayBulk}
            >
              Apply Display
            </button>
          </div>
        )}

        {/* Active Count + Total Summary */}
        {!loading && !error && currentData.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-1 align-items-center">
            <span
              className="badge bg-primary text-white px-3 py-2 rounded-2 fw-medium"
              style={{ fontSize: "0.92rem" }}
            >
              {activeTab === "department"
                ? `${departmentSummaries.length} Department${
                    departmentSummaries.length !== 1 ? "s" : ""
                  }`
                : activeTab === "branch"
                ? `${summaries.length} Branch${
                    summaries.length !== 1 ? "es" : ""
                  }`
                : activeTab === "item"
                ? `${itemsSummaries.length} Item${
                    itemsSummaries.length !== 1 ? "s" : ""
                  }`
                : activeTab === "comparison"
                ? `${compSummaries.length} Item${
                    compSummaries.length !== 1 ? "s" : ""
                  }`
                : `${bSummaries.length} Item${
                    bSummaries.length !== 1 ? "s" : ""
                  }`}
            </span>

            {Object.entries(totalSummary).map(([key, value]) => {
              if (key.includes("Contri")) return null;
              return (
                <span
                  key={key}
                  className="badge bg-light text-dark border px-3 py-2 fw-medium"
                  style={{ fontSize: "0.875rem" }}
                  title={toTitleCase(key)}
                >
                  <strong>{toTitleCase(key)}:</strong>{" "}
                  {value.toLocaleString("en-IN")}
                </span>
              );
            })}
          </div>
        )}

        {/* Loading / Error */}
        {(loading || error) && (
          <div className="mb-3">
            <span
              className={`badge px-3 py-2 rounded-2 ${
                loading ? "bg-info text-white" : "bg-danger text-white"
              }`}
              style={{ fontSize: "0.92rem", fontWeight: 500 }}
            >
              {loading ? "Loading data..." : "Failed to load data"}
            </span>
          </div>
        )}

        {/* Scheme Options Error */}
        {schemeOptionsError && (
          <div className="alert alert-warning small">
            Warning: {schemeOptionsError}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && currentData.length === 0 && (
          <div className="text-center py-4 text-muted">
            No data available for the selected view.
          </div>
        )}

        {/* Table */}
        {!loading && !error && currentData.length > 0 && (
          <div className="border rounded-2 overflow-hidden shadow-sm">
            <GridTable
              rowData={currentData}
              columnDefs={displayedColumnDefs}
              enableEditing={false}
              enableSelection={activeTab === "item" ? true : false}
              height={tableHeight}
              onRowClick={enable != 1 && (handleDrillDown as any)}
              reportHeader={`Phase_3_${activeTab}_Summary`}
              selectedRowsHandler={selectedRowsHandler}
            />
          </div>
        )}

        {/* Simple modal */}
        <SimpleModal
          show={modalOpen}
          title={
            modalType === "scheme"
              ? `Apply Scheme to ${selectedRows.length} item${
                  selectedRows.length > 1 ? "s" : ""
                }`
              : modalType === "display"
              ? `Apply Display to ${selectedRows.length} item${
                  selectedRows.length > 1 ? "s" : ""
                }`
              : modalType === "rowview"
              ? `Applied Filter`
              : ""
          }
          size="lg"
          onClose={closeModal}
          footer={modalFooter}
        >
          {modalType === "scheme"
            ? SchemeModalBody
            : modalType === "display"
            ? DisplayModalBody
            : modalType === "rowview"
            ? RowViewModalBody
            : null}
        </SimpleModal>
      </div>
    </Wrapper>
  );
};

export default Phase3Page;
