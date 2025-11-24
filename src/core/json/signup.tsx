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

const signup: FormSchema = {
  type: "object",
  properties: {
    password: {
      type: "string",
      description: "Password for the employee account",
      component: "InputField",
      props: {
        name: "password",
        label: "New Password",
        type: "password",
        placeholder: "New Password",
        required: true,
        autoComplete: "new-password",
        validation: {
          pattern: {
            value:
              "^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{5,20}$",
            message:
              "Password must be 5-20 characters, include at least one capital letter, one special character, and one number",
          },
        },
      },
    },
    confirmpassword: {
      type: "string",
      description: "Confirm the password for the employee account",
      component: "InputField",
      props: {
        name: "confirmpassword",
        label: "Confirm Password",
        type: "password",
        placeholder: "Confirm Password",
        required: true,
        autoComplete: "new-password",
        validation: {
          pattern: {
            value:
              "^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{5,20}$",
            message:
              "Password must be 5-20 characters, include at least one capital letter, one special character, and one number",
          },
          validate: {
            match: (value: string, formValues: Record<string, any>) =>
              value === formValues.password || "Passwords do not match",
          },
        },
      },
    },
  },
  required: ["password", "confirmpassword"],
};

export default signup;
