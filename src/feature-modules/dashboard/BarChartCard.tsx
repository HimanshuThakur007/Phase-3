import React from "react";
import ReactApexChart from "react-apexcharts";

// Define TypeScript interfaces for data and props
interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

interface BarChartCardProps {
  title?: string;
  data?: BarChartData[];
  width?: number | string;
  colors?: string[];
}

const defaultColors = [
  "#FF4560",
  "#008FFB",
  "#00E396",
  "#775DD0",
  "#FEB019",
  "#FF9900",
];

const BarChartCard: React.FC<BarChartCardProps> = ({
  title = "State Wise Sales",
  data = [],
  width = "100%",
  colors,
}) => {
  // If data is empty, render a placeholder
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

  // Prepare chart options
  const barOptions = {
    chart: {
      type: "bar" as const,
      height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
    },
    colors:
      colors ||
      data.map(
        (item, index) =>
          item.color || defaultColors[index % defaultColors.length]
      ),
    xaxis: {
      categories: data.map((item) => item.name),
      title: {
        text: "Value",
      },
    },
    legend: {
      show: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Value",
      data: data.map((item) => item.value),
    },
  ];

  return (
    <div className="col-xl-7 col-sm-12 col-12 d-flex">
      <div className="card flex-fill">
        <div className="card-header d-flex justify-content-center align-items-center">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <div className="card-body">
          <ReactApexChart
            options={barOptions}
            series={series}
            type="bar"
            width={width}
            height={400}
          />
        </div>
      </div>
    </div>
  );
};

export default BarChartCard;
