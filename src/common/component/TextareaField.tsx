import React, { memo } from "react";
import { FieldError } from "react-hook-form";

interface TextareaFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  error?: FieldError;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  value = "",
  onChange,
  onBlur,
  error,
}) => {
  return (
    <div className="row mb-3">
      {label && (
        <label htmlFor={name} className="col-form-label col-md-3">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className="col-md-9">
        <textarea
          id={name}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder || `Enter ${label}`}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`form-control ${error ? "is-invalid" : ""}`}
        />
        {error && <div className="invalid-feedback">{error.message}</div>}
      </div>
    </div>
  );
};

export default memo(TextareaField);
