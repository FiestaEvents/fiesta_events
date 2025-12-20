import { forwardRef, Fragment, Children } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { AlertCircle, ChevronDown, Check } from "lucide-react";

/*
  Fixed Headless UI Listbox-based Select replacement.
  Now properly passes the name attribute in onChange events.
*/

const Select = forwardRef(
  (
    {
      label,
      name, // ✅ CRITICAL: Added name to destructuring
      error,
      helperText,
      options,
      placeholder = "Select an option",
      fullWidth = false,
      required = false,
      disabled = false,
      className = "",
      containerClassName = "",
      value,
      onChange,
      children,
      ...props
    },
    ref
  ) => {
    const widthClass = fullWidth ? "w-full" : "";

    // Parse options from children if not provided as prop
    let parsedOptions = options;
    
    if (!parsedOptions && children) {
      parsedOptions = [];
      Children.forEach(children, (child) => {
        if (child?.type === 'option') {
          parsedOptions.push({
            value: child.props.value,
            label: child.props.children || child.props.value,
            disabled: child.props.disabled || false,
          });
        }
      });
    }

    // Fallback to empty array
    if (!parsedOptions) {
      parsedOptions = [];
    }

    // ✅ FIXED: Include name in synthetic event
    const handleChange = (val) => {
      if (typeof onChange === "function") {
        const syntheticEvent = { 
          target: { 
            value: val,
            name: name // ✅ This is crucial!
          } 
        };
        onChange(syntheticEvent);
      }
    };

    const selected = parsedOptions.find((o) => o.value === value) || null;

    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <Listbox value={value} onChange={handleChange} disabled={disabled}>
            <div className={`${widthClass} text-left`}>
              <Listbox.Button
                ref={ref}
                className={`relative w-full cursor-default rounded-lg border px-4 py-2.5 pr-10 text-left transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white hover:border-orange-400 dark:hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  error 
                    ? "border-red-300 dark:border-red-700 focus:ring-red-500" 
                    : "border-gray-300 dark:border-gray-700"
                } ${className}`}
                {...props}
              >
                <span className="flex items-center">
                  <span
                    className={`block truncate ${
                      selected 
                        ? "text-gray-900 dark:text-white" 
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {selected ? selected.label : placeholder}
                  </span>
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown className={`h-4 w-4 transition-colors ${
                    error 
                      ? "text-red-400" 
                      : "text-gray-400 dark:text-gray-500"
                  }`} />
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
                <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg bg-white dark:bg-gray-800 py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none sm:text-sm border border-gray-200 dark:border-gray-700">
                  {parsedOptions.length === 0 ? (
                    <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                      No options available
                    </div>
                  ) : (
                    parsedOptions.map((option) => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        className={({ active, disabled: optDisabled }) =>
                          `relative cursor-pointer select-none py-2.5 pl-3 pr-9 transition-colors ${
                            active
                              ? "bg-orange-50 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100"
                              : "text-gray-900 dark:text-gray-100"
                          } ${optDisabled ? "opacity-50 cursor-not-allowed" : ""}`
                        }
                      >
                        {({ selected: isSelected, active }) => (
                          <>
                            <span
                              className={`block truncate ${
                                isSelected 
                                  ? "font-semibold" 
                                  : "font-normal"
                              }`}
                            >
                              {option.label}
                            </span>

                            {isSelected ? (
                              <span className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                                active 
                                  ? "text-orange-600 dark:text-orange-400" 
                                  : "text-orange-500"
                              }`}>
                                <Check className="h-5 w-5" />
                              </span>
                            ) : null}
                          </>
                        )}
                      </Listbox.Option>
                    ))
                  )}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>

        {error && (
          <div className="mt-2 flex items-start gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;