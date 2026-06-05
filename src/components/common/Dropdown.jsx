import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

const Dropdown = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  clearable = false,
  disabled = false,
  error = '',
  helperText = '',
  required = false,
  loading = false,
  renderOption,
  renderValue,
  className = '',
  dropdownClassName = '',
  optionClassName = '',
  getOptionLabel = (option) => option?.label || option?.name || option,
  getOptionValue = (option) => option?.value || option?._id || option,
  emptyMessage = 'No options available',
  searchPlaceholder = 'Search...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filter options based on search term
  const filteredOptions = searchable && searchTerm
    ? options.filter((option) =>
        getOptionLabel(option).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get selected option
  const selectedOption = options.find(
    (option) => getOptionValue(option) === value
  );

  // Handle option selection
  const handleSelect = (option) => {
    onChange(getOptionValue(option));
    setIsOpen(false);
    setSearchTerm('');
  };

  // Handle clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Render display value
  const renderDisplayValue = () => {
    if (loading) {
      return <span className="text-gray-400">Loading...</span>;
    }

    if (!selectedOption) {
      return <span className="text-gray-400">{placeholder}</span>;
    }

    if (renderValue) {
      return renderValue(selectedOption);
    }

    return <span className="text-gray-900">{getOptionLabel(selectedOption)}</span>;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 text-left bg-white border rounded-lg
          flex items-center justify-between
          transition-all duration-200
          ${disabled 
            ? 'bg-gray-50 cursor-not-allowed opacity-60' 
            : 'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent'
          }
          ${error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300'
          }
          ${isOpen ? 'ring-2 ring-orange-500 border-transparent' : ''}
        `}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {renderDisplayValue()}
        </div>

        <div className="flex items-center gap-2 ml-2">
          {clearable && selectedOption && !disabled && (
            <X
              className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg
            max-h-64 overflow-hidden flex flex-col
            ${dropdownClassName}
          `}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {searchTerm && (
                  <X
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                    onClick={() => setSearchTerm('')}
                  />
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-sm">Loading...</p>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">{emptyMessage}</p>
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = getOptionValue(option) === value;
                
                return (
                  <button
                    key={getOptionValue(option) || index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-4 py-2.5 text-left flex items-center justify-between
                      transition-colors duration-150
                      ${isSelected 
                        ? 'bg-orange-50 text-orange-900' 
                        : 'hover:bg-gray-50 text-gray-900'
                      }
                      ${optionClassName}
                    `}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {renderOption ? (
                        renderOption(option, isSelected)
                      ) : (
                        <span className="truncate">{getOptionLabel(option)}</span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-orange-600 ml-2 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Demo Component
const DropdownDemo = () => {
  const [basicValue, setBasicValue] = useState('');
  const [searchableValue, setSearchableValue] = useState('');
  const [clearableValue, setClearableValue] = useState('option2');
  const [customValue, setCustomValue] = useState('');
  const [categoryValue, setCategoryValue] = useState('');

  // Basic options
  const basicOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  // Countries options
  const countries = [
    { value: 'tn', label: 'Tunisia', code: '🇹🇳' },
    { value: 'fr', label: 'France', code: '🇫🇷' },
    { value: 'us', label: 'United States', code: '🇺🇸' },
  ];

  // Supply categories
  const categories = [
    { _id: '1', name: 'Beverages', icon: '☕', color: '#3B82F6' },
    { _id: '2', name: 'Snacks', icon: '🍪', color: '#F59E0B' },
    { _id: '3', name: 'Food', icon: '🍽️', color: '#EF4444' },
    { _id: '4', name: 'Decoration', icon: '✨', color: '#EC4899' },
    { _id: '5', name: 'Tableware', icon: '🍴', color: '#8B5CF6' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dropdown Component
          </h1>
          <p className="text-gray-600">
            Reusable dropdown component with search, clear, and custom rendering
          </p>
        </div>

        {/* Examples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Dropdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Dropdown
            </h2>
            <Dropdown
              label="Select Option"
              options={basicOptions}
              value={basicValue}
              onChange={setBasicValue}
              placeholder="Choose an option"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              Selected: {basicValue || 'None'}
            </p>
          </div>

          {/* Searchable Dropdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Searchable Dropdown
            </h2>
            <Dropdown
              label="Select Country"
              options={countries}
              value={searchableValue}
              onChange={setSearchableValue}
              placeholder="Search country..."
              searchable
              renderOption={(option, isSelected) => (
                <>
                  <span className="text-xl mr-2">{option.code}</span>
                  <span className={isSelected ? 'font-medium' : ''}>
                    {option.label}
                  </span>
                </>
              )}
            />
            <p className="mt-2 text-sm text-gray-500">
              Selected: {searchableValue || 'None'}
            </p>
          </div>

          {/* Clearable Dropdown */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Clearable Dropdown
            </h2>
            <Dropdown
              label="Select Option"
              options={basicOptions}
              value={clearableValue}
              onChange={setClearableValue}
              placeholder="Choose an option"
              clearable
              helperText="You can clear the selection"
            />
            <p className="mt-2 text-sm text-gray-500">
              Selected: {clearableValue || 'None'}
            </p>
          </div>

          {/* Custom Rendering */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Custom Rendering
            </h2>
            <Dropdown
              label="Supply Category"
              options={categories}
              value={categoryValue}
              onChange={setCategoryValue}
              placeholder="Select category"
              searchable
              clearable
              renderOption={(option, isSelected) => (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div className="flex-1">
                    <span className={isSelected ? 'font-medium' : ''}>
                      {option.name}
                    </span>
                  </div>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: option.color }}
                  />
                </div>
              )}
              renderValue={(option) => (
                <div className="flex items-center gap-2">
                  <span className="text-xl">{option.icon}</span>
                  <span className="font-medium">{option.name}</span>
                </div>
              )}
            />
            <p className="mt-2 text-sm text-gray-500">
              Selected: {categoryValue || 'None'}
            </p>
          </div>

          {/* Disabled State */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Disabled State
            </h2>
            <Dropdown
              label="Disabled Dropdown"
              options={basicOptions}
              value="option2"
              onChange={() => {}}
              placeholder="Cannot change"
              disabled
              helperText="This dropdown is disabled"
            />
          </div>

          {/* Error State */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Error State
            </h2>
            <Dropdown
              label="Select Option"
              options={basicOptions}
              value={customValue}
              onChange={setCustomValue}
              placeholder="Choose an option"
              required
              error="This field is required"
            />
          </div>

          {/* Loading State */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Loading State
            </h2>
            <Dropdown
              label="Loading Dropdown"
              options={[]}
              value=""
              onChange={() => {}}
              placeholder="Loading..."
              loading
            />
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Empty State
            </h2>
            <Dropdown
              label="Empty Dropdown"
              options={[]}
              value=""
              onChange={() => {}}
              placeholder="No options"
              emptyMessage="No options available"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dropdown;