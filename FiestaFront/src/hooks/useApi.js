/**
 * ============================================
 * useApi Hook - Simplified API Data Fetching
 * ============================================
 * 
 * Location: src/hooks/useApi.js
 * 
 * This hook eliminates boilerplate for common API operations:
 * - Automatic loading states
 * - Error handling
 * - Data fetching
 * - Success callbacks
 * 
 * Usage Examples:
 * 
 * // Fetch data on mount
 * const { data, loading, error, refetch } = useApi(eventService.getAll);
 * 
 * // Manual trigger (forms, buttons)
 * const { execute, loading } = useApi(eventService.create, { 
 *   manual: true,
 *   onSuccess: (data) => toast.success('Created!')
 * });
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export const useApi = (apiFunction, options = {}) => {
  const {
    manual = false,           // If true, don't fetch on mount
    initialParams = [],       // Initial parameters for the API call
    onSuccess = null,         // Callback on success
    onError = null,           // Callback on error
    deps = [],                // Dependencies to refetch
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!manual);
  const [error, setError] = useState(null);
  
  const mountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Execute the API call
  const execute = useCallback(async (...params) => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const result = await apiFunction(...params);

      if (!mountedRef.current) return;

      setData(result);
      setLoading(false);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      if (!mountedRef.current) return;

      setError(err);
      setLoading(false);

      if (onError) {
        onError(err);
      } else {
        console.error('API Error:', err);
      }

      throw err;
    }
  }, [apiFunction, onSuccess, onError]);

  // Auto-fetch on mount if not manual
  useEffect(() => {
    if (!manual) {
      execute(...initialParams);
    }
  }, [manual, execute, ...deps]);

  // Refetch function (same as execute but clearer name)
  const refetch = useCallback((...params) => {
    return execute(...params);
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
  };
};

// ============================================
// SPECIALIZED HOOKS
// ============================================

/**
 * Hook for list data with pagination
 */
