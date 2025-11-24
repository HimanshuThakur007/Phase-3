/* eslint-disable react/prop-types */
import {
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import {
  ClientSideRowModelModule,
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  PaginationModule,
  RowSelectionModule,
  TextEditorModule,
  SelectEditorModule,
  CustomEditorModule,
  NumberEditorModule,
  PinnedRowModule,
  CellStyleModule,
  DateEditorModule,
  RenderApiModule,
  QuickFilterModule,
  CheckboxEditorModule,
} from "ag-grid-community";
import { ColDef } from "ag-grid-community";
import { useSelector } from "react-redux";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import CenteredLoader from "./CenteredLoader";

// Define interfaces for props and state
interface AgGridTableProps {
  rowData?: any[] | null;
  columnDefs?: ColDef[];
  height?: string;
  enableEditing?: boolean;
  enableSelection?: boolean;
  loading?: boolean;
  onCellValueChanged?: (event: any) => void;
  pinnedBottomRowData?: any[];
  reportHeader?: any;
  leftHeaders?: string[];
  rightHeaders?: string[];
  headerData?: string[];
  footerData?: string[];
  Caption?: any;
  RptColWidthInfo?: number[];
  RptColAlignInfo?: (
    | "left"
    | "center"
    | "right"
    | "justify"
    | "fill"
    | "centerContinuous"
    | "distributed"
  )[];
  CPrintName?: string;
  CAddress1?: string;
  CAddress2?: string;
  CAddress3?: string;
  CAddress4?: string;
  onRowClick?: (rowData: any) => void;
  cursor?: string;
  domLayout?: any;
  selectedRowsHandler?: any;
  onGridReady?: any;
}

interface RootState {
  theme: string;
  root: any;
}

// Define HAlignType for jspdf-autotable
// type HAlignType = "left" | "center" | "right";

// Register community modules
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ValidationModule,
  TextFilterModule,
  NumberFilterModule,
  DateFilterModule,
  PaginationModule,
  RowSelectionModule,
  TextEditorModule,
  SelectEditorModule,
  CustomEditorModule,
  NumberEditorModule,
  PinnedRowModule,
  CellStyleModule,
  DateEditorModule,
  RenderApiModule,
  QuickFilterModule,
  CheckboxEditorModule,
]);

