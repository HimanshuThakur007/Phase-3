import { useFormContext } from "react-hook-form";
import MultiViewDashboardCard from "../../common/component/MultiViewDashboardCard";
import DashboardMainCountCard from "../../common/uicomponent/DashboardCountCard";
import DashboardCard from "./countcard";
import OrderAndSaleCard from "./orderAndsalecard";
import Select from "react-select";

// Interface for UserType4 data
interface DBOtherDetailType {
  ARBPNSaleVch?: number;
  ARBPNSaleRVch?: number;
  NORP?: number;
  RPAmount?: number;
  AvgOutstanding?: number;
  AOPD?: number;
  OSAmount?: number;
  ARBP?: number;
  ARPU?: number;
  ARPUTItems?: number;
  AORD?: number;
  RapId?: string;
  MasterCode?: number;
}

interface UserType4Data {
  customMetric1?: number;
  customMetric2?: number;
  customTableData?: { id: number; name: string; value: number }[];
  salesVouchers?: number;
  totalBillAmount?: number;
  totalSalesAmount?: number;
  totalSalesReturnAmount?: number;
  totalReceiptAmount?: number;
  avgOutstandingDays?: number;
  avgOutstandingAmount?: number;
  debitAmount?: number;
  creditAmount?: number;
  DBOtherDetail?: DBOtherDetailType;
  OutStandingDBRepID?: string;
}

// Configuration for dashboard cards based on UserType
const cardConfigs = (
  UserType?: number,
  handleItemClick?: any,
  data?: UserType4Data,
  uType4Value?: any // 🔹 Add uType4Value as a parameter
) =>
  UserType === 5
    ? [
        {
          title: "No. Of Purchase",
          tooltipText: "Number of Purchase",
          bg: "rgb(153, 102, 255)", // Purple
          getCount: (data: UserType4Data) =>
            data?.DBOtherDetail?.ARBPNSaleVch ?? 0,
          detail1: (data: any) =>
            `No of Purchase Return: ${data?.DBOtherDetail?.ARBPNSaleRVch ?? 0}`,
        },
        {
          title: "No. Of Payment",
          tooltipText: "Number of Payment",
          bg: "rgb(153, 102, 255)", // Purple
          getCount: (data: UserType4Data) => data.DBOtherDetail?.NORP ?? 1,
          detail1: (data: any) =>
            `Total Payment: ${data?.DBOtherDetail?.RPAmount}`,
        },
        {
          title: "Avg. O/S Amt.",
          tooltipText: "Average Outstanding Amount",
          bg: "rgb(54, 162, 235)", // Blue
          getCount: (data: UserType4Data) =>
            data.DBOtherDetail?.AvgOutstanding ?? 1,
          detail1: (data: any) =>
            `Average Outstanding Days: ${data?.DBOtherDetail?.AOPD ?? 0}`,
        },
        {
          title: "O/S",
          tooltipText: "Outstanding",
          bg: "rgb(255, 99, 132)", // Pink
          getCount: (data: UserType4Data) => data.DBOtherDetail?.OSAmount ?? 0,
          onClick: handleItemClick,
          rapId: data?.DBOtherDetail?.RapId ?? "outstanding-report",
          masterCode: uType4Value?.Value ?? 0, // 🔹 Use uType4Value.Value
          recType: 1,
          viewType: 1,
        },
      ]
    : [
        {
          title: "ARPB",
          tooltipText: "Average Revenue Per Bill",
          bg: "rgb(83, 196, 202)", // Cyan
          getCount: (data: UserType4Data) => data?.DBOtherDetail?.ARBP ?? 0,
          detail1: (data: any) =>
            `No of Sales Vch: ${data?.DBOtherDetail?.ARBPNSaleVch ?? 0}`,
          detail2: (data: any) =>
            `No of Sales Return Vch: ${
              data?.DBOtherDetail?.ARBPNSaleRVch ?? 0
            }`,
        },
        {
          title: "ARPU",
          tooltipText: "Average Revenue Per Unit",
          bg: "rgb(202, 83, 196)",
          getCount: (data: UserType4Data) => data.DBOtherDetail?.ARPU ?? 0,
          detail1: (data: any) =>
            `No of Selling Items: ${data.DBOtherDetail?.ARPUTItems ?? 0}`,
        },
        {
          title: "No. Of Receipt",
          tooltipText: "Number of Receipts",
          bg: "rgb(153, 102, 255)",
          getCount: (data: UserType4Data) => data.DBOtherDetail?.NORP ?? 0,
          detail1: (data: any) =>
            `Total Collection: ${data?.DBOtherDetail?.RPAmount ?? 0}`,
        },
        {
          title: "Avg. O/S Amt.",
          tooltipText: "Average Outstanding Amount",
          bg: "rgb(54, 162, 235)",
          getCount: (data: UserType4Data) =>
            data.DBOtherDetail?.AvgOutstanding ?? 0,
          detail1: (data: any) =>
            `Average Outstanding Days: ${data?.DBOtherDetail?.AORD ?? 0}`,
        },
        {
          title: "O/S",
          tooltipText: "Outstanding",
          bg: "rgb(255, 99, 132)",
          getCount: (data: UserType4Data) => data.DBOtherDetail?.OSAmount ?? 0,
          onClick: handleItemClick,
          rapId: data?.OutStandingDBRepID,
          masterCode: uType4Value?.value ?? 0, // 🔹 Use uType4Value.Value
          recType: 0,
          viewType: 1,
        },
      ].map((card) => {
        if (card.title === "O/S" && !card.rapId) {
          console.warn(
            "rapId is undefined for the O/S card. Using fallback 'outstanding-report'. Check API response for RapId in data.DBOtherDetail."
          );
        }
        return card;
      });

