import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useApiHandler } from "../../common/utils/customapiHandler";
// import { useAuthContext } from "../../common/AuthContext";
import { useForm } from "react-hook-form";
import InputSelect, { OptionType } from "../../common/component/InputSelect";
import { renderField } from "../../common/utils/renderField";
import moment from "moment";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

// Define interfaces for the API response
interface MasterOption {
  MasterType: number;
  MasterCaption: string;
  MasterValue: string;
  RecType: number;
}

interface OptionData {
  OptFilterType: number;
  OptRangeType: number;
  OptRange: MasterOption[];
  OptCaption: string;
  OptDataType: "Select" | "Date" | "Yes/No" | "Input";
  OptVchType: number;
  OptMasterType: number;
  OptMasterCode: number;
  OptMasterValue: string;
  OptShowCaptionIndex: number;
  OptRequired: number;
  OptRecType: number;
  OptShowAllFiler: number; // Added to interface
}

interface DynamicDataState {
  formData: OptionData[];
  loading: boolean;
}

interface DynamicControllerReturn {
  id?: string;
  Name?: string;
  Caption?: string;
  form: ReturnType<typeof useForm>;
  formData: OptionData[];
  handleSubmit: (data: any) => void;
  handleCancel: () => void;
  renderFieldComponent?: any;
  loading?: any;
  CompnayName?: string;
}

interface FormValues {
  [key: string]: any;
}

interface FormField {
  OptDataType: string;
  OptRangeType?: number;
  OptRange?: MasterOption[];
  OptCaption: string;
  OptRequired: number;
  OptMasterType?: number;
  OptRecType?: number;
  OptVchType?: number; // Added to interface
  OptShowAllFiler?: number; // Added to interface
}

