import { forwardRef, Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { AlertCircle, ChevronDown, Check } from "lucide-react";

/*
  Headless UI Listbox-based Select replacement.
  Keeps the same API surface as the old Select so existing pages don't need edits.
  - options: [{ value, label, disabled? }]
  - value: current value
  - onChange: called with a synthetic event { target: { value } } to match previous usage
  - placeholder: label for empty value
*/

const Select = forwardRef(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder = "Select an option",
      fullWidth = false,
      required = false,
      disabled = false,
      className = "",
      containerClassName = "",
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const widthClass = fullWidth ? "w-full" : "";

    const handleChange = (val) => {
      // Call onChange with a synthetic event to preserve existing handlers that expect e.target.value
      if (typeof onChange === "function") {
        const syntheticEvent = { target: { value: val } };
        onChange(syntheticEvent);
      }
    };

    const selected = options.find((o) => o.value === value) || null;

    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <Listbox value={value} onChange={handleChange} disabled={disabled}>
            <div className={`${widthClass} text-left`}>
              <Listbox.Button
                ref={ref}
                className={`relative w-full cursor-default rounded-md border px-3 py-1.5 pr-10 text-left transition-colors disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed bg-white ${
                  error ? "border-red-300" : "border-gray-300"
                } ${className}`}
              >
                <span className="flex items-center">
                  <span
                    className={`block truncate ${selected ? "" : "text-gray-400"}`}
                  >
                    {selected ? selected.label : placeholder}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </span>
              </Listbox.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md dark:bg-[#1f2937] bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <Listbox.Option
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      className={({ active, disabled: optDisabled }) =>
                        `relative cursor-default select-none py-2 pl-3 pr-9 dark:hover:bg-orange-400 dark:text-white ${
                          active
                            ? "bg-gray-100 dark:bg-orange-400 text-gray-900 dark:text-white"
                            : "text-gray-900"
                        } ${optDisabled ? "opacity-50 cursor-not-allowed" : ""}`
                      }
                    >
                      {({ selected: isSelected }) => (
                        <>
                          <span
                            className={`block truncate ${isSelected ? "font-medium" : "font-normal"}`}
                          >
                            {option.label}
                          </span>

                          {isSelected ? (
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-orange-600 dark:text-white">
                              <Check className="h-4 w-4" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {error && (
          <div className="mt-2 flex items-start gap-1.5">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
