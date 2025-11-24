import { Path, UseFormReturn } from "react-hook-form";

interface BaseFieldProps<T> {
  name: Path<T>;
  label: string;
  required?: boolean;
  validation?: Record<string, any>;
  placeholder?: string;
  autoComplete?: string;
  hidden?: boolean;
  labelCol?: string;
  inputCol?: string;
  selectCol?: string;
}

interface InputFieldProps<T> extends BaseFieldProps<T> {
  maxLength?: number;
  disabled?: boolean;
  type?: string;
}

interface TextareaFieldProps<T> extends BaseFieldProps<T> {
  disabled?: boolean;
  rows?: number;
}

interface InputSelectProps<T> extends BaseFieldProps<T> {
  disabled?: boolean;
  isClearable?: boolean;
}

interface InputDateProps<T> extends BaseFieldProps<T> {
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  isClearable?: boolean;
  dateFormat?: string;
}

interface InputImageProps<T> extends BaseFieldProps<T> {
  disabled?: boolean;
  accept?: string;
  maxSize?: number;
}

interface InputToggleProps<T> extends BaseFieldProps<T> {
  colAlign: any;
  disabled?: boolean;
  dangerTag?: string;
  error?: string;
}

interface MultiImageProps<T> extends BaseFieldProps<T> {
  disabled?: boolean;
  accept?: string;
  maxSize?: number;
}

interface InputRadioProps<T> extends BaseFieldProps<T> {
  options: never[];
  disabled?: boolean;
  textPlaceholder?: string;
  defaultValue?: { radio: boolean; text: string };
}

interface DocumentUploadProps<T> extends BaseFieldProps<T> {
  disabled?: boolean;
  accept?: string;
  maxSize?: number;
  form: UseFormReturn<any>;
}

export type FieldSchema<T extends Record<string, any>> =
  | { component: "InputField"; props: InputFieldProps<T> }
  | { component: "InputSelect"; props: InputSelectProps<T> }
  | { component: "TextareaField"; props: TextareaFieldProps<T> }
  | { component: "InputDate"; props: InputDateProps<T> }
  | { component: "InputImage"; props: InputImageProps<T> }
  | { component: "InputToggle"; props: InputToggleProps<T> }
  | { component: "MultiImage"; props: MultiImageProps<T> }
  | { component: "InputRadio"; props: InputRadioProps<T> }
  | { component: "DocumentUpload"; props: DocumentUploadProps<T> };
