// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import Wrapper from "../../common/uicomponent/wrapper";
// import GridTable from "../../common/component/GridTable";
// import { toTitleCase } from "./helperfunc";
// import { useSelector, useDispatch } from "react-redux";
// import CenteredLoader from "../../common/component/CenteredLoader";
// import { FormProvider, useForm } from "react-hook-form";
// import { renderField } from "../../common/utils/renderField";
// import scheme, { display } from "../../core/json/scheme";
// import useSchemeOptions, { Option } from "./useSchemeOptions";
// import { saveScheme } from "../../redux/phase3Slice";

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

// const Pase3DynamicTable: React.FC = () => {
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const savedSchemes = useSelector((s: any) => s.phase3.savedSchemes ?? []);

//   const selectedDepartment = (location.state as any)?.department ?? "";
//   const selectedBranch = (location.state as any)?.branchCode ?? "";
//   const itemCodeFromState = (location.state as any)?.itemCode ?? "";

//   const {
//     data: detailData = [],
//     loading,
//     error,
//   } = useSelector(
//     (state: any) =>
//       state.reportDetail || { data: [], loading: false, error: null }
//   );

//   const [tableHeight, setTableHeight] = useState("550px");
//   const { getSchemeTypes, getSchemeGroups } = useSchemeOptions();

//   const [schemeTypes, setSchemeTypes] = useState<Option[]>([]);
//   const [schemeGroups, setSchemeGroups] = useState<Option[]>([]);
//   const [loadingTypes, setLoadingTypes] = useState(true);
//   const [loadingGroups, setLoadingGroups] = useState(false);

//   // selection state for grid
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);
//   const selectedRowsHandler = (data: any) => setSelectedRows(data || []);

//   // local modal state (non-redux)
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalType, setModalType] = useState<null | "scheme" | "display">(null);

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

//   // load types on mount
//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       setLoadingTypes(true);
//       try {
//         const res = await getSchemeTypes();
//         if (mounted && res?.status === "ok") setSchemeTypes(res.data || []);
//       } catch (e) {
//         console.error("getSchemeTypes", e);
//       } finally {
//         if (mounted) setLoadingTypes(false);
//       }
//     };
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, [getSchemeTypes]);

//   useEffect(() => {
//     if (!selectedSchemeType) {
//       setSchemeGroups([]);
//       try {
//         form.setValue("schemeGroup", null);
//       } catch {}
//       return;
//     }
//     let mounted = true;
//     const load = async () => {
//       setLoadingGroups(true);
//       try {
//         const value = selectedSchemeType.value;
//         const res = await getSchemeGroups(value);
//         if (mounted && res?.status === "ok") setSchemeGroups(res.data || []);
//       } catch (e) {
//         console.error("getSchemeGroups", e);
//         if (mounted) setSchemeGroups([]);
//       } finally {
//         if (mounted) setLoadingGroups(false);
//         try {
//           form.setValue("schemeGroup", null);
//         } catch {}
//       }
//     };
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, [selectedSchemeType, getSchemeGroups, form]);

//   const selectOptions = useMemo(
//     () => ({
//       schemeType: schemeTypes,
//       schemeGroup: schemeGroups,
//       displayType: [
//         { value: "Send Shelf Picture", label: "Send Shelf Picture" },
//       ],
//     }),
//     [schemeTypes, schemeGroups]
//   );

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

//   // helpers
//   const getItemCodeFromRow = useCallback((row: any): string | undefined => {
//     if (!row) return undefined;
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

//   const getBranchCodeFromRow = useCallback(
//     (row: any): string | undefined => {
//       if (selectedBranch && String(selectedBranch).trim() !== "") {
//         return String(selectedBranch).trim();
//       }
//       if (!row) return undefined;
//       const raw =
//         row?.branchCode ??
//         row?.Branch_Code ??
//         row?.BranchCode ??
//         row?.branch_code ??
//         row?.branch ??
//         row?.Branch ??
//         undefined;
//       if (raw === undefined || raw === null) return undefined;
//       const trimmed = String(raw).trim();
//       return trimmed === "" ? undefined : trimmed;
//     },
//     [selectedBranch]
//   );

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
//         return savedSchemes.find((s: any) => {
//           try {
//             return JSON.stringify(s.data) === rowJson;
//           } catch {
//             return false;
//           }
//         });
//       } catch {
//         return undefined;
//       }
//     },
//     [savedSchemes, getItemCodeFromRow, getBranchCodeFromRow]
//   );

//   // totals
//   const totals = useMemo(() => {
//     if (!detailData?.length) {
//       return {
//         totalSiteQty: 0,
//         totalSaleQty: 0,
//         totalSaleVal: 0,
//         totalStockValue: 0,
//       };
//     }
//     return detailData.reduce(
//       (acc: any, row: any) => {
//         const siteQty = row.total_site_qty ?? row.Site_Qtys ?? 0;
//         acc.totalSiteQty += typeof siteQty === "number" ? siteQty : 0;
//         const saleQty = row.Total_Sale_Qty ?? row.total_sale_qty ?? 0;
//         acc.totalSaleQty += typeof saleQty === "number" ? saleQty : 0;
//         const saleVal = row.Total_Sale_Val ?? row.total_sale_val ?? 0;
//         acc.totalSaleVal += typeof saleVal === "number" ? saleVal : 0;
//         const stockVal =
//           row.Str_Stk_Sp_Value ??
//           row.str_stk_sp_value ??
//           row.total_str_stk_sp_value ??
//           0;
//         acc.totalStockValue += typeof stockVal === "number" ? stockVal : 0;
//         return acc;
//       },
//       { totalSiteQty: 0, totalSaleQty: 0, totalSaleVal: 0, totalStockValue: 0 }
//     );
//   }, [detailData]);

