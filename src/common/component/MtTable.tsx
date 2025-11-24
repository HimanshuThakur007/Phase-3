import React, {
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  useEffect,
} from "react";
import { FiPlus, FiMinus } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  ExpandedState,
  flexRender,
} from "@tanstack/react-table";
import { useLocation, useNavigate } from "react-router-dom";
import Wrapper from "../../common/uicomponent/wrapper";
import { useAuthContext } from "../../common/AuthContext";
import { useApiHandler } from "../../common/utils/customapiHandler";
import "./GridTable.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import CenteredLoader from "./CenteredLoader";

// Define a custom meta interface for ColumnDef
interface CustomColumnMeta {
  align:
    | "left"
    | "center"
    | "right"
    | "justify"
    | "fill"
    | "centerContinuous"
    | "distributed";
  width: number;
}

interface ReportHeader {
  RptName: string;
  [key: `Header${number}`]: string | null;
}

interface Action {
  ViewType?: number;
  RepID?: string;
}

interface RptBodyItem {
  isPinned: any;
  Data: (string | number)[];
  SubData?: any;
}

interface TableData {
  ReportHeader?: ReportHeader;
  RptLayOut?: {
    RptColAlignInfo: (
      | "left"
      | "center"
      | "right"
      | "justify"
      | "fill"
      | "centerContinuous"
      | "distributed"
    )[];
    RptColWidthInfo: number[];
  };
  RptBodyHead: string[];
  RptBody: RptBodyItem[];
  RptBodyFooter: (string | number)[];
  Header: string[];
  Footer: string[];
  Action?: Action;
}

interface NavigateData {
  Caption?: string;
  RepID?: string;
  Data?: TableData;
  formattedData?: any;
}

interface DynamicTrialBalanceTableProps {
  data: TableData;
  loading: boolean;
  Caption?: string;
}

