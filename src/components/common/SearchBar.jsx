import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import Input from './Input';

/**
 * SearchBar Component
 * 
 * Features:
 * - Debounced search
 * - Clear button
 * - Loading indicator
 * - Keyboard shortcuts (Cmd+K/Ctrl+K)
 * - Customizable placeholder and delay
 * 
 * @param {Object} props
 * @param {string} props.value - Current search value
 * @param {function} props.onChange - Callback when search value changes
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.debounceDelay - Debounce delay in milliseconds (default: 300)
 * @param {boolean} props.loading - Loading state for search
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant (sm, md, lg)
 * @param {boolean} props.autoFocus - Auto focus on mount
 * @param {function} props.onFocus - Focus event handler
 * @param {function} props.onBlur - Blur event handler
 */
const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  debounceDelay = 300,
  loading = false,
  className = '',
  size = 'md',
  autoFocus = false,
  onFocus,
  onBlur,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Update internal value when external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounced onChange handler
  useEffect(() => {
    if (internalValue === value) return;

    const timeoutId = setTimeout(() => {
      onChange?.(internalValue);
    }, debounceDelay);

    return () => clearTimeout(timeoutId);
  }, [internalValue, value, onChange, debounceDelay]);

  const handleChange = useCallback((e) => {
    setInternalValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInternalValue('');
    onChange?.('');
  }, [onChange]);

  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  // Keyboard shortcut handler (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('[data-searchbar-input]');
        input?.focus();
      }

      if (e.key === 'Escape' && isFocused) {
        const input = document.querySelector('[data-searchbar-input]');
        input?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Size configurations
  const sizeConfig = {
    sm: {
      inputClass: 'text-sm py-2',
      iconSize: 'w-4 h-4',
      clearButtonSize: 'w-6 h-6'
    },
    md: {
      inputClass: 'text-base py-2.5',
      iconSize: 'w-4 h-4',
      clearButtonSize: 'w-7 h-7'
    },
    lg: {
      inputClass: 'text-lg py-3',
      iconSize: 'w-5 h-5',
      clearButtonSize: 'w-8 h-8'
    }
  };

  const { inputClass, iconSize, clearButtonSize } = sizeConfig[size];

  return (
    <div className={`relative ${className}`}>
      <Input
        data-searchbar-input
        type="text"
        value={internalValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`pr-20 ${inputClass} ${className}`}
        icon={loading ? Loader2 : Search}
        iconClassName={loading ? 'animate-spin' : ''}
        {...props}
      />

      {/* Search actions */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
        {/* Clear button */}
        {internalValue && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className={`${clearButtonSize} flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded`}
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className={`${clearButtonSize} flex items-center justify-center`}>
            <Loader2 className={`${iconSize} animate-spin text-orange-500`} />
          </div>
        )}

        {/* Keyboard shortcut hint (only when not focused and no value) */}
        {!internalValue && !isFocused && !loading && (
          <div className="flex items-center space-x-1 text-xs text-gray-400 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5">
            <kbd className="text-xs font-sans">
              {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </div>
        )}
      </div>

      {/* Active search info */}
      {internalValue && (
        <div className="absolute -bottom-6 left-0 text-xs text-gray-500 dark:text-gray-400">
          Searching for: <span className="font-medium text-gray-700 dark:text-gray-300">"{internalValue}"</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;