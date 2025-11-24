// components/RadialBarChart.tsx
import React from "react";
import ReactApexChart from "react-apexcharts";

interface RadialBarChartProps {
  series: number[];
  labels: string[];
  colors?: string[];
  height?: number;
  totalLabel?: string;
  totalFormatter?: (w: any) => string;
  title?: string;
}

const RadialBarChart: React.FC<RadialBarChartProps> = ({
  title,
  series,
  labels,
  colors = ["#3b82f6", "#facc15", "#ec4899", "#14b8a6", "#6366f1", "#f97316"],
  height = 350,
  totalLabel = "Total",
  totalFormatter,
}) => {
  const options = {
    chart: {
      height: height,
      type: "radialBar" as const,
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: "22px",
          },
          value: {
            fontSize: "16px",
            formatter: function (val: number) {
              // Use the value provided by ApexCharts
              return val.toFixed(2);
            },
          },
          total: {
            show: true,
            label: totalLabel,
            formatter:
              totalFormatter ??
              function () {
                // Return the sum of series values as the total
                return series
                  .reduce((a, b) => a + b, 0)
                  .toFixed(2)
                  .toString();
              },
          },
        },
      },
    },
    labels,
    colors,
    tooltip: {
      y: {
        formatter: function (val: number, opts: any) {
          console.log(val);
          // Ensure tooltip on hover shows the raw series value
          const seriesValue = series[opts.seriesIndex] || 0;
          return seriesValue.toFixed(2);
        },
      },
    },
  };

  return (
    <div className="col-xl-7 col-sm-12 col-12 d-flex">
      <div className="card flex-fill p-3">
        <div className="card-header d-flex justify-content-center align-items-center">
          <h5 className="card-title mb-0">{title}</h5>
        </div>
        <div className="card-body d-flex justify-content-center align-items-center"></div>
        <ReactApexChart
          options={options}
          series={series}
          type="radialBar"
          height={height}
        />
      </div>
    </div>
  );
};

export default RadialBarChart;
