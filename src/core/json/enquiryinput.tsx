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
  dangerTag?: string;
  maxLength?: number;
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
    | "InputToggle";
  props: FieldProps;
}

export interface FormSchema {
  type: string;
  properties: Record<string, FieldSchema>;
  required: string[];
}

export interface CompData {
  code: number;
  name: string;
  company: string;
  mobile?: string;
  email?: string;
  city: string;
  busysrno: string;
  paddLength?: string;
  paddChar?: string;
  refferedBy: string;
}

const enquiry: FormSchema = {
  type: "object",
  properties: {
    // mobile: {
    //   type: "string",
    //   description: "Enter Mobile Number",
    //   component: "InputField",
    //   props: {
    //     name: "mobile",
    //     label: "Mobile",
    //     type: "tel",
    //     placeholder: "Enter Mobile Number (e.g., +1234567890)",
    //     required: true,
    //     autoComplete: "tel",
    //     validation: {
    //       pattern: {
    //         value: /^\+?[0-9]{10,15}$/,
    //         message:
    //           "Please enter a valid mobile number (10-15 digits, optional + prefix)",
    //       },
    //       maxLength: {
    //         value: 16,
    //         message: "Mobile number cannot exceed 16 characters",
    //       },
    //     },
    //   },
    // },
    mobile: {
      type: "string",
      description: "Enter Mobile Number",
      component: "InputField",
      props: {
        name: "mobile",
        label: "Mobile",
        type: "tel",
        placeholder: "Enter 10-digit Mobile Number (e.g., 1234567890)",
        required: true,
        autoComplete: "tel",
        maxLength: 10, // Prevents typing more than 10 digits
        validation: {
          pattern: {
            value: /^\d{10}$/,
            message: "Please enter a valid 10-digit mobile number",
          },
          maxLength: {
            value: 10,
            message: "Mobile number must be exactly 10 digits",
          },
        },
      },
    },
    email: {
      type: "string",
      description: "Enter Email Address",
      component: "InputField",
      props: {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Enter Email Address",
        required: true,
        autoComplete: "email",
        validation: {
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: "Please enter a valid email address",
          },
          maxLength: {
            value: 255,
            message: "Email cannot exceed 255 characters",
          },
        },
      },
    },
    name: {
      type: "string",
      description: "Enter Your Series Name",
      component: "InputField",
      props: {
        name: "name",
        label: "Name",
        type: "text",
        placeholder: "Enter Name",
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
    company: {
      type: "string",
      description: "Enter Your Company Name",
      component: "InputField",
      props: {
        name: "company",
        label: "Company",
        type: "text",
        placeholder: "Enter Company Name",
        required: true,
        autoComplete: "organization",
        validation: {
          maxLength: {
            value: 100,
            message: "Company name cannot exceed 100 characters",
          },
        },
      },
    },

    city: {
      type: "string",
      description: "Enter City",
      component: "InputField",
      props: {
        name: "city",
        label: "City",
        type: "text",
        placeholder: "Enter City",
        required: false,
        autoComplete: "address-level2",
        validation: {
          maxLength: {
            value: 100,
            message: "City cannot exceed 100 characters",
          },
        },
      },
    },
    busysrno: {
      type: "string",
      description: "Enter Busy Serial Number",
      component: "InputField",
      props: {
        name: "busysrno",
        label: "Busy Sr.No.",
        type: "text",
        placeholder: "Enter Busy Serial Number",
        required: false,
        validation: {
          maxLength: {
            value: 50,
            message: "Serial number cannot exceed 50 characters",
          },
        },
      },
    },
    refferedBy: {
      type: "string",
      description: "Enter Busy Reference",
      component: "InputField",
      props: {
        name: "refferedBy",
        label: "Referred By (if any)",
        type: "text",
        placeholder: "Enter Reference",
        required: false,
        validation: {
          maxLength: {
            value: 50,
            message: "Reference cannot exceed 50 characters",
          },
        },
      },
    },
  },
  required: ["name", "email", "mobile", "company"], // Removed startNo as it's not in properties
};

export default enquiry;
