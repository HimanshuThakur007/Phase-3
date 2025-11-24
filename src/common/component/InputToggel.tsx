// import React, { useEffect } from "react";
// import { useFormContext, Controller } from "react-hook-form";
// import "./checkboxstyle.css";

// interface InputToggleProps {
//   id: string;
//   labelName: string;
//   initialValue: number;
//   dangerTag?: string;
//   name: string;
//   error?: string;
//   disabled?: any;
// }

// const InputToggle: React.FC<InputToggleProps> = ({
//   id,
//   labelName,
//   initialValue,
//   dangerTag,
//   name,
//   error,
//   disabled,
// }) => {
//   const { control, setValue } = useFormContext();

//   useEffect(() => {
//     setValue(name, initialValue);
//   }, [initialValue, name, setValue]);

//   return (
//     <div className="row mb-3 align-items-center">
//       <label className="col-form-label col-md-3">
//         {labelName} <span className="text-danger">{dangerTag}</span>
//       </label>
//       <div className="col-md-9">
//         <div className="checkbox-apple">
//           <Controller
//             name={name}
//             control={control}
//             render={({ field }) => (
//               <input
//                 className="yep"
//                 id={id}
//                 type="checkbox"
//                 checked={field.value === 1}
//                 onChange={(e) => {
//                   const newValue = e.target.checked ? 1 : 0;
//                   field.onChange(newValue);
//                 }}
//                 disabled={disabled}
//               />
//             )}
//           />
//           <label htmlFor={id} className="form-label"></label>
//           {error && (
//             <div className="invalid-feedback" style={{ display: "block" }}>
//               {error}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InputToggle;

import React, { useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import "./checkboxstyle.css";

interface InputToggleProps {
  id: string;
  labelName: string;
  initialValue: number;
  dangerTag?: string;
  name: string;
  error?: string;
  disabled?: any;
  onToggleChange?: (value: number) => void;
  colAlign?: number;
  offColor?: string; // New prop for off state color
}

const InputToggle: React.FC<InputToggleProps> = ({
  id,
  labelName,
  initialValue,
  dangerTag,
  name,
  error,
  disabled,
  onToggleChange,
  colAlign = 3,
  offColor = "#e0dedeff", // Default off color set to grey
}) => {
  const { control, setValue } = useFormContext();

  useEffect(() => {
    setValue(name, initialValue);
  }, [initialValue, name, setValue]);

  return (
    <div className="row mb-3 align-items-center">
      <label className={`col-form-label col-md-${colAlign}`}>
        {labelName} <span className="text-danger">{dangerTag}</span>
      </label>
      <div className={`col-md-${12 - colAlign}`}>
        <div
          className="checkbox-apple"
          style={{ "--off-color": offColor } as React.CSSProperties}
        >
          <Controller
            name={name}
            control={control}
            render={({ field }) => (
              <input
                className="yep"
                id={id}
                type="checkbox"
                checked={field.value === 1}
                onChange={(e) => {
                  const newValue = e.target.checked ? 1 : 0;
                  field.onChange(newValue);
                  if (onToggleChange) {
                    onToggleChange(newValue);
                  }
                }}
                disabled={disabled}
              />
            )}
          />
          <label htmlFor={id} className="form-label"></label>
          {error && (
            <div className="invalid-feedback" style={{ display: "block" }}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputToggle;