const DynamicTrialBalanceTable: React.FC<DynamicTrialBalanceTableProps> = ({
  data,
  loading,
  Caption,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLTableRowElement>(null);
  const headerRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [tableHeight, setTableHeight] = useState<string>("550px");
  const [loader, setLoader] = useState<boolean>(loading);
  const theme = useSelector((state: RootState) => state.root.theme);
  const location = useLocation();
  const navigate = useNavigate();
  const {
    state: {
      decryptedData: { CPrintName = "", CompCode = "", FinYear = "" } = {},
    },
  } = useAuthContext();
  const { submitHandler } = useApiHandler();
  const { RepID, formattedData } =
    (location?.state as { navigateData?: NavigateData })?.navigateData || {};

  // Debug theme and table data
  console.log("Current theme:", theme);
  console.log("Table data:", data?.RptBody);

  const hasAction =
    data?.Action &&
    typeof data.Action === "object" &&
    "ViewType" in data.Action &&
    "RepID" in data.Action &&
    data.Action.ViewType != null &&
    data.Action.RepID != null;

  const isBranchReport = useMemo(() => {
    return (
      data?.RptBody?.some(
        (item) =>
          item.Data.length === 4 && (!item.SubData || item.SubData.length === 0)
      ) || false
    );
  }, [data?.RptBody]);

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split(/[-\/]/).map(Number);
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  };

  const isVchBillNo = (value: any): boolean => {
    if (typeof value !== "string") return false;
    const regex = /^[A-Za-z\/\-]+[0-9A-Za-z]*$/;
    return regex.test(value);
  };

  const universalFilterComparator = (
    filterValue: string,
    cellValue: any
  ): boolean => {
    if (!filterValue || cellValue == null) return false;
    const strFilter = filterValue.toLowerCase();
    const strValue = String(cellValue).toLowerCase();

    if (isVchBillNo(cellValue)) {
      const regex = /^([A-Za-z\/\-]*?)(\d*[A-Za-z0-9]*)$/;
      const match = strValue.match(regex) || ["", "", ""];
      const prefix = match[1].toLowerCase();
      const number = match[2].toLowerCase();
      return (
        strValue.includes(strFilter) ||
        prefix.includes(strFilter) ||
        number.includes(strFilter)
      );
    }

    const date = parseDate(strValue);
    if (date) {
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${date.getFullYear()}`;
      return formattedDate.includes(strFilter);
    }

    const num = parseFloat(strValue);
    if (!isNaN(num)) {
      return strValue.includes(strFilter);
    }

    return strValue.includes(strFilter);
  };

  const universalComparator = (a: any, b: any) => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    if (isVchBillNo(a) && isVchBillNo(b)) {
      const strA = String(a);
      const strB = String(b);
      const regex = /^([A-Za-z\/\-]*?)(\d*[A-Za-z0-9]*)$/;
      const matchA = strA.match(regex) || ["", "", "0"];
      const matchB = strB.match(regex) || ["", "", "0"];
      const prefixA = matchA[1];
      const prefixB = matchB[1];
      const numA = parseInt(matchA[2] || "0", 10);
      const numB = parseInt(matchB[2] || "0", 10);

      if (prefixA < prefixB) return -1;
      if (prefixA > prefixB) return 1;
      return numA - numB;
    }

    const dateA = typeof a === "string" ? parseDate(a) : null;
    const dateB = typeof b === "string" ? parseDate(b) : null;
    if (dateA && dateB) {
      return dateA.getTime() - dateB.getTime();
    }
    if (dateA) return -1;
    if (dateB) return 1;

    const numA = typeof a === "number" ? a : parseFloat(String(a));
    const numB = typeof b === "number" ? b : parseFloat(String(b));
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    return String(a).localeCompare(String(b), undefined, {
      sensitivity: "base",
      numeric: true,
    });
  };

  const handleViewDrillDown = async (
    repIdCode: string,
    viewType: number,
    masterId: number
  ) => {
    console.log("Form submitted:", formattedData);
    console.log(
      "JSON (url)",
      `Report/GetDrillDownData?SourceRepID=${RepID}&RepId=${repIdCode}&ViewType=${viewType}&ViewType=${viewType}&MasterID=${masterId}&CompCode=${CompCode}&FY=${FinYear}`
    );

    try {
      await submitHandler({
        url: `Report/GetDrillDownData?SourceRepID=${RepID}&RepId=${repIdCode}&ViewType=${viewType}&MasterID=${masterId}&CompCode=${CompCode}&FY=${FinYear}`,
        method: "POST",
        data: formattedData,
        setLoading: setLoader,
        onSuccess: (data) => {
          console.log("data(drill report)", data);
          const navigateData = { ...data, RepID, Caption };
          if (isBranchReport) {
            navigate(`/RepList/${repIdCode}`, { state: { navigateData } });
          } else if (viewType === 1) {
            navigate(`/RepList/${repIdCode}`, { state: { navigateData } });
          } else if (viewType === 2) {
            navigate(`/V-10001`, { state: { navigateData } });
          }
        },
        onError: (error: any) => console.error("Error saving form:", error),
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const normalizeHeader = (header: any) => header.replace(/[^\w]/g, "_");
  const filteredHeaders = data?.RptBodyHead?.slice(1) || [];
  const filteredColAlignInfo =
    data?.RptLayOut?.RptColAlignInfo?.slice(1).map((align) =>
      [
        "left",
        "center",
        "right",
        "justify",
        "fill",
        "centerContinuous",
        "distributed",
      ].includes(align)
        ? align
        : "left"
    ) || [];
  const filteredColWidthInfo = data?.RptLayOut?.RptColWidthInfo?.slice(1) || [];
  const CHAR_WIDTH = data?.RptBodyHead?.length > 7 ? 10 : 15;
  const MAX_WIDTH = data?.RptBodyHead?.length > 7 ? 350 : 400;

  const columns = useMemo<ColumnDef<RptBodyItem, any>[]>(() => {
    const dataColumns: ColumnDef<RptBodyItem, any>[] = filteredHeaders.map(
      (header, index) => ({
        id: normalizeHeader(header),
        accessorFn: (row: RptBodyItem) => row.Data[index + 1] || "",
        header: () => header,
        cell: (info: any) => {
          const row = info.row;
          const value = info.getValue();
          if (index === 0) {
            const hasSubRows = row.getCanExpand();
            return (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {hasSubRows && (
                  <button
                    onClick={row.getToggleExpandedHandler()}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      width: "20px",
                      height: "20px",
                      fontSize: "16px",
                      color: theme === "dark_mode" ? "#ffffff" : "#000000",
                    }}
                    aria-label={
                      row.getIsExpanded() ? "Collapse row" : "Expand row"
                    }
                  >
                    {row.getIsExpanded() ? <FiMinus /> : <FiPlus />}
                  </button>
                )}
                <span
                  style={{
                    color: theme === "dark_mode" ? "#ffffff" : "#000000",
                    padding: "0 4px",
                  }}
                >
                  {String(value)}
                </span>
              </div>
            );
          }
          return (
            <span
              style={{
                color:
                  row.depth > 0
                    ? theme === "dark_mode"
                      ? "#a0a0ff"
                      : "#00008B"
                    : theme === "dark_mode"
                    ? "#ffffff"
                    : "#000000",
                fontWeight: row.depth > 0 ? "bold" : "normal",
              }}
            >
              {value}
            </span>
          );
        },
        enableSorting: true,
        enableColumnFilter: true,
        filterFn: (row: any, columnId: string, filterValue: string) =>
          universalFilterComparator(filterValue, row.getValue(columnId)),
        sortingFn: (rowA: any, rowB: any, columnId: any) =>
          universalComparator(rowA.getValue(columnId), rowB.getValue(columnId)),
        meta: {
          align: filteredColAlignInfo[index] || "left",
          width: Math.min(
            (filteredColWidthInfo[index] || 15) * CHAR_WIDTH,
            MAX_WIDTH
          ),
        } as CustomColumnMeta,
      })
    );

    if (hasAction) {
      dataColumns.push({
        id: "action",
        header: () => "View",
        accessorFn: () => "",
        enableSorting: false,
        enableColumnFilter: false,
        cell: (info: any) => {
          const row = info.row;
          if (row.original.isPinned) return null;
          const firstDataElement = row.original.Data[0];
          if (!firstDataElement || String(firstDataElement).trim() === "") {
            return null;
          }
          const originalRowData = row.original.Data;
          const fullRowData: { [key: string]: string | number } = {};
          data?.RptBodyHead?.forEach((header, i) => {
            fullRowData[normalizeHeader(header)] = originalRowData[i] || "";
          });
          const firstKey = Object.keys(fullRowData)[0];

          return (
            <FaEye
              style={{
                cursor: "pointer",
                color: theme === "dark_mode" ? "#ffffff" : "#000000",
              }}
              className="cursor-pointer"
              onClick={() => {
                console.log("Full row data (onClick)", fullRowData);
                if (data.Action?.ViewType) {
                  const code = fullRowData[firstKey];
                  handleViewDrillDown(
                    data?.Action?.RepID ?? "",
                    data?.Action?.ViewType,
                    Number(code)
                  );
                }
              }}
            />
          );
        },
        filterFn: () => true,
        sortingFn: () => 0,
        meta: { align: "center", width: 100 } as CustomColumnMeta,
      });
    }

    return dataColumns;
  }, [
    data,
    theme,
    filteredHeaders,
    filteredColAlignInfo,
    filteredColWidthInfo,
    hasAction,
  ]);

  const rowData = useMemo(() => {
    return (
      data?.RptBody?.map((row, index) => ({
        ...row,
        id: index,
        isPinned: false,
      })) || []
    );
  }, [data?.RptBody]);

  const pinnedBottomRowData = useMemo(() => {
    if (!data?.RptBodyFooter?.length) return [];
    return [
      {
        Data: data.RptBodyFooter,
        isPinned: true,
        id: "footer",
      },
    ];
  }, [data?.RptBodyFooter]);

  const tableData = useMemo(
    () => [...rowData, ...pinnedBottomRowData],
    [rowData, pinnedBottomRowData]
  );

  const reportHeaders = data?.ReportHeader
    ? Object.keys(data.ReportHeader)
        .filter((key) => key !== "RptName" && key.startsWith("Header"))
        .sort(
          (a, b) =>
            parseInt(a.replace("Header", ""), 10) -
            parseInt(b.replace("Header", ""), 10)
        )
        .map((key) => data.ReportHeader![key as keyof ReportHeader])
    : [];

  const headerPairs = [];
  for (let i = 0; i < reportHeaders.length; i += 2) {
    const left = reportHeaders[i] || "";
    const right = reportHeaders[i + 1] || "";
    if (left || right) {
      headerPairs.push({ left, right });
    }
  }

  const leftHeaders = headerPairs
    .map((pair) => pair.left)
    .filter((header) => header);
  const rightHeaders = headerPairs
    .map((pair) => pair.right)
    .filter((header) => header);

  useEffect(() => {
    const calculateTableHeight = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const headerHeight = 100;
      const footerHeight = data?.Footer?.length > 0 ? 40 : 0;
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
  }, [data?.Footer]);

  useLayoutEffect(() => {
    if (!footerRef.current) return;
    const footerCells = Array.from(footerRef.current.children);
    headerRefs.current.forEach((headerEl, i) => {
      if (headerEl && footerCells[i]) {
        const width = headerEl.getBoundingClientRect().width;
        const cell = footerCells[i] as HTMLElement;
        cell.style.width = `${width}px`;
        cell.style.minWidth = `${width}px`;
        cell.style.maxWidth = `${width}px`;
      }
    });
  }, [data?.RptBodyHead, tableData]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting, columnFilters, expanded },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row: RptBodyItem) => row?.SubData ?? [],
  });

  return (
    <Wrapper
      header={CPrintName}
      subHeader={data?.ReportHeader?.RptName ?? ""}
      backButtonName="Back"
    >
      {loader && <CenteredLoader />}
      <div className="d-flex justify-content-between m-0">
        <div className="d-flex flex-column align-items-start">
          {leftHeaders.map((header, index) => (
            <p key={`left-${index}`} className="fw-bolder m-0">
              {header}
            </p>
          ))}
        </div>
        <div className="d-flex flex-column align-items-end">
          {rightHeaders.map((header, index) => (
            <p key={`right-${index}`} className="fw-bolder m-0">
              {header}
            </p>
          ))}
        </div>
      </div>
      <div className="d-flex justify-content-end mb-3">
        {data?.Header?.map((header, index) => (
          <p key={index} className="fw-bolder">
            {header}
          </p>
        ))}
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="trial-container" data-theme={theme}>
          <div
            className="trial-scroll-container"
            ref={parentRef}
            style={{
              height: tableHeight,
              overflowX: "auto",
              overflowY: "auto",
            }}
          >
            <table
              className="trial-table"
              style={{
                minWidth: `${
                  filteredColWidthInfo.reduce(
                    (sum, width) =>
                      sum + Math.min((width || 15) * CHAR_WIDTH, MAX_WIDTH),
                    0
                  ) + (hasAction ? 100 : 0)
                }px`,
              }}
            >
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, idx) => {
                      const meta = header.column.columnDef.meta as
                        | CustomColumnMeta
                        | undefined;
                      const width =
                        meta?.width ||
                        (header.id === "action" ? 100 : undefined);
                      return (
                        <th
                          key={header.id}
                          ref={(el) => {
                            headerRefs.current[idx] = el;
                          }}
                          style={{
                            textAlign: (() => {
                              switch (meta?.align) {
                                case "left":
                                case "center":
                                case "right":
                                case "justify":
                                  return meta.align;
                                default:
                                  return "left";
                              }
                            })(),
                            width: width,
                            minWidth: width,
                            maxWidth: width,
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table
                  .getRowModel()
                  .rows.filter((row) => !row.original.isPinned)
                  .map((row) => (
                    <tr key={row.id} aria-expanded={row.getIsExpanded()}>
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as
                          | CustomColumnMeta
                          | undefined;
                        const width =
                          meta?.width ||
                          (cell.column.id === "action" ? 100 : undefined);
                        const getTextAlign = (
                          alignValue: string | undefined
                        ): React.CSSProperties["textAlign"] => {
                          switch (alignValue) {
                            case "left":
                            case "center":
                            case "right":
                            case "justify":
                              return alignValue;
                            default:
                              return "left";
                          }
                        };
                        return (
                          <td
                            key={cell.id}
                            style={{
                              textAlign: getTextAlign(meta?.align),
                              paddingLeft: `${row.depth * 20}px`,
                              width: width,
                              minWidth: width,
                              maxWidth: width,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                {table
                  .getRowModel()
                  .rows.filter((row) => row.original.isPinned)
                  .map((row) => (
                    <tr
                      key={row.id}
                      ref={footerRef}
                      className="trial-footer-fixed"
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as
                          | CustomColumnMeta
                          | undefined;
                        const width =
                          meta?.width ||
                          (cell.column.id === "action" ? 100 : undefined);
                        const getTextAlign = (
                          alignValue: string | undefined
                        ): React.CSSProperties["textAlign"] => {
                          switch (alignValue) {
                            case "left":
                            case "center":
                            case "right":
                            case "justify":
                              return alignValue;
                            default:
                              return "left";
                          }
                        };
                        return (
                          <td
                            key={cell.id}
                            style={{
                              textAlign: getTextAlign(meta?.align),
                              width: width,
                              minWidth: width,
                              maxWidth: width,
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
              </tfoot>
            </table>
          </div>
        </div>
      )}
      <div className="d-flex justify-content-end mt-3">
        {data?.Footer?.map((footer, index) => (
          <p key={index} className="fw-bolder">
            {footer}
          </p>
        ))}
      </div>
    </Wrapper>
  );
};

export default DynamicTrialBalanceTable;
