export interface FormSchema {
  type: string;
  properties: Record<string, any>;
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
  share?: boolean; // Added for InputToggle
  export?: boolean; // Added for InputToggle
  show?: boolean; // Added for InputToggle
}

export const user: FormSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "Enter Your Series Name",
      component: "InputField",
      props: {
        name: "name",
        label: "User Name",
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
    userName: {
      type: "string",
      description: "Enter Your Series Name",
      component: "InputField",
      props: {
        name: "userName",
        label: "Name",
        type: "text",
        placeholder: "Enter User Name",
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
    userType: {
      type: "string",
      description: "User Type Selection",
      component: "InputSelect",
      props: {
        name: "userType",
        label: "User Type",
        required: true,
        isClearable: true,
      },
    },
    salesman: {
      type: "string",
      description: "User Type Selection",
      component: "InputSelect",
      props: {
        name: "salesman",
        label: "Salesman",
        required: false,
        isClearable: true,
      },
    },
    password: {
      type: "string",
      description: "Password for the employee account",
      component: "InputField",
      props: {
        name: "password",
        label: "Password",
        type: "password",
        placeholder: "Enter Password",
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
    // share: {
    //   type: "number",
    //   description: "Enable or disable fixed length for numeric part",
    //   component: "InputToggle",
    //   props: {
    //     name: "share",
    //     label: "Share",
    //   },
    // },
    share: {
      type: "boolean",
      description: "Allow sharing of user data",
      component: "InputToggle",
      props: {
        name: "share",
        label: "Share",
        required: false, // Optional field
        colAlign: 6,
      },
    },
    export: {
      type: "boolean",
      description: "Allow exporting of user data",
      component: "InputToggle",
      props: {
        name: "export",
        label: "Export",
        required: false, // Optional field
        colAlign: 6,
      },
    },
    show: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "show",
        label: "Show Value",
        required: false, // Optional field
        colAlign: 6,
      },
    },
    allAccount: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "allAccount",
        label: "All Account",
        required: false, // Optional field
        colAlign: 6,
      },
    },
    allBranch: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "allBranch",
        label: "All Branch",
        required: false,
        colAlign: 6,
      },
    },
    allItemGrp: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "allItemGrp",
        label: "All Item Group",
        required: false, // Optional field
        colAlign: 6,
      },
    },
    isActive: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "isActive",
        label: "Active User",
        required: false, // Optional field
        colAlign: 6,
      },
    },
  },
  required: ["name", "password", "userType"], // Only these fields are required
};
export const custSupp: FormSchema = {
  type: "object",
  properties: {
    enablecustsupp: {
      type: "boolean",
      description: "Allow sharing of user data",
      component: "InputToggle",
      props: {
        name: "enablecustsupp",
        label: "Enable Customer/Supplier Login",
        required: false,
        colAlign: 9,
      },
    },
    include: {
      type: "boolean",
      description: "Allow exporting of user data",
      component: "InputToggle",
      props: {
        name: "include",
        label: "Include Accounts",
        required: false, // Optional field
        colAlign: 9,
      },
    },
    exclude: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "exclude",
        label: "Exclude Accounts",
        required: false, // Optional field
        colAlign: 9,
      },
    },
  },
  required: [], // Only these fields are required
};

// export default user;
export const userDashCard: FormSchema = {
  type: "object",
  properties: {
    // arpb: {
    //   type: "boolean",
    //   description: "Allow sharing of user data",
    //   component: "InputToggle",
    //   props: {
    //     name: "arpd",
    //     label: "ARPB",
    //     required: false, // Optional field
    //     colAlign: 6,
    //   },
    //   fullName: "Average Revenue Per Bill",
    // },
    // arpu: {
    //   type: "boolean",
    //   description: "Allow exporting of user data",
    //   component: "InputToggle",
    //   props: {
    //     name: "arpu",
    //     label: "ARPU",
    //     required: false, // Optional field
    //     colAlign: 6,
    //   },
    //   fullName: "Average Revenue Per Unit",
    // },
    // arpbc: {
    //   type: "boolean",
    //   description: "Show user data in public views",
    //   component: "InputToggle",
    //   props: {
    //     name: "arpbc",
    //     label: "ARPBC",
    //     required: false, // Optional field
    //     colAlign: 6,
    //   },
    //   fullName: "Average Revenue Per Billed Customer",
    // },
    // aord: {
    //   type: "boolean",
    //   description: "Show user data in public views",
    //   component: "InputToggle",
    //   props: {
    //     name: "aord",
    //     label: "AORD",
    //     required: false, // Optional field
    //     colAlign: 6,
    //   },
    //   fullName: "Average Outstanding Receivable Days",
    // },
    // aopd: {
    //   type: "boolean",
    //   description: "Show user data in public views",
    //   component: "InputToggle",
    //   props: {
    //     name: "aopd",
    //     label: "AOPD",
    //     required: false,
    //     colAlign: 6,
    //   },
    //   fullName: "Average Outstanding Payable Days",
    // },
    // aepu: {
    //   type: "boolean",
    //   description: "Show user data in public views",
    //   component: "InputToggle",
    //   props: {
    //     name: "aepu",
    //     label: "AEPU",
    //     required: false, // Optional field
    //     colAlign: 6,
    //   },
    //   fullName: "Average Expenses Per Unit",
    // },
    DBFinancialR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBFinancialR",
        label: "Financial",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "All Financial Cards",
    },
    DBNetSaleR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBNetSaleR",
        label: "Net Sales",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Net Sales",
    },
    DBNetPurcR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBNetPurcR",
        label: "Net Pur",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Net Purchase",
    },
    DBExpenseR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBExpenseR",
        label: "Expenses",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Expenses",
    },
    DBCriticalLR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBCriticalLR",
        label: "SCL",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Stock Critical Level",
    },
    DBAgeingRFifoR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBAgeingRFifoR",
        label: "Amt. Rec",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Amount Receivables (FIFO)",
    },
    DBAgeingPFifoR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBAgeingPFifoR",
        label: "Amt. Pay",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Amount Payables (FIFO)",
    },
    DBPendingSOR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBPendingSOR",
        label: "PSO",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Pending Sale Order",
    },
    DBPendingPOR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBPendingPOR",
        label: "PPO",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Pending Purchase Order",
    },
    DBBalanceBR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBBalanceBR",
        label: "Bank Bal.",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Bank Balance",
    },
    DBBalanceCashR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBBalanceCashR",
        label: "CIH",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Cash In Hand",
    },
    DBOrdSalesR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBOrdSalesR",
        label: "O&S",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Orders & Sales",
    },
    DBTopCustomerR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBTopCustomerR",
        label: "Top Cust",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Top Customers",
    },
    DBStateWDataR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBStateWDataR",
        label: "Map",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "India State-wise Data",
    },
    DBTopStatesR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBTopStatesR",
        label: "Top State",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Top State",
    },
    DBTopSalesmanR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBTopSalesmanR",
        label: "Top Sales",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Top Salesman",
    },
    DBTopProductR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBTopProductR",
        label: "Top Prod",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Top Products",
    },
    DBTopCategoryR: {
      type: "boolean",
      description: "Show user data in public views",
      component: "InputToggle",
      props: {
        name: "DBTopCategoryR",
        label: "Top Cat",
        required: false, // Optional field
        colAlign: 6,
      },
      fullName: "Top Categories",
    },
  },
  required: [], // Only these fields are required
};
