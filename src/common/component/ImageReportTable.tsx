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
  RowAutoHeightModule,
  RowApiModule,
} from "ag-grid-community";
import { ColDef } from "ag-grid-community";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import CenteredLoader from "./CenteredLoader";

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
}

interface RootState {
  theme: string;
  root: any;
}

type HAlignType = "left" | "center" | "right";

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
  RowAutoHeightModule,
  RowApiModule,
]);

const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item === null || item === undefined) return "-";
        if (typeof item !== "string" || item.trim() === ":") return "";
        if (item.includes(":")) {
          const [label, val] = item.split(":", 2);
          return `${label.trim()}: ${val ? val.trim() : ""}`;
        }
        return item;
      })
      .filter((item) => item !== null && item !== undefined)
      .join("\n");
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const ImageReportTable = forwardRef(
  (
    {
      rowData = [],
      columnDefs = [],
      height = "600px",
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
      domLayout = "normal",
    }: AgGridTableProps,
    ref
  ) => {
    const gridRef = useRef<AgGridReact>(null);
    const theme = useSelector((state: RootState) => state.root.theme);
    const defaultColDef = useMemo<ColDef>(
      () => ({
        sortable: true,
        filter: true,
        resizable: true,
        editable: enableEditing,
        cellStyle: (params) => {
          const colIndex = columnDefs.findIndex(
            (col) => col.field === params.colDef.field
          );
          const alignment =
            colIndex >= 0 && colIndex < RptColAlignInfo.length
              ? RptColAlignInfo[colIndex] || "left"
              : "left";
          return {
            display: "flex",
            alignItems: "center",
            justifyContent: alignment === "center" ? "center" : alignment,
            textAlign: alignment,
            minHeight: "80px",
          };
        },
      }),
      [enableEditing, RptColAlignInfo, columnDefs]
    );
    const [isExportingPDF, setIsExportingPDF] = useState(false);
    const exportColumnDefs = columnDefs.filter((col) => col.field !== "action");

    // const onExportExcel = useCallback(async () => {
    //   const workbook = new ExcelJS.Workbook();
    //   const worksheet = workbook.addWorksheet("Report");

    //   const CHAR_WIDTH = 10;
    //   const MAX_WIDTH = 300;
    //   const EXCEL_WIDTH_FACTOR = 0.15;
    //   const columnWidths = RptColWidthInfo.map((charCount) => {
    //     const pixelWidth = Math.min(charCount * CHAR_WIDTH, MAX_WIDTH);
    //     return Math.round(pixelWidth * EXCEL_WIDTH_FACTOR);
    //   });

    //   const headers = exportColumnDefs.map(
    //     (col) => col.headerName || col.field || ""
    //   );
    //   const fallbackColWidths = exportColumnDefs.map((_, index) => {
    //     const maxWidth = headers[index]?.length * 1.2 || 10;
    //     return Math.round(Math.min(Math.max(maxWidth, 10), 100));
    //   });

    //   worksheet.columns = exportColumnDefs.map((_, index) => ({
    //     width:
    //       columnWidths[index] !== undefined
    //         ? columnWidths[index]
    //         : fallbackColWidths[index],
    //   }));

    //   const headerColor = "FF4169E1";
    //   let currentRow = 1;

    //   if (CPrintName) {
    //     const row = worksheet.addRow([CPrintName]);
    //     row.getCell(1).style = {
    //       font: { bold: true, size: 16, color: { argb: "FF000000" } },
    //       alignment: { horizontal: "center", vertical: "middle" },
    //       fill: {
    //         type: "pattern",
    //         pattern: "solid",
    //         fgColor: { argb: "FFF0F0F0" },
    //       },
    //     };
    //     worksheet.mergeCells(
    //       currentRow,
    //       1,
    //       currentRow,
    //       exportColumnDefs.length
    //     );
    //     currentRow++;
    //   }

    //   if (CAddress1 || CAddress2) {
    //     const addressRow1 = worksheet.addRow([
    //       [CAddress1, CAddress2].filter(Boolean).join(", "),
    //     ]);
    //     addressRow1.getCell(1).style = {
    //       font: { bold: true, size: 10, color: { argb: "FF666666" } },
    //       alignment: { horizontal: "center", vertical: "middle" },
    //     };
    //     worksheet.mergeCells(
    //       currentRow,
    //       1,
    //       currentRow,
    //       exportColumnDefs.length
    //     );
    //     currentRow++;
    //   }

    //   if (CAddress3 || CAddress4) {
    //     const addressRow2 = worksheet.addRow([
    //       [CAddress3, CAddress4].filter(Boolean).join(", "),
    //     ]);
    //     addressRow2.getCell(1).style = {
    //       font: { bold: true, size: 10, color: { argb: "FF666666" } },
    //       alignment: { horizontal: "center", vertical: "middle" },
    //     };
    //     worksheet.mergeCells(
    //       currentRow,
    //       1,
    //       currentRow,
    //       exportColumnDefs.length
    //     );
    //     currentRow++;
    //   }

    //   if (reportHeader?.RptName) {
    //     const row = worksheet.addRow([reportHeader.RptName]);
    //     row.getCell(1).style = {
    //       font: { bold: true, size: 14, color: { argb: "FF000000" } },
    //       alignment: { horizontal: "center", vertical: "middle" },
    //       fill: {
    //         type: "pattern",
    //         pattern: "solid",
    //         fgColor: { argb: "FFF0F0F0" },
    //       },
    //     };
    //     worksheet.mergeCells(
    //       currentRow,
    //       1,
    //       currentRow,
    //       exportColumnDefs.length
    //     );
    //     currentRow++;
    //   }

    //   const maxHeaderLength = Math.max(leftHeaders.length, rightHeaders.length);
    //   if (maxHeaderLength > 0) {
    //     for (let i = 0; i < maxHeaderLength; i++) {
    //       const row = worksheet.addRow([
    //         ...Array(exportColumnDefs.length).fill(""),
    //       ]);
    //       if (leftHeaders[i]) {
    //         row.getCell(1).value = leftHeaders[i];
    //         row.getCell(1).style = {
    //           font: { bold: true, size: 10, color: { argb: "FF666666" } },
    //           alignment: { horizontal: "left", vertical: "middle" },
    //         };
    //       }
    //       if (rightHeaders[i]) {
    //         row.getCell(exportColumnDefs.length).value = rightHeaders[i];
    //         row.getCell(exportColumnDefs.length).style = {
    //           font: { bold: true, size: 10, color: { argb: "FF666666" } },
    //           alignment: { horizontal: "right", vertical: "middle" },
    //         };
    //       }
    //       currentRow++;
    //     }
    //     if (leftHeaders.length > 1) {
    //       worksheet.mergeCells(
    //         currentRow - maxHeaderLength,
    //         1,
    //         currentRow - 1,
    //         1
    //       );
    //     }
    //     if (rightHeaders.length > 1) {
    //       worksheet.mergeCells(
    //         currentRow - maxHeaderLength,
    //         exportColumnDefs.length,
    //         currentRow - 1,
    //         exportColumnDefs.length
    //       );
    //     }
    //   }

    //   if (headerData?.length > 0) {
    //     headerData.forEach((header) => {
    //       const row = worksheet.addRow([
    //         ...Array(exportColumnDefs.length - 1).fill(""),
    //         header,
    //       ]);
    //       row.getCell(exportColumnDefs.length).style = {
    //         font: { bold: true, color: { argb: "FF666666" } },
    //         alignment: { horizontal: "right", vertical: "middle" },
    //       };
    //       currentRow++;
    //     });
    //   }

    //   const headerRow = worksheet.addRow(headers);
    //   headers.forEach((header, index) => {
    //     const cell = headerRow.getCell(index + 1);
    //     cell.value = header;
    //     cell.style = {
    //       font: { bold: true, color: { argb: "FFFFFFFF" } },
    //       fill: {
    //         type: "pattern",
    //         pattern: "solid",
    //         fgColor: { argb: headerColor },
    //       },
    //       alignment: {
    //         horizontal: "center",
    //         vertical: "middle",
    //         wrapText: true,
    //       },
    //       border: {
    //         top: { style: "thin", color: { argb: "FF000000" } },
    //         bottom: { style: "thin", color: { argb: "FF000000" } },
    //         left: { style: "thin", color: { argb: "FF000000" } },
    //         right: { style: "thin", color: { argb: "FF000000" } },
    //       },
    //     };
    //   });
    //   currentRow++;

    //   const allRowData: any =
    //     gridRef.current?.api?.getRenderedNodes().map((node) => node.data) ||
    //     rowData;

    //   allRowData?.forEach((row: any) => {
    //     const rowData = exportColumnDefs.map(
    //       (col) => row[col.field || ""] || ""
    //     );
    //     const excelRow = worksheet.addRow(rowData);
    //     rowData.forEach((_, colIndex) => {
    //       excelRow.getCell(colIndex + 1).style = {
    //         alignment: {
    //           horizontal: RptColAlignInfo[colIndex] || "left",
    //           vertical: "middle",
    //           wrapText: true,
    //         },
    //       };
    //     });
    //     currentRow++;
    //   });

    //   if (pinnedBottomRowData?.length) {
    //     pinnedBottomRowData.forEach((row: { [x: string]: any }) => {
    //       const rowData = exportColumnDefs.map(
    //         (col) => row[col.field || ""] || ""
    //       );
    //       const excelRow = worksheet.addRow(rowData);
    //       rowData.forEach((_, colIndex) => {
    //         excelRow.getCell(colIndex + 1).style = {
    //           alignment: {
    //             horizontal: RptColAlignInfo[colIndex] || "left",
    //             vertical: "middle",
    //             wrapText: true,
    //           },
    //         };
    //       });
    //       currentRow++;
    //     });
    //   }

    //   if (footerData?.length > 0) {
    //     footerData.forEach((footer) => {
    //       const row = worksheet.addRow([
    //         ...Array(exportColumnDefs.length - 1).fill(""),
    //         footer,
    //       ]);
    //       row.getCell(exportColumnDefs.length).style = {
    //         font: { bold: true, color: { argb: "FF666666" } },
    //         alignment: { horizontal: "right", vertical: "middle" },
    //       };
    //       currentRow++;
    //     });
    //   }

    //   const buffer = await workbook.xlsx.writeBuffer();
    //   const blob = new Blob([buffer], { type: "application/octet-stream" });
    //   saveAs(blob, `${Caption || reportHeader?.RptName}.xlsx`);
    // }, [
    //   rowData,
    //   exportColumnDefs,
    //   pinnedBottomRowData,
    //   reportHeader,
    //   leftHeaders,
    //   rightHeaders,
    //   headerData,
    //   footerData,
    //   Caption,
    //   RptColWidthInfo,
    //   RptColAlignInfo,
    //   CPrintName,
    //   CAddress1,
    //   CAddress2,
    //   CAddress3,
    //   CAddress4,
    // ]);

    const onExportExcel = useCallback(async () => {
      // Existing Excel export logic remains unchanged
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      const CHAR_WIDTH = 10;
      const MAX_WIDTH = 300;
      const EXCEL_WIDTH_FACTOR = 0.15;
      const columnWidths = RptColWidthInfo.map((charCount) => {
        const pixelWidth = Math.min(charCount * CHAR_WIDTH, MAX_WIDTH);
        return Math.round(pixelWidth * EXCEL_WIDTH_FACTOR);
      });

      const headers = exportColumnDefs.map(
        (col) => col.headerName || col.field || ""
      );
      const fallbackColWidths = exportColumnDefs.map((_, index) => {
        const maxWidth = headers[index]?.length * 1.2 || 10;
        return Math.round(Math.min(Math.max(maxWidth, 10), 100));
      });

      worksheet.columns = exportColumnDefs.map((_, index) => ({
        width:
          columnWidths[index] !== undefined
            ? columnWidths[index]
            : fallbackColWidths[index],
      }));

      const headerColor = "FF4169E1";
      let currentRow = 1;

      if (CPrintName) {
        const row = worksheet.addRow([CPrintName]);
        row.getCell(1).style = {
          font: { bold: true, size: 16, color: { argb: "FF000000" } },
          alignment: { horizontal: "center", vertical: "middle" },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF0F0F0" },
          },
        };
        worksheet.mergeCells(
          currentRow,
          1,
          currentRow,
          exportColumnDefs.length
        );
        currentRow++;
      }

      if (CAddress1 || CAddress2) {
        const addressRow1 = worksheet.addRow([
          [CAddress1, CAddress2].filter(Boolean).join(", "),
        ]);
        addressRow1.getCell(1).style = {
          font: { bold: true, size: 10, color: { argb: "FF666666" } },
          alignment: { horizontal: "center", vertical: "middle" },
        };
        worksheet.mergeCells(
          currentRow,
          1,
          currentRow,
          exportColumnDefs.length
        );
        currentRow++;
      }

      if (CAddress3 || CAddress4) {
        const addressRow2 = worksheet.addRow([
          [CAddress3, CAddress4].filter(Boolean).join(", "),
        ]);
        addressRow2.getCell(1).style = {
          font: { bold: true, size: 10, color: { argb: "FF666666" } },
          alignment: { horizontal: "center", vertical: "middle" },
        };
        worksheet.mergeCells(
          currentRow,
          1,
          currentRow,
          exportColumnDefs.length
        );
        currentRow++;
      }

      if (reportHeader?.RptName) {
        const row = worksheet.addRow([reportHeader.RptName]);
        row.getCell(1).style = {
          font: { bold: true, size: 14, color: { argb: "FF000000" } },
          alignment: { horizontal: "center", vertical: "middle" },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF0F0F0" },
          },
        };
        worksheet.mergeCells(
          currentRow,
          1,
          currentRow,
          exportColumnDefs.length
        );
        currentRow++;
      }

      const maxHeaderLength = Math.max(leftHeaders.length, rightHeaders.length);
      if (maxHeaderLength > 0) {
        for (let i = 0; i < maxHeaderLength; i++) {
          const row = worksheet.addRow([
            ...Array(exportColumnDefs.length).fill(""),
          ]);
          if (leftHeaders[i]) {
            row.getCell(1).value = leftHeaders[i];
            row.getCell(1).style = {
              font: { bold: true, size: 10, color: { argb: "FF666666" } },
              alignment: { horizontal: "left", vertical: "middle" },
            };
          }
          if (rightHeaders[i]) {
            row.getCell(exportColumnDefs.length).value = rightHeaders[i];
            row.getCell(exportColumnDefs.length).style = {
              font: { bold: true, size: 10, color: { argb: "FF666666" } },
              alignment: { horizontal: "right", vertical: "middle" },
            };
          }
          currentRow++;
        }
        if (leftHeaders.length > 1) {
          worksheet.mergeCells(
            currentRow - maxHeaderLength,
            1,
            currentRow - 1,
            1
          );
        }
        if (rightHeaders.length > 1) {
          worksheet.mergeCells(
            currentRow - maxHeaderLength,
            exportColumnDefs.length,
            currentRow - 1,
            exportColumnDefs.length
          );
        }
      }

      if (headerData?.length > 0) {
        headerData.forEach((header) => {
          const row = worksheet.addRow([
            ...Array(exportColumnDefs.length - 1).fill(""),
            header,
          ]);
          row.getCell(exportColumnDefs.length).style = {
            font: { bold: true, color: { argb: "FF666666" } },
            alignment: { horizontal: "right", vertical: "middle" },
          };
          currentRow++;
        });
      }

      const headerRow = worksheet.addRow(headers);
      headers.forEach((header, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = header;
        cell.style = {
          font: { bold: true, color: { argb: "FFFFFFFF" } },
          fill: {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: headerColor },
          },
          alignment: {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          },
          border: {
            top: { style: "thin", color: { argb: "FF000000" } },
            bottom: { style: "thin", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } },
          },
        };
      });
      currentRow++;

      const allRowData: any =
        gridRef.current?.api?.getRenderedNodes().map((node) => node.data) ||
        rowData;

      allRowData?.forEach((row: any) => {
        const rowData = exportColumnDefs.map(
          (col) => row[col.field || ""] || ""
        );
        const excelRow = worksheet.addRow(rowData);
        rowData.forEach((_, colIndex) => {
          excelRow.getCell(colIndex + 1).style = {
            alignment: {
              horizontal: RptColAlignInfo[colIndex] || "left",
              vertical: "middle",
              wrapText: true,
            },
          };
        });
        currentRow++;
      });

      if (pinnedBottomRowData?.length) {
        pinnedBottomRowData.forEach((row: { [x: string]: any }) => {
          const rowData = exportColumnDefs.map(
            (col) => row[col.field || ""] || ""
          );
          const excelRow = worksheet.addRow(rowData);
          rowData.forEach((_, colIndex) => {
            excelRow.getCell(colIndex + 1).style = {
              alignment: {
                horizontal: RptColAlignInfo[colIndex] || "left",
                vertical: "middle",
                wrapText: true,
              },
            };
          });
          currentRow++;
        });
      }

      if (footerData?.length > 0) {
        footerData.forEach((footer) => {
          const row = worksheet.addRow([
            ...Array(exportColumnDefs.length - 1).fill(""),
            footer,
          ]);
          row.getCell(exportColumnDefs.length).style = {
            font: { bold: true, color: { argb: "FF666666" } },
            alignment: { horizontal: "right", vertical: "middle" },
          };
          currentRow++;
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      saveAs(blob, `${Caption || reportHeader?.RptName}.xlsx`);
    }, [
      rowData,
      exportColumnDefs,
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
    const onExportPDF = useCallback(async () => {
      setIsExportingPDF(true);
      try {
        const CHAR_WIDTH = 10;
        const MAX_WIDTH = 300;
        const MM_PER_PIXEL = 0.264583;
        const MIN_COLUMN_WIDTH = 20;
        const MAX_COLUMN_WIDTH = 50;

        const columnWidths = RptColWidthInfo.map((charCount) => {
          const pixelWidth = Math.min(charCount * CHAR_WIDTH, MAX_WIDTH);
          return pixelWidth * MM_PER_PIXEL;
        });

        const totalColumns = exportColumnDefs.length;
        const defaultColumnWidth = 50;
        const finalColumnWidths = exportColumnDefs.map((_, index) =>
          columnWidths[index] !== undefined
            ? columnWidths[index]
            : defaultColumnWidth
        );

        // const totalTableWidth = finalColumnWidths.reduce(
        //   (sum, width) => sum + width,
        //   0
        // );

        // const PORTRAIT_PAGE_WIDTH = 210 - 20;
        const isLandscape = totalColumns > 4;
        // const isLandscape =
        //   totalTableWidth > PORTRAIT_PAGE_WIDTH || totalColumns > 3;

        const doc = new jsPDF({
          orientation: isLandscape ? "landscape" : "portrait",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = doc.internal.pageSize.getWidth() - 20;

        let adjustedColumnWidths = finalColumnWidths.map((width) =>
          Math.min(Math.max(width, MIN_COLUMN_WIDTH), MAX_COLUMN_WIDTH)
        );
        const adjustedTotalWidth = adjustedColumnWidths.reduce(
          (sum, width) => sum + width,
          0
        );

        if (adjustedTotalWidth > pageWidth) {
          const scaleFactor = pageWidth / adjustedTotalWidth;
          adjustedColumnWidths = adjustedColumnWidths.map(
            (width) => width * scaleFactor
          );
        }

        // Calculate alignments for left and right columns
        const numLeftColumns = Math.floor(exportColumnDefs.length / 2);
        const columnAlignments = exportColumnDefs
          .map((_, index) => {
            // Left group: image_left (index 0) + data columns
            if (index < numLeftColumns) {
              // Image column (index 0) gets center alignment or from RptColAlignInfo[0]
              return index === 0
                ? RptColAlignInfo[0] || "center"
                : RptColAlignInfo[index - 1] || "left";
            }
            // Right group: image_right + data columns
            return index === numLeftColumns
              ? RptColAlignInfo[0] || "center" // Image column for right side
              : RptColAlignInfo[index - numLeftColumns - 1] || "left";
          })
          .map((align) =>
            ["left", "center", "right"].includes(align)
              ? (align as HAlignType)
              : "left"
          );

        const fontSize = totalColumns > 10 ? 7 : totalColumns > 6 ? 8 : 10;
        const agFontSize = 16;
        const agGridSize = 4;
        const headerHeightPx = agFontSize + agGridSize * 2.25;
        const headerHeightMm = headerHeightPx * MM_PER_PIXEL;
        const minRowHeightMm = 80 * MM_PER_PIXEL;

        const headers = [
          exportColumnDefs.map((col) => col.headerName || col.field || ""),
        ];

        const allRowData: any = rowData || [];

        const imageColIndices = exportColumnDefs
          .map((col, index) =>
            col.field && col.field.includes("image_") ? index : -1
          )
          .filter((index) => index !== -1);

        let imageMap = new Map<string, string>();
        if (imageColIndices.length > 0) {
          const uniqueImageUrls = new Set<string>();
          [...allRowData, ...pinnedBottomRowData].forEach((row: any) => {
            imageColIndices.forEach((colIndex) => {
              const imgUrl = row[exportColumnDefs[colIndex].field || ""];
              if (imgUrl) uniqueImageUrls.add(imgUrl);
            });
          });

          const loadPromises = Array.from(uniqueImageUrls).map(
            async (url: string) => {
              try {
                const response = await fetch(url, { mode: "cors" });
                if (!response.ok) return;
                const blob = await response.blob();
                const base64 = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
                imageMap.set(url, base64);
              } catch (e) {
                console.error(`Failed to load image ${url}:`, e);
              }
            }
          );
          await Promise.all(loadPromises);
        }

        const body = [...allRowData, ...pinnedBottomRowData].map((row: any) =>
          exportColumnDefs.map((col, colIndex) => {
            const value = row[col.field || ""] || "";
            if (imageColIndices.includes(colIndex)) {
              return value; // Return raw image URL for image columns
            }
            return formatCellValue(value);
          })
        );

        let isFirstPage = true;
        let currentY = 10;

        if (isFirstPage) {
          if (CPrintName) {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(CPrintName, pageWidth / 2 + 10, currentY, {
              align: "center",
            });
            currentY += 8;
          }

          if (CAddress1 || CAddress2) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            const address1 = [CAddress1, CAddress2].filter(Boolean).join(", ");
            if (address1) {
              doc.text(address1, pageWidth / 2 + 10, currentY, {
                align: "center",
              });
            }
            currentY += 6;
          }

          if (CAddress3 || CAddress4) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            const address2 = [CAddress3, CAddress4].filter(Boolean).join(", ");
            if (address2) {
              doc.text(address2, pageWidth / 2 + 10, currentY, {
                align: "center",
              });
            }
            currentY += 6;
          }

          if (reportHeader?.RptName) {
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(reportHeader.RptName, pageWidth / 2 + 10, currentY, {
              align: "center",
            });
            currentY += 8;
            doc.setFontSize(12);
          }

          if (leftHeaders.length > 0 || rightHeaders.length > 0) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            const maxHeaderLength = Math.max(
              leftHeaders.length,
              rightHeaders.length
            );
            for (let i = 0; i < maxHeaderLength; i++) {
              if (leftHeaders[i]) {
                doc.text(leftHeaders[i], 10, currentY);
              }
              if (rightHeaders[i]) {
                doc.text(rightHeaders[i], pageWidth + 10, currentY, {
                  align: "right",
                });
              }
              currentY += 6;
            }
          }

          if (headerData?.length > 0) {
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            headerData.forEach((header) => {
              doc.text(header, pageWidth + 10, currentY, { align: "right" });
              currentY += 6;
            });
          }
        }

        const separatorColumnIndex =
          Math.floor(exportColumnDefs.length / 2) - 1;

        autoTable(doc, {
          head: headers,
          body: body,
          theme: "striped",
          // theme: "grid",
          styles: {
            fontSize: fontSize,
            cellPadding: 2,
            overflow: "linebreak",
            minCellHeight: imageColIndices.length > 0 ? 30 : minRowHeightMm,
            valign: "middle",
          },
          headStyles: {
            fillColor: [100, 100, 100],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            minCellHeight: headerHeightMm,
            valign: "middle",
          },
          columnStyles: exportColumnDefs.reduce((acc, col, index) => {
            console.log("Report-Col", col, index, adjustedColumnWidths);
            acc[index.toString()] = {
              cellWidth: adjustedColumnWidths[index],
              halign: columnAlignments[index] || "left",
              ...(imageColIndices.includes(index) ? { valign: "middle" } : {}),
              ...(index === separatorColumnIndex
                ? {
                    cellBorder: {
                      right: { style: "solid", color: [0, 0, 0], width: 0.5 },
                    },
                  }
                : {}),
            };
            return acc;
          }, {} as { [key: string]: { cellWidth: number; halign: HAlignType; valign?: "middle"; cellBorder?: { right?: { style: string; color: number[]; width: number } } } }),
          margin: { top: isFirstPage ? currentY : 10, left: 10, right: 10 },
          pageBreak: "auto",
          rowPageBreak: "avoid",
          tableWidth: pageWidth,
          didParseCell: (data) => {
            if (
              imageColIndices.includes(data.column.index) &&
              data.cell.section === "body"
            ) {
              data.cell.text = [];
            }
          },
          didDrawCell: (data) => {
            if (
              imageColIndices.includes(data.column.index) &&
              data.cell.section === "body"
            ) {
              const imgUrl = data.cell.raw as string;
              const base64 = imageMap.get(imgUrl);
              if (base64) {
                try {
                  const imgProps = doc.getImageProperties(base64);
                  const cellWidth = data.cell.width - 4;
                  const cellHeight = data.cell.height - 4;
                  let imgWidth = cellWidth;
                  let imgHeight = imgWidth * (imgProps.height / imgProps.width);
                  if (imgHeight > cellHeight) {
                    imgHeight = cellHeight;
                    imgWidth = imgHeight * (imgProps.width / imgProps.height);
                  }
                  const alignment =
                    columnAlignments[data.column.index] || "center";
                  let xOffset;
                  if (alignment === "left") {
                    xOffset = 2;
                  } else if (alignment === "right") {
                    xOffset = data.cell.width - imgWidth - 2;
                  } else {
                    xOffset = (data.cell.width - imgWidth) / 2;
                  }
                  const yOffset = (data.cell.height - imgHeight) / 2;
                  doc.addImage(
                    base64,
                    data.cell.x + xOffset,
                    data.cell.y + yOffset,
                    imgWidth,
                    imgHeight
                  );
                } catch (e) {
                  console.error("Error adding image to PDF:", e);
                }
              }
            }
          },
          didDrawPage: (data) => {
            isFirstPage = false;
            doc.setFontSize(8);
            doc.text(
              `Page ${data.pageNumber}`,
              doc.internal.pageSize.getWidth() - 20,
              doc.internal.pageSize.getHeight() - 10
            );
            data.settings.margin.top = 10;
          },
        });

        if (footerData?.length > 0) {
          const tableHeight = doc.lastAutoTable.finalY || currentY;
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(100, 100, 100);
          footerData.forEach((footer, index) => {
            doc.text(footer, pageWidth + 10, tableHeight + 6 + index * 6, {
              align: "right",
            });
          });
        }

        doc.save(`${Caption || "Report"}.pdf`);
      } catch (error) {
        console.error("Error generating PDF:", error);
      } finally {
        setIsExportingPDF(false);
      }
    }, [
      rowData,
      exportColumnDefs,
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
      }
    }, [enableSelection]);

    useImperativeHandle(ref, () => ({
      exportToExcel: onExportExcel,
      exportToPDF: onExportPDF,
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
              --ag-row-height: 80px !important;
              --ag-header-height: calc(var(--ag-font-size) + var(--ag-grid-size) * 2.25);
            }
            .ag-theme-quartz {
              --ag-header-background-color: #004588 !important;
              --ag-header-foreground-color: #ffffff !important;
              --ag-row-background-color: #ffffff !important;
              --ag-odd-row-background-color: #f0f4f8 !important;
              --ag-row-height: 80px !important;
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
              cursor: ${
                cursor !== undefined ? "pointer" : "default"
              } !important;
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
        {isExportingPDF && <CenteredLoader />}
        <div className={`table-responsive ${themeClass}`} style={{ height }}>
          <AgGridReact
            suppressDragLeaveHidesColumns={true}
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={false}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
            animateRows={true}
            rowModelType="clientSide"
            theme="legacy"
            rowSelection={enableSelection ? "multiple" : undefined}
            onSelectionChanged={
              enableSelection ? onSelectionChanged : undefined
            }
            onCellValueChanged={onCellValueChanged}
            pinnedBottomRowData={pinnedBottomRowData}
            onCellClicked={
              onRowClick
                ? (event) => {
                    if (event) {
                      onRowClick(event);
                    }
                  }
                : undefined
            }
            domLayout={domLayout}
          />
        </div>
      </>
    );
  }
);

export default ImageReportTable;
