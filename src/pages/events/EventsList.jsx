import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  List,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { eventService } from "../../api/index";
import EventForm from "./EventForm";
import EventDetailModal from "./EventDetailModal";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// --- UTILITY FUNCTIONS ---

const getStatusColor = (status) => {
  const colors = {
    draft: "gray",
    pending: "yellow",
    confirmed: "green",
    "in-progress": "blue",
    completed: "blue",
    cancelled: "red",
  };
  return colors[status] || "gray";
};

const getTypeColor = (type) => {
  const colors = {
    wedding: "purple",
    corporate: "blue",
    birthday: "pink",
    conference: "green",
    party: "orange",
    social: "orange",
    other: "gray",
  };
  return colors[type?.toLowerCase()] || "gray";
};

// Fixed function to get complete Tailwind classes
const getTypeClasses = (type) => {
  const normalizedType = type?.toLowerCase() || "other";

  const classes = {
    wedding:
      "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-800",
    corporate:
      "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800",
    birthday:
      "bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700 hover:bg-pink-200 dark:hover:bg-pink-800",
    conference:
      "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800",
    party:
      "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-800",
    social:
      "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-800",
    other:
      "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800",
  };

  return classes[normalizedType] || classes.other;
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateShort = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatDateLong = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// --- UPCOMING EVENTS LIST COMPONENT ---
const UpcomingEventsList = ({ upcomingEvents, onEventClick, isLoading }) => {
  return (
    <Card title="Upcoming Events" className="h-full">
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <LoadingSpinner size="md" />
        </div>
      ) : upcomingEvents.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {upcomingEvents.map((event) => (
            <div
              key={event.id || event._id}
              onClick={() => onEventClick(event)}
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate flex-1 mr-2">
                  {event.title}
                </h4>
                <Badge
                  variant={getStatusColor(event.status)}
                  className="text-xs flex-shrink-0"
                >
                  {event.status}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-3 h-3" />
                  {formatDateShort(event.startDate)}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Clock className="w-3 h-3" />
                  {formatTime(event.startDate)}
                </div>
                {event.type && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Tag className="w-3 h-3" />
                    {event.type}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No upcoming events found.
          </p>
        </div>
      )}
    </Card>
  );
};

// --- ALL FUTURE EVENTS LIST COMPONENT ---
const AllFutureEventsList = ({ futureEvents, onEventClick, isLoading, onViewAll }) => {
  const displayedEvents = futureEvents.slice(0, 10); // Show first 10 events

  return (
    <Card 
      title={
        <div className="flex items-center justify-between">
          <span>All Future Events</span>
          {futureEvents.length > 10 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="text-xs"
            >
              View All
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      } 
      className="h-full"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <LoadingSpinner size="md" />
        </div>
      ) : displayedEvents.length > 0 ? (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {displayedEvents.map((event) => (
            <div
              key={event.id || event._id}
              onClick={() => onEventClick(event)}
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm flex-1 mr-2 line-clamp-2">
                  {event.title}
                </h4>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge
                    variant={getStatusColor(event.status)}
                    className="text-xs"
                  >
                    {event.status}
                  </Badge>
                  {event.type && (
                    <Badge
                      variant={getTypeColor(event.type)}
                      className="text-xs"
                    >
                      {event.type}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <CalendarIcon className="w-3 h-3" />
                  {formatDateTime(event.startDate)}
                </div>
                
                {event.client && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Users className="w-3 h-3" />
                    {event.client.name || "Unknown Client"}
                  </div>
                )}

                {event.guestCount && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <MapPin className="w-3 h-3" />
                    {event.guestCount} guests
                  </div>
                )}

                {event.venueFee && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Tag className="w-3 h-3" />
                    ${event.venueFee}
                  </div>
                )}
              </div>

              {event.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
          ))}
          
          {futureEvents.length > 10 && (
            <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing 10 of {futureEvents.length} events
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <List className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            No Future Events
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            There are no events scheduled for the future.
          </p>
        </div>
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
  onCreateEvent,
}) => {
  if (!isOpen || !selectedDate) return null;

  const dateEvents = events.filter((event) => {
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
              {formatDateLong(selectedDate)}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {dateEvents.length} event{dateEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {dateEvents.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {dateEvents.map((event) => (
                <div
                  key={event.id || event._id}
                  onClick={() => onEventClick(event)}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base flex-1 mr-2">
                      {event.title}
                    </h3>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge
                        variant={getStatusColor(event.status)}
                        className="text-xs"
                      >
                        {event.status}
                      </Badge>
                      {event.type && (
                        <Badge
                          variant={getTypeColor(event.type)}
                          className="text-xs"
                        >
                          {event.type}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      {formatTime(event.startDate)}
                      {event.endDate && ` - ${formatTime(event.endDate)}`}
                    </div>

                    {event.client && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        Client: {event.client.name || "Unknown"}
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
              <Plus className="h-4 w-4" />
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
  const [futureEvents, setFutureEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(true);
  const [isFutureLoading, setIsFutureLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

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
    setIsDateEventsModalOpen(false);
  };

  const onDateClick = (date) => {
    setSelectedDate(date);
    setIsDateEventsModalOpen(true);
  };

  const onViewAllEvents = () => {
    navigate('/events'); // Navigate to the main events list page
  };

  // Fetch calendar events for the current month
  const fetchCalendarEvents = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await eventService.getAll({
        page: 1,
        limit: 100,
      });

      let eventsData = [];
      if (response?.data?.events) {
        eventsData = response.data.events;
      } else if (response?.events) {
        eventsData = response.events;
      } else if (Array.isArray(response?.data)) {
        eventsData = response.data;
      } else if (Array.isArray(response)) {
        eventsData = response;
      }

      console.log("📅 Calendar events loaded:", eventsData);

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

      const monthEvents = eventsData.filter((event) => {
        if (!event.startDate) return false;
        const eventDate = new Date(event.startDate);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      });

      setEvents(monthEvents);
    } catch (error) {
      console.error("Failed to load calendar events:", error);
      toast.error("Failed to load calendar events");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  // Fetch upcoming events (next 30 days)
  const fetchUpcomingEvents = useCallback(async () => {
    try {
      setIsUpcomingLoading(true);

      const response = await eventService.getAll({
        page: 1,
        limit: 10,
      });

      let eventsData = [];
      if (response?.data?.events) {
        eventsData = response.data.events;
      } else if (response?.events) {
        eventsData = response.events;
      } else if (Array.isArray(response?.data)) {
        eventsData = response.data;
      } else if (Array.isArray(response)) {
        eventsData = response;
      }

      console.log("📅 Upcoming events loaded:", eventsData);

      // Filter upcoming events (next 30 days)
      const now = new Date();
      const thirtyDaysFromNow = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      const upcoming = eventsData
        .filter((event) => {
          if (!event.startDate) return false;
          const eventDate = new Date(event.startDate);
          return (
            eventDate >= now &&
            eventDate <= thirtyDaysFromNow &&
            event.status !== "completed" &&
            event.status !== "cancelled"
          );
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 7);

      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error("Failed to load upcoming events:", error);
      toast.error("Failed to load upcoming events");
      setUpcomingEvents([]);
    } finally {
      setIsUpcomingLoading(false);
    }
  }, []);

  // Fetch all future events (after today)
  const fetchFutureEvents = useCallback(async () => {
    try {
      setIsFutureLoading(true);

      const response = await eventService.getAll({
        page: 1,
        limit: 50, // Increased limit for future events
      });

      let eventsData = [];
      if (response?.data?.events) {
        eventsData = response.data.events;
      } else if (response?.events) {
        eventsData = response.events;
      } else if (Array.isArray(response?.data)) {
        eventsData = response.data;
      } else if (Array.isArray(response)) {
        eventsData = response;
      }

      console.log("📅 Future events loaded:", eventsData);

      // Filter all future events (after today)
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today

      const future = eventsData
        .filter((event) => {
          if (!event.startDate) return false;
          const eventDate = new Date(event.startDate);
          return (
            eventDate >= now &&
            event.status !== "completed" &&
            event.status !== "cancelled"
          );
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

      setFutureEvents(future);
    } catch (error) {
      console.error("Failed to load future events:", error);
      toast.error("Failed to load future events");
      setFutureEvents([]);
    } finally {
      setIsFutureLoading(false);
    }
  }, []);

  // Combined refresh function
  const refreshAllData = useCallback(() => {
    fetchCalendarEvents();
    fetchUpcomingEvents();
    fetchFutureEvents();
  }, [fetchCalendarEvents, fetchUpcomingEvents, fetchFutureEvents]);

  // Initial data loading
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

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

  const getEventsForDate = useCallback(
    (date) => {
      if (!date) return [];

      return events
        .filter((event) => {
          if (!event.startDate) return false;
          const eventDate = new Date(event.startDate);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    [events]
  );

  // Navigation handlers
  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleCreateEvent = (date = null) => {
    console.log("Create event with date:", date);
    setEditingEventId(null);
    setPrefilledDate(date);
    setShowEventModal(true);
    setIsDateEventsModalOpen(false);
  };

  const handleEditEvent = (eventId) => {
    console.log("Edit event:", eventId);
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
    toast.success(
      editingEventId
        ? "Event updated successfully"
        : "Event created successfully"
    );
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
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
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
      days.push(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
    }
    return days;
  }, [currentDate, daysInMonth, startingDayOfWeek]);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Event Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage your venue events
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => handleCreateEvent()}
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <div className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatMonthYear(currentDate)}
                </h2>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={previousMonth}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Status Legend */}
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Status Legend
                </h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {[
                    { status: "pending", label: "Pending" },
                    { status: "confirmed", label: "Confirmed" },
                    { status: "in-progress", label: "In Progress" },
                    { status: "completed", label: "Completed" },
                    { status: "cancelled", label: "Cancelled" },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center gap-2">
                      <Badge
                        variant={getStatusColor(item.status)}
                        className="!px-1 !py-1"
                      >
                        <div className="w-2 h-2 rounded-full bg-current opacity-75"></div>
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {/* Week day headers */}
                    {weekDays.map((day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300 py-3 border-b border-gray-200 dark:border-gray-700"
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
                                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                : isSelected
                                  ? "border-orange-300 bg-orange-100/50 dark:bg-orange-900/10"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }
                            ${date.getMonth() !== currentDate.getMonth() ? "opacity-40" : ""}
                          `}
                        >
                          <div className="absolute top-2 right-2">
                            <span
                              className={`
                              text-sm font-semibold
                              ${
                                isTodayDate
                                  ? "text-orange-700 dark:text-orange-400"
                                  : "text-gray-700 dark:text-gray-300"
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
                                  key={event.id || event._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick(event);
                                  }}
                                  className={getTypeClasses(event.type)}
                                  title={`${event.title} (${event.type || "Other"})`}
                                >
                                  <span className="truncate block text-xs">
                                    {event.type || "Other"}
                                  </span>
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

        {/* Right Column: Upcoming Events & All Future Events */}
        <div className="space-y-6">
          <UpcomingEventsList
            upcomingEvents={upcomingEvents}
            onEventClick={onEventClick}
            isLoading={isUpcomingLoading}
          />
          
          <AllFutureEventsList
            futureEvents={futureEvents}
            onEventClick={onEventClick}
            isLoading={isFutureLoading}
            onViewAll={onViewAllEvents}
          />
        </div>
      </div>
    </div>
  );
};

export default EventList;