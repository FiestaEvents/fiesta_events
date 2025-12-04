import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  X,
  List,
  Grid,
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FolderOpen,
  Filter,
} from "lucide-react";

// ✅ API & Services
import { eventService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Badge, { StatusBadge } from "../../components/common/Badge";
import TableComponent from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import DateInput from "../../components/common/DateInput"; // Ensure this exists
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";

// ✅ Contexts & Modals
import { useToast } from "../../context/ToastContext";
import EventDetailModal from "./EventDetailModal";

// --- UTILITY FUNCTIONS ---

const getTypeVariant = (type) => {
  const map = {
    wedding: "purple",
    corporate: "info",
    birthday: "warning",
    conference: "success",
    party: "warning",
    social: "warning",
    other: "secondary",
  };
  return map[type?.toLowerCase()] || "secondary";
};

const formatDateTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatDateLong = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
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

// --- DATE EVENTS MODAL ---
const DateEventsModal = ({
  isOpen,
  onClose,
  selectedDate,
  events,
  onEventClick,
  onCreateEvent,
}) => {
  const { t } = useTranslation();
  if (!selectedDate) return null;

  const dateEvents = events.filter((event) => {
    const eventDate = new Date(event.startDate);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formatDateLong(selectedDate)}
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
          {dateEvents.length}{" "}
          {dateEvents.length !== 1
            ? t("eventList.calendar.events")
            : t("eventList.calendar.event")}
        </p>

        {dateEvents.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {dateEvents.map((event) => (
              <div
                key={event.id || event._id}
                onClick={() => onEventClick(event)}
                className="p-4 bg-white dark:bg-gray-700/50 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all border border-gray-200 dark:border-gray-600 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate pr-2">
                    {event.title}
                  </h3>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <StatusBadge status={event.status} size="xs" />
                    <Badge variant={getTypeVariant(event.type)} size="xs">
                      {event.type}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(event.startDate)}
                    {event.endDate && ` - ${formatTime(event.endDate)}`}
                  </div>
                  {event.clientId?.name && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Users className="w-3.5 h-3.5" />
                      {event.clientId.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {t("eventList.dateEventsModal.noEventsMessage")}
            </p>
          </div>
        )}

        <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
          <Button
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={() => onCreateEvent(selectedDate)}
            className="w-full justify-center"
          >
            {t("eventList.actions.createEventOnDate")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// --- MAIN EVENT LIST COMPONENT ---
const EventList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("calendar");
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDateEventsModalOpen, setIsDateEventsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [eventType, setEventType] = useState("all");

  // ✅ New Date Range State
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Local state for the inputs (buffers changes until "Apply" is clicked)
  const [localStatus, setLocalStatus] = useState(status);
  const [localEventType, setLocalEventType] = useState(eventType);
  const [localStartDate, setLocalStartDate] = useState(filterStartDate);
  const [localEndDate, setLocalEndDate] = useState(filterEndDate);

  // Sync local state with active state when panel opens
  useEffect(() => {
    if (isFilterOpen) {
      setLocalStatus(status);
      setLocalEventType(eventType);
      setLocalStartDate(filterStartDate);
      setLocalEndDate(filterEndDate);
    }
  }, [isFilterOpen, status, eventType, filterStartDate, filterEndDate]);

  const handleApplyFilters = () => {
    setStatus(localStatus);
    setEventType(localEventType);
    setFilterStartDate(localStartDate);
    setFilterEndDate(localEndDate);
    setCurrentPage(1);
    setIsFilterOpen(false);
    showSuccess(
      t("eventList.notifications.filtersApplied") || "Filters applied"
    );
  };

  const handleResetLocalFilters = () => {
    setLocalStatus("all");
    setLocalEventType("all");
    setLocalStartDate("");
    setLocalEndDate("");
  };

  // Calendar helpers
  const currentYear = currentDate.getFullYear();
  // Generate a range of years for the dropdown (e.g., current year +/- 5 years)
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const eventTypeColors = [
    {
      type: "wedding",
      color: "bg-purple-500",
      label: t("eventList.filters.wedding"),
    },
    {
      type: "corporate",
      color: "bg-blue-500",
      label: t("eventList.filters.corporate"),
    },
    {
      type: "birthday",
      color: "bg-pink-500",
      label: t("eventList.filters.birthday"),
    },
    {
      type: "conference",
      color: "bg-green-500",
      label: t("eventList.filters.conference"),
    },
    {
      type: "party",
      color: "bg-orange-500",
      label: t("eventList.filters.party"),
    },
    {
      type: "social",
      color: "bg-orange-500",
      label: t("eventList.filters.social"),
    },
    {
      type: "other",
      color: "bg-gray-500",
      label: t("eventList.filters.other"),
    },
  ];

  const weekDays = [
    t("eventList.calendar.weekDays.sun"),
    t("eventList.calendar.weekDays.mon"),
    t("eventList.calendar.weekDays.tue"),
    t("eventList.calendar.weekDays.wed"),
    t("eventList.calendar.weekDays.thu"),
    t("eventList.calendar.weekDays.fri"),
    t("eventList.calendar.weekDays.sat"),
  ];

  // --- Handlers ---

  const onEventClick = useCallback((event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
    setIsDateEventsModalOpen(false);
  }, []);

  const onDateClick = useCallback((date) => {
    setSelectedDate(date);
    setIsDateEventsModalOpen(true);
  }, []);

  // Fetch Logic (List View)
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
        // ✅ Updated to use range
        ...(filterStartDate && { startDate: filterStartDate }),
        ...(filterEndDate && { endDate: filterEndDate }),
      };

      const response = await eventService.getAll(params);
      let eventsData =
        response?.data?.events ||
        response?.events ||
        response?.data ||
        response ||
        [];
      let paginationData =
        response?.data?.pagination || response?.pagination || {};

      setEvents(eventsData);
      setTotalPages(paginationData.totalPages || paginationData.pages || 1);
      setTotalItems(paginationData.total || eventsData.length);
      setHasInitialLoad(true);
    } catch (err) {
      setError(err.message || t("eventList.error.message"));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    search,
    status,
    eventType,
    filterStartDate,
    filterEndDate,
    t,
  ]);

  // Fetch Logic (Calendar View)
  const fetchEventsForCalendarView = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const params = {
        page: 1,
        limit: 100,
        sort: "startDate",
        year: year,
        month: month,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(eventType !== "all" && { type: eventType }),
      };

      const response = await eventService.getAll(params);
      let eventsData =
        response?.data?.events ||
        response?.events ||
        response?.data ||
        response ||
        [];

      setEvents(eventsData);
      setTotalItems(eventsData.length);
      setHasInitialLoad(true);
    } catch (err) {
      setError(err.message || t("eventList.error.message"));
      setEvents([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [currentDate, search, status, eventType, t]);

  const refreshAllData = useCallback(() => {
    if (viewMode === "list") fetchEventsForListView();
    else fetchEventsForCalendarView();
  }, [viewMode, fetchEventsForListView, fetchEventsForCalendarView]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // --- Filter Handlers ---
  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setEventType("all");
    setFilterStartDate("");
    setFilterEndDate("");
    setCurrentPage(1);
    showInfo(t("eventList.notifications.filtersCleared"));
  }, [showInfo, t]);

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    eventType !== "all" ||
    filterStartDate !== "" ||
    filterEndDate !== "";
  const showEmptyState =
    !loading && events.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults =
    !loading && events.length === 0 && hasActiveFilters && hasInitialLoad;
  const showData = !loading && hasInitialLoad && events.length > 0;
  const handleRetry = useCallback(() => {
    setError(null);
    refreshAllData();
    showInfo(t("eventList.notifications.retrying"));
  }, [refreshAllData, showInfo, t]);
  // --- CRUD Handlers ---
  const handleDeleteEvent = useCallback((event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!eventToDelete) return;
    try {
      await promise(eventService.delete(eventToDelete._id), {
        loading: t("eventList.notifications.deletingEvent"),
        success: t("eventList.notifications.eventDeleted"),
        error: t("eventList.notifications.deleteError"),
      });
      refreshAllData();
      setDeleteModalOpen(false);
      setEventToDelete(null);
      if (selectedEvent?._id === eventToDelete._id)
        setIsDetailsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  }, [eventToDelete, promise, t, refreshAllData, selectedEvent]);

  const handleCreateEvent = useCallback(
    (date = null) => {
      setIsDateEventsModalOpen(false);
      navigate("/events/new", { state: { initialDate: date } });
    },
    [navigate]
  );

  const handleEditEvent = useCallback(
    (event) => {
      setIsDetailsModalOpen(false);
      navigate(`/events/${event._id}/edit`);
    },
    [navigate]
  );

  // --- Calendar Logic ---
  const { daysInMonth, startingDayOfWeek } = useMemo(() => {
    const date = currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      daysInMonth: lastDay.getDate(),
      startingDayOfWeek: firstDay.getDay(),
    };
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
    }
    return days;
  }, [currentDate, daysInMonth, startingDayOfWeek]);

  const getEventsForDate = useCallback(
    (date) => {
      if (!date) return [];
      return events
        .filter((event) => {
          if (!event.startDate) return false;
          const eDate = new Date(event.startDate);
          return (
            eDate.getDate() === date.getDate() &&
            eDate.getMonth() === date.getMonth() &&
            eDate.getFullYear() === date.getFullYear()
          );
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    [events]
  );

  const previousMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    showInfo(t("eventList.notifications.navigatedToToday"));
  };

  // ✅ Updated Year Change Logic
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setCurrentDate(new Date(newYear, currentDate.getMonth(), 1));
  };

  const formatMonth = (date) =>
    date.toLocaleDateString("en-US", { month: "long" });
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

  // --- Table Columns ---
  const tableColumns = [
    {
      header: t("eventList.table.eventTitle"),
      accessor: "title",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.title}
        </span>
      ),
    },
    {
      header: t("eventList.table.client"),
      accessor: "clientId",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400">
          {row.clientId?.name ||
            row.clientName ||
            t("eventList.table.unknownClient")}
        </span>
      ),
    },
    {
      header: t("eventList.table.dateTime"),
      accessor: "startDate",
      sortable: true,
      render: (row) => (
        <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
          {formatDateTime(row.startDate)}
        </span>
      ),
    },
    {
      header: t("eventList.table.type"),
      accessor: "type",
      sortable: true,
      render: (row) => (
        <Badge variant={getTypeVariant(row.type)}>{row.type || "Other"}</Badge>
      ),
    },
    {
      header: t("eventList.table.status"),
      accessor: "status",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: t("eventList.table.guests"),
      accessor: "guestCount",
      width: "100px",
      render: (row) => row.guestCount || "-",
    },
    {
      header: t("eventList.table.actions"),
      accessor: "actions",
      width: "120px",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(row);
            }}
          >
            <Eye className="h-4 w-4 text-orange-500 dark:text-orange-400" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEditEvent(row);
            }}
          >
            <Edit className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteEvent(row);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  // ✅ Unified Pagination Footer
  const renderPagination = () => {
    const start = Math.min((currentPage - 1) * pageSize + 1, totalItems);
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div>
          Showing{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {start}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {end}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {totalItems}
          </span>{" "}
          results
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={null}
            />
          )}
          <div className="flex items-center gap-2">
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 py-1"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      {/* Header & View Controls */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("eventList.title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("eventList.subtitle")}
            {totalItems > 0 &&
              ` • ${t("eventList.showingEvents", { count: events.length, total: totalItems })}`}
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => {
                setViewMode("list");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-700 shadow text-orange-600 dark:text-orange-400" : "text-gray-500 hover:text-gray-700"}`}
            >
              <List className="w-4 h-4" /> {t("eventList.viewMode.list")}
            </button>
            <button
              onClick={() => {
                setViewMode("calendar");
                setCurrentDate(new Date());
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "calendar" ? "bg-white dark:bg-gray-700 shadow text-orange-600 dark:text-orange-400" : "text-gray-500 hover:text-gray-700"}`}
            >
              <Grid className="w-4 h-4" /> {t("eventList.viewMode.calendar")}
            </button>
          </div>

          {/* Create Button (Shows in Calendar view or if data exists) */}
          {(!showEmptyState || viewMode === "calendar") && (
            <Button
              className="shrink-0 whitespace-nowrap"
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={() => handleCreateEvent()}
            >
              {t("eventList.actions.createEvent")}
            </Button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
          <div className="text-red-700 dark:text-red-300 text-sm">{error}</div>
          <Button size="sm" variant="outline" onClick={handleRetry}>
            {t("eventList.actions.retry")}
          </Button>
        </div>
      )}

      {/* ✅ ENHANCED FILTERS (List View) - Search Left, Advanced Right */}
      {hasInitialLoad && !showEmptyState && viewMode === "list" && (
        <div className="relative mb-6 z-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* 1. Search Bar (Far Left) */}
            <div className="w-full sm:max-w-md relative">
              <Input
                icon={Search}
                placeholder={t("eventList.search.placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* 2. Advanced Filters Button (Far Right) */}
            <Button
              variant={hasActiveFilters ? "primary" : "outline"}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 transition-all whitespace-nowrap ${isFilterOpen ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
            >
              <Filter className="w-4 h-4" />
              {t("eventList.actions.advancedFilters") || "Advanced Filters"}
              {hasActiveFilters && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* 3. Expandable Filter Panel (Push Down) */}
          {isFilterOpen && (
            <div className="mt-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t("eventList.filters.filterOptions") || "Filter Options"}
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
                {/* WRAPPER 1: Status */}
                <div className="w-full min-w-0">
                  <Select
                    label={t("eventList.table.status")}
                    value={localStatus}
                    onChange={(e) => setLocalStatus(e.target.value)}
                    options={[
                      { value: "all", label: t("eventList.filters.allStatus") },
                      { value: "draft", label: t("eventList.filters.draft") },
                      {
                        value: "pending",
                        label: t("eventList.filters.pending"),
                      },
                      {
                        value: "confirmed",
                        label: t("eventList.filters.confirmed"),
                      },
                      {
                        value: "completed",
                        label: t("eventList.filters.completed"),
                      },
                      {
                        value: "cancelled",
                        label: t("eventList.filters.cancelled"),
                      },
                    ]}
                    className="w-full"
                  />
                </div>

                {/* WRAPPER 2: Type */}
                <div className="w-full min-w-0">
                  <Select
                    label={t("eventList.table.type")}
                    value={localEventType}
                    onChange={(e) => setLocalEventType(e.target.value)}
                    options={[
                      { value: "all", label: t("eventList.filters.allTypes") },
                      {
                        value: "wedding",
                        label: t("eventList.filters.wedding"),
                      },
                      {
                        value: "corporate",
                        label: t("eventList.filters.corporate"),
                      },
                      {
                        value: "birthday",
                        label: t("eventList.filters.birthday"),
                      },
                      {
                        value: "conference",
                        label: t("eventList.filters.conference"),
                      },
                      { value: "other", label: t("eventList.filters.other") },
                    ]}
                    className="w-full"
                  />
                </div>

                {/* WRAPPER 3: Start Date */}
                <div className="w-full">
                  <DateInput
                    label={t("eventList.filters.startDate")}
                    value={localStartDate}
                    onChange={(e) => setLocalStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* WRAPPER 4: End Date */}
                <div className="w-full">
                  <DateInput
                    label={t("eventList.filters.endDate")}
                    value={localEndDate}
                    onChange={(e) => setLocalEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetLocalFilters}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  {t("eventList.actions.reset") || "Reset"}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="px-6"
                >
                  {t("eventList.actions.applyFilters") || "Apply Filters"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Content Area */}
      <div className="flex-1 flex flex-col relative">
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              {t("eventList.loading.initial")}
            </p>
          </div>
        )}

        {viewMode === "list" ? (
          <>
            {showData && (
              <>
                <TableComponent
                  columns={tableColumns}
                  data={events}
                  loading={loading}
                  onRowClick={onEventClick}
                  pagination={false}
                />
                {renderPagination()}
              </>
            )}
            {showNoResults && (
              <div className="flex flex-col items-center justify-center flex-1 py-12">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
                  <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t("eventList.emptyState.noResultsMessage")}
                </h3>
                <Button onClick={handleClearFilters} variant="outline" icon={X}>
                  {t("eventList.actions.clearAllFilters")}
                </Button>
              </div>
            )}
            {showEmptyState && (
              <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full mb-4">
                  <CalendarIcon
                    className="h-12 w-12 text-orange-500"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t("eventList.emptyState.noEvents")}
                </h3>
                <Button
                  onClick={() => handleCreateEvent()}
                  variant="primary"
                  size="lg"
                  icon={<Plus className="size-4" />}
                >
                  {t("eventList.actions.createFirstEvent")}
                </Button>
              </div>
            )}
          </>
        ) : (
          /* --- CALENDAR VIEW --- */
          <div className="dark:bg-gray-800 h-full">
            {/* ✅ Center-Aligned Month Nav & Year Selector */}

            <div className="flex gap-8">
              {/* Legend (Same as before) */}
              <div className="w-64 flex-shrink-0 hidden lg:block">
                <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 sticky top-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    {t("eventList.calendar.eventTypes")}
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
                            showInfo(
                              t("eventList.notifications.filteringBy", {
                                type: item.label,
                              })
                            );
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
                              {eventsByType.length}{" "}
                              {t("eventList.calendar.events")}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5">
                  <div className="flex-1"></div> {/* Spacer */}
                  <div className="flex items-center gap-4 p-2 rounded-xl shadow-sm ">
                    <button
                      onClick={previousMonth}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-baseline gap-2">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white min-w-[120px] text-center">
                        {formatMonth(currentDate)}
                      </h2>
                      {/* ✅ Year Selector */}
                      <select
                        value={currentYear}
                        onChange={handleYearChange}
                        className="bg-transparent text-lg font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-orange-600 focus:outline-none"
                      >
                        {years.map((year) => (
                          <option
                            key={year}
                            value={year}
                            className="bg-white dark:bg-gray-800"
                          >
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={nextMonth}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1 flex justify-end gap-3">
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      {t("eventList.actions.today")}
                    </Button>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 overflow-hidden">
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
                  <div className="grid grid-cols-7 auto-rows-[1fr] min-h-[600px]">
                    {calendarDays.map((date, index) => {
                      if (!date)
                        return (
                          <div
                            key={`empty-${index}`}
                            className="border-r border-b border-gray-100 dark:border-gray-600 last:border-r-0 bg-gray-50 dark:bg-gray-800"
                          />
                        );
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
                          className={`relative p-3 border-r border-b border-gray-100 dark:border-gray-600 last:border-r-0 transition-all duration-200 text-left group ${isTodayDate ? "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-700" : isSelected ? "bg-orange-100/70 dark:bg-orange-900/10 border-orange-300 dark:border-orange-600" : "bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"} ${!isCurrentMonth ? "opacity-40 bg-gray-50 dark:bg-gray-800" : ""}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-sm font-medium ${isTodayDate ? "text-orange-700 dark:text-orange-400" : isSelected ? "text-orange-600 dark:text-orange-300" : "text-gray-700 dark:text-gray-300"} ${!isCurrentMonth ? "text-gray-400 dark:text-gray-500" : ""}`}
                            >
                              {date.getDate()}
                            </span>
                            {hasEvents && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            )}
                          </div>
                          {hasEvents && (
                            <div className="space-y-1.5">
                              {dayEvents.slice(0, 3).map((event) => (
                                <div
                                  key={event.id || event._id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEventClick(event);
                                  }}
                                  className={`${getTypeClasses(event.type)} transform group-hover:translate-x-1 transition-transform cursor-pointer hover:shadow-sm px-2 py-1 rounded text-[10px] font-medium border`}
                                  title={event.title}
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
                                  {t("eventList.calendar.moreEvents", {
                                    count: dayEvents.length - 3,
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- Modals --- */}
      <DateEventsModal
        isOpen={isDateEventsModalOpen}
        onClose={() => setIsDateEventsModalOpen(false)}
        selectedDate={selectedDate}
        events={events}
        onEventClick={onEventClick}
        onCreateEvent={handleCreateEvent}
      />
      <EventDetailModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        event={selectedEvent}
        onEdit={handleEditEvent}
        refreshData={refreshAllData}
      />
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t("eventList.deleteModal.title")}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">
              {t("eventList.deleteModal.warningMessage")}
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {t("eventList.deleteModal.confirmMessage")}{" "}
            <strong>{eventToDelete?.title}</strong>?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              {t("eventList.actions.cancel")}
            </Button>
            <Button variant="danger" icon={Trash2} onClick={confirmDelete}>
              {t("eventList.actions.deleteEvent")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventList;
