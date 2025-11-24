// InventoryDashboard.tsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import BranchSummariesDashboard from "./BranchSummariesDashboard";
import DepartmentSummariesDashboard from "./DepartmentSummariesDashboard";
import CenteredLoader from "../../common/component/CenteredLoader";
import ShowSavedFilters from "./ShowSavedFilters";

// ---------------------------
// Enhanced Colors
const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
  "#14b8a6",
  "#f43f5e",
  "#a855f7",
  "#0ea5e9",
  "#84cc16",
  "#f97316",
  "#ef4444",
];

export function darkenColor(hex: string, percent: number): string {
  let color = hex.startsWith("#") ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const num = parseInt(color, 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);

  return `#${(0x1000000 + (R << 16) + (G << 8) + B)
    .toString(16)
    .slice(1)
    .padStart(6, "0")
    .toUpperCase()}`;
}

const CustomDeptTooltip = ({ active, payload }: any) => {
  if (active && payload && payload[0]) {
    const data = payload[0].payload;
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "10px 12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontSize: "13px",
        }}
      >
        <p style={{ margin: 0, fontWeight: 600, color: "#1e293b" }}>
          {data.name}
        </p>
        <p style={{ margin: "4px 0", color: "#475569" }}>
          <strong>Items:</strong> {data.value.toLocaleString("en-IN")}
        </p>
        <p style={{ margin: 0, color: "#4f46e5", fontWeight: 600 }}>
          {data.percentage}%
        </p>
      </div>
    );
  }
  return null;
};
// ---------------------------
// Custom Tooltips
const CustomTooltip1 = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="custom-tooltip p-3 bg-white border rounded shadow-sm"
        style={{
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <p className="fw-bold mb-2">{data.name}</p>
        <p className="mb-1">
          <strong>import Qty:</strong> {data.import?.toLocaleString("en-IN")}
        </p>
        <p className="mb-1">
          <strong>local Qty:</strong> {data.local?.toLocaleString("en-IN")}
        </p>
        <p className="mb-1">
          <strong>Total Qty:</strong> {data.value?.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="custom-tooltip p-3 bg-white border rounded shadow-sm"
        style={{
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <p className="fw-bold mb-2">{data.name}</p>
        <p className="mb-1">
          <strong>import val:</strong> {data.sp_import?.toLocaleString("en-IN")}
        </p>
        <p className="mb-1">
          <strong>local val:</strong> {data.sp_local?.toLocaleString("en-IN")}
        </p>
        <p className="mb-1">
          <strong>Total Val:</strong> {data.sp_value?.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="p-3 bg-white border rounded shadow-sm"
        style={{
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontSize: "13px",
          color: "#1e293b",
        }}
      >
        <p className="fw-bold mb-2">{data.name}</p>
        {data.import !== undefined && (
          <p className="mb-1">
            <strong>Import Qty:</strong> {data.import.toLocaleString("en-IN")}
          </p>
        )}
        {data.local !== undefined && (
          <p className="mb-1">
            <strong>Local Qty:</strong> {data.local.toLocaleString("en-IN")}
          </p>
        )}
        {data.value !== undefined && (
          <p className="mb-0">
            <strong>Total Qty:</strong> {data.value.toLocaleString("en-IN")}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const InventoryDashboard: React.FC = () => {
  const {
    stockBucketData,
    salesBucketData,
    spBucketData,
    deptData,
    totals,
    loading,
    error,
  } = useSelector((state: any) => state.dashboard);
  const navigate = useNavigate();
  // console.log("deptData", deptData);
  const [activeTab, setActiveTab] = React.useState<"department" | "branch">(
    "department"
  );

  // -----------------------------------------------------------------
  // Process spBucketData
  // -----------------------------------------------------------------
  const processedSspData = useMemo(() => {
    if (!Array.isArray(spBucketData)) return [];
    return spBucketData
      .filter((item: any) => item.name && item.name !== "spBucket")
      .map((item: any) => ({
        name: item.name,
        sp_import: item.sp_import ?? 0,
        sp_local: item.sp_local ?? 0,
        sp_value: item.sp_value ?? 0,
      }));
  }, [spBucketData]);

  // -----------------------------------------------------------------
  // Formatters
  // -----------------------------------------------------------------
  const formatCurrency = (val: number) =>
    val >= 100000
      ? `₹${(val / 100000).toFixed(1)}L`
      : `₹${(val / 1000).toFixed(0)}K`;
  const formatQty = (val: number) =>
    val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val.toString();

  // -----------------------------------------------------------------
  // UI Values
  // -----------------------------------------------------------------
  const totalItems = totals?.total_items;
  const totalStock = totals?.total_stock;
  const totalSales = totals?.total_sales;
  const total_sale_value = totals?.total_sale_value;
  const total_str_stk_sp_value = totals?.total_str_stk_sp_value;

  const handleViewSummaries = () => navigate("/summaries");

  const departmentHandler = (depLabel: any) => {
    navigate("/dynamictable/1", { state: { department: depLabel } });
  };
  const branchHandler = (code: any) => {
    navigate("/dynamictable/1", { state: { branchCode: code } });
  };

  const validDeptData = useMemo(() => {
    return (deptData || []).map((item: any) => ({
      name: String(item.name || "Unknown"),
      value:
        typeof item.value === "number" && !isNaN(item.value)
          ? Math.max(0, item.value)
          : 0,
      percentage: item.percentage,
    }));
  }, [deptData]);

  const dynamicHeight = Math.max(300, stockBucketData?.length * 30);

  const stockageingHandler = (data: any) => {
    console.log("StockBucket clicked:", data);
    navigate("/summaries", { state: { enable: 1, bucket: data } });
  };
  if (error) {
    return (
      <div className="container p-4">
        <div className="alert alert-danger">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }
  const formatLabel = (v: number) => {
    if (v == null) return "";
    return v >= 100000
      ? `${(v / 100000).toFixed(1)}L`
      : `${(v / 1000).toFixed(0)}K`;
  };
  return (
    <>
      <style>
        {`
        .dashboard-wrapper { min-height: 100vh; display: flex; flex-direction: column; }
        .dashboard-header { position: sticky; top: 0; z-index: 1020; background: white; border-bottom: 1px solid #e2e8f0; padding: 0.5rem 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .dashboard-body { flex: 1; overflow-y: auto; padding: 1rem; }
        .kpi-card { border-radius: 20px !important; border: none !important; box-shadow: 0 6px 16px rgba(0,0,0,0.08); transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275); overflow: hidden; position: relative; }
        .kpi-card:hover { transform: translateY(-8px); box-shadow: 0 12px 28px rgba(0,0,0,0.15) !important; }
        .chart-card { border-radius: 20px !important; border: none !important; box-shadow: 0 6px 16px rgba(0,0,0,0.08); transition: all 0.3s ease; background: white; overflow: hidden; }
        .chart-card:hover { box-shadow: 0 12px 28px rgba(0,0,0,0.12) !important; }
        .card-header { background: white !important; padding: 1.25rem 1.5rem !important; border-bottom: 1px solid #f1f5f9 !important; }
        .card-title { font-weight: 700; color: #1e293b; margin-bottom: 0; font-size: 1.1rem; }
        .badge-custom { border-radius: 50px; padding: 0.4rem 1rem; font-weight: 600; font-size: 0.85rem; }
        .custom-tooltip { background: white; padding: 12px; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); border: 1px solid #e2e8f0; }
        .stat-value { font-size: 1.8rem; font-weight: 800; line-height: 1; }
        .stat-label { font-size: 0.875rem; font-weight: 600; opacity: 0.8; letter-spacing: 0.5px; }
        .icon-wrapper { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.25); }
        .recharts-legend-item-text { font-size: 13px !important; }
      `}
      </style>

      <div className="dashboard-wrapper">
        {loading && <CenteredLoader />}

        {/* Sticky Header */}
        <header className="dashboard-header">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="h2 fw-bold mb-1">Phase-3 Dashboard</h1>
            </div>
            <div className="col-lg-6 text-lg-end">
              <button className="btn btn-primary" onClick={handleViewSummaries}>
                View Detailed Data
              </button>
            </div>
          </div>
          <ShowSavedFilters />
        </header>

        {/* Scrollable Body */}
        <main className="dashboard-body">
          {/* KPI Row */}
          {/* <div className="row g-4 mb-2">
            {[
              { label: 'Total SKU', value: totalItems, icon: 'bi-box-seam', bg1: '#4f46e5' },
              { label: 'Total Stock', value: totalStock, icon: 'bi-archive', bg1: '#10b981' },
              { label: 'Total Sales', value: totalSales, icon: 'bi-cart-check', bg1: '#f59e0b' },
              { label: 'Total Sales Val.', value: total_sale_value, icon: 'bi-currency-rupee', bg1: '#10b981' },
              { label: 'Total SP Val.', value: total_str_stk_sp_value, icon: 'bi-currency-rupee', bg1: '#f97316' },
            ].map((k, i) => {
              const formatNumber = (val: number) => Math.max(0, Math.floor(val)).toLocaleString();
              const formatInLakhs = (val: number) => `₹${Math.floor(val)}`;
              const displayValue = typeof k.value === 'number'
                ? (k.label.includes('Val.') ? formatInLakhs(k.value) : formatNumber(k.value))
                : (k.value != null ? String(k.value) : '0');

              return (
                <div className="col-xl-3 col-lg-3 col-md-6" key={i}>
                  <div className="card kpi-card h-100"
                    style={{
                      background: `linear-gradient(135deg, ${k.bg1}15, ${k.bg1}08)`,
                      border: 'none',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)',
                      transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04)'}
                  >
                    <div className="card-body d-flex align-items-center p-4">
                      <div className="icon-wrapper me-4">
                        <i className={k.icon} style={{ fontSize: '1.8rem', color: k.bg1 }}></i>
                      </div>
                      <div>
                        <div className="stat-label" style={{ color: k.bg1, fontWeight: 600, fontSize: '0.875rem' }}>
                          {k.label}
                        </div>
                        <div className="stat-value" style={{ color: k.bg1, fontWeight: 800, fontSize: '1.5rem' }}>
                          {displayValue}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div> */}
          <div className="mb-1">
            <div
              className="d-flex flex-wrap gap-3"
              style={{ justifyContent: "space-between" }}
            >
              {[
                {
                  label: "Total SKU",
                  value: totalItems,
                  icon: "bi-box-seam",
                  bg1: "#4f46e5",
                },
                {
                  label: "Total Stock",
                  value: totalStock,
                  icon: "bi-archive",
                  bg1: "#8b5cf6",
                },
                {
                  label: "Total Sales",
                  value: totalSales,
                  icon: "bi-cart-check",
                  bg1: "#f59e0b",
                },
                {
                  label: "Total Sales Val.",
                  value: total_sale_value,
                  icon: "bi-wallet2",
                  bg1: "#10b981",
                },
                {
                  label: "Total SP Val.",
                  value: total_str_stk_sp_value,
                  icon: "bi-graph-up",
                  bg1: "#f97316",
                },
              ].map((k, i) => {
                const formatWithCommas = (v: number): string => {
                  if (typeof v !== "number" || isNaN(v)) return "0";
                  return Math.max(0, Math.floor(v)).toLocaleString("en-IN");
                };

                const display =
                  typeof k.value === "number"
                    ? formatWithCommas(k.value)
                    : String(k.value ?? "0");

                return (
                  <div
                    key={i}
                    className="flex-grow-1"
                    style={{
                      minWidth: "220px",
                      maxWidth: "295px",
                      flex: "1 1 auto",
                      display: "flex",
                    }}
                  >
                    <div
                      className="card kpi-card h-100 shadow-sm w-100"
                      style={{
                        background: `linear-gradient(135deg, ${k.bg1}15, ${k.bg1}08)`,
                        borderRadius: "16px",
                        transition: "all 0.25s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 24px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 16px rgba(0,0,0,0.08)";
                      }}
                    >
                      <div className="card-body d-flex align-items-center p-3">
                        <div className="icon-wrapper me-3">
                          <i
                            className={k.icon}
                            style={{ fontSize: "1.6rem", color: k.bg1 }}
                          ></i>
                        </div>
                        <div>
                          <div
                            className="stat-label text-muted"
                            style={{ fontSize: "0.8rem", fontWeight: 600 }}
                          >
                            {k.label}
                          </div>
                          <div
                            className="stat-value"
                            style={{
                              color: k.bg1,
                              fontWeight: 800,
                              fontSize: "1.4rem",
                            }}
                          >
                            {display}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SP Value + Stock Bucket */}
          <div className="row g-4 mb-2">
            <div className="col-lg-6">
              <div className="card chart-card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title">
                    Stock Ageing Bucket Distribution
                  </h5>
                  <span className="badge bg-primary-subtle text-primary badge-custom">
                    {stockBucketData?.length} Categories
                  </span>
                </div>
                <div
                  className="card-body p-3"
                  style={{ height: "auto", minHeight: 400 }}
                >
                  <ResponsiveContainer width="100%" height={dynamicHeight}>
                    <BarChart
                      data={stockBucketData}
                      margin={{ top: 20, right: 30, left: 60, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        angle={-30}
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={formatQty}
                      />
                      <Tooltip content={<CustomTooltip1 />} />
                      <Bar
                        dataKey="value"
                        radius={[6, 6, 0, 0]}
                        fill="#4f46e5"
                        stroke="#3730a3"
                        strokeWidth={1}
                        onClick={(data) => stockageingHandler(data?.name)}
                      >
                        <LabelList
                          dataKey="value"
                          position="top"
                          fill="#4f46e5"
                          fontSize={12}
                          fontWeight={600}
                          offset={10}
                          formatter={formatQty as any}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card chart-card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    SP Value Distribution by Ageing Bucket
                  </h5>
                  <span className="badge bg-success-subtle text-success badge-custom">
                    {processedSspData.length} Buckets
                  </span>
                </div>

                {/* ---- CARD BODY ---- */}
                <div
                  className="card-body p-3 d-flex flex-column"
                  style={{ minHeight: 400 }}
                >
                  <div className="flex-grow-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={processedSspData}
                        margin={{ top: 20, right: 30, left: 60, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />

                        {/* Import (bottom of stack) */}
                        <Bar
                          dataKey="sp_import"
                          stackId="a"
                          fill="#10b981"
                          name="Import SP"
                          // onClick={(data) => stockageingHandler(data?.name)}
                          onClick={(data) => stockageingHandler(data?.name)}
                        />

                        {/* Local (top of stack) - attach LabelList here so label sits above the whole stack */}
                        <Bar
                          dataKey="sp_local"
                          stackId="a"
                          fill="#f59e0b"
                          radius={[4, 4, 0, 0]}
                          name="Local SP"
                          onClick={(data) => stockageingHandler(data?.name)}
                        >
                          <LabelList
                            dataKey="sp_value"
                            position="top"
                            fill="#1e293b"
                            style={{ fontSize: 10, fontWeight: 600 }}
                            formatter={(v: any) => formatLabel(v)}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sales + Dept */}
          <div className="row g-4 mb-2">
            <div className="col-lg-4">
              <div className="card chart-card h-100">
                <div className="card-header d-flex justify-content-between">
                  <h5 className="card-title">
                    Sales Bucket/Quantity Distribution
                  </h5>
                  <span className="badge bg-indigo-subtle text-indigo badge-custom">
                    {salesBucketData?.length} Categories
                  </span>
                </div>
                <div className="card-body p-3">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={salesBucketData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        dataKey="value"
                        nameKey="name"
                        paddingAngle={2}
                        label={({ name, percent }: any) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        stroke="#ffffff"
                        strokeWidth={2}
                        style={{
                          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
                        }}
                      >
                        {salesBucketData?.map((_: any, index: number) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend verticalAlign="bottom" height={40} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card chart-card h-100">
                <div className="card-header">
                  <h5 className="card-title">Items per Department</h5>
                </div>
                <div className="card-body p-3">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={validDeptData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <defs>
                        {validDeptData.map((_: any, idx: any) => {
                          const base = COLORS[idx % COLORS.length];
                          const dark = darkenColor(base, 20);
                          return (
                            <linearGradient
                              key={`grad-${idx}`}
                              id={`grad-${idx}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop offset="0%" stopColor={base} />
                              <stop offset="100%" stopColor={dark} />
                            </linearGradient>
                          );
                        })}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 12 }} domain={[0, "auto"]} />
                      {/* <Tooltip formatter={(v) => [`${v}`, "Items"]} /> */}
                      <Tooltip content={<CustomDeptTooltip />} />
                      <Bar
                        dataKey="value"
                        radius={[6, 6, 0, 0]}
                        onClick={(data: any) => {
                          console.log("Clicked department:", data.name);
                          departmentHandler(data.name);
                        }}
                      >
                        {validDeptData.map((_: any, idx: any) => (
                          <Cell key={idx} fill={`url(#grad-${idx})`} />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="top"
                          fill="#475569"
                          fontSize={12}
                          fontWeight={600}
                          offset={8}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Summaries */}
          <div className="row g-4 mb-2">
            <div className="col-12">
              <div className="card chart-card">
                <div className="card-header d-flex">
                  <div className="nav nav-tabs card-header-tabs" role="tablist">
                    <button
                      className={`nav-link ${
                        activeTab === "department" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("department")}
                      type="button"
                      role="tab"
                    >
                      Department Summaries
                    </button>
                    <button
                      className={`nav-link ${
                        activeTab === "branch" ? "active" : ""
                      }`}
                      onClick={() => setActiveTab("branch")}
                      type="button"
                      role="tab"
                    >
                      Branch Summaries
                    </button>
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="tab-content">
                    {activeTab === "department" && (
                      <DepartmentSummariesDashboard
                        departmentHandler={departmentHandler}
                      />
                    )}
                    {activeTab === "branch" && (
                      <BranchSummariesDashboard branchHandler={branchHandler} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default InventoryDashboard;
