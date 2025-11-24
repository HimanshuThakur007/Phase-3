import React from "react";
import Chart from "react-apexcharts";
import GridTable from "../component/GridTable";

interface TableData {
  [key: string]: any;
}
interface ChartData {
  name: string;
  value: number;
  color?: string;
}
interface BarData {
  name: string;
  y: number;
}
interface MultiViewDashboardCardProps {
  title?: string;
  colSize?: string;
  viewType: number;
  setViewType?: (viewType: number) => void;
  tableData?: {
    rowData: TableData[];
    colDef: any[];
    total?: number;
    onRowClick?: (event: { data: TableData }) => void;
  };
  chartData?: ChartData[];
  barData?: BarData[];
  theme?: string;
  height?: string;
  cursor?: string;
  onViewTypeChange?: (viewType: number) => void;
  onRefresh?: () => void;
}

const defaultColors = [
  "#f4c542",
  "#ff7043",
  "#5c5470",
  "#cfd8dc",
  "#90caf9",
  "#aed581",
];

const MultiViewDashboardCard: React.FC<MultiViewDashboardCardProps> = ({
  title = "",
  colSize = "6",
  viewType = 3,
  setViewType,
  tableData = {
    rowData: [],
    colDef: [],
    total: undefined,
    onRowClick: undefined,
  },
  chartData = [],
  barData = [],
  theme = "light_mode",
  height = "400px",
  cursor = "1",
  onViewTypeChange,
  onRefresh,
}) => {
  const chartTotal = chartData.reduce((sum, item) => sum + item.value, 0);

  const handleTabClick = (newViewType: number) => {
    if (setViewType) setViewType(newViewType);
    if (onViewTypeChange) onViewTypeChange(newViewType);
  };

  const chartColors = chartData.map(
    (item, i) => item.color || defaultColors[i % defaultColors.length]
  );

  const pieDonutOptions: ApexCharts.ApexOptions = {
    chart: {
      type: viewType === 4 ? "donut" : "pie",
      height: "100%",
      background: "transparent",
      foreColor: theme === "dark_mode" ? "#fff" : "#222",
      animations: { enabled: true, speed: 800 },
    },
    labels: chartData.map((item) => item.name),
    colors: chartColors,
    theme: { mode: theme === "dark_mode" ? "dark" : "light" },
    legend: {
      position: "top",
      labels: { colors: theme === "dark_mode" ? "#e5e7eb" : "#1f2937" },
    },
    tooltip: { theme: theme === "dark_mode" ? "dark" : "light" },
    dataLabels: {
      enabled: true,
      // style: { colors: [theme === "dark_mode" ? "#e5e7eb" : "#222"] },
      style: { colors: [theme === "dark_mode" ? "#e5e7eb" : "#e5e7eb"] },
    },
    plotOptions:
      viewType === 4
        ? {
            pie: {
              donut: {
                size: "70%",
                labels: {
                  show: true,
                  name: { show: true, fontSize: "14px" },
                  value: { show: true, fontSize: "18px", fontWeight: 600 },
                  total: {
                    show: true,
                    label: "Total",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: theme === "dark_mode" ? "#fff" : "#222",
                    formatter: () => chartTotal.toLocaleString(),
                  },
                },
              },
            },
          }
        : {},
    fill: viewType === 4 ? { type: "gradient" } : {},
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: "100%" },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  const pieDonutSeries = chartData.map((item) => item.value);
  const barOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: "100%",
      background: "transparent",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 6,
        distributed: true,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: barData.map((item) => item.name),
      labels: { style: { colors: theme === "dark_mode" ? "#e5e7eb" : "#222" } },
    },
    yaxis: {
      // labels: { style: { colors: theme === "dark_mode" ? "#e5e7eb" : "#222" } },
      labels: { style: { colors: theme === "dark_mode" ? "#e5e7eb" : "#222" } },
    },
    theme: { mode: theme === "dark_mode" ? "dark" : "light" },
    tooltip: { theme: theme === "dark_mode" ? "dark" : "light" },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: [theme === "dark_mode" ? "#1e40af" : "#2563eb"],
        opacityFrom: 0.9,
        opacityTo: 0.7,
        stops: [0, 100],
      },
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["#fff"],
    },
    legend: {
      show: false,
    },
  };

  const barSeries = [{ name: title, data: barData.map((item) => item.y) }];

  const NoDataCard = ({ view }: { view: string }) => (
    <div className="no-data-card text-center p-3">
      <h6 className="mb-2">{title}</h6>
      <p className="text-muted">No {view} Data Available</p>
    </div>
  );

  return (
    <div className={`col-xl-${colSize} col-sm-12 col-12 d-flex`}>
      <div
        className="card flex-fill mb-4 d-flex flex-column"
        style={{
          minHeight: height,
          // border: "none",
          // borderRadius: "1.5rem",
          // background:
          //   theme === "dark_mode"
          //     ? "linear-gradient(135deg, #232526 0%, #414345 100%)"
          //     : "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
          // boxShadow: "0 6px 32px 0 rgba(0,0,0,0.10)",
          // overflow: "hidden",
        }}
      >
        {/* Card Header */}
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh && onRefresh();
              }}
              style={{
                background: "#004588",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                transition: "all 0.2s ease",
              }}
              title="Refresh"
              aria-label="Refresh chart data"
            >
              ⟳
            </button>
            <h4 className="card-title mb-0 fw-bold">{title}</h4>
          </div>
          {setViewType && (
            <div className="d-flex gap-1">
              <button
                className={`btn btn-sm ${
                  viewType === 3 ? "btn-primary" : "btn-outline-primary"
                }`}
                style={{
                  borderRadius: "1.2rem",
                  fontWeight: 500,
                  minWidth: 60,
                  transition: "all 0.18s",
                  boxShadow: viewType === 3 ? "0 2px 8px #007bff33" : "none",
                }}
                onClick={() => handleTabClick(3)}
                aria-selected={viewType === 3}
              >
                Table
              </button>
              <button
                className={`btn btn-sm ${
                  viewType === 1 ? "btn-primary" : "btn-outline-primary"
                }`}
                style={{
                  borderRadius: "1.2rem",
                  fontWeight: 500,
                  minWidth: 60,
                  transition: "all 0.18s",
                  boxShadow: viewType === 1 ? "0 2px 8px #007bff33" : "none",
                }}
                onClick={() => handleTabClick(1)}
                aria-selected={viewType === 1}
              >
                Pie
              </button>
              <button
                className={`btn btn-sm ${
                  viewType === 4 ? "btn-primary" : "btn-outline-primary"
                }`}
                style={{
                  borderRadius: "1.2rem",
                  fontWeight: 500,
                  minWidth: 60,
                  transition: "all 0.18s",
                  boxShadow: viewType === 4 ? "0 2px 8px #007bff33" : "none",
                }}
                onClick={() => handleTabClick(4)}
                aria-selected={viewType === 4}
              >
                Donut
              </button>
              <button
                className={`btn btn-sm ${
                  viewType === 2 ? "btn-primary" : "btn-outline-primary"
                }`}
                style={{
                  borderRadius: "1.2rem",
                  fontWeight: 500,
                  minWidth: 60,
                  transition: "all 0.18s",
                  boxShadow: viewType === 2 ? "0 2px 8px #007bff33" : "none",
                }}
                onClick={() => handleTabClick(2)}
                aria-selected={viewType === 2}
              >
                Bar
              </button>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="card-body m-0 p-0 flex-grow-1 d-flex flex-column justify-content-center">
          {viewType === 3 &&
            (tableData.rowData.length > 0 ? (
              <GridTable
                columnDefs={tableData.colDef}
                rowData={tableData.rowData}
                height="100%"
                onRowClick={tableData.onRowClick}
                cursor={cursor}
              />
            ) : (
              <NoDataCard view="Table" />
            ))}
          {viewType === 1 &&
            (chartData.length > 0 ? (
              <div
                style={{
                  height: "100%",
                  minHeight: "350px",
                  padding: "1.5rem",
                }}
              >
                <Chart
                  options={pieDonutOptions}
                  series={pieDonutSeries}
                  type="pie"
                  height="100%"
                />
              </div>
            ) : (
              <NoDataCard view="Pie Chart" />
            ))}
          {viewType === 4 &&
            (chartData.length > 0 ? (
              <div
                style={{
                  height: "100%",
                  minHeight: "350px",
                  padding: "1.5rem",
                }}
              >
                <Chart
                  options={pieDonutOptions}
                  series={pieDonutSeries}
                  type="donut"
                  height="100%"
                />
              </div>
            ) : (
              <NoDataCard view="Donut Chart" />
            ))}
          {viewType === 2 &&
            (barData.length > 0 ? (
              <div
                style={{
                  height: "100%",
                  minHeight: "350px",
                  padding: "1.5rem",
                }}
              >
                <Chart
                  options={barOptions}
                  series={barSeries}
                  type="bar"
                  height="100%"
                />
              </div>
            ) : (
              <NoDataCard view="Bar Chart" />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MultiViewDashboardCard;
