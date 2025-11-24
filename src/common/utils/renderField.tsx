import { JSX } from "react";
import { Controller, UseFormReturn } from "react-hook-form";
import InputSelect, { OptionType } from "../component/InputSelect";
import DatePicker from "../component/DatePicker";
import InputToggle from "../component/InputToggel";
import ImageUpload from "../component/ImageUpload";
import MultiImageUpload from "../component/MultiImageUpload";
import { InputRadio } from "../component/InputRadio";
import DocumentUpload from "../component/DocumentUpload";
import InputField from "../component/InputField";
import TextareaField from "../component/TextareaField";
import { FieldSchema } from "./type";

interface RenderFieldProps<T extends Record<string, any>> {
  field: FieldSchema<T>;
  form: UseFormReturn<T>;
  options?: OptionType[];
  key: string;
}

export const renderField = <T extends Record<string, any>>({
  field,
  form,
  options = [],
  key,
}: RenderFieldProps<T>): JSX.Element | null => {
  const { component, props } = field;
  const {
    control,
    formState: { errors },
  } = form;

  // Construct validation object, converting pattern strings to RegExp
  const validation = {
    required: props.required ? `${props.label} is required` : false,
    ...props.validation,
    ...(props.validation?.pattern
      ? {
          pattern: {
            value: new RegExp(props.validation.pattern.value),
            message: props.validation.pattern.message,
          },
        }
      : {}),
  };

  // If field is hidden, return null (handled by parent div in SeriesCreateOrEdit)
  if (props.hidden) {
    if (component === "InputDate") {
      // Render InputDate with display: none to keep ReactDatePicker in the tree
      return (
        <div style={{ display: "none" }}>
          <Controller
            name={props.name}
            control={control}
            rules={{
              required: false, // No validation when hidden
            }}
            render={({ field }) => (
              <DatePicker
                {...props}
                selectedDate={field.value ? new Date(field.value) : null}
                onChange={(date: Date | null) =>
                  field.onChange(date ? date.toISOString() : null)
                }
                error={undefined}
                disabled={true}
              />
            )}
          />
        </div>
      );
    }
    return null; // Other components can be fully skipped
  }

  switch (component) {
    case "InputField":
      return (
        <Controller
          name={props.name}
          control={control}
          rules={validation}
          render={({ field, fieldState: { error } }) => (
            <InputField
              {...props}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={error}
              disabled={props.disabled}
              labelCol={props.labelCol} // Pass labelCol
              inputCol={props.inputCol}
              maxLength={props.maxLength}
            />
          )}
        />
      );
    case "InputSelect":
      return (
        <Controller
          name={props.name}
          control={control}
          rules={{
            required: props.required ? `${props.label} is required` : false,
          }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <div>
              <InputSelect
                {...props}
                options={options}
                value={value || null}
                onChange={(selected) => {
                  onChange(selected ? (selected as OptionType) : null);
                }}
                isClearable={false}
                isDisabled={props.disabled}
                labelCol={props.labelCol} // Pass labelCol
                selectCol={props.selectCol}
              />
              {error && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {error.message}
                </div>
              )}
            </div>
          )}
        />
      );
    case "TextareaField":
      return (
        <Controller
          name={props.name}
          control={control}
          rules={validation}
          render={({ field, fieldState: { error } }) => (
            <TextareaField
              {...props}
              value={field.value || ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={error}
              disabled={props.disabled}
            />
          )}
        />
      );
    case "InputDate":
      return (
        <Controller
          name={props.name}
          control={control}
          rules={{
            required: props.required ? `${props.label} is required` : false,
            ...props.validation,
          }}
          render={({ field, fieldState: { error } }) => (
            <DatePicker
              {...props}
              selectedDate={field.value ? new Date(field.value) : null}
              onChange={(date: Date | null) =>
                field.onChange(date ? date.toISOString() : null)
              }
              error={error?.message}
              disabled={props.disabled}
              disablePastDates={true}
            />
          )}
        />
      );
    case "InputImage":
      return (
        <Controller
          name={props.name}
          control={control}
          rules={{
            required: props.required ? `${props.label} is required` : false,
            ...props.validation,
          }}
          render={({ fieldState: { error } }) => (
            <ImageUpload
              {...props}
              error={error?.message}
              disabled={props.disabled}
            />
          )}
        />
      );
    case "DocumentUpload":
      return <DocumentUpload {...props} form={form} />;
    case "MultiImage":
      return (
        <Controller
          name={props.name}
          control={control}
          rules={{
            required: props.required ? `${props.label} is required` : false,
            ...props.validation,
          }}
          render={({ fieldState: { error } }) => (
            <div>
              <MultiImageUpload
                {...props}
                name={props.name}
                modifyId={0}
                disabled={props.disabled}
              />
              {error && (
                <div className="invalid-feedback" style={{ display: "block" }}>
                  {error.message}
                </div>
              )}
            </div>
          )}
        />
      );
    case "InputToggle":
      return (
        <Controller
          name={props.name}
          control={control}
          rules={{
            required: props.required ? `${props.label} is required` : false,
            ...props.validation,
          }}
          render={({ field, fieldState: { error } }) => (
            <InputToggle
              {...props}
              id={props.name}
              labelName={props.label}
              initialValue={field.value ?? 0}
              dangerTag={props.dangerTag}
              name={props.name}
              error={error?.message}
              disabled={props.disabled}
              colAlign={props.colAlign}
            />
          )}
        />
      );
    case "InputRadio":
      return (
        <InputRadio
          {...props}
          control={control}
          name={props.name}
          options={props.options || []}
          rules={validation}
          error={errors[key]}
          disabled={props.disabled}
        />
      );
    default:
      return null;
  }
};
