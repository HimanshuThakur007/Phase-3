import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
// import LoadingDots from "../../common/uicomponent/LoadingDots";

interface OrderAndSaleCardProps {
  data: {
    MonthS: string[];
    MonthSData: number[];
    MonthOData: number[];
  };
  theme?: string; // Add dark_mode / light_mode control
  colSize?: string; // Add colSize prop
  onRefresh?: () => void;
  heading?: string;
  series1?: string;
  series2?: string;
}

const OrderAndSaleCard: React.FC<OrderAndSaleCardProps> = ({
  data,
  theme = "light_mode",
  colSize = "12", // Default to full width if not provided
  onRefresh,
  heading,
  series1 = "Sales",
  series2 = "Orders",
  // loading,
}) => {
  const [chartOptions, setChartOptions] = useState<ApexOptions>({
    series: [],
    colors: ["#28C76F", "#EA5455"], // Green for Sales, Red for Orders
    chart: {
      type: "bar",
      height: 320,
      zoom: {
        enabled: true,
      },
      foreColor: theme === "dark_mode" ? "#ffffff" : "#000000", // Dark mode support
    },
    responsive: [
      {
        breakpoint: 280,
        options: {
          legend: {
            position: "bottom",
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        borderRadiusApplication: "end",
        columnWidth: "40%", // Adjust width to fit two bars side by side
      },
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: {
      min: 0,
      max: 0,
      tickAmount: 7,
      labels: {
        formatter: (value: number) => value.toFixed(0), // No decimals for cleaner display
      },
    },
    xaxis: {
      categories: [],
    },
    legend: {
      show: true, // Show legend to distinguish Sales and Orders
      position: "top",
      horizontalAlign: "center",
      labels: {
        colors: theme === "dark_mode" ? "#ffffff" : "#000000",
      },
    },
    fill: {
      opacity: 1,
    },
  });

  useEffect(() => {
    if (data?.MonthS && data?.MonthSData && data?.MonthOData) {
      const allValues = [...data.MonthSData, ...data.MonthOData];
      const minValue = Math.min(...allValues.filter((v) => v !== 0)) * 0.9; // Add padding to min
      const maxValue = Math.max(...allValues) * 1.1; // Add padding to max

      setChartOptions((prevOptions) => ({
        ...prevOptions,
        series: [
          { name: series1, data: data.MonthSData },
          { name: series2, data: data.MonthOData },
        ],
        xaxis: {
          ...prevOptions.xaxis,
          categories: data.MonthS,
        },
        yaxis: {
          ...prevOptions.yaxis,
          min: minValue,
          max: maxValue,
          tickAmount: 7,
          labels: {
            formatter: (value: number) => value.toFixed(0),
          },
        },
        chart: {
          ...prevOptions.chart,
          foreColor: theme === "dark_mode" ? "#ffffff" : "#000000",
        },
      }));
    }
  }, [data, theme]);

  return (
    <div className={`col-xl-${colSize} col-sm-12 col-12 d-flex`}>
      <div
        className={`card flex-fill ${
          theme === "dark_mode" ? "bg-dark text-white" : ""
        }`}
      >
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">{heading}</h5>
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
          >
            ⟳
          </button>
        </div>
        <div className="card-body">
          {/* {loading ? (
            <LoadingDots size="small" />
          ) : ( */}
          <Chart
            options={chartOptions}
            series={chartOptions.series}
            type="bar"
            height={320}
          />
          {/* )} */}
        </div>
      </div>
    </div>
  );
};

export default OrderAndSaleCard;
