import * as Icon from "react-feather";
// import { ImUsers } from "react-icons/im";
// import { BiMoney } from "react-icons/bi";
import { ReactElement } from "react";

// Define interfaces for submenu and sidebar items
export interface SubmenuItem {
  label: string;
  link?: string;
  icon?: ReactElement;
  showSubRoute?: boolean;
  submenu?: boolean;
  submenuItems?: SubmenuItem[];
}

export interface SidebarItem {
  label: string;
  submenuOpen?: boolean;
  showSubRoute?: boolean;
  submenuHdr?: string;
  submenu?: boolean;
  icon?: ReactElement;
  link?: string;
  submenuItems?: SubmenuItem[];
}

// Sidebar configuration
const SidebarData: SidebarItem[] = [
  {
    label: "Main",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Main",
    submenuItems: [
      {
        label: "Dashboard",
        icon: <Icon.Grid />,
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          { label: "Admin Dashboard", link: "/" },
          // { label: "Sales Dashboard", link: "/sales-dashboard" },
        ],
      },
    ],
  },
  {
    label: "Inventory",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "Inventory",

    submenuItems: [
      // {
      //   label: "Products",
      //   link: "/product-list",
      //   icon: <Icon.Box />,
      //   showSubRoute: false,
      //   submenu: false,
      // },

      {
        label: "Product",
        link: "/product-list",
        icon: <Icon.PlusSquare />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Category",
        link: "/masters/11",
        icon: <Icon.Codepen />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Product Type",
        link: "/masters/13",
        icon: <Icon.Codepen />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Sub Category",
        link: "/masters/12",
        icon: <Icon.Speaker />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Brands",
        link: "/masters/14",
        icon: <Icon.Tag />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Units",
        link: "/masters/15",
        icon: <Icon.Speaker />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Tax Type",
        link: "/masters/17",
        icon: <Icon.Codepen />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Store",
        link: "/masters/16",
        icon: <Icon.Codepen />,
        showSubRoute: false,
        submenu: false,
      },
    ],
  },

  {
    label: "HRM",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "HRM",
    submenuItems: [
      {
        label: "Employee",
        link: "/employee-list",
        icon: <Icon.Users />,
        showSubRoute: false,
      },
      // { label: "Roles & Permissions", link: "/roles-permissions", icon:  <Icon.UserCheck />,showSubRoute: false },
      {
        label: "Departments",
        link: "/hrm_desi_dep/2",
        icon: <Icon.User />,
        showSubRoute: false,
      },
      {
        label: "Designations",
        link: "/hrm_desi_dep/3",
        icon: <Icon.UserCheck />,
        showSubRoute: false,
      },
      // {
      //   label: "Hierarchy",
      //   link: "/hierarchy",
      //   icon: <Icon.UserCheck />,
      //   showSubRoute: false,
      // },
    ],
  },
  {
    label: "People",
    submenuOpen: true,
    showSubRoute: false,
    submenuHdr: "People",

    submenuItems: [
      {
        label: "Country",
        link: "/masters/6",
        icon: <Icon.Users />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "State",
        link: "/masters/7",
        icon: <Icon.Users />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "City",
        link: "/masters/8",
        icon: <Icon.Users />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Transporter",
        link: "/masters/20",
        icon: <Icon.Users />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Price List Code",
        link: "/masters/21",
        icon: <Icon.Users />,
        showSubRoute: false,
        submenu: false,
      },

      {
        label: "Buyer",
        link: "/customer_supplier/4",
        icon: <Icon.User />,
        showSubRoute: false,
        submenu: false,
      },
      {
        label: "Seller",
        link: "/customer_supplier/5",
        icon: <Icon.User />,
        showSubRoute: false,
        submenu: false,
      },
      // { label: "Customer Review", link: "/customer-review", icon:<Icon.User />,showSubRoute: false,submenu: false },
      // { label: "Suppliers", link: "/suppliers", icon:  <Icon.Users />,showSubRoute: false, submenu: false },
      // { label: "Stores", link: "/store-list", icon:  <Icon.Home  />,showSubRoute: false,submenu: false },
      // { label: "Warehouses", link: "/warehouse", icon: <Icon.Archive />,showSubRoute: false,submenu: false },
    ],
  },
  {
    label: "Sales",
    submenuOpen: true,
    submenuHdr: "Sales",
    submenu: false,
    showSubRoute: false,
    submenuItems: [
      // { label: "Order", link: "/order-list", icon:  <Icon.ShoppingCart />,showSubRoute: false,submenu: false },
      {
        label: "Sale Order",
        link: "/sales_purchase_list/1",
        icon: <Icon.FileText />,
        showSubRoute: false,
        submenu: false,
      },
      // {
      //   label: "Sale Order Approval",
      //   link: "/Sale-Order-Approval",
      //   icon: <Icon.ShoppingCart />,
      //   showSubRoute: false,
      //   submenu: false,
      // },

      // {
      //   label: "Sales",
      //   link: "/sales-list",
      //   icon: <Icon.ShoppingCart />,
      //   showSubRoute: false,
      //   submenu: false,
      // },
      // { label: "Invoices", link: "/invoice-report", icon:  <Icon.FileText />,showSubRoute: false,submenu: false },
      // { label: "Sales Return", link: "/sales-returns", icon:  <Icon.Copy />,showSubRoute: false,submenu: false },
      // { label: "Quotation", link: "/quotation-list", icon:  <Icon.Save />,showSubRoute: false,submenu: false },
      // { label: "POS", link: "/pos", icon:  <Icon.HardDrive />,showSubRoute: false,submenu: false }
    ],
  },
  {
    label: "Settings",
    submenu: true,
    showSubRoute: false,
    submenuHdr: "Settings",
    submenuItems: [
      // {
      //   label: "Seo Settings",
      //   submenu: true,
      //   showSubRoute: false,
      //   icon: <Icon.Settings />,
      //   submenuItems: [{ label: "Seo setting", link: "/seo/website_manager" }],
      // },
      // { label: "General Settings",
      // submenu: true,
      // showSubRoute: false,
      // icon: <Icon.Settings/>,
      // submenuItems: [

      //   { label: "Profile", link: "/general-settings" },
      //   { label: "WhatsAppConfig", link: "/whatsapp_config" },
      //   { label: "EmailConfig", link: "/email_config" },
      //   { label: "Order Sync.(Busy)", link: "/busysync" },

      // ]},
      {
        label: "Website Settings",
        submenu: true,
        showSubRoute: false,
        icon: <Icon.Globe />,
        submenuItems: [
          // { label: "System Settings", link: "/system-settings",showSubRoute: false },
          {
            label: "Company Settings",
            link: "/company-setting",
            showSubRoute: false,
          },
          {
            label: "Organisation",
            link: "/masters/18",
            showSubRoute: false,
          },
          {
            label: "Bank",
            link: "/masters/19",
            showSubRoute: false,
          },
          {
            label: "Series Settings",
            link: "/series-setting",
            showSubRoute: false,
          },
        ],
      },
      // {
      //   label: "App Settings",
      //   submenu: true,

      //   showSubRoute: false,
      //   icon: <Icon.Smartphone />,
      //   submenuItems: [
      //     // { label: "Invoice", link: "/invoice-settings",showSubRoute: false },
      //     // { label: "Printer", link: "/printer-settings",showSubRoute: false },
      //     // { label: "POS", link: "/pos-settings",showSubRoute: false },
      //     {
      //       label: "Additional field",
      //       link: "/additional-fields",
      //       showSubRoute: false,
      //     },
      //     // { label: "Custom Fields", link: "/custom-fields",showSubRoute: false }
      //   ],
      // },
    ],
  },
];

export default SidebarData;
