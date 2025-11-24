import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
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
import { FiPlus, FiMinus } from "react-icons/fi";
import { useSelector } from "react-redux";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "tailwindcss/tailwind.css";

interface RptBodyItem {
  Data: string[];
  SubData?: RptBodyItem[];
}

interface ReportData {
  ReportHeader: { RptName: string };
  RptLayOut: {
    RptColAlignInfo: string[];
    RptColWidthInfo: number[];
  };
  RptBodyHead: string[];
  RptBody: RptBodyItem[];
  RptBodyFooter: string[];
}

interface AgGridTableProps {
  data: ReportData;
  height?: string;
  enableEditing?: boolean;
  enableSelection?: boolean;
  loading?: boolean;
  onCellValueChanged?: (event: any) => void;
  pinnedBottomRowData?: RptBodyItem[];
  leftHeaders?: string[];
  rightHeaders?: string[];
  headerData?: string[];
  footerData?: string[];
  Caption?: string;
  CPrintName?: string;
  CAddress1?: string;
  CAddress2?: string;
  CAddress3?: string;
  CAddress4?: string;
  onRowClick?: (rowData: any) => void;
  cursor?: string;
}

interface RootState {
  theme: string;
  root: any;
}

type HAlignType = "left" | "center" | "right";

// Define a custom meta interface for ColumnDef
interface CustomColumnMeta {
  align: HAlignType;
}

