import { get } from "lodash";

// Interface for card item
interface CardItem {
  label: string;
  value: string;
  recType?: number;
  rapId?: string;
}

// Interface for card data
export interface CardData {
  title: string;
  items: CardItem[];
  backgroundColor: string;
  fontColor: string;
  onCardClick?: (rapId: string, masterCode: number, recType: number) => void;
  endPoint?: string;
}

// Interface for pie chart data
interface PieChartData {
  name: string;
  value: number;
  color: string;
}

// Interface for bar chart data
interface BarChartData {
  name: string;
  y: number;
}

// Interface for table row data
interface TableRowData {
  [key: string]: string | number;
}

// Interface for table column definition
interface TableColDef {
  field: string;
  headerName: string;
  flex?: number;
  wrapText?: boolean;
  filter?: boolean;
  type?: string;
  cellStyle?: { [key: string]: string };
}

// Generate random color for pie charts
export const generateRandomColor = (): string => {
  const r = Math.floor(Math.random() * 170 + 30);
  const g = Math.floor(Math.random() * 170 + 30);
  const b = Math.floor(Math.random() * 170 + 30);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// Card data configuration
// export const getCardData = (
//   dashboardData: any,
//   dashboardSpData: any,
//   dashboardCritical: any
// ): CardData[] => [
//   {
//     title: "Net Sales",
//     items: [
//       {
//         label: "Till Date",
//         value: get(dashboardSpData, "NetSales.AmtTillDate", "0.00"),
//         recType: 1,
//         rapId: get(dashboardSpData, "SalesDBRepID", ""),
//       },
//       {
//         label: "This Month",
//         value: get(dashboardSpData, "NetSales.AmtMonthly", "0.00"),
//         recType: 2,
//         rapId: get(dashboardSpData, "SalesDBRepID", ""),
//       },
//       {
//         label: "Yesterday",
//         value: get(dashboardSpData, "NetSales.AmtLastDate", "0.00"),
//         recType: 3,
//         rapId: get(dashboardSpData, "SalesDBRepID", ""),
//       },
//       {
//         label: "Today",
//         value: get(dashboardSpData, "NetSales.AmtToday", "0.00"),
//         recType: 4,
//         rapId: get(dashboardSpData, "SalesDBRepID", ""),
//       },
//     ],
//     backgroundColor: "#234549",
//     fontColor: "#fff",
//     endPoint: `Report/GetCompanyDashBoardSpData`,
//   },
//   {
//     title: "Net Purchase",
//     endPoint: `Report/GetCompanyDashBoardSpData`,
//     items: [
//       {
//         label: "Till Date",
//         value: get(dashboardSpData, "NetPurchase.AmtTillDate", "0.00"),
//         recType: 1,
//         rapId: get(dashboardSpData, "PurchaseDBRepID", ""),
//       },
//       {
//         label: "This Month",
//         value: get(dashboardSpData, "NetPurchase.AmtMonthly", "0.00"),
//         recType: 2,
//         rapId: get(dashboardSpData, "PurchaseDBRepID", ""),
//       },
//       {
//         label: "Yesterday",
//         value: get(dashboardSpData, "NetPurchase.AmtLastDate", "0.00"),
//         recType: 3,
//         rapId: get(dashboardSpData, "PurchaseDBRepID", ""),
//       },
//       {
//         label: "Today",
//         value: get(dashboardSpData, "NetPurchase.AmtToday", "0.00"),
//         recType: 4,
//         rapId: get(dashboardSpData, "PurchaseDBRepID", ""),
//       },
//     ],
//     backgroundColor: "#244834",
//     fontColor: "#fff",
//   },
//   {
//     title: "Expenses",
//     endPoint: `Report/GetCompanyDashBoardOtherData`,
//     items: [
//       {
//         label: "Till Date",
//         value: get(dashboardData, "NetExpences.AmtTillDate", "0.00"),
//         recType: 1,
//         // rapId: get(dashboardData, "DBSubRepID.ExpenseDBRepID", ""),
//         rapId: get(dashboardData, "ExpenseDBRepID", ""),
//       },
//       {
//         label: "This Month",
//         value: get(dashboardData, "NetExpences.AmtMonthly", "0.00"),
//         recType: 2,
//         // rapId: get(dashboardData, "DBSubRepID.ExpenseDBRepID", ""),
//         rapId: get(dashboardData, "ExpenseDBRepID", ""),
//       },
//       {
//         label: "Yesterday",
//         value: get(dashboardData, "NetExpences.AmtLastDate", "0.00"),
//         recType: 3,
//         // rapId: get(dashboardData, "DBSubRepID.ExpenseDBRepID", ""),
//         rapId: get(dashboardData, "ExpenseDBRepID", ""),
//       },
//       {
//         label: "Today",
//         value: get(dashboardData, "NetExpences.AmtToday", "0.00"),
//         recType: 4,
//         // rapId: get(dashboardData, "DBSubRepID.ExpenseDBRepID", ""),
//         rapId: get(dashboardData, "ExpenseDBRepID", ""),
//       },
//     ],
//     backgroundColor: "#60452a",
//     fontColor: "#fff",
//   },
//   {
//     title: "Stock Critical Level",
//     endPoint: `Report/GetCompanyDashBoardCriticalLData`,
//     items: [
//       {
//         label: "Item Below Min. Level",
//         value: get(dashboardCritical, "CriticalLevel.ItemMinLevel", "0.00"),
//         recType: 1,
//         rapId: get(dashboardCritical, "CLMinLDBRepID", ""),
//       },
//       {
//         label: "Item Below ROL. Level",
//         value: get(dashboardCritical, "CriticalLevel.ItemROLLevel", "0.00"),
//         recType: 2,
//         rapId: get(dashboardCritical, "CLROLLDBRepID", ""),
//       },
//       {
//         label: "Item Above Max. Level",
//         value: get(dashboardCritical, "CriticalLevel.ItemMaxLevel", "0.00"),
//         recType: 3,
//         rapId: get(dashboardCritical, "CLMaxLDBRepID", ""),
//       },
//     ],
//     // items: [
//     //   {
//     //     label: "Item Below Min. Level",
//     //     value: get(dashboardData, "CriticalLevel.ItemMinLevel", "0.00"),
//     //     recType: 1,
//     //     rapId: get(dashboardData, "DBSubRepID.CLMinLDBRepID", ""),
//     //   },
//     //   {
//     //     label: "Item Below ROL. Level",
//     //     value: get(dashboardData, "CriticalLevel.ItemROLLevel", "0.00"),
//     //     recType: 2,
//     //     rapId: get(dashboardData, "DBSubRepID.CLROLLDBRepID", ""),
//     //   },
//     //   {
//     //     label: "Item Above Max. Level",
//     //     value: get(dashboardData, "CriticalLevel.ItemMaxLevel", "0.00"),
//     //     recType: 3,
//     //     rapId: get(dashboardData, "DBSubRepID.CLMaxLDBRepID", ""),
//     //   },
//     // ],
//     backgroundColor: "#4e2a63",
//     fontColor: "#fff",
//   },
// ];

export const getCardData = (
  // dashboardData: any,
  UserType: number,
  dashboardSpData: any,
  dashboardCritical: any,
  cardRights: any,
  dashboardExpenseCardData: any
): CardData[] => {
  const cards: CardData[] = [];

  // Net Sales Card
  if (cardRights?.DBNetSaleR === 1 || UserType === 4) {
    cards.push({
      title: "Net Sales",
      items: [
        {
          label: "Till Date",
          value: get(dashboardSpData, "NetSales.AmtTillDate", "0.00"),
          recType: 1,
          rapId: get(dashboardSpData, "SalesDBRepID", ""),
        },
        {
          label: "This Month",
          value: get(dashboardSpData, "NetSales.AmtMonthly", "0.00"),
          recType: 2,
          rapId: get(dashboardSpData, "SalesDBRepID", ""),
        },
        {
          label: "Yesterday",
          value: get(dashboardSpData, "NetSales.AmtLastDate", "0.00"),
          recType: 3,
          rapId: get(dashboardSpData, "SalesDBRepID", ""),
        },
        {
          label: "Today",
          value: get(dashboardSpData, "NetSales.AmtToday", "0.00"),
          recType: 4,
          rapId: get(dashboardSpData, "SalesDBRepID", ""),
        },
      ],
      backgroundColor: "#234549",
      fontColor: "#fff",
      endPoint: "Report/GetCompanyDashBoardSpData",
    });
  }

  // Net Purchase Card
  if (cardRights?.DBNetPurcR === 1 || UserType === 5) {
    cards.push({
      title: "Net Purchase",
      items: [
        {
          label: "Till Date",
          value: get(dashboardSpData, "NetPurchase.AmtTillDate", "0.00"),
          recType: 1,
          rapId: get(dashboardSpData, "PurchaseDBRepID", ""),
        },
        {
          label: "This Month",
          value: get(dashboardSpData, "NetPurchase.AmtMonthly", "0.00"),
          recType: 2,
          rapId: get(dashboardSpData, "PurchaseDBRepID", ""),
        },
        {
          label: "Yesterday",
          value: get(dashboardSpData, "NetPurchase.AmtLastDate", "0.00"),
          recType: 3,
          rapId: get(dashboardSpData, "PurchaseDBRepID", ""),
        },
        {
          label: "Today",
          value: get(dashboardSpData, "NetPurchase.AmtToday", "0.00"),
          recType: 4,
          rapId: get(dashboardSpData, "PurchaseDBRepID", ""),
        },
      ],
      backgroundColor: "#244834",
      fontColor: "#fff",
      endPoint: "Report/GetCompanyDashBoardSpData",
    });
  }

  // Expenses Card
  if (cardRights?.DBExpenseR === 1) {
    cards.push({
      title: "Expenses",
      items: [
        {
          label: "Till Date",
          value: get(
            dashboardExpenseCardData,
            "NetExpences.AmtTillDate",
            "0.00"
          ),
          recType: 1,
          rapId: get(dashboardExpenseCardData, "ExpenseDBRepID", ""),
        },
        {
          label: "This Month",
          value: get(
            dashboardExpenseCardData,
            "NetExpences.AmtMonthly",
            "0.00"
          ),
          recType: 2,
          rapId: get(dashboardExpenseCardData, "ExpenseDBRepID", ""),
        },
        {
          label: "Yesterday",
          value: get(
            dashboardExpenseCardData,
            "NetExpences.AmtLastDate",
            "0.00"
          ),
          recType: 3,
          rapId: get(dashboardExpenseCardData, "ExpenseDBRepID", ""),
        },
        {
          label: "Today",
          value: get(dashboardExpenseCardData, "NetExpences.AmtToday", "0.00"),
          recType: 4,
          rapId: get(dashboardExpenseCardData, "ExpenseDBRepID", ""),
        },
      ],
      backgroundColor: "#60452a",
      fontColor: "#fff",
      endPoint: "Report/GetCompanyDashBoardExpenseData",
    });
  }

  // Stock Critical Level Card
  if (cardRights?.DBCriticalLR === 1) {
    cards.push({
      title: "Stock Critical Level",
      items: [
        {
          label: "Item Below Min. Level",
          value: get(dashboardCritical, "CriticalLevel.ItemMinLevel", "0.00"),
          recType: 1,
          rapId: get(dashboardCritical, "CLMinLDBRepID", ""),
        },
        {
          label: "Item Below ROL. Level",
          value: get(dashboardCritical, "CriticalLevel.ItemROLLevel", "0.00"),
          recType: 2,
          rapId: get(dashboardCritical, "CLROLLDBRepID", ""),
        },
        {
          label: "Item Above Max. Level",
          value: get(dashboardCritical, "CriticalLevel.ItemMaxLevel", "0.00"),
          recType: 3,
          rapId: get(dashboardCritical, "CLMaxLDBRepID", ""),
        },
      ],
      backgroundColor: "#4a3a5b",
      fontColor: "#fff",
      endPoint: "Report/GetCompanyDashBoardCriticalLData",
    });
  }

  return cards;
};

// export const getAdditionalCardData = (
//   dashboardData: any,
//   dashboardAmountRecData: any,
//   dashboardAmountPayData: any,
//   handleItemClick: (rapId: string, masterCode: number, recType: number) => void
// ): any[] => {
//   // Calculate sum for Amount Receivables (FIFO)
//   const receivablesTotal = Array.isArray(dashboardAmountRecData?.AgeingFifo)
//     ? dashboardAmountRecData.AgeingFifo.reduce((sum: number, item: any) => {
//         const value = parseFloat(item?.AgeingD) || 0;
//         return sum + value;
//       }, 0).toFixed(2)
//     : "0.00";
//   // total.toLocaleString("en-IN")
//   // Calculate sum for Amount Payables (FIFO)
//   const payablesTotal = Array.isArray(dashboardAmountPayData?.AgeingFifo)
//     ? dashboardAmountPayData.AgeingFifo.reduce((sum: number, item: any) => {
//         const value = parseFloat(item?.AgeingD) || 0;
//         return sum + value;
//       }, 0).toFixed(2)
//     : "0.00";

//   // console.log("Totals", receivablesTotal, payablesTotal);

//   return [
//     {
//       title: "Amount Receivables (FIFO)",
//       items: Array.isArray(dashboardAmountRecData?.AgeingFifo)
//         ? dashboardAmountRecData.AgeingFifo.map((item: any) => ({
//             label: item?.AgeingH?.replace(/\u003E/g, ">") || "N/A",
//             value: item?.AgeingD || "0.00",
//           }))
//         : [],
//       total: receivablesTotal, // Add total
//       rapId: get(dashboardAmountRecData, "RepID", ""),
//       backgroundColor: "#1B2850",
//       fontColor: "#fff",
//       endPoint: `Report/GetCompanyDashBoardAgeingFifoData`,
//     },
//     {
//       title: "Amount Payables (FIFO)",
//       items: Array.isArray(dashboardAmountPayData?.AgeingFifo)
//         ? dashboardAmountPayData.AgeingFifo.map((item: any) => ({
//             label: item?.AgeingH?.replace(/\u003E/g, ">") || "N/A",
//             value: item?.AgeingD || "0.00",
//           }))
//         : [],
//       total: payablesTotal, // Add total
//       rapId: get(dashboardAmountPayData, "RepID", ""),
//       backgroundColor: "#1B2850",
//       fontColor: "#fff",
//       endPoint: `Report/GetCompanyDashBoardAgeingFifoData`,
//     },
//     {
//       title: "Pending Sale Order",
//       items: Array.isArray(dashboardData?.PendingSO)
//         ? dashboardData.PendingSO.map((item: any) => ({
//             label: item?.Type || "N/A",
//             value: item?.NParty || item?.OrderQty || item?.OrderAmt || "0.00",
//           }))
//         : [
//             {
//               label: "Party",
//               value: get(dashboardData, "PendingSO.NParty", "0.00"),
//             },
//             {
//               label: "Quantity",
//               value: get(dashboardData, "PendingSO.OrderQty", "0.00"),
//             },
//             {
//               label: "Amount",
//               value: get(dashboardData, "PendingSO.OrderAmt", "0.00"),
//             },
//           ],
//       rapId: get(dashboardData, "PendingSODBRepID", ""),
//       backgroundColor: "#8f252c",
//       fontColor: "#fff",
//       endPoint: `Report/GetCompanyDashBoardSOPODATA`,
//       onCardClick: handleItemClick,
//     },
//     {
//       title: "Pending Purchase Order",
//       items: Array.isArray(dashboardData?.PendingPO)
//         ? dashboardData.PendingPO.map((item: any) => ({
//             label: item?.Type || "N/A",
//             value: item?.NParty || item?.OrderQty || item?.OrderAmt || "0.00",
//             rapId: get(dashboardData, "DBSubRepID.PendingSODBRepID", ""),
//           }))
//         : [
//             {
//               label: "Party",
//               value: get(dashboardData, "PendingPO.NParty", "0.00"),
//               rapId: get(dashboardData, "DBSubRepID.PendingSODBRepID", ""),
//             },
//             {
//               label: "Quantity",
//               value: get(dashboardData, "PendingPO.OrderQty", "0.00"),
//               rapId: get(dashboardData, "DBSubRepID.PendingSODBRepID", ""),
//             },
//             {
//               label: "Amount",
//               value: get(dashboardData, "PendingPO.OrderAmt", "0.00"),
//               rapId: get(dashboardData, "DBSubRepID.PendingSODBRepID", ""),
//             },
//           ],
//       rapId: get(dashboardData, "PendingPODBRepID", ""),
//       backgroundColor: "#8f4a76",
//       endPoint: `Report/GetCompanyDashBoardSOPODATA`,
//       fontColor: "#fff",
//       onCardClick: handleItemClick,
//     },
//   ];
// };

// Table column definitions

export const getAdditionalCardData = (
  UserType: number,
  dashboardData: any,
  dashboardAmountRecData: any,
  dashboardAmountPayData: any,
  handleItemClick: (rapId: string, masterCode: number, recType: number) => void,
  cardRights: any // Add cardRights as a parameter
): CardData[] => {
  const cards: any[] = [];

  // Amount Receivables (FIFO) Card
  if (cardRights?.DBAgeingRFifoR === 1 || UserType === 4 || UserType === 5) {
    const receivablesTotal = Array.isArray(dashboardAmountRecData?.AgeingFifo)
      ? dashboardAmountRecData.AgeingFifo.reduce((sum: number, item: any) => {
          const value = parseFloat(item?.AgeingD) || 0;
          return sum + value;
        }, 0).toFixed(2)
      : "0.00";

    cards.push({
      title: "Amount Receivables (FIFO)",
      items: Array.isArray(dashboardAmountRecData?.AgeingFifo)
        ? dashboardAmountRecData.AgeingFifo.map((item: any) => ({
            label: item?.AgeingH?.replace(/\u003E/g, ">") || "N/A",
            value: item?.AgeingD || "0.00",
          }))
        : [],
      total: receivablesTotal,
      rapId: get(dashboardAmountRecData, "RepID", ""),
      backgroundColor: "#1B2850",
      fontColor: "#fff",
      endPoint: "Report/GetCompanyDashBoardAgeingFifoData",
    });
  }

  // Amount Payables (FIFO) Card
  if (cardRights?.DBAgeingPFifoR === 1 || UserType === 4 || UserType === 5) {
    const payablesTotal = Array.isArray(dashboardAmountPayData?.AgeingFifo)
      ? dashboardAmountPayData.AgeingFifo.reduce((sum: number, item: any) => {
          const value = parseFloat(item?.AgeingD) || 0;
          return sum + value;
        }, 0).toFixed(2)
      : "0.00";

    cards.push({
      title: "Amount Payables (FIFO)",
      items: Array.isArray(dashboardAmountPayData?.AgeingFifo)
        ? dashboardAmountPayData.AgeingFifo.map((item: any) => ({
            label: item?.AgeingH?.replace(/\u003E/g, ">") || "N/A",
            value: item?.AgeingD || "0.00",
          }))
        : [],
      total: payablesTotal,
      rapId: get(dashboardAmountPayData, "RepID", ""),
      backgroundColor: "#1B2850",
      fontColor: "#fff",
      endPoint: "Report/GetCompanyDashBoardAgeingFifoData",
    });
  }

  // Pending Sale Order Card
  if (cardRights?.DBPendingSOR === 1 || UserType === 4) {
    cards.push({
      title: "Pending Sale Order",
      items: Array.isArray(dashboardData?.PendingSO)
        ? dashboardData.PendingSO.map((item: any) => ({
            label: item?.Type || "N/A",
            value: item?.NParty || item?.OrderQty || item?.OrderAmt || "0.00",
          }))
        : [
            ...(UserType !== 4
              ? [
                  {
                    label: "Party",
                    value: get(dashboardData, "PendingSO.NParty", "0.00"),
                  },
                ]
              : []),
            // {
            //   label: "Party",
            //   value: get(dashboardData, "PendingSO.NParty", "0.00"),
            // },
            {
              label: "Quantity",
              value: get(dashboardData, "PendingSO.OrderQty", "0.00"),
            },
            {
              label: "Amount",
              value: get(dashboardData, "PendingSO.OrderAmt", "0.00"),
            },
          ],
      rapId: get(dashboardData, "PendingSODBRepID", ""),
      backgroundColor: "#8f252c",
      fontColor: "#fff",
      endPoint: "Report/GetCompanyDashBoardSOPODATA",
      onCardClick: handleItemClick,
    });
  }

  // Pending Purchase Order Card
  if (cardRights?.DBPendingPOR === 1 || UserType === 5) {
    cards.push({
      title: "Pending Purchase Order",
      items: Array.isArray(dashboardData?.PendingPO)
        ? dashboardData.PendingPO.map((item: any) => ({
            label: item?.Type || "N/A",
            value: item?.NParty || item?.OrderQty || item?.OrderAmt || "0.00",
            rapId: get(dashboardData, "PendingPODBRepID", ""),
          }))
        : [
            // {
            //   label: "Party",
            //   value: get(dashboardData, "PendingPO.NParty", "0.00"),
            //   rapId: get(dashboardData, "PendingPODBRepID", ""),
            // },
            ...(UserType !== 5
              ? [
                  {
                    label: "Party",
                    value: get(dashboardData, "PendingSO.NParty", "0.00"),
                  },
                ]
              : []),
            {
              label: "Quantity",
              value: get(dashboardData, "PendingPO.OrderQty", "0.00"),
              rapId: get(dashboardData, "PendingPODBRepID", ""),
            },
            {
              label: "Amount",
              value: get(dashboardData, "PendingPO.OrderAmt", "0.00"),
              rapId: get(dashboardData, "PendingPODBRepID", ""),
            },
          ],
      rapId: get(dashboardData, "PendingPODBRepID", ""),
      backgroundColor: "#8f4a76",
      fontColor: "#fff",
      endPoint: "Report/GetCompanyDashBoardSOPODATA",
      onCardClick: handleItemClick,
    });
  }

  return cards;
};

// export const getBankBalanceColDef = (): TableColDef[] => [
//   {
//     field: "Name",
//     headerName: "Particular",
//     flex: 1,
//     wrapText: true,
//     filter: false,
//   },
//   {
//     field: "Balance",
//     headerName: "Balance",
//     filter: false,
//     type: "number",
//     cellStyle: { textAlign: "right", whiteSpace: "normal" },
//   },
//   {
//     field: "",
//     headerName: "Check Deposit",
//     wrapText: true,
//     filter: false,
//   },
//   {
//     field: "",
//     headerName: "Check Issued",
//     wrapText: true,
//     filter: false,
//   },

//   {
//     field: "",
//     headerName: "Actual Balance",
//     filter: false,
//     type: "number",
//     cellStyle: { textAlign: "right", whiteSpace: "normal" },
//   },
// ];

export const getBankBalanceColDef = (
  enableBankInstDT: boolean = false
): TableColDef[] => {
  const baseColumns: TableColDef[] = [
    {
      field: "Name",
      headerName: "Particular",
      flex: 1,
      wrapText: true,
      filter: false,
    },
    {
      field: "Balance",
      headerName: "Balance",
      filter: false,
      type: "number",
      cellStyle: { textAlign: "right", whiteSpace: "normal" },
    },
  ];

  const conditionalColumns: TableColDef[] = enableBankInstDT
    ? [
        {
          field: "Deposit",
          headerName: "Check Deposit",
          wrapText: true,
          filter: false,
          type: "number",
          cellStyle: { textAlign: "right", whiteSpace: "normal" },
        },
        {
          field: "Issued",
          headerName: "Check Issued",
          wrapText: true,
          filter: false,
          type: "number",
          cellStyle: { textAlign: "right", whiteSpace: "normal" },
        },
        {
          field: "ActBalance",
          headerName: "Actual Balance",
          filter: false,
          type: "number",
          cellStyle: { textAlign: "right", whiteSpace: "normal" },
        },
      ]
    : [];

  return [...baseColumns, ...conditionalColumns];
};
export const getCashInHandColDef = (): TableColDef[] => [
  {
    field: "Name",
    headerName: "Particular",
    flex: 1,
    wrapText: true,
    filter: false,
  },
  {
    field: "Balance",
    headerName: "Balance",
    filter: false,
    cellStyle: { textAlign: "right", whiteSpace: "normal" },
  },
];

export const getTopCustomersColDef = (selectedValue: {
  label: string;
}): TableColDef[] => [
  {
    field: "customerName",
    headerName: "Customer",
    flex: 1,
    wrapText: true,
    filter: false,
  },
  {
    field: "salesAmount",
    headerName: selectedValue.label,
    type: "number",
    filter: false,
    cellStyle: { textAlign: "right", whiteSpace: "normal" },
  },
];

export const getTopSalesManColDef = (selectedValue: {
  label: string;
}): TableColDef[] => [
  {
    field: "salesmanName",
    headerName: "SalesMan",
    flex: 1,
    wrapText: true,
    filter: false,
  },
  {
    field: "salesTotal",
    headerName: selectedValue.label,
    type: "number",
    filter: false,
    cellStyle: { textAlign: "right", whiteSpace: "normal" },
  },
];

export const getTopStateColDef = (selectedValue: {
  label: string;
}): TableColDef[] => [
  {
    field: "stateName",
    headerName: "Name",
    flex: 1,
    wrapText: true,
    filter: false,
  },
  {
    field: "salesVolume",
    headerName: selectedValue.label,
    type: "number",
    cellStyle: { textAlign: "right", whiteSpace: "normal" },
    filter: false,
  },
];

export const getTopProductColDef = (selectedValue: {
  label: string;
}): TableColDef[] => [
  {
    field: "productName",
    headerName: "Name",
    flex: 1,
    wrapText: true,
    filter: false,
  },
  {
    field: "salesAmount",
    headerName: selectedValue.label,
    filter: false,
    type: "number",
    cellStyle: { textAlign: "right", whiteSpace: "normal" },
  },
];

export const getTopCategoryColDef = (selectedValue: {
  label: string;
}): TableColDef[] => [
  {
    field: "categoryName",
    headerName: "Name",
    flex: 1,
    wrapText: true,
    filter: false,
  },
  {
    field: "salesAmount",
    headerName: selectedValue.label,
    type: "number",
    filter: false,
    cellStyle: { textAlign: "right", whiteSpace: "normal" },
  },
];

// Table row data
export const getBankBalanceRowData = (dashboardData: any): TableRowData[] =>
  Array.isArray(dashboardData?.BankBalance)
    ? dashboardData.BankBalance.map((item: any) => ({
        Name: item?.Name || "N/A",
        Balance: item?.Balance || "0.00",
        ActBalance: item?.ActBalance || "0.00",
        Deposit: item?.Deposit || "0.00",
        Issued: item?.Issued || "0.00",
        Code: item?.Code || 0,
        RepId: item?.RepID || "",
      }))
    : [];

export const getCashInHandRowData = (dashboardData: any): TableRowData[] =>
  Array.isArray(dashboardData?.CashBalance)
    ? dashboardData.CashBalance.map((item: any) => ({
        Name: item?.Name || "N/A",
        Balance: item?.Balance || "0.00",
        Code: item?.Code || 0,
        RepId: item?.RepID || "",
      }))
    : [];

export const getTopCustomersRowData = (dashData: any): TableRowData[] =>
  Array.isArray(dashData)
    ? dashData.map((item: any) => ({
        customerName: item?.Name || "N/A",
        salesAmount: item?.Value || "0.00",
        Code: item?.Code || 0,
      }))
    : [];

export const getTopSalesManRowData = (dashData: any): TableRowData[] =>
  Array.isArray(dashData?.TopSalesman)
    ? dashData.TopSalesman.map((item: any) => ({
        salesmanName: item?.Name || "N/A",
        salesTotal: item?.Value || "0.00",
        Code: item?.Code || 0,
      }))
    : [];

export const getTopStateRowData = (dashData: any): TableRowData[] =>
  Array.isArray(dashData?.TopStates)
    ? dashData.TopStates.map((item: any) => ({
        stateName: item?.Name || "N/A",
        salesVolume: item?.Value || "0.00",
        Code: item?.Code || 0,
      }))
    : [];

export const getTopProductRowData = (dashData: any): TableRowData[] =>
  Array.isArray(dashData?.TopProduct)
    ? dashData.TopProduct.map((item: any) => ({
        productName: item?.Name || "N/A",
        salesAmount: item?.Value || "0.00",
        Code: item?.Code || 0,
      }))
    : [];

export const getTopCategoryRowData = (dashData: any): TableRowData[] =>
  Array.isArray(dashData?.TopCategory)
    ? dashData.TopCategory.map((item: any) => ({
        categoryName: item?.Name || "N/A",
        salesAmount: item?.Value || "0.00",
        Code: item?.Code || 0,
      }))
    : [];

// Pie chart color configurations
export const pieState = [
  "#1e3a8a",
  "#be123c",
  "#0f766e",
  "#7c3aed",
  "#b91c1c",
  "#047857",
];
export const pieColors = [
  "#0ea5e9",
  "#f43f5e",
  "#22c55e",
  "#eab308",
  "#a855f7",
  "#ef4444",
];
export const categoryColors = [
  "#3b82f6",
  "#facc15",
  "#ec4899",
  "#14b8a6",
  "#6366f1",
  "#f97316",
];

// Pie chart data
export const getTopProductPieData = (dashData: any): PieChartData[] =>
  Array.isArray(dashData?.TopProductC)
    ? dashData.TopProductC.map((item: any, index: number) => ({
        name: item?.Name || "N/A",
        value: item?.Value || 0,
        color: pieState[index % pieState.length],
      }))
    : [];

// console.log("data", getTopProductPieData);

export const getTopStatePieData = (dashData: any): PieChartData[] =>
  Array.isArray(dashData?.TopStatesC)
    ? dashData.TopStatesC.map((item: any, index: number) => ({
        name: item?.Name || "N/A",
        value: item?.Value || 0,
        color: pieColors[index % pieColors.length],
      }))
    : [];

export const getTopSalesPieData = (dashData: any): PieChartData[] =>
  Array.isArray(dashData?.TopSalesmanC)
    ? dashData.TopSalesmanC.map((item: any, index: number) => ({
        name: item?.Name || "N/A",
        value: item?.Value || 0,
        color: pieColors[index % pieColors.length],
      }))
    : [];

export const getTopCategoryPieData = (dashData: any): PieChartData[] =>
  Array.isArray(dashData?.TopCategoryC)
    ? dashData.TopCategoryC.map((item: any, index: number) => ({
        name: item?.Name || "N/A",
        value: item?.Value || 0,
        color: categoryColors[index % categoryColors.length],
      }))
    : [];

// Expense modal data
export const getExpenseDirectRowData = (modalData: any): TableRowData[] =>
  Array.isArray(modalData?.ExpenseDirect)
    ? modalData.ExpenseDirect.map((item: any) => ({
        Name: item?.Name || "N/A",
        Balance: item?.Value?.toFixed(2) || "0.00",
        Code: item?.Code || 0,
        RepId: modalData?.RepdID || "",
      }))
    : [];

export const getExpenseIndirectRowData = (modalData: any): TableRowData[] =>
  Array.isArray(modalData?.ExpenseIndirect)
    ? modalData.ExpenseIndirect.map((item: any) => ({
        Name: item?.Name || "N/A",
        Balance: item?.Value?.toFixed(2) || "0.00",
        Code: item?.Code || 0,
        RepId: modalData?.RepdID || "",
      }))
    : [];

export const getExpenseDirectPieData = (modalData: any): PieChartData[] =>
  Array.isArray(modalData?.ExpenseDirectC)
    ? modalData.ExpenseDirectC.map((item: any) => ({
        name: item?.Name || "N/A",
        value: item?.Value || item?.y || 0,
        color: generateRandomColor(),
      }))
    : [];

export const getExpenseIndirectPieData = (modalData: any): PieChartData[] =>
  Array.isArray(modalData?.ExpenseIndirectC)
    ? modalData.ExpenseIndirectC.map((item: any) => ({
        name: item?.Name || "N/A",
        value: item?.Value || item?.y || 0,
        color: generateRandomColor(),
      }))
    : [];

export const getExpenseDirectBarData = (modalData: any): BarChartData[] =>
  Array.isArray(modalData?.ExpenseDirectC)
    ? modalData.ExpenseDirectC.map((item: any) => ({
        name: item?.Name || "N/A",
        y: item?.Value || item?.y || 0,
      }))
    : [];

export const getExpenseIndirectBarData = (modalData: any): BarChartData[] =>
  Array.isArray(modalData?.ExpenseIndirectC)
    ? modalData.ExpenseIndirectC.map((item: any) => ({
        name: item?.Name || "N/A",
        y: item?.Value || item?.y || 0,
      }))
    : [];
