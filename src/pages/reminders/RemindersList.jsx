import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Edit,
  Trash2,
  Calendar,
  FolderOpen,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  CalendarDays,
  ArrowUpDown,
  ListFilter,
} from "lucide-react";

// ✅ API & Services
import { reminderService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";

// ✅ Context & Sub-components
import { useToast } from "../../context/ToastContext";
import ReminderDetailModal from "./ReminderDetailModal";
import ReminderForm from "./ReminderForm";

const RemindersList = () => {
  const { showSuccess, apiError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================

  // Data
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  // Active Filters (Applied)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
    priority: "all",
    startDate: "",
    endDate: "",
    sortBy: "date",
    sortOrder: "asc",
  });

  // Local Filters (Buffered in UI)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    status: "all",
    type: "all",
    priority: "all",
    startDate: "",
    endDate: "",
    sortBy: "date",
    sortOrder: "asc",
  });

  // Modals
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    id: null,
    name: "",
  });

  // ==========================================
  // SYNC LOCAL FILTERS
  // ==========================================

  // When filter panel opens, sync local state with active state
  useEffect(() => {
    if (isFilterOpen) {
      setLocalFilters({
        status: filters.status,
        type: filters.type,
        priority: filters.priority,
        startDate: filters.startDate,
        endDate: filters.endDate,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });
    }
  }, [isFilterOpen, filters]);

  // ==========================================
  // FILTER HANDLERS
  // ==========================================

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      ...localFilters,
    }));
    setPage(1);
    setIsFilterOpen(false);
    showSuccess(t("reminders.notifications.filtersApplied"));
  };

  const handleResetLocalFilters = () => {
    setLocalFilters({
      status: "all",
      type: "all",
      priority: "all",
      startDate: "",
      endDate: "",
      sortBy: "date",
      sortOrder: "asc",
    });
  };

  const handleClearAllFilters = () => {
    setFilters({
      search: "",
      status: "all",
      type: "all",
      priority: "all",
      startDate: "",
      endDate: "",
      sortBy: "date",
      sortOrder: "asc",
    });
    setPage(1);
    showInfo(t("reminders.notifications.filtersCleared"));
  };

  const handleQuickPreset = (preset) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    let newFilters = {
      ...filters,
      status: "active",
      startDate: "",
      endDate: "",
    };

    switch (preset) {
      case "overdue":
        newFilters.endDate = format(today, "yyyy-MM-dd");
        break;
      case "today":
        newFilters.startDate = format(today, "yyyy-MM-dd");
        newFilters.endDate = format(today, "yyyy-MM-dd");
        break;
      case "tomorrow":
        newFilters.startDate = format(tomorrow, "yyyy-MM-dd");
        newFilters.endDate = format(tomorrow, "yyyy-MM-dd");
        break;
      case "week":
        newFilters.startDate = format(today, "yyyy-MM-dd");
        newFilters.endDate = format(nextWeek, "yyyy-MM-dd");
        break;
      case "urgent":
        newFilters.priority = "urgent";
        break;
      case "completed":
        newFilters.status = "completed";
        break;
      default:
        break;
    }
    setFilters(newFilters);
    setPage(1);
  };

  // ==========================================
  // FETCH DATA
  // ==========================================

  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
        status: filters.status !== "all" ? filters.status : undefined,
        type: filters.type !== "all" ? filters.type : undefined,
        priority: filters.priority !== "all" ? filters.priority : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      };

      const response = await reminderService.getAll(params);
      let data = response?.data?.reminders || response?.reminders || [];

      // Client-side Filter (Search)
      if (filters.search.trim()) {
        const lowerQ = filters.search.toLowerCase();
        data = data.filter(
          (r) =>
            r.title.toLowerCase().includes(lowerQ) ||
            r.description?.toLowerCase().includes(lowerQ)
        );
      }

      // Client-side Sort
      data = sortRemindersData(data, filters.sortBy, filters.sortOrder);

      const totalItems = filters.search.trim()
        ? data.length
        : response?.data?.pagination?.total ||
          response?.pagination?.total ||
          data.length;
      const calculatedTotalPages = Math.ceil(totalItems / limit);

      setReminders(data);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      setTotalCount(totalItems);
    } catch (err) {
      apiError(err, t("reminders.notifications.loadError"));
      setReminders([]);
    } finally {
      setLoading(false);
      setHasInitialLoad(true);
    }
  }, [filters, page, limit, apiError, t]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const sortRemindersData = (data, sortField, order) => {
    return [...data].sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case "date":
          aVal = new Date(a.reminderDate);
          bVal = new Date(b.reminderDate);
          break;
        case "priority":
          const pMap = { urgent: 4, high: 3, medium: 2, low: 1 };
          aVal = pMap[a.priority] || 0;
          bVal = pMap[b.priority] || 0;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  };

  // Client-side slicing
  const paginatedReminders = useMemo(() => {
    if (reminders.length > limit) {
      const startIndex = (page - 1) * limit;
      return reminders.slice(startIndex, startIndex + limit);
    }
    return reminders;
  }, [reminders, page, limit]);

  // ==========================================
  // ACTIONS
  // ==========================================

  const handleDeleteConfirm = async () => {
    try {
      await promise(reminderService.delete(confirmationModal.id), {
        loading: t("reminders.notifications.deleting"),
        success: t("reminders.notifications.deleteSuccess"),
        error: t("reminders.notifications.deleteError"),
      });
      fetchReminders();
      setConfirmationModal({ isOpen: false, id: null, name: "" });
      if (selectedReminder?._id === confirmationModal.id)
        setIsDetailModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (reminder) => {
    try {
      await promise(reminderService.toggleComplete(reminder._id), {
        loading: t("reminders.notifications.updating"),
        success:
          reminder.status === "active"
            ? t("reminders.notifications.markedCompleted")
            : t("reminders.notifications.reactivated"),
        error: t("reminders.notifications.updateError"),
      });
      fetchReminders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    fetchReminders();
    setIsFormOpen(false);
    showSuccess(
      selectedReminder
        ? t("reminders.notifications.updateSuccess")
        : t("reminders.notifications.createSuccess")
    );
  };

  // ==========================================
  // UI HELPERS
  // ==========================================

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.priority !== "all" ||
    filters.startDate !== "" ||
    filters.endDate !== "" ||
    filters.sortBy !== "date"; // Default sort check

  const getTypeColor = (tp) =>
    ({
      event: "primary",
      payment: "warning",
      task: "purple",
      maintenance: "orange",
      followup: "success",
      other: "secondary",
    })[tp] || "secondary";

  const getPriorityColor = (p) =>
    ({
      urgent: "danger",
      high: "warning",
      medium: "info",
      low: "secondary",
    })[p] || "secondary";

  const columns = [
    {
      header: t("reminders.columns.title"),
      accessor: "title",
      width: "25%",
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900 dark:text-white">
            {row.title || t("reminders.untitled")}
          </div>
          {row.description && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-1">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      header: t("reminders.columns.dateTime"),
      accessor: "reminderDate",
      width: "18%",
      render: (row) => {
        const isOverdue =
          new Date(row.reminderDate) < new Date() && row.status === "active";
        return (
          <div
            className={`flex flex-col gap-1 ${isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-sm font-medium">
                {row.reminderDate
                  ? format(new Date(row.reminderDate), "dd/MM/yyyy")
                  : "-"}
              </span>
            </div>
            {row.reminderTime && (
              <div className="flex items-center gap-2 ml-5">
                <Clock className="w-3 h-3" />
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {row.reminderTime}
                </span>
              </div>
            )}
            {isOverdue && (
              <span className="text-xs font-bold ml-5 uppercase tracking-wider">
                {t("reminders.status.overdue")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: t("reminders.columns.type"),
      accessor: "type",
      width: "12%",
      render: (row) => (
        <Badge variant={getTypeColor(row.type)} className="capitalize">
          {t(`reminders.type.${row.type}`)}
        </Badge>
      ),
    },
    {
      header: t("reminders.columns.priority"),
      accessor: "priority",
      width: "12%",
      render: (row) => (
        <Badge
          variant={getPriorityColor(row.priority)}
          className="capitalize font-semibold"
        >
          {t(`reminders.priority.${row.priority}`)}
        </Badge>
      ),
    },
    {
      header: t("reminders.columns.status"),
      accessor: "status",
      width: "12%",
      render: (row) => (
        <Badge
          variant={row.status === "completed" ? "success" : "info"}
          className="capitalize"
        >
          {t(`reminders.status.${row.status}`)}
        </Badge>
      ),
    },
    {
      header: t("reminders.columns.actions"),
      accessor: "actions",
      width: "21%",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleComplete(row);
            }}
            title={
              row.status === "active"
                ? t("reminders.actions.markDone")
                : t("reminders.actions.reactivate")
            }
            className={
              row.status === "completed"
                ? "text-green-600 bg-green-50"
                : "text-gray-400 hover:text-green-600"
            }
          >
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReminder(row);
              setIsDetailModalOpen(true);
            }}
            title={t("reminders.actions.view")}
          >
            <Eye className="w-4 h-4 text-blue-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReminder(row);
              setIsFormOpen(true);
            }}
            title={t("reminders.actions.edit")}
          >
            <Edit className="w-4 h-4 text-green-500" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmationModal({
                isOpen: true,
                id: row._id,
                name: row.title,
              });
            }}
            title={t("reminders.actions.delete")}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[600px] flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-orange-500" />
            {t("reminders.title")}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t("reminders.subtitle")}
            {hasInitialLoad && totalCount > 0 && (
              <span className="ml-2 font-semibold">
                •{" "}
                {t("reminders.notifications.showingResults", {
                  count: paginatedReminders.length,
                  total: totalCount,
                })}
              </span>
            )}
          </p>
        </div>
        {(!loading || hasInitialLoad) && (
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setSelectedReminder(null);
              setIsFormOpen(true);
            }}
          >
            {t("reminders.addReminder")}
          </Button>
        )}
      </div>

      {/* QUICK PRESETS */}
      {hasInitialLoad && reminders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {["overdue", "today", "tomorrow", "week", "urgent", "completed"].map(
            (preset) => (
              <button
                key={preset}
                onClick={() => handleQuickPreset(preset)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-700 dark:bg-gray-700 dark:hover:bg-orange-900/30 dark:text-gray-300 transition-colors border border-transparent hover:border-orange-200"
              >
                {t(`reminders.filters.presets.${preset}`)}
              </button>
            )
          )}
        </div>
      )}

      {/* FILTER BAR */}
      {hasInitialLoad && (
        <div className="relative z-20">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="w-full lg:max-w-md">
              <Input
                icon={Search}
                placeholder={t("reminders.searchPlaceholder")}
                value={filters.search}
                onChange={(e) => {
                  setPage(1);
                  setFilters((p) => ({ ...p, search: e.target.value }));
                }}
              />
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <Button
                variant={isFilterOpen ? "primary" : "outline"}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 whitespace-nowrap ${isFilterOpen ? "ring-2 ring-orange-500 ring-offset-2" : ""}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                {t("reminders.filters.advanced")}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  icon={<X className="w-4 h-4" />}
                  onClick={handleClearAllFilters}
                  className="text-gray-500"
                >
                  {t("reminders.filters.clear")}
                </Button>
              )}
            </div>
          </div>

          {/* ADVANCED FILTERS PANEL */}
          {isFilterOpen && (
            <div className="mt-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <Filter className="w-5 h-5" />
                  <h3 className="text-lg font-bold">
                    {t("reminders.filters.options")}
                  </h3>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Column 1: Status & Type */}
                <div className="space-y-4">
                  <Select
                    label={t("reminders.status.label")}
                    value={localFilters.status}
                    onChange={(e) =>
                      setLocalFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    options={[
                      { value: "all", label: t("reminders.status.all") },
                      { value: "active", label: t("reminders.status.active") },
                      {
                        value: "completed",
                        label: t("reminders.status.completed"),
                      },
                    ]}
                  />
                  <Select
                    label={t("reminders.type.label")}
                    value={localFilters.type}
                    onChange={(e) =>
                      setLocalFilters((p) => ({ ...p, type: e.target.value }))
                    }
                    options={[
                      "all",
                      "event",
                      "payment",
                      "task",
                      "maintenance",
                      "followup",
                      "other",
                    ].map((v) => ({
                      value: v,
                      label: t(`reminders.type.${v}`),
                    }))}
                  />
                </div>

                {/* Column 2: Priority */}
                <div className="space-y-4">
                  <Select
                    label={t("reminders.priority.label")}
                    value={localFilters.priority}
                    onChange={(e) =>
                      setLocalFilters((p) => ({
                        ...p,
                        priority: e.target.value,
                      }))
                    }
                    options={["all", "urgent", "high", "medium", "low"].map(
                      (v) => ({ value: v, label: t(`reminders.priority.${v}`) })
                    )}
                  />
                </div>

                {/* Column 3: Date Range */}
                <div className="md:col-span-2 lg:col-span-1 space-y-4 p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    <CalendarDays className="w-4 h-4 text-orange-500" />{" "}
                    {t("reminders.filters.dateRange")}
                  </label>
                  <div className="space-y-3">
                    <Input
                      type="date"
                      label={t("reminders.filters.startDate")}
                      value={localFilters.startDate}
                      onChange={(e) =>
                        setLocalFilters((p) => ({
                          ...p,
                          startDate: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="date"
                      label={t("reminders.filters.endDate")}
                      value={localFilters.endDate}
                      onChange={(e) =>
                        setLocalFilters((p) => ({
                          ...p,
                          endDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Column 4: Sorting */}
                <div className="md:col-span-2 lg:col-span-1 space-y-4 p-4 bg-white dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    <ArrowUpDown className="w-4 h-4 text-orange-500" />{" "}
                    {t("reminders.filters.sorting")}
                  </label>
                  <div className="space-y-3">
                    <Select
                      label={t("reminders.filters.sortBy")}
                      value={localFilters.sortBy}
                      onChange={(e) =>
                        setLocalFilters((p) => ({
                          ...p,
                          sortBy: e.target.value,
                        }))
                      }
                      options={["date", "priority", "status", "title"].map(
                        (v) => ({ value: v, label: t(`reminders.sort.${v}`) })
                      )}
                    />
                    <Select
                      label={t("reminders.filters.order")}
                      value={localFilters.sortOrder}
                      onChange={(e) =>
                        setLocalFilters((p) => ({
                          ...p,
                          sortOrder: e.target.value,
                        }))
                      }
                      options={[
                        { value: "asc", label: t("reminders.sort.asc") },
                        { value: "desc", label: t("reminders.sort.desc") },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <Button variant="ghost" onClick={handleResetLocalFilters}>
                  <X className="w-4 h-4 mr-2" /> {t("reminders.filters.reset")}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="px-8"
                >
                  <ListFilter className="w-4 h-4 mr-2" />{" "}
                  {t("reminders.filters.apply")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col relative">
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg">
            <OrbitLoader />
            <p className="mt-4 text-gray-600">{t("common.loading")}</p>
          </div>
        )}

        {reminders.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <Table
              columns={columns}
              data={paginatedReminders}
              loading={loading}
              onRowClick={(row) => {
                setSelectedReminder(row);
                setIsDetailModalOpen(true);
              }}
              striped
              hoverable
              pagination={true}
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={limit}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setLimit(s);
                setPage(1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        ) : (
          !loading &&
          hasInitialLoad && (
            <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              {hasActiveFilters ? (
                <>
                  <FolderOpen className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {t("reminders.noResults")}
                  </h3>
                  <p className="text-gray-500 mb-8">
                    {t("reminders.notifications.noResultsDesc")}
                  </p>
                  <Button
                    onClick={handleClearAllFilters}
                    variant="outline"
                    icon={<X className="w-4 h-4" />}
                  >
                    {t("reminders.filters.clear")}
                  </Button>
                </>
              ) : (
                <>
                  <div className="bg-orange-100 p-5 rounded-full mb-6">
                    <Bell className="h-12 w-12 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {t("reminders.noReminders")}
                  </h3>
                  <p className="text-gray-500 mb-8 text-center max-w-md">
                    {t("reminders.emptyDesc")}
                  </p>
                  <Button
                    onClick={() => {
                      setSelectedReminder(null);
                      setIsFormOpen(true);
                    }}
                    variant="primary"
                    size="lg"
                    icon={<Plus className="w-5 h-5" />}
                  >
                    {t("reminders.createFirst")}
                  </Button>
                </>
              )}
            </div>
          )
        )}
      </div>

      {/* MODALS */}
      <ReminderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        reminder={selectedReminder}
        onEdit={(r) => {
          setSelectedReminder(r);
          setIsDetailModalOpen(false);
          setIsFormOpen(true);
        }}
        refreshData={fetchReminders}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          selectedReminder
            ? t("reminders.form.editTitle")
            : t("reminders.form.createTitle")
        }
        size="lg"
      >
        <ReminderForm
          reminder={selectedReminder}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal((p) => ({ ...p, isOpen: false }))}
        title={t("reminders.modals.delete.title")}
        size="sm"
      >
        <div className="p-6 text-center">
          <div className="mx-auto mb-6 p-3 bg-red-100 rounded-full w-fit">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {t("reminders.modals.delete.confirmTitle")}
          </h3>
          <p className="mb-8 text-gray-600">
            {t("reminders.modals.delete.description", {
              name: confirmationModal.name,
            })}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmationModal((p) => ({ ...p, isOpen: false }))
              }
            >
              {t("common.cancel")}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              <Trash2 className="w-4 h-4 mr-2" />
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RemindersList;
