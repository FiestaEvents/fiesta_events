/**
 * ============================================================
 * useApi Hook Suite - Enhanced Production Version
 * ============================================================
 * A comprehensive set of custom React hooks for API interaction
 * 
 * Included Hooks:
 * 1. useApi             → Generic fetcher with caching and retry
 * 2. usePaginationList  → Fetch paginated lists with search/filter
 * 3. useApiDetail       → Fetch single record by ID with cache
 * 4. useApiMutation     → Perform create/update/delete operations
 * 5. useApiInfinite     → Infinite scrolling pagination
 * 6. useApiPolling      → Real-time data polling
 * 7. useApiBulk         → Bulk operations
 * 
 * Features:
 * - Automatic loading & error handling
 * - Request cancellation on unmount
 * - Configurable retry logic
 * - Response caching
 * - Optimistic updates
 * - Dependent queries
 * - Offline support detection
 * 
 * Usage Examples:
 * 
 * // Basic fetch
 * const { data, loading, error, refetch } = useApi(apiService.getItems);
 * 
 * // With parameters and dependencies
 * const { data } = useApi(apiService.getItems, {
 *   params: [filters],
 *   deps: [filters],
 *   cache: true
 * });
 * 
 * // Mutation with optimistic update
 * const { mutate, loading } = useApiMutation(apiService.createItem, {
 *   onSuccess: (data) => toast.success('Created!'),
 *   optimisticUpdate: (oldData, newData) => [...oldData, newData]
 * });
 * 
 * Author: Fiesta Events Team
 * Version: 2.0.0
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ============================================================
// Constants & Utilities
// ============================================================

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Response cache store
const responseCache = new Map();

const getCacheKey = (apiFunction, params = []) => {
  const keyParts = [apiFunction.name, ...params.map(p => 
    typeof p === 'object' ? JSON.stringify(p) : String(p)
  )];
  return keyParts.join('|');
};

const isOnline = () => navigator.onLine;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================
// Core Hook: useApi
// ============================================================

export const useApi = (apiFunction, options = {}) => {
  const {
    manual = false,
    params = [],
    deps = [],
    cache = false,
    cacheDuration = CACHE_DURATION,
    retry = false,
    maxRetries = MAX_RETRIES,
    retryDelay = RETRY_DELAY,
    enabled = true,
    onSuccess = null,
    onError = null,
    onFinally = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!manual && enabled);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);
  const cacheKeyRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  // Execute API call with retry logic
  const execute = useCallback(async (...callParams) => {
    if (!mountedRef.current || !isOnline()) return;

    const actualParams = callParams.length > 0 ? callParams : params;
    const currentCacheKey = cache ? getCacheKey(apiFunction, actualParams) : null;
    cacheKeyRef.current = currentCacheKey;

    // Check cache first
    if (cache && currentCacheKey) {
      const cached = responseCache.get(currentCacheKey);
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data);
        if (onSuccess) onSuccess(cached.data);
        return cached.data;
      }
    }

    let currentRetry = 0;

    const attemptCall = async () => {
      try {
        setLoading(true);
        setError(null);
        setRetryCount(currentRetry);

        abortControllerRef.current = new AbortController();

        const result = await apiFunction(...actualParams);

        if (!mountedRef.current) return;

        setData(result);
        setLoading(false);

        // Cache successful response
        if (cache && currentCacheKey) {
          responseCache.set(currentCacheKey, {
            data: result,
            timestamp: Date.now()
          });
        }

        if (onSuccess) onSuccess(result);
        if (onFinally) onFinally();

        return result;
      } catch (err) {
        if (!mountedRef.current) return;

        if (err.name === "AbortError") {
          console.info("API request was cancelled.");
          return;
        }

        // Retry logic
        if (retry && currentRetry < maxRetries && shouldRetry(err)) {
          currentRetry++;
          setRetryCount(currentRetry);
          await delay(retryDelay * currentRetry);
          return attemptCall();
        }

        setError(err);
        setLoading(false);

        if (onError) {
          onError(err);
        } else {
          console.error("API Error:", err);
        }

        if (onFinally) onFinally();
        throw err;
      }
    };

    return attemptCall();
  }, [apiFunction, params, cache, cacheDuration, retry, maxRetries, retryDelay, onSuccess, onError, onFinally]);

  // Auto-execute when enabled and not manual
  useEffect(() => {
    if (!manual && enabled && mountedRef.current) {
      execute();
    }
  }, [manual, enabled, execute, ...deps]);

  // Refetch with optional cache busting
  const refetch = useCallback(async (bustCache = false) => {
    if (bustCache && cacheKeyRef.current) {
      responseCache.delete(cacheKeyRef.current);
    }
    return execute();
  }, [execute]);

  // Clear cache for this hook
  const clearCache = useCallback(() => {
    if (cacheKeyRef.current) {
      responseCache.delete(cacheKeyRef.current);
    }
  }, []);

  return {
    data,
    loading,
    error,
    retryCount,
    execute,
    refetch,
    clearCache,
    isOnline: isOnline()
  };
};

// ============================================================
// usePaginationList - Enhanced pagination with search/filter
// ============================================================

export const usePaginationList = (apiFunction, options = {}) => {
  const {
    initialPage = 1,
    initialLimit = 20,
    initialFilters = {},
    initialSort = {},
    keepPreviousData = true,
    ...apiOptions
  } = options;

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);

  const previousDataRef = useRef();

  const { data, loading, error, refetch, ...apiRest } = useApi(
    () => apiFunction({
      page: pagination.page,
      limit: pagination.limit,
      ...filters,
      ...sort
    }),
    {
      ...apiOptions,
      deps: [pagination.page, pagination.limit, filters, sort],
      onSuccess: (result) => {
        const extracted = extractItemsAndPagination(result);
        
        if (keepPreviousData && loading && previousDataRef.current) {
          setItems([...previousDataRef.current, ...extracted.items]);
        } else {
          setItems(extracted.items);
        }
        
        setPagination(prev => ({
          ...prev,
          ...extracted.pagination
        }));

        previousDataRef.current = extracted.items;
      }
    }
  );

  // Navigation methods
  const goToPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const updateSort = useCallback((newSort) => {
    setSort(newSort);
  }, []);

  const reset = useCallback(() => {
    setFilters(initialFilters);
    setSort(initialSort);
    setPagination({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      pages: 0
    });
    setItems([]);
  }, [initialFilters, initialSort, initialPage, initialLimit]);

  return {
    items,
    pagination,
    filters,
    sort,
    loading,
    error,
    refetch,
    goToPage,
    setPageSize,
    updateFilters,
    updateSort,
    reset,
    hasNextPage: pagination.page < pagination.pages,
    hasPreviousPage: pagination.page > 1,
    ...apiRest
  };
};

// ============================================================
// useApiDetail - Enhanced single item fetch with cache
// ============================================================

// hooks/useApi.js - FIXED VERSION
export const useApiDetail = (apiMethod, id, options = {}) => {
  const [state, setState] = useState({
    item: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        console.log('🔍 useApiDetail: Fetching data for ID:', id);
        
        const response = await apiMethod(id);
        console.log('🔍 useApiDetail: Raw API Response:', response);
        
        // FIXED: Handle the actual API response structure
        let item = null;
        
        // Your API returns: { client: {...} }
        if (response.client) {
          item = response.client;
        }
        // Fallback: if it's { data: { client: {...} } }
        else if (response.data && response.data.client) {
          item = response.data.client;
        }
        // Fallback: if data is directly the item
        else if (response.data && response.data._id) {
          item = response.data;
        }
        // Fallback: if response is directly the item
        else if (response._id) {
          item = response;
        }
        
        console.log('🔍 useApiDetail: Extracted item:', item);
        
        setState({
          item,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('🔍 useApiDetail: Error:', error);
        setState({
          item: null,
          loading: false,
          error
        });
      }
    };

    if (id && !options.manual) {
      fetchData();
    }
  }, [apiMethod, id, options.manual]);

  const refetch = async () => {
    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await apiMethod(id);
        
        let item = null;
        if (response.client) {
          item = response.client;
        } else if (response.data && response.data.client) {
          item = response.data.client;
        } else if (response.data && response.data._id) {
          item = response.data;
        } else if (response._id) {
          item = response;
        }
        
        setState({
          item,
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          item: null,
          loading: false,
          error
        });
      }
    };

    fetchData();
  };

  return {
    ...state,
    refetch
  };
};
// ============================================================
// useApiMutation - Enhanced mutations with optimistic updates
// ============================================================

export const useApiMutation = (apiFunction, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    onSettled = null,
    optimisticUpdate = null, // Function to update cache optimistically
    invalidateQueries = [], // Queries to invalidate after mutation
    ...apiOptions
  } = options;

  const { execute, loading, error, ...apiRest } = useApi(apiFunction, {
    manual: true,
    ...apiOptions
  });

  const mutate = useCallback(async (data, mutationOptions = {}) => {
    const {
      onSuccess: localSuccess,
      onError: localError,
      optimisticData,
    } = mutationOptions;

    let rollbackData = null;

    // Apply optimistic update if provided
    if (optimisticUpdate && optimisticData) {
      rollbackData = optimisticUpdate(optimisticData);
    }

    try {
      const result = await execute(data);

      if (onSuccess) onSuccess(result, data);
      if (localSuccess) localSuccess(result, data);
      if (onSettled) onSettled(result, data);

      // Invalidate related queries
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach(query => {
          // Implementation depends on your query invalidation system
          console.log(`Invalidate query: ${query}`);
        });
      }

      return result;
    } catch (err) {
      // Rollback optimistic update on error
      if (rollbackData) {
        optimisticUpdate(rollbackData);
      }

      if (onError) onError(err, data);
      if (localError) localError(err, data);
      if (onSettled) onSettled(null, data, err);

      throw err;
    }
  }, [execute, onSuccess, onError, onSettled, optimisticUpdate, invalidateQueries]);

  const mutateAsync = useCallback(async (data, options = {}) => {
    return mutate(data, options);
  }, [mutate]);

  return {
    mutate,
    mutateAsync,
    loading,
    error,
    ...apiRest
  };
};

// ============================================================
// useApiInfinite - Infinite scrolling pagination
// ============================================================

export const useApiInfinite = (apiFunction, options = {}) => {
  const {
    initialPage = 1,
    limit = 20,
    getNextPageParam = (lastPage, allPages) => {
      const pagination = extractPagination(lastPage);
      return pagination.page < pagination.pages ? pagination.page + 1 : undefined;
    },
    ...apiOptions
  } = options;

  const [pages, setPages] = useState([]);
  const [pageParams, setPageParams] = useState([initialPage]);

  const { data, loading, error, refetch, ...apiRest } = useApi(
    () => apiFunction({ page: pageParams[pageParams.length - 1], limit }),
    {
      ...apiOptions,
      deps: [pageParams],
      onSuccess: (result) => {
        setPages(prev => [...prev, result]);
      }
    }
  );

  const fetchNextPage = useCallback(() => {
    const lastPage = pages[pages.length - 1];
    const nextPageParam = getNextPageParam(lastPage, pages);
    if (nextPageParam) {
      setPageParams(prev => [...prev, nextPageParam]);
    }
  }, [pages, getNextPageParam]);

  const fetchPreviousPage = useCallback(() => {
    if (pageParams.length > 1) {
      setPageParams(prev => prev.slice(0, -1));
      setPages(prev => prev.slice(0, -1));
    }
  }, [pageParams.length]);

  const resetPages = useCallback(() => {
    setPages([]);
    setPageParams([initialPage]);
  }, [initialPage]);

  const allItems = useMemo(() => {
    return pages.flatMap(page => extractItems(page));
  }, [pages]);

  const hasNextPage = useMemo(() => {
    const lastPage = pages[pages.length - 1];
    return lastPage ? getNextPageParam(lastPage, pages) !== undefined : false;
  }, [pages, getNextPageParam]);

  return {
    pages,
    items: allItems,
    loading,
    error,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    resetPages,
    hasNextPage,
    hasPreviousPage: pageParams.length > 1,
    ...apiRest
  };
};

// ============================================================
// useApiPolling - Real-time data polling
// ============================================================

export const useApiPolling = (apiFunction, options = {}) => {
  const {
    interval = 5000,
    enabled = true,
    onNewData = null,
    ...apiOptions
  } = options;

  const intervalRef = useRef();
  const previousDataRef = useRef();

  const { data, loading, error, refetch, ...apiRest } = useApi(apiFunction, {
    ...apiOptions,
    onSuccess: (result) => {
      if (onNewData && previousDataRef.current !== undefined) {
        onNewData(result, previousDataRef.current);
      }
      previousDataRef.current = result;
    }
  });

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      refetch();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, refetch]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(refetch, interval);
    }
  }, [interval, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    stopPolling,
    startPolling,
    isPolling: !!intervalRef.current,
    ...apiRest
  };
};

// ============================================================
// useApiBulk - Bulk operations
// ============================================================

export const useApiBulk = (apiFunction, options = {}) => {
  const {
    batchSize = 10,
    onProgress = null,
    ...apiOptions
  } = options;

  const [progress, setProgress] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    percentage: 0
  });
  const [results, setResults] = useState([]);

  const { execute, loading, error, ...apiRest } = useApi(apiFunction, {
    manual: true,
    ...apiOptions
  });

  const executeBulk = useCallback(async (items, itemProcessor = (item) => item) => {
    setProgress({
      total: items.length,
      completed: 0,
      failed: 0,
      percentage: 0
    });
    setResults([]);

    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    const allResults = [];

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchPromises = batch.map(async (item) => {
        try {
          const processedItem = itemProcessor(item);
          const result = await execute(processedItem);
          allResults.push({ success: true, data: result, item });
          return { success: true, data: result };
        } catch (err) {
          allResults.push({ success: false, error: err, item });
          return { success: false, error: err };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);

      const completed = (i + 1) * batchSize;
      const failed = batchResults.filter(r => r.status === 'rejected').length;
      
      setProgress({
        total: items.length,
        completed: Math.min(completed, items.length),
        failed: progress.failed + failed,
        percentage: Math.round((completed / items.length) * 100)
      });

      if (onProgress) {
        onProgress({
          total: items.length,
          completed: Math.min(completed, items.length),
          failed: progress.failed + failed,
          percentage: Math.round((completed / items.length) * 100)
        });
      }
    }

    setResults(allResults);
    return allResults;
  }, [execute, batchSize, onProgress, progress.failed]);

  return {
    executeBulk,
    progress,
    results,
    loading,
    error,
    ...apiRest
  };
};

// ============================================================
// Utility Functions
// ============================================================

const shouldRetry = (error) => {
  // Retry on network errors or 5xx status codes
  if (!error.response) return true;
  const status = error.response.status;
  return status >= 500 || status === 429;
};

const extractItemsAndPagination = (result) => {
  let items = [];
  let pagination = { page: 1, limit: 20, total: 0, pages: 0 };

  // Handle various response structures
  if (result?.data) {
    if (result.data.tasks) items = result.data.tasks;
    else if (result.data.events) items = result.data.events;
    else if (result.data.clients) items = result.data.clients;
    else if (result.data.partners) items = result.data.partners;
    else if (result.data.payments) items = result.data.payments;
    else if (result.data.invoices) items = result.data.invoices;
    else if (Array.isArray(result.data)) items = result.data;
    
    pagination = result.data.pagination || result.pagination || pagination;
  } else {
    if (result?.tasks) items = result.tasks;
    else if (result?.events) items = result.events;
    else if (result?.clients) items = result.clients;
    else if (result?.partners) items = result.partners;
    else if (result?.payments) items = result.payments;
    else if (result?.invoices) items = result.invoices;
    else if (Array.isArray(result)) items = result;
    
    pagination = result?.pagination || pagination;
  }

  return { items: Array.isArray(items) ? items : [], pagination };
};

const extractSingleItem = (result) => {
  if (!result) return null;

  const itemTypes = ['client', 'event', 'partner', 'payment', 'task', 'invoice', 'reminder', 'venue', 'user'];
  
  for (const type of itemTypes) {
    if (result?.data?.[type]) return result.data[type];
    if (result?.[type]) return result[type];
  }

  return result?.data || result;
};

const extractItems = (result) => {
  const { items } = extractItemsAndPagination(result);
  return items;
};

const extractPagination = (result) => {
  const { pagination } = extractItemsAndPagination(result);
  return pagination;
};

// ============================================================
// Export all hooks
// ============================================================

export default useApi;

export {
  useApi as useApiQuery, // Alias for consistency with other libraries
};

// Clear entire cache (useful for logout)
export const clearAllCache = () => {
  responseCache.clear();
};