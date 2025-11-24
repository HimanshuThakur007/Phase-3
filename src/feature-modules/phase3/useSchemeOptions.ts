// api/useSchemeOptions.ts
import { useCallback } from "react";
import useFetch from "../../hooks/useFetch";

export interface Option {
  label: string;
  value: number;
}

interface ApiResponse<T = Option[]> {
  status: "ok" | "error";
  total: number;
  data: T;
}

const useSchemeOptions = () => {
  const fetcher = useFetch();

  // Fetch all scheme types
  const getSchemeTypes = useCallback(async (): Promise<ApiResponse<Option[]> | null> => {
    try {
      const { got } = await fetcher<ApiResponse<Option[]>>("get-scheme-types", "GET");
      return got ?? null;
    } catch {
      return null;
    }
  }, [fetcher]);

  // Fetch scheme groups by selected schemeTypeId
  const getSchemeGroups = useCallback(
    async (schemeTypeId: number): Promise<ApiResponse<Option[]> | null> => {
      if (!schemeTypeId) return null;
      try {
        const { got } = await fetcher<ApiResponse<Option[]>>(
          `get-scheme-groups/${schemeTypeId}`,
          "GET"
        );
        
        return got;
      } catch {
        return null;
      }
    },
    [fetcher]
  );

  return {
    getSchemeTypes,
    getSchemeGroups,
  };
};

export default useSchemeOptions;