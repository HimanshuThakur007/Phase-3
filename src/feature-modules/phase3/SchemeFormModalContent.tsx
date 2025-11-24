// src/pages/phase3/SchemeFormModalContent.tsx
import React from "react";
import { useFormContext } from "react-hook-form";
import { renderField } from "../../common/utils/renderField";

interface SchemeFormModalContentProps {
  fields: Record<string, any>;
  itemCode: string;
  itemName: string;
  selectOptions: Record<string, any[]>;
  wideFields?: string[];
}

const SchemeFormModalContent: React.FC<SchemeFormModalContentProps> = ({
  fields,
  itemCode,
  itemName,
  selectOptions,
  wideFields = [],
}) => {
  const { watch } = useFormContext();
  const schemeType = watch("schemeType");

  return (
    <>
      {/* Item Info Header */}
      <div className="mb-4 p-3 bg-light rounded border">
        <div className="d-flex align-items-center mb-2">
          <div className="me-3 p-2 bg-white rounded border flex-grow-1">
            <small className="text-muted d-block">Item Code</small>
            <strong className="text-primary">{itemCode || "N/A"}</strong>
          </div>
          <div className="p-2 bg-white rounded border flex-grow-2">
            <small className="text-muted d-block">Item Name</small>
            <strong className="text-primary">{itemName || "N/A"}</strong>
          </div>
        </div>
      </div>

      {/* Dynamic Fields */}
      <div className="row">
        {Object.entries(fields)
          .filter(([key]) => {
            // Hide schemeGroup unless schemeType is selected
            if (key === "schemeGroup") {
              return !!schemeType;
            }
            return true;
          })
          .map(([key, field]) => {
            const isWide = wideFields.includes(key);
            const options = selectOptions[key] || [];

            return (
              <div
                key={key}
                className={`mb-3 ${isWide ? "col-12" : "col-lg-6 col-md-6"}`}
              >
                {renderField({
                  field,
                  form: useFormContext(),
                  options,
                  key: key,
                })}
              </div>
            );
          })}
      </div>
    </>
  );
};

export default SchemeFormModalContent;
