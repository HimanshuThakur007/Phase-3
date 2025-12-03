// import React, { useMemo } from "react";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend,
//   ComposedChart,
//   Line,
// } from "recharts";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";

// type DeptRow = {
//   department?: string;
//   total_site_quantity?: number;
//   total_str_stk_sp_value?: number;
//   current_str_stk_sp_value?: number;
// };

// type BranchRow = {
//   branch_code?: string | number;
//   branch_name?: string;
//   total_site_quantity?: number;
//   total_str_stk_sp_value?: number;
//   current_str_stk_sp_value?: number;
// };

// type ItemRow = {
//   item_code?: string;
//   item_name?: string;
//   total_site_quantity?: number;
//   pending_stock?: number;
//   total_str_stk_sp_value?: number;
//   current_str_stk_sp_value?: number;
//   strSpValue?: number;
//   department?: string;
//   branch_code?: string | number;
//   branch_name?: string;
// };

// type Props = {
//   departmentSummaries?: DeptRow[];
//   branchSummaries?: BranchRow[];
//   itemSummaries?: ItemRow[];
//   topN?: number;
//   className?: string;
// };

// const COLORS: any = {
//   cur: "#2563eb",
//   prev: "#059669",
//   accent: "#f59e0b",
// };

// const formatNumber = (value: number) =>
//   value === null || value === undefined
//     ? "0"
//     : Math.round(value).toLocaleString("en-IN");

