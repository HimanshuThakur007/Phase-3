import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Wrapper from '../../common/uicomponent/wrapper';
import GridTable from '../../common/component/GridTable';
import { useForm } from 'react-hook-form';
import p3Filter from '../../core/json/phsae3Filter';
import { renderField } from '../../common/utils/renderField';
import useFetch from '../../hooks/useFetch';

const toTitleCase = (str: string) =>
    str
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

const Pase3DynamicTable: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const callFetch = useFetch();
    const { id } = useParams();

    // ----- department / branch / itemCode passed from the previous page -----
    const selectedDepartment = (location.state as { department?: string })?.department ?? '';
    const selectedBranch = (location.state as { branchCode?: string })?.branchCode ?? '';
    const itemCode = (location.state as { itemCode?: string })?.itemCode ?? '';

    const [tableHeight, setTableHeight] = useState<string>('550px');
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

    const [detailData, setDetailData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper to safely get branch fields using common variations
    const getBranchCode = (b: any) => b.branch_code ?? b.Branch_Code ?? b.branchCode ?? b.BranchCode ?? '';
    const getBranchName = (b: any) => b.branch_name ?? b.Branch_Name ?? b.BranchName ?? b.branchName ?? '';

    // ──────── FETCH DETAILED DATA FOR THE SELECTED DEPARTMENT / ITEM ────────
    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError(null);

            const payload = {
                branchCode: selectedBranch,
                department: selectedDepartment || "",
                itemCode: itemCode || "",
            };

            try {
                const { res, got } = await callFetch<any>(
                    "get-hbtsync-data",
                    "POST",
                    payload
                );

                if (res && res.status >= 400) {
                    const message =
                        (got && (got as any).message) ||
                        res.statusText ||
                        `Request failed with status ${res.status}`;
                    throw new Error(message);
                }

                const data = got as any;

                const isArray = (v: unknown): v is unknown[] => Array.isArray(v);

                // CASE: route id === "2" -> we expect branch objects that contain `items` arrays
                if (id === '2') {
                    let branches: any[] = [];
                    if (isArray(data)) {
                        branches = data as any[];
                    } else if (isArray(data.departments)) {
                        branches = data.departments;
                    } else if (isArray(data.summaries)) {
                        branches = data.summaries;
                    } else if (data && typeof data === 'object' && isArray((data as any).branches)) {
                        branches = (data as any).branches;
                    } else {
                        // If the API returns a single branch object containing items
                        if (data && (data.items && Array.isArray(data.items))) {
                            branches = [data];
                        } else {
                            branches = [];
                        }
                    }

                    // Flatten items: attach branch info to each item so table can show branch fields too
                    const items = branches.flatMap((b: any) => {
                        const itemsArr = Array.isArray(b.items) ? b.items : [];
                        const branchCodeVal = getBranchCode(b);
                        const branchNameVal = getBranchName(b);
                        return itemsArr.map((it: any) => ({
                            ...it,
                            _branch_code: branchCodeVal,
                            _branch_name: branchNameVal,
                        }));
                    });

                    // If itemCode provided, filter by Item_Code (or id?) — use inclusive match to be flexible
                    const filtered = itemCode
                        ? items.filter((it: any) =>
                            String(it.Item_Code ?? it.item_code ?? '').includes(String(itemCode))
                        )
                        : items;

                    setDetailData(filtered);
                } else {
                    // Existing behavior (department/branch level)
                    if (isArray(data)) {
                        setDetailData(data);
                    } else if (isArray((data as any)?.departments)) {
                        setDetailData((data as any).departments);
                    } else if (isArray((data as any)?.department_summaries)) {
                        setDetailData((data as any).department_summaries);
                    } else if ((data as any)?.status === "ok" && isArray((data as any)?.summaries)) {
                        setDetailData((data as any).summaries);
                    } else {
                        setDetailData([]);
                    }
                }
            } catch (err: any) {
                console.error("fetchDetail error:", err);
                setError(err?.message || "Failed to load detail data");
                setDetailData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDepartment, itemCode, selectedBranch, id]);

    // ──────── COLUMN DEFINITIONS ────────
    const columnDefs = useMemo(() => {
        if (detailData.length === 0) return [];

        const first = detailData[0];

        // If id === '2' we added _branch_name and _branch_code — show them up front if present
        const preferredOrder: string[] = id === '2' ? ['_branch_code', '_branch_name', 'Item_Code', 'item_department'] : [];

        const keys = Object.keys(first)
            .sort((a, b) => {
                const ai = preferredOrder.indexOf(a);
                const bi = preferredOrder.indexOf(b);
                if (ai === -1 && bi === -1) return a.localeCompare(b);
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
            });

        return keys.map(key => ({
            field: key,
            headerName: toTitleCase(key),
            filter: typeof first[key] === 'string' ? 'agTextColumnFilter' : 'agNumberColumnFilter',
            headerClass: 'bg-royal-blue text-white',
            sortable: true,
            resizable: true,
        }));
    }, [detailData, id]);

    // ──────── RESPONSIVE HEIGHT ────────
    useEffect(() => {
        const calc = () => {
            const winH = window.innerHeight;
            const headerH = 160;
            const footerH = 40;
            const bottom = 30;
            const min = 400;
            const h = winH - headerH - footerH - bottom;
            setTableHeight(`${Math.max(h, min)}px`);
        };
        calc();
        window.addEventListener('resize', calc);
        window.addEventListener('orientationchange', calc);
        return () => {
            window.removeEventListener('resize', calc);
            window.removeEventListener('orientationchange', calc);
        };
    }, []);

    // ──────── FILTER RENDERER ────────
    const renderFieldWrapper = (field: any, key: string) =>
        renderField({ field, form, options: [], key });

    // ──────── DRILL-DOWN TO ITEM CODE LEVEL ────────
    // If already on item-level (id === '2') we don't navigate further.
    const handleDrillDown = (event: any) => {
        if (id === '2') return;
        const itemCode = event.data.Item_Code ?? event.data.Item_Code ?? event.data.item_code ?? '';
        if (!itemCode) {
            console.warn('No item code found in row:', event.data);
            return;
        }
        navigate('/dynamictable/2', { state: { itemCode } });
    };

    return (
        <Wrapper header={`Phase 3 – ${selectedDepartment || selectedBranch}`} subHeader="Detail Report" ExportR={1} backButtonName='Back'>
            <div className="p-3">

                {/* FILTERS (kept for UI consistency) */}
                <div className="row g-3 mb-4">
                    {Object.entries(p3Filter.properties).map(([key, field]) => (
                        <div key={key} className="col-lg-2 col-md-4 col-sm-6">
                            {renderFieldWrapper(field, key)}
                        </div>
                    ))}
                    <div className="col-lg-2 col-md-4 col-sm-6 d-flex align-items-center">
                        <button type="submit" className="btn btn-primary w-100">
                            Show Report
                        </button>
                    </div>
                </div>

                {/* LOADING / ERROR */}
                {loading && (
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
                {error && <div className="alert alert-danger">{error}</div>}

                {/* DETAIL TABLE – click row to go to item level */}
                {!loading && !error && (
                    <GridTable
                        rowData={detailData}
                        columnDefs={columnDefs}
                        enableEditing={false}
                        enableSelection={false}
                        height={tableHeight}
                        onRowClick={handleDrillDown}
                    />
                )}
            </div>
        </Wrapper>
    );
};

export default Pase3DynamicTable;
