import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Animations
import {
  Plus,
  List,
  Grid,
  Eye,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  FolderOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// API & Context
import { eventService } from "../../api/index";
import PermissionGuard from "../../components/auth/PermissionGuard";
import { useToast } from "../../context/ToastContext";

// Components
import Button from "../../components/common/Button";
import Badge, { StatusBadge } from "../../components/common/Badge";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import DateInput from "../../components/common/DateInput";
import Modal from "../../components/common/Modal";
import OrbitLoader from "../../components/common/LoadingSpinner";
import EventCalendar from "./components/EventCalendar";
import EventDetailModal from "./EventDetailModal";

// --- Helpers ---
const getTypeVariant = (type) => {
  const map = {
    wedding: "purple",
    corporate: "info",
    birthday: "warning",
    conference: "success",
    party: "warning",
    other: "secondary",
  };
  return map[type?.toLowerCase()] || "secondary";
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EventList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError, promise } = useToast();

  // --- State ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("calendar");
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters State
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Calendar State
  const calendarRef = useRef(null);
  const [calendarTitle, setCalendarTitle] = useState("");
  const [calendarView, setCalendarView] = useState("dayGridMonth");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarRange, setCalendarRange] = useState({
    start: new Date(),
    end: new Date(),
  });

  // Modals
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  // --- Computed Variables ---
  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    eventType !== "all" ||
    filterStartDate !== "" ||
    filterEndDate !== "";

  // Year Options for Dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // --- Fetching Logic ---
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        sort: "startDate",
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(eventType !== "all" && { type: eventType }),
      };

      if (viewMode === "list") {
        params.page = currentPage;
        params.limit = pageSize;
        if (filterStartDate) params.startDate = filterStartDate;
        if (filterEndDate) params.endDate = filterEndDate;
      } else {
        if (calendarRange.start && !isNaN(calendarRange.start.getTime())) {
          params.startDate = calendarRange.start.toISOString();
          params.endDate = calendarRange.end.toISOString();
        }
        params.limit = 2000;
      }

      const response = await eventService.getAll(params);
      const eventsData = response?.data?.events || response?.events || [];
      const paginationData =
        response?.data?.pagination || response?.pagination || {};

      setEvents(eventsData);

      if (viewMode === "list") {
        setTotalPages(
          Math.ceil((paginationData.total || eventsData.length) / pageSize)
        );
        setTotalItems(paginationData.total || eventsData.length);
      }

      setHasInitialLoad(true);
    } catch (err) {
      console.error(err);
      setError(t("eventList.error.message"));
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [
    viewMode,
    currentPage,
    pageSize,
    search,
    status,
    eventType,
    filterStartDate,
    filterEndDate,
    calendarRange,
    t,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [fetchEvents]);

  // --- Handlers ---
  const handleEventDrop = async (info) => {
    const { event } = info;
    const newStart = event.start.toISOString();
    const newEnd = event.end
      ? event.end.toISOString()
      : event.start.toISOString();

    try {
      await eventService.update(event.id, {
        startDate: newStart,
        endDate: newEnd,
      });
      setEvents((prevEvents) =>
        prevEvents.map((evt) => {
          if (evt._id === event.id || evt.id === event.id) {
            return { ...evt, startDate: newStart, endDate: newEnd };
          }
          return evt;
        })
      );
      showSuccess(t("eventList.notifications.rescheduled"));
    } catch (err) {
      info.revert();
      showError(t("eventList.notifications.updateError"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    try {
      await promise(eventService.delete(eventToDelete._id), {
        loading: t("eventList.notifications.deletingEvent", {
          name: eventToDelete.title,
        }),
        success: t("eventList.notifications.eventDeleted", {
          name: eventToDelete.title,
        }),
        error: t("eventList.notifications.deleteError", {
          name: eventToDelete.title,
        }),
      });
      setDeleteModalOpen(false);
      setIsDetailsModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setEventType("all");
    setFilterStartDate("");
    setFilterEndDate("");
    setCurrentPage(1);
    showInfo(t("eventList.notifications.filtersCleared"));
    setIsFilterOpen(false);
  };

  // Calendar Nav
  const handlePrev = () => calendarRef.current?.getApi().prev();
  const handleNext = () => calendarRef.current?.getApi().next();
  const handleToday = () => calendarRef.current?.getApi().today();

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    const api = calendarRef.current.getApi();
    const current = api.getDate();
    current.setFullYear(newYear);
    api.gotoDate(current);
  };

  const handleChangeView = (view) => {
    calendarRef.current?.getApi().changeView(view);
    setCalendarView(view);
  };

  const handleDatesSet = (dateInfo) => {
    setCalendarTitle(dateInfo.view.title);
    setCurrentDate(dateInfo.view.currentStart);
    setCalendarRange({ start: dateInfo.start, end: dateInfo.end });
  };

  // --- Table Columns ---
  const tableColumns = [
    {
      header: t("eventList.table.eventTitle"),
      accessor: "title",
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {row.title}
        </span>
      ),
    },
    {
      header: t("eventList.table.client"),
      accessor: "clientId",
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
      render: (row) => (
        <span className="text-xs font-mono text-gray-500">
          {formatDateTime(row.startDate)}
        </span>
      ),
    },
    {
      header: t("eventList.table.type"),
      accessor: "type",
      render: (row) => (
        <Badge variant={getTypeVariant(row.type)}>
          {row.type || t("eventList.filters.other")}
        </Badge>
      ),
    },
    {
      header: t("eventList.table.status"),
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: t("eventList.table.actions"),
      accessor: "actions",
      className: "text-center",
      width: "120px",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedEvent(row);
              setIsDetailsModalOpen(true);
            }}
          >
            <Eye className="h-4 w-4 text-orange-500" />
          </Button>
          <PermissionGuard permission="events.update.all">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/events/${row._id}/edit`);
              }}
            >
              <Edit className="h-4 w-4 text-blue-500" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="events.delete.all">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setEventToDelete(row);
                setDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-xl shadow-md h-[calc(100vh-100px)] flex flex-col">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("eventList.title")}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {viewMode === "list"
              ? t("eventList.showingEvents", {
                  count: events.length,
                  total: totalItems,
                })
              : t("eventList.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle with Animation */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl">
            {["list", "calendar"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === mode
                    ? "bg-white dark:bg-gray-700 shadow-sm text-orange-600 dark:text-orange-400 transform scale-105"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {mode === "list" ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid className="w-4 h-4" />
                )}
                {t(`eventList.viewMode.${mode}`)}
              </button>
            ))}
          </div>

          <PermissionGuard permission="events.create">
            <Button
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate("/events/new")}
              className="rounded-xl shadow-lg shadow-orange-500/20"
            >
              {t("eventList.actions.createEvent")}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 rounded-xl flex justify-between items-center"
        >
          <span className="text-sm">{error}</span>
          <Button size="sm" variant="outline" onClick={fetchEvents}>
            {t("eventList.actions.retry")}
          </Button>
        </motion.div>
      )}

      {/* 2. CALENDAR CONTROLS */}
      <AnimatePresence mode="wait">
        {viewMode === "calendar" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shrink-0"
          >
            {/* Left: Nav */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm text-gray-600 dark:text-gray-300"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="p-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors shadow-sm text-gray-600 dark:text-gray-300"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={handleToday}
                className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
              >
                {t("eventList.actions.today")}
              </button>
            </div>

            {/* Center: Title & Year */}
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize min-w-[180px] text-center tracking-tight">
                {calendarTitle}
              </h2>
              <select
                value={currentDate.getFullYear()}
                onChange={handleYearChange}
                className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm font-medium cursor-pointer focus:ring-2 focus:ring-orange-500 outline-none shadow-sm transition-all hover:border-orange-400"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Views */}
            <div className="flex bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-1 shadow-sm">
              {[
                { id: "dayGridMonth", label: "month" },
                { id: "timeGridWeek", label: "week" },
                { id: "timeGridDay", label: "day" },
                { id: "listWeek", label: "listWeek" },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() => handleChangeView(view.id)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    calendarView === view.id
                      ? "bg-orange-500 text-white shadow-md transform scale-105"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {t(`eventList.viewMode.${view.label}`, view.label)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. FILTERS (List Mode Only) */}
      <AnimatePresence>
        {viewMode === "list" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-20"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="w-full sm:max-w-md relative">
                <Input
                  icon={Search}
                  placeholder={t("eventList.search.placeholder")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl"
                />
              </div>
              <Button
                variant={hasActiveFilters ? "primary" : "outline"}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 rounded-xl"
              >
                <Filter className="w-4 h-4" />{" "}
                {t("eventList.actions.advancedFilters")}
              </Button>
            </div>
            {isFilterOpen && (
              <div className="mt-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <Select
                    label={t("eventList.search.status")}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: "all", label: t("eventList.filters.allStatus") },
                      {
                        value: "confirmed",
                        label: t("eventList.filters.confirmed"),
                      },
                      {
                        value: "pending",
                        label: t("eventList.filters.pending"),
                      },
                    ]}
                  />
                  <Select
                    label={t("eventList.search.type")}
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
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
                    ]}
                  />
                  <DateInput
                    label={t("eventList.filters.startDate")}
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                  />
                  <DateInput
                    label={t("eventList.filters.endDate")}
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                  />
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <Button variant="outline" onClick={handleClearFilters}>
                    {t("eventList.actions.reset")}
                  </Button>
                  <Button variant="primary" onClick={handleApplyFilters}>
                    {t("eventList.actions.applyFilters")}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. MAIN CONTENT */}
      <div className="flex-1 relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
            <OrbitLoader />
          </div>
        )}

        {viewMode === "list" ? (
          <div className="h-full overflow-y-auto">
            {events.length > 0 ? (
              <Table
                columns={tableColumns}
                data={events}
                onRowClick={(row) => {
                  setSelectedEvent(row);
                  setIsDetailsModalOpen(true);
                }}
                pagination={true}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                striped
                hoverable
              />
            ) : (
              !loading && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <FolderOpen className="w-16 h-16 mb-4 opacity-30 text-orange-500" />
                  <p className="text-lg font-medium">
                    {t("eventList.emptyState.noEvents")}
                  </p>
                  <p className="text-sm">
                    {t("eventList.emptyState.noEventsMessage")}
                  </p>
                </div>
              )
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full overflow-hidden"
          >
            <EventCalendar
              calendarRef={calendarRef}
              events={events}
              onDatesSet={handleDatesSet}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setIsDetailsModalOpen(true);
              }}
              onDateClick={(date) =>
                navigate("/events/new", { state: { initialDate: date } })
              }
              onEventDrop={handleEventDrop}
            />
          </motion.div>
        )}
      </div>

      {/* 5. MODALS */}
      <EventDetailModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        event={selectedEvent}
        onEdit={(e) => {
          setIsDetailsModalOpen(false);
          navigate(`/events/${e._id}/edit`);
        }}
        refreshData={fetchEvents}
      />

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t("eventList.deleteModal.title")}
        size="sm"
      >
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
            <AlertTriangle className="w-6 h-6" />{" "}
            <p className="font-bold">Warning</p>
          </div>
          <p className="text-gray-600">
            {t("eventList.deleteModal.confirmMessage")}{" "}
            <span className="font-bold text-gray-900">
              {eventToDelete?.title}
            </span>
            ?
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              {t("eventList.actions.cancel")}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              {t("eventList.actions.deleteEvent")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventList;
