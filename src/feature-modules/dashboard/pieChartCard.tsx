import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartCardProps {
  title?: string;
  data?: PieChartData[];
  width?: number | string;
  colors?: string[];
  theme?: "light_mode" | "dark_mode";
  type?: "pie" | "donut";
}

const defaultColors = [
  "#f4c542", // Yellow
  "#ff7043", // Orange
  "#5c5470", // Dark Purple
  "#cfd8dc", // Gray Blue
  "#90caf9", // Soft Blue
  "#aed581", // Light Green
];

const PieChartCard: React.FC<PieChartCardProps> = ({
  title = "State Wise Sales",
  data = [],
  width = 380,
  colors,
  theme = "light_mode",
  type = "pie",
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="col-xl-7 col-sm-12 col-12 d-flex">
        <div className="card flex-fill">
          <div className="card-header d-flex justify-content-center align-items-center">
            <h5 className="card-title mb-0">{title}</h5>
          </div>
          <div className="card-body text-center">
            <p>Loading data or no data available...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const chartColors =
    colors ||
    data.map(
      (item, i) => item.color || defaultColors[i % defaultColors.length]
    );

  const statewiseOptions = useMemo(() => {
    const options: ApexCharts.ApexOptions = {
      chart: {
        type,
        height: 350,
        foreColor: theme === "dark_mode" ? "#ffffff" : "#000000",
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      labels: data.map((item) => item.name),
      colors: chartColors,
      legend: {
        position: "bottom",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    };

    if (type === "donut") {
      options.plotOptions = {
        pie: {
          donut: {
            size: "70%",
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: "14px",
              },
              value: {
                show: true,
                fontSize: "18px",
                fontWeight: 600,
              },
              total: {
                show: true,
                label: "Total",
                fontSize: "16px",
                fontWeight: 600,
                color: theme === "dark_mode" ? "#ffffff" : "#000000",
                formatter: () => totalValue.toLocaleString(),
              },
            },
          },
        },
      };

      options.fill = {
        type: "gradient",
      };
    }

    return options;
  }, [data, chartColors, theme, type, totalValue]);

  const series = data.map((item) => item.value);

  return (
    <div className="col-xl-7 col-sm-12 col-12 d-flex">
      <div className="card flex-fill p-3">
        <div className="card-header d-flex justify-content-center align-items-center">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <div className="card-body d-flex justify-content-center align-items-center mb-2">
          <ReactApexChart
            // key={`${theme}-${type}-${title}${data}`}
            options={statewiseOptions}
            series={series}
            type={type}
            width={width}
          />
        </div>
      </div>
    </div>
  );
};

export default PieChartCard;