const GridTable = forwardRef(
  (
    {
      data,
      height = "500px",
      loading = false,
      pinnedBottomRowData = [],
      leftHeaders = [],
      rightHeaders = [],
      headerData = [],
      footerData = [],
      Caption,
      CPrintName = "",
      CAddress1 = "",
      CAddress2 = "",
      CAddress3 = "",
      CAddress4 = "",
      onRowClick,
      cursor,
    }: AgGridTableProps,
    ref
  ) => {
    const parentRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLTableRowElement>(null);
    const headerRefs = useRef<(HTMLTableCellElement | null)[]>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [expanded, setExpanded] = useState<ExpandedState>({});
    const theme = useSelector((state: RootState) => state.root.theme);
    const getSubRows = (row: RptBodyItem) => row?.SubData ?? [];

    const columns = useMemo<ColumnDef<RptBodyItem, string>[]>(() => {
      return (
        data?.RptBodyHead?.map((header, index) => {
          const align = data?.RptLayOut?.RptColAlignInfo[index] || "left";
          return {
            id: `col-${index}`,
            accessorFn: (row: RptBodyItem) => row.Data[index] || "",
            header: header, // Directly assign the header string
            cell: (info) => {
              const row = info.row;
              const value = info.getValue();
              if (index === 1 && row.getCanExpand()) {
                return (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={row.getToggleExpandedHandler()}
                      className="p-0 border-none bg-transparent cursor-pointer flex items-center justify-center w-5 h-5 text-base"
                      aria-label={
                        row.getIsExpanded() ? "Collapse row" : "Expand row"
                      }
                    >
                      {row.getIsExpanded() ? <FiMinus /> : <FiPlus />}
                    </button>
                    <span>{String(value)}</span>
                  </div>
                );
              }
              return value;
            },
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: "includesString",
            meta: { align } as CustomColumnMeta, // Type the meta property
          };
        }) || []
      );
    }, [data, theme]);

    const table = useReactTable({
      data: data?.RptBody || [],
      columns,
      state: { sorting, columnFilters, expanded },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onExpandedChange: setExpanded,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getExpandedRowModel: getExpandedRowModel(),
      getSubRows,
    });

    // Sync footer widths with headers
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
    }, [data?.RptBodyHead, table.getHeaderGroups()]);

    const exportColumnDefs = columns.filter((col) => col.id !== "action");

    const onExportExcel = useCallback(async () => {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      const CHAR_WIDTH = 10;
      const MAX_WIDTH = 300;
      const EXCEL_WIDTH_FACTOR = 0.15;
      const columnWidths =
        data?.RptLayOut?.RptColWidthInfo.map((charCount) => {
          const pixelWidth = Math.min(charCount * CHAR_WIDTH, MAX_WIDTH);
          return Math.round(pixelWidth * EXCEL_WIDTH_FACTOR);
        }) || [];

      // Use header as a string directly
      const headers = exportColumnDefs.map((col) => col.header as string);
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

      if (data?.ReportHeader?.RptName) {
        const row = worksheet.addRow([data.ReportHeader.RptName]);
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

      const flattenRows = (rows: RptBodyItem[]): RptBodyItem[] => {
        return rows.reduce<RptBodyItem[]>((acc, row) => {
          acc.push(row);
          if (row.SubData) {
            acc.push(...flattenRows(row.SubData));
          }
          return acc;
        }, []);
      };

      const flattenedData = flattenRows(data?.RptBody || []);
      flattenedData.forEach((row) => {
        const rowData = exportColumnDefs.map(
          (col) => row.Data[parseInt(col.id!.split("-")[1])] || ""
        );
        const excelRow = worksheet.addRow(rowData);
        rowData.forEach((_, colIndex) => {
          excelRow.getCell(colIndex + 1).style = {
            alignment: {
              horizontal:
                (data?.RptLayOut?.RptColAlignInfo[colIndex] as
                  | "left"
                  | "fill"
                  | "center"
                  | "right"
                  | "justify"
                  | "centerContinuous"
                  | "distributed"
                  | undefined) || "left",
              vertical: "middle",
              wrapText: true,
            },
          };
        });
        currentRow++;
      });

      if (pinnedBottomRowData?.length) {
        pinnedBottomRowData.forEach((row) => {
          const rowData = exportColumnDefs.map(
            (col) => row.Data[parseInt(col.id!.split("-")[1])] || ""
          );
          const excelRow = worksheet.addRow(rowData);
          rowData.forEach((_, colIndex) => {
            excelRow.getCell(colIndex + 1).style = {
              alignment: {
                horizontal: [
                  "left",
                  "center",
                  "right",
                  "fill",
                  "justify",
                  "centerContinuous",
                  "distributed",
                ].includes(data?.RptLayOut?.RptColAlignInfo[colIndex])
                  ? (data?.RptLayOut?.RptColAlignInfo[colIndex] as
                      | "left"
                      | "center"
                      | "right"
                      | "fill"
                      | "justify"
                      | "centerContinuous"
                      | "distributed")
                  : "left",
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
      saveAs(blob, `${Caption || data?.ReportHeader?.RptName}.xlsx`);
    }, [
      data,
      exportColumnDefs,
      pinnedBottomRowData,
      leftHeaders,
      rightHeaders,
      headerData,
      footerData,
      Caption,
      CPrintName,
      CAddress1,
      CAddress2,
      CAddress3,
      CAddress4,
    ]);

    const onExportPDF = useCallback(() => {
      const CHAR_WIDTH = 10;
      const MAX_WIDTH = 300;
      const MM_PER_PIXEL = 0.264583;
      const columnWidths = (data?.RptLayOut?.RptColWidthInfo || []).map(
        (charCount) => {
          const pixelWidth = Math.min(charCount * CHAR_WIDTH, MAX_WIDTH);
          return pixelWidth * MM_PER_PIXEL;
        }
      );

      const totalColumns = exportColumnDefs.length;
      const defaultColumnWidth = 50;
      const finalColumnWidths = exportColumnDefs.map((_, index) =>
        columnWidths[index] !== undefined
          ? columnWidths[index]
          : defaultColumnWidth
      );

      const totalTableWidth = finalColumnWidths.reduce(
        (sum, width) => sum + width,
        0
      );
      const PORTRAIT_PAGE_WIDTH = 210 - 20;
      const isLandscape =
        totalTableWidth > PORTRAIT_PAGE_WIDTH || exportColumnDefs.length > 8;

      const doc = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth() - 20;
      const adjustedColumnWidths = finalColumnWidths.map((width) => {
        if (totalTableWidth > pageWidth) {
          return (width / totalTableWidth) * pageWidth;
        }
        return width;
      });

      const columnAlignments = (data?.RptLayOut?.RptColAlignInfo || []).map(
        (align) =>
          ["left", "center", "right"].includes(align)
            ? (align as HAlignType)
            : "left"
      );

      const fontSize = totalColumns > 10 ? 8 : 10;
      // Use header as a string directly
      const headers = [exportColumnDefs.map((col) => col.header as string)];
      const flattenRows = (rows: RptBodyItem[]): string[][] => {
        return rows.reduce<string[][]>((acc, row) => {
          const rowData = exportColumnDefs.map(
            (col) => row.Data[parseInt(col.id!.split("-")[1])] || ""
          );
          acc.push(rowData);
          if (row.SubData) {
            acc.push(...flattenRows(row.SubData));
          }
          return acc;
        }, []);
      };
      const body = flattenRows(data?.RptBody || []);

      if (pinnedBottomRowData?.length) {
        pinnedBottomRowData.forEach((row) => {
          const rowData = exportColumnDefs.map(
            (col) => row.Data[parseInt(col.id!.split("-")[1])] || ""
          );
          body.push(rowData);
        });
      }

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

        if (data?.ReportHeader?.RptName) {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(data.ReportHeader.RptName, pageWidth / 2 + 10, currentY, {
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

      autoTable(doc, {
        head: headers,
        body: body,
        theme: "striped",
        styles: { fontSize: fontSize, cellPadding: 2, overflow: "linebreak" },
        headStyles: {
          fillColor: [100, 100, 100],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        columnStyles: exportColumnDefs.reduce((acc, _, index) => {
          acc[index.toString()] = {
            cellWidth: adjustedColumnWidths[index],
            halign: columnAlignments[index],
          };
          return acc;
        }, {} as { [key: string]: { cellWidth: number; halign: HAlignType } }),
        margin: { top: isFirstPage ? currentY : 10, left: 10, right: 10 },
        pageBreak: "auto",
        rowPageBreak: "avoid",
        tableWidth: pageWidth,
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

      doc.save(`${Caption || data?.ReportHeader?.RptName}.pdf`);
    }, [
      data,
      exportColumnDefs,
      pinnedBottomRowData,
      leftHeaders,
      rightHeaders,
      headerData,
      footerData,
      Caption,
      CPrintName,
      CAddress1,
      CAddress2,
      CAddress3,
      CAddress4,
    ]);

    useImperativeHandle(ref, () => ({
      exportToExcel: onExportExcel,
      exportToPDF: onExportPDF,
    }));

    const themeClass =
      theme === "dark_mode" ? "bg-gray-800 text-white" : "bg-white text-black";

    return (
      <div className={`overflow-auto ${themeClass}`} style={{ height }}>
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : (
          <div className="relative overflow-x-auto" ref={parentRef}>
            <table className="w-full text-sm text-left">
              <thead
                className={`${
                  theme === "dark_mode"
                    ? "bg-gray-700"
                    : "bg-blue-800 text-white"
                }`}
              >
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header, idx) => {
                      const align = (
                        header.column.columnDef.meta as CustomColumnMeta
                      )?.align; // Cast meta to CustomColumnMeta
                      return (
                        <th
                          key={header.id}
                          ref={(el) => {
                            headerRefs.current[idx] = el;
                          }}
                          className={`p-2 ${
                            theme === "dark_mode"
                              ? "border-gray-600"
                              : "border-white"
                          } border-b`}
                          style={{
                            textAlign:
                              align as React.CSSProperties["textAlign"],
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
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`${
                      theme === "dark_mode"
                        ? "hover:bg-gray-600"
                        : "hover:bg-gray-100"
                    } ${cursor !== undefined ? "cursor-pointer" : ""}`}
                    onClick={() =>
                      onRowClick && row.original && onRowClick(row.original)
                    }
                  >
                    {row.getVisibleCells().map((cell) => {
                      const align = (
                        cell.column.columnDef.meta as CustomColumnMeta
                      )?.align; // Cast meta to CustomColumnMeta
                      return (
                        <td
                          key={cell.id}
                          className={`p-2 ${
                            theme === "dark_mode"
                              ? "border-gray-600"
                              : "border-gray-200"
                          } border-b`}
                          style={{
                            textAlign: align,
                            paddingLeft: `${row.depth * 20}px`,
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
                {pinnedBottomRowData.map((row, rowIndex) => (
                  <tr
                    key={`pinned-${rowIndex}`}
                    className={`${
                      theme === "dark_mode" ? "bg-gray-700" : "bg-gray-50"
                    } ${cursor !== undefined ? "cursor-pointer" : ""}`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {row.Data.map((value, idx) => {
                      const align =
                        data?.RptLayOut?.RptColAlignInfo[idx] || "left";
                      return (
                        <td
                          key={`pinned-${rowIndex}-${idx}`}
                          className={`p-2 ${
                            theme === "dark_mode"
                              ? "border-gray-600"
                              : "border-gray-200"
                          } border-b font-bold`}
                          style={{
                            textAlign:
                              align as React.CSSProperties["textAlign"],
                          }}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              {data?.RptBodyFooter?.length > 0 && (
                <tfoot
                  className={`${
                    theme === "dark_mode" ? "bg-gray-700" : "bg-gray-50"
                  } sticky bottom-0`}
                >
                  <tr ref={footerRef}>
                    {data.RptBodyFooter.map((val, idx) => {
                      const align =
                        data?.RptLayOut?.RptColAlignInfo[idx] || "left";
                      return (
                        <td
                          key={idx}
                          className={`p-2 ${
                            theme === "dark_mode"
                              ? "bg-gray-700 text-white"
                              : "bg-gray-50 text-black"
                          } font-bold border-t`}
                          style={{
                            textAlign:
                              align as React.CSSProperties["textAlign"],
                          }}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    );
  }
);

export default GridTable;