//   // base columns
//   const baseColumnDefs = useMemo(() => {
//     if (!detailData?.length) return [];
//     const first = detailData[0];
//     const keys = Object.keys(first);
//     const seen = new Set<string>();
//     return keys
//       .filter((k) => {
//         const lower = k.toLowerCase();
//         if (
//           lower.includes("item") &&
//           (lower.includes("code") || lower.includes("name"))
//         ) {
//           if (seen.has("item_code") || seen.has("item_name")) return false;
//           if (lower.includes("code")) seen.add("item_code");
//           if (lower.includes("name")) seen.add("item_name");
//         }
//         return true;
//       })
//       .map((k) => ({
//         field: k,
//         headerName: toTitleCase(k),
//         filter:
//           typeof first[k] === "string"
//             ? "agTextColumnFilter"
//             : "agNumberColumnFilter",
//         headerClass: "bg-royal-blue text-white",
//         sortable: true,
//         resizable: true,
//       }));
//   }, [detailData]);

//   // displayed columns
//   const displayedColumnDefs = useMemo(() => {
//     const cols: any = [...baseColumnDefs];

//     // checkbox only for item view and only for rows that DON'T have an applied scheme
//     if (id === "2") {
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
//           // show checkbox only when the row does NOT have an applied scheme
//           checkboxSelection: (params: any) => {
//             try {
//               const row = params.data;
//               const saved = findSavedEntryForRow(row);
//               return !saved?.data?.appliedScheme;
//             } catch (e) {
//               return true;
//             }
//           },
//           // disable header checkbox because not all rows are selectable
//           headerCheckboxSelection: false,
//           cellRenderer: (params: any) => null,
//         };
//         cols.unshift(checkboxCol);
//       }
//     }

//     // Per request: removed Scheme and Display columns from the table
//     return cols;
//   }, [baseColumnDefs, id, findSavedEntryForRow]);

//   // responsive height
//   useEffect(() => {
//     const calculateTableHeight = () => {
//       const windowHeight = window.innerHeight;
//       const windowWidth = window.innerWidth;
//       const headerHeight = 100;
//       const footerHeight = 30;
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

//       setTableHeight(`${Math.max(calculatedHeight, minHeight)}px`);
//     };

//     calculateTableHeight();
//     window.addEventListener("resize", calculateTableHeight);
//     window.addEventListener("orientationchange", calculateTableHeight);
//     return () => {
//       window.removeEventListener("resize", calculateTableHeight);
//       window.removeEventListener("orientationchange", calculateTableHeight);
//     };
//   }, []);

//   // drilldown
//   const handleDrillDown = (e: any) => {
//     if (id === "2") return;
//     const code =
//       e?.data?.Item_Code ?? e?.data?.item_code ?? e?.data?.["Item Code"] ?? "";
//     if (code) navigate("/dynamictable/2", { state: { itemCode: code } });
//   };

//   const heading = selectedDepartment
//     ? `Department: ${selectedDepartment}`
//     : selectedBranch
//     ? `Branch: ${selectedBranch}`
//     : `ItemCode: ${itemCodeFromState}`;

//   // --------------------------
//   // modal save handlers (bulk apply)
//   // --------------------------
//   const saveSchemeForSelected = (data: any) => {
//     const targets = selectedRows.length ? selectedRows : []; // if no selection, nothing happens
//     targets.forEach((row: any) => {
//       const existing = findSavedEntryForRow(row);
//       const existingData = existing?.data ?? {};
//       const schemeToSave = {
//         ...(existingData.appliedDisplay
//           ? { appliedDisplay: existingData.appliedDisplay }
//           : {}),
//         appliedScheme: data,
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
//     setModalOpen(false);
//     setModalType(null);
//     try {
//       form.reset(defaultFormValues);
//     } catch {}
//   };

//   const saveDisplayForSelected = (data: any) => {
//     const targets = selectedRows.length ? selectedRows : [];
//     targets.forEach((row: any) => {
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
//     setModalOpen(false);
//     setModalType(null);
//     try {
//       form.reset(defaultFormValues);
//     } catch {}
//   };

//   // bulk open handlers (above table)
//   const openApplySchemeBulk = () => {
//     if (!selectedRows.length) return;
//     const preset =
//       selectedRows.length === 1
//         ? findSavedEntryForRow(selectedRows[0])?.data?.appliedScheme ?? null
//         : null;
//     setModalType("scheme");
//     try {
//       form.reset(defaultFormValues);
//       if (preset) form.reset(preset);
//     } catch {}
//     setModalOpen(true);
//   };