// const CustomTooltip = ({ active, payload, label }: any) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div
//       className="bg-white p-3 rounded shadow border"
//       style={{
//         minWidth: 220,
//         fontSize: "13px",
//         boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
//         border: "1px solid #e2e8f0",
//       }}
//     >
//       <div
//         className="fw-bold mb-2"
//         style={{ color: "#1e293b", fontSize: "14px" }}
//       >
//         {label}
//       </div>
//       <div>
//         {payload.map((p: any, i: number) => (
//           <div
//             key={i}
//             className="d-flex justify-content-between align-items-center mb-1"
//           >
//             <span className="text-muted" style={{ fontSize: "12px" }}>
//               {p.name}:
//             </span>
//             <span
//               className="fw-semibold"
//               style={{
//                 color: p.color,
//                 fontSize: "13px",
//                 background: `${p.color}10`,
//                 padding: "2px 6px",
//                 borderRadius: "4px",
//               }}
//             >
//               {formatNumber(p.value)}
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const EmptyState = ({ label }: { label: string }) => (
//   <div
//     className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center"
//     style={{ color: "#64748b" }}
//   >
//     <div
//       className="rounded-circle bg-light d-flex align-items-center justify-content-center mb-3"
//       style={{ width: 56, height: 56, background: "#f8fafc" }}
//     >
//       <i className="bi bi-bar-chart text-secondary fs-3" />
//     </div>
//     <div className="fw-semibold mb-1" style={{ fontSize: "14px" }}>
//       No {label.toLowerCase()} data available
//     </div>
//     <div className="text-muted small">Try adjusting your filters.</div>
//   </div>
// );

// const toNum = (v: any) => {
//   const n = Number(v);
//   return Number.isFinite(n) ? n : 0;
// };

// const MultiTop10Charts: React.FC<Props> = ({
//   departmentSummaries = [],
//   branchSummaries = [],
//   itemSummaries = [],
//   topN = 10,
//   className = "",
// }) => {
//   // ---------- STR STK QTY datasets ----------
//   const deptStrStkTop = useMemo(() => {
//     const curMap = new Map<string, number>();
//     (departmentSummaries || []).forEach((d) => {
//       const dept = (d?.department ?? "Unknown").toString().trim() || "Unknown";
//       curMap.set(dept, (curMap.get(dept) || 0) + toNum(d.total_site_quantity));
//     });
//     const prevMap = new Map<string, number>();
//     (itemSummaries || []).forEach((it) => {
//       const dept = (it?.department ?? "Unknown").toString().trim() || "Unknown";
//       prevMap.set(dept, (prevMap.get(dept) || 0) + toNum(it.pending_stock));
//     });
//     const arr = Array.from(new Set([...curMap.keys(), ...prevMap.keys()])).map(
//       (dept) => ({
//         name: dept,
//         cur: Math.round(curMap.get(dept) || 0),
//         prev: Math.round(prevMap.get(dept) || 0),
//       })
//     );
//     arr.sort((a, b) => b.cur - a.cur);
//     return arr.slice(0, topN);
//   }, [departmentSummaries, itemSummaries, topN]);

//   const branchStrStkTop = useMemo(() => {
//     const branchInfo = new Map<string, { name: string; cur: number }>();
//     (branchSummaries || []).forEach((b) => {
//       const codeKey =
//         b.branch_code != null ? String(b.branch_code).trim() : null;
//       const nameKey = b.branch_name ? String(b.branch_name).trim() : null;
//       const key = codeKey || nameKey || "Unknown";
//       const displayName = nameKey || codeKey || "Unknown";
//       const cur = toNum(b.total_site_quantity);
//       const existing = branchInfo.get(key);
//       if (!existing)
//         branchInfo.set(key, { name: displayName, cur: Math.round(cur) });
//       else
//         branchInfo.set(key, {
//           name: existing.name || displayName,
//           cur: Math.round(existing.cur + cur),
//         });
//     });
//     const prevMap = new Map<string, number>();
//     (itemSummaries || []).forEach((it) => {
//       const codeKey =
//         it.branch_code != null ? String(it.branch_code).trim() : null;
//       const nameKey = it.branch_name ? String(it.branch_name).trim() : null;
//       const key = codeKey || nameKey || "Unknown";
//       prevMap.set(key, (prevMap.get(key) || 0) + toNum(it.pending_stock));
//     });
//     const allKeys = Array.from(
//       new Set([...branchInfo.keys(), ...prevMap.keys()])
//     );
//     const merged = allKeys.map((key) => {
//       const info = branchInfo.get(key);
//       return {
//         name: info?.name || key,
//         cur: Math.round(info?.cur || 0),
//         prev: Math.round(prevMap.get(key) || 0),
//       };
//     });
//     merged.sort((a, b) => b.cur - a.cur);
//     return merged.slice(0, topN);
//   }, [branchSummaries, itemSummaries, topN]);

//   const itemStrStkTop = useMemo(() => {
//     const map = new Map<string, { name: string; cur: number; prev: number }>();
//     (itemSummaries || []).forEach((r: any) => {
//       const code = String(r.item_code || "").trim();
//       if (!code) return;
//       const nameRaw = r.item_name || code;
//       const name =
//         String(nameRaw).length > 24
//           ? String(nameRaw).slice(0, 22) + "…"
//           : String(nameRaw);
//       const cur = toNum(r.total_site_quantity);
//       const prev = toNum(r.pending_stock);
//       const existing = map.get(code);
//       if (!existing)
//         map.set(code, {
//           name,
//           cur: Math.round(cur),
//           prev: Math.round(prev),
//         });
//       else {
//         existing.cur += Math.round(cur);
//         existing.prev += Math.round(prev);
//       }
//     });
//     const arr = Array.from(map.values())
//       .sort((a, b) => b.cur - a.cur)
//       .slice(0, topN);
//     return arr;
//   }, [itemSummaries, topN]);

//   // ---------- VALUE datasets ----------
//   const deptValTop = useMemo(() => {
//     const curMap = new Map<string, number>();
//     const prevMap = new Map<string, number>();
//     (departmentSummaries || []).forEach((d) => {
//       const dept = (d?.department ?? "Unknown").toString().trim() || "Unknown";
//       const curV = toNum(
//         (d as any).current_str_stk_sp_value ||
//           (d as any).total_str_stk_sp_value ||
//           0
//       );
//       const prevV = toNum(
//         (d as any).total_str_stk_sp_value || (d as any).strSpValue || 0
//       );
//       curMap.set(dept, (curMap.get(dept) || 0) + curV);
//       prevMap.set(dept, (prevMap.get(dept) || 0) + prevV);
//     });
//     (itemSummaries || []).forEach((it) => {
//       const dept = (it?.department ?? "Unknown").toString().trim() || "Unknown";
//       const cur = toNum(it.current_str_stk_sp_value);
//       const prev = toNum(it.total_str_stk_sp_value || it.strSpValue);
//       curMap.set(dept, (curMap.get(dept) || 0) + cur);
//       prevMap.set(dept, (prevMap.get(dept) || 0) + prev);
//     });
//     const all = Array.from(new Set([...curMap.keys(), ...prevMap.keys()]));
//     const arr = all.map((dept) => ({
//       name: dept,
//       curVal: Math.round(curMap.get(dept) || 0),
//       prevVal: Math.round(prevMap.get(dept) || 0),
//     }));
//     arr.sort((a, b) => b.curVal - a.curVal);
//     return arr.slice(0, topN);
//   }, [departmentSummaries, itemSummaries, topN]);

//   const branchValTop = useMemo(() => {
//     const branchMap = new Map<
//       string,
//       { name: string; cur: number; prev: number }
//     >();

//     const getBranchDisplayName = (b: any): string => {
//       if (b.branch_name) return String(b.branch_name).trim();
//       if (b.branch_code) return String(b.branch_code).trim();
//       return "Unknown";
//     };

//     const getBranchKey = (b: any): string => {
//       return b.branch_code != null
//         ? String(b.branch_code).trim()
//         : b.branch_name
//         ? String(b.branch_name).trim()
//         : "Unknown";
//     };

//     (branchSummaries || []).forEach((b: any) => {
//       const key = getBranchKey(b);
//       const displayName = getBranchDisplayName(b);
//       const cur = toNum(
//         (b as any).current_str_stk_sp_value ||
//           (b as any).total_str_stk_sp_value ||
//           0
//       );
//       const prev = toNum(
//         (b as any).total_str_stk_sp_value || (b as any).strSpValue || 0
//       );
//       const existing = branchMap.get(key) || {
//         name: displayName,
//         cur: 0,
//         prev: 0,
//       };
//       branchMap.set(key, {
//         name: displayName,
//         cur: existing.cur + cur,
//         prev: existing.prev + prev,
//       });
//     });

//     (itemSummaries || []).forEach((it: any) => {
//       const key = getBranchKey(it);
//       const displayName = getBranchDisplayName(it);
//       const cur = toNum(it.current_str_stk_sp_value ?? 0);
//       const prev = toNum(it.total_str_stk_sp_value ?? it.strSpValue ?? 0);
//       const existing = branchMap.get(key) || {
//         name: displayName,
//         cur: 0,
//         prev: 0,
//       };
//       branchMap.set(key, {
//         name: displayName,
//         cur: existing.cur + cur,
//         prev: existing.prev + prev,
//       });
//     });

//     const result = Array.from(branchMap.values())
//       .map(({ name, cur, prev }) => ({
//         name,
//         curVal: Math.round(cur),
//         prevVal: Math.round(prev),
//       }))
//       .sort((a, b) => b.curVal - a.curVal)
//       .slice(0, topN);

//     return result;
//   }, [branchSummaries, itemSummaries, topN]);

//   const itemValTop = useMemo(() => {
//     const map = new Map<
//       string,
//       { name: string; curVal: number; prevVal: number }
//     >();
//     (itemSummaries || []).forEach((r: any) => {
//       const code = String(r.item_code || "").trim();
//       if (!code) return;
//       const nameRaw = r.item_name || code;
//       const name =
//         String(nameRaw).length > 24
//           ? String(nameRaw).slice(0, 22) + "…"
//           : String(nameRaw);
//       const cur = toNum(r.current_str_stk_sp_value);
//       const prev = toNum(r.total_str_stk_sp_value || r.strSpValue);
//       if (!map.has(code))
//         map.set(code, {
//           name,
//           curVal: Math.round(cur),
//           prevVal: Math.round(prev),
//         });
//       else {
//         const ex = map.get(code)!;
//         ex.curVal += Math.round(cur);
//         ex.prevVal += Math.round(prev);
//       }
//     });
//     const arr = Array.from(map.values())
//       .sort((a, b) => b.curVal - a.curVal)
//       .slice(0, topN);
//     return arr;
//   }, [itemSummaries, topN]);

//   // ====== 3D BAR CUSTOMIZER ======
//   const render3DBar: any = (props: any) => {
//     const { fill, x, y, width, height } = props;
//     if (height <= 0) return null;
//     return (
//       <g>
//         {/* Front face */}
//         <rect
//           x={x}
//           y={y}
//           width={width}
//           height={height}
//           fill={fill}
//           rx={4}
//           style={{
//             filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))",
//             transform: "translateZ(10px)",
//           }}
//         />
//         {/* Top face (3D effect) */}
//         <polygon
//           points={`${x},${y} ${x + width},${y} ${x + width - 6},${y - 6} ${
//             x - 6
//           },${y - 6}`}
//           fill="rgba(255,255,255,0.3)"
//         />
//         {/* Side face (3D effect) */}
//         <polygon
//           points={`${x + width},${y} ${x + width},${y + height} ${
//             x + width - 6
//           },${y + height - 6} ${x + width - 6},${y - 6}`}
//           fill="rgba(0,0,0,0.1)"
//         />
//       </g>
//     );
//   };

//   return (
//     <div
//       className={`multi-top10-charts ${className}`}
//       style={{ padding: "10px" }}
//     >
//       {/* Department Row */}
//       <div className="row g-4 mb-2">
//         <div className="col-12 col-xl-6">
//           <div
//             className="card"
//             style={{
//               borderRadius: "16px",
//               boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
//               border: "1px solid #f1f5f9",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               className="card-header py-3"
//               style={{
//                 backgroundColor: "#f8fafc",
//                 borderBottom: "1px solid #e2e8f0",
//               }}
//             >
//               <h6
//                 className="mb-0"
//                 style={{ fontWeight: 600, color: "#1e293b" }}
//               >
//                 {/* Departments — Str Stk Qty (Cur vs Prev) */}
//                 Departments — Str Stk Qty (Top {topN})
//               </h6>
//             </div>
//             <div className="card-body p-3" style={{ height: 360 }}>
//               {deptStrStkTop.length === 0 ? (
//                 <EmptyState label="Departments (Str Stk Qty)" />
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={deptStrStkTop}
//                     margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
//                     barCategoryGap="12%"
//                     barGap={4}
//                   >
//                     <CartesianGrid
//                       strokeDasharray="4 4"
//                       stroke="#f1f5f9"
//                       vertical={false}
//                     />
//                     <XAxis
//                       dataKey="name"
//                       angle={-45}
//                       textAnchor="end"
//                       height={90}
//                       tick={{ fontSize: 12, fill: "#475569" }}
//                       interval={0}
//                     />
//                     <YAxis
//                       tick={{ fontSize: 12, fill: "#64748b" }}
//                       tickFormatter={(v) => formatNumber(Number(v))}
//                       domain={[0, "auto"]}
//                     />
//                     <Tooltip
//                       content={<CustomTooltip />}
//                       cursor={{ fill: "#f1f5f9" }}
//                     />
//                     <Legend verticalAlign="top" height={36} />
//                     <Bar
//                       dataKey="prev"
//                       name="Prev Str Stk Qty"
//                       fill={COLORS.prev}
//                       shape={render3DBar}
//                     />
//                     <Bar
//                       dataKey="cur"
//                       name="Cur Str Stk Qty"
//                       fill={COLORS.cur}
//                       shape={render3DBar}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="col-12 col-xl-6">
//           <div
//             className="card"
//             style={{
//               borderRadius: "16px",
//               boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
//               border: "1px solid #f1f5f9",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               className="card-header py-3"
//               style={{
//                 backgroundColor: "#f8fafc",
//                 borderBottom: "1px solid #e2e8f0",
//               }}
//             >
//               <h6
//                 className="mb-0"
//                 style={{ fontWeight: 600, color: "#1e293b" }}
//               >
//                 Departments — Stk Val (Top {topN})
//               </h6>
//             </div>
//             <div className="card-body p-3" style={{ height: 360 }}>
//               {deptValTop.length === 0 ? (
//                 <EmptyState label="Departments (Values)" />
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={deptValTop}
//                     margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
//                     barCategoryGap="12%"
//                     barGap={4}
//                   >
//                     <CartesianGrid
//                       strokeDasharray="4 4"
//                       stroke="#f1f5f9"
//                       vertical={false}
//                     />
//                     <XAxis
//                       dataKey="name"
//                       angle={-45}
//                       textAnchor="end"
//                       height={90}
//                       tick={{ fontSize: 12, fill: "#475569" }}
//                       interval={0}
//                     />
//                     <YAxis
//                       tick={{ fontSize: 12, fill: "#64748b" }}
//                       tickFormatter={(v) => formatNumber(Number(v))}
//                       domain={[0, "auto"]}
//                     />
//                     <Tooltip
//                       content={<CustomTooltip />}
//                       cursor={{ fill: "#f1f5f9" }}
//                     />
//                     <Legend verticalAlign="top" height={36} />
//                     <Bar
//                       dataKey="prevVal"
//                       name="Prev Stk Val"
//                       fill={COLORS.prev}
//                       shape={render3DBar}
//                     />
//                     <Bar
//                       dataKey="curVal"
//                       name="Cur Stk Val"
//                       fill={COLORS.cur}
//                       shape={render3DBar}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Branch Row */}
//       {/* <div className="row g-4 mb-4">
//         <div className="col-12 col-xl-6">
//           <div
//             className="card"
//             style={{
//               borderRadius: "16px",
//               boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
//               border: "1px solid #f1f5f9",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               className="card-header py-3"
//               style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
//             >
//               <h6 className="mb-0" style={{ fontWeight: 600, color: "#1e293b" }}>
//                 Branches — Str Stk Qty (Cur vs Prev)
//               </h6>
//             </div>
//             <div className="card-body p-3" style={{ height: 360 }}>
//               {branchStrStkTop.length === 0 ? (
//                 <EmptyState label="Branches (Str Stk Qty)" />
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={branchStrStkTop}
//                     layout="vertical"
//                     margin={{ top: 20, right: 30, left: 160, bottom: 20 }}
//                     barSize={24}
//                     barCategoryGap="15%"
//                   >
//                     <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" horizontal={false} />
//                     <XAxis
//                       type="number"
//                       tick={{ fontSize: 12, fill: "#64748b" }}
//                       tickFormatter={(v) => formatNumber(Number(v))}
//                       domain={[0, "auto"]}
//                     />
//                     <YAxis
//                       dataKey="name"
//                       type="category"
//                       width={160}
//                       tick={{ fontSize: 12, fill: "#475569" }}
//                       tickMargin={8}
//                     />
//                     <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
//                     <Legend verticalAlign="top" height={36} />
//                     <Bar
//                       dataKey="cur"
//                       name="Cur Str Stk Qty"
//                       fill={COLORS.cur}
//                       shape={render3DBar}
//                     />
//                     <Bar
//                       dataKey="prev"
//                       name="Prev Str Stk Qty"
//                       fill={COLORS.prev}
//                       shape={render3DBar}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="col-12 col-xl-6">
//           <div
//             className="card"
//             style={{
//               borderRadius: "16px",
//               boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
//               border: "1px solid #f1f5f9",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               className="card-header py-3"
//               style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}
//             >
//               <h6 className="mb-0" style={{ fontWeight: 600, color: "#1e293b" }}>
//                 Branches — Stk Val (Cur vs Prev)
//               </h6>
//             </div>
//             <div className="card-body p-3" style={{ height: 360 }}>
//               {branchValTop.length === 0 ? (
//                 <EmptyState label="Branches (Values)" />
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={branchValTop}
//                     layout="vertical"
//                     margin={{ top: 20, right: 30, left: 160, bottom: 20 }}
//                     barSize={24}
//                     barCategoryGap="15%"
//                   >
//                     <CartesianGrid strokeDasharray="4 4" stroke="#f1f5f9" horizontal={false} />
//                     <XAxis
//                       type="number"
//                       tick={{ fontSize: 12, fill: "#64748b" }}
//                       tickFormatter={(v) => formatNumber(Number(v))}
//                       domain={[0, "auto"]}
//                     />
//                     <YAxis
//                       dataKey="name"
//                       type="category"
//                       width={160}
//                       tick={{ fontSize: 12, fill: "#475569" }}
//                       tickMargin={8}
//                     />
//                     <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
//                     <Legend verticalAlign="top" height={36} />
//                     <Bar
//                       dataKey="curVal"
//                       name="Cur Stk Val"
//                       fill={COLORS.cur}
//                       shape={render3DBar}
//                     />
//                     <Bar
//                       dataKey="prevVal"
//                       name="Prev Stk Val"
//                       fill={COLORS.prev}
//                       shape={render3DBar}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>
//         </div>
//       </div> */}
//       {/* Branch Row — Vertical Bar Charts (like Departments) */}
//       <div className="row g-4 mb-2">
//         <div className="col-12 col-xl-6">
//           <div
//             className="card"
//             style={{
//               borderRadius: "16px",
//               boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
//               border: "1px solid #f1f5f9",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               className="card-header py-3"
//               style={{
//                 backgroundColor: "#f8fafc",
//                 borderBottom: "1px solid #e2e8f0",
//               }}
//             >
//               <h6
//                 className="mb-0"
//                 style={{ fontWeight: 600, color: "#1e293b" }}
//               >
//                 Branches — Str Stk Qty (Top {topN})
//               </h6>
//             </div>
//             <div className="card-body p-3" style={{ height: 360 }}>
//               {branchStrStkTop.length === 0 ? (
//                 <EmptyState label="Branches (Str Stk Qty)" />
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={branchStrStkTop}
//                     margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
//                     barCategoryGap="12%"
//                     barGap={4}
//                   >
//                     <CartesianGrid
//                       strokeDasharray="4 4"
//                       stroke="#f1f5f9"
//                       vertical={false}
//                     />
//                     <XAxis
//                       dataKey="name"
//                       angle={-45}
//                       textAnchor="end"
//                       height={90}
//                       tick={{ fontSize: 12, fill: "#475569" }}
//                       interval={0}
//                     />
//                     <YAxis
//                       tick={{ fontSize: 12, fill: "#64748b" }}
//                       tickFormatter={(v) => formatNumber(Number(v))}
//                       domain={[0, "auto"]}
//                     />
//                     <Tooltip
//                       content={<CustomTooltip />}
//                       cursor={{ fill: "#f1f5f9" }}
//                     />
//                     <Legend verticalAlign="top" height={36} />
//                     <Bar
//                       dataKey="prev"
//                       name="Prev Str Stk Qty"
//                       fill={COLORS.prev}
//                       shape={render3DBar}
//                     />
//                     <Bar
//                       dataKey="cur"
//                       name="Cur Str Stk Qty"
//                       fill={COLORS.cur}
//                       shape={render3DBar}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="col-12 col-xl-6">
//           <div
//             className="card"
//             style={{
//               borderRadius: "16px",
//               boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
//               border: "1px solid #f1f5f9",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               className="card-header py-3"
//               style={{
//                 backgroundColor: "#f8fafc",
//                 borderBottom: "1px solid #e2e8f0",
//               }}
//             >
//               <h6
//                 className="mb-0"
//                 style={{ fontWeight: 600, color: "#1e293b" }}
//               >
//                 Branches — Stk Val (Top {topN})
//               </h6>
//             </div>
//             <div className="card-body p-3" style={{ height: 360 }}>
//               {branchValTop.length === 0 ? (
//                 <EmptyState label="Branches (Values)" />
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={branchValTop}
//                     margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
//                     barCategoryGap="12%"
//                     barGap={4}
//                   >
//                     <CartesianGrid
//                       strokeDasharray="4 4"
//                       stroke="#f1f5f9"
//                       vertical={false}
//                     />
//                     <XAxis
//                       dataKey="name"
//                       angle={-45}
//                       textAnchor="end"
//                       height={90}
//                       tick={{ fontSize: 12, fill: "#475569" }}
//                       interval={0}
//                     />
//                     <YAxis
//                       tick={{ fontSize: 12, fill: "#64748b" }}
//                       tickFormatter={(v) => formatNumber(Number(v))}
//                       domain={[0, "auto"]}
//                     />
//                     <Tooltip
//                       content={<CustomTooltip />}
//                       cursor={{ fill: "#f1f5f9" }}
//                     />
//                     <Legend verticalAlign="top" height={36} />
//                     <Bar
//                       dataKey="prevVal"
//                       name="Prev Stk Val"
//                       fill={COLORS.prev}
//                       shape={render3DBar}
//                     />
//                     <Bar
//                       dataKey="curVal"
//                       name="Cur Stk Val"
//                       fill={COLORS.cur}
//                       shape={render3DBar}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* Item Row */}
//       <div className="row g-4">
//         <div className="col-12 col-xl-6">
//           <div
//             className="card"
//             style={{
//               borderRadius: "16px",
//               boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
//               border: "1px solid #f1f5f9",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               className="card-header py-3"
//               style={{
//                 backgroundColor: "#f8fafc",
//                 borderBottom: "1px solid #e2e8f0",
//               }}
//             >
//               <h6
//                 className="mb-0"
//                 style={{ fontWeight: 600, color: "#1e293b" }}
//               >
//                 Items — Str Stk Qty (Top {topN})
//               </h6>
//             </div>
//             <div className="card-body p-3" style={{ height: 380 }}>
//               {itemStrStkTop.length === 0 ? (
//                 <EmptyState label="Items (Str Stk Qty)" />
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <ComposedChart
//                     data={itemStrStkTop}
//                     margin={{ top: 20, right: 20, left: 20, bottom: 90 }}
//                     barCategoryGap="12%"
//                   >
//                     <CartesianGrid
//                       strokeDasharray="4 4"
//                       stroke="#f1f5f9"
//                       vertical={false}
//                     />
//                     <XAxis
//                       dataKey="name"
//                       angle={-45}
//                       textAnchor="end"
//                       height={100}
//                       tick={{ fontSize: 11, fill: "#475569" }}
//                       interval={0}
//                     />
//                     <YAxis
//                       tick={{ fontSize: 12, fill: "#64748b" }}
//                       tickFormatter={(v) => formatNumber(Number(v))}
//                       domain={[0, "auto"]}
//                     />
//                     <Tooltip
//                       content={<CustomTooltip />}
//                       cursor={{ fill: "#f1f5f9" }}
//                     />
//                     <Legend verticalAlign="top" height={36} />
//                     <Bar
//                       dataKey="cur"
//                       name="Cur Str Stk Qty"
//                       fill={COLORS.cur}
//                       barSize={22}
//                       shape={render3DBar}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="prev"
//                       name="Prev Str Stk Qty"
//                       stroke={COLORS.prev}
//                       strokeWidth={2.5}
//                       dot={{
//                         r: 4,
//                         fill: COLORS.prev,
//                         stroke: "white",
//                         strokeWidth: 2,
//                       }}
//                       activeDot={{ r: 6, stroke: COLORS.prev, strokeWidth: 2 }}
//                     />
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="col-12 col-xl-6">
//           <div
//             className="card"
//             style={{
//               borderRadius: "16px",
//               boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
//               border: "1px solid #f1f5f9",
//               overflow: "hidden",
//             }}
//           >
//             <div
//               className="card-header py-3"
//               style={{
//                 backgroundColor: "#f8fafc",
//                 borderBottom: "1px solid #e2e8f0",
//               }}
//             >
//               <h6
//                 className="mb-0"
//                 style={{ fontWeight: 600, color: "#1e293b" }}
//               >
//                 Items — Stk Val (Top {topN})
//               </h6>
//             </div>
//             <div className="card-body p-3" style={{ height: 380 }}>
//               {itemValTop.length === 0 ? (
//                 <EmptyState label="Items (Values)" />
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <ComposedChart
//                     data={itemValTop}
//                     margin={{ top: 20, right: 20, left: 20, bottom: 90 }}
//                     barCategoryGap="12%"
//                   >
//                     <CartesianGrid
//                       strokeDasharray="4 4"
//                       stroke="#f1f5f9"
//                       vertical={false}
//                     />
//                     <XAxis
//                       dataKey="name"
//                       angle={-45}
//                       textAnchor="end"
//                       height={100}
//                       tick={{ fontSize: 11, fill: "#475569" }}
//                       interval={0}
//                     />
//                     <YAxis
//                       tick={{ fontSize: 12, fill: "#64748b" }}
//                       tickFormatter={(v) => formatNumber(Number(v))}
//                       domain={[0, "auto"]}
//                     />
//                     <Tooltip
//                       content={<CustomTooltip />}
//                       cursor={{ fill: "#f1f5f9" }}
//                     />
//                     <Legend verticalAlign="top" height={36} />
//                     <Bar
//                       dataKey="curVal"
//                       name="Cur Stk Val"
//                       fill={COLORS.cur}
//                       barSize={22}
//                       shape={render3DBar}
//                     />
//                     <Line
//                       type="monotone"
//                       dataKey="prevVal"
//                       name="Prev Stk Val"
//                       stroke={COLORS.prev}
//                       strokeWidth={2.5}
//                       dot={{
//                         r: 4,
//                         fill: COLORS.prev,
//                         stroke: "white",
//                         strokeWidth: 2,
//                       }}
//                       activeDot={{ r: 6, stroke: COLORS.prev, strokeWidth: 2 }}
//                     />
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MultiTop10Charts;

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ComposedChart,
  Line,
} from "recharts";
import { useSelector } from "react-redux";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

