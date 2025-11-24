import { useState, useEffect, useCallback, useMemo } from "react";
import { useApiHandler } from "./customapiHandler";
import { useAuthContext } from "../AuthContext";

// Define the type for dropdown options
interface DropdownOption {
  parentID: string | number;
  label: string;
  value: string | number;
  code: string | number;
  name: string;
  masterType?: number;
}

// Define the expected type for loadDropdownOptions
interface LoadDropdownOptionsParams {
  url: string;
  setState: React.Dispatch<React.SetStateAction<DropdownOption[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  valueKey: string;
  labelKey: string;
  additionalKeys?: string[];
}

// Define the state structure
interface DropdownData {
  departments: DropdownOption[];
  designations: DropdownOption[];
  country: DropdownOption[];
  state: DropdownOption[];
  city: DropdownOption[];
  company: DropdownOption[];
  category: DropdownOption[];
  productType: DropdownOption[];
  subcategory: DropdownOption[];
  brand: DropdownOption[];
  unit: DropdownOption[];
  taxType: DropdownOption[];
  store: DropdownOption[];
  employee: DropdownOption[];
  organisation: DropdownOption[];
  bank: DropdownOption[];
  transporter: DropdownOption[];
  priceListCode: DropdownOption[];
}

export const useMasterData = () => {
  const { loadDropdownOptions } = useApiHandler();
  const {
    state: { decryptedData: { companyCode = 0 } = {} },
  } = useAuthContext();
  const [dropdownData, setDropdownData] = useState<DropdownData>({
    departments: [],
    designations: [],
    country: [],
    state: [],
    city: [],
    company: [],
    category: [],
    productType: [],
    subcategory: [],
    brand: [],
    unit: [],
    taxType: [],
    store: [],
    employee: [],
    organisation: [],
    bank: [],
    transporter: [],
    priceListCode: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrls = {
    departments: "GetDepartmentMasterList?Code=0",
    designations: "GetDesignationMasterList?Code=0",
    company: "GetCompany?Code=0",
    taxTypes: "GetTaxTypeMaster?Code=0",
    employee: `GetUserMasterDetails?Code=0&Company=${companyCode}`,
  };

  // Map MasterType values to dropdown keys
  const masterTypeMap: { [key: number]: keyof DropdownData } = {
    6: "country",
    7: "state",
    8: "city",
    11: "category",
    13: "productType",
    12: "subcategory",
    14: "brand",
    15: "unit",
    16: "store",
    18: "organisation",
    19: "bank",
    20: "transporter",
    21: "priceListCode",
  };

  const fetchData = useCallback(
    async (
      url: string,
      key: keyof DropdownData,
      type: string,
      labelKey: string = "name",
      additionalKeys?: string[]
    ) => {
      try {
        setLoading(true);
        await loadDropdownOptions({
          url,
          setState: (data) =>
            setDropdownData((prev) => ({ ...prev, [key]: data })),
          setLoading,
          valueKey: "code",
          labelKey,
          additionalKeys,
        } as LoadDropdownOptionsParams);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : `Failed to fetch ${type} data`
        );
      } finally {
        setLoading(false);
      }
    },
    [loadDropdownOptions]
  );

  // Generic function for MasterType-based dropdowns
  const fetchMasterTypeData = useCallback(
    (masterType: number) => {
      const key = masterTypeMap[masterType];
      if (key) {
        fetchData(
          `GetMaster?Code=0&MasterType=${masterType}`,
          key,
          key,
          "name",
          ["masterType", "parentID"]
        );
      }
    },
    [fetchData]
  );

  const fetchDepartments = useCallback(
    () => fetchData(apiUrls.departments, "departments", "department"),
    [fetchData]
  );

  const fetchDesignations = useCallback(
    () => fetchData(apiUrls.designations, "designations", "designation"),
    [fetchData]
  );

  const fetchCompany = useCallback(
    () => fetchData(apiUrls.company, "company", "company"),
    [fetchData]
  );

  const fetchTaxTypes = useCallback(
    () => fetchData(apiUrls.taxTypes, "taxType", "taxType"),
    [fetchData]
  );

  const fetchEmployee = useCallback(
    () =>
      fetchData(apiUrls.employee, "employee", "employee", "fName", [
        "parentID",
      ]),
    [fetchData]
  );

  useEffect(() => {
    fetchDepartments();
    fetchDesignations();
    fetchCompany();
    fetchTaxTypes();
    fetchEmployee();
    Object.keys(masterTypeMap).forEach((masterType) =>
      fetchMasterTypeData(Number(masterType))
    );
  }, [
    fetchDepartments,
    fetchDesignations,
    fetchCompany,
    fetchTaxTypes,
    fetchEmployee,
    fetchMasterTypeData,
  ]);

  return useMemo(
    () => ({
      ...dropdownData,
      loading,
      error,
    }),
    [dropdownData, loading, error]
  );
};