const GridTable = forwardRef(
  (
    {
      rowData = [],
      columnDefs = [],
      height = "500px",
      enableEditing = false,
      enableSelection = false,
      onCellValueChanged,
      pinnedBottomRowData = [],
      reportHeader = { RptName: "" },
      leftHeaders = [],
      rightHeaders = [],
      headerData = [],
      footerData = [],
      Caption,
      RptColWidthInfo = [],
      RptColAlignInfo = [],
      CPrintName = "",
      CAddress1 = "",
      CAddress2 = "",
      CAddress3 = "",
      CAddress4 = "",
      cursor,
      onRowClick,
      domLayout,
      selectedRowsHandler,
      onGridReady,
    }: AgGridTableProps,
    ref
  ) => {
    const gridRef = useRef<AgGridReact>(null);
    const theme = useSelector((state: RootState) => state.root.theme);
    const [loading, setLoading] = useState(false);
    const defaultColDef = useMemo<ColDef>(
      () => ({
        sortable: true,
        filter: true,
        resizable: true,
        editable: enableEditing,
      }),
      [enableEditing]
    );

    // Filter out Action column for exports
    const exportColumnDefs = columnDefs.filter((col) => col.field !== "action");

    const onExportExcel = useCallback(async () => {
      setLoading(true);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report", {
        pageSetup: { fitToPage: true, fitToWidth: 1 },
      });

      const headers = exportColumnDefs.map(
        (col) => col.headerName || col.field || ""
      );
      const colCount = headers.length;

      // === 1. Set Column Widths ===
      const CHAR_WIDTH_PX = 7; // More accurate
      const MAX_WIDTH_PX = 200;
      const EXCEL_WIDTH_FACTOR = 0.142; // Excel uses ~7px per unit

      const columnWidths =
        RptColWidthInfo.length > 0
          ? RptColWidthInfo.map((charCount) => {
              const px = Math.min(charCount * CHAR_WIDTH_PX, MAX_WIDTH_PX);
              return Math.max(8, Math.round(px * EXCEL_WIDTH_FACTOR));
            })
          : headers.map((h) => Math.min(Math.max(h.length * 1.2, 10), 50));

      worksheet.columns = exportColumnDefs.map((_, i) => ({
        header: headers[i],
        key: `col${i}`,
        width: columnWidths[i],
      }));

      // === 2. Header Style ===
      const headerFill = {
        type: "pattern" as const,
        pattern: "solid" as const,
        fgColor: { argb: "FF4169E1" }, // Royal Blue
      };

      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      let rowIndex = 2;

      // === 3. Company Info (Centered) ===
      const addCenteredRow = (text: string, fontSize = 12, bold = false) => {
        if (!text) return rowIndex;
        // const row = worksheet.addRow([text]);
        worksheet.mergeCells(
          `A${rowIndex}:${String.fromCharCode(64 + colCount)}${rowIndex}`
        );
        const cell = worksheet.getCell(`A${rowIndex}`);
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { size: fontSize, bold, color: { argb: "FF000000" } };
        rowIndex++;
        return rowIndex;
      };

      if (CPrintName) addCenteredRow(CPrintName, 16, true);
      if (CAddress1 || CAddress2) {
        const addr = [CAddress1, CAddress2].filter(Boolean).join(", ");
        if (addr) addCenteredRow(addr, 10);
      }
      if (CAddress3 || CAddress4) {
        const addr = [CAddress3, CAddress4].filter(Boolean).join(", ");
        if (addr) addCenteredRow(addr, 10);
      }
      if (reportHeader?.RptName) addCenteredRow(reportHeader.RptName, 14, true);

      // === 4. Left/Right Headers ===
      const maxHeaderLines = Math.max(leftHeaders.length, rightHeaders.length);
      if (maxHeaderLines > 0) {
        for (let i = 0; i < maxHeaderLines; i++) {
          const row = worksheet.addRow(Array(colCount).fill(""));
          if (leftHeaders[i]) {
            row.getCell(1).value = leftHeaders[i];
            row.getCell(1).font = { size: 10, color: { argb: "FF666666" } };
            row.getCell(1).alignment = { horizontal: "left" };
          }
          if (rightHeaders[i]) {
            row.getCell(colCount).value = rightHeaders[i];
            row.getCell(colCount).font = {
              size: 10,
              color: { argb: "FF666666" },
            };
            row.getCell(colCount).alignment = { horizontal: "right" };
          }
          rowIndex++;
        }
      }

      // === 5. Opening Balance ===
      if (headerData?.length > 0) {
        headerData.forEach((header) => {
          const row = worksheet.addRow([
            "",
            "",
            ...Array(colCount - 2).fill(""),
            header,
          ]);
          const cell = row.getCell(colCount);
          cell.font = { bold: true, color: { argb: "FF666666" } };
          cell.alignment = { horizontal: "right" };
          rowIndex++;
        });
      }

      // === 6. Data Rows ===
      const alignMap: Record<string, "left" | "center" | "right"> = {
        left: "left",
        center: "center",
        right: "right",
      };

      rowData?.forEach((row) => {
        const values = exportColumnDefs.map(
          (col) => row[col.field || ""] ?? ""
        );
        const excelRow = worksheet.addRow(values);
        values.forEach((_, i) => {
          const align = RptColAlignInfo[i];
          const hAlign = align && align in alignMap ? alignMap[align] : "left";
          excelRow.getCell(i + 1).alignment = {
            horizontal: hAlign,
            wrapText: true,
          };
        });
        rowIndex++;
      });

      // === 7. Pinned Bottom Rows ===
      pinnedBottomRowData?.forEach((row: any) => {
        const values = exportColumnDefs.map(
          (col) => row[col.field || ""] ?? ""
        );
        const excelRow = worksheet.addRow(values);
        values.forEach((_, i) => {
          const align = RptColAlignInfo[i];
          const hAlign = align && align in alignMap ? alignMap[align] : "left";
          excelRow.getCell(i + 1).alignment = {
            horizontal: hAlign,
            wrapText: true,
          };
          excelRow.getCell(i + 1).font = { bold: true };
        });
        rowIndex++;
      });

      // === 8. Closing Balance ===
      if (footerData?.length > 0) {
        footerData.forEach((footer) => {
          const row = worksheet.addRow([
            "",
            "",
            ...Array(colCount - 2).fill(""),
            footer,
          ]);
          const cell = row.getCell(colCount);
          cell.font = { bold: true, color: { argb: "FF666666" } };
          cell.alignment = { horizontal: "right" };
          rowIndex++;
        });
      }

      // === 9. Save ===
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      saveAs(blob, `${Caption || reportHeader || "Report"}.xlsx`);
      setLoading(false);
    }, [
      exportColumnDefs,
      rowData,
      pinnedBottomRowData,
      reportHeader,
      leftHeaders,
      rightHeaders,
      headerData,
      footerData,
      Caption,
      RptColWidthInfo,
      RptColAlignInfo,
      CPrintName,
      CAddress1,
      CAddress2,
      CAddress3,
      CAddress4,
    ]);

    const onSelectionChanged = useCallback(() => {
      if (enableSelection) {
        const selectedRows = gridRef.current?.api.getSelectedRows();
        console.log("Selected Rows:", selectedRows);
        selectedRowsHandler(selectedRows);
      }
    }, [enableSelection]);

    useImperativeHandle(ref, () => ({
      exportToExcel: onExportExcel,
      // exportToPDF: onExportPDF,
    }));

    const themeClass =
      theme === "dark_mode" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

    return (
      <>
        <style>
          {`
            .ag-theme-quartz-dark {
              --ag-background-color: #1d1d42 !important;
              --ag-header-background-color: #1d1d42 !important;
              --ag-row-hover-color: rgba(255, 255, 255, 0.1) !important;
              --ag-column-hover-color: rgba(255, 255, 255, 0.1) !important;
              --ag-row-background-color: #2a2a4a !important;
              --ag-odd-row-background-color: #3a3a5a !important;
                 --ag-row-height: calc(var(--ag-font-size) + var(--ag-grid-size) * 2.0) !important;
                   --ag-header-height: calc(var(--ag-font-size) + var(--ag-grid-size) * 2.25);
            }
            .ag-theme-quartz {
              --ag-header-background-color: #004588 !important;
              --ag-header-foreground-color: #ffffff !important;
              --ag-row-background-color: #ffffff !important;
              --ag-odd-row-background-color: #e4eafaff !important;
               --ag-row-height: calc(var(--ag-font-size) + var(--ag-grid-size) * 2.0) !important;
                   --ag-header-height: calc(var(--ag-font-size) + var(--ag-grid-size) * 2.25);
                   --ag-header-column-resize-handle-color: #ffffff !important;
            }
            .ag-theme-quartz .ag-icon-filter {
              color: #ffffff !important;
            }
            .ag-theme-quartz .ag-header-cell .ag-filter-icon .ag-icon {
              fill: #ffffff !important;
            }
          
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
           .${themeClass} .ag-row, .${themeClass} .ag-row-even, .${themeClass} .ag-row-odd {
        
            cursor: ${cursor !== undefined ? "pointer" : "default"} !important;
            }
            .${themeClass} .ag-row:hover {
              background-color: ${
                theme === "dark_mode"
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(0, 0, 0, 0.05)"
              } !important;
            }
          `}
        </style>
        <div className={`table-responsive ${themeClass}`} style={{ height }}>
          {loading && <CenteredLoader />}
          <AgGridReact
            suppressDragLeaveHidesColumns={true}
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            // pagination={true}
            // paginationPageSize={100}
            animateRows={true}
            rowModelType="clientSide"
            theme="legacy"
            rowSelection={enableSelection ? "multiple" : undefined}
            onSelectionChanged={
              enableSelection ? onSelectionChanged : undefined
            }
            onCellValueChanged={onCellValueChanged}
            pinnedBottomRowData={pinnedBottomRowData}
            // onCellClicked={
            //   onRowClick
            //     ? (event) => {
            //         if (event) {
            //           onRowClick(event);
            //         }
            //       }
            //     : undefined
            // }
            onRowDoubleClicked={
              onRowClick
                ? (event) => {
                    if (event) {
                      onRowClick(event);
                    }
                  }
                : undefined
            }
            domLayout={domLayout}
            onGridReady={(params) => {
              if (onGridReady) onGridReady(params.api);
            }}
          />
        </div>
      </>
    );
  }
);

export default GridTable;
