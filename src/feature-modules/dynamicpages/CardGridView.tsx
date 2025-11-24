import React, { JSX } from "react";
import { VariableSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  FaCalendarAlt,
  FaMoneyBillWave,
  FaHashtag,
  FaFileAlt,
  FaEye,
} from "react-icons/fa";

interface CardGridViewProps {
  rowData: any[];
  theme: "dark_mode" | "light_mode";
  hasAction?: boolean;
  tableData?: any;
  handleViewDrillDown?: (
    repId: string,
    viewType: number,
    code: number,
    fy?: string,
    repOpt?: any
  ) => void;
}

const CardGridView: React.FC<CardGridViewProps> = ({
  rowData = [],
  theme,
  hasAction = false,
  tableData,
  handleViewDrillDown,
}) => {
  const themeColor = "#004588";
  const columnCount = 1; // Single column for small screens
  const cardGap = 16; // Increased gap between cards for visibility

  const cardVars =
    theme === "dark_mode"
      ? {
          "--card-bg": "rgba(22, 28, 36, 0.88)",
          "--border": "rgba(255, 255, 255, 0.12)",
          "--label": "#a0aec0",
          "--value": "#f7fafc",
          "--integer-value": "#63b3ed",
          "--integer-bg": "rgba(99, 179, 237, 0.15)",
          "--shadow": "0 6px 16px rgba(0, 0, 0, 0.25)",
          "--hover-shadow": "0 10px 24px rgba(0, 0, 0, 0.3)",
          "--hover-transform": "translateY(-6px)",
        }
      : {
          "--card-bg": "rgba(255, 255, 255, 0.98)",
          "--border": "rgba(0, 0, 0, 0.08)",
          "--label": "#4a5568",
          "--value": "#1a202c",
          "--integer-value": "#2b6cb0",
          "--integer-bg": "rgba(43, 108, 176, 0.1)",
          "--shadow": "0 4px 12px rgba(0, 0, 0, 0.06)",
          "--hover-shadow": "0 8px 20px rgba(0, 0, 0, 0.1)",
          "--hover-transform": "translateY(-5px)",
        };

  const getIconForField = (key: string) => {
    const baseStyle = {
      marginRight: "8px",
      transition: "transform 0.3s ease",
      fontSize: "1rem",
    };
    if (/date/i.test(key))
      return (
        <FaCalendarAlt
          style={{ ...baseStyle, color: themeColor }}
          className="field-icon"
        />
      );
    if (/amount|total|balance|price|debit|credit/i.test(key))
      return (
        <FaMoneyBillWave
          style={{ ...baseStyle, color: "#22c55e" }}
          className="field-icon"
        />
      );
    if (/id|no|number/i.test(key))
      return (
        <FaHashtag
          style={{ ...baseStyle, color: "#9ca3af" }}
          className="field-icon"
        />
      );
    return (
      <FaFileAlt
        style={{ ...baseStyle, color: "#6b7280" }}
        className="field-icon"
      />
    );
  };

  const isInteger = (value: any) => Number.isInteger(Number(value));

  // Estimate row height based on fields and content, including card gap
  const getRowHeight = (index: number) => {
    const row = rowData[index];
    if (!row) return 120; // Increased fallback height
    const fields = Object.keys(row).filter(
      (key) => key !== "id" && key !== "action"
    );
    const fieldRows = Math.ceil(fields.length / 2); // Two fields per row
    const baseFieldHeight = 64; // Increased for better spacing
    const actionHeight = hasAction ? 52 : 0; // Adjusted for action button
    const padding = 20; // Increased padding
    const fieldRowGap = 10; // Gap between field rows
    // Estimate additional height for long text
    const extraHeightPerField = fields.reduce((acc, key) => {
      const value = row[key] ?? "N/A";
      const charCount = String(value).length;
      return acc + Math.floor(charCount / 25) * 20; // Adjusted: 25 chars per line, 20px per extra line
    }, 0);
    return (
      fieldRows * baseFieldHeight +
      extraHeightPerField +
      actionHeight +
      padding +
      fieldRowGap * (fieldRows - 1) +
      cardGap // Explicitly include gap between cards
    );
  };

  // Function to return column width
  // const getColumnWidth = () => window.innerWidth;

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= rowData.length) return null;
    const row = rowData[index];
    const fields = Object.keys(row).filter(
      (key) => key !== "id" && key !== "action"
    );

    return (
      <div
        style={{ ...style, marginBottom: `${cardGap}px`, padding: "0 8px" }}
        className="p-1"
      >
        <div
          className="custom-card"
          style={{ ...cardVars } as React.CSSProperties}
        >
          <div className="card-body">
            <div className="fields-wrapper">
              {fields.reduce((acc: JSX.Element[], key, i) => {
                if (i % 2 === 0) {
                  acc.push(
                    <div key={i} className="field-row">
                      <div className="field-container">
                        <div className="field-label-wrapper">
                          {getIconForField(key)}
                          <span className="field-label">
                            {key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                        </div>
                        <span
                          className={
                            isInteger(row[key])
                              ? "field-value-integer"
                              : "field-value"
                          }
                        >
                          {row[key] ?? "N/A"}
                        </span>
                      </div>
                      {fields[i + 1] && (
                        <div className="field-container">
                          <div className="field-label-wrapper">
                            {getIconForField(fields[i + 1])}
                            <span className="field-label">
                              {fields[i + 1]
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                          </div>
                          <span
                            className={
                              isInteger(row[fields[i + 1]])
                                ? "field-value-integer"
                                : "field-value"
                            }
                          >
                            {row[fields[i + 1]] ?? "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }
                return acc;
              }, [])}
            </div>
          </div>
          {hasAction && (
            <div className="card-footer">
              <div
                className="action-button"
                onClick={() => {
                  const originalRowData = tableData?.RptBody?.[index];
                  const code = originalRowData?.Data?.[0];
                  if (
                    tableData?.Action?.ViewType &&
                    code &&
                    handleViewDrillDown
                  ) {
                    handleViewDrillDown(
                      tableData.Action.RepID ?? "",
                      tableData.Action.ViewType,
                      Number(code),
                      originalRowData?.FY,
                      tableData?.RepOpt
                    );
                  }
                }}
              >
                <FaEye size={14} color="#004588" />
                View Details
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Fallback UI for empty data
  if (!rowData || rowData.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          color: theme === "dark_mode" ? "#a0aec0" : "#4a5568",
          fontSize: "0.9rem",
          textAlign: "center",
          padding: "20px",
        }}
      >
        No data available to display.
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .custom-card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-left: 4px solid ${themeColor};
            border-radius: 10px;
            box-shadow: var(--shadow);
            display: flex;
            flex-direction: column;
            width: 100%;
            transition: all 0.3s ease;
            font-family: 'Segoe UI', 'Roboto', sans-serif;
          }

          .custom-card:hover {
            transform: var(--hover-transform);
            box-shadow: var(--hover-shadow);
          }

          .card-body {
            flex-grow: 1;
            padding: 14px 12px;
          }

          .fields-wrapper {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .field-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
          }

          .field-container {
            display: flex;
            flex-direction: column;
            flex: 1;
            min-width: 0;
            max-width: 48%;
            padding: 6px;
            border-radius: 6px;
            transition: background 0.2s ease;
          }

          .field-label-wrapper {
            display: flex;
            align-items: center;
            width: 100%;
            margin-bottom: 4px;
          }

          .field-label {
            font-size: 0.85rem;
            color: var(--label);
            font-weight: 500;
            overflow-wrap: break-word;
            word-break: break-all;
            width: 100%;
          }

          .field-value,
          .field-value-integer {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--value);
            overflow-wrap: break-word;
            word-break: break-all;
            width: 100%;
            padding: 4px 8px;
            border-radius: 4px;
          }

          .field-value-integer {
            color: var(--integer-value);
            background: var(--integer-bg);
            border-left: 2px solid var(--integer-value);
          }

          .card-footer {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            padding: 12px 0;
            border-top: 1px solid var(--border);
            margin-top: auto;
          }

          .action-button {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.85rem;
            color: #004588;
            font-weight: 600;
            cursor: pointer;
            padding: 6px 16px;
            border-radius: 18px;
            background: rgba(0, 69, 136, 0.12);
            transition: all 0.2s ease;
          }

          .action-button:hover {
            background: rgba(0, 69, 136, 0.22);
            color: #003366;
          }

          .field-row:hover .field-icon { 
            transform: scale(1.15); 
          }
        `}
      </style>
      <div
        style={{ height: "70vh", width: "100%", overflow: "hidden" }}
        className="mt-2"
      >
        <AutoSizer>
          {({ height, width }) => {
            const rowCount = rowData.length;

            return (
              <Grid
                columnCount={columnCount}
                columnWidth={() => width}
                height={height}
                rowCount={rowCount}
                rowHeight={getRowHeight}
                width={width}
                style={{ overflowX: "hidden", overflowY: "auto" }}
              >
                {Cell}
              </Grid>
            );
          }}
        </AutoSizer>
      </div>
    </>
  );
};

export default CardGridView;
