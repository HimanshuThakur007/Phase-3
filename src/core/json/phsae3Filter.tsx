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
    isMulti?: any
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

const p3Filter: FormSchema = {
    type: "object",
    properties: {
        stockBucket: {
            type: "string",
            description: "stockBucket",
            component: "InputSelect",
            props: {
                name: "stockBucket",
                label: "Stock Bucket",
                required: false,
                isMulti: true,
                isClearable: true,
            },
        },
        saleBucket: {
            type: "string",
            description: "saleBucket",
            component: "InputSelect",
            props: {
                name: "saleBucket",
                label: "Sales Bucket",
                required: false,
                isMulti: true,
                isClearable: true,
            },
        },

        transitQty: {
            type: "string",
            description: "transitQty",
            component: "InputSelect",
            props: {
                name: "transitQty",
                label: "Transit Qty",
                required: false,
                isMulti: true,
                isClearable: true,
            },
        },
        localHbtClass: {
            type: "string",
            description: "localHbtClass",
            component: "InputSelect",
            props: {
                name: "localHbtClass",
                label: "Local HBT Class",
                required: false,
                isMulti: true,
                isClearable: true,
            },
        },
        globalHbtClass: {
            type: "string",
            description: "globalHbtClass",
            component: "InputSelect",
            props: {
                name: "globalHbtClass",
                label: "Global HBT Class",
                required: false,
                isMulti: true,
                isClearable: true,
            },
        },
        localimport: {
            type: "string",
            description: "localimport",
            component: "InputSelect",
            props: {
                name: "localimport",
                label: "Local Import",
                required: false,
                isMulti: true,
                isClearable: true,
            },
        },
        states: {
            type: "string",
            description: "states",
            component: "InputSelect",
            props: {
                name: "states",
                label: "State",
                required: false,
                isMulti: true,
                isClearable: true,
            },
        },
        branches: {
            type: "string",
            description: "branches",
            component: "InputSelect",
            props: {
                name: "branches",
                label: "Branch Name",
                required: false,
                isMulti: true,
                isClearable: true,
            },
        },

    },
    required: [],
};

export default p3Filter;