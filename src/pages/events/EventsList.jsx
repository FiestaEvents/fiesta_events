import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Tag,
  X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { eventService } from '../../api/index';
import EventForm from './EventForm'; 
import EventDetailModal from './EventDetailModal'; 
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';

// --- UTILITY FUNCTIONS ---

const getStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    confirmed: 'blue',
    'in-progress': 'purple',
    completed: 'green',
    cancelled: 'red',
  };
  return colors[status] || 'gray';
};

const getTypeColor = (type) => {
  const colors = {
    wedding: 'purple',
    corporate: 'blue',
    birthday: 'pink',
    conference: 'green',
    social: 'orange',
    other: 'gray',
  };
  return colors[type?.toLowerCase()] || 'gray';
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDateShort = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const formatDateLong = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const UpcomingEventsList = ({ upcomingEvents, onEventClick, isLoading }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upcoming Events</h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
        </div>
      ) : upcomingEvents.length > 0 ? (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {upcomingEvents.map((event) => (
            <div
              key={event._id}
              onClick={() => onEventClick(event)}
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {event.title}
                </h4>
                <Badge color={getStatusColor(event.status)} className="text-xs flex-shrink-0">
                  {event.status}
                </Badge>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-3 h-3" />
                  {formatDateShort(event.startDate)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Tag className="w-3 h-3" />
                  {event.type || 'Other'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">No upcoming events found.</p>
      )}
    </Card>
  );
};

// --- DATE EVENTS MODAL COMPONENT ---

const DateEventsModal = ({ 
  isOpen, 
  onClose, 
  selectedDate, 
  events, 
  onEventClick, 
  onCreateEvent 
}) => {
  if (!isOpen || !selectedDate) return null;

  const dateEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {dateEvents.length} event{dateEvents.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {dateEvents.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {dateEvents.map((event) => (
                <div
                  key={event._id}
                  onClick={() => onEventClick(event)}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                      {event.title}
                    </h3>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        color={getStatusColor(event.status)}
                        className="text-xs"
                      >
                        {event.status}
                      </Badge>
                      <Badge
                        color={getTypeColor(event.type)}
                        className="text-xs"
                      >
                        {event.type || 'Other'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {formatTime(event.startDate)}
                      {event.endDate && ` - ${formatTime(event.endDate)}`}
                    </div>

                    {event.clientId && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        Client: {event.clientId.name || 'Unknown'}
                      </div>
                    )}

                    {event.guestCount && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {event.guestCount} guests
                      </div>
                    )}

                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No events scheduled
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                There are no events scheduled for this date.
              </p>
            </div>
          )}

          {/* Create Event Button */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => onCreateEvent(selectedDate)}
              className="w-full"
            >
              Create Event on This Date
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN CALENDAR COMPONENT ---

const EventList = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  
  // Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDateEventsModalOpen, setIsDateEventsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [prefilledDate, setPrefilledDate] = useState(null);

  const onEventClick = (event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const onDateClick = (date) => {
    setSelectedDate(date);
    setIsDateEventsModalOpen(true);
  };

  // Fetch calendar events for the current month
  const fetchCalendarEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const response = await eventService.getAll({
        page: 1,
        limit: 100,
      });

      console.log('📅 Raw events response:', response);

      // Handle different response structures
      let eventsData = [];
      if (response?.data?.data?.events) {
        eventsData = response.data.data.events;
      } else if (response?.data?.events) {
        eventsData = response.data.events;
      } else if (response?.events) {
        eventsData = response.events;
      } else if (Array.isArray(response?.data)) {
        eventsData = response.data;
      } else if (Array.isArray(response)) {
        eventsData = response;
      }

      console.log('📅 Normalized events:', eventsData);

      // Filter events for current month
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      const monthEvents = eventsData.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      });

      setEvents(monthEvents);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
      toast.error('Failed to load calendar events');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  // Fetch upcoming events
  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setIsUpcomingLoading(true);
      
      const response = await eventService.getAll({
        page: 1,
        limit: 100,
      });

      // Handle different response structures
      let eventsData = [];
      if (response?.data?.data?.events) {
        eventsData = response.data.data.events;
      } else if (response?.data?.events) {
        eventsData = response.data.events;
      } else if (response?.events) {
        eventsData = response.events;
      }

      // Filter upcoming events
      const now = new Date();
      const upcoming = eventsData
        .filter(event => {
          const eventDate = new Date(event.startDate);
          return eventDate >= now && 
                 event.status !== 'completed' && 
                 event.status !== 'cancelled';
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 7);

      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Failed to load upcoming events:', error);
      toast.error('Failed to load upcoming events');
      setUpcomingEvents([]);
    } finally {
      setIsUpcomingLoading(false);
    }
  }, []);

  // Combined refresh function
  const refreshAllData = useCallback(() => {
    fetchCalendarEvents();
    fetchUpcomingEvents();
  }, [fetchCalendarEvents, fetchUpcomingEvents]);

  // Initial data loading
  useEffect(() => {
    fetchCalendarEvents();
  }, [fetchCalendarEvents]);

  useEffect(() => {
    fetchUpcomingEvents();
  }, [fetchUpcomingEvents]);

  // Calendar grid calculations
  const { daysInMonth, startingDayOfWeek } = useMemo(() => {
    const date = currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  }, [currentDate]);

  const getEventsForDate = useCallback((date) => {
    if (!date) return [];
    
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    }).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [events]);

  // Navigation handlers
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleCreateEvent = (date = null) => {
    console.log('Create event with date:', date);
    setEditingEventId(null);
    setPrefilledDate(date);
    setShowEventModal(true);
    setIsDateEventsModalOpen(false); // Close date events modal when creating new event
  };

  const handleEditEvent = (eventId) => {
    console.log('Edit event:', eventId);
    setEditingEventId(eventId);
    setPrefilledDate(null);
    setShowEventModal(true);
    setIsDetailsModalOpen(false);
  };

  const handleFormSuccess = () => {
    refreshAllData();
    setShowEventModal(false);
    setEditingEventId(null);
    setPrefilledDate(null);
    toast.success(editingEventId ? 'Event updated successfully' : 'Event created successfully');
  };

  const handleFormClose = () => {
    setShowEventModal(false);
    setEditingEventId(null);
    setPrefilledDate(null);
  };

  const handleDateEventsModalClose = () => {
    setIsDateEventsModalOpen(false);
    setSelectedDate(null);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };
  
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    }
    return days;
  }, [currentDate, daysInMonth, startingDayOfWeek]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        event={selectedEvent}
        onEdit={handleEditEvent}
        refreshData={refreshAllData}
      />

      {/* Date Events Modal */}
      <DateEventsModal
        isOpen={isDateEventsModalOpen}
        onClose={handleDateEventsModalClose}
        selectedDate={selectedDate}
        events={events}
        onEventClick={onEventClick}
        onCreateEvent={handleCreateEvent}
      />

      {/* Event Form Modal */}
      {showEventModal && (
        <EventForm
          isOpen={showEventModal}
          onClose={handleFormClose}
          eventId={editingEventId}
          onSuccess={handleFormSuccess}
          initialDate={prefilledDate}
        />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Event Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage your venue events</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => handleCreateEvent()}
        >
          Create Event
        </Button>
      </div>

      {/* Legend */}
      <Card className="mb-6">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Status Legend
          </h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              { status: 'pending', label: 'Pending' },
              { status: 'confirmed', label: 'Confirmed' },
              { status: 'in-progress', label: 'In Progress' },
              { status: 'completed', label: 'Completed' },
              { status: 'cancelled', label: 'Cancelled' },
            ].map((item) => (
              <div key={item.status} className="flex items-center gap-2">
                <Badge color={getStatusColor(item.status)} className="!px-1 !py-1">
                  <div className="w-2 h-2 rounded-full bg-current opacity-75"></div>
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatMonthYear(currentDate)}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                  >
                    Today
                  </Button>
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Week day headers */}
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-100 dark:border-gray-700"
                      >
                        {day}
                      </div>
                    ))}

                    {/* Calendar days */}
                    {calendarDays.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="p-2" />;
                      }

                      const dayEvents = getEventsForDate(date);
                      const hasEvents = dayEvents.length > 0;
                      const isTodayDate = isToday(date);
                      const isSelected = isSelectedDate(date);

                      return (
                        <button
                          key={index}
                          onClick={() => onDateClick(date)}
                          className={`
                            relative p-2 min-h-[100px] rounded-lg border-2 transition-all text-left
                            ${
                              isTodayDate
                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                : isSelected
                                ? 'border-orange-300 bg-orange-100/50 dark:bg-orange-900/10'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }
                            ${date.getMonth() !== currentDate.getMonth() ? 'opacity-50' : ''}
                          `}
                        >
                          <div className="absolute top-2 right-2">
                            <span
                              className={`
                              text-sm font-semibold
                              ${
                                isTodayDate
                                  ? 'text-orange-700 dark:text-orange-400'
                                  : 'text-gray-700 dark:text-gray-300'
                              }
                            `}
                            >
                              {date.getDate()}
                            </span>
                          </div>

                          {hasEvents && (
                            <div className="mt-6 space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <div
                                  key={event._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick(event);
                                  }}
                                  className={`
                                    text-xs px-1.5 py-0.5 rounded-md truncate text-left cursor-pointer
                                    bg-${getTypeColor(event.type)}-100 dark:bg-${getTypeColor(event.type)}-900
                                    text-${getTypeColor(event.type)}-800 dark:text-${getTypeColor(event.type)}-200
                                    border border-${getTypeColor(event.type)}-200 dark:border-${getTypeColor(event.type)}-700
                                    hover:bg-${getTypeColor(event.type)}-200 dark:hover:bg-${getTypeColor(event.type)}-800
                                    font-medium
                                  `}
                                  title={`${event.title} (${event.type || 'Other'})`}
                                >
                                  {event.type || 'Other'}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 px-1.5 pt-1 font-medium">
                                  +{dayEvents.length - 2} more
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Upcoming Events */}
        <div className="space-y-6">
          {/* Upcoming Events List */}
          <UpcomingEventsList
            upcomingEvents={upcomingEvents}
            onEventClick={onEventClick}
            isLoading={isUpcomingLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default EventList;