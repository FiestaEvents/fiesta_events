import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, X, MapPin, Users, Clock, CalendarDays } from 'lucide-react';
import { eventService } from '../../api/index';

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

const getEventDate = (event) => {
  return event.startDate || event.date;
};

const getEventLocation = (event) => {
  if (event.location) return event.location;
  if (event.clientId?.name) return event.clientId.name;
  if (typeof event.clientId === 'string') return event.clientId;
  return 'No location';
};

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getStatusBadgeClass = (status) => {
  const classes = {
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  };
  return classes[status] || classes.draft;
};

const getStatusDotClass = (status) => {
  const classes = {
    confirmed: 'bg-green-500',
    pending: 'bg-yellow-500',
    cancelled: 'bg-red-500',
    completed: 'bg-blue-500',
    draft: 'bg-gray-500'
  };
  return classes[status] || classes.draft;
};

// ===========================================
// COMMON COMPONENTS
// ===========================================

const Card = ({ children, className = '', onClick }) => (
  <div 
    className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', icon, disabled }) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 disabled:hover:bg-orange-500',
    outline: 'border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    danger: 'bg-red-500 text-white hover:bg-red-600 disabled:hover:bg-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 id="modal-title" className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`animate-spin rounded-full border-b-2 border-orange-500 ${sizes[size]}`} />
      <p className="text-gray-600 dark:text-gray-300 mt-4">Loading events...</p>
    </div>
  );
};

const EmptyState = ({ icon, title, description, action }) => (
  <div className="text-center py-8">
    <div className="flex justify-center mb-4">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
        {icon}
      </div>
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
    {action}
  </div>
);

