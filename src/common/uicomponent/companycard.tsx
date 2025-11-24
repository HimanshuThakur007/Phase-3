import React from "react";

interface KanbanCardProps {
  title: string; // e.g., RptBody.Data[1] (Name)
  className?: string; // Optional for additional card styling
  children?: React.ReactNode; // To render the left/right data split
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  // title,
  className = "",
  children,
}) => {
  return (
    <div className={`card border border-secondary ${className}`}>
      <div className="card-body">
        {/* <p
          className="card-title mb-2"
          style={{ fontSize: "14px", fontWeight: 600, lineHeight: 1 }}
        >
          {title}
        </p> */}
        <div className="d-flex flex-wrap gap-2">{children}</div>
      </div>
    </div>
  );
};

export default KanbanCard;
