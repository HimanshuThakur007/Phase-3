import { useLocation, useNavigate } from "react-router-dom";
import Wrapper from "../../common/uicomponent/wrapper";
import GridTable from "../../common/component/GridTable";
import { useEffect, useState } from "react";
import {
  FaEye,
} from "react-icons/fa";
import { useApiHandler } from "../../common/utils/customapiHandler";
import DynamicTrialBalanceTable from "../../common/component/MtTable";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import StockReportTable from "../../common/uicomponent/StockReportTable";
// import CardGridView from "./CardGridView";

interface ReportHeader {
  RptName: string;
  [key: `Header${number}`]: string;
}

interface Action {
  ViewType?: number;
  RepID?: string;
}

interface TableData {
  RepOpt: [];
  ReportHeader?: ReportHeader;
  RptLayOut?: {
    RptColAlignInfo: (
      | "left"
      | "center"
      | "right"
      | "justify"
      | "fill"
      | "centerContinuous"
      | "distributed"
    )[];
    RptColWidthInfo: number[];
  };
  RptBodyHead: string[];
  RptBody: {
    FY: any;
    isPinned: any;
    Data: (string | number)[];
    SubData?: any;
  }[];
  RptBodyFooter: (string | number)[];
  Header: string[];
  Footer: string[];
  Action?: Action;
}

interface NavigateData {
  Caption?: string;
  RepID?: string;
  Data?: TableData;
  formattedData?: any;
}

