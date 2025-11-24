// BranchSummariesDashboard.tsx
import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// const COLORS = [
//     '#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899',
//     '#6366f1', '#14b8a6', '#f43f5e', '#a855f7', '#0ea5e9', '#84cc16'
// ];

// Helper: Clamp negative values to 0
const zeroIfNegative = (value: number) => Math.max(0, value || 0);

const BranchSummariesDashboard = ({ branchHandler }: any) => {
  const summaries = useSelector((state: any) => state.phase3.summaries) || [];

  // === Compute Aggregated Totals (with negative clamping) ===
  const totals = useMemo(() => {
    return summaries.reduce(
      (acc: any, b: any) => {
        acc.totalSaleQty += zeroIfNegative(b.total_sale_quantity);
        acc.totalSaleValue += zeroIfNegative(b.total_sale_value);
        acc.totalStock += zeroIfNegative(b.total_stock);
        acc.totalTransit += zeroIfNegative(b.total_transit_quantity);
        acc.totalMargin += zeroIfNegative(b.total_ttl_mrgn_value);
        acc.totalPendingDO += zeroIfNegative(b.pending_do_quantity);
        acc.totalSiteQty += zeroIfNegative(b.total_site_quantity);
        acc.total_str_stk_sp_value += zeroIfNegative(b.total_str_stk_sp_value);
        return acc;
      },
      {
        totalSaleQty: 0,
        totalSaleValue: 0,
        totalStock: 0,
        totalTransit: 0,
        totalMargin: 0,
        totalPendingDO: 0,
        totalSiteQty: 0,
        total_str_stk_sp_value: 0,
      }
    );
  }, [summaries]);

  // === Top 10 Branches by Sales Value (show 0 if negative) ===
  const topSalesBranches = useMemo(() => {
    return [...summaries]
      .sort((a, b) => b.total_sale_value - a.total_sale_value)
      .slice(0, 10)
      .map((b) => ({
        name: b.branch_name,
        code: b.branch_code,
        sales: zeroIfNegative(b.total_sale_value),
      }));
  }, [summaries]);

  // === Top 10 by Stock (show 0 if negative) ===
  const topStockBranches = useMemo(() => {
    return [...summaries]
      .sort((a, b) => b.total_stock - a.total_stock)
      .slice(0, 10)
      .map((b) => ({
        name: b.branch_name,
        code: b.branch_code,
        stock: zeroIfNegative(b.total_stock),
      }));
  }, [summaries]);

  // === Margin Distribution (Top 8) - Only positive margins ===
  // const marginData = useMemo(() => {
  //     return [...summaries]
  //         .map(b => ({
  //             ...b,
  //             total_ttl_mrgn_value: zeroIfNegative(b.total_ttl_mrgn_value)
  //         }))
  //         .sort((a, b) => b.total_ttl_mrgn_value - a.total_ttl_mrgn_value)
  //         .filter(b => b.total_ttl_mrgn_value > 0) // Exclude zero/negative
  //         .slice(0, 8)
  //         .map((b, i) => ({
  //             name: b.branch_name,
  //             margin: b.total_ttl_mrgn_value,
  //             fill: COLORS[i % COLORS.length]
  //         }));
  // }, [summaries]);

  // === KPI Cards Data (all values clamped to 0) ===
  const kpiCards = [
    {
      label: "Total Branches",
      value: summaries.length,
      icon: "bi-shop",
      color: "#4f46e5",
    },
    {
      label: "Total Sales (Qty)",
      value: zeroIfNegative(totals.totalSaleQty).toLocaleString("en-IN"),
      icon: "bi-cart",
      color: "#10b981",
    },
    {
      label: "Total Sales (₹)",
      value: `₹${(zeroIfNegative(totals.totalSaleValue) / 1e5).toFixed(2)}L`,
      icon: "bi-currency-rupee",
      color: "#f59e0b",
    },
    {
      label: "Total Stock",
      value: zeroIfNegative(totals.totalStock).toLocaleString("en-IN"),
      icon: "bi-boxes",
      color: "#06b6d4",
    },
    {
      label: "Total Sp Value",
      value: `${(zeroIfNegative(totals.total_str_stk_sp_value) / 1e5).toFixed(
        2
      )}L`,
      icon: "bi-graph-up",
      color: "#8b5cf6",
    },
    // {
    //     label: 'Total Margin (₹)',
    //     value: `₹${(zeroIfNegative(totals.totalMargin) / 1e5).toFixed(2)}L`,
    //     icon: 'bi-graph-up',
    //     color: '#8b5cf6'
    // },
    {
      label: "In Transit",
      value: zeroIfNegative(totals.totalTransit).toLocaleString("en-IN"),
      icon: "bi-truck",
      color: "#ec4899",
    },
  ];

  if (!summaries || summaries.length === 0) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          No branch summary data available.
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
                .dashboard-wrapper { min-height: 100vh; background: #f8fafc; }
                .dashboard-header { background: white; padding: 1.5rem 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 2rem; }
                .kpi-card { border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); transition: transform 0.2s; border: none; }
                .kpi-card:hover { transform: translateY(-3px); }
                .chart-card { border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: none; background: white; }
                .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
                .stat-label { font-size: 0.875rem; color: #64748b; }
                .icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            `}</style>

      <div className="dashboard-wrapper">
        <div className="container-fluid px-4 pb-3">
          <p className="text-muted mb-0">
            Summary across {summaries.length} branches
          </p>

          {/* KPI Cards */}
          <div className="row g-4 mb-2">
            {kpiCards.map((k, i) => (
              <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6" key={i}>
                <div className="card kpi-card">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="icon-wrapper me-3"
                      style={{
                        backgroundColor: `${k.color}15`,
                        color: k.color,
                      }}
                    >
                      <i className={`${k.icon} fs-4`}></i>
                    </div>
                    <div>
                      <div className="stat-label">{k.label}</div>
                      <div className="stat-value">{k.value}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div className="row g-4 mb-2">
            {/* Top Stock */}
            <div className="col-lg-6">
              <div className="card chart-card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Top 10 Branches by Stock</h5>
                </div>
                <div className="card-body p-3" style={{ height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topStockBranches}
                      margin={{ top: 20, right: 30, left: 30, bottom: 80 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(name) =>
                          name.length > 15 ? name.slice(0, 13) + "..." : name
                        }
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => `${(v / 1e3).toFixed(1)}K`}
                      />
                      <Tooltip
                        formatter={(v) => [
                          `${Number(v).toLocaleString("en-IN")}`,
                          "Stock Qty",
                        ]}
                      />
                      <Bar
                        dataKey="stock"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                        onClick={(data: any) => {
                          console.log("branch clicked data", data);
                          branchHandler(data.code);
                        }}
                      >
                        <LabelList
                          dataKey="stock"
                          position="top"
                          formatter={(v: any) =>
                            v > 0 ? `${(v / 1e3).toFixed(1)}K` : "0"
                          }
                          fill="#64748b"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Sales */}
            <div className="col-lg-6">
              <div className="card chart-card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    Top 10 Branches by Sales (₹)
                  </h5>
                </div>
                <div className="card-body p-3" style={{ height: 450 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topSalesBranches}
                      margin={{ top: 20, right: 30, left: 30, bottom: 80 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(name) =>
                          name.length > 15 ? name.slice(0, 13) + "..." : name
                        }
                      />

                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => `₹${(v / 1e5).toFixed(1)}L`}
                      />
                      <Tooltip
                        formatter={(v) => [
                          `₹${Number(v).toLocaleString("en-IN")}`,
                          "Sales",
                        ]}
                      />
                      <Bar
                        dataKey="sales"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        onClick={(data: any) => {
                          console.log("branch clicked data", data);
                          branchHandler(data.code);
                        }}
                      >
                        <LabelList
                          dataKey="sales"
                          position="top"
                          formatter={(v: any) =>
                            v > 0 ? `₹${(v / 1e5).toFixed(1)}L` : "₹0L"
                          }
                          fill="#64748b"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Margin Pie Chart */}
          {/* <div className="row g-4 mb-4">
                        <div className="col-lg-12">
                            <div className="card chart-card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Margin Contribution (Top 8 Branches)</h5>
                                </div>
                                <div className="card-body p-3" style={{ height: 400 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={marginData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={120}
                                                dataKey="margin"
                                                nameKey="name"
                                                label={({ name, percent }: any) => percent > 0.03 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''}
                                                labelLine={false}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            >
                                                {marginData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString()}`, 'Margin']} />
                                            <Legend
                                                layout="horizontal"
                                                verticalAlign="bottom"
                                                align="center"
                                                formatter={(value) => (
                                                    <span style={{ fontSize: '12px', color: '#475569' }}>
                                                        {value.length > 25 ? value.slice(0, 22) + '...' : value}
                                                    </span>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div> */}
        </div>
      </div>
    </>
  );
};

export default BranchSummariesDashboard;
