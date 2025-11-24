import { OptionType } from "../../common/component/InputSelect";

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

export const salePurchaseInvoice: FormSchema = {
  type: "object",
  properties: {
    series: {
      type: "string",
      description: "Series for the sale/purchase order",
      component: "InputSelect",
      props: {
        name: "series",
        label: "Series",
        labelCol: "col-md-4", // Example customization
        selectCol: "col-md-8",
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
        labelCol: "col-md-4", // Example customization
        inputCol: "col-md-8",
        required: false,
        disabled: true,
        autoComplete: "off",
      },
    },
    saleType: {
      type: "string",
      description: "Series for the sale/purchase order",
      component: "InputSelect",
      props: {
        name: "saleType",
        label: "Sales Type",
        labelCol: "col-md-4", // Example customization
        selectCol: "col-md-8",
        required: true,
        isClearable: true,
      },
    },

    party: {
      type: "string",
      description: "Customer for the sale/purchase order",
      component: "InputSelect",
      props: {
        name: "party",
        label: "Party",
        labelCol: "col-md-2",
        selectCol: "col-md-10",
        required: true,
        isClearable: true,
      },
    },

    matCenter: {
      type: "string",
      description: "Customer for the sale/purchase order",
      component: "InputSelect",
      props: {
        name: "matCenter",
        label: "Mat Center",
        labelCol: "col-md-2",
        selectCol: "col-md-10",
        required: true,
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
        labelCol: "col-md-1", // Example customization
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
};

export const billingDetails: FormSchema = {
  type: "object",
  properties: {
    partyName: {
      type: "string",
      description: "Enter Your Party Name",
      component: "InputField",
      props: {
        name: "partyName",
        label: "Party Name",
        type: "text",
        placeholder: "Enter Party Name",
        required: true,
        autoComplete: "given-name",
        validation: {
          maxLength: {
            value: 100,
            message: "Name cannot exceed 100 characters",
          },
        },
      },
    },
    dealer: {
      type: "string",
      description: "Series for the state",
      component: "InputSelect",
      props: {
        name: "dealer",
        label: "Dealer Type",
        required: false,
        isClearable: true,
      },
    },
    address1: {
      type: "string",
      description: "Enter Your Address",
      component: "InputField",
      props: {
        name: "address1",
        label: "Address",
        type: "text",
        placeholder: "Enter Address",
        required: false,
        autoComplete: "given-name",
        validation: {
          maxLength: {
            value: 40,
            message: "Name cannot exceed 40 characters",
          },
        },
      },
    },
    address2: {
      type: "string",
      description: "Enter Your Address",
      component: "InputField",
      props: {
        name: "address2",
        label: " ",
        type: "text",
        placeholder: "Enter Address",
        required: false,
        autoComplete: "given-name",
        validation: {
          maxLength: {
            value: 40,
            message: "Name cannot exceed 40 characters",
          },
        },
      },
    },
    address3: {
      type: "string",
      description: "Enter Your Address",
      component: "InputField",
      props: {
        name: "address3",
        label: " ",
        type: "text",
        placeholder: "Enter Address",
        required: false,
        autoComplete: "given-name",
        validation: {
          maxLength: {
            value: 40,
            message: "Name cannot exceed 40 characters",
          },
        },
      },
    },
    address4: {
      type: "string",
      description: "Enter Your Address",
      component: "InputField",
      props: {
        name: "address4",
        label: " ",
        type: "text",
        placeholder: "Enter Address",
        required: false,
        autoComplete: "given-name",
        validation: {
          maxLength: {
            value: 40,
            message: "Name cannot exceed 40 characters",
          },
        },
      },
    },
    state: {
      type: "string",
      description: "Series for the state",
      component: "InputSelect",
      props: {
        name: "state",
        label: "State",
        required: false,
        isClearable: true,
      },
    },
    mobile: {
      type: "string",
      description: "Contact number of the employee",
      component: "InputField",
      props: {
        name: "mobile",
        label: "Mobile No",
        type: "tel",
        placeholder: "Enter Contact Number",
        required: false,
        autoComplete: "tel",
        validation: {
          pattern: {
            value: "^\\+?[1-9]\\d{1,14}$",
            message: "Invalid phone number",
          },
        },
      },
    },
    email: {
      type: "string",
      description: "Email address of the employee",
      component: "InputField",
      props: {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Enter Email",
        required: false,
        autoComplete: "email",
        validation: {
          pattern: {
            value: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
            message: "Invalid email address",
          },
        },
      },
    },
    pan: {
      type: "string",
      description: "PAN number of the party",
      component: "InputField",
      props: {
        name: "pan",
        label: "PAN Number",
        type: "text",
        placeholder: "Enter PAN Number",
        required: false,
        autoComplete: "off",
        validation: {
          pattern: {
            value: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
            message: "Invalid PAN number format",
          },
        },
      },
    },
    gst: {
      type: "string",
      description: "GST number of the party",
      component: "InputField",
      props: {
        name: "gst",
        label: "GST Number",
        type: "text",
        placeholder: "Enter GST Number",
        required: false,
        autoComplete: "off",
        validation: {
          pattern: {
            value: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
            message: "Invalid GST number format",
          },
        },
      },
    },

    // aadhaar: {
    //   type: "string",
    //   description: "Aadhaar number of the party",
    //   component: "InputField",
    //   props: {
    //     name: "aadhaar",
    //     label: "Aadhaar Number",
    //     type: "text",
    //     placeholder: "Enter Aadhaar Number",
    //     required: false,
    //     autoComplete: "off",
    //     validation: {
    //       pattern: {
    //         value: "^[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}$",
    //         message: "Invalid Aadhaar number format",
    //       },
    //     },
    //   },
    // },
  },
  required: [],
};
