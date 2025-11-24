import React, { useRef, useState } from "react";
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
import "./GridTable.css";

// Define types for column meta and props
interface CustomColumnMeta {
  align?: "left" | "center" | "right" | "justify";
  width?: number;
}

interface ReusableTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  theme?: string;
  tableHeight?: string;
  hasAction?: boolean;
}

interface PinnedRowData {
  isPinned?: boolean;
}

// Constants for width calculations
const CHAR_WIDTH = 8; // Adjust based on your font size
const MAX_WIDTH = 300; // Maximum width for a column

const ReusableTable = <T,>({
  data,
  columns,
  theme = "light",
  tableHeight = "400px",
  hasAction = false,
}: ReusableTableProps<T>) => {
  // State for table functionality
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  // Refs for headers and footer
  //   const headerRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const footerRef = useRef<HTMLTableRowElement | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);

  // Calculate filtered column widths
  const filteredColWidthInfo = columns.map((col) => {
    const meta = col.meta as CustomColumnMeta | undefined;
    return meta?.width || 15; // Default width in characters
  });

  // Initialize table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  // Function to get text alignment
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
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as
                    | CustomColumnMeta
                    | undefined;
                  const width =
                    meta?.width || (header.id === "action" ? 100 : undefined);
                  return (
                    <th
                      key={header.id} // Removed idx from ref as it's not used
                      style={{
                        textAlign: getTextAlign(meta?.align),
                        width,
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
              .rows.filter((row) => !(row.original as PinnedRowData).isPinned)
              .map((row) => (
                <tr key={row.id} aria-expanded={row.getIsExpanded()}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | CustomColumnMeta
                      | undefined;
                    const width =
                      meta?.width ||
                      (cell.column.id === "action" ? 100 : undefined);
                    return (
                      <td
                        key={cell.id}
                        style={{
                          textAlign: getTextAlign(meta?.align),
                          paddingLeft: `${row.depth * 20}px`,
                          width,
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
              .rows.filter((row) => (row.original as PinnedRowData).isPinned)
              .map((row) => (
                <tr key={row.id} ref={footerRef} className="trial-footer-fixed">
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | CustomColumnMeta
                      | undefined;
                    const width =
                      meta?.width ||
                      (cell.column.id === "action" ? 100 : undefined);
                    return (
                      <td
                        key={cell.id}
                        style={{
                          textAlign: getTextAlign(meta?.align),
                          width,
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
  );
};

export default ReusableTable;
