import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Tag,
  X,
  List,
  Grid,
  Table,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { eventService } from "../../api/index";
import EventForm from "./EventForm";
import EventDetailModal from "./EventDetailModal";
import Button from "../../components/common/Button";
import TitleCard from "../../components/common/TitleCard";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import TableComponent from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import { useToast } from "../../context/ToastContext";

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
  const normalizedType = type?.toString().toLowerCase().trim() || "other";
  return colors[normalizedType] || "gray";
};

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
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  return `${day} ${month}`;
};

const formatDateLong = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const weekday = d.toLocaleString("en-GB", { weekday: "long" });
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "long" });
  const year = d.getFullYear();
  return `${weekday}, ${day} ${month} ${year}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
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
                        color={getStatusColor(event.status)}
                        className="text-xs"
                      >
                        {event.status}
                      </Badge>
                      {event.type && (
                        <Badge
                          color={getTypeColor(event.type)}
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

// --- MAIN EVENT LIST COMPONENT ---
const EventList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  // Pagination for list view
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // Modal States
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDateEventsModalOpen, setIsDateEventsModalOpen] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [prefilledDate, setPrefilledDate] = useState(null);
  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    eventId: null,
    eventName: "",
    onConfirm: null,
  });
  // Filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  // Year selector state
  const [showYearSelector, setShowYearSelector] = useState(false);

  // Event handlers
  const onEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
    setIsDateEventsModalOpen(false);
  }, []);

  const onDateClick = useCallback((date) => {
    setSelectedDate(date);
    setIsDateEventsModalOpen(true);
  }, []);

  // Separate fetch functions for list and calendar views
  const fetchEventsForListView = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      // Sort events by start date
      const sortedEvents = eventsData.sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );
      setEvents(sortedEvents);
      setTotalPages(paginationData.totalPages || paginationData.pages || 1);
      setTotalItems(paginationData.total || eventsData.length);
      setHasInitialLoad(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load events. Please try again.";
      setError(errorMessage);
      showError(errorMessage);
      setEvents([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search, status, eventType, dateRange, showError]);

  const fetchEventsForCalendarView = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      // For calendar view, we'll fetch events in batches if needed
      const params = {
        page: 1,
        limit: 100, // Use maximum allowed limit
        sort: "startDate",
        year: year,
        month: month,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(eventType !== "all" && { type: eventType }),
        ...(dateRange !== "all" && { dateRange }),
      };

      const response = await eventService.getAll(params);
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

      // Sort events by start date
      const sortedEvents = eventsData.sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
      );
      setEvents(sortedEvents);
      setTotalItems(eventsData.length);
      setHasInitialLoad(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load events. Please try again.";
      setError(errorMessage);
      showError(errorMessage);
      setEvents([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [currentDate, search, status, eventType, dateRange, showError]);

  // Combined refresh function
  const refreshAllData = useCallback(() => {
    if (viewMode === "list") {
      fetchEventsForListView();
    } else {
      fetchEventsForCalendarView();
    }
  }, [viewMode, fetchEventsForListView, fetchEventsForCalendarView]);

  // Initial data loading and when view mode changes
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Also refresh when currentDate changes in calendar view
  useEffect(() => {
    if (viewMode === "calendar") {
      fetchEventsForCalendarView();
    }
  }, [currentDate, viewMode, fetchEventsForCalendarView]);

  // Filter handlers
  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setEventType("all");
    setDateRange("all");
    setCurrentPage(1);
    showInfo("Filters cleared");
  }, [showInfo]);

  const handleRetry = useCallback(() => {
    setError(null);
    refreshAllData();
    showInfo("Retrying to load events...");
  }, [refreshAllData, showInfo]);

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    eventType !== "all" ||
    dateRange !== "all";
  const showEmptyState =
    !loading && events.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults =
    !loading && events.length === 0 && hasActiveFilters && hasInitialLoad;

  // Delete confirmation handlers
  const showDeleteConfirmation = useCallback((eventId, eventName = "Event") => {
    setConfirmationModal({
      isOpen: true,
      eventId,
      eventName,
      onConfirm: () => handleDeleteConfirm(eventId, eventName),
    });
  }, []);

  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({
      isOpen: false,
      eventId: null,
      eventName: "",
      onConfirm: null,
    });
  }, []);

  const handleDeleteConfirm = useCallback(
    async (eventId, eventName = "Event") => {
      if (!eventId) {
        showError("Invalid event ID");
        return;
      }
      try {
        await promise(eventService.delete(eventId), {
          loading: `Deleting ${eventName}...`,
          success: `${eventName} deleted successfully`,
          error: `Failed to delete ${eventName}`,
        });
        refreshAllData();
        if (selectedEvent?._id === eventId) {
          setSelectedEvent(null);
          setIsDetailsModalOpen(false);
        }
        closeConfirmationModal();
      } catch (err) {
        console.error("Delete event error:", err);
        closeConfirmationModal();
      }
    },
    [refreshAllData, selectedEvent, promise, showError, closeConfirmationModal]
  );

  const handleDeleteEvent = useCallback(
    (eventId, eventName = "Event") => {
      showDeleteConfirmation(eventId, eventName);
    },
    [showDeleteConfirmation]
  );

  const handleCreateEvent = useCallback((date = null) => {
    setSelectedEvent(null);
    setPrefilledDate(date);
    setShowEventModal(true);
    setIsDateEventsModalOpen(false);
  }, []);

  const handleEditEvent = useCallback((event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    setIsDetailsModalOpen(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    refreshAllData();
    setShowEventModal(false);
    setSelectedEvent(null);
    setPrefilledDate(null);
    showSuccess(
      selectedEvent
        ? "Event updated successfully"
        : "Event created successfully"
    );
  }, [refreshAllData, selectedEvent, showSuccess]);

  const handleFormClose = useCallback(() => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setPrefilledDate(null);
  }, []);

  const handleDateEventsModalClose = useCallback(() => {
    setIsDateEventsModalOpen(false);
    setSelectedDate(null);
  }, []);

  // Calendar calculations
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
  const previousMonth = useCallback(() => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  }, [currentDate]);

  const nextMonth = useCallback(() => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  }, [currentDate]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    showInfo("Navigated to today");
  }, [showInfo]);

  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const isToday = useCallback((date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const isSelectedDate = useCallback(
    (date) => {
      if (!selectedDate) return false;
      return (
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear()
      );
    },
    [selectedDate]
  );

  // Year selection handlers
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const handleYearSelect = useCallback(
    (year) => {
      setCurrentDate(new Date(year, currentDate.getMonth(), 1));
      setShowYearSelector(false);
      showInfo(`Navigated to ${year}`);
    },
    [currentDate, showInfo]
  );

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
    { type: "wedding", color: "bg-purple-500", label: "Wedding" },
    { type: "corporate", color: "bg-blue-500", label: "Corporate" },
    { type: "birthday", color: "bg-pink-500", label: "Birthday" },
    { type: "conference", color: "bg-green-500", label: "Conference" },
    { type: "party", color: "bg-orange-500", label: "Party" },
    { type: "social", color: "bg-orange-500", label: "Social" },
    { type: "other", color: "bg-gray-500", label: "Other" },
  ];

  // Handle view mode change
  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    setCurrentPage(1);
    if (mode === "calendar") {
      // Reset to current month when switching to calendar view
      setCurrentDate(new Date());
    }
  }, []);

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
      render: (row) => {
        // Enhanced client name extraction
        const getClientName = (event) => {
          if (!event) return "Unknown Client";

          // Try different possible client data structures
          if (event.client?.name) return event.client.name;
          if (event.clientId?.name) return event.clientId.name;
          if (event.clientName) return event.clientName;
          if (typeof event.client === "string") return event.client;
          if (typeof event.clientId === "string") return "Loading...";

          return "Unknown Client";
        };

        return (
          <div className="text-gray-600 dark:text-gray-400">
            {getClientName(row)}
          </div>
        );
      },
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
        <Badge color={getTypeColor(row.type)}>{row.type || "Other"}</Badge>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "12%",
      render: (row) => (
        <Badge color={getStatusColor(row.status)}>{row.status}</Badge>
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
      width: "10%",
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
              handleEditEvent(row);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            title="Edit Event"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEvent(row._id, row.title || "Event");
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Delete Event"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
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
          event={selectedEvent}
          onSuccess={handleFormSuccess}
          initialDate={prefilledDate}
        />
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-4">
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
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange("list")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Table className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => handleViewModeChange("calendar")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "calendar"
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Grid className="w-4 h-4" />
              Calendar
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
      </div>
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                Error Loading Events
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
            <Button onClick={handleRetry} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </div>
      )}
      {/* Search & Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg mb-6">
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
      {viewMode === "list" ? (
        /* LIST VIEW */
        <div className="space-y-6">
          <div className="dark:bg-gray-800">
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
                  loading={loading}
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
        </div>
      ) : (
        /* CALENDAR VIEW */
        <div className="dark:bg-gray-800">
          <div className="">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatMonthYear(currentDate)}
                </h2>
                {/* Year Selector */}
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowYearSelector(!showYearSelector)}
                    className="flex items-center gap-2"
                  >
                    {currentYear}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  {showYearSelector && (
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 w-32 max-h-60 overflow-y-auto">
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => handleYearSelect(year)}
                          className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 ${
                            year === currentYear
                              ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
                <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-1">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-8">
              {/* Vertical Legend - Left Side */}
              <div className="w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 sticky top-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    Event Types
                  </h3>
                  <div className="space-y-3">
                    {eventTypeColors.map((item) => {
                      const eventsByType = events.filter(
                        (event) =>
                          (event.type || "other").toLowerCase() ===
                          item.type.toLowerCase()
                      );
                      return (
                        <div
                          key={item.type}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors group cursor-pointer"
                          onClick={() => {
                            setEventType(
                              item.type === "all" ? "all" : item.type
                            );
                            setCurrentPage(1);
                            showInfo(`Filtering by ${item.label} events`);
                          }}
                        >
                          <div
                            className={`w-4 h-4 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}
                          ></div>
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {item.label}
                            </span>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {eventsByType.length} events
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Quick Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      This Month
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total Events
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {
                            events.filter((event) => {
                              if (!event.startDate) return false;
                              const eventDate = new Date(event.startDate);
                              return (
                                eventDate.getMonth() ===
                                  currentDate.getMonth() &&
                                eventDate.getFullYear() ===
                                  currentDate.getFullYear()
                              );
                            }).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Upcoming
                        </span>
                        <span className="font-semibold text-orange-600">
                          {
                            events.filter((event) => {
                              if (!event.startDate) return false;
                              const eventDate = new Date(event.startDate);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return eventDate >= today;
                            }).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Calendar Grid - Right Side */}
              <div className="flex-1">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
                    {/* Week day headers */}
                    <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-600">
                      {weekDays.map((day) => (
                        <div
                          key={day}
                          className="text-center py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Calendar days grid */}
                    <div className="grid grid-cols-7 auto-rows-[1fr] min-h-[600px]">
                      {calendarDays.map((date, index) => {
                        if (!date) {
                          return (
                            <div
                              key={`empty-${index}`}
                              className="border-r border-b border-gray-100 dark:border-gray-600 last:border-r-0 bg-gray-50 dark:bg-gray-800"
                            />
                          );
                        }
                        const dayEvents = getEventsForDate(date);
                        const hasEvents = dayEvents.length > 0;
                        const isTodayDate = isToday(date);
                        const isSelected = isSelectedDate(date);
                        const isCurrentMonth =
                          date.getMonth() === currentDate.getMonth();
                        return (
                          <button
                            key={index}
                            onClick={() => onDateClick(date)}
                            className={`
                              relative p-3 border-r border-b border-gray-100 dark:border-gray-600 last:border-r-0
                              transition-all duration-200 text-left group
                              ${
                                isTodayDate
                                  ? "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700"
                                  : isSelected
                                    ? "bg-orange-100/70 dark:bg-orange-900/10 border-orange-300 dark:border-orange-600"
                                    : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                              }
                              ${!isCurrentMonth ? "opacity-40 bg-gray-50 dark:bg-gray-800" : ""}
                            `}
                          >
                            {/* Date number */}
                            <div className="flex items-center justify-between mb-2">
                              <span
                                className={`
                                  text-sm font-medium
                                  ${
                                    isTodayDate
                                      ? "text-orange-700 dark:text-orange-400"
                                      : isSelected
                                        ? "text-orange-600 dark:text-orange-300"
                                        : "text-gray-700 dark:text-gray-300"
                                  }
                                  ${!isCurrentMonth ? "text-gray-400 dark:text-gray-500" : ""}
                                `}
                              >
                                {date.getDate()}
                              </span>
                              {hasEvents && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              )}
                            </div>
                            {/* Events */}
                            {hasEvents && (
                              <div className="space-y-1.5">
                                {dayEvents.slice(0, 3).map((event) => (
                                  <div
                                    key={event.id || event._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEventClick(event);
                                    }}
                                    className={`
                                      ${getTypeClasses(event.type)}
                                      transform group-hover:translate-x-1 transition-transform
                                      cursor-pointer hover:shadow-sm
                                      px-2 py-1 rounded text-[10px] font-medium border
                                    `}
                                    title={`${event.title} (${event.type || "Other"})`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0"></div>
                                      <span className="truncate text-[10px] font-medium flex-1">
                                        {event.title}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                                {dayEvents.length > 3 && (
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400 px-1 font-medium text-center bg-gray-100 dark:bg-gray-600 rounded py-0.5">
                                    +{dayEvents.length - 3} more
                                  </div>
                                )}
                              </div>
                            )}
                            {/* Hover effect */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-orange-300 dark:group-hover:border-orange-600 rounded pointer-events-none transition-colors"></div>
                          </button>
                        );
                      })}
                    </div>
                    {/* Calendar Footer */}
                    <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded"></div>
                            <span>Today</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-200 dark:bg-orange-900 rounded"></div>
                            <span>Selected</span>
                          </div>
                        </div>
                        <div>
                          {
                            events.filter((event) => {
                              if (!event.startDate) return false;
                              const eventDate = new Date(event.startDate);
                              return (
                                eventDate.getMonth() ===
                                  currentDate.getMonth() &&
                                eventDate.getFullYear() ===
                                  currentDate.getFullYear()
                              );
                            }).length
                          }{" "}
                          events this month
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        title="Confirm Deletion"
        size="md"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Event
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete{" "}
                <strong>"{confirmationModal.eventName}"</strong>? This action
                cannot be undone and all associated data will be permanently
                removed.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeConfirmationModal}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmationModal.onConfirm}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Event
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventList;
