import React, { memo, useState } from "react";
import { FieldError } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

interface InputFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: FieldError;
  labelCol?: string;
  inputCol?: string;
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  autoComplete = "off",
  value = "",
  onChange,
  onBlur,
  error,
  labelCol = "col-md-3",
  inputCol = "col-md-9",
  maxLength,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useSelector((state: RootState) => state.root.theme);
  const IconColor = theme === "dark_mode" ? "#ffffff" : "#000000";
  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="mb-2 row">
      {label && (
        <label htmlFor={name} className={`col-form-label ${labelCol}`}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <div className={`position-relative ${inputCol}`}>
        <input
          id={name}
          type={type === "password" && showPassword ? "text" : type}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder={placeholder || `Enter ${label || name}`}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          maxLength={maxLength}
          className={`form-control ${error ? "is-invalid" : ""}`}
          style={{
            paddingRight: type === "password" ? "40px" : "12px",
            backgroundImage: "none",
          }}
        />
        {type === "password" && (
          // <span
          //   className={`position-absolute top-${
          //     error ? 22 : 50
          //   } end-0 translate-middle-y me-3`}
          //   style={{ cursor: "pointer", zIndex: 2 }}
          //   onClick={togglePassword}
          //   aria-label={showPassword ? "Hide password" : "Show password"}
          // >
          //   <i
          //     className={`bi ${!showPassword ? "bi-eye-slash" : "bi-eye"}`}
          //   ></i>
          // </span>
          <span
            style={{
              position: "absolute",
              top: error ? "30%" : "50%",
              right: "15px",
              transform: "translateY(-50%)",
              cursor: "pointer",
              zIndex: 10,
              color: IconColor,
            }}
            onClick={togglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i
              className={`bi ${!showPassword ? "bi-eye-slash" : "bi-eye"}`}
            ></i>
          </span>
        )}
        {error && <div className="invalid-feedback">{error.message}</div>}
      </div>
    </div>
  );
};

export default memo(InputField);