//   const openApplyDisplayBulk = () => {
//     if (!selectedRows.length) return;
//     const preset =
//       selectedRows.length === 1
//         ? findSavedEntryForRow(selectedRows[0])?.data?.appliedDisplay ?? null
//         : null;
//     setModalType("display");
//     try {
//       form.reset(defaultFormValues);
//       if (preset) form.reset(preset);
//     } catch {}
//     setModalOpen(true);
//   };

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

//   const modalFooter =
//     modalType === "scheme" ? (
//       <>
//         <button
//           type="button"
//           className="btn btn-secondary"
//           onClick={() => {
//             setModalOpen(false);
//             setModalType(null);
//             try {
//               form.reset(defaultFormValues);
//             } catch {}
//           }}
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
//           onClick={() => {
//             setModalOpen(false);
//             setModalType(null);
//             try {
//               form.reset(defaultFormValues);
//             } catch {}
//           }}
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

//   // render
//   return (
//     <Wrapper
//       header={`Phase 3 – ${heading}`}
//       subHeader="Detail Report"
//       ExportR={1}
//       backButtonName="Back"
//     >
//       <>
//         {loading && <CenteredLoader />}
//         {error && <div className="alert alert-danger">{error}</div>}

//         {!loading && !error && (
//           <>
//             {/* Top bulk controls only for item-level (id===2) */}
//             {id === "2" && (
//               <div className="d-flex gap-2 mb-2 align-items-center">
//                 <div className="small text-muted me-2">
//                   Selected: <strong>{selectedRows.length}</strong>
//                 </div>
//                 <button
//                   type="button"
//                   className="btn btn-sm btn-outline-primary"
//                   disabled={selectedRows.length === 0}
//                   onClick={openApplySchemeBulk}
//                 >
//                   Apply Scheme
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-sm btn-outline-secondary"
//                   disabled={selectedRows.length === 0}
//                   onClick={openApplyDisplayBulk}
//                 >
//                   Apply Display
//                 </button>
//               </div>
//             )}

//             {/* Summary Badges */}
//             {detailData.length > 0 && (
//               <div className="d-flex flex-wrap gap-2 mb-1 align-items-center">
//                 {Object.entries({
//                   "Site Qty": totals.totalSiteQty,
//                   "Sale Qty": totals.totalSaleQty,
//                   "Sale Value": totals.totalSaleVal,
//                   "Sp Value": totals.totalStockValue,
//                 }).map(([label, value]) => {
//                   const cleanValue = Math.floor(Number(value));
//                   const displayValue = cleanValue.toLocaleString("en-IN");
//                   return (
//                     <span
//                       key={label}
//                       className="badge bg-light text-dark border px-3 py-2 fw-medium"
//                       style={{ fontSize: "0.875rem" }}
//                       title={label}
//                     >
//                       <strong>{label}:</strong> {displayValue}
//                     </span>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Table */}
//             {detailData.length > 0 ? (
//               <GridTable
//                 rowData={detailData}
//                 columnDefs={displayedColumnDefs}
//                 enableEditing={false}
//                 enableSelection={id === "2"}
//                 height={tableHeight}
//                 onRowClick={handleDrillDown}
//                 reportHeader={`Phase_3_${heading}_Summary`}
//                 selectedRowsHandler={selectedRowsHandler}
//               />
//             ) : (
//               <div className="text-center py-4 text-muted">
//                 No data available for the selected view.
//               </div>
//             )}
//           </>
//         )}

//         {/* SimpleModal (local) */}
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
//           onClose={() => {
//             setModalOpen(false);
//             setModalType(null);
//             try {
//               form.reset(defaultFormValues);
//             } catch {}
//           }}
//           footer={modalFooter}
//         >
//           {modalType === "scheme"
//             ? SchemeModalBody
//             : modalType === "display"
//             ? DisplayModalBody
//             : null}
//         </SimpleModal>
//       </>
//     </Wrapper>
//   );
// };

// export default Pase3DynamicTable;

// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import Wrapper from "../../common/uicomponent/wrapper";
// import GridTable from "../../common/component/GridTable";
// import { toTitleCase } from "./helperfunc";
// import { useSelector, useDispatch } from "react-redux";
// import CenteredLoader from "../../common/component/CenteredLoader";
// import { FormProvider, useForm } from "react-hook-form";
// import { renderField } from "../../common/utils/renderField";
// import scheme, { display } from "../../core/json/scheme";
// import useSchemeOptions, { Option } from "./useSchemeOptions";
// import { saveScheme } from "../../redux/phase3Slice";

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

// const Pase3DynamicTable: React.FC = () => {
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   const savedSchemes = useSelector((s: any) => s.phase3.savedSchemes ?? []);

//   const selectedDepartment = (location.state as any)?.department ?? "";
//   const selectedBranch = (location.state as any)?.branchCode ?? "";
//   const itemCodeFromState = (location.state as any)?.itemCode ?? "";

//   const {
//     data: detailData = [],
//     loading,
//     error,
//   } = useSelector(
//     (state: any) =>
//       state.reportDetail || { data: [], loading: false, error: null }
//   );

//   const [tableHeight, setTableHeight] = useState("550px");
//   const { getSchemeTypes, getSchemeGroups } = useSchemeOptions();

//   const [schemeTypes, setSchemeTypes] = useState<Option[]>([]);
//   const [schemeGroups, setSchemeGroups] = useState<Option[]>([]);
//   const [loadingTypes, setLoadingTypes] = useState(true);
//   const [loadingGroups, setLoadingGroups] = useState(false);

