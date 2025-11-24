import React from "react";

// Define the shape of each count item
export interface CountItem {
  label: string;
  value: string | number | undefined;
  recType?: number;
}

// Define the shape of the props
interface CountCardProps {
  items: CountItem[];
  title: string;
  iconType?: string;
  backgroundColor: string;
  fontColor: string;
  colSize?: "4" | "6";
  rapId?: string;
  onItemClick?: (rapId: string, masterCode: number, recType: number) => void;
  onCardClick?: (rapId: string, masterCode: number, recType: number) => void; // Add onCardClick prop
}

const ExpenseCard: React.FC<CountCardProps> = ({
  items,
  title,
  backgroundColor,
  fontColor,
  colSize = "4",
  rapId,
  onItemClick,
  onCardClick,
}) => {
  return (
    <div className={`col-xl-${colSize} col-sm-6 col-12 d-flex`}>
      <div
        className="card shadow-sm w-100"
        style={{
          cursor: rapId && onCardClick ? "pointer" : "default",
        }}
        onClick={() => rapId && onCardClick && onCardClick(rapId, 0, 0)}
      >
        <div className="card-header">
          <h5 className="text-center">{title}</h5>
        </div>
        <div
          className="card-body"
          style={{ backgroundColor, color: fontColor }}
        >
          <div className="row">
            {items.map((item, index) => (
              <div key={index} className="col-12 mb-2">
                <div className="d-flex justify-content-between">
                  <span className="fw-bold" style={{ color: fontColor }}>
                    {item.label}
                  </span>
                  <span
                    style={{
                      color: fontColor,
                      cursor:
                        item.recType && rapId && onItemClick
                          ? "pointer"
                          : "default",
                      textDecoration:
                        item.recType && rapId && onItemClick
                          ? "underline"
                          : "none",
                    }}
                    onClick={() =>
                      item.recType &&
                      rapId &&
                      onItemClick &&
                      onItemClick(rapId, 0, item.recType)
                    }
                  >
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;
