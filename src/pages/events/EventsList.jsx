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
  Grid,
  Table,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { eventService } from "../../api/index";
import EventForm from "./EventForm";
import EventDetailModal from "./EventDetailModal";
import Button from "../../components/common/Button";
import TitleCard from "../../components/common/TitleCard";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TableComponent from "../../components/common/NewTable";
import Pagination from "../../components/common/Pagination";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

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

// --- EVENT LIST COMPONENT ---
const EventListComponent = ({
  events,
  onEventClick,
  isLoading,
  onViewAll,
  title = "Upcoming Events",
  showViewAll = false,
}) => {
  const displayedEvents = events.slice(0, 100);

  return (
    <TitleCard
      padding="none"
      title={
        <div className="flex items-center justify-between p-5">
          <span>{title}</span>
          {showViewAll && events.length > 10 && (
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
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <LoadingSpinner size="md" />
        </div>
      ) : displayedEvents.length > 0 ? (
        <div className="space-y-3 p-5 overflow-y-auto max-h-[885px]">
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
                    <Tag className="w-3 h-3" />${event.venueFee}
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

          {events.length > 10 && (
            <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing 10 of {events.length} events
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <List className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            No Events
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            There are no upcoming events scheduled.
          </p>
        </div>
      )}
    </TitleCard>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full">
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "calendar" or "list"
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Pagination for list view
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDateEventsModalOpen, setIsDateEventsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [prefilledDate, setPrefilledDate] = useState(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [dateRange, setDateRange] = useState("all");

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
    navigate("/events");
  };

  // Fetch all events with filters
  const fetchAllEvents = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = {
        page: currentPage,
        limit: pageSize,
        sort: "startDate",
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(eventType !== "all" && { type: eventType }),
        ...(dateRange !== "all" && { dateRange }),
      };

      const response = await eventService.getAll(params);

      let eventsData = [];
      let paginationData = {};

      if (response?.data?.events) {
        eventsData = response.data.events;
        paginationData = response.data.pagination || {};
      } else if (response?.events) {
        eventsData = response.events;
        paginationData = response.pagination || {};
      } else if (Array.isArray(response?.data)) {
        eventsData = response.data;
      } else if (Array.isArray(response)) {
        eventsData = response;
      }

      console.log("📅 All events loaded:", eventsData);

      // Sort events by start date
      const sortedEvents = eventsData.sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );

      setEvents(sortedEvents);

      // Filter upcoming events (from today onwards)
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcoming = sortedEvents
        .filter((event) => {
          if (!event.startDate) return false;
          const eventDate = new Date(event.startDate);
          return (
            eventDate >= now &&
            event.status !== "completed" &&
            event.status !== "cancelled"
          );
        })
        .slice(0, 100);

      setUpcomingEvents(upcoming);

      // Set pagination data
      setTotalPages(paginationData.pages || paginationData.totalPages || 1);
      setTotalItems(paginationData.total || eventsData.length);
      setHasInitialLoad(true);
    } catch (error) {
      console.error("Failed to load events:", error);
      toast.error("Failed to load events");
      setEvents([]);
      setUpcomingEvents([]);
      setHasInitialLoad(true);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, search, status, eventType, dateRange]);

  // Combined refresh function
  const refreshAllData = useCallback(() => {
    fetchAllEvents();
  }, [fetchAllEvents]);

  // Initial data loading
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Filter handlers
  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setEventType("all");
    setDateRange("all");
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    eventType !== "all" ||
    dateRange !== "all";
  const showEmptyState =
    !isLoading && events.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults =
    !isLoading && events.length === 0 && hasActiveFilters && hasInitialLoad;

  // Table columns for list view
  const tableColumns = [
    {
      header: "Event Title",
      accessor: "title",
      sortable: true,
      width: "25%",
      render: (row) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.title}
        </div>
      ),
    },
    {
      header: "Client",
      accessor: "client",
      sortable: true,
      width: "20%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.client?.name || "Unknown Client"}
        </div>
      ),
    },
    {
      header: "Date & Time",
      accessor: "startDate",
      sortable: true,
      width: "15%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {formatDateTime(row.startDate)}
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      sortable: true,
      width: "12%",
      render: (row) => (
        <Badge variant={getTypeColor(row.type)}>{row.type || "Other"}</Badge>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "12%",
      render: (row) => (
        <Badge variant={getStatusColor(row.status)}>{row.status}</Badge>
      ),
    },
    {
      header: "Guests",
      accessor: "guestCount",
      sortable: true,
      width: "8%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.guestCount || "-"}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      width: "8%",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(row);
            }}
            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
            title="View Event"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditEvent(row._id);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            title="Edit Event"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

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
    setEditingEventId(null);
    setPrefilledDate(date);
    setShowEventModal(true);
    setIsDateEventsModalOpen(false);
  };

  const handleEditEvent = (eventId) => {
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

  // Event type colors for legend
  const eventTypeColors = [
    { type: "Wedding", color: "bg-purple-500" },
    { type: "Corporate", color: "bg-blue-500" },
    { type: "Birthday", color: "bg-pink-500" },
    { type: "Conference", color: "bg-green-500" },
    { type: "Party/Social", color: "bg-orange-500" },
    { type: "Other", color: "bg-gray-500" },
  ];

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
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
            View and manage your venue events{" "}
            {hasInitialLoad &&
              totalItems > 0 &&
              `- Showing ${events.length} of ${totalItems} events`}
          </p>
        </div>
        {!showEmptyState && (
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "calendar"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Grid className="w-4 h-4" />
                Calendar
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Table className="w-4 h-4" />
                List
              </button>
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
        )}
      </div>

      {/* Search & Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Search}
                placeholder="Search events by title, description, or location..."
                value={search}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>

            <div className="sm:w-48">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Filter}
                value={status}
                onChange={(e) => {
                  setCurrentPage(1);
                  setStatus(e.target.value);
                }}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "draft", label: "Draft" },
                  { value: "pending", label: "Pending" },
                  { value: "confirmed", label: "Confirmed" },
                  { value: "in-progress", label: "In Progress" },
                  { value: "completed", label: "Completed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
              />
            </div>

            <div className="sm:w-48">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                value={eventType}
                onChange={(e) => {
                  setCurrentPage(1);
                  setEventType(e.target.value);
                }}
                options={[
                  { value: "all", label: "All Types" },
                  { value: "wedding", label: "Wedding" },
                  { value: "corporate", label: "Corporate" },
                  { value: "birthday", label: "Birthday" },
                  { value: "conference", label: "Conference" },
                  { value: "party", label: "Party" },
                  { value: "social", label: "Social" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            <div className="sm:w-48">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                value={dateRange}
                onChange={(e) => {
                  setCurrentPage(1);
                  setDateRange(e.target.value);
                }}
                options={[
                  { value: "all", label: "All Dates" },
                  { value: "today", label: "Today" },
                  { value: "tomorrow", label: "Tomorrow" },
                  { value: "thisWeek", label: "This Week" },
                  { value: "nextWeek", label: "Next Week" },
                  { value: "thisMonth", label: "This Month" },
                  { value: "past", label: "Past Events" },
                  { value: "upcoming", label: "Upcoming" },
                ]}
              />
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Active filters:</span>
              {search.trim() && (
                <Badge color="blue">Search: "{search.trim()}"</Badge>
              )}
              {status !== "all" && (
                <Badge color="purple">Status: {status}</Badge>
              )}
              {eventType !== "all" && (
                <Badge color="green">Type: {eventType}</Badge>
              )}
              {dateRange !== "all" && (
                <Badge color="orange">Date: {dateRange}</Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !hasInitialLoad && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Loading events...
          </p>
        </div>
      )}

      {viewMode === "calendar" ? (
        /* CALENDAR VIEW */
        <div className="">
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

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <div className="flex flex-row gap-5 w-full">
              {/* Event Type Legend */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 border border-green-500 w-1/4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Event types:
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {eventTypeColors.map((item) => (
                    <div key={item.type} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${item.color}`}></div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Calendar Grid */}
              <div className="grid grid-cols-8 gap-1 border border-gray-200 rounded-md p-4  w-full">
                {/* Week day headers */}
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-700 dark:text-gray-300 py-2 border-b border-gray-200 dark:border-gray-700"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="p-1" />;
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
                          relative p-1 min-h-[60px] rounded-lg border transition-all text-left
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
                      <div className="absolute top-1 right-1">
                        <span
                          className={`
                            text-xs font-semibold
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
                        <div className="mt-4 space-y-0.5">
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
                              <span className="truncate block text-[10px]">
                                {event.type || "Other"}
                              </span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1 font-medium">
                              +{dayEvents.length - 2}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-6">
          <div>
            {/* No Results from Search/Filter */}
            {showNoResults && (
              <div className="text-center py-12">
                <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No events found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  No events match your current search or filter criteria.
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Empty State - No events at all */}
            {showEmptyState && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <CalendarIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No events yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started by creating your first event.
                </p>
                <Button onClick={() => handleCreateEvent()} variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Event
                </Button>
              </div>
            )}

            {/* Events Table */}
            {!showEmptyState && !showNoResults && (
              <TableComponent
                columns={tableColumns}
                data={events}
                loading={isLoading}
                emptyMessage="No events found"
                onRowClick={onEventClick}
                striped={true}
                hoverable={true}
                pagination={true}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setCurrentPage(1);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