//   // selection state for grid
//   const [selectedRows, setSelectedRows] = useState<any[]>([]);
//   const selectedRowsHandler = (data: any) => setSelectedRows(data || []);

//   // local modal state (non-redux)
//   const [modalOpen, setModalOpen] = useState(false);
//   const [modalType, setModalType] = useState<null | "scheme" | "display">(null);

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

//   // load types on mount
//   useEffect(() => {
//     let mounted = true;
//     const load = async () => {
//       setLoadingTypes(true);
//       try {
//         const res = await getSchemeTypes();
//         if (mounted && res?.status === "ok") setSchemeTypes(res.data || []);
//       } catch (e) {
//         console.error("getSchemeTypes", e);
//       } finally {
//         if (mounted) setLoadingTypes(false);
//       }
//     };
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, [getSchemeTypes]);

//   useEffect(() => {
//     if (!selectedSchemeType) {
//       setSchemeGroups([]);
//       try {
//         form.setValue("schemeGroup", null);
//       } catch {}
//       return;
//     }
//     let mounted = true;
//     const load = async () => {
//       setLoadingGroups(true);
//       try {
//         const value = selectedSchemeType.value;
//         const res = await getSchemeGroups(value);
//         if (mounted && res?.status === "ok") setSchemeGroups(res.data || []);
//       } catch (e) {
//         console.error("getSchemeGroups", e);
//         if (mounted) setSchemeGroups([]);
//       } finally {
//         if (mounted) setLoadingGroups(false);
//         try {
//           form.setValue("schemeGroup", null);
//         } catch {}
//       }
//     };
//     load();
//     return () => {
//       mounted = false;
//     };
//   }, [selectedSchemeType, getSchemeGroups, form]);

//   const selectOptions = useMemo(
//     () => ({
//       schemeType: schemeTypes,
//       schemeGroup: schemeGroups,
//       displayType: [
//         { value: "Send Shelf Picture", label: "Send Shelf Picture" },
//       ],
//     }),
//     [schemeTypes, schemeGroups]
//   );

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

//   // helpers
//   const getItemCodeFromRow = useCallback((row: any): string | undefined => {
//     if (!row) return undefined;
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

//   const getBranchCodeFromRow = useCallback(
//     (row: any): string | undefined => {
//       if (selectedBranch && String(selectedBranch).trim() !== "") {
//         return String(selectedBranch).trim();
//       }
//       if (!row) return undefined;
//       const raw =
//         row?.branchCode ??
//         row?.Branch_Code ??
//         row?.BranchCode ??
//         row?.branch_code ??
//         row?.branch ??
//         row?.Branch ??
//         undefined;
//       if (raw === undefined || raw === null) return undefined;
//       const trimmed = String(raw).trim();
//       return trimmed === "" ? undefined : trimmed;
//     },
//     [selectedBranch]
//   );

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
//         return savedSchemes.find((s: any) => {
//           try {
//             return JSON.stringify(s.data) === rowJson;
//           } catch {
//             return false;
//           }
//         });
//       } catch {
//         return undefined;
//       }
//     },
//     [savedSchemes, getItemCodeFromRow, getBranchCodeFromRow]
//   );

//   // totals
//   const totals = useMemo(() => {
//     if (!detailData?.length) {
//       return {
//         totalSiteQty: 0,
//         totalSaleQty: 0,
//         totalSaleVal: 0,
//         totalStockValue: 0,
//       };
//     }
//     return detailData.reduce(
//       (acc: any, row: any) => {
//         const siteQty = row.total_site_qty ?? row.Site_Qtys ?? 0;
//         acc.totalSiteQty += typeof siteQty === "number" ? siteQty : 0;
//         const saleQty = row.Total_Sale_Qty ?? row.total_sale_qty ?? 0;
//         acc.totalSaleQty += typeof saleQty === "number" ? saleQty : 0;
//         const saleVal = row.Total_Sale_Val ?? row.total_sale_val ?? 0;
//         acc.totalSaleVal += typeof saleVal === "number" ? saleVal : 0;
//         const stockVal =
//           row.Str_Stk_Sp_Value ??
//           row.str_stk_sp_value ??
//           row.total_str_stk_sp_value ??
//           0;
//         acc.totalStockValue += typeof stockVal === "number" ? stockVal : 0;
//         return acc;
//       },
//       { totalSiteQty: 0, totalSaleQty: 0, totalSaleVal: 0, totalStockValue: 0 }
//     );
//   }, [detailData]);

//   // base columns
//   const baseColumnDefs = useMemo(() => {
//     if (!detailData?.length) return [];
//     const first = detailData[0];
//     const keys = Object.keys(first);
//     const seen = new Set<string>();
//     return keys
//       .filter((k) => {
//         const lower = k.toLowerCase();
//         if (
//           lower.includes("item") &&
//           (lower.includes("code") || lower.includes("name"))
//         ) {
//           if (seen.has("item_code") || seen.has("item_name")) return false;
//           if (lower.includes("code")) seen.add("item_code");
//           if (lower.includes("name")) seen.add("item_name");
//         }
//         return true;
//       })
//       .map((k) => ({
//         field: k,
//         headerName: toTitleCase(k),
//         filter:
//           typeof first[k] === "string"
//             ? "agTextColumnFilter"
//             : "agNumberColumnFilter",
//         headerClass: "bg-royal-blue text-white",
//         sortable: true,
//         resizable: true,
//       }));
//   }, [detailData]);

