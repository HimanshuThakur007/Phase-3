import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Wrapper from '../../common/uicomponent/wrapper';
import GridTable from '../../common/component/GridTable';
import { useForm } from 'react-hook-form';
import p3Filter from '../../core/json/phsae3Filter';
import { renderField } from '../../common/utils/renderField';
import axios from 'axios';

// -------------------- Helpers --------------------
const toTitleCase = (str: string) =>
    str
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

// -------------------- Component --------------------
const Phase3Page: React.FC = () => {
    const navigate = useNavigate();

    /* ---------- Form (filters) ---------- */
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

    const renderFieldWrapper = (field: any, key: string) =>
        renderField({
            field,
            form,
            options: [],
            key,
        });

    /* ---------- State ---------- */
    const [summaries, setSummaries] = useState<any[]>([]);
    const [departmentSummaries, setDepartmentSummaries] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'branch' | 'department'>('department'); // default: department

    /* ---------- Fetch base data (once) ---------- */
    useEffect(() => {
        const fetchBase = async () => {
            setLoading(true);
            setError(null);
            try {
                const [branchRes, deptRes] = await Promise.all([
                    axios.post('http://127.0.0.1:5000/api/hbt-summary', { current_date: '' }),
                    axios.post('http://127.0.0.1:5000/api/hbt-summary-department', { current_date: '' }),
                ]);

                if (branchRes?.data?.status === 'ok') setSummaries(branchRes.data.summaries || []);
                else setSummaries([]);

                const d = deptRes?.data;
                if (Array.isArray(d)) setDepartmentSummaries(d);
                else if (Array.isArray(d?.departments)) setDepartmentSummaries(d.departments);
                else if (Array.isArray(d?.department_summaries)) setDepartmentSummaries(d.department_summaries);
                else if (d?.status === 'ok' && Array.isArray(d?.summaries)) setDepartmentSummaries(d.summaries);
                else setDepartmentSummaries([]);
            } catch (e: any) {
                console.error(e);
                setError(e?.message ?? 'Failed to load data');
                setSummaries([]);
                setDepartmentSummaries([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBase();
    }, []);

    /* ---------- Drill-down (Show Report) ---------- */
    const onShowReport = async () => {
        const values = form.getValues();
        setLoading(true);
        setError(null);
        try {
            const payload = { ...values, current_date: '' };
            const [branchRes, deptRes] = await Promise.all([
                axios.post('http://127.0.0.1:5000/api/hbt-summary', payload),
                axios.post('http://127.0.0.1:5000/api/hbt-summary-department', payload),
            ]);

            if (branchRes?.data?.status === 'ok') setSummaries(branchRes.data.summaries || []);
            else setSummaries([]);

            const d = deptRes?.data;
            if (Array.isArray(d)) setDepartmentSummaries(d);
            else if (Array.isArray(d?.departments)) setDepartmentSummaries(d.departments);
            else if (Array.isArray(d?.department_summaries)) setDepartmentSummaries(d.department_summaries);
            else if (d?.status === 'ok' && Array.isArray(d?.summaries)) setDepartmentSummaries(d.summaries);
            else setDepartmentSummaries([]);
        } catch (e: any) {
            console.error(e);
            setError(e?.message ?? 'Drill-down failed');
        } finally {
            setLoading(false);
        }
    };

    /* ---------- Column definitions ---------- */
    const branchCols = useMemo(() => {
        if (!summaries.length) return [];
        const first = summaries[0];
        return [
            ...Object.keys(first).map(k => ({
                field: k,
                headerName: toTitleCase(k),
                filter: typeof first[k] === 'string' ? 'agTextColumnFilter' : 'agNumberColumnFilter',
                headerClass: 'bg-royal-blue text-white',
                sortable: true,
                resizable: true,
            })),
        ];
    }, [summaries, navigate]);

    const deptCols = useMemo(() => {
        if (!departmentSummaries.length) return [];
        const first = departmentSummaries[0];
        return Object.keys(first).map(k => ({
            field: k,
            headerName: toTitleCase(k),
            filter: typeof first[k] === 'string' ? 'agTextColumnFilter' : 'agNumberColumnFilter',
            headerClass: 'bg-royal-blue text-white',
            sortable: true,
            resizable: true,
        }));
    }, [departmentSummaries]);

    const rowData = activeTab === 'branch' ? summaries : departmentSummaries;
    const colDefs = activeTab === 'branch' ? branchCols : deptCols;

    return (
        <Wrapper header="Phase 3 Dashboard" subHeader="Report" ExportR={1}>
            <div className="p-3">

                {/* ---------- FILTERS ---------- */}
                <form onSubmit={form.handleSubmit(onShowReport)} className="row g-3 mb-4">
                    {Object.entries(p3Filter.properties).map(([key, field]) => (
                        <div key={key} className="col-lg-2 col-md-4 col-sm-6">
                            {renderFieldWrapper(field, key)}
                        </div>
                    ))}
                    <div className="col-lg-2 col-md-4 col-sm-6 d-flex align-items-end">
                        <button type="submit" className="btn btn-primary w-100">
                            Show Report
                        </button>
                    </div>
                </form>

                {/* ---------- TABS ---------- */}
                <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'department' ? 'active' : ''}`}
                            onClick={() => setActiveTab('department')}
                        >
                            Department-wise
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'branch' ? 'active' : ''}`}
                            onClick={() => setActiveTab('branch')}
                        >
                            Branch-wise
                        </button>
                    </li>
                </ul>

                {/* ---------- STATUS BADGE (COUNT) ---------- */}
                <div className="d-flex justify-content-end mb-3">
                    {loading ? (
                        <span className="badge bg-info">Loading...</span>
                    ) : error ? (
                        <span className="badge bg-danger">Error</span>
                    ) : (
                        <span
                            className={`badge ${activeTab === 'branch' ? 'bg-success' : 'bg-secondary'
                                }`}
                        >
                            {activeTab === 'branch'
                                ? `${summaries.length} branches`
                                : `${departmentSummaries.length} departments`}
                        </span>
                    )}
                </div>

                {/* ---------- TABLE ---------- */}
                {!loading && !error && rowData.length > 0 && (
                    <GridTable
                        rowData={rowData}
                        columnDefs={colDefs}
                        enableEditing={false}
                        enableSelection={false}
                        height="calc(100vh - 300px)"
                    />
                )}

                {!loading && !error && rowData.length === 0 && (
                    <div className="text-center text-muted p-4">
                        No {activeTab === 'branch' ? 'branch' : 'department'} data available.
                    </div>
                )}
            </div>
        </Wrapper>
    );
};

export default Phase3Page;