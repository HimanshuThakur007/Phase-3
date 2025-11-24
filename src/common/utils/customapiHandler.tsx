import { useCallback } from "react";
import useFetch from "../../hooks/useFetch";
import { useNavigate } from "react-router-dom";
import { showErrorToast, showSuccessToast } from "../component/Toaster";
import Swal from "sweetalert2";

interface LoadTableDataProps {
  url: string;
  setState: React.Dispatch<React.SetStateAction<any>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  key?: string;
}

interface LoadDropdownOptionsProps {
  url: string;
  setState: React.Dispatch<React.SetStateAction<any>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  stateKey?: string | null;
  valueKey?: string;
  labelKey?: string;
  additionalKeys?: string[];
}

interface SubmitHandlerProps {
  url: string;
  method: any;
  data: any;
  onSuccess?: (response: any) => void;
  refreshList?: () => void;
  closeModal?: () => void;
  onError?: (error: any) => void;
  setLoading: (value: boolean) => void;
  navigateTo?: string;
  resetForm?: () => void;
}

interface FetchedItem {
  [key: string]: any;
}
interface DeleteHandlerProps {
  url: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  refreshList?: () => void;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

type ApiResponse = {
  status: number;
  msg: string;
  Msg: string;
  method?: string;
  [key: string]: any;
};

export const useApiHandler = () => {
  const callFetch = useFetch();
  const navigate = useNavigate();
  // ==============for-Table Data===================
  const loadTableData = useCallback(
    async <T extends { data: any; [key: string]: any }>({
      // `T` now can have any key
      url,
      setState,
      setLoading,
      key,
    }: LoadTableDataProps): Promise<void> => {
      try {
        setLoading(true);
        const { res, got } = await callFetch<T>(url, "GET");
        console.log("url", url);

        if (res?.status === 200 && got) {
          console.log("data", got?.Data);
          if (key) {
            setState((prev: any) => ({ ...prev, [key]: got.Data }));
          } else {
            setState(got.Data);
          }
        } else {
          console.error("Failed to load table data:", got);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    },
    [callFetch]
  );

  // =============for drop-down with any name=====================
  const loadDropdownOptions = useCallback(
    async <
      T extends {
        Data: any;
        Status: number;
        status: number;
        data: FetchedItem[];
      }
    >({
      url,
      setState,
      setLoading,
      stateKey = null,
      valueKey = "code",
      labelKey = "name",
      additionalKeys = [],
    }: LoadDropdownOptionsProps): Promise<void> => {
      try {
        setLoading(true);
        const { res, got } = await callFetch<T>(url, "GET");

        if (res && res.status === 200 && got && got.Status === 1) {
          // console.log("data==drop", got.Data);
          const mappedData = got.Data.map((item: FetchedItem) => {
            const mappedItem: { value: any; label: any; [key: string]: any } = {
              value: item[valueKey],
              label: item[labelKey],
            };
            additionalKeys.forEach((key) => {
              if (item[key] !== undefined) {
                mappedItem[key] = item[key];
              }
            });
            return mappedItem;
          });

          if (stateKey) {
            setState((prev: any) => ({ ...prev, [stateKey]: mappedData }));
          } else {
            setState(mappedData);
          }
        } else {
          console.log("Response:", got);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    },
    [callFetch]
  );
  // ===================for submit or save =================================

  const submitHandler = useCallback(
    async ({
      url,
      method = "POST",
      data,
      onSuccess,
      onError,
      setLoading,
      refreshList,
      closeModal,
      navigateTo,
      resetForm,
    }: SubmitHandlerProps): Promise<void> => {
      try {
        setLoading(true);
        const { res, got } = await callFetch<ApiResponse>(url, method, data);

        if (res?.status === 200 && got?.Status === 1) {
          console.log("Submission successful:", got);
          showSuccessToast(got.Msg || got.Message || "Submitted successfully");
          onSuccess?.(got);
          refreshList?.();
          closeModal?.();
          if (navigateTo) navigate(navigateTo);
          resetForm?.();
        } else {
          console.error("Submission failed:", got);
          showErrorToast(got?.Msg || "Submission failed.");
          onError?.(got);
        }
      } catch (error) {
        console.error("Error during submission:", error);
        showErrorToast("An error occurred during submission.");
        onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [callFetch, navigate]
  );

  // =============== modifyDataHandler ===============
  const modifyDataHandler = useCallback(
    async <
      T extends {
        Data: any;
        status: number;
        data: any;
        msg?: string;
        Msg?: string;
      }
    >({
      // Add `msg` to the expected shape
      url,
      setLoading,
      onSuccess,
      onError,
    }: {
      url: string;
      setLoading: React.Dispatch<React.SetStateAction<boolean>>;
      onSuccess?: (data: any) => void;
      onError?: (status: number | null, message: string) => void;
    }): Promise<void> => {
      try {
        setLoading(true);

        const { res, got } = await callFetch<T>(url, "GET");

        console.log("API Response:", got);

        if (res?.status === 200 && got) {
          console.log("Data to Pass to onSuccess:", got?.Data);
          onSuccess?.(got.Data);
        } else {
          const message = got?.Msg || "Something went wrong";
          console.error("API Error:", message);
          onError?.(res?.status ?? null, message);
        }
      } catch (error: any) {
        console.error("Error in modifyDataHandler:", error);
        onError?.(null, error?.message || "Unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    },
    [callFetch]
  );

  // Handle Delete (with Confirmation)
  const deleteHandler = useCallback(
    async <T extends { status: number; msg?: string }>({
      url,
      setLoading,
      refreshList,
      onSuccess,
      onError,
    }: DeleteHandlerProps): Promise<void> => {
      Swal.fire({
        title: "Are you sure?",
        text: "This action cannot be undone!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            setLoading(true);
            const { res, got } = await callFetch<T>(url, "GET");

            if (res?.status === 200 || res?.status === 201) {
              console.log("Deletion successful:", got);
              showSuccessToast(got?.msg || "Deleted successfully!");
              onSuccess?.(got);
              refreshList?.();
            } else {
              console.error("Deletion failed:", got);
              showErrorToast(got?.msg || "Failed to delete.");
              onError?.(got);
            }
          } catch (error) {
            console.error("Error during deletion:", error);
            showErrorToast("An error occurred during deletion.");
            onError?.(error);
          } finally {
            setLoading(false);
          }
        }
      });
    },
    [callFetch]
  );

  return {
    loadTableData,
    loadDropdownOptions,
    submitHandler,
    modifyDataHandler,
    deleteHandler,
  };
};