//   const handleGridReady = (api: any) => {
//     console.log("grid ready", api);
//     setTimeout(() => {
//       api.selectAll(); // selects all rows where checkboxSelection() = true
//     }, 300);
//   };
//   // displayed columns
//   const displayedColumnDefs = useMemo(() => {
//     const cols: any = [...baseColumnDefs];

//     // Always add a left pinned checkbox column for row selection.
//     // Checkbox is shown/hidden per-row based on whether a saved scheme exists for that row.
//     const hasCheckboxAlready = cols.some(
//       (c: any) => c.field === "__select__" || c.checkboxSelection
//     );
//     if (!hasCheckboxAlready) {
//       const checkboxCol = {
//         field: "__select__",
//         headerName: "",
//         width: 48,
//         pinned: "left",
//         lockPosition: true,
//         suppressSizeToFit: true,
//         sortable: false,
//         filter: false,
//         resizable: false,
//         // show checkbox only when the row does NOT have an applied scheme
//         checkboxSelection: (params: any) => {
//           try {
//             const row = params.data;
//             const saved = findSavedEntryForRow(row);
//             return !saved?.data?.appliedScheme;
//           } catch (e) {
//             return true;
//           }
//         },
//         // enable header checkbox to select/deselect all selectable rows at once
//         // ag-Grid will only select rows for which checkboxSelection returns true
//         headerCheckboxSelection: true,
//         // when true, header checkbox will only select rows currently visible after filtering
//         headerCheckboxSelectionFilteredOnly: false,
//         cellRenderer: undefined,
//       };
//       cols.unshift(checkboxCol);
//     }

//     // Per request: removed Scheme and Display columns from the table
//     return cols;
//   }, [baseColumnDefs, findSavedEntryForRow]);

//   // responsive height
//   useEffect(() => {
//     const calculateTableHeight = () => {
//       const windowHeight = window.innerHeight;
//       const windowWidth = window.innerWidth;
//       const headerHeight = 100;
//       const footerHeight = 30;
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

//       setTableHeight(`${Math.max(calculatedHeight, minHeight)}px`);
//     };

//     calculateTableHeight();
//     window.addEventListener("resize", calculateTableHeight);
//     window.addEventListener("orientationchange", calculateTableHeight);
//     return () => {
//       window.removeEventListener("resize", calculateTableHeight);
//       window.removeEventListener("orientationchange", calculateTableHeight);
//     };
//   }, []);

//   // drilldown
//   const handleDrillDown = (e: any) => {
//     if (id === "2") return;
//     const code =
//       e?.data?.Item_Code ?? e?.data?.item_code ?? e?.data?.["Item Code"] ?? "";
//     if (code) navigate("/dynamictable/2", { state: { itemCode: code } });
//   };

//   const heading = selectedDepartment
//     ? `Department: ${selectedDepartment}`
//     : selectedBranch
//     ? `Branch: ${selectedBranch}`
//     : `ItemCode: ${itemCodeFromState}`;

//   // --------------------------
//   // modal save handlers (bulk apply)
//   // --------------------------
//   const saveSchemeForSelected = (data: any) => {
//     const targets = selectedRows.length ? selectedRows : []; // if no selection, nothing happens
//     targets.forEach((row: any) => {
//       const existing = findSavedEntryForRow(row);
//       const existingData = existing?.data ?? {};
//       const schemeToSave = {
//         ...(existingData.appliedDisplay
//           ? { appliedDisplay: existingData.appliedDisplay }
//           : {}),
//         appliedScheme: data,
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
//     setModalOpen(false);
//     setModalType(null);
//     try {
//       form.reset(defaultFormValues);
//     } catch {}
//   };

//   const saveDisplayForSelected = (data: any) => {
//     const targets = selectedRows.length ? selectedRows : [];
//     targets.forEach((row: any) => {
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
//     setModalOpen(false);
//     setModalType(null);
//     try {
//       form.reset(defaultFormValues);
//     } catch {}
//   };

//   // bulk open handlers (above table)
//   const openApplySchemeBulk = () => {
//     if (!selectedRows.length) return;
//     const preset =
//       selectedRows.length === 1
//         ? findSavedEntryForRow(selectedRows[0])?.data?.appliedScheme ?? null
//         : null;
//     setModalType("scheme");
//     try {
//       form.reset(defaultFormValues);
//       if (preset) form.reset(preset);
//     } catch {}
//     setModalOpen(true);
//   };

//   const openApplyDisplayBulk = () => {
//     if (!selectedRows.length) return;
//     const preset =
//       selectedRows.length === 1
//         ? findSavedEntryForRow(selectedRows[0])?.data?.appliedDisplay ?? null
//         : null;
//     setModalType("display");
//     try {
//       form.reset(defaultFormValues);
//       if (preset) form.reset(preset);
//     } catch {}
//     setModalOpen(true);
//   };

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

