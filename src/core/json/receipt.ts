import { OptionType } from "../../common/component/InputSelect";
import moment from "moment";

// types.ts
export interface FieldProps {
  name?: string;
  label?: string;
  labelCol?: string;
  selectCol?: string;
  inputCol?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  validation?: Record<string, any>;
  isClearable?: boolean;
  rows?: number;
  accept?: string;
  maxSize?: number;
  dangerTag?: string;
  options?: OptionType[];
  disabled?: boolean;
}

export interface FieldSchema {
  type: string;
  description: string;
  component:
    | "InputField"
    | "InputSelect"
    | "TextareaField"
    | "InputDate"
    | "InputImage"
    | "InputToggle"
    | "DocumentUpload"
    | "InputRadio";
  props: FieldProps;
}

export interface FormSchema {
  type: string;
  properties: Record<string, FieldSchema>;
  required: string[];
}
export type ColumnSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
// export const receipt: FormSchema = {
export const receipt = (col: ColumnSize): FormSchema => ({
  type: "object",
  properties: {
    series: {
      type: "string",
      description: "Series for the sale/purchase order",
      component: "InputSelect",
      props: {
        name: "series",
        label: "Series",
        labelCol: `col-md-${col}`,
        selectCol: `col-md-${12 - col}`,
        // labelCol: "col-md-3",
        // selectCol: "col-md-9",
        required: true,
        isClearable: true,
      },
    },
    date: {
      type: "string",
      description: "Date of the sale/purchase order",
      component: "InputDate",
      props: {
        name: "date",
        label: "Date",
        placeholder: "Select Date",
        required: true,
        autoComplete: "off",
      },
    },
    vchNo: {
      type: "string",
      description: "Voucher number for the order",
      component: "InputField",
      props: {
        name: "vchNo",
        label: "Vch No",
        type: "text",
        placeholder: "Enter Voucher Number",
        labelCol: "col-md-4",
        inputCol: "col-md-8",
        required: false,
        disabled: true,
        autoComplete: "off",
      },
    },
    type: {
      type: "string",
      description: "Series for the sale/purchase order",
      component: "InputSelect",
      props: {
        name: "type",
        label: "Type",
        labelCol: "col-md-4",
        selectCol: "col-md-8",
        required: true,
        isClearable: true,
      },
    },
    pdcDate: {
      type: "string",
      description: "Date of the sale/purchase order",
      component: "InputDate",
      props: {
        name: "pdcDate",
        label: "PDC",
        placeholder: "Select Date",
        required: false,
        autoComplete: "off",
        validation: {
          validate: (value: string, formValues: any) => {
            if (formValues.type?.value === 1 && value) {
              const pdcDate = moment(value);
              const date = moment(formValues.date);
              return (
                pdcDate.isSameOrAfter(date, "day") ||
                "PDC Date cannot be earlier than the Date"
              );
            }
            return true;
          },
        },
      },
    },
    gstNature: {
      type: "string",
      description: "Customer for the sale/purchase order",
      component: "InputSelect",
      props: {
        name: "gstNature",
        label: "Gst Nature",
        labelCol: "col-md-2",
        selectCol: "col-md-10",
        required: false,
        isClearable: true,
      },
    },
    narration: {
      type: "string",
      description: "Enter Your Narration",
      component: "InputField",
      props: {
        name: "narration",
        label: "Narration",
        type: "text",
        placeholder: "Enter Narration",
        required: false,
        autoComplete: "given-name",
        labelCol: "col-md-1",
        inputCol: "col-md-11",
        validation: {
          maxLength: {
            value: 100,
            message: "Name cannot exceed 100 characters",
          },
        },
      },
    },
    narration1: {
      type: "string",
      description: "Enter Your Narration",
      component: "InputField",
      props: {
        name: "narration1",
        label: " ",
        type: "text",
        placeholder: "Enter Narration1",
        required: false,
        autoComplete: "given-name",
        labelCol: "col-md-1",
        inputCol: "col-md-11",
        validation: {
          maxLength: {
            value: 100,
            message: "Name cannot exceed 100 characters",
          },
        },
      },
    },
  },
  required: ["date", "vchNo", "customer"],
});
