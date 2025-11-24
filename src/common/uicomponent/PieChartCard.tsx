import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts"; // ✅ Import ApexOptions type

interface PieChartCardProps {
  title: string;
  data: { name: string; value: number; color?: string }[];
  theme?: string; // "dark_mode" or "light_mode"
  height?: string; // Height of the card
}

const PieChartCard: React.FC<PieChartCardProps> = ({
  title,
  data,
  theme = "light_mode",
  height,
}) => {
  const series = data?.map((item) => item.value);

  const options: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "pie" as const, // ✅ Fix: Narrow the type to literal
        height: 250,
        foreColor: theme === "dark_mode" ? "#ffffff" : "#000000",
      },
      title: {
        text: title,
        align: "center",
        style: {
          fontSize: "16px",
          fontWeight: "bold",
          color: theme === "dark_mode" ? "#ffffff" : "#000000",
        },
      },
      labels: data?.map((item) => item.name),
      colors: data?.map((item) => item.color || "#000000"),
      legend: {
        position: "bottom",
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: "100%",
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    }),
    [data, theme, title]
  );

  return (
    <div className="card p-3" style={{ height: height }}>
      <ReactApexChart
        key={theme + JSON.stringify(data)}
        options={options}
        series={series}
        type="pie"
        height={350}
      />
    </div>
  );
};

export default PieChartCard;
