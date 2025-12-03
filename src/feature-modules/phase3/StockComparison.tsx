import { useCallback, useMemo } from "react";
import Wrapper from "../../common/uicomponent/wrapper";
import MultiTop10Charts from "./BranchCharts";
import GridTable from "../../common/component/GridTable";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { toNumber, toTitleCase } from "./helperfunc";
import CenteredLoader from "../../common/component/CenteredLoader";

const StockComparison = () => {
  const bSummaries = useSelector(
    (s: RootState) => s.phase3.branchSchemeSummaries
  );
  const error = useSelector((s: RootState) => s.phase3.error);
  const loading = useSelector((s: RootState) => s.phase3.loading);
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
  const makeCols = useCallback((data: any[]) => {
    if (!data.length) return [];
    const first = data[0];
    const allKeys = Object.keys(first);

    // === HIDE internal fields that should remain in row data but NOT show as columns ===
    const hiddenFields = ["Applied Filter", "scheme_dynamic_data"];
    const visibleKeys = allKeys.filter((k) => !hiddenFields.includes(k));

    const totalColumns = visibleKeys.length;
    const defaultFlex = totalColumns <= 8 ? 1 : 0;

    // Define which columns should be pinned to the right in Comparison tab
    const rightPinnedInComparison = ["Cur Str Stk", "Prev Str Stk", "Stk Diff"];

    const cols = visibleKeys.map((k) => {
      const isContriColumn = k === "Stk Qty Contri" || k === "Stk Val Contri";
      const isComparisonKeyColumn = rightPinnedInComparison.includes(k);

      // Only apply right-pinning logic in comparison tab
      const shouldPinRight = isComparisonKeyColumn;

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
  }, []);
  const bcomparisonColumnDefs = useMemo(
    () => makeCols(branchComparisonData),
    [branchComparisonData, makeCols]
  );

  const totalSummary = useMemo(() => {
    if (!branchComparisonData.length) return {};

    const keys = Object.keys(branchComparisonData[0]);
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
    branchComparisonData.forEach((row: any) => {
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
  }, [branchComparisonData]);
  return (
    <Wrapper header="Stock Comparison Dashboard" subHeader="Report" ExportR={1}>
      <div className="mb-3">
        {loading && <CenteredLoader />}
        {/* Active Count + Total Summary */}
        {!loading && !error && branchComparisonData.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-1 align-items-center">
            <span
              className="badge bg-primary text-white px-3 py-2 rounded-2 fw-medium"
              style={{ fontSize: "0.92rem" }}
            >
              {`${bSummaries.length} Item${bSummaries.length !== 1 ? "s" : ""}`}
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

        {/* Empty */}
        {!loading && !error && branchComparisonData.length === 0 && (
          <div className="text-center py-4 text-muted">
            No data available for the selected view.
          </div>
        )}

        {/* Table */}

        <>
          <div className="mb-2">
            <MultiTop10Charts
              departmentSummaries={bSummaries}
              branchSummaries={bSummaries}
              itemSummaries={bSummaries}
              topN={10}
            />
            <h5>Detailed Comparision Data</h5>
          </div>

          <div className="border rounded-2 overflow-hidden shadow-sm">
            <GridTable
              rowData={branchComparisonData}
              columnDefs={bcomparisonColumnDefs as any}
              enableEditing={false}
              enableSelection={false}
              reportHeader="Stock Comparison Report"
            />
          </div>
        </>
      </div>
    </Wrapper>
  );
};

export default StockComparison;
