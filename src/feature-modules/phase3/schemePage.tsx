// Pase3DynamicTable.tsx
import React, { useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Wrapper from "../../common/uicomponent/wrapper";
import GridTable from "../../common/component/GridTable";
import { toTitleCase } from "./helperfunc";
import { useSelector, useDispatch } from "react-redux";
import {
  removeSavedSchemeByItemCode,
  clearSavedSchemes,
  saveScheme,
} from "../../redux/phase3Slice";
import moment from "moment";
import useFetch from "../../hooks/useFetch";
import {
  getActiveFiltersRaw,
  getActiveFiltersSummary,
} from "./phase3ActiveFilters";
// import { clearAllSchemes } from "../../redux/schemeSlice";

const SchemePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const callFetch = useFetch();

  // ---------- responsive table height ----------
  const [tableHeight, setTableHeight] = React.useState("550px");
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
  console.log("Active-filterss", getActiveFiltersSummary(location?.state));
  // ---------- Redux ----------
  const savedSchemes = useSelector(
    (state: any) => state.phase3?.savedSchemes ?? []
  );
  // const loading = useSelector((state: any) => state.phase3?.loading ?? false);
  const activeTab = useSelector(
    (state: any) => state.phase3?.activeTab ?? "department"
  );
  // console.log("savedSchemes", savedSchemes);
  // ---------- helpers ----------
  const normalizeBranchFromRow = useCallback((row: any): string | undefined => {
    if (!row) return undefined;
    const raw =
      row["Branch Code"] ??
      row.Branch_Code ??
      row.branchCode ??
      row.branch ??
      "";
    const trimmed = String(raw ?? "").trim();
    return trimmed === "" ? undefined : trimmed;
  }, []);

  // ---------- rowData (for the table – shows LABELS) ----------
  const rowData = useMemo(() => {
    return savedSchemes.map((s: any, idx: number) => {
      const appliedDisplay = s.data?.appliedDisplay;

      const displayTypeValue =
        appliedDisplay?.displayType?.value != null
          ? String(appliedDisplay.displayType.value)
          : "";

      const formattedStartDate = s.data?.appliedScheme?.startDate
        ? moment(s.data.appliedScheme.startDate).format("DD-MM-YYYY")
        : "";
      const formattedEndDate = s.data?.appliedScheme?.endDate
        ? moment(s.data.appliedScheme.endDate).format("DD-MM-YYYY")
        : "";
      console.log("saved scheme", savedSchemes);
      return {
        __savedIndex: idx,
        itemCode: s.itemCode,
        "Item Name": s.data?.["Item Name"] || s.data?.Item_Name || "",
        Department: s.data?.["Department"] || s.data?.department || "",
        Category: s.data?.["Category"] || s.data?.category || "",
        "Sub Category": s.data?.["Sub Category"] || s.data?.subcategory || "",
        "Branch Code": s.branchCode ?? s.data?.branchCode ?? "",
        "Branch Name": s.branchCode ? s.data?.["Branch_Name"] : "",
        "Str Stk": s.data?.["Str Stk"] || s.data?.["Site_Qtys"] || 0,
        "Stk Val": s.data?.["Stk Val"] || s.data?.["Str_Stk_Sp_Value"] || 0,
        "Sale Qty": s.data?.["Sale Qty"] || s.data?.["Sale_Qtys"] || 0,
        "Sale Val": s.data?.["Sale Val"] || s.data?.["Total_Sale_Val"] || 0,

        "Old Scheme Type": s.data?.["Scheme Type"] || s.data?.scheme_type || "",
        "Old Scheme Group":
          s.data?.["Scheme Group"] || s.data?.scheme_group || "",
        "Scheme Type": s.data?.appliedScheme?.schemeType?.label ?? "",
        "Scheme Group": s.data?.appliedScheme?.schemeGroup?.label ?? "",
        "Scheme Start Date": formattedStartDate,
        "Scheme End Date": formattedEndDate,
        "Display Type": displayTypeValue,
        savedAt: s.savedAt,

        // keep the raw value objects for the payload
        _schemeTypeValue: s.data?.appliedScheme?.schemeType?.value,
        _schemeGroupValue: s.data?.appliedScheme?.schemeGroup?.value,
        _displayTypeValue: appliedDisplay?.displayType?.value,
      };
    });
  }, [savedSchemes]);

  // ---------- delete ----------
  const onDeleteRow = useCallback(
    (row: any) => {
      if (!row) return;

      const itemCode = row.itemCode;
      const branchCode = normalizeBranchFromRow(row);

      const confirmMsg = itemCode
        ? branchCode
          ? `Delete saved scheme for Item Code "${itemCode}" at Branch "${branchCode}"?`
          : `Delete saved scheme for Item Code "${itemCode}" (global)?`
        : `Delete this saved scheme?`;

      if (!window.confirm(confirmMsg)) return;

      if (itemCode) {
        if (branchCode) {
          dispatch(
            removeSavedSchemeByItemCode({
              itemCode: String(itemCode),
              branchCode: String(branchCode),
            } as any)
          );
        } else {
          dispatch(removeSavedSchemeByItemCode(String(itemCode)));
        }
        return;
      }

      if (row.savedAt) {
        const remaining = (savedSchemes || []).filter(
          (s: any) => s.savedAt !== row.savedAt
        );
        dispatch(clearSavedSchemes());
        remaining.forEach((s: any) => {
          dispatch(saveScheme({ row: s.data, scheme: {} }));
        });
        return;
      }

      console.warn("Unable to delete row: no itemCode or savedAt found.");
    },
    [dispatch, savedSchemes, normalizeBranchFromRow]
  );

  // ---------- columnDefs ----------
  const columnDefs = useMemo(() => {
    if (!rowData || rowData.length === 0) {
      return [
        {
          headerName: "Actions",
          field: "actions",
          cellRenderer: (params: any) => (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRow(params.data);
                }}
                className="btn btn-sm btn-primary"
                title="Delete"
              >
                Delete
              </button>
            </div>
          ),
          pinned: "right",
          width: 120,
        },
      ];
    }

    const keys = Object.keys(rowData[0]).filter(
      (k) =>
        ![
          "__savedIndex",
          "_schemeTypeValue",
          "_schemeGroupValue",
          "_displayTypeValue",
        ].includes(k)
    );

    const cols = keys
      .filter((k) => k !== "actions")
      .map((key) => {
        const headerName = toTitleCase(String(key).replace(/_/g, " "));
        const base: any = {
          headerName,
          field: key,
          sortable: true,
          filter: true,
          resizable: true,
        };
        if (key === "savedAt") base.width = 180;
        if (key === "itemCode") base.width = 160;
        return base;
      });

    cols.push({
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params: any) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRow(params.data);
            }}
            className="btn btn-sm btn-danger"
            title="Delete"
          >
            Delete
          </button>
        </div>
      ),
      pinned: "right",
      width: 120,
    });

    return cols;
  }, [rowData, onDeleteRow, dispatch]);

  const heading = toTitleCase(String(activeTab || "schemes"));

  // ---------- SUBMIT (sends VALUES, not labels) ----------
  const onSubmit = useCallback(async () => {
    if (!rowData || rowData.length === 0) {
      alert("No saved schemes to submit.");
      return;
    }
    const activeFiltersJson = getActiveFiltersRaw(location?.state);
    // const formattedFilters = formatActiveFiltersForSave(activeFiltersJson);
    console.log("activeFiltersJson", activeFiltersJson);
    const jsonTable = rowData.map((r: any) => ({
      itemCode: r.itemCode,
      itemName: r["Item Name"] ?? "",
      department: r.Department ?? "",
      branchCode: r["Branch Code"] ?? "",
      branchName: r["Branch Name"] ?? "",
      category: r.Category ?? "",
      subcategory: r["Sub Category"] ?? "",
      saleQty: Number(r["Sale Qty"]) || 0,
      saleValue: Number(r["Sale Val"]) || 0,
      strStk: Number(r["Str Stk"]) || 0,
      strStkSpValue: Number(r["Stk Val"]) || 0,
      oldschemeType: r["Old Scheme Type"] ?? "",
      oldschemeGroup: r["Old Scheme Group"] ?? "",
      newschemeType: r._schemeTypeValue ?? "",
      newschemeGroup: r._schemeGroupValue ?? "",
      schemeStartDay: r["Scheme Start Date"]
        ? moment(r["Scheme Start Date"], "DD-MM-YYYY").format("YYYY-MM-DD")
        : "",
      schemeEndDay: r["Scheme End Date"]
        ? moment(r["Scheme End Date"], "DD-MM-YYYY").format("YYYY-MM-DD")
        : "",
      displayType: r._displayTypeValue ?? "",
    }));
    const payload = {
      schemes: jsonTable,
      filters: activeFiltersJson,
    };

    console.log("payload-json", payload);

    try {
      console.log("payload", payload);
      const { res, got } = await callFetch<any>("save-scheme", "POST", payload);

      if (res?.status === 201 || res?.status === 200) {
        console.log("Schemes saved successfully, response:", got);
        alert("Schemes submitted successfully!");
        // dispatch(clearAllSchemes());
        dispatch(clearSavedSchemes());
        navigate(-1);
      } else {
        console.error("Failed to save schemes:", res?.status, got);
        alert(`Failed to submit (status ${res?.status})`);
      }
    } catch (error) {
      console.error("Unexpected error during save:", error);
      alert("An unexpected error occurred.");
    }
  }, [callFetch, dispatch, rowData]);

  // ---------- render ----------
  return (
    <Wrapper
      header="Scheme And Display"
      subHeader="Applied Schemes & Display"
      showFilters={true}
      ExportR={1}
      backButtonName="Back"
    >
      {/* {loading ? (
        <CenteredLoader />
      ) : ( */}
      <GridTable
        rowData={rowData}
        columnDefs={columnDefs}
        enableEditing={false}
        enableSelection={false}
        height={tableHeight}
        reportHeader={`Phase_3_${heading}_Summary`}
      />
      {/* )} */}
      {savedSchemes.length > 0 && (
        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary" onClick={onSubmit}>
            Submit
          </button>
        </div>
      )}
    </Wrapper>
  );
};

export default SchemePage;
