/**
 * ============================================================
 * useApi Hook Suite - Fiesta Version
 * ============================================================
 * * A set of custom React hooks for simplified API interaction:
 * - Automatic loading & error handling
 * - Easy refetch and dependency tracking
 * - Optional manual execution (for forms or buttons)
 * - Unified interface across all pages
 * * Included Hooks:
 * 1. useApi             → Generic fetcher (for one-time or auto calls)
 * 2. usePaginationList  → Fetch paginated lists (events, clients, etc.)
 * 3. useApiDetail       → Fetch single record by ID
 * 4. useApiMutation     → Perform create/update/delete operations
 * * Usage Example:
 * const { data, loading, error, refetch } = useApi(eventService.getAll);
 * * Author: Fiesta Events Team
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// Core Hook: useApi
// ============================================================
export const useApi = (apiFunction, options = {}) => {
  const {
    manual = false, // Don't fetch on mount if true
    initialParams = [], // Default params for auto-fetch
    onSuccess = null, // Optional success callback
    onError = null, // Optional error callback
    deps = [], // Dependencies that trigger refetch
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!manual);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Execute the API call
  const execute = useCallback(
    async (...params) => {
      if (!mountedRef.current) return;

      try {
        setLoading(true);
        setError(null);

        abortControllerRef.current = new AbortController();

        const result = await apiFunction(...params);

        if (!mountedRef.current) return;

        setData(result);
        setLoading(false);

        if (onSuccess) onSuccess(result);
        return result;
      } catch (err) {
        if (!mountedRef.current) return;

        // Check if the error is an AbortError (e.g., component unmounted)
        if (err.name === "AbortError") {
          console.info("API request was cancelled.");
          return;
        }

        setError(err);
        setLoading(false);

        if (onError) {
          onError(err);
        } else {
          // Log errors only if no specific handler is provided
          console.error("API Error:", err);
        }

        throw err;
      }
    },
    [apiFunction, onSuccess, onError]
  );

  // Auto-fetch when not manual
  useEffect(() => {
    if (!manual) {
      execute(...initialParams);
    }
  }, [manual, execute, ...deps]);

  // Alias for clarity
  const refetch = useCallback((...params) => execute(...params), [execute]);

  return { data, loading, error, execute, refetch };
};

// ============================================================
// usePaginationList - For paginated or array data (RENAMED)
// ============================================================
export const usePaginationList = (apiFunction, options = {}) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);

  const { data, loading, error, refetch } = useApi(apiFunction, {
    ...options,
    onSuccess: (result) => {
      // Extract arrays based on response structure
      // Handle nested structure: { data: { tasks: [...], pagination: {...} } }
      if (result?.data?.tasks && Array.isArray(result.data.tasks)) {
        setItems(result.data.tasks);
        setPagination(result.data.pagination || null);
      }
      // Handle direct structure: { tasks: [...], pagination: {...} }
      else if (result?.events) setItems(result.events);
      else if (result?.clients) setItems(result.clients);
      else if (result?.partners) setItems(result.partners);
      else if (result?.payments) setItems(result.payments);
      else if (result?.tasks) setItems(result.tasks);
      else if (Array.isArray(result.data))
        setItems(result.data); // Handle standard { data: [], pagination: {} }
      else if (Array.isArray(result)) setItems(result);

      // Handle pagination (if not already set above)
      if (!result?.data?.pagination) {
        setPagination(result?.pagination || null);
      }

      if (options.onSuccess) options.onSuccess(result);
    },
  });

  return {
    items,
    pagination,
    loading,
    error,
    refetch,
    rawData: data,
  };
};

// ============================================================
// useApiDetail - For single item fetches
// ============================================================
export const useApiDetail = (apiFunction, id, options = {}) => {
  const [item, setItem] = useState(null);

  const { data, loading, error, refetch } = useApi(() => apiFunction(id), {
    ...options,
    manual: !id, // Don’t auto-fetch if ID is missing
    deps: [id],
    onSuccess: (result) => {
      const extracted =
        result?.event ||
        result?.client ||
        result?.partner ||
        result?.payment ||
        result?.task ||
        result?.reminder ||
        result.data || // Handle standard { data: {} } response
        result;

      setItem(extracted);
      if (options.onSuccess) options.onSuccess(result);
    },
  });

  return { item, loading, error, refetch, rawData: data };
};

// ============================================================
// useApiMutation - For POST / PUT / DELETE operations
// ============================================================
export const useApiMutation = (apiFunction, options = {}) => {
  const { execute, loading, error } = useApi(apiFunction, {
    manual: true,
    ...options,
  });

  const mutate = useCallback(
    async (...params) => {
      try {
        const result = await execute(...params);
        // Mutation hooks usually return { success: true } on resolve,
        // but it's often more useful to return the result itself.
        return result;
      } catch (err) {
        // Since useApi throws the error, we re-throw it here for standard error handling in components.
        throw err;
      }
    },
    [execute]
  );

  return { mutate, loading, error };
};
