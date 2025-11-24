import { useCallback, useState } from "react";
import useFetch from "../../hooks/useFetch";

// === Interfaces ===
export interface BranchItem {
  value: string | number;
  label: string;
}

export interface StateItem {
  value: string | number;
  label: string;
}

export interface DropdownItem {
  value: string | number;
  label: string;
}

// Define dropdown keys
export type DropdownKey =
  | "Global_HBT"
  | "Local_HBT"
  | "Sales_Bucket"
  | "Stock_Bucket"
  | "Transit_Qty"
  | "Local_Import";

export interface DropdownsResponse {
  status: string;
  dropdowns: Record<DropdownKey, any[]>;
}

interface ApiListResponse<T> {
  status?: string;
  total?: number;
  data?: T[];
}

// === Custom Hook ===
export const useBranchesApi = () => {
  const callFetch = useFetch();

  // === Branch State ===
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [loadingBranches, setLoadingBranches] = useState<boolean>(false);
  const [branchesError, setBranchesError] = useState<string | null>(null);

  // === State State ===
  const [states, setStates] = useState<StateItem[]>([]);
  const [loadingStates, setLoadingStates] = useState<boolean>(false);
  const [statesError, setStatesError] = useState<string | null>(null);

  // === Dropdowns State (now includes Local_Import) ===
  const [dropdowns, setDropdowns] = useState<
    Record<DropdownKey, DropdownItem[]>
  >({
    Global_HBT: [],
    Local_HBT: [],
    Sales_Bucket: [],
    Stock_Bucket: [],
    Transit_Qty: [],
    Local_Import: [], // ← Now properly initialized
  });
  const [loadingDropdowns, setLoadingDropdowns] = useState<boolean>(false);
  const [dropdownsError, setDropdownsError] = useState<string | null>(null);

  // === Fetch Branches ===
  const fetchBranches = useCallback(
    async (force = false) => {
      if (!force && branches.length > 0) return branches;

      setLoadingBranches(true);
      setBranchesError(null);

      try {
        const result = await callFetch<ApiListResponse<BranchItem>>(
          "get-branches",
          "GET"
        );
        const payload = result.got as ApiListResponse<BranchItem> | null;

        if (!payload) {
          setBranches([]);
          setBranchesError("No response payload");
          return [];
        }

        if (payload.status === "error") {
          setBranches([]);
          setBranchesError((payload as any).message || "Server returned error");
          return [];
        }

        const data = Array.isArray(payload.data) ? payload.data : [];
        const mapped = data
          .filter((b) => b && b.value != null && b.label != null)
          .map((b) => ({ value: b.value, label: String(b.label) }));

        setBranches(mapped);
        return mapped;
      } catch (err: any) {
        console.error("Error fetching branches:", err);
        setBranches([]);
        setBranchesError(err?.message || "Failed to load branches");
        return [];
      } finally {
        setLoadingBranches(false);
      }
    },
    [callFetch, branches]
  );

  // === Fetch States ===
  const fetchStates = useCallback(
    async (force = false, stateFilter?: string) => {
      if (!force && states.length > 0 && !stateFilter) return states;

      setLoadingStates(true);
      setStatesError(null);

      try {
        const url = stateFilter
          ? `get-states?state=${encodeURIComponent(stateFilter)}`
          : "get-states";

        const result = await callFetch<ApiListResponse<StateItem>>(url, "GET");
        const payload = result.got as ApiListResponse<StateItem> | null;

        if (!payload) {
          setStates([]);
          setStatesError("No response payload");
          return [];
        }

        if (payload.status === "error") {
          setStates([]);
          setStatesError((payload as any).message || "Server returned error");
          return [];
        }

        const data = Array.isArray(payload.data) ? payload.data : [];
        const mapped = data
          .filter((s) => s && s.value != null && s.label != null)
          .map((s) => ({ value: s.value, label: String(s.label) }));

        if (!stateFilter || force) {
          setStates(mapped);
        }

        return mapped;
      } catch (err: any) {
        console.error("Error fetching states:", err);
        setStates([]);
        setStatesError(err?.message || "Failed to load states");
        return [];
      } finally {
        setLoadingStates(false);
      }
    },
    [callFetch, states]
  );

  const fetchDropdowns = useCallback(
    async (force = false): Promise<Record<DropdownKey, DropdownItem[]>> => {
      const isCached = Object.values(dropdowns).some((arr) => arr.length > 0);
      if (!force && isCached) return dropdowns;

      setLoadingDropdowns(true);
      setDropdownsError(null);

      try {
        const result = await callFetch<DropdownsResponse>(
          "hbt-dropdowns",
          "GET"
        );
        const payload = result.got as DropdownsResponse | null;

        if (!payload || payload.status !== "ok") {
          setDropdownsError(payload?.status || "No response payload");
          return dropdowns;
        }

        // Initialize with all keys
        const validDropdowns: Record<DropdownKey, DropdownItem[]> = {
          Global_HBT: [],
          Local_HBT: [],
          Sales_Bucket: [],
          Stock_Bucket: [],
          Transit_Qty: [],
          Local_Import: [],
        };

        // Process each dropdown
        Object.entries(payload.dropdowns).forEach(([key, items]) => {
          if (!(key in validDropdowns) || !Array.isArray(items)) return;

          const dropdownKey = key as DropdownKey;

          // Base filter for all dropdowns
          let filteredItems = items.filter(
            (item): item is { value: any; label: any } =>
              item != null && item.value != null && item.label != null
          );

          // Special handling per dropdown
          if (dropdownKey === "Transit_Qty") {
            filteredItems = filteredItems
              .filter((item) => typeof item.value === "string")
              .map((item) => ({
                value: String(item.value).trim(),
                label: String(item.label).trim(),
              }));
          } else if (dropdownKey === "Local_Import") {
            filteredItems = filteredItems
              .filter(
                (item) =>
                  typeof item.value === "string" && item.value.trim() !== ""
              )
              .map((item) => ({
                value: String(item.value).trim(),
                label: String(item.label).trim(),
              }));
          } else if (dropdownKey === "Sales_Bucket") {
            // Filter out the two unwanted items
            const excludeLabels = ["6 to 10 Qty", "Greater Than 10 Qty"];
            filteredItems = filteredItems
              .filter(
                (item) => !excludeLabels.includes(String(item.label).trim())
              )
              .map((item) => ({
                value: String(item.value).trim(),
                label: String(item.label).trim(),
              }));
          } else {
            // Default: trim and stringify
            filteredItems = filteredItems.map((item) => ({
              value: String(item.value).trim(),
              label: String(item.label).trim(),
            }));
          }

          validDropdowns[dropdownKey] = filteredItems;
        });

        console.log("Valid Dropdowns:", validDropdowns);
        setDropdowns(validDropdowns);
        return validDropdowns;
      } catch (err: any) {
        console.error("Error fetching dropdowns:", err);
        setDropdownsError(err?.message || "Failed to load dropdowns");
        return dropdowns;
      } finally {
        setLoadingDropdowns(false);
      }
    },
    [callFetch, dropdowns]
  );
  // === Fetch All ===
  const fetchAll = useCallback(
    async (options?: { force?: boolean }) => {
      const force = options?.force ?? false;

      setBranchesError(null);
      setStatesError(null);
      setDropdownsError(null);
      setLoadingBranches(true);
      setLoadingStates(true);
      setLoadingDropdowns(true);

      try {
        const [branchesRes, statesRes, dropdownsRes] = await Promise.allSettled(
          [fetchBranches(force), fetchStates(force), fetchDropdowns(force)]
        );

        const result: {
          branches: BranchItem[];
          states: StateItem[];
          dropdowns: Record<DropdownKey, DropdownItem[]>;
        } = {
          branches: branches,
          states: states,
          dropdowns: dropdowns,
        };

        if (branchesRes.status === "fulfilled") {
          result.branches = branchesRes.value;
        }
        if (statesRes.status === "fulfilled") {
          result.states = statesRes.value;
        }
        if (dropdownsRes.status === "fulfilled") {
          result.dropdowns = dropdownsRes.value;
        }

        return result;
      } finally {
        setLoadingBranches(false);
        setLoadingStates(false);
        setLoadingDropdowns(false);
      }
    },
    [fetchBranches, fetchStates, fetchDropdowns, branches, states, dropdowns]
  );

  return {
    // Branches
    branches,
    loadingBranches,
    branchesError,
    fetchBranches,

    // States
    states,
    loadingStates,
    statesError,
    fetchStates,

    // Dropdowns
    dropdowns,
    loadingDropdowns,
    dropdownsError,
    fetchDropdowns,

    // Convenience
    fetchAll,
  };
};

export default useBranchesApi;
