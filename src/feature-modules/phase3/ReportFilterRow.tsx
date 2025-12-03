import React from "react";

interface ReportFilterRowProps {
  properties: Record<string, any>;
  renderField: (field: any, key: string) => React.ReactNode;
  onSubmit?: () => void;
}

export const ReportFilterRow: React.FC<ReportFilterRowProps> = ({
  properties,
  renderField,
  onSubmit,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  // const formInput = p3Filter.properties;

  return (
    <div className="row g-3 mb-2">
      {Object.entries(properties).map(([key, field]) => (
        <div key={key} className="col-lg-12 col-md-12 col-sm-12">
          {renderField(field, key)}
        </div>
      ))}

      {/* ---- Submit button ---- */}
      <div className="col-lg-12 col-md-12 col-sm-12 d-flex align-items-center d-none">
        <button
          type="submit"
          className="btn btn-primary w-100 mt-lg-4"
          onClick={handleClick}
        >
          Show Report
        </button>
      </div>
    </div>
  );
};