//   const modalFooter =
//     modalType === "scheme" ? (
//       <>
//         <button
//           type="button"
//           className="btn btn-secondary"
//           onClick={() => {
//             setModalOpen(false);
//             setModalType(null);
//             try {
//               form.reset(defaultFormValues);
//             } catch {}
//           }}
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
//           onClick={() => {
//             setModalOpen(false);
//             setModalType(null);
//             try {
//               form.reset(defaultFormValues);
//             } catch {}
//           }}
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

//   // render
//   return (
//     <Wrapper
//       header={`Phase 3 – ${heading}`}
//       subHeader="Detail Report"
//       ExportR={1}
//       backButtonName="Back"
//     >
//       <>
//         {loading && <CenteredLoader />}
//         {error && <div className="alert alert-danger">{error}</div>}

//         {!loading && !error && (
//           <>
//             {/* Top bulk controls only for item-level (id===2) */}
//             {id === "2" && (
//               <div className="d-flex gap-2 mb-2 align-items-center">
//                 <div className="small text-muted me-2">
//                   Selected: <strong>{selectedRows.length}</strong>
//                 </div>
//                 <button
//                   type="button"
//                   className="btn btn-sm btn-outline-primary"
//                   disabled={selectedRows.length === 0}
//                   onClick={openApplySchemeBulk}
//                 >
//                   Apply Scheme
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-sm btn-outline-secondary"
//                   disabled={selectedRows.length === 0}
//                   onClick={openApplyDisplayBulk}
//                 >
//                   Apply Display
//                 </button>
//               </div>
//             )}

//             {/* Summary Badges */}
//             {detailData.length > 0 && (
//               <div className="d-flex flex-wrap gap-2 mb-1 align-items-center">
//                 {Object.entries({
//                   "Site Qty": totals.totalSiteQty,
//                   "Sale Qty": totals.totalSaleQty,
//                   "Sale Value": totals.totalSaleVal,
//                   "Sp Value": totals.totalStockValue,
//                 }).map(([label, value]) => {
//                   const cleanValue = Math.floor(Number(value));
//                   const displayValue = cleanValue.toLocaleString("en-IN");
//                   return (
//                     <span
//                       key={label}
//                       className="badge bg-light text-dark border px-3 py-2 fw-medium"
//                       style={{ fontSize: "0.875rem" }}
//                       title={label}
//                     >
//                       <strong>{label}:</strong> {displayValue}
//                     </span>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Table */}
//             {detailData.length > 0 ? (
//               <GridTable
//                 rowData={detailData}
//                 columnDefs={displayedColumnDefs}
//                 enableEditing={false}
//                 enableSelection={true} // enable selection so checkbox column works
//                 height={tableHeight}
//                 onRowClick={handleDrillDown}
//                 reportHeader={`Phase_3_${heading}_Summary`}
//                 selectedRowsHandler={selectedRowsHandler}
//                 onGridReady={handleGridReady}
//               />
//             ) : (
//               <div className="text-center py-4 text-muted">
//                 No data available for the selected view.
//               </div>
//             )}
//           </>
//         )}

//         {/* SimpleModal (local) */}
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
//           onClose={() => {
//             setModalOpen(false);
//             setModalType(null);
//             try {
//               form.reset(defaultFormValues);
//             } catch {}
//           }}
//           footer={modalFooter}
//         >
//           {modalType === "scheme"
//             ? SchemeModalBody
//             : modalType === "display"
//             ? DisplayModalBody
//             : null}
//         </SimpleModal>
//       </>
//     </Wrapper>
//   );
// };

// export default Pase3DynamicTable;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Wrapper from "../../common/uicomponent/wrapper";
import GridTable from "../../common/component/GridTable";
import { toTitleCase } from "./helperfunc";
import { useSelector, useDispatch } from "react-redux";
import CenteredLoader from "../../common/component/CenteredLoader";
import { FormProvider, useForm } from "react-hook-form";
import { renderField } from "../../common/utils/renderField";
import scheme, { display } from "../../core/json/scheme";
import useSchemeOptions, { Option } from "./useSchemeOptions";
import { saveScheme } from "../../redux/phase3Slice";

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