type DeptRow = {
  department?: string;
  total_site_quantity?: number;
  total_str_stk_sp_value?: number;
  current_str_stk_sp_value?: number;
};

type BranchRow = {
  branch_code?: string | number;
  branch_name?: string;
  total_site_quantity?: number;
  total_str_stk_sp_value?: number;
  current_str_stk_sp_value?: number;
};

type ItemRow = {
  item_code?: string;
  item_name?: string;
  total_site_quantity?: number;
  pending_stock?: number;
  total_str_stk_sp_value?: number;
  current_str_stk_sp_value?: number;
  strSpValue?: number;
  department?: string;
  branch_code?: string | number;
  branch_name?: string;
};

type Props = {
  departmentSummaries?: DeptRow[];
  branchSummaries?: BranchRow[];
  itemSummaries?: ItemRow[];
  topN?: number;
  className?: string;
};

const COLORS: any = {
  cur: "#2563eb",
  prev: "#059669",
  accent: "#f59e0b",
};

const formatNumber = (value: number) =>
  value === null || value === undefined
    ? "0"
    : Math.round(value).toLocaleString("en-IN");

const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useSelector((state: any) => state.root.theme);
  const isDark = theme === "dark_mode";

  const bgColor = isDark ? "#1e293b" : "#ffffff";
  const borderColor = isDark ? "#334155" : "#e2e8f0";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";

  if (!active || !payload?.length) return null;
  return (
    <div
      className="p-3 rounded shadow border"
      style={{
        minWidth: 220,
        fontSize: "13px",
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
      }}
    >
      <div
        className="fw-bold mb-2"
        style={{ fontSize: "14px", color: textColor }}
      >
        {label}
      </div>
      <div>
        {payload.map((p: any, i: number) => (
          <div
            key={i}
            className="d-flex justify-content-between align-items-center mb-1"
          >
            <span style={{ fontSize: "12px", color: mutedColor }}>
              {p.name}:
            </span>
            <span
              className="fw-semibold"
              style={{
                color: p.color,
                fontSize: "13px",
                background: `${p.color}10`,
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              {formatNumber(p.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyState = ({ label }: { label: string }) => {
  const theme = useSelector((state: any) => state.root.theme);
  const isDark = theme === "dark_mode";

  const iconBg = isDark ? "#334155" : "#f8fafc";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-center"
      style={{ color: textColor }}
    >
      <div
        className="rounded-circle d-flex align-items-center justify-content-center mb-3"
        style={{ width: 56, height: 56, background: iconBg }}
      >
        <i className="bi bi-bar-chart text-secondary fs-3" />
      </div>
      <div
        className="fw-semibold mb-1"
        style={{ fontSize: "14px", color: textColor }}
      >
        No {label.toLowerCase()} data available
      </div>
      <div className="small" style={{ color: textColor }}>
        Try adjusting your filters.
      </div>
    </div>
  );
};

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const MultiTop10Charts: React.FC<Props> = ({
  departmentSummaries = [],
  branchSummaries = [],
  itemSummaries = [],
  topN = 10,
  className = "",
}) => {
  const theme = useSelector((state: any) => state.root.theme);
  const isDark = theme === "dark_mode";

  const bgColor = isDark ? "#0f172a" : "#f8fafc";
  const cardBg = isDark ? "#1e293b" : "#ffffff";
  const textColor = isDark ? "#f1f5f9" : "#1e293b";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#334155" : "#e2e8f0";
  const gridColor = isDark ? "#334155" : "#f1f5f9";
  const cardHeaderBg = isDark ? "#1e293b" : "#f8fafc";

  // ---------- STR STK QTY datasets ----------
  const deptStrStkTop = useMemo(() => {
    const curMap = new Map<string, number>();
    (departmentSummaries || []).forEach((d) => {
      const dept = (d?.department ?? "Unknown").toString().trim() || "Unknown";
      curMap.set(dept, (curMap.get(dept) || 0) + toNum(d.total_site_quantity));
    });
    const prevMap = new Map<string, number>();
    (itemSummaries || []).forEach((it) => {
      const dept = (it?.department ?? "Unknown").toString().trim() || "Unknown";
      prevMap.set(dept, (prevMap.get(dept) || 0) + toNum(it.pending_stock));
    });
    const arr = Array.from(new Set([...curMap.keys(), ...prevMap.keys()])).map(
      (dept) => ({
        name: dept,
        cur: Math.round(curMap.get(dept) || 0),
        prev: Math.round(prevMap.get(dept) || 0),
      })
    );
    arr.sort((a, b) => b.cur - a.cur);
    return arr.slice(0, topN);
  }, [departmentSummaries, itemSummaries, topN]);

  const branchStrStkTop = useMemo(() => {
    const branchInfo = new Map<string, { name: string; cur: number }>();
    (branchSummaries || []).forEach((b) => {
      const codeKey =
        b.branch_code != null ? String(b.branch_code).trim() : null;
      const nameKey = b.branch_name ? String(b.branch_name).trim() : null;
      const key = codeKey || nameKey || "Unknown";
      const displayName = nameKey || codeKey || "Unknown";
      const cur = toNum(b.total_site_quantity);
      const existing = branchInfo.get(key);
      if (!existing)
        branchInfo.set(key, { name: displayName, cur: Math.round(cur) });
      else
        branchInfo.set(key, {
          name: existing.name || displayName,
          cur: Math.round(existing.cur + cur),
        });
    });
    const prevMap = new Map<string, number>();
    (itemSummaries || []).forEach((it) => {
      const codeKey =
        it.branch_code != null ? String(it.branch_code).trim() : null;
      const nameKey = it.branch_name ? String(it.branch_name).trim() : null;
      const key = codeKey || nameKey || "Unknown";
      prevMap.set(key, (prevMap.get(key) || 0) + toNum(it.pending_stock));
    });
    const allKeys = Array.from(
      new Set([...branchInfo.keys(), ...prevMap.keys()])
    );
    const merged = allKeys.map((key) => {
      const info = branchInfo.get(key);
      return {
        name: info?.name || key,
        cur: Math.round(info?.cur || 0),
        prev: Math.round(prevMap.get(key) || 0),
      };
    });
    merged.sort((a, b) => b.cur - a.cur);
    return merged.slice(0, topN);
  }, [branchSummaries, itemSummaries, topN]);

  const itemStrStkTop = useMemo(() => {
    const map = new Map<string, { name: string; cur: number; prev: number }>();
    (itemSummaries || []).forEach((r: any) => {
      const code = String(r.item_code || "").trim();
      if (!code) return;
      const nameRaw = r.item_name || code;
      const name =
        String(nameRaw).length > 24
          ? String(nameRaw).slice(0, 22) + "…"
          : String(nameRaw);
      const cur = toNum(r.total_site_quantity);
      const prev = toNum(r.pending_stock);
      const existing = map.get(code);
      if (!existing)
        map.set(code, {
          name,
          cur: Math.round(cur),
          prev: Math.round(prev),
        });
      else {
        existing.cur += Math.round(cur);
        existing.prev += Math.round(prev);
      }
    });
    const arr = Array.from(map.values())
      .sort((a, b) => b.cur - a.cur)
      .slice(0, topN);
    return arr;
  }, [itemSummaries, topN]);

  // ---------- VALUE datasets ----------
  const deptValTop = useMemo(() => {
    const curMap = new Map<string, number>();
    const prevMap = new Map<string, number>();
    (departmentSummaries || []).forEach((d) => {
      const dept = (d?.department ?? "Unknown").toString().trim() || "Unknown";
      const curV = toNum(
        (d as any).current_str_stk_sp_value ||
          (d as any).total_str_stk_sp_value ||
          0
      );
      const prevV = toNum(
        (d as any).total_str_stk_sp_value || (d as any).strSpValue || 0
      );
      curMap.set(dept, (curMap.get(dept) || 0) + curV);
      prevMap.set(dept, (prevMap.get(dept) || 0) + prevV);
    });
    (itemSummaries || []).forEach((it) => {
      const dept = (it?.department ?? "Unknown").toString().trim() || "Unknown";
      const cur = toNum(it.current_str_stk_sp_value);
      const prev = toNum(it.total_str_stk_sp_value || it.strSpValue);
      curMap.set(dept, (curMap.get(dept) || 0) + cur);
      prevMap.set(dept, (prevMap.get(dept) || 0) + prev);
    });
    const all = Array.from(new Set([...curMap.keys(), ...prevMap.keys()]));
    const arr = all.map((dept) => ({
      name: dept,
      curVal: Math.round(curMap.get(dept) || 0),
      prevVal: Math.round(prevMap.get(dept) || 0),
    }));
    arr.sort((a, b) => b.curVal - a.curVal);
    return arr.slice(0, topN);
  }, [departmentSummaries, itemSummaries, topN]);

  const branchValTop = useMemo(() => {
    const branchMap = new Map<
      string,
      { name: string; cur: number; prev: number }
    >();

    const getBranchDisplayName = (b: any): string => {
      if (b.branch_name) return String(b.branch_name).trim();
      if (b.branch_code) return String(b.branch_code).trim();
      return "Unknown";
    };

    const getBranchKey = (b: any): string => {
      return b.branch_code != null
        ? String(b.branch_code).trim()
        : b.branch_name
        ? String(b.branch_name).trim()
        : "Unknown";
    };

    (branchSummaries || []).forEach((b: any) => {
      const key = getBranchKey(b);
      const displayName = getBranchDisplayName(b);
      const cur = toNum(
        (b as any).current_str_stk_sp_value ||
          (b as any).total_str_stk_sp_value ||
          0
      );
      const prev = toNum(
        (b as any).total_str_stk_sp_value || (b as any).strSpValue || 0
      );
      const existing = branchMap.get(key) || {
        name: displayName,
        cur: 0,
        prev: 0,
      };
      branchMap.set(key, {
        name: displayName,
        cur: existing.cur + cur,
        prev: existing.prev + prev,
      });
    });

    (itemSummaries || []).forEach((it: any) => {
      const key = getBranchKey(it);
      const displayName = getBranchDisplayName(it);
      const cur = toNum(it.current_str_stk_sp_value ?? 0);
      const prev = toNum(it.total_str_stk_sp_value ?? it.strSpValue ?? 0);
      const existing = branchMap.get(key) || {
        name: displayName,
        cur: 0,
        prev: 0,
      };
      branchMap.set(key, {
        name: displayName,
        cur: existing.cur + cur,
        prev: existing.prev + prev,
      });
    });

    const result = Array.from(branchMap.values())
      .map(({ name, cur, prev }) => ({
        name,
        curVal: Math.round(cur),
        prevVal: Math.round(prev),
      }))
      .sort((a, b) => b.curVal - a.curVal)
      .slice(0, topN);

    return result;
  }, [branchSummaries, itemSummaries, topN]);

  const itemValTop = useMemo(() => {
    const map = new Map<
      string,
      { name: string; curVal: number; prevVal: number }
    >();
    (itemSummaries || []).forEach((r: any) => {
      const code = String(r.item_code || "").trim();
      if (!code) return;
      const nameRaw = r.item_name || code;
      const name =
        String(nameRaw).length > 24
          ? String(nameRaw).slice(0, 22) + "…"
          : String(nameRaw);
      const cur = toNum(r.current_str_stk_sp_value);
      const prev = toNum(r.total_str_stk_sp_value || r.strSpValue);
      if (!map.has(code))
        map.set(code, {
          name,
          curVal: Math.round(cur),
          prevVal: Math.round(prev),
        });
      else {
        const ex = map.get(code)!;
        ex.curVal += Math.round(cur);
        ex.prevVal += Math.round(prev);
      }
    });
    const arr = Array.from(map.values())
      .sort((a, b) => b.curVal - a.curVal)
      .slice(0, topN);
    return arr;
  }, [itemSummaries, topN]);

  const render3DBar: any = (props: any) => {
    const { fill, x, y, width, height } = props;
    if (height <= 0) return null;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          rx={4}
          style={{
            filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))",
          }}
        />
        <polygon
          points={`${x},${y} ${x + width},${y} ${x + width - 6},${y - 6} ${
            x - 6
          },${y - 6}`}
          fill="rgba(255,255,255,0.2)"
        />
        <polygon
          points={`${x + width},${y} ${x + width},${y + height} ${
            x + width - 6
          },${y + height - 6} ${x + width - 6},${y - 6}`}
          fill="rgba(0,0,0,0.12)"
        />
      </g>
    );
  };

  return (
    <>
      <style>{`
        .multi-top10-charts {
          min-height: 100%;
          background: ${bgColor};
          color: ${textColor};
        }
        .recharts-text {
          fill: ${textColor} !important;
        }
        .recharts-cartesian-axis-tick-value {
          fill: ${mutedColor} !important;
        }
        .recharts-legend-item-text {
          fill: ${mutedColor} !important;
        }
      `}</style>

      <div
        className={`multi-top10-charts ${className}`}
        style={{ padding: "10px" }}
      >
        {/* Department Row */}
        <div className="row g-4 mb-2">
          <div className="col-12 col-xl-6">
            <div
              className="card"
              style={{
                borderRadius: "16px",
                boxShadow: `0 8px 24px rgba(0,0,0,${isDark ? "0.3" : "0.08"})`,
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                overflow: "hidden",
              }}
            >
              <div
                className="card-header py-3"
                style={{
                  backgroundColor: cardHeaderBg,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <h6
                  className="mb-0"
                  style={{ fontWeight: 600, color: textColor }}
                >
                  Departments — Str Stk Qty (Top {topN})
                </h6>
              </div>
              <div className="card-body p-3" style={{ height: 360 }}>
                {deptStrStkTop.length === 0 ? (
                  <EmptyState label="Departments (Str Stk Qty)" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deptStrStkTop}
                      margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
                      barCategoryGap="12%"
                      barGap={4}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={gridColor}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={90}
                        tick={{ fontSize: 12, fill: mutedColor }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: mutedColor }}
                        tickFormatter={(v) => formatNumber(Number(v))}
                        domain={[0, "auto"]}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: borderColor }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="prev"
                        name="Prev Str Stk Qty"
                        fill={COLORS.prev}
                        shape={render3DBar}
                      />
                      <Bar
                        dataKey="cur"
                        name="Cur Str Stk Qty"
                        fill={COLORS.cur}
                        shape={render3DBar}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-6">
            <div
              className="card"
              style={{
                borderRadius: "16px",
                boxShadow: `0 8px 24px rgba(0,0,0,${isDark ? "0.3" : "0.08"})`,
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                overflow: "hidden",
              }}
            >
              <div
                className="card-header py-3"
                style={{
                  backgroundColor: cardHeaderBg,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <h6
                  className="mb-0"
                  style={{ fontWeight: 600, color: textColor }}
                >
                  Departments — Stk Val (Top {topN})
                </h6>
              </div>
              <div className="card-body p-3" style={{ height: 360 }}>
                {deptValTop.length === 0 ? (
                  <EmptyState label="Departments (Values)" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={deptValTop}
                      margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
                      barCategoryGap="12%"
                      barGap={4}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={gridColor}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={90}
                        tick={{ fontSize: 12, fill: mutedColor }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: mutedColor }}
                        tickFormatter={(v) => formatNumber(Number(v))}
                        domain={[0, "auto"]}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: borderColor }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="prevVal"
                        name="Prev Stk Val"
                        fill={COLORS.prev}
                        shape={render3DBar}
                      />
                      <Bar
                        dataKey="curVal"
                        name="Cur Stk Val"
                        fill={COLORS.cur}
                        shape={render3DBar}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Branch Row */}
        <div className="row g-4 mb-2">
          <div className="col-12 col-xl-6">
            <div
              className="card"
              style={{
                borderRadius: "16px",
                boxShadow: `0 8px 24px rgba(0,0,0,${isDark ? "0.3" : "0.08"})`,
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                overflow: "hidden",
              }}
            >
              <div
                className="card-header py-3"
                style={{
                  backgroundColor: cardHeaderBg,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <h6
                  className="mb-0"
                  style={{ fontWeight: 600, color: textColor }}
                >
                  Branches — Str Stk Qty (Top {topN})
                </h6>
              </div>
              <div className="card-body p-3" style={{ height: 360 }}>
                {branchStrStkTop.length === 0 ? (
                  <EmptyState label="Branches (Str Stk Qty)" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={branchStrStkTop}
                      margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
                      barCategoryGap="12%"
                      barGap={4}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={gridColor}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={90}
                        tick={{ fontSize: 12, fill: mutedColor }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: mutedColor }}
                        tickFormatter={(v) => formatNumber(Number(v))}
                        domain={[0, "auto"]}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: borderColor }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="prev"
                        name="Prev Str Stk Qty"
                        fill={COLORS.prev}
                        shape={render3DBar}
                      />
                      <Bar
                        dataKey="cur"
                        name="Cur Str Stk Qty"
                        fill={COLORS.cur}
                        shape={render3DBar}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-6">
            <div
              className="card"
              style={{
                borderRadius: "16px",
                boxShadow: `0 8px 24px rgba(0,0,0,${isDark ? "0.3" : "0.08"})`,
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                overflow: "hidden",
              }}
            >
              <div
                className="card-header py-3"
                style={{
                  backgroundColor: cardHeaderBg,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <h6
                  className="mb-0"
                  style={{ fontWeight: 600, color: textColor }}
                >
                  Branches — Stk Val (Top {topN})
                </h6>
              </div>
              <div className="card-body p-3" style={{ height: 360 }}>
                {branchValTop.length === 0 ? (
                  <EmptyState label="Branches (Values)" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={branchValTop}
                      margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
                      barCategoryGap="12%"
                      barGap={4}
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={gridColor}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={90}
                        tick={{ fontSize: 12, fill: mutedColor }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: mutedColor }}
                        tickFormatter={(v) => formatNumber(Number(v))}
                        domain={[0, "auto"]}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: borderColor }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="prevVal"
                        name="Prev Stk Val"
                        fill={COLORS.prev}
                        shape={render3DBar}
                      />
                      <Bar
                        dataKey="curVal"
                        name="Cur Stk Val"
                        fill={COLORS.cur}
                        shape={render3DBar}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Item Row */}
        <div className="row g-4">
          <div className="col-12 col-xl-6">
            <div
              className="card"
              style={{
                borderRadius: "16px",
                boxShadow: `0 8px 24px rgba(0,0,0,${isDark ? "0.3" : "0.08"})`,
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                overflow: "hidden",
              }}
            >
              <div
                className="card-header py-3"
                style={{
                  backgroundColor: cardHeaderBg,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <h6
                  className="mb-0"
                  style={{ fontWeight: 600, color: textColor }}
                >
                  Items — Str Stk Qty (Top {topN})
                </h6>
              </div>
              <div className="card-body p-3" style={{ height: 380 }}>
                {itemStrStkTop.length === 0 ? (
                  <EmptyState label="Items (Str Stk Qty)" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={itemStrStkTop}
                      margin={{ top: 20, right: 20, left: 20, bottom: 90 }}
                      barCategoryGap="12%"
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={gridColor}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 11, fill: mutedColor }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: mutedColor }}
                        tickFormatter={(v) => formatNumber(Number(v))}
                        domain={[0, "auto"]}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: borderColor }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="cur"
                        name="Cur Str Stk Qty"
                        fill={COLORS.cur}
                        barSize={22}
                        shape={render3DBar}
                      />
                      <Line
                        type="monotone"
                        dataKey="prev"
                        name="Prev Str Stk Qty"
                        stroke={COLORS.prev}
                        strokeWidth={2.5}
                        dot={{
                          r: 4,
                          fill: COLORS.prev,
                          stroke: "white",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          stroke: COLORS.prev,
                          strokeWidth: 2,
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-6">
            <div
              className="card"
              style={{
                borderRadius: "16px",
                boxShadow: `0 8px 24px rgba(0,0,0,${isDark ? "0.3" : "0.08"})`,
                border: `1px solid ${borderColor}`,
                background: cardBg,
                color: textColor,
                overflow: "hidden",
              }}
            >
              <div
                className="card-header py-3"
                style={{
                  backgroundColor: cardHeaderBg,
                  borderBottom: `1px solid ${borderColor}`,
                }}
              >
                <h6
                  className="mb-0"
                  style={{ fontWeight: 600, color: textColor }}
                >
                  Items — Stk Val (Top {topN})
                </h6>
              </div>
              <div className="card-body p-3" style={{ height: 380 }}>
                {itemValTop.length === 0 ? (
                  <EmptyState label="Items (Values)" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={itemValTop}
                      margin={{ top: 20, right: 20, left: 20, bottom: 90 }}
                      barCategoryGap="12%"
                    >
                      <CartesianGrid
                        strokeDasharray="4 4"
                        stroke={gridColor}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fontSize: 11, fill: mutedColor }}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: mutedColor }}
                        tickFormatter={(v) => formatNumber(Number(v))}
                        domain={[0, "auto"]}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: borderColor }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="curVal"
                        name="Cur Stk Val"
                        fill={COLORS.cur}
                        barSize={22}
                        shape={render3DBar}
                      />
                      <Line
                        type="monotone"
                        dataKey="prevVal"
                        name="Prev Stk Val"
                        stroke={COLORS.prev}
                        strokeWidth={2.5}
                        dot={{
                          r: 4,
                          fill: COLORS.prev,
                          stroke: "white",
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          stroke: COLORS.prev,
                          strokeWidth: 2,
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MultiTop10Charts;
