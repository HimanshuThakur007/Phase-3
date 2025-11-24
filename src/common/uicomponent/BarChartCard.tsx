import React from "react";
import ReactApexChart from "react-apexcharts";
// import { ApexOptions } from "apexcharts";

interface BarChartCardProps {
  title: string;
  data: { name: string; y: number }[];
  theme?: string; // "dark_mode" or "light_mode"
}

const BarChartCard: React.FC<BarChartCardProps> = ({
  title,
  data,
  theme = "light_mode",
}) => {
  const series = [
    {
      name: title,
      data: data.map((item) => item.y),
    },
  ];

  // const options: ApexOptions = useMemo(
  //   () => ({
  //     chart: {
  //       type: "bar" as const,
  //       height: 250,
  //       foreColor: theme === "dark_mode" ? "#ffffff" : "#000000", // Label & axis color
  //     },
  //     title: {
  //       text: title,
  //       align: "center",
  //       style: {
  //         fontSize: "16px",
  //         fontWeight: "bold",
  //         color: theme === "dark_mode" ? "#ffffff" : "#000000",
  //       },
  //     },
  //     xaxis: {
  //       categories: data?.map((item) => item.name),
  //       labels: {
  //         rotate: -45,
  //         style: {
  //           fontSize: "12px",
  //         },
  //       },
  //     },
  //     yaxis: {
  //       title: {
  //         text: "Balance",
  //       },
  //     },
  //     plotOptions: {
  //       bar: {
  //         horizontal: false,
  //         columnWidth: "55%",
  //       },
  //     },
  //     dataLabels: {
  //       enabled: false,
  //     },
  //     colors: ["#007bff"],
  //     responsive: [
  //       {
  //         breakpoint: 480,
  //         options: {
  //           chart: {
  //             width: "100%",
  //           },
  //         },
  //       },
  //     ],
  //   }),
  //   [data, theme, title]
  // );
  const options: ApexCharts.ApexOptions = {
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
      categories: data?.map((item) => item.name),
      labels: { style: { colors: theme === "dark_mode" ? "#e5e7eb" : "#222" } },
    },
    yaxis: {
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
      show: false, // Hide the legend
    },
  };
  return (
    <div
      className={`card p-3 ${
        theme === "dark_mode" ? "bg-dark text-white" : ""
      }`}
    >
      <ReactApexChart
        key={theme + JSON.stringify(data)} // Force re-render on theme change
        options={options}
        series={series}
        type="bar"
        height={500}
      />
    </div>
  );
};

export default BarChartCard;
