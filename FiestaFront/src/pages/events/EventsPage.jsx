// src/pages/events/EventsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { eventService }from '../../api/index';
import EventDetails from './EventDetails';
import EventForm from './EventForm';
import { PlusIcon, RefreshCwIcon, CalendarIcon } from '../../components/icons/IconComponents';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Search & filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchEvents = useCallback(async () => {
    try {
   //   setLoading(true);
      setError(null);
      
      const params = {
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
        page,
        limit,
      };
      
      console.log('📋 Fetching events with params:', params);
      const response = await eventService.getAll(params);
      console.log('📋 Events API Response:', response);
      
      // Handle the response structure from your API
      if (response && response.events) {
        setEvents(response.events);
        
        // Set pagination data
        if (response.pagination) {
          setTotalPages(response.pagination.pages || 1);
          setTotal(response.pagination.total || response.events.length);
        } else {
          setTotalPages(1);
          setTotal(response.events.length);
        }
      } else {
        // Fallback if response structure is different
        const eventsData = Array.isArray(response) ? response : [];
        setEvents(eventsData);
        setTotalPages(1);
        setTotal(eventsData.length);
      }
      
      console.log('✅ Events loaded successfully:', response.events?.length || 0);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      setError(err.message || 'Failed to load events. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, page, limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleAddEvent = useCallback(() => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  }, []);

  const handleEditEvent = useCallback((event) => {
    setSelectedEvent(event);
    setIsModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewEvent = useCallback((event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedEvent(null);
    setIsModalOpen(false);
    setIsFormOpen(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchEvents();
    handleCloseModal();
  }, [fetchEvents, handleCloseModal]);

  const handleRefresh = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearchChange = useCallback((e) => {
    setPage(1);
    setSearch(e.target.value);
  }, []);

  const handleStatusChange = useCallback((e) => {
    setPage(1);
    setStatus(e.target.value);
  }, []);

  // Stats - calculate from events array
  const totalEvents = total;
  const confirmedEvents = events.filter(e => e.status === 'confirmed').length;
  const pendingEvents = events.filter(e => e.status === 'pending').length;

  // Format date helper
  const formatEventDate = (event) => {
    const date = event.startDate || event.date;
    if (!date) return 'No date';
    
    try {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Get client name - handle nested clientId object
  const getClientName = (event) => {
    if (!event.clientId) return 'No client';
    
    // If clientId is an object with name property
    if (typeof event.clientId === 'object' && event.clientId.name) {
      return event.clientId.name;
    }
    
    // If clientId is just a string
    if (typeof event.clientId === 'string') {
      return event.clientId;
    }
    
    return 'Unknown client';
  };

  // Get guest count
  const getGuestCount = (event) => {
    return event.guestCount || event.guests || 0;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
      case 'completed':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Manage all your venue's events from here.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCwIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleAddEvent}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Events</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalEvents}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Confirmed Events</div>
          <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{confirmedEvents}</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Events</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{pendingEvents}</div>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Search & Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by title or client name..."
              value={search}
              onChange={handleSearchChange}
              aria-label="Search events"
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={status}
              onChange={handleStatusChange}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'completed', label: 'Completed' },
              ]}
              aria-label="Filter by status"
            />
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card className="p-0">
        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p>Loading events...</p>
            </div>
          </div>
        ) : events.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Guests
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {events.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {event.title || 'Untitled'}
                        </span>
                        {event.type && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({event.type})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {formatEventDate(event)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {getClientName(event)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {getGuestCount(event)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge color={getStatusColor(event.status)}>
                          {event.status || 'pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewEvent(event)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleEditEvent(event)}
                          >
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  pageSize={limit}
                  onPageSizeChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400 p-6">
            <CalendarIcon className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-medium mb-2">No events found</p>
            {search || status !== 'all' ? (
              <p className="text-sm mb-4">Try adjusting your filters</p>
            ) : (
              <p className="text-sm mb-4">Get started by creating your first event</p>
            )}
            <Button onClick={handleAddEvent} variant="primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Event
            </Button>
          </div>
        )}
      </Card>

      {/* View Modal */}
      {isModalOpen && selectedEvent && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Event Details">
          <EventDetails event={selectedEvent} onEdit={() => handleEditEvent(selectedEvent)} />
        </Modal>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseModal}
          title={selectedEvent ? 'Edit Event' : 'Add Event'}
        >
          <EventForm
            event={selectedEvent}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default EventsPage;