import React, { memo, useMemo, useCallback, useState, useEffect } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import { Props as ReactSelectProps, GroupBase } from "react-select";
import Fuse from "fuse.js";
import { debounce } from "lodash";

export interface OptionType {
  label: string;
  value: string | number;
  NameAlias?: string;
  [key: string]: any;
}

interface VirtualizedSelectProps
  extends ReactSelectProps<OptionType, boolean, GroupBase<OptionType>> {
  label?: string;
  isMulti?: boolean;
  isClearable?: boolean;
  required?: boolean;
  isDisabled?: boolean;
  options?: OptionType[];
  labelCol?: string; // New prop for label column size (e.g., "col-md-4")
  selectCol?: string;
  loadOptions?: (
    search: string,
    loadedOptions: OptionType[],
    additional: any
  ) => Promise<{
    options: OptionType[];
    hasMore: boolean;
    additional: any;
  }>;
}

const InputSelect: React.FC<VirtualizedSelectProps> = ({
  label,
  isMulti = false,
  isClearable = false,
  required = false,
  isDisabled = false,
  options = [],
  loadOptions: externalLoadOptions,
  labelCol = "col-md-3",
  selectCol = "col-md-9",
  ...props
}) => {
  const [defaultOptions, setDefaultOptions] = useState<OptionType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  // const [componentKey, setComponentKey] = useState(0); // For forcing remount
  const defaultLoadOptions = useCallback(
    async (
      search: string,
      _loadedOptions: OptionType[],
      { page }: { page: number }
    ) => {
      const pageSize = 100;
      let filteredOptions: OptionType[] = options;

      if (search) {
        const fuse = new Fuse(options, {
          keys: ["label", "NameAlias"],
          threshold: 0.3,
          ignoreLocation: true,
          minMatchCharLength: 1,
          includeScore: true,
        });
        filteredOptions = fuse.search(search).map((result) => result.item);
      }

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedOptions = filteredOptions.slice(start, end);

      return {
        options: paginatedOptions,
        hasMore: end < filteredOptions.length,
        additional: { page: page + 1 },
      };
    },
    [options]
  );

  // Use externalLoadOptions if provided, otherwise use defaultLoadOptions
  const debouncedLoadOptions = useMemo(
    () =>
      debounce(externalLoadOptions || defaultLoadOptions, 400, {
        leading: true,
        trailing: true,
      }),
    [externalLoadOptions, defaultLoadOptions]
  );

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    debouncedLoadOptions("", [], { page: 1 }).then((result) => {
      if (isMounted) {
        setDefaultOptions(result.options);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
      debouncedLoadOptions.cancel();
    };
  }, [debouncedLoadOptions]);
  const formatOptionLabel = useCallback(
    (option: OptionType, { context }: { context: string }) =>
      context === "menu" ? option.NameAlias || option.label : option.label,
    []
  );

  const handleMenuOpen = useCallback(() => {
    if (!isLoading) {
      setMenuIsOpen(true);
    }
  }, [isLoading]);

  const handleMenuClose = useCallback(() => {
    setMenuIsOpen(false);
  }, []);

  return (
    <div className="mb-2 add-product">
      {label && (
        <label className="col-form-label  ">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <AsyncPaginate
        // key={componentKey}
        className="select"
        classNamePrefix="react-select"
        isMulti={isMulti}
        isClearable={isClearable}
        placeholder={label ? `Select ${label}` : "Select..."}
        isDisabled={isDisabled || isLoading}
        loadOptions={debouncedLoadOptions as any}
        required={required}
        formatOptionLabel={formatOptionLabel}
        cacheUniqs={[options]}
        additional={{ page: 1 }}
        debounceTimeout={400}
        defaultOptions={defaultOptions}
        // menuIsOpen={menuIsOpen}
        menuIsOpen={isLoading ? false : menuIsOpen}
        onMenuOpen={handleMenuOpen}
        onMenuClose={handleMenuClose}
        {...props}
      />
      {/* </div> */}
    </div>
  );
};

export default memo(InputSelect);