const DynamicTable: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { decryptedData } = useSelector((state: RootState) => state.authData);
  const {
    CPrintName,
    CAddress1,
    CAddress2,
    CAddress3,
    CAddress4,
    CompCode,
    FinYear,
    ExportR,
  } = decryptedData || {};
  // const theme = useSelector((state: RootState) => state.root.theme);
  const { submitHandler } = useApiHandler();
  const { Caption, Data, formattedData, RepID } =
    (location?.state as { navigateData?: NavigateData })?.navigateData || {};
  const [tableHeight, setTableHeight] = useState<string>("550px");
  const tableData: TableData = Data || {
    ReportHeader: {
      RptName: "",
    },
    RptLayOut: {
      RptColAlignInfo: [],
      RptColWidthInfo: [],
    },
    RptBodyHead: [],
    RepOpt: [],
    RptBody: [],
    RptBodyFooter: [],
    Header: [],
    Action: {},
    Footer: [],
  };
  // Check if Action exists and is valid
  const hasAction =
    tableData?.Action &&
    typeof tableData.Action === "object" &&
    "ViewType" in tableData.Action &&
    "RepID" in tableData.Action &&
    tableData.Action.ViewType != null &&
    tableData.Action.RepID != null;

  // Date parsing
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split(/[-\/]/).map(Number);
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (!day || !month || !year) return null;
    return new Date(year, month - 1, day);
  };

  // Detect voucher/bill number
  const isVchBillNo = (value: any): boolean => {
    if (typeof value !== "string") return false;
    const regex = /^[A-Za-z\/\-]+[0-9A-Za-z]*$/;
    return regex.test(value);
  };
  console.log("RepId", RepID);

  // Universal filter comparator
  const universalFilterComparator = (
    filterValue: string,
    cellValue: any
  ): boolean => {
    if (!filterValue || cellValue == null) return false;
    const strFilter = filterValue.toLowerCase();
    const strValue = String(cellValue).toLowerCase();

    if (isVchBillNo(cellValue)) {
      const regex = /^([A-Za-z\/\-]*?)(\d*[A-Za-z0-9]*)$/;
      const match = strValue.match(regex) || ["", "", ""];
      const prefix = match[1].toLowerCase();
      const number = match[2].toLowerCase();
      return (
        strValue.includes(strFilter) ||
        prefix.includes(strFilter) ||
        number.includes(strFilter)
      );
    }

    const date = parseDate(strValue);
    if (date) {
      const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(
        date.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${date.getFullYear()}`;
      return formattedDate.includes(strFilter);
    }

    const num = parseFloat(strValue);
    if (!isNaN(num)) {
      return strValue.includes(strFilter);
    }

    return strValue.includes(strFilter);
  };

  // Universal comparator for sorting
  const universalComparator = (a: any, b: any) => {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    if (isVchBillNo(a) && isVchBillNo(b)) {
      const strA = String(a);
      const strB = String(b);
      const regex = /^([A-Za-z\/\-]*?)(\d*[A-Za-z0-9]*)$/;
      const matchA = strA.match(regex) || ["", "", "0"];
      const matchB = strB.match(regex) || ["", "", "0"];
      const prefixA = matchA[1];
      const prefixB = matchB[1];
      const numA = parseInt(matchA[2] || "0", 10);
      const numB = parseInt(matchB[2] || "0", 10);

      if (prefixA < prefixB) return -1;
      if (prefixA > prefixB) return 1;
      return numA - numB;
    }

    const dateA = typeof a === "string" ? parseDate(a) : null;
    const dateB = typeof b === "string" ? parseDate(b) : null;
    if (dateA && dateB) {
      return dateA.getTime() - dateB.getTime();
    }
    if (dateA) return -1;
    if (dateB) return 1;

    const numA = typeof a === "number" ? a : parseFloat(String(a));
    const numB = typeof b === "number" ? b : parseFloat(String(b));
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }

    return String(a).localeCompare(String(b), undefined, {
      sensitivity: "base",
      numeric: true,
    });
  };

  const normalizeHeader = (header: any) => header.replace(/[^\w]/g, "_");
  const filteredHeaders = tableData?.RptBodyHead?.slice(1) || [];

  const validAlignments = [
    "left",
    "center",
    "right",
    "justify",
    "fill",
    "centerContinuous",
    "distributed",
  ] as const;
  const validateAlignment = (align: string): (typeof validAlignments)[number] =>
    validAlignments.includes(align as any) ? (align as any) : "left";

  const filteredColAlignInfo =
    tableData?.RptLayOut?.RptColAlignInfo?.slice(1).map(validateAlignment) ||
    [];
  const filteredColWidthInfo =
    tableData?.RptLayOut?.RptColWidthInfo?.slice(1) || [];

  const CHAR_WIDTH = tableData?.RptBodyHead?.length > 7 ? 10 : 15;
  const MAX_WIDTH = tableData?.RptBodyHead?.length > 7 ? 350 : 400;

  // Define column definitions
  const columnDefs = [
    ...(filteredHeaders?.map((header, index) => {
      const charCount = filteredColWidthInfo[index] || 15;
      const calculatedWidth = Math.min(charCount * CHAR_WIDTH, MAX_WIDTH);

      return {
        headerName: header,
        field: normalizeHeader(header),
        sortable: true,
        filter: "agTextColumnFilter",
        resizable: true,
        width: calculatedWidth,
        cellStyle: {
          textAlign: filteredColAlignInfo[index] || "left",
          whiteSpace: "normal",
        },
        comparator: universalComparator,
        filterParams: {
          filterOptions: ["contains", "startsWith", "endsWith"],
          textCustomComparator: universalFilterComparator,
          caseSensitive: false,
        },
      };
    }) || []),
    ...(hasAction
      ? [
        {
          headerName: "View",
          field: "action",
          sortable: false,
          filter: false,
          width: 70,
          cellStyle: { textAlign: "center" },
          pinned: "left" as "left",
          cellRenderer: (params: any) => {
            const { data, node } = params;
            // Render edit button only for non-pinned rows
            if (node.rowPinned) return null;
            const rowIndex = data.id;
            const originalRowData = tableData?.RptBody?.[rowIndex] || {};
            // console.log("originalRowData", originalRowData);
            const rowDataArray = originalRowData.Data || [];
            const fy = originalRowData.FY;

            // Check if the first index of Data is empty
            if (!rowDataArray[0]) {
              return null; // Hide the FaEye button if Data[0] is empty
            }
            // Create a full row object with all headers (including the first index)
            const fullRowData: { [key: string]: string | number } = {};
            tableData?.RptBodyHead?.forEach((header, i) => {
              fullRowData[normalizeHeader(header)] = rowDataArray[i] || "";
            });

            const firstKey = Object.keys(fullRowData)[0];

            return (
              <FaEye
                style={{ cursor: "pointer" }}
                className="cursor-pointer"
                onClick={() => {
                  if (tableData.Action?.ViewType) {
                    const code = fullRowData[firstKey];
                    handleViewDrillDown(
                      tableData?.Action?.RepID ?? "",
                      tableData?.Action?.ViewType,
                      Number(code),
                      fy,
                      tableData?.RepOpt
                    );
                  }
                }}
              />
            );
          },
        },
      ]
      : []),
  ];

  const handleViewDrillDown = async (
    repIdCode: string,
    viewType: number,
    masterId: number,
    fy: string,
    newFormattedData: any
  ) => {
    let jsonData =
      formattedData === undefined ? newFormattedData : formattedData;

    // console.log("JSON (data)", formattedData);
    try {
      await submitHandler({
        url: `Report/GetDrillDownData?SourceRepID=${RepID}&RepId=${repIdCode}&ViewType=${viewType}&MasterID=${masterId}&CompCode=${CompCode}&FY=${fy || FinYear
          }`,
        method: "POST",
        data: jsonData,
        setLoading: (value: any) => {
          console.log("loading", value);
          // updateState({ loading: value });
        },
        onSuccess: (data) => {
          console.log("data(drill report)", data);
          if (viewType === 1) {
            const navigateData = {
              ...data,
              RepID,
              Caption,
            };
            navigate(`/RepList/${repIdCode}`, {
              state: { navigateData },
            });
          } else if (viewType === 2) {
            const navigateData = {
              ...data,
              RepID,
              Caption,
            };
            navigate(`/V-10001`, {
              state: { navigateData },
            });
          }
        },
        onError: (error: any) => {
          console.error("Error saving form:", error);
          // updateState({ loading: false });
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }

    // console.log("Form submitted:", JSON.stringify(formattedData, null, 2));
  };
  // Map RptBody to rowData
  const rowData =
    tableData?.RptBody?.map((row, index) => {
      const rowObj: { [key: string]: string | number } = {};
      tableData?.RptBodyHead?.slice(1).forEach((header, i) => {
        rowObj[normalizeHeader(header)] = row.Data[i + 1] || "";
      });
      if (hasAction) {
        rowObj["action"] = "";
      }
      return { id: index, ...rowObj };
    }) || [];

  // Map RptBodyFooter to pinned bottom row, excluding action
  const pinnedBottomRowData = [
    tableData?.RptBodyFooter?.slice(1).reduce(
      (rowObj: { [key: string]: string | number }, value, i) => {
        const header = tableData?.RptBodyHead[i + 1];
        if (header) {
          rowObj[normalizeHeader(header)] = value || "";
        }
        return rowObj;
      },
      {}
    ),
  ].filter(Boolean);

  // Extract and pair report headers
  const reportHeaders = tableData?.ReportHeader
    ? Object.keys(tableData.ReportHeader)
      .filter((key) => key !== "RptName" && key.startsWith("Header"))
      .sort((a, b) => {
        const numA = parseInt(a.replace("Header", ""), 10);
        const numB = parseInt(b.replace("Header", ""), 10);
        return numA - numB;
      })
      .map((key) => tableData.ReportHeader![key as keyof ReportHeader])
    : [];

  const headerPairs = [];
  for (let i = 0; i < reportHeaders.length; i += 2) {
    const left = reportHeaders[i] || "";
    const right = reportHeaders[i + 1] || "";
    if (left || right) {
      headerPairs.push({ left, right });
    }
  }

  const leftHeaders = headerPairs
    .map((pair) => pair.left)
    .filter((header) => header);
  const rightHeaders = headerPairs
    .map((pair) => pair.right)
    .filter((header) => header);

  // Calculate table height
  useEffect(() => {
    const calculateTableHeight = () => {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const headerHeight = 100;
      const footerHeight = tableData?.Footer?.length > 0 ? 50 : 10;
      const bottomSpace = 50;
      const minHeight = 400;
      const tabletMinWidth = 768;
      const tabletMaxWidth = 1024;
      let calculatedHeight: number;

      if (windowWidth >= 1200) {
        calculatedHeight =
          windowHeight - headerHeight - footerHeight - bottomSpace;
      } else if (
        windowWidth >= tabletMinWidth &&
        windowWidth <= tabletMaxWidth
      ) {
        const tabletAdjustment = windowWidth < 900 ? 150 : 100;
        calculatedHeight =
          windowHeight - headerHeight - footerHeight - tabletAdjustment;
      } else {
        calculatedHeight = windowHeight - headerHeight - footerHeight - 100;
      }

      setTableHeight(`${Math.max(calculatedHeight, minHeight)}px`);
    };

    calculateTableHeight();
    window.addEventListener("resize", calculateTableHeight);
    window.addEventListener("orientationchange", calculateTableHeight);
    return () => {
      window.removeEventListener("resize", calculateTableHeight);
      window.removeEventListener("orientationchange", calculateTableHeight);
    };
  }, []);
  const shouldRenderTrialBalanceTable = (rptBody: any): boolean => {
    return rptBody.some((item: any) => {
      return (
        item.Data &&
        Array.isArray(item.Data) &&
        item.SubData &&
        Array.isArray(item.SubData) &&
        item.SubData.length === 0
      );
    });
  };

  return (
    <>
      {shouldRenderTrialBalanceTable(tableData?.RptBody || []) ? (
        <DynamicTrialBalanceTable
          data={tableData}
          loading={false}
          Caption={Caption}
        />
      ) : (
        <Wrapper
          header={CPrintName}
          subHeader={tableData?.ReportHeader?.RptName ?? ""}
          backButtonName="Back"
          ExportR={ExportR}
        >
          <div className="d-flex justify-content-between m-0">
            <div className="d-flex flex-column align-items-start">
              {leftHeaders.map((header, index) => (
                <p key={`left-${index}`} className="fw-bolder m-0">
                  {header}
                </p>
              ))}
            </div>
            <div className="d-flex flex-column align-items-end">
              {rightHeaders.map((header, index) => (
                <p key={`right-${index}`} className="fw-bolder m-0">
                  {header}
                </p>
              ))}
            </div>
          </div>

          <div className="d-flex justify-content-end mb-3">
            {tableData?.Header?.map((header, index) => (
              <p key={index} className="fw-bolder">
                {header}
              </p>
            ))}
          </div>
          {RepID !== "R-10077" && RepID !== "R-10078" ? (
            <GridTable
              rowData={rowData}
              columnDefs={columnDefs}
              enableEditing={false}
              enableSelection={false}
              pinnedBottomRowData={pinnedBottomRowData}
              reportHeader={tableData?.ReportHeader}
              leftHeaders={leftHeaders}
              rightHeaders={rightHeaders}
              headerData={tableData?.Header}
              footerData={tableData?.Footer}
              Caption={Caption}
              RptColWidthInfo={filteredColWidthInfo}
              RptColAlignInfo={filteredColAlignInfo}
              CPrintName={CPrintName}
              CAddress1={CAddress1}
              CAddress2={CAddress2}
              CAddress3={CAddress3}
              CAddress4={CAddress4}
              height={tableHeight}
            />
          ) : (
            <StockReportTable
              columnDefs={filteredHeaders}
              data={tableData as any}
              reportHeader={tableData?.ReportHeader}
              leftHeaders={leftHeaders}
              rightHeaders={rightHeaders}
              headerData={tableData?.Header}
              footerData={tableData?.Footer}
              Caption={Caption as any}
              RptColWidthInfo={filteredColWidthInfo}
              RptColAlignInfo={filteredColAlignInfo}
              CPrintName={CPrintName}
              CAddress1={CAddress1}
              CAddress2={CAddress2}
              CAddress3={CAddress3}
              CAddress4={CAddress4}
              height={tableHeight}
            />
          )}
          {/* <CardGridView
            rowData={rowData}
            theme={"light_mode"}
            hasAction={hasAction}
            tableData={tableData}
            handleViewDrillDown={handleViewDrillDown}
          /> */}

          <div className="d-flex justify-content-end mt-3">
            {tableData?.Footer?.map((footer, index) => (
              <p key={index} className="fw-bolder">
                {footer}
              </p>
            ))}
          </div>
        </Wrapper>
      )}
    </>
  );
};

export default DynamicTable;
