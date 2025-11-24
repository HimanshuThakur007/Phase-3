import { forwardRef, useRef, useImperativeHandle, useState } from "react";
import ImageReportTable from "../component/ImageReportTable";

interface TableData {
  ReportHeader?: {
    RptName: string;
    [key: `Header${number}`]: string;
  };
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
  RptBody: {
    Data: { DT: string[] }[];
  }[];
  Header: string[];
  Footer: string[];
}

interface StockReportTableProps {
  columnDefs: string[];
  reportHeader: TableData["ReportHeader"];
  leftHeaders: string[];
  rightHeaders: string[];
  headerData: string[];
  footerData: string[];
  Caption: string;
  RptColWidthInfo: number[];
  RptColAlignInfo: (
    | "left"
    | "center"
    | "right"
    | "justify"
    | "fill"
    | "centerContinuous"
    | "distributed"
  )[];
  CPrintName: string;
  CAddress1: string;
  CAddress2: string;
  CAddress3: string;
  CAddress4: string;
  height: string;
  data?: TableData;
}

interface GridTableRef {
  exportToExcel: () => void;
  exportToPDF: () => void;
}

const StockReportTable = forwardRef<GridTableRef, StockReportTableProps>(
  (
    {
      columnDefs,
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
      height,
      data,
    },
    ref
  ) => {
    const gridRef = useRef<any>(null);
    const [zoomData, setZoomData] = useState<{
      image: string;
      row: any;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      exportToExcel: () => {
        console.log("StockReportTable: Triggering exportToExcel");
        gridRef.current?.exportToExcel();
      },
      exportToPDF: () => {
        console.log("StockReportTable: Triggering exportToPDF");
        gridRef.current?.exportToPDF();
      },
    }));

    const normalizeHeader = (header: string) => header.replace(/[^\w]/g, "_");

    const validAlignments = [
      "left",
      "center",
      "right",
      "justify",
      "fill",
      "centerContinuous",
      "distributed",
    ] as const;
    const validateAlignment = (
      align: string
    ): (typeof validAlignments)[number] =>
      validAlignments.includes(align as any) ? (align as any) : "left";

    const formatCellValue = (value: any): string | string[] => {
      if (value === null || value === undefined) return "-";
      if (Array.isArray(value)) {
        // Preserve empty strings in arrays, only filter out null/undefined
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
          .filter((item) => item !== null && item !== undefined);
      }
      if (typeof value === "object") {
        return JSON.stringify(value, null, 2);
      }
      return String(value);
    };
    console.log("Report-Align", RptColAlignInfo);

    // const createImageColumn = (side: "left" | "right") => ({
    //   headerName: "Image",
    //   field: `image_${side}`,
    //   width: 200,
    //   autoHeight: true,
    //   cellStyle: { display: "flex", alignItems: "center", minHeight: "auto" },
    //   cellRenderer: (params: any) => {
    //     const imgUrl =
    //       params.value || "https://placehold.co/100x100?text=No+Image";
    //     return (
    //       <img
    //         src={imgUrl}
    //         alt="product"
    //         className="img-fluid"
    //         style={{
    //           width: "100px",
    //           height: "150px",
    //           minWidth: "150px",
    //           objectFit: "cover",
    //           cursor: "zoom-in",
    //           borderRadius: "6px",
    //         }}
    //         onClick={() =>
    //           setZoomData({
    //             image: imgUrl,
    //             row: params.data[side],
    //           })
    //         }
    //         onError={(e) => {
    //           e.currentTarget.src =
    //             "https://placehold.co/100x100?text=No+Image";
    //         }}
    //       />
    //     );
    //   },
    // });

    const createImageColumn = (side: "left" | "right") => ({
      headerName: "Image",
      field: `image_${side}`,
      width: 220, // fixed column width to match card
      autoHeight: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px",
      },
      cellRenderer: (params: any) => {
        const imgUrl =
          params.value || "https://placehold.co/200x200?text=No+Image";

        return (
          <div
            style={{
              width: "200px", // fixed card width
              height: "200px", // fixed card height
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              borderRadius: "8px",
              background: "#f8f9fa", // light bg for better visibility
            }}
          >
            <img
              src={imgUrl}
              alt="product"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // adjust to fit given width/height
                cursor: "zoom-in",
                borderRadius: "6px",
              }}
              onClick={() =>
                setZoomData({
                  image: imgUrl,
                  row: params.data[side],
                })
              }
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/200x200?text=No+Image";
              }}
            />
          </div>
        );
      },
    });

    const createDataColumns = (side: "left" | "right") =>
      columnDefs.map((header, index) => {
        const charCount = RptColWidthInfo[index] || 15;
        const calculatedWidth = Math.min(charCount * 10, 350);
        const alignment = validateAlignment(RptColAlignInfo[index] || "left");
        const cssTextAlign = (() => {
          switch (alignment) {
            case "left":
            case "center":
            case "right":
            case "justify":
              return alignment;
            case "fill":
            case "centerContinuous":
            case "distributed":
              return "left";
            default:
              return "left";
          }
        })();

        return {
          headerName: header,
          field: `${normalizeHeader(header)}_${side}`,
          width: calculatedWidth,
          autoHeight: true,
          flex: 1,
          cellStyle: {
            whiteSpace: "normal",
            lineHeight: "1.5",
            padding: "8px",
            textAlign: cssTextAlign,
            display: "flex",
            alignItems: "center",
            justifyContent: cssTextAlign === "center" ? "center" : cssTextAlign,
            minHeight: "80px",
          },
          cellRenderer: (params: any) => {
            const value = params.value;
            const formattedValue = formatCellValue(value);

            if (Array.isArray(formattedValue)) {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      alignment === "center" ? "center" : "flex-start",
                    justifyContent: "center",
                    gap: "4px",
                    height: "100%",
                    width: "100%",
                    minHeight: "80px",
                  }}
                >
                  {formattedValue.map((item: string, idx: number) => {
                    if (item === null || item === undefined) return null;
                    const [label, val] = item.includes(":")
                      ? item.split(":", 2).map((s) => s.trim())
                      : ["", item];
                    return (
                      <div
                        key={idx}
                        style={{
                          fontSize: "1rem",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent:
                            alignment === "center" ? "center" : "flex-start",
                          textAlign: cssTextAlign,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#444",
                            marginRight: "4px",
                          }}
                        >
                          {label ? ` ${label} ${" "} :` : ""}
                        </span>
                        <span
                          style={{
                            color: "#222",
                            minHeight: "1.2em",
                          }}
                        >
                          {val !== undefined && val !== "" ? (
                            val
                          ) : (
                            <span style={{ color: "#bbb" }}>-</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            }

            return (
              <div style={{ textAlign: cssTextAlign }}>
                {formattedValue === "" ? (
                  <span style={{ color: "#bbb" }}>-</span>
                ) : (
                  formattedValue
                )}
              </div>
            );
          },
        };
      });

    const colDefs = [
      ...[createImageColumn("left"), ...createDataColumns("left")],
      ...[createImageColumn("right"), ...createDataColumns("right")],
    ];

    const originalRowData = (data?.RptBody || []).map((row, index) => {
      const rowObj: { [key: string]: any } = {
        id: index,
        image: row.Data?.[0]?.DT?.[0] || "",
      };
      columnDefs.forEach((header, i) => {
        const fieldData = row.Data?.[i + 1]?.DT || [];
        rowObj[normalizeHeader(header)] =
          fieldData.length > 1 ? fieldData : fieldData[0] || "";
      });
      return rowObj;
    });

    const pairedRowData = [];
    for (let i = 0; i < originalRowData.length; i += 2) {
      const left = originalRowData[i] || {};
      const right = originalRowData[i + 1] || {};
      const pairedRow: { [key: string]: any } = {
        left,
        right,
        image_left: left.image || "",
        image_right: right.image || "",
      };
      columnDefs.forEach((header) => {
        const normHeader = normalizeHeader(header);
        pairedRow[`${normHeader}_left`] = left[normHeader] || "";
        pairedRow[`${normHeader}_right`] = right[normHeader] || "";
      });
      pairedRowData.push(pairedRow);
    }

    return (
      <div>
        <ImageReportTable
          ref={gridRef}
          columnDefs={colDefs}
          rowData={pairedRowData}
          height={height}
          reportHeader={reportHeader || { RptName: "" }}
          enableSelection={true}
          leftHeaders={leftHeaders}
          rightHeaders={rightHeaders}
          headerData={headerData}
          footerData={footerData}
          Caption={Caption}
          RptColWidthInfo={RptColWidthInfo}
          RptColAlignInfo={RptColAlignInfo}
          CPrintName={CPrintName}
          CAddress1={CAddress1}
          CAddress2={CAddress2}
          CAddress3={CAddress3}
          CAddress4={CAddress4}
          domLayout="normal"
        />

        {zoomData && (
          <div
            onClick={() => setZoomData(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: "8px",
                display: "flex",
                width: "80%",
                height: "80%",
                overflow: "hidden",
                boxShadow: "0 0 15px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  flex: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f9f9f9",
                }}
              >
                <img
                  src={zoomData.image}
                  alt="Zoomed"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    minWidth: "200px",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div
                style={{
                  flex: "1",
                  padding: "20px",
                  overflowY: "auto",
                  background: "#fff",
                }}
              >
                <h3
                  style={{
                    marginBottom: "20px",
                    fontSize: "1.5rem",
                    color: "#333",
                    fontWeight: 600,
                  }}
                >
                  Details
                </h3>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "0.9rem",
                    border: "1px solid #ccc",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: "10px",
                          background: "#f4f4f4",
                          color: "#333",
                          textAlign: "left",
                          fontWeight: 600,
                          border: "1px solid #ccc",
                        }}
                      >
                        Field
                      </th>
                      <th
                        style={{
                          padding: "10px",
                          background: "#f4f4f4",
                          color: "#333",
                          textAlign: "left",
                          fontWeight: 600,
                          border: "1px solid #ccc",
                        }}
                      >
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(zoomData.row).map(([key, value], idx) => {
                      if (key === "id" || key === "image") return null;
                      return (
                        <tr
                          key={key}
                          style={{
                            background: idx % 2 === 0 ? "#fff" : "#fafafa",
                          }}
                        >
                          <td
                            style={{
                              padding: "12px",
                              border: "1px solid #ccc",
                              fontWeight: 500,
                              color: "#444",
                              verticalAlign: "top",
                            }}
                          >
                            {columnDefs.find(
                              (header) => normalizeHeader(header) === key
                            ) || key}
                          </td>
                          <td
                            style={{
                              padding: "12px",
                              border: "1px solid #ccc",
                              color: "#222",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              verticalAlign: "top",
                            }}
                          >
                            {formatCellValue(value)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default StockReportTable;
