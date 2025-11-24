// // components/DatePicker.tsx
// import React from "react";
// import ReactDatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// interface DatePickerProps {
//   selectedDate: Date | null;
//   onChange: (date: Date | null) => void;
//   placeholder?: string;
//   minDate?: Date;
//   maxDate?: Date;
//   isClearable?: boolean;
//   dateFormat?: string;
//   disabled?: boolean;
//   label?: string;
//   required?: boolean;
//   error?: string;
//   name?: string;
// }

// const DatePicker: React.FC<DatePickerProps> = ({
//   selectedDate,
//   onChange,
//   placeholder = "Select date",
//   minDate,
//   maxDate,
//   isClearable = false,
//   dateFormat = "dd/MM/yyyy",
//   disabled = false,
//   label,
//   required = false,
//   error,
//   name,
// }) => {
//   return (
//     <div className="mb-2 add-product">
//       {label && (
//         <label htmlFor={name} className="col-form-label">
//           {label} {required && <span className="text-danger">*</span>}
//         </label>
//       )}
//       {/* <div className="col-md-9"> */}
//       <ReactDatePicker
//         id={name}
//         selected={selectedDate}
//         onChange={onChange}
//         placeholderText={placeholder}
//         minDate={minDate}
//         maxDate={maxDate}
//         isClearable={isClearable}
//         dateFormat={dateFormat}
//         disabled={disabled}
//         className={`form-control ${error ? "is-invalid" : ""}`}
//       />
//       {error && <div className="invalid-feedback">{error}</div>}
//       {/* </div> */}
//     </div>
//   );
// };

// export default DatePicker;

// components/DatePicker.tsx
import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  isClearable?: boolean;
  dateFormat?: string;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  name?: string;
  /** New: Disable all dates before today */
  disablePastDates?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
  isClearable = false,
  dateFormat = "dd/MM/yyyy",
  disabled = false,
  label,
  required = false,
  error,
  name,
  disablePastDates = false,
}) => {
  // Dynamically compute minDate: use provided minDate or today if disablePastDates is true
  const effectiveMinDate = disablePastDates ? new Date() : minDate;

  // Helper: disable past dates in calendar (extra safety)
  const filterDate = disablePastDates
    ? (date: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }
    : undefined;

  return (
    <div className="mb-2 add-product">
      {label && (
        <label htmlFor={name} className="col-form-label">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <ReactDatePicker
        id={name}
        selected={selectedDate}
        onChange={onChange}
        placeholderText={placeholder}
        minDate={effectiveMinDate}
        maxDate={maxDate}
        isClearable={isClearable}
        dateFormat={dateFormat}
        disabled={disabled}
        filterDate={filterDate} // Extra protection
        className={`form-control ${error ? "is-invalid" : ""}`}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        popperClassName="react-datepicker-popper"
        autoComplete="off"
      />

      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default DatePicker;
