import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Wrapper from '../../common/uicomponent/wrapper';
import GridTable from '../../common/component/GridTable';
import { useForm } from 'react-hook-form';
import p3Filter from '../../core/json/phsae3Filter';
import { renderField } from '../../common/utils/renderField';
import axios from "axios";

// -------------------- Helpers --------------------
const toTitleCase = (str: string) => {
    return str
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const formatNumber = (v: number | string | null | undefined) => {
    if (v === null || v === undefined) return '-';
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return n >= 1_000_000 ? (n / 1_000_000).toFixed(2) + 'M'
        : n >= 1_000 ? (n / 1_000).toFixed(1) + 'k'
            : n.toString();
};

const formatCurrency = (v: number | string | null | undefined) => {
    if (v === null || v === undefined) return '-';
    const n = Number(v) || 0;
    return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// Simple sparkline (polyline)
const Sparkline = ({ values = [0, 0, 0, 0], width = 100, height = 30 }: { values?: number[], width?: number, height?: number }) => {
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const len = values.length || 1;
    const points = values.map((v, i) => {
        const x = (i / (len - 1 || 1)) * (width - 4) + 2;
        const y = height - 2 - ((v - min) / (max - min || 1)) * (height - 4);
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <polyline points={points} fill="none" stroke="#1f77b4" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    );
};

// -------------------- Component --------------------
const Phase3Page: React.FC = () => {
    const [tableHeight, setTableHeight] = useState<string>("550px");
    const navigate = useNavigate();
    const form = useForm<any>({
        mode: 'onBlur',
        defaultValues: {
            stockBucket: null,
            saleBucket: null,
            transitQty: null,
            localHbtClass: null,
            globalHbtClass: null,
        },
    });

    const [summaries, setSummaries] = useState<any[]>([]);
    const [departmentSummaries, setDepartmentSummaries] = useState<any[]>([]);
    const [summaryDate, setSummaryDate] = useState<string | null>(null);
    const [loadingSummaries, setLoadingSummaries] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'branch' | 'department'>('branch');

    const selectOptions = useMemo<Record<string, any[]>>(
        () => ({
            stockBucket: [],
            saleBucket: [],
            transitQty: [],
            localHbtClass: [],
            globalHbtClass: [],
        }),
        []
    );

    // fetch data
    useEffect(() => {
        const fetchHbtSummary = async () => {
            setLoadingSummaries(true);
            setSummaryError(null);
            try {
                const currentDate = ""; // pass today or empty as required

                const [branchRes, deptRes] = await Promise.all([
                    axios.post("http://127.0.0.1:5000/api/hbt-summary", { current_date: currentDate }, { headers: { "Content-Type": "application/json" } }),
                    axios.post("http://127.0.0.1:5000/api/hbt-summary-department", { current_date: currentDate }, { headers: { "Content-Type": "application/json" } }),
                ]);

                if (branchRes?.data?.status === 'ok') {
                    setSummaries(branchRes.data.summaries || []);
                    setSummaryDate(branchRes.data.summary_date || null);
                } else {
                    setSummaries([]);
                }

                const deptData = deptRes?.data;
                if (deptData) {
                    if (Array.isArray(deptData)) {
                        setDepartmentSummaries(deptData);
                    } else if (Array.isArray(deptData.departments)) {
                        setDepartmentSummaries(deptData.departments);
                    } else if (Array.isArray(deptData.department_summaries)) {
                        setDepartmentSummaries(deptData.department_summaries);
                    } else if (deptData.status === 'ok' && Array.isArray(deptData.summaries)) {
                        setDepartmentSummaries(deptData.summaries);
                    } else {
                        setDepartmentSummaries([]);
                    }
                }
            } catch (error: any) {
                console.error("❌ Error fetching HBT summary:", error);
                setSummaryError(error?.message || 'Failed to fetch summaries');
                setSummaries([]);
                setDepartmentSummaries([]);
            } finally {
                setLoadingSummaries(false);
            }
        };

        fetchHbtSummary();
    }, []);

    // Column definitions
    const columnDefs = useMemo(() => {
        if (summaries.length === 0) return [];
        const firstRow: any = summaries[0];
        return [
            {
                field: 'actions',
                headerName: 'Actions',
                headerClass: 'bg-royal-blue text-white',
                cellRenderer: (params: any) => (
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate('/graphicalRepresentation', { state: { selectedRow: params.data } })}
                    >
                        <i className="bi bi-eye"></i> View
                    </button>
                ),
                width: 120,
                sortable: false,
                filter: false,
            },
            ...Object.keys(firstRow).map(key => ({
                field: key,
                headerName: toTitleCase(key),
                filter: typeof firstRow[key] === 'string' ? 'agTextColumnFilter' : 'agNumberColumnFilter',
                headerClass: 'bg-royal-blue text-white',
                sortable: true,
                resizable: true,
            })),

        ];
    }, [summaries, navigate]);

    // Responsive table height
    useEffect(() => {
        const calculateTableHeight = () => {
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const headerHeight = 100;
            const footerHeight = 40;
            const bottomSpace = 50;
            const minHeight = 400;
            const tabletMinWidth = 768;
            const tabletMaxWidth = 1024;
            let calculatedHeight: number;

            if (windowWidth >= 1200) {
                calculatedHeight =
                    windowHeight - headerHeight - footerHeight - bottomSpace;
            } else if (
                windowWidth >= tabletMinWidth &&
                windowWidth <= tabletMaxWidth
            ) {
                const tabletAdjustment = windowWidth < 900 ? 150 : 100;
                calculatedHeight =
                    windowHeight - headerHeight - footerHeight - tabletAdjustment;
            } else {
                calculatedHeight = windowHeight - headerHeight - footerHeight - 100;
            }

            setTableHeight(`${Math.max(calculatedHeight, minHeight)}px`);
        };

        calculateTableHeight();
        window.addEventListener("resize", calculateTableHeight);
        window.addEventListener("orientationchange", calculateTableHeight);
        return () => {
            window.removeEventListener("resize", calculateTableHeight);
            window.removeEventListener("orientationchange", calculateTableHeight);
        };
    }, []);

    const renderFieldWrapper = (field: any, key: string) =>
        renderField({
            field,
            form,
            options: field.props?.name ? selectOptions[field.props.name as keyof typeof selectOptions] || [] : [],
            key,
        });

    // aggregate KPIs (branch-level)
    const aggregate = useMemo(() => {
        if (!summaries || summaries.length === 0) return null;
        return summaries.reduce((acc, s) => {
            acc.total_records += Number(s.total_records || 0);
            acc.total_sale_value += Number(s.total_sale_value || 0);
            acc.total_stock += Number(s.total_stock || 0);
            acc.total_ttl_mrgn_value += Number(s.total_ttl_mrgn_value || 0);
            acc.pending_do_quantity += Number(s.pending_do_quantity || 0);
            return acc;
        }, {
            total_records: 0, total_sale_value: 0, total_stock: 0, total_ttl_mrgn_value: 0, pending_do_quantity: 0
        } as any);
    }, [summaries]);

    // aggregate KPIs (department-level)
    const deptAggregate = useMemo(() => {
        if (!departmentSummaries || departmentSummaries.length === 0) return null;
        return departmentSummaries.reduce((acc, s) => {
            acc.total_records += Number(s.total_records || 0);
            acc.total_sale_value += Number(s.total_sale_value || 0);
            acc.total_stock += Number(s.total_stock || s.total_site_quantity || 0);
            acc.total_ttl_mrgn_value += Number(s.total_ttl_mrgn_value || 0);
            acc.pending_do_quantity += Number(s.pending_do_quantity || 0);
            return acc;
        }, {
            total_records: 0, total_sale_value: 0, total_stock: 0, total_ttl_mrgn_value: 0, pending_do_quantity: 0
        } as any);
    }, [departmentSummaries]);

    // -------------------- Auto-scroll refs for branch & department --------------------
    const rafRefBranch = useRef<number | null>(null);
    const rafRefDept = useRef<number | null>(null);

    const isPausedBranch = useRef(false);
    const isPausedDept = useRef(false);

    const directionBranch = useRef(1);
    const directionDept = useRef(1);

    const wheelTimerBranch = useRef<number | null>(null);
    const wheelTimerDept = useRef<number | null>(null);

    const startAutoScrollFor = React.useCallback((containerId: string, options: {
        rafRef: React.MutableRefObject<number | null>,
        isPausedRef: React.MutableRefObject<boolean>,
        directionRef: React.MutableRefObject<number>,
        wheelTimerRef: React.MutableRefObject<number | null>,
        speed?: number
    }) => {
        const { rafRef, isPausedRef, directionRef, wheelTimerRef, speed = 0.45 } = options;
        const container = document.getElementById(containerId);
        if (!container) return () => { };

        // ensure previous RAF stopped for this container
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        isPausedRef.current = false;
        directionRef.current = 1;
        if (wheelTimerRef.current) {
            window.clearTimeout(wheelTimerRef.current);
            wheelTimerRef.current = null;
        }

        const step = () => {
            const c = document.getElementById(containerId);
            if (!c) return; // container removed
            if (!isPausedRef.current && c.scrollWidth > c.clientWidth) {
                c.scrollLeft += speed * directionRef.current;
                if (c.scrollLeft + c.clientWidth >= c.scrollWidth - 1) directionRef.current = -1;
                else if (c.scrollLeft <= 0) directionRef.current = 1;
            }
            rafRef.current = requestAnimationFrame(step);
        };

        rafRef.current = requestAnimationFrame(step);

        const onEnter = () => { isPausedRef.current = true; };
        const onLeave = () => { isPausedRef.current = false; };
        const onPointerDown = () => { isPausedRef.current = true; };
        const onPointerUp = () => { isPausedRef.current = false; };
        const onWheel = () => {
            isPausedRef.current = true;
            if (wheelTimerRef.current) window.clearTimeout(wheelTimerRef.current);
            wheelTimerRef.current = window.setTimeout(() => { isPausedRef.current = false; }, 1000) as any;
        };
        const onTouchStart = () => { isPausedRef.current = true; };
        const onTouchEnd = () => { isPausedRef.current = false; };

        container.addEventListener('mouseenter', onEnter);
        container.addEventListener('mouseleave', onLeave);
        container.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointerup', onPointerUp);
        container.addEventListener('wheel', onWheel as any, { passive: true });
        container.addEventListener('touchstart', onTouchStart as any, { passive: true });
        container.addEventListener('touchend', onTouchEnd as any);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            container.removeEventListener('mouseenter', onEnter);
            container.removeEventListener('mouseleave', onLeave);
            container.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            container.removeEventListener('wheel', onWheel as any);
            container.removeEventListener('touchstart', onTouchStart as any);
            container.removeEventListener('touchend', onTouchEnd as any);
            if (wheelTimerRef.current) {
                window.clearTimeout(wheelTimerRef.current);
                wheelTimerRef.current = null;
            }
            isPausedRef.current = false;
            directionRef.current = 1;
        };
    }, []);

    // Branch scroll effect
    useEffect(() => {
        if (activeTab === 'branch' && summaries.length > 0) {
            const stop = startAutoScrollFor('summary-scroll-container', {
                rafRef: rafRefBranch,
                isPausedRef: isPausedBranch,
                directionRef: directionBranch,
                wheelTimerRef: wheelTimerBranch,
                speed: 0.5
            });
            return stop;
        } else {
            // ensure branch RAF stopped when leaving
            if (rafRefBranch.current) {
                cancelAnimationFrame(rafRefBranch.current);
                rafRefBranch.current = null;
            }
        }
    }, [activeTab, summaries, startAutoScrollFor]);

    // Department scroll effect
    useEffect(() => {
        if (activeTab === 'department' && departmentSummaries.length > 0) {
            const stop = startAutoScrollFor('department-scroll-container', {
                rafRef: rafRefDept,
                isPausedRef: isPausedDept,
                directionRef: directionDept,
                wheelTimerRef: wheelTimerDept,
                speed: 0.45
            });
            return stop;
        } else {
            // ensure dept RAF stopped when leaving
            if (rafRefDept.current) {
                cancelAnimationFrame(rafRefDept.current);
                rafRefDept.current = null;
            }
        }
    }, [activeTab, departmentSummaries, startAutoScrollFor]);

    // -------------------- Render --------------------
    return (
        <Wrapper header="Phase 3 Dashboard" subHeader="Report" ExportR={1}>
            <div className="">
                {/* Filters */}
                <div className="row g-3 mb-3">
                    {Object.entries(p3Filter.properties).map(([key, field]) => (
                        <div key={key} className="col-lg-2 col-md-4 col-sm-6">
                            {renderFieldWrapper(field, key)}
                        </div>
                    ))}
                    <div className="col-lg-2 col-md-4 col-sm-6 d-flex align-items-center">
                        <button type="submit" className="btn btn-primary mt-lg-4">
                            Show Report
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'branch' ? 'active' : ''}`}
                            onClick={() => setActiveTab('branch')}
                        >
                            Branch-wise KPI
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'department' ? 'active' : ''}`}
                            onClick={() => setActiveTab('department')}
                        >
                            Department-wise KPI
                        </button>
                    </li>
                </ul>

                {/* Branch tab */}
                {activeTab === 'branch' && (
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <h5 className="mb-0">HBT Summary {summaryDate ? ` — ${summaryDate}` : ''}</h5>
                                <small className="text-muted">Branch-level KPIs</small>
                            </div>
                            <div>
                                {loadingSummaries ? (
                                    <span className="badge bg-info">Loading...</span>
                                ) : summaryError ? (
                                    <span className="badge bg-danger">Error</span>
                                ) : (
                                    // <- badge with branch count (preserved)
                                    <span className="badge bg-success">{summaries.length} branches</span>
                                )}
                            </div>
                        </div>

                        {aggregate && (
                            <div className="d-flex gap-3 flex-wrap mb-3">
                                <div className="card p-2" style={{ minWidth: 180 }}>
                                    <div className="small text-muted">Total Records</div>
                                    <div className="h5 mb-0">{formatNumber(aggregate.total_records)}</div>
                                </div>
                                <div className="card p-2" style={{ minWidth: 220 }}>
                                    <div className="small text-muted">Total Sale Value</div>
                                    <div className="h5 mb-0">₹ {formatCurrency(aggregate.total_sale_value)}</div>
                                </div>
                                <div className="card p-2" style={{ minWidth: 180 }}>
                                    <div className="small text-muted">Total Stock Qty</div>
                                    <div className="h5 mb-0">{formatNumber(aggregate.total_stock)}</div>
                                </div>
                                <div className="card p-2" style={{ minWidth: 220 }}>
                                    <div className="small text-muted">Total Margin Value</div>
                                    <div className="h5 mb-0">₹ {formatCurrency(aggregate.total_ttl_mrgn_value)}</div>
                                </div>
                                <div className="card p-2" style={{ minWidth: 180 }}>
                                    <div className="small text-muted">Pending DO</div>
                                    <div className="h5 mb-0">{formatNumber(aggregate.pending_do_quantity)}</div>
                                </div>
                            </div>
                        )}

                        <div
                            id="summary-scroll-container"
                            style={{ overflowX: 'auto', paddingBottom: 6, scrollBehavior: 'smooth' }}
                        >
                            <div style={{ display: 'flex', gap: 12, minWidth: 'fit-content' }}>
                                {summaries.length === 0 && !loadingSummaries && (
                                    <div className="text-muted">No branch summaries to display.</div>
                                )}
                                {summaries.map((s: any) => {
                                    const smallValues = [
                                        Number(s.total_stock || 0),
                                        Number(s.total_sale_value || 0),
                                        Number(s.total_records || 0),
                                        Number(s.total_ttl_mrgn_value || 0)
                                    ];
                                    return (
                                        <div key={s.branch_code || Math.random()} className="card shadow-sm" style={{ minWidth: 260 }}>
                                            <div className="card-body p-2">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div className="fw-semibold">{s.branch_name || s.branch_code}</div>
                                                        <div className="small text-muted">Code: {s.branch_code}</div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="small text-muted">Records</div>
                                                        <div className="h6 mb-0">{formatNumber(s.total_records)}</div>
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-2 mt-2">
                                                    <div style={{ flex: 1 }}>
                                                        <div className="small text-muted">Stock</div>
                                                        <div className="fw-bold">{formatNumber(s.total_stock)}</div>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div className="small text-muted">Sale Value</div>
                                                        <div className="fw-bold">₹ {formatCurrency(s.total_sale_value)}</div>
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-2 mt-2 align-items-center">
                                                    <div style={{ flex: 1 }}>
                                                        <div className="small text-muted">Transit</div>
                                                        <div className="fw-bold">{formatNumber(s.total_transit_quantity)}</div>
                                                    </div>
                                                    <div style={{ width: 120 }}>
                                                        <Sparkline values={smallValues} width={120} height={36} />
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-between mt-2">
                                                    <small className="text-muted">Pending DO</small>
                                                    <small className="fw-semibold">{formatNumber(s.pending_do_quantity)}</small>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Department tab */}
                {activeTab === 'department' && (
                    <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <h5 className="mb-0">Department Summary</h5>
                                <small className="text-muted">Department-wise KPIs (branch-agnostic)</small>
                            </div>
                            <div>
                                {loadingSummaries ? (
                                    <span className="badge bg-info">Loading...</span>
                                ) : summaryError ? (
                                    <span className="badge bg-danger">Error</span>
                                ) : (
                                    // <- badge with department count (restored)
                                    <span className="badge bg-secondary">{departmentSummaries.length} departments</span>
                                )}
                            </div>
                        </div>

                        {deptAggregate && (
                            <div className="d-flex gap-3 flex-wrap mb-3">
                                <div className="card p-2" style={{ minWidth: 160 }}>
                                    <div className="small text-muted">Dept Records</div>
                                    <div className="h6 mb-0">{formatNumber(deptAggregate.total_records)}</div>
                                </div>
                                <div className="card p-2" style={{ minWidth: 200 }}>
                                    <div className="small text-muted">Dept Sale Value</div>
                                    <div className="h6 mb-0">₹ {formatCurrency(deptAggregate.total_sale_value)}</div>
                                </div>
                                <div className="card p-2" style={{ minWidth: 160 }}>
                                    <div className="small text-muted">Dept Stock Qty</div>
                                    <div className="h6 mb-0">{formatNumber(deptAggregate.total_stock)}</div>
                                </div>
                                <div className="card p-2" style={{ minWidth: 200 }}>
                                    <div className="small text-muted">Dept Margin Value</div>
                                    <div className="h6 mb-0">₹ {formatCurrency(deptAggregate.total_ttl_mrgn_value)}</div>
                                </div>
                                <div className="card p-2" style={{ minWidth: 160 }}>
                                    <div className="small text-muted">Dept Pending DO</div>
                                    <div className="h6 mb-0">{formatNumber(deptAggregate.pending_do_quantity)}</div>
                                </div>
                            </div>
                        )}

                        <div id="department-scroll-container" style={{ overflowX: 'auto', paddingBottom: 6, scrollBehavior: 'smooth' }}>
                            <div style={{ display: 'flex', gap: 12, minWidth: 'fit-content' }}>
                                {departmentSummaries.length === 0 && !loadingSummaries && (
                                    <div className="text-muted">No department summaries to display.</div>
                                )}
                                {departmentSummaries.map((d: any) => {
                                    const smallValues = [
                                        Number(d.total_stock || d.total_site_quantity || 0),
                                        Number(d.total_sale_value || 0),
                                        Number(d.total_records || 0),
                                        Number(d.total_ttl_mrgn_value || 0)
                                    ];
                                    return (
                                        <div key={d.department || Math.random()} className="card shadow-sm" style={{ minWidth: 260 }}>
                                            <div className="card-body p-2">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <div className="fw-semibold">{d.department}</div>
                                                        <div className="small text-muted">Records: {formatNumber(d.total_records)}</div>
                                                    </div>
                                                    <div className="text-end">
                                                        <div className="small text-muted">Stock</div>
                                                        <div className="h6 mb-0">{formatNumber(d.total_stock || d.total_site_quantity)}</div>
                                                    </div>
                                                </div>

                                                <div className="d-flex gap-2 mt-2">
                                                    <div style={{ flex: 1 }}>
                                                        <div className="small text-muted">Sale Value</div>
                                                        <div className="fw-bold">₹ {formatCurrency(d.total_sale_value)}</div>
                                                    </div>
                                                    <div style={{ width: 120 }}>
                                                        <Sparkline values={smallValues} width={120} height={36} />
                                                    </div>
                                                </div>

                                                <div className="d-flex justify-content-between mt-2">
                                                    <small className="text-muted">Pending DO</small>
                                                    <small className="fw-semibold">{formatNumber(d.pending_do_quantity)}</small>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* AG-Grid Table */}
                <GridTable
                    rowData={activeTab === 'branch' ? summaries : departmentSummaries}
                    columnDefs={activeTab === 'branch' ? columnDefs : (departmentSummaries[0] ? Object.keys(departmentSummaries[0]).map(key => ({ field: key, headerName: toTitleCase(key), sortable: true, resizable: true })) : [])}
                    enableEditing={false}
                    enableSelection={false}
                    height={tableHeight}
                />
            </div>
        </Wrapper>
    );
};

export default Phase3Page;
