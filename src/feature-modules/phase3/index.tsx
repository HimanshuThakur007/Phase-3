import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Wrapper from "../../common/uicomponent/wrapper";
import GridTable from "../../common/component/GridTable";
import CenteredLoader from "../../common/component/CenteredLoader";
import { toNumber, toTitleCase } from "./helperfunc";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setActiveTab, setTableHeight } from "../../redux/phase3Slice";
import {
  fetchSchemeTypes,
  fetchSchemeGroups,
  clearSchemeGroups,
} from "../../redux/schemeOptionsSlice";
import { useForm } from "react-hook-form";

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
  // const savedSchemes = useSelector((s: RootState) => s.phase3.savedSchemes);
  const itemsSummaries = useSelector((s: RootState) => s.phase3.itemSummaries);
  const compSummaries = useSelector(
    (s: RootState) => s.phase3.comparisonSummaries
  );
  const bSummaries = useSelector(
    (s: RootState) => s.phase3.branchSchemeSummaries
  );
  const loading = useSelector((s: RootState) => s.phase3.loading);
  const error = useSelector((s: RootState) => s.phase3.error);
  const activeTab = useSelector((s: RootState) => s.phase3.activeTab);
  const tableHeight = useSelector((s: RootState) => s.phase3.tableHeight);

  // --- simple modal state ---
  const [modalType, setModalType] = useState<
    null | "scheme" | "display" | "rowview"
  >(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewRowData, setViewRowData] = useState<any | null>(null);

  // NEW: selection state for item tab
  const [selectedItemCodes, setSelectedItemCodes] = useState<Set<string>>(
    () => new Set()
  );
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

  // helper: get item code from row (safe)
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
        "Bal Bin Stock": Math.round(d?.balance_bin_stock || 0),
        "Po Qty": Math.round(d?.po_qty || 0),
        "Sale Qty": Math.round(d?.total_sale_quantity || 0),
        "Sale Val": Math.round(d?.total_sale_value || 0),
        "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
        "Ttl Mrgn": Math.round(d?.total_ttl_mrgn_value || 0),
        "Include Branch": d?.branch_count,
        "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
        "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
      })),
    [itemsSummaries]
  );

  // console.log("compSummaries", compSummaries);

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
        "Cur Stk Val": Math.round(d?.current_str_stk_sp_value || 0),
        "Prev Stk Val": Math.round(
          d?.total_str_stk_sp_value || d?.strSpValue || 0
        ),
      })),
    [bSummaries]
  );

  // const makeCols = useCallback(
  //   (data: any[]) => {
  //     if (!data.length) return [];
  //     const first = data[0];
  //     const allKeys = Object.keys(first);
  //     const totalColumns = allKeys.length;
  //     const defaultFlex = totalColumns <= 8 ? 1 : 0;

  //     // Define which columns should be pinned to the right in Comparison tab
  //     const rightPinnedInComparison = [
  //       "Cur Str Stk",
  //       "Prev Str Stk",
  //       "Stk Diff",
  //     ];

  //     const cols = allKeys.map((k) => {
  //       const isContriColumn = k === "Stk Qty Contri" || k === "Stk Val Contri";
  //       const isComparisonKeyColumn = rightPinnedInComparison.includes(k);

  //       // Only apply right-pinning logic in comparison tab
  //       const shouldPinRight =
  //         isContriColumn ||
  //         ((activeTab === "comparison" || activeTab === "scomp") &&
  //           isComparisonKeyColumn);

  //       return {
  //         field: k,
  //         headerName: toTitleCase(k),
  //         sortable: true,
  //         resizable: true,
  //         filter:
  //           typeof first[k] === "string"
  //             ? "agTextColumnFilter"
  //             : "agNumberColumnFilter",
  //         pinned: shouldPinRight ? "right" : null,
  //         width: shouldPinRight ? 140 : undefined,
  //         lockPosition: shouldPinRight,
  //         cellStyle: shouldPinRight ? { textAlign: "right" } : undefined,
  //         flex: shouldPinRight ? 0 : defaultFlex,
  //         valueFormatter: isContriColumn
  //           ? (params: any) => {
  //               const val = params.value;
  //               if (val == null) return "";
  //               const num = parseFloat(val.replace("%", "").trim());
  //               return isNaN(num) ? val : `${num.toFixed(2)}%`;
  //             }
  //           : undefined,
  //         getQuickFilterText: isContriColumn
  //           ? (params: any) => {
  //               const val = params.value;
  //               return val
  //                 ? parseFloat(val.replace("%", "").trim()).toString()
  //                 : "";
  //             }
  //           : undefined,
  //         comparator: isContriColumn
  //           ? (a: any, b: any) => {
  //               const numA = parseFloat((a || "").replace("%", "").trim()) || 0;
  //               const numB = parseFloat((b || "").replace("%", "").trim()) || 0;
  //               return numA - numB;
  //             }
  //           : undefined,
  //       };
  //     });

  //     return cols;
  //   },
  //   [activeTab]
  // );

  const makeCols = useCallback(
    (data: any[]) => {
      if (!data.length) return [];
      const first = data[0];
      const allKeys = Object.keys(first);

      // === HIDE internal fields that should remain in row data but NOT show as columns ===
      const hiddenFields = ["Applied Filter", "scheme_dynamic_data"];
      const visibleKeys = allKeys.filter((k) => !hiddenFields.includes(k));

      const totalColumns = visibleKeys.length;
      const defaultFlex = totalColumns <= 8 ? 1 : 0;

      // Define which columns should be pinned to the right in Comparison tab
      const rightPinnedInComparison = [
        "Cur Str Stk",
        "Prev Str Stk",
        "Stk Diff",
      ];

      const cols = visibleKeys.map((k) => {
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

  // displayedColumnDefs: only add "Applied Filter" button for comparison tabs
  const displayedColumnDefs = useMemo(() => {
    const cols: any[] = Array.isArray(currentColumnDefs)
      ? [...currentColumnDefs]
      : [];

    // NEW: If Item tab, add checkbox selection column at the left
    if (activeTab === "item") {
      const hasSelect = cols.some((c: any) => c.field === "__select__");
      if (!hasSelect) {
        // header checkbox toggles select all
        const headerCheckbox = () => {
          // React rendering for header; ag-grid will call this as function if allowed.
          return (
            <input
              type="checkbox"
              aria-label="select all"
              onChange={(ev: any) => {
                const checked = ev.target.checked;
                if (checked) {
                  const allCodes = (currentData || [])
                    .map((r: any) => getItemCodeFromRow(r))
                    .filter(Boolean) as string[];
                  setSelectedItemCodes(new Set(allCodes));
                } else {
                  setSelectedItemCodes(new Set());
                }
              }}
            />
          );
        };

        const selectCol = {
          field: "__select__",
          headerName: "",
          width: 60,
          pinned: "left",
          lockPosition: true,
          suppressSizeToFit: true,
          sortable: false,
          filter: false,
          resizable: false,
          cellRenderer: (params: any) => {
            const row = params?.data;
            const code = getItemCodeFromRow(row);
            const isChecked = code ? selectedItemCodes.has(code) : false;
            return (
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(ev: any) => {
                  const checked = ev.target.checked;
                  setSelectedItemCodes((prev) => {
                    const next = new Set(prev);
                    if (!code) return next;
                    if (checked) next.add(code);
                    else next.delete(code);
                    return next;
                  });
                }}
              />
            );
          },
          headerComponentFramework: headerCheckbox,
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        };
        cols.unshift(selectCol);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentColumnDefs, activeTab, selectedItemCodes, currentData]);

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
    try {
      form.reset(defaultFormValues);
    } catch {}
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
      "Applied Filter",
      "Include Branch",
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
                        <div className="mb-1" style={{ fontSize: "0.85rem" }}>
                          {Object.entries(filters).map(([key, value]: any) => (
                            <div key={key} className="mb-1">
                              <span className="text-info">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
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
  const modalFooter = (
    <>
      <button type="button" className="btn btn-secondary" onClick={closeModal}>
        Close
      </button>
    </>
  );

  // NEW: apply scheme button handler
  const handleApplyScheme = () => {
    const codes = Array.from(selectedItemCodes).filter(Boolean);
    const joined = codes.join(",");
    // const payloadString = `itemCode: "${joined}"`;
    // setAppliedItemcodeString(payloadString);
    console.log("Applying scheme to item codes:", joined);
    navigate("/dynamictable/2", { state: { itemCode: joined } });
  };

  // RENDER
  return (
    <Wrapper header="Summaries" subHeader="Report" ExportR={1}>
      <div className="mb-3">
        {loading && <CenteredLoader />}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-1 pb-1">
          {(["department", "branch", "item"] as const).map((tab) => {
            const labels: any = {
              department: "Department-wise summary",
              branch: "Branch-wise summary",
              item: "Item-wise summary & schemes",
              // scomp: "Item & Branch-wise Stock Comparison",
              // comparison: "Item-wise Stock Comparison",
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
        {/* {schemeOptionsError && (
          <div className="alert alert-warning small">
            Warning: {schemeOptionsError}
          </div>
        )} */}

        {/* Empty */}
        {!loading && !error && currentData.length === 0 && (
          <div className="text-center py-4 text-muted">
            No data available for the selected view.
          </div>
        )}

        {/* Apply Scheme UI for Item tab */}
        {activeTab === "item" && (
          <div className="d-flex align-items-center gap-2 mb-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleApplyScheme}
              disabled={selectedItemCodes.size === 0}
            >
              Apply
            </button>

            <div className="small text-muted">
              {selectedItemCodes.size} selected
            </div>

            {/* {appliedItemcodeString && (
              <div className="ms-auto">
                <span className="badge bg-light text-dark border">
                  <strong>Payload:</strong> {appliedItemcodeString}
                </span>
              </div>
            )} */}
          </div>
        )}

        {/* Table */}
        {!loading && !error && currentData.length > 0 && (
          <>
            {/* {activeTab === "scomp" && (
  <div className="mb-2">
    <MultiTop10Charts
      departmentSummaries={bSummaries}
      branchSummaries={bSummaries}
      itemSummaries={bSummaries}
      topN={10}
    />
    <h5>Detailed Comparision Data</h5>
  </div>
)} */}
            <div className="border rounded-2 overflow-hidden shadow-sm">
              <GridTable
                rowData={currentData}
                columnDefs={displayedColumnDefs}
                enableEditing={false}
                enableSelection={false}
                height={tableHeight}
                onRowClick={enable != 1 && (handleDrillDown as any)}
                reportHeader={`Phase_3_${activeTab}_Summary`}
              />
            </div>
          </>
        )}

        {/* Simple modal */}
        <SimpleModal
          show={modalOpen}
          title="Applied Filter"
          size="lg"
          onClose={closeModal}
          footer={modalFooter}
        >
          {modalType === "rowview" ? RowViewModalBody : null}
        </SimpleModal>
      </div>
    </Wrapper>
  );
};

export default Phase3Page;
