// Phase3Page.tsx
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Wrapper from "../../common/uicomponent/wrapper";
import GridTable from "../../common/component/GridTable";
import CenteredLoader from "../../common/component/CenteredLoader";
import { toTitleCase, toNumber } from "./helperfunc";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setTableHeight, saveScheme } from "../../redux/phase3Slice";
import {
  fetchSchemeTypes,
  fetchSchemeGroups,
  clearSchemeGroups,
} from "../../redux/schemeOptionsSlice";
import { FormProvider, useForm } from "react-hook-form";
import scheme, { display } from "../../core/json/scheme";
import { renderField } from "../../common/utils/renderField";
import useFetch from "../../hooks/useFetch";

const SimpleModal: React.FC<{
  show: boolean;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  onClose: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ show, title, size = "md", onClose, footer, children }) => {
  if (!show) return null;
  const dlgClass =
    size === "sm"
      ? "modal-sm"
      : size === "lg"
      ? "modal-lg"
      : size === "xl"
      ? "modal-xl"
      : "";
  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className={`modal-dialog ${dlgClass} modal-dialog-centered`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
};

const DiscountPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const callFetch = useFetch();
  // Only Item-wise data
  //   const itemsSummaries = useSelector((s: RootState) => s.phase3.itemSummaries);
  const savedSchemes = useSelector((s: RootState) => s.phase3.savedSchemes);
  //   const loading = useSelector((s: RootState) => s.phase3.loading);
  //   const error = useSelector((s: RootState) => s.phase3.error);
  const tableHeight = useSelector((s: RootState) => s.phase3.tableHeight);

  // Scheme Options
  const {
    types: rawSchemeTypes,
    groups: rawSchemeGroups,
    loadingTypes,
    loadingGroups,
  } = useSelector((s: RootState) => s.schemeOptions);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [schemeGroupKey, setSchemeGroupKey] = useState(0);
  const [modalType, setModalType] = useState<null | "scheme" | "display">(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemsData, setItemsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const payload = {
      branchCode: "",
      department: "",
      itemCode: "",
      state: "",
      Local_HBT: "",
      Global_HBT: "",
      Stock_Bucket: "",
      Sales_Bucket: "",
      Transit_Qty: "",
      Local_Import: "",
    };

    try {
      const { res, got } = await callFetch<any>(
        "hbt-summary-item",
        "POST",
        payload
      );
      console.log("response", res);
      if (res?.status === 200 && got?.status === "ok") {
        let data = got.summaries;
        console.log("ddddddd", data);
        setItemsData(data);
      }
    } catch (err: any) {
      const msg = err?.message || "Failed to fetch item summary";
      setError(msg);
      console.error("fetchData error:", err);
      setItemsData([]); // Reset on error
    } finally {
      setLoading(false);
    }
  }, [callFetch]);

  // Form
  const form = useForm<any>({
    mode: "onBlur",
    defaultValues: { schemeType: null, schemeGroup: null, displayType: null },
  });

  const selectedSchemeType = form.watch("schemeType");

  // Fetch scheme types
  useEffect(() => {
    dispatch(fetchSchemeTypes() as any);
  }, [dispatch]);

  // Fetch groups when type changes
  useEffect(() => {
    const id = selectedSchemeType?.value ?? selectedSchemeType;
    if (id) {
      form.setValue("schemeGroup", null);
      dispatch(fetchSchemeGroups(Number(id)) as any);
    } else {
      dispatch(clearSchemeGroups());
      form.setValue("schemeGroup", null);
    }
  }, [selectedSchemeType, dispatch, form]);

  // Normalize scheme types & groups
  const schemeTypes = useMemo(() => {
    if (!Array.isArray(rawSchemeTypes)) return [];
    return rawSchemeTypes.map((t: any) => ({
      value: String(
        t?.value ?? t?.id ?? t?.type_id ?? t?.code ?? t?.name ?? ""
      ),
      label: String(t?.label ?? t?.name ?? t?.type_name ?? t?.value ?? ""),
      __raw: t,
    }));
  }, [rawSchemeTypes]);

  const schemeGroups = useMemo(() => {
    if (!Array.isArray(rawSchemeGroups)) return [];
    return rawSchemeGroups.map((g: any) => ({
      value: String(
        g?.value ?? g?.id ?? g?.group_id ?? g?.code ?? g?.name ?? ""
      ),
      label: String(
        g?.label ?? g?.name ?? g?.group_name ?? g?.title ?? g?.value ?? ""
      ),
      __raw: g,
    }));
  }, [rawSchemeGroups]);

  useEffect(() => {
    setSchemeGroupKey((k) => k + 1);
  }, [schemeGroups.length]);

  // Helpers
  const getItemCodeFromRow = useCallback((row: any): string | undefined => {
    const code =
      row?.["Item Code"] ?? row?.itemCode ?? row?.item_code ?? row?.ItemCode;
    return code ? String(code).trim() : undefined;
  }, []);

  const getBranchCodeFromRow = useCallback((row: any): string | undefined => {
    const code =
      row?.branchCode ??
      row?.Branch_Code ??
      row?.branch_code ??
      row?.BranchCode;
    return code ? String(code).trim() : undefined;
  }, []);

  const findSavedEntryForRow = useCallback(
    (row: any) => {
      const itemCode = getItemCodeFromRow(row);
      const branchCode = getBranchCodeFromRow(row);

      if (!itemCode) return undefined;

      return savedSchemes.find((s: any) => {
        const savedItem = String(s.itemCode ?? "")
          .trim()
          .toLowerCase();
        const savedBranch = String(s.branchCode ?? "")
          .trim()
          .toLowerCase();
        const matchItem = savedItem === String(itemCode).trim().toLowerCase();
        if (!branchCode) return matchItem && !savedBranch;
        return (
          matchItem && savedBranch === String(branchCode).trim().toLowerCase()
        );
      });
    },
    [savedSchemes, getItemCodeFromRow, getBranchCodeFromRow]
  );

  // Item Data
  const itemsWiseSchemeData: any = useMemo(
    () =>
      itemsData.map((d: any) => ({
        "Item Code": d?.item_code,
        "Item Name": d?.item_name,
        Department: d?.department,
        Category: d?.category,
        "Sub Category": d?.subcategory,
        "Item Status": d?.active_inactive,
        Desc: d?.item_desc,
        "Scheme Type": d?.scheme_type,
        "Scheme Group": d?.scheme_group,
        "Str Stk": Math.round(d?.total_site_quantity || 0),
        "Sale Qty": Math.round(d?.total_sale_quantity || 0),
        "Sale Val": Math.round(d?.total_sale_value || 0),
        "Stk Val": Math.round(d?.total_str_stk_sp_value || 0),
        "Branch count": d?.branch_count,
        "Stk Qty Contri": `${Number(d?.stock_qty_contri).toFixed(2)}%`,
        "Stk Val Contri": `${Number(d?.stock_val_contri).toFixed(2)}%`,
      })),
    [itemsData]
  );

  // Columns
  const columnDefs = useMemo(() => {
    if (!itemsWiseSchemeData.length) return [];
    const keys = Object.keys(itemsWiseSchemeData[0]);

    return keys.map((k) => {
      const isContri = k.includes("Contri");
      return {
        field: k,
        headerName: toTitleCase(k),
        sortable: true,
        resizable: true,
        filter:
          typeof itemsWiseSchemeData[0][k] === "string"
            ? "agTextColumnFilter"
            : "agNumberColumnFilter",
        pinned: isContri ? "right" : null,
        width: isContri ? 140 : undefined,
        // flex: isContri ? 0 : 1,
        cellStyle: isContri ? { textAlign: "right" } : undefined,
        valueFormatter: isContri
          ? (p: any) => (p.value ? `${parseFloat(p.value).toFixed(2)}%` : "")
          : undefined,
        comparator: isContri
          ? (a: any, b: any) =>
              (parseFloat(a || 0) || 0) - (parseFloat(b || 0) || 0)
          : undefined,
      };
    });
  }, [itemsData]);

  // Add checkbox column
  const displayedColumnDefs = useMemo(() => {
    const cols: any = [...columnDefs];
    const hasCheckbox = cols.some((c: any) => c.field === "__select__");
    if (!hasCheckbox) {
      cols.unshift({
        field: "__select__",
        headerName: "",
        width: 48,
        pinned: "left",
        lockPosition: true,
        checkboxSelection: (params: any) => {
          const saved = findSavedEntryForRow(params.data);
          return !saved?.data?.appliedScheme && !saved?.data?.appliedDisplay;
        },
        headerCheckboxSelection: false,
        sortable: false,
        filter: false,
        resizable: false,
      });
    }
    return cols;
  }, [columnDefs, findSavedEntryForRow]);

  // Selection

  const selectedRowsHandler = (data: any) => setSelectedRows(data);

  // Options for form
  const selectOptions = useMemo(
    () => ({
      schemeType: schemeTypes,
      schemeGroup: schemeGroups,
      displayType: [
        { value: "Send Shelf Picture", label: "Send Shelf Picture" },
      ],
    }),
    [schemeTypes, schemeGroups]
  );

  const renderFieldWrapper = useCallback(
    (field: any, key: string) => {
      const name = field?.props?.name ?? "";
      const options = selectOptions[name as keyof typeof selectOptions] ?? [];
      const isLoading =
        (name === "schemeType" && loadingTypes) ||
        (name === "schemeGroup" && loadingGroups);

      if (isLoading) {
        return (
          <div key={key} className="p-2">
            <div
              className="spinner-border spinner-border-sm text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading…</span>
            </div>
          </div>
        );
      }

      return renderField({
        field,
        form,
        options,
        key: name === "schemeGroup" ? `${key}-${schemeGroupKey}` : key,
      });
    },
    [form, selectOptions, loadingTypes, loadingGroups, schemeGroupKey]
  );

  // Modal Handlers
  const openSchemeModal = (preset?: any) => {
    form.reset({ schemeType: null, schemeGroup: null });
    if (preset) {
      const type = schemeTypes.find(
        (t) =>
          String(t.value) ===
          String(preset.schemeType?.value ?? preset.schemeType)
      );
      const group = schemeGroups.find(
        (g) =>
          String(g.value) ===
          String(preset.schemeGroup?.value ?? preset.schemeGroup)
      );
      form.reset({ schemeType: type || null, schemeGroup: group || null });
    }
    setModalType("scheme");
    setModalOpen(true);
  };

  const openDisplayModal = (preset?: any) => {
    form.reset({ displayType: preset?.displayType || null });
    setModalType("display");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalType(null);
    form.reset();
  };

  const saveSchemeForSelected = (data: any) => {
    selectedRows.forEach((row) => {
      const existing = findSavedEntryForRow(row);
      const schemeToSave = {
        ...(existing?.data?.appliedDisplay
          ? { appliedDisplay: existing.data.appliedDisplay }
          : {}),
        appliedScheme: data,
      };
      dispatch(
        saveScheme({
          row: {
            ...row,
            itemCode: getItemCodeFromRow(row),
            branchCode: getBranchCodeFromRow(row),
          },
          scheme: schemeToSave,
        })
      );
    });
    closeModal();
  };

  const saveDisplayForSelected = (data: any) => {
    selectedRows.forEach((row) => {
      const existing = findSavedEntryForRow(row);
      const schemeToSave = {
        ...(existing?.data?.appliedScheme
          ? { appliedScheme: existing.data.appliedScheme }
          : {}),
        appliedDisplay: data,
      };
      dispatch(
        saveScheme({
          row: {
            ...row,
            itemCode: getItemCodeFromRow(row),
            branchCode: getBranchCodeFromRow(row),
          },
          scheme: schemeToSave,
        })
      );
    });
    closeModal();
  };

  // Table Height
  useEffect(() => {
    const updateHeight = () => {
      const height = window.innerHeight - 260;
      dispatch(setTableHeight(`${Math.max(height, 500)}px`));
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [dispatch]);

  const handleDrillDown = (e: any) => {
    const colField =
      e?.colDef?.field ??
      (typeof e?.column?.getColId === "function"
        ? e.column.getColId()
        : null) ??
      null;
    if (colField === "__select__") return;

    const domEvent = e?.event;
    if (domEvent && domEvent.target) {
      const targetEl = domEvent.target as HTMLElement;
      if (
        targetEl.closest("button") ||
        targetEl.closest("a") ||
        targetEl.closest(".no-drill") ||
        targetEl.closest('input[type="checkbox"]')
      ) {
        return;
      }
    }

    if (!e?.data) return;

    // const dept = e.data.Department ?? "";
    // const branch = e.data["Branch Code"] ?? "";
    const item = e.data["Item Code"] ?? "";

    navigate("/dynamictable/2", { state: { itemCode: item } });
  };

  // Total Summary
  const totalSummary = useMemo(() => {
    const totals: any = {};
    if (!itemsWiseSchemeData.length) return totals;

    itemsWiseSchemeData.forEach((row: any) => {
      ["Str Stk", "Sale Qty", "Sale Val", "Stk Val", "Branch count"].forEach(
        (k) => {
          totals[k] = (totals[k] || 0) + toNumber(row[k]);
        }
      );
    });

    Object.keys(totals).forEach((k) => {
      totals[k] = Math.round(totals[k]);
    });
    return totals;
  }, [itemsData]);

  // Modal Content
  const SchemeModalBody = (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(saveSchemeForSelected)}>
        <div className="mb-3 small text-muted">
          Applying scheme to {selectedRows.length} selected item
          {selectedRows.length > 1 ? "s" : ""}.
        </div>
        <div className="row">
          {Object.entries(scheme.properties).map(([key, field]) => (
            <div key={key} className="col-lg-6 mb-3">
              {renderFieldWrapper(field as any, key)}
            </div>
          ))}
        </div>
      </form>
    </FormProvider>
  );

  const DisplayModalBody = (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(saveDisplayForSelected)}>
        <div className="mb-3 small text-muted">
          Applying display to {selectedRows.length} selected item
          {selectedRows.length > 1 ? "s" : ""}.
        </div>
        <div className="row">
          {Object.entries(display.properties).map(([key, field]) => (
            <div key={key} className="col-12 mb-3">
              {renderFieldWrapper(field as any, key)}
            </div>
          ))}
        </div>
      </form>
    </FormProvider>
  );

  const modalFooter = (
    <>
      <button type="button" className="btn btn-secondary" onClick={closeModal}>
        Close
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() =>
          form.handleSubmit(
            modalType === "scheme"
              ? saveSchemeForSelected
              : saveDisplayForSelected
          )()
        }
      >
        Save
      </button>
    </>
  );

  return (
    <Wrapper
      header="Item-wise Summary & Schemes"
      subHeader="Apply Schemes & Displays"
      ExportR={1}
      showFilters={false}
    >
      <div className="mb-3">
        {loading && <CenteredLoader />}
        {/* Controls */}
        <div className="d-flex gap-2 mb-3 align-items-center">
          <span className="text-muted small">
            Selected: <strong>{selectedRows.length}</strong>
          </span>
          <button
            className="btn btn-sm btn-outline-primary"
            disabled={!selectedRows.length}
            onClick={() => openSchemeModal()}
          >
            Apply Scheme
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={!selectedRows.length}
            onClick={() => openDisplayModal()}
          >
            Apply Display
          </button>
        </div>

        {/* Summary Badges */}
        {!loading && !error && itemsWiseSchemeData.length > 0 && (
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="badge bg-primary text-white px-3 py-2">
              {itemsWiseSchemeData.length} Item
              {itemsWiseSchemeData.length !== 1 ? "s" : ""}
            </span>
            {Object.entries(totalSummary).map(([k, v]) => (
              <span
                key={k}
                className="badge bg-light text-dark border px-3 py-2"
              >
                <strong>{toTitleCase(k)}:</strong>{" "}
                {(v as number).toLocaleString("en-IN")}
              </span>
            ))}
          </div>
        )}

        {/* Table */}
        {!loading && !error && itemsData.length > 0 && (
          <div className="border rounded-2 overflow-hidden shadow-sm">
            <GridTable
              rowData={itemsWiseSchemeData}
              columnDefs={displayedColumnDefs as any}
              height={tableHeight}
              enableSelection={true}
              enableEditing={false}
              onRowClick={handleDrillDown}
              reportHeader="Phase_3_Item_Summary_Schemes"
              selectedRowsHandler={selectedRowsHandler}
            />
          </div>
        )}

        {/* Empty / Error */}
        {!loading && !error && itemsData.length === 0 && (
          <div className="text-center py-5 text-muted">No items found.</div>
        )}
        {error && (
          <div className="alert alert-danger">Failed to load data.</div>
        )}

        {/* Modal */}
        <SimpleModal
          show={modalOpen}
          title={
            modalType === "scheme"
              ? `Apply Scheme (${selectedRows.length})`
              : `Apply Display (${selectedRows.length})`
          }
          size="lg"
          onClose={closeModal}
          footer={modalFooter}
        >
          {modalType === "scheme" ? SchemeModalBody : DisplayModalBody}
        </SimpleModal>
      </div>
    </Wrapper>
  );
};

export default DiscountPage;