export const useApiList = (apiFunction, options = {}) => {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);

  const { data, loading, error, refetch } = useApi(apiFunction, {
    ...options,
    onSuccess: (result) => {
      // Handle different response structures
      if (result.events) {
        setItems(result.events);
      } else if (result.clients) {
        setItems(result.clients);
      } else if (result.partners) {
        setItems(result.partners);
      } else if (result.payments) {
        setItems(result.payments);
      } else if (result.tasks) {
        setItems(result.tasks);
      } else if (Array.isArray(result)) {
        setItems(result);
      }

      setPagination(result.pagination || null);

      if (options.onSuccess) {
        options.onSuccess(result);
      }
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

/**
 * Hook for single item detail
 */
export const useApiDetail = (apiFunction, id, options = {}) => {
  const [item, setItem] = useState(null);

  const { data, loading, error, refetch } = useApi(
    () => apiFunction(id),
    {
      ...options,
      manual: !id, // Don't fetch if no ID
      deps: [id],
      onSuccess: (result) => {
        // Extract the item from various response structures
        const extractedItem = 
          result.event || 
          result.client || 
          result.partner || 
          result.payment || 
          result.task || 
          result.reminder ||
          result;

        setItem(extractedItem);

        if (options.onSuccess) {
          options.onSuccess(result);
        }
      },
    }
  );

  return {
    item,
    loading,
    error,
    refetch,
    rawData: data,
  };
};

/**
 * Hook for form mutations (create/update/delete)
 */
export const useApiMutation = (apiFunction, options = {}) => {
  const { execute, loading, error } = useApi(apiFunction, {
    manual: true,
    ...options,
  });

  const mutate = useCallback(async (...params) => {
    try {
      const result = await execute(...params);
      return { success: true, data: result };
    } catch (err) {
      return { success: false, error: err };
    }
  }, [execute]);

  return {
    mutate,
    loading,
    error,
  };
};

// ============================================
// USAGE EXAMPLES
// ============================================

/*

// ============================================
// Example 1: Fetch Events List
// ============================================

import { useApiList } from '@/hooks/useApi';
import { eventService } from '@/api/services';

function EventsList() {
  const { items: events, loading, error, refetch } = useApiList(
    () => eventService.getAll({ status: 'active' })
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

// ============================================
// Example 2: Event Detail Page
// ============================================

import { useApiDetail } from '@/hooks/useApi';
import { eventService } from '@/api/services';

function EventDetail() {
  const { id } = useParams();
  const { item: event, loading, error } = useApiDetail(
    eventService.getById,
    id
  );

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!event) return <NotFound />;

  return (
    <div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
    </div>
  );
}

// ============================================
// Example 3: Create Event Form
// ============================================

import { useApiMutation } from '@/hooks/useApi';
import { eventService } from '@/api/services';
import { toast } from 'react-hot-toast';

function CreateEventForm() {
  const navigate = useNavigate();
  
  const { mutate: createEvent, loading } = useApiMutation(
    eventService.create,
    {
      onSuccess: (result) => {
        toast.success('Event created successfully!');
        navigate(`/events/${result.event.id}`);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create event');
      }
    }
  );

  const handleSubmit = async (formData) => {
    const { success } = await createEvent(formData);
    
    if (!success) {
      // Error already handled by onError
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {form fields }
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}
*/
// ============================================
// Example 4: Dashboard with Multiple APIs
// ============================================

import { useApi } from '@/hooks/useApi';
import { dashboardService } from '@/api/services';

function Dashboard() {
  // Stats
  const { data: stats, loading: statsLoading } = useApi(
    dashboardService.getStats
  );

  // Upcoming Events
  const { data: eventsData, loading: eventsLoading } = useApi(
    () => dashboardService.getUpcomingEvents({ limit: 5 })
  );

  // Recent Payments
  const { data: paymentsData, loading: paymentsLoading } = useApi(
    () => dashboardService.getRecentPayments({ limit: 5 })
  );

  const loading = statsLoading || eventsLoading || paymentsLoading;

  if (loading) return <Spinner />;

  return (
    <div>
      <StatsCards stats={stats} />
      <UpcomingEvents events={eventsData?.events} />
      <RecentPayments payments={paymentsData?.payments} />
    </div>
  );
}

// ============================================
// Example 5: Search with Dependencies
// ============================================

import { useApiList } from '@/hooks/useApi';
import { eventService } from '@/api/services';
import { useState } from 'react';

function EventsSearch() {
  const [filters, setFilters] = useState({ search: '', status: 'all' });

  const { items: events, loading } = useApiList(
    () => eventService.getAll(filters),
    {
      deps: [filters], // Refetch when filters change
    }
  );

  return (
    <div>
      <input
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        placeholder="Search events..."
      />
      
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>

      {loading ? <Spinner /> : (
        events.map(event => <EventCard key={event.id} event={event} />)
      )}
    </div>
  );
}

// ============================================
// Example 6: Delete with Optimistic Update
// ============================================

import { useApiMutation, useApiList } from '@/hooks/useApi';
import { eventService } from '@/api/services';
import { toast } from 'react-hot-toast';

function EventsList() {
  const { items: events, refetch } = useApiList(() => 
    eventService.getAll()
  );

  const { mutate: deleteEvent } = useApiMutation(eventService.delete, {
    onSuccess: () => {
      toast.success('Event deleted successfully!');
      refetch(); // Refetch the list
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete event');
    }
  });

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    await deleteEvent(id);
  };

  return (
    <div>
      {events.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <button onClick={() => handleDelete(event.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Example 7: Manual Trigger (Load More)
// ============================================

import { useApi } from '@/hooks/useApi';
import { eventService } from '@/api/services';
import { useState } from 'react';

function EventsLoadMore() {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);

  const { execute: loadMore, loading } = useApi(
    () => eventService.getAll({ page, limit: 10 }),
    {
      manual: true,
      onSuccess: (result) => {
        setEvents(prev => [...prev, ...result.events]);
      }
    }
  );

  useEffect(() => {
    loadMore();
  }, [page]);

  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
      
      <button 
        onClick={() => setPage(p => p + 1)} 
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}