// ===========================================
// CALENDAR PAGE COMPONENT
// ===========================================

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // =======================================
  // DATA FETCHING
  // =======================================

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await eventService.getAll();
      console.log('📅 Raw events response:', response);

      // Handle different API response structures
      let normalizedEvents = [];
      
      if (response.events && Array.isArray(response.events)) {
        // Direct response with events array: { events: [...] }
        normalizedEvents = response.events;
      } else if (response.data?.events && Array.isArray(response.data.events)) {
        // Nested in data: { data: { events: [...] } }
        normalizedEvents = response.data.events;
      } else if (response.data?.data?.events && Array.isArray(response.data.data.events)) {
        // Double nested: { data: { data: { events: [...] } } }
        normalizedEvents = response.data.data.events;
      } else if (Array.isArray(response.data)) {
        // Direct array in data: { data: [...] }
        normalizedEvents = response.data;
      } else if (Array.isArray(response)) {
        // Direct array response: [...]
        normalizedEvents = response;
      }

      console.log('📅 Normalized events:', normalizedEvents);
      setEvents(normalizedEvents);
    } catch (err) {
      console.error('❌ Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // =======================================
  // MEMOIZED DATA
  // =======================================

  // Events for the selected date
  const eventsForDate = useMemo(() => {
    return (events ?? []).filter((event) => {
      const eventDateStr = getEventDate(event);
      if (!eventDateStr) return false;
      
      try {
        const eventDate = new Date(eventDateStr);
        return isSameDay(eventDate, selectedDate);
      } catch {
        return false;
      }
    });
  }, [events, selectedDate]);

  // Events grouped by date for calendar tiles
  const eventsByDate = useMemo(() => {
    const grouped = {};
    (events ?? []).forEach((event) => {
      const eventDateStr = getEventDate(event);
      if (!eventDateStr) return;
      
      try {
        const dateKey = format(new Date(eventDateStr), 'yyyy-MM-dd');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(event);
      } catch (err) {
        console.error('Error formatting event date:', err);
      }
    });
    return grouped;
  }, [events]);

  // =======================================
  // EVENT HANDLERS
  // =======================================

  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
    setDayModalOpen(true);
  }, []);

  const handleEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setDayModalOpen(false);
  }, []);

  const handleCreateEvent = useCallback(() => {
    console.log('Navigate to create event with date:', format(selectedDate, 'yyyy-MM-dd'));
    // TODO: Implement navigation to event creation form
    // Example: navigate('/events/new', { state: { date: format(selectedDate, 'yyyy-MM-dd') } });
  }, [selectedDate]);

  const handleEditEvent = useCallback(() => {
    if (!selectedEvent) return;
    console.log('Navigate to edit event:', selectedEvent._id);
    // TODO: Implement navigation to event edit form
    // Example: navigate(`/events/${selectedEvent._id}/edit`);
  }, [selectedEvent]);

  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent) return;
    if (!window.confirm(`Are you sure you want to delete "${selectedEvent.title}"? This action cannot be undone.`)) return;

    try {
      setDeleting(true);
      
      // Call API to delete event
      await eventService.delete(selectedEvent._id);
      
      console.log('✅ Event deleted:', selectedEvent._id);
      
      // Refresh events list
      await fetchEvents();
      
      // Close modal and clear selection
      setSelectedEvent(null);
      
      // Show success message
      alert('Event deleted successfully!');
    } catch (err) {
      console.error('❌ Error deleting event:', err);
      alert('Failed to delete event. Please try again.');
    } finally {
      setDeleting(false);
    }
  }, [selectedEvent, fetchEvents]);

  // =======================================
  // CALENDAR TILE CONTENT
  // =======================================

  const tileContent = useCallback(
    ({ date, view }) => {
      if (view === 'month') {
        const dateKey = format(date, 'yyyy-MM-dd');
        const dayEvents = eventsByDate[dateKey] || [];

        if (dayEvents.length > 0) {
          return (
            <div className="flex justify-center mt-1 space-x-1">
              {dayEvents.slice(0, 3).map((ev, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full ${getStatusDotClass(ev.status)}`}
                  aria-hidden="true"
                  title={ev.title}
                />
              ))}
              {dayEvents.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400" title={`${dayEvents.length} events`}>
                  +{dayEvents.length - 3}
                </span>
              )}
            </div>
          );
        }
      }
      return null;
    },
    [eventsByDate]
  );

  // =======================================
  // RENDER HELPERS
  // =======================================

  const formatEventTime = (event) => {
    const dateStr = getEventDate(event);
    if (!dateStr) return '';
    
    try {
      if (event.startTime) {
        return event.startTime;
      }
      return format(new Date(dateStr), 'p');
    } catch {
      return '';
    }
  };

  // =======================================
  // RENDER
  // =======================================

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-orange-500" />
            Event Calendar
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            View and manage your event schedule at a glance
          </p>
        </div>
        
        <Button onClick={handleCreateEvent} icon={<Plus className="w-5 h-5" />}>
          Create Event
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button onClick={fetchEvents} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Calendar */}
      <Card className="p-6">
        {loading && !(events ?? []).length ? (
          <LoadingSpinner />
        ) : (
          <div className="calendar-container">
            <Calendar
              onChange={handleDateClick}
              value={selectedDate}
              className="rounded-xl border-0 w-full"
              tileContent={tileContent}
              tileClassName="hover:bg-orange-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            />
          </div>
        )}
      </Card>

      {/* Status Legend */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Status Legend:
          </span>
          {[
            { status: 'confirmed', label: 'Confirmed' },
            { status: 'pending', label: 'Pending' },
            { status: 'completed', label: 'Completed' },
            { status: 'cancelled', label: 'Cancelled' },
            { status: 'draft', label: 'Draft' }
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusDotClass(status)}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Events List for Selected Date */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Events on {format(selectedDate, 'PPPP')}
        </h2>
        
        {(eventsForDate ?? []).length > 0 ? (
          <div className="space-y-3">
            {eventsForDate.map((event) => (
              <Card
                key={event._id}
                className="cursor-pointer hover:shadow-lg transition-all p-4 hover:border-orange-300 dark:hover:border-orange-700"
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`w-1 h-16 rounded-full ${getStatusDotClass(event.status)}`} />
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {event.title}
                        </h3>
                        <div className="flex flex-col gap-1 mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {getEventLocation(event)}
                          </p>
                          {event.guestCount && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {event.guestCount} guests
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatEventTime(event)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(event.status)}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <EmptyState
              icon={<CalendarDays className="w-8 h-8 text-gray-400" />}
              title="No events scheduled"
              description="No events found for this date. Create one to get started."
              action={
                <Button onClick={handleCreateEvent} variant="primary">
                  Create Event
                </Button>
              }
            />
          </Card>
        )}
      </div>

      {/* Day Modal - Shows all events for clicked date */}
      <Modal
        isOpen={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        title={`Events on ${format(selectedDate, 'PPPP')}`}
      >
        <div className="space-y-4">
          {(eventsForDate ?? []).length > 0 ? (
            <>
              {eventsForDate.map((event) => (
                <Card
                  key={event._id}
                  className="cursor-pointer hover:shadow-md transition-shadow p-4"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {getEventLocation(event)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {formatEventTime(event)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
              <Button onClick={handleCreateEvent} className="w-full" variant="primary">
                Create New Event
              </Button>
            </>
          ) : (
            <EmptyState
              icon={<CalendarDays className="w-6 h-6 text-gray-400" />}
              title="No events"
              description="No events scheduled for this day."
              action={
                <Button onClick={handleCreateEvent} className="w-full" variant="primary">
                  Create Event
                </Button>
              }
            />
          )}
        </div>
      </Modal>

      {/* Single Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title="Event Details"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-6">
            {/* Event Title & Status */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {selectedEvent.title}
              </h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(selectedEvent.status)}`}>
                {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
              </span>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {format(new Date(getEventDate(selectedEvent)), 'PPPP')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedEvent.startTime || 'Not specified'}
                    {selectedEvent.endTime && ` - ${selectedEvent.endTime}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getEventLocation(selectedEvent)}
                  </p>
                </div>
              </div>

              {selectedEvent.guestCount && (
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Guest Count</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedEvent.guestCount}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {selectedEvent.description && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
                <p className="text-gray-900 dark:text-white">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Event Type */}
            {selectedEvent.type && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Event Type</p>
                <p className="text-gray-900 dark:text-white capitalize">
                  {selectedEvent.type}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
              <Button 
                onClick={handleEditEvent} 
                className="flex-1"
                icon={<Edit className="w-4 h-4" />}
                disabled={deleting}
              >
                Edit Event
              </Button>
              <Button
                onClick={handleDeleteEvent}
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700 hover:border-red-600 dark:text-red-400 dark:hover:text-red-300"
                icon={<Trash2 className="w-4 h-4" />}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default CalendarPage;