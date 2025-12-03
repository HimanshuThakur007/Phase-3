export interface FieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  validation?: Record<string, any>;
  isClearable?: boolean;
  rows?: number;
  accept?: string;
  maxSize?: any;
  isMulti?: any;
}

export interface FieldSchema {
  type: string;
  description: string;
  component:
    | "InputField"
    | "InputSelect"
    | "TextareaField"
    | "InputDate"
    | "InputImage";
  props: FieldProps;
}

export interface FormSchema {
  type: string;
  properties: Record<string, FieldSchema>;
  required: string[];
}

const scheme: FormSchema = {
  type: "object",
  properties: {
    startDate: {
      type: "string",
      description: "startDate",
      component: "InputDate",
      props: {
        name: "startDate",
        label: "Start Date",
        placeholder: "Select start Date",
        required: true,
      },
    },
    endDate: {
      type: "string",
      description: "endDate",
      component: "InputDate",
      props: {
        name: "endDate",
        label: "End Date",
        placeholder: "End Date",
        required: true,
      },
    },
    schemeType: {
      type: "string",
      description: "schemeType",
      component: "InputSelect",
      props: {
        name: "schemeType",
        label: "Scheme Type",
        required: true,
        // isMulti: true,
        isClearable: true,
      },
    },
    schemeGroup: {
      type: "string",
      description: "schemeGroup",
      component: "InputSelect",
      props: {
        name: "schemeGroup",
        label: "Scheme Group",
        required: true,
        // isMulti: true,
        isClearable: true,
      },
    },
  },
  required: [],
};

export default scheme;

export const display: FormSchema = {
  type: "object",
  properties: {
    displayType: {
      type: "string",
      description: "displayType",
      component: "InputSelect",
      props: {
        name: "displayType",
        label: "Display Type",
        required: false,
        // isMulti: true,
        isClearable: true,
      },
    },
  },
  required: [],
};
