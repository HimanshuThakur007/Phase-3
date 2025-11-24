import React from "react";
import GridTable from "../component/GridTable";

interface Transaction {
  [key: string]: any;
}

interface CardProps {
  title?: string;
  rowData: Transaction[];
  coldef?: any[];
  colSize?: string;
  onRowClick?: any;
  cursor?: string;
  height?: string;
  total?: number;
  onRefresh?: () => void;
}

const DashbordTableCard: React.FC<CardProps> = ({
  title = "",
  rowData = [],
  coldef,
  colSize = "6",
  onRowClick,
  height = "100%",
  total,
  onRefresh,
}) => {
  return (
    <div className={`col-xl-${colSize} col-sm-12 col-12 d-flex`}>
      <div className="card flex-fill default-cover mb-4 d-flex flex-column">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">{title}</h4>
          <div className="d-flex align-items-center gap-2">
            {total !== undefined && (
              <h6 className="mb-0 fw-bold">{total.toLocaleString("en-IN")}</h6>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh && onRefresh();
              }}
              style={{
                background: "#004588",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                transition: "all 0.2s ease",
              }}
              title="Refresh"
            >
              ⟳
            </button>
          </div>
        </div>
        <div
          className="card-body m-0 p-0 flex-grow-1 d-flex flex-column"
          style={{ minHeight: "350px" }}
        >
          <GridTable
            columnDefs={coldef || []}
            rowData={rowData}
            height={height}
            onRowClick={onRowClick}
            cursor="1"
          />
        </div>
      </div>
    </div>
  );
};

export default DashbordTableCard;