export const dynamicController = (): DynamicControllerReturn => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { loadTableData, loadDropdownOptions, submitHandler } = useApiHandler();
  const { RepID, Caption } = location?.state || {};
  const { decryptedData } = useSelector((state: RootState) => state.authData);
  const { CompCode, FinYear, CompnayName, ID } = decryptedData || {};
  console.log("sessionData from DynamicRpt", decryptedData);
  // const {
  //   state: { decryptedData: { CompCode, FinYear, CompnayName } = {} },
  // } = useAuthContext();

  const [dynamicData, setDynamicData] = useState<DynamicDataState>({
    formData: [],
    loading: false,
  });

  const form = useForm<FormValues>({
    defaultValues: {},
    mode: "onChange",
  });

  const updateState = useCallback(
    (newState: Partial<DynamicDataState>) =>
      setDynamicData((prev) => ({ ...prev, ...newState })),
    []
  );

  useEffect(() => {
    console.log(
      "uuuuu=>",
      `Report/GetRepOptions?RepID=${RepID}&CompCode=${CompCode}&FY=${FinYear}&UserID=${
        ID || 0
      }`
    );
    if (RepID && CompCode) {
      loadTableData({
        url: `Report/GetRepOptions?RepID=${RepID}&CompCode=${CompCode}&FY=${FinYear}&UserID=${
          ID || 0
        }`,
        setState: setDynamicData,
        setLoading: (value: any) => updateState({ loading: value }),
        key: "formData",
      });
      console.log("Reports-sata", dynamicData);
    }
  }, [loadTableData, updateState, RepID, CompCode]);

  const { reset, watch, setValue } = form;
  const [selectedMasterTypes, setSelectedMasterTypes] = useState<
    Record<number, string | number>
  >({});
  const [selectOptions, setSelectOptions] = useState<
    Record<number, OptionType[]>
  >({});
  const [selectLoading, setSelectLoading] = useState<Record<number, boolean>>(
    {}
  );

  const allValues = watch();

  useEffect(() => {
    reset();
    setSelectedMasterTypes({});
    setSelectOptions({});
    setSelectLoading({});
  }, [id, reset]);

  // Fetch options for select fields
  const fetchSelectOptions = useCallback(
    async (
      fieldIndex: number,
      masterType: string | number,
      recType?: string,
      OptVchType?: number,
      OptShowAllFiler?: number,
      isExtra: boolean = false
    ) => {
      console.log(isExtra);
      updateState({ loading: true });
      const url = `Report/GetBusyMaster?CompCode=${CompCode}&FY=${FinYear}&MasterType=${masterType}&RecType=${
        recType || 0
      }&VchType=${OptVchType}&ShowAllFilter=${OptShowAllFiler}&UserID=${
        ID || 0
      }`;
      console.log("url-of-GetBusyMaster", url);
      try {
        setSelectLoading((prev) => ({ ...prev, [fieldIndex]: true }));
        await loadDropdownOptions({
          url,
          setState: (options: OptionType[]) =>
            setSelectOptions((prev) => ({
              ...prev,
              [fieldIndex]: options,
            })),
          setLoading: (loading: any) =>
            setSelectLoading((prev) => ({
              ...prev,
              [fieldIndex]: loading,
            })),
          valueKey: "Code",
          // labelKey: "NameAlias",
          labelKey: "Name",
          additionalKeys: ["NameAlias"],
        });
      } catch (error) {
        console.error("Failed to fetch select options:", error);
      } finally {
        updateState({ loading: false });
      }
    },
    [loadDropdownOptions, CompCode, FinYear, updateState]
  );

  // Set default values on loading
  useEffect(() => {
    if (dynamicData.formData.length > 0) {
      const defaultValues: FormValues = {};
      const newSelectedMasterTypes: Record<number, string | number> = {};
      const newSelectOptions: Record<number, OptionType[]> = {};

      dynamicData.formData.forEach((field, index) => {
        const key = `field-${index}`;
        const {
          OptDataType,
          OptMasterValue,
          OptRangeType,
          OptMasterType,
          OptRecType,
          OptMasterCode,
          OptVchType,
          OptShowAllFiler,
        } = field;

        if (OptDataType === "Date") {
          const parsedDate = moment(OptMasterValue, [
            "DD/MMM/YYYY",
            "DD-MMM-YYYY",
          ]);
          defaultValues[key] = parsedDate.isValid()
            ? parsedDate.toISOString()
            : "";
        } else if (OptDataType === "Yes/No") {
          defaultValues[key] = OptMasterValue === "Yes" ? 1 : 0;
        } else if (OptDataType === "Select" && OptRangeType === 1) {
          // Use OptMasterCode as the default value
          const masterValue =
            OptMasterCode !== undefined && OptMasterCode !== null
              ? Number(OptMasterCode)
              : "";
          defaultValues[key] = masterValue;
          newSelectedMasterTypes[index] = masterValue;

          // Populate options from OptRange
          if (field.OptRange) {
            newSelectOptions[index] = field.OptRange.map((opt) => ({
              value: opt.MasterType,
              label: opt.MasterValue,
              recType: opt.RecType,
              OptCaption: opt.MasterCaption,
            }));
          }

          // Fetch options for extra select if masterValue exists
          if (masterValue && OptMasterType) {
            const recType = field.OptRange?.find(
              (opt) => opt.MasterType === masterValue
            )?.RecType;
            if (recType) {
              fetchSelectOptions(
                index + 0.5,
                masterValue,
                recType as any,
                OptVchType || 0,
                OptShowAllFiler || 0,
                true
              );
            }
          }

          // Set extra select default value if OptMasterCode exists
          if (OptMasterCode !== undefined && OptMasterCode !== null) {
            defaultValues[`${key}-extra`] = OptMasterCode.toString();
          }
        } else if (OptDataType === "Select") {
          defaultValues[key] =
            OptMasterCode !== undefined && OptMasterCode !== null
              ? Number(OptMasterCode)
              : "";
          if (OptMasterType) {
            fetchSelectOptions(
              index,
              OptMasterType,
              (OptRecType as any) || 0,
              OptVchType || 0,
              OptShowAllFiler || 0,
              false
            );
          }
        } else {
          defaultValues[key] = OptMasterValue || "";
        }
      });

      form.reset(defaultValues);
      setSelectedMasterTypes(newSelectedMasterTypes);
      setSelectOptions((prev) => ({ ...prev, ...newSelectOptions }));
    }
  }, [dynamicData.formData, form, fetchSelectOptions]);

  // Get static options for select fields with OptRangeType === 1
  const getDynamicOptions = (field: FormField): OptionType[] => {
    if (field.OptDataType !== "Select" || field.OptRangeType !== 1) return [];
    return (
      field.OptRange?.map((opt) => ({
        value: opt.MasterType,
        label: opt.MasterValue,
        recType: opt.RecType,
        OptCaption: opt.MasterCaption,
      })) || []
    );
  };

  // Handle select change for fields with OptRangeType === 1
  const handleSelectChange = (
    fieldIndex: number,
    selectedOption: OptionType | null
  ) => {
    const value = selectedOption?.value ?? "";
    setValue(`field-${fieldIndex}`, value);
    setSelectedMasterTypes((prev) => ({
      ...prev,
      [fieldIndex]: value,
    }));

    // Clear extra select options and value when main select changes
    setSelectOptions((prev) => ({ ...prev, [fieldIndex + 0.5]: [] }));
    setValue(`field-${fieldIndex}-extra`, "");

    // Fetch new options for extra select if a valid MasterType is selected
    if (value && value !== 0 && selectedOption?.recType) {
      const field = dynamicData.formData[fieldIndex];
      fetchSelectOptions(
        fieldIndex + 0.5,
        value,
        selectedOption.recType,
        field.OptVchType || 0,
        field.OptShowAllFiler || 0,
        true
      );
    }
  };

  // for non-OptRangeType=1 select fields
  const handleRegularSelectChange = (
    fieldIndex: number,
    selectedOption: OptionType | null
  ) => {
    const value = selectedOption?.value ?? "";
    setValue(`field-${fieldIndex}`, value);
  };

  // for extra select fields
  const handleExtraSelectChange = (
    fieldIndex: number,
    selectedOption: OptionType | null
  ) => {
    const value = selectedOption?.value ?? "";
    setValue(`field-${fieldIndex}-extra`, value);
  };

  const getComponentType = (dataType: string): string => {
    switch (dataType) {
      case "Select":
        return "InputSelect";
      case "Date":
        return "InputDate";
      case "Yes/No":
        return "InputToggle";
      case "Input":
        return "InputField";
      default:
        return "InputField";
    }
  };

  // Render individual field with extra select
  const renderFieldComponent = (field: FormField, index: number) => {
    const key = `field-${index}`;
    const options =
      field.OptRangeType === 1
        ? getDynamicOptions(field)
        : selectOptions[index] || [];
    const isLoading = selectLoading[index] || false;

    const fieldSchema: any = {
      component: getComponentType(field.OptDataType),
      props: {
        name: key,
        label: field.OptCaption,
        required: field.OptRequired === 1,
        disabled: false,
        isClearable: true,
      },
    };

    const selectedValue = selectedMasterTypes[index];
    const selectedOption = options.find((opt) => opt.value === selectedValue);

    const mainField = (
      <div key={key} className="col-md-12 mb-0">
        {field.OptDataType === "Select" ? (
          <InputSelect
            name={key}
            label={field.OptCaption}
            options={options}
            required={field.OptRequired === 1}
            isDisabled={false}
            onChange={
              field.OptRangeType === 1
                ? (selected: any) => handleSelectChange(index, selected)
                : (selected: any) => handleRegularSelectChange(index, selected)
            }
            isClearable
            isLoading={isLoading}
            value={options.find((opt) => opt.value === allValues[key]) || null}
            // formatOptionLabel={(option, { context }) => {
            //   return context === "menu" ? option.NameAlias : option.label;
            // }}
          />
        ) : (
          renderField({
            field: fieldSchema,
            form,
            options,
            key,
          })
        )}
      </div>
    );

    const extraSelect =
      field.OptRangeType === 1 &&
      selectedValue &&
      selectedValue !== 0 &&
      selectedOption ? (
        <div className="col-md-12 mb-0" key={`${key}-extra`}>
          <InputSelect
            name={`${key}-extra`}
            label={selectedOption.OptCaption || "Additional Select"}
            options={selectOptions[index + 0.5] || []}
            required={field.OptRequired === 1}
            isDisabled={false}
            isClearable
            isLoading={selectLoading[index + 0.5] || false}
            value={
              selectOptions[index + 0.5]?.find(
                (opt) => opt.value === allValues[`${key}-extra`]
              ) || null
            }
            onChange={(selected: any) =>
              handleExtraSelectChange(index, selected)
            }
          />
        </div>
      ) : null;

    return [mainField, extraSelect];
  };

  // date to dd-MMM-yyyy
  const formatDate = (date: string | Date): string => {
    if (!date) return "";
    const parsedDate = moment(date);
    return parsedDate.isValid() ? parsedDate.format("DD-MMM-YYYY") : "";
  };

  const handleSubmit = async (data: FormValues) => {
    const formattedData = dynamicData.formData.map((field, index) => {
      const key = `field-${index}`;
      let optMasterCode = 0;
      let optMasterValue = "";
      let optMasterType = field.OptMasterType;

      if (field.OptDataType === "Select") {
        if (field.OptRangeType === 1) {
          // For OptRangeType === 1, use the extra select field
          const extraKey = `${key}-extra`;
          const selectedValue = data[extraKey] || "";
          const options = selectOptions[index + 0.5] || [];
          const selectedOption = options.find(
            (opt) => opt.value === selectedValue
          );
          optMasterCode = selectedValue
            ? Number(selectedValue)
            : field.OptMasterCode || 0;
          optMasterValue = selectedOption?.label || field.OptMasterValue || "";
          const mainSelectedValue = data[key] || "";
          optMasterType = mainSelectedValue
            ? Number(mainSelectedValue)
            : field.OptMasterType || 0;
        } else {
          // For regular select fields
          const selectedValue = data[key] || "";
          const options = selectOptions[index] || [];
          const selectedOption = options.find(
            (opt) => opt.value === selectedValue
          );
          optMasterCode = selectedValue
            ? Number(selectedValue)
            : field.OptMasterCode || 0;
          optMasterValue = selectedOption?.label || field.OptMasterValue || "";
        }
      } else if (field.OptDataType === "Date") {
        // Format date fields
        optMasterValue = formatDate(data[key]);
      } else if (field.OptDataType === "Yes/No") {
        // Yes/No fields
        optMasterValue = data[key] ? "Yes" : "No";
        optMasterCode = data[key] ? 1 : 0;
      } else if (field.OptDataType === "Input") {
        optMasterValue = data[key] || "";
      }

      return {
        OptRangeType: field.OptRangeType,
        OptRange: field.OptRange || [],
        OptCaption: field.OptCaption,
        OptDataType: field.OptDataType,
        OptVchType: field.OptVchType,
        OptMasterType: optMasterType,
        OptRecType: field.OptRecType,
        OptShowAllFiler: field.OptShowAllFiler,
        OptMasterCode: optMasterCode,
        OptMasterValue: optMasterValue,
        OptShowCaptionIndex: field.OptShowCaptionIndex,
        OptRequired: field.OptRequired,
        OptFilterType: field.OptFilterType,
      };
    });

    try {
      await submitHandler({
        url: `Report/GetReportData?RepID=${RepID}&CompCode=${CompCode}&FY=${FinYear}`,
        method: "POST",
        data: formattedData,
        setLoading: (value: any) => {
          updateState({ loading: value });
        },
        onSuccess: (data) => {
          form.reset();
          const navigateData = {
            ...data,
            formattedData: JSON.stringify(formattedData, null, 2),
            RepID,
            Caption,
          };
          navigate(`/RepList/${id}`, {
            state: { navigateData },
          });
        },
        onError: (error: any) => {
          console.error("Error saving form:", error);
          updateState({ loading: false });
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }

    console.log("Form submitted:", JSON.stringify(formattedData, null, 2));
  };
  const handleCancel = () => {
    form.reset();
  };

  return {
    id,
    Caption,
    form,
    formData: dynamicData.formData,
    handleSubmit,
    handleCancel,
    renderFieldComponent,
    loading: dynamicData.loading,
    CompnayName,
  };
};