export const UserType4Dashboard: React.FC<{
  data: UserType4Data;
  onRefresh: () => void;
  cardData: any[];
  agiengData: any[];
  handleItemClick?: (
    rapId: string,
    masterCode: number,
    recType?: number,
    viewType?: number
  ) => Promise<boolean>;
  handleRefresh?: any;
  getDynamicColSizeForMainCards: (numCards: number) => string;
  handleOrderSalsRefresh?: any;
  getDynamicColSize?: any;
  subDashboardData?: any;
  theme?: string;
  ordersSalesVisibleCount?: number;
  toggleValue?: number;
  subDashboardTopProductData?: any;
  salesmanProductVisibleCount?: number;
  productViewType?: number;
  setProductViewType?: any;
  topProductRowData?: any;
  topProductColDef?: any;
  onRowClick?: any;
  topProductPieData?: any;
  topProductBarData?: any;
  handleProductRefresh?: any;
  topCategoryPieData?: any;
  topCategoryRowData?: any;
  topCategoryColDef?: any;
  handleCategoryRefresh?: any;
  categoryViewType?: number;
  setCategoryViewType?: any;
  topCategoryBarData?: any;
  UserType?: number;
  dashboardAccountSelect?: any[];
  handelSelectChange?: any;
  fetchsubDashboardData?: any;
  toggleOptions?: any;
}> = ({
  data,
  onRefresh,
  cardData,
  handleItemClick,
  handleRefresh,
  getDynamicColSizeForMainCards,
  agiengData,
  handleOrderSalsRefresh,
  getDynamicColSize,
  subDashboardData,
  theme,
  ordersSalesVisibleCount,
  toggleValue,
  subDashboardTopProductData,
  salesmanProductVisibleCount,
  productViewType,
  setProductViewType,
  topProductRowData,
  topProductColDef,
  onRowClick,
  topProductPieData,
  topProductBarData,
  handleProductRefresh,
  topCategoryPieData,
  topCategoryRowData,
  topCategoryColDef,
  handleCategoryRefresh,
  categoryViewType,
  setCategoryViewType,
  topCategoryBarData,
  UserType,
  dashboardAccountSelect,
  handelSelectChange,
  fetchsubDashboardData,
  toggleOptions,
}) => {
  const { watch, setValue } = useFormContext<{
    toggleValue: number;
    uType4Value: any;
  }>();
  const uType4Value = watch("uType4Value");
  console.log("uType4Value", uType4Value);

  return (
    <div className="content">
      <div className="row">
        <div className="col-lg-4 ms-lg-auto">
          <div className="mb-3">
            <Select
              className="select w-100"
              classNamePrefix="react-select"
              options={dashboardAccountSelect}
              value={uType4Value}
              onChange={(selectedOption) => {
                setValue("uType4Value", selectedOption);
                handelSelectChange(selectedOption);
              }}
              isDisabled={false}
              placeholder="Select Value Type"
            />
          </div>
        </div>
      </div>
      <div className="row">
        {cardConfigs(UserType, handleItemClick, data, uType4Value).map(
          (card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              count={card.getCount(data)}
              tooltipText={card.tooltipText}
              detail1={
                typeof card.detail1 === "function"
                  ? card.detail1(data)
                  : card.detail1
              }
              detail2={
                typeof card.detail2 === "function"
                  ? card.detail2(data)
                  : card.detail2
              }
              bg={card.bg}
              colsize="4"
              onRefresh={onRefresh}
              onClick={card.onClick}
              rapId={card.rapId}
              masterCode={card.masterCode}
              recType={card.recType}
              viewType={card.viewType}
            />
          )
        )}
      </div>
      <div className="row">
        <DashboardMainCountCard
          data={cardData}
          colSize={getDynamicColSizeForMainCards(cardData.length)}
          onItemClick={handleItemClick}
          onRefresh={handleRefresh}
        />
        <DashboardMainCountCard
          data={agiengData}
          colSize={getDynamicColSizeForMainCards(agiengData.length)}
          onCardClick={handleItemClick}
          onRefresh={handleRefresh}
        />
      </div>
      <div className="row">
        <div className="mb-3" style={{ maxWidth: "200px" }}>
          <Select
            className="select"
            classNamePrefix="react-select"
            options={toggleOptions}
            value={toggleOptions.find(
              (option: any) => option.value === toggleValue
            )}
            onChange={(selectedOption) => {
              const value = selectedOption ? selectedOption.value : 2;
              setValue("toggleValue", value);
              fetchsubDashboardData(value);
            }}
            isDisabled={false}
            placeholder="Select Value Type"
          />
        </div>
      </div>
      <div className="row">
        <OrderAndSaleCard
          heading={`Orders and ${UserType === 4 ? "Sales" : "Purchases"}`}
          data={subDashboardData || []}
          theme={theme}
          colSize={getDynamicColSize(ordersSalesVisibleCount)}
          onRefresh={handleOrderSalsRefresh}
          series1={UserType === 4 ? "Sales" : "Purchase"}
        />
        <MultiViewDashboardCard
          key={`product-pie-${toggleValue}-${
            subDashboardTopProductData?.TopProductC?.length || 0
          }`}
          title="Top Product"
          colSize={getDynamicColSize(salesmanProductVisibleCount)}
          viewType={productViewType as any}
          setViewType={setProductViewType}
          tableData={{
            rowData: topProductRowData,
            colDef: topProductColDef,
            onRowClick,
          }}
          chartData={topProductPieData}
          barData={topProductBarData}
          theme={theme}
          height="350px"
          cursor="1"
          onViewTypeChange={(newViewType) =>
            console.log(`Product view type changed to: ${newViewType}`)
          }
          onRefresh={handleProductRefresh}
        />
        <MultiViewDashboardCard
          key={`category-pie-${toggleValue}-${topCategoryPieData.length || 0}`}
          title="Top Category"
          colSize="12"
          viewType={categoryViewType as any}
          setViewType={setCategoryViewType}
          tableData={{
            rowData: topCategoryRowData,
            colDef: topCategoryColDef,
            onRowClick,
          }}
          chartData={topCategoryPieData}
          barData={topCategoryBarData}
          theme={theme}
          height="350px"
          cursor="1"
          onViewTypeChange={(newViewType) =>
            console.log(`Category view type changed to: ${newViewType}`)
          }
          onRefresh={handleCategoryRefresh}
        />
      </div>
    </div>
  );
};
