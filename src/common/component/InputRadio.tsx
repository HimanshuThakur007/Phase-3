import {
  Control,
  Controller,
  // FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  rules?: Record<string, any>;
  options: RadioOption[];
  error?: any;
  disabled?: boolean;
  // defaultValue?: string;
}

export const InputRadio = <T extends FieldValues>({
  name,
  control,
  rules,
  options,
  error,
  disabled,
}: RadioProps<T>) => {
  const getErrorMessage = (err: any): string | undefined => {
    if (err && typeof err.message === "string") {
      return err.message;
    }
    return undefined;
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className="mb-2 d-flex justify-content-between">
          {options.map((option) => (
            <div key={option.value} className="form-check mb-2">
              <input
                type="radio"
                id={`${name}-${option.value}`}
                value={option.value}
                checked={field.value === option.value}
                onChange={() => field.onChange(option.value)}
                className="form-check-input"
                aria-label={`Radio button for ${option.label}`}
                disabled={disabled}
              />
              <label
                className="form-check-label"
                htmlFor={`${name}-${option.value}`}
              >
                {option.label}
              </label>
            </div>
          ))}
          {error && getErrorMessage(error) && (
            <div className="invalid-feedback d-block">
              {getErrorMessage(error)}
            </div>
          )}
        </div>
      )}
    />
  );
};