const Pase3DynamicTable: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const savedSchemes = useSelector((s: any) => s.phase3.savedSchemes ?? []);

  const selectedDepartment = (location.state as any)?.department ?? "";
  const selectedBranch = (location.state as any)?.branchCode ?? "";
  const itemCodeFromState = (location.state as any)?.itemCode ?? "";

  const {
    data: detailData = [],
    loading,
    error,
  } = useSelector(
    (state: any) =>
      state.reportDetail || { data: [], loading: false, error: null }
  );

  const [tableHeight, setTableHeight] = useState("550px");
  const { getSchemeTypes, getSchemeGroups } = useSchemeOptions();

  const [schemeTypes, setSchemeTypes] = useState<Option[]>([]);
  const [schemeGroups, setSchemeGroups] = useState<Option[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // selection state for grid
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const selectedRowsHandler = (data: any) => setSelectedRows(data || []);

  // local modal state (non-redux)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<null | "scheme" | "display">(null);

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

  // load types on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingTypes(true);
      try {
        const res = await getSchemeTypes();
        if (mounted && res?.status === "ok") setSchemeTypes(res.data || []);
      } catch (e) {
        console.error("getSchemeTypes", e);
      } finally {
        if (mounted) setLoadingTypes(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [getSchemeTypes]);

  useEffect(() => {
    if (!selectedSchemeType) {
      setSchemeGroups([]);
      try {
        form.setValue("schemeGroup", null);
      } catch {}
      return;
    }
    let mounted = true;
    const load = async () => {
      setLoadingGroups(true);
      try {
        const value = selectedSchemeType.value;
        const res = await getSchemeGroups(value);
        if (mounted && res?.status === "ok") setSchemeGroups(res.data || []);
      } catch (e) {
        console.error("getSchemeGroups", e);
        if (mounted) setSchemeGroups([]);
      } finally {
        if (mounted) setLoadingGroups(false);
        try {
          form.setValue("schemeGroup", null);
        } catch {}
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [selectedSchemeType, getSchemeGroups, form]);

  const selectOptions = useMemo(
    () => ({
      schemeType: schemeTypes,
      schemeGroup: schemeGroups,
      displayType: [
        { value: "Send Shelf Picture", label: "Send Shelf Picture" },
      ],
    }),
    [schemeTypes, schemeGroups]
  );

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

  // helpers
  const getItemCodeFromRow = useCallback((row: any): string | undefined => {
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
  }, []);

  const getBranchCodeFromRow = useCallback(
    (row: any): string | undefined => {
      if (selectedBranch && String(selectedBranch).trim() !== "") {
        return String(selectedBranch).trim();
      }
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
    },
    [selectedBranch]
  );

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
        return savedSchemes.find((s: any) => {
          try {
            return JSON.stringify(s.data) === rowJson;
          } catch {
            return false;
          }
        });
      } catch {
        return undefined;
      }
    },
    [savedSchemes, getItemCodeFromRow, getBranchCodeFromRow]
  );

  // totals
  const totals = useMemo(() => {
    if (!detailData?.length) {
      return {
        totalSiteQty: 0,
        totalSaleQty: 0,
        totalSaleVal: 0,
        totalStockValue: 0,
      };
    }
    return detailData.reduce(
      (acc: any, row: any) => {
        const siteQty = row.total_site_qty ?? row.Site_Qtys ?? 0;
        acc.totalSiteQty += typeof siteQty === "number" ? siteQty : 0;
        const saleQty = row.Total_Sale_Qty ?? row.total_sale_qty ?? 0;
        acc.totalSaleQty += typeof saleQty === "number" ? saleQty : 0;
        const saleVal = row.Total_Sale_Val ?? row.total_sale_val ?? 0;
        acc.totalSaleVal += typeof saleVal === "number" ? saleVal : 0;
        const stockVal =
          row.Str_Stk_Sp_Value ??
          row.str_stk_sp_value ??
          row.total_str_stk_sp_value ??
          0;
        acc.totalStockValue += typeof stockVal === "number" ? stockVal : 0;
        return acc;
      },
      { totalSiteQty: 0, totalSaleQty: 0, totalSaleVal: 0, totalStockValue: 0 }
    );
  }, [detailData]);

  // base columns
  const baseColumnDefs = useMemo(() => {
    if (!detailData?.length) return [];
    const first = detailData[0];
    const keys = Object.keys(first);
    const seen = new Set<string>();
    return keys
      .filter((k) => {
        const lower = k.toLowerCase();
        if (
          lower.includes("item") &&
          (lower.includes("code") || lower.includes("name"))
        ) {
          if (seen.has("item_code") || seen.has("item_name")) return false;
          if (lower.includes("code")) seen.add("item_code");
          if (lower.includes("name")) seen.add("item_name");
        }
        return true;
      })
      .map((k) => ({
        field: k,
        headerName: toTitleCase(k),
        filter:
          typeof first[k] === "string"
            ? "agTextColumnFilter"
            : "agNumberColumnFilter",
        headerClass: "bg-royal-blue text-white",
        sortable: true,
        resizable: true,
      }));
  }, [detailData]);

  // called when grid is ready (GridTable should call this with api)
  const handleGridReady = (api: any) => {
    // only auto-select when we're in item view (id === "2")
    if (id === "2") {
      // slight delay to allow ag-grid internal setup; adjust if necessary
      setTimeout(() => {
        try {
          api.selectAll(); // will only select rows allowed by checkboxSelection
        } catch (e) {
          // swallow errors silently
        }
      }, 200);
    }
  };

  // displayed columns
  const displayedColumnDefs = useMemo(() => {
    const cols: any = [...baseColumnDefs];

    // Add checkbox column ONLY when id === "2"
    if (id === "2") {
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
          // show checkbox only when the row does NOT have an applied scheme
          checkboxSelection: (params: any) => {
            try {
              const row = params.data;
              const saved = findSavedEntryForRow(row);
              return !saved?.data?.appliedScheme;
            } catch (e) {
              return true;
            }
          },
          // enable header checkbox to select/deselect all selectable rows at once
          headerCheckboxSelection: true,
          headerCheckboxSelectionFilteredOnly: false,
          cellRenderer: undefined,
        };
        cols.unshift(checkboxCol);
      }
    }

    // Per request: removed Scheme and Display columns from the table
    return cols;
  }, [baseColumnDefs, findSavedEntryForRow, id]);

  // responsive height
  useEffect(() => {
    const calculateTableHeight = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const headerHeight = 100;
      const footerHeight = 30;
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

      setTableHeight(`${Math.max(calculatedHeight, minHeight)}px`);
    };

    calculateTableHeight();
    window.addEventListener("resize", calculateTableHeight);
    window.addEventListener("orientationchange", calculateTableHeight);
    return () => {
      window.removeEventListener("resize", calculateTableHeight);
      window.removeEventListener("orientationchange", calculateTableHeight);
    };
  }, []);

  // drilldown
  const handleDrillDown = (e: any) => {
    if (id === "2") return;
    const code =
      e?.data?.Item_Code ?? e?.data?.item_code ?? e?.data?.["Item Code"] ?? "";
    if (code) navigate("/dynamictable/2", { state: { itemCode: code } });
  };

  const heading = selectedDepartment
    ? `Department: ${selectedDepartment}`
    : selectedBranch
    ? `Branch: ${selectedBranch}`
    : `ItemCode: ${itemCodeFromState}`;

  // --------------------------
  // modal save handlers (bulk apply)
  // --------------------------
  const saveSchemeForSelected = (data: any) => {
    const targets = selectedRows.length ? selectedRows : []; // if no selection, nothing happens
    targets.forEach((row: any) => {
      const existing = findSavedEntryForRow(row);
      const existingData = existing?.data ?? {};
      const schemeToSave = {
        ...(existingData.appliedDisplay
          ? { appliedDisplay: existingData.appliedDisplay }
          : {}),
        appliedScheme: data,
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
    setModalOpen(false);
    setModalType(null);
    try {
      form.reset(defaultFormValues);
    } catch {}
  };

  const saveDisplayForSelected = (data: any) => {
    const targets = selectedRows.length ? selectedRows : [];
    targets.forEach((row: any) => {
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
    setModalOpen(false);
    setModalType(null);
    try {
      form.reset(defaultFormValues);
    } catch {}
  };

  // bulk open handlers (above table)
  const openApplySchemeBulk = () => {
    if (!selectedRows.length) return;
    const preset =
      selectedRows.length === 1
        ? findSavedEntryForRow(selectedRows[0])?.data?.appliedScheme ?? null
        : null;
    setModalType("scheme");
    try {
      form.reset(defaultFormValues);
      if (preset) form.reset(preset);
    } catch {}
    setModalOpen(true);
  };

  const openApplyDisplayBulk = () => {
    if (!selectedRows.length) return;
    const preset =
      selectedRows.length === 1
        ? findSavedEntryForRow(selectedRows[0])?.data?.appliedDisplay ?? null
        : null;
    setModalType("display");
    try {
      form.reset(defaultFormValues);
      if (preset) form.reset(preset);
    } catch {}
    setModalOpen(true);
  };

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

  const modalFooter =
    modalType === "scheme" ? (
      <>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setModalOpen(false);
            setModalType(null);
            try {
              form.reset(defaultFormValues);
            } catch {}
          }}
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
          onClick={() => {
            setModalOpen(false);
            setModalType(null);
            try {
              form.reset(defaultFormValues);
            } catch {}
          }}
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
    ) : null;

  // render
  return (
    <Wrapper
      header={`Phase 3 – ${heading}`}
      subHeader="Detail Report"
      ExportR={1}
      backButtonName="Back"
    >
      <>
        {loading && <CenteredLoader />}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <>
            {/* Top bulk controls only for item-level (id===2) */}
            {id === "2" && (
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

            {/* Summary Badges */}
            {detailData.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-1 align-items-center">
                {Object.entries({
                  "Site Qty": totals.totalSiteQty,
                  "Sale Qty": totals.totalSaleQty,
                  "Sale Value": totals.totalSaleVal,
                  "Sp Value": totals.totalStockValue,
                }).map(([label, value]) => {
                  const cleanValue = Math.floor(Number(value));
                  const displayValue = cleanValue.toLocaleString("en-IN");
                  return (
                    <span
                      key={label}
                      className="badge bg-light text-dark border px-3 py-2 fw-medium"
                      style={{ fontSize: "0.875rem" }}
                      title={label}
                    >
                      <strong>{label}:</strong> {displayValue}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Table */}
            {detailData.length > 0 ? (
              <GridTable
                rowData={detailData}
                columnDefs={displayedColumnDefs}
                enableEditing={false}
                enableSelection={id === "2"} // only enable selection when id === "2"
                height={tableHeight}
                onRowClick={handleDrillDown}
                reportHeader={`Phase_3_${heading}_Summary`}
                selectedRowsHandler={selectedRowsHandler}
                onGridReady={handleGridReady}
              />
            ) : (
              <div className="text-center py-4 text-muted">
                No data available for the selected view.
              </div>
            )}
          </>
        )}

        {/* SimpleModal (local) */}
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
              : ""
          }
          size="lg"
          onClose={() => {
            setModalOpen(false);
            setModalType(null);
            try {
              form.reset(defaultFormValues);
            } catch {}
          }}
          footer={modalFooter}
        >
          {modalType === "scheme"
            ? SchemeModalBody
            : modalType === "display"
            ? DisplayModalBody
            : null}
        </SimpleModal>
      </>
    </Wrapper>
  );
};

export default Pase3DynamicTable;
