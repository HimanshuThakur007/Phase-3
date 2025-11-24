import React, { useMemo } from "react";
import GridTable from "../../common/component/GridTable";
import PieChartCard from "./PieChartCard";
import BarChartCard from "./BarChartCard";
import "./CustomDrawer.css";

// Define interfaces for type safety

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface BarData {
  name: string;
  y: number;
}

interface CustomDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  viewType: number;
  setViewType: (viewType: number) => void;
  expenseDirectData: {
    table: any[];
    pie: PieData[];
    line: BarData[];
    onRowClick: (event: any) => void;
  };
  expenseIndirectData: {
    table: any[];
    pie: PieData[];
    line: BarData[];
    onRowClick: (event: any) => void;
  };
  onViewTypeChange: (viewType: number) => void;
  theme?: "light_mode" | "dark_mode"; // Restrict theme to specific values
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  isVisible,
  onClose,
  title = "Expenses",
  width = 720,
  viewType,
  setViewType,
  expenseDirectData,
  expenseIndirectData,
  onViewTypeChange,
  theme = "light_mode",
}) => {
  const handleTabClick = (newViewType: number) => {
    setViewType(newViewType);
    onViewTypeChange(newViewType);
  };

  // Memoize total calculations to avoid recalculating on every render
  const expenseDirectTotal = useMemo(
    () =>
      expenseDirectData.table
        .reduce((sum, item) => {
          const balance = parseFloat(String(item?.Balance)) || 0;
          return sum + balance;
        }, 0)
        .toFixed(2),
    [expenseDirectData.table]
  );

  const expenseIndirectTotal = useMemo(
    () =>
      expenseIndirectData.table
        .reduce((sum, item) => {
          const balance = parseFloat(String(item?.Balance)) || 0;
          return sum + balance;
        }, 0)
        .toFixed(2),
    [expenseIndirectData.table]
  );

  // Helper component for "No Data" message
  const NoDataCard = ({ title }: { title: string }) => (
    <div className="no-data-card">
      <h6 className="text-center mb-0">{title}</h6>
      <p className="text-center text-muted">No Data Available</p>
    </div>
  );

  return (
    <div
      className={`custom-drawer ${isVisible ? "open" : ""} ${
        theme === "dark_mode" ? "dark" : ""
      }`}
      style={{ maxWidth: `${width}px` }}
    >
      <div className="drawer-header">
        <h5>{title}</h5>
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close drawer"
        >
          ×
        </button>
      </div>
      <div className="drawer-tabs">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <button
              className={`nav-link ${viewType === 3 ? "active" : ""}`}
              onClick={() => handleTabClick(3)}
              aria-selected={viewType === 3}
              role="tab"
            >
              Table
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${viewType === 1 ? "active" : ""}`}
              onClick={() => handleTabClick(1)}
              aria-selected={viewType === 1}
              role="tab"
            >
              Pie Chart
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${viewType === 2 ? "active" : ""}`}
              onClick={() => handleTabClick(2)}
              aria-selected={viewType === 2}
              role="tab"
            >
              Bar Chart
            </button>
          </li>
        </ul>
      </div>
      <div className="drawer-body">
        {viewType === 3 && (
          <>
            {expenseDirectData.table.length > 0 ? (
              <>
                <h5 className="mainlandingpage text-center mb-2">
                  Expense Direct
                </h5>
                <GridTable
                  columnDefs={[
                    {
                      field: "Name",
                      headerName: "Name",
                      flex: 1,
                      wrapText: true,
                      filter: false,
                    },
                    {
                      field: "Balance",
                      headerName: "Balance",
                      filter: false,
                      type: "number",
                      cellStyle: {
                        textAlign: "right",
                        whiteSpace: "normal",
                      },
                    },
                  ]}
                  rowData={expenseDirectData.table}
                  cursor="1"
                  height="250px"
                  onRowClick={expenseDirectData.onRowClick}
                />
                <div className="text-end pe-3 fw-bold mb-3">
                  Total: {Number(expenseDirectTotal).toLocaleString("en-IN")}
                </div>
              </>
            ) : (
              <NoDataCard title="Expense Direct" />
            )}
            {expenseIndirectData.table.length > 0 ? (
              <>
                <h5 className="text-center mt-2 mb-2">Expense Indirect</h5>
                <GridTable
                  columnDefs={[
                    {
                      field: "Name",
                      headerName: "Name",
                      flex: 1,
                      wrapText: true,
                      filter: false,
                    },
                    {
                      field: "Balance",
                      headerName: "Balance",
                      filter: false,
                      type: "number",
                      cellStyle: {
                        textAlign: "right",
                        whiteSpace: "normal",
                      },
                    },
                  ]}
                  rowData={expenseIndirectData.table}
                  cursor="1"
                  height="250px"
                  onRowClick={expenseIndirectData.onRowClick} // Fixed: Use expenseIndirectData.onRowClick
                />
                <div className="text-end pe-3 fw-bold mb-3">
                  Total: {Number(expenseIndirectTotal).toLocaleString("en-IN")}
                </div>
              </>
            ) : (
              <NoDataCard title="Expense Indirect" />
            )}
          </>
        )}
        {viewType === 1 && (
          <>
            {expenseDirectData.pie.length > 0 ? (
              <PieChartCard
                title="Expense Direct"
                data={expenseDirectData.pie}
                theme={theme}
              />
            ) : (
              <NoDataCard title="Expense Direct" />
            )}
            {expenseIndirectData.pie.length > 0 ? (
              <PieChartCard
                title="Expense Indirect"
                data={expenseIndirectData.pie}
                theme={theme}
              />
            ) : (
              <NoDataCard title="Expense Indirect" />
            )}
          </>
        )}
        {viewType === 2 && (
          <>
            {expenseDirectData.line.length > 0 ? (
              <BarChartCard
                title="Expense Direct"
                data={expenseDirectData.line}
                theme={theme}
              />
            ) : (
              <NoDataCard title="Expense Direct" />
            )}
            {expenseIndirectData.line.length > 0 ? (
              <BarChartCard
                title="Expense Indirect"
                data={expenseIndirectData.line}
                theme={theme}
              />
            ) : (
              <NoDataCard title="Expense Indirect" />
            )}
          </>
        )}
      </div>
      <div className="drawer-footer">
        <button className="btn btn-secondary me-2" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CustomDrawer;
