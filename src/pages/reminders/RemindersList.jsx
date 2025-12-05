import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, addHours, addDays } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Edit,
  Trash2,
  Clock,
  BellOff,
  AlertTriangle,
  Bell,
  Calendar,
  FolderOpen,
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

// ✅ Context & Sub-components
import { useToast } from "../../context/ToastContext";
import ReminderDetailModal from "./ReminderDetailModal";
import ReminderForm from "./ReminderForm";
import OrbitLoader from "../../components/common/LoadingSpinner";

const RemindersList = () => {
  const navigate = useNavigate();
  const { showSuccess, apiError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // State
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const [selectedReminder, setSelectedReminder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [snoozingReminders, setSnoozingReminders] = useState(new Set());

  // Modals
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    reminderId: null,
    reminderName: "",
    onConfirm: null,
  });
  const [snoozeOptionsModal, setSnoozeOptionsModal] = useState({
    isOpen: false,
    reminder: null,
  });

  // Filters (Active State)
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [priority, setPriority] = useState("all");

  // Filter Panel (Buffered State)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("all");
  const [localType, setLocalType] = useState("all");
  const [localPriority, setLocalPriority] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync local filters
  useEffect(() => {
    if (isFilterOpen) {
      setLocalStatus(status);
      setLocalType(type);
      setLocalPriority(priority);
    }
  }, [isFilterOpen, status, type, priority]);

  const handleApplyFilters = () => {
    setStatus(localStatus);
    setType(localType);
    setPriority(localPriority);
    setPage(1);
    setIsFilterOpen(false);
    showSuccess(
      t("reminders.notifications.filtersApplied") || "Filters applied"
    );
  };

  const handleResetLocalFilters = () => {
    setLocalStatus("all");
    setLocalType("all");
    setLocalPriority("all");
  };

  const handleClearAllFilters = () => {
    setSearch("");
    setStatus("all");
    setType("all");
    setPriority("all");
    setPage(1);
    showInfo(t("reminders.notifications.filtersCleared"));
  };

  // Fetch Reminders
  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(type !== "all" && { type }),
        ...(priority !== "all" && { priority }),
      };
      const response = await reminderService.getAll(params);
      let data =
        response?.data?.data?.reminders ||
        response?.data?.reminders ||
        response?.reminders ||
        [];
      if (!Array.isArray(data)) data = [];

      // ✅ FIX: Robust Calculation
      const totalItems =
        response?.data?.data?.totalCount ||
        response?.pagination?.total ||
        data.length;
      const calculatedTotalPages = Math.ceil(totalItems / limit);

      setReminders(data);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      setTotalCount(totalItems);
    } catch (err) {
      apiError(err, t("reminders.errorLoading"));
      setReminders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setHasInitialLoad(true);
    }
  }, [search, status, type, priority, page, limit, apiError, t]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // ✅ FIX: Client-Side Slicing Fallback
  const paginatedReminders = useMemo(() => {
    if (reminders.length > limit) {
      const startIndex = (page - 1) * limit;
      return reminders.slice(startIndex, startIndex + limit);
    }
    return reminders;
  }, [reminders, page, limit]);

  // Handlers (Delete, Snooze, etc.) - same as before
  const handleDeleteConfirm = useCallback(
    async (reminderId, reminderName) => {
      try {
        await promise(reminderService.delete(reminderId), {
          loading: t("reminders.notifications.deleting", {
            name: reminderName,
          }),
          success: t("reminders.notifications.deleted"),
          error: t("reminders.notifications.deleteError"),
        });
        fetchReminders();
        setConfirmationModal({
          isOpen: false,
          reminderId: null,
          reminderName: "",
          onConfirm: null,
        });
        if (selectedReminder?._id === reminderId) setIsDetailModalOpen(false);
      } catch (err) {}
    },
    [fetchReminders, selectedReminder, promise, t]
  );

  const handleDeleteReminder = (reminderId, reminderName) => {
    setConfirmationModal({
      isOpen: true,
      reminderId,
      reminderName,
      onConfirm: () => handleDeleteConfirm(reminderId, reminderName),
    });
  };
  const handleSnoozeAction = useCallback(
    async (duration, unit = "hours") => {
      const { reminder } = snoozeOptionsModal;
      if (!reminder?._id) return;
      try {
        setSnoozingReminders((prev) => new Set(prev).add(reminder._id));
        const now = new Date();
        const snoozeUntil =
          unit === "days" ? addDays(now, duration) : addHours(now, duration);
        await promise(
          reminderService.snooze(reminder._id, {
            snoozeUntil: snoozeUntil.toISOString(),
            duration,
            unit,
          }),
          {
            loading: t("reminders.notifications.snoozing"),
            success: t("reminders.notifications.snoozed"),
            error: t("reminders.notifications.snoozeError"),
          }
        );
        await fetchReminders();
        setSnoozeOptionsModal({ isOpen: false, reminder: null });
      } catch (err) {
      } finally {
        setSnoozingReminders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reminder._id);
          return newSet;
        });
      }
    },
    [snoozeOptionsModal, fetchReminders, promise, t]
  );

  const handleUnsnooze = useCallback(
    async (reminder) => {
      try {
        setSnoozingReminders((prev) => new Set(prev).add(reminder._id));
        await promise(
          reminderService.update(reminder._id, {
            status: "active",
            snoozeUntil: null,
          }),
          {
            loading: t("reminders.notifications.activating"),
            success: t("reminders.notifications.unsnoozed"),
            error: t("reminders.notifications.activateError"),
          }
        );
        await fetchReminders();
      } catch (err) {
      } finally {
        setSnoozingReminders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(reminder._id);
          return newSet;
        });
      }
    },
    [fetchReminders, promise, t]
  );

  const handleFormSuccess = () => {
    fetchReminders();
    setIsFormOpen(false);
    showSuccess(
      selectedReminder
        ? t("reminders.notifications.updated")
        : t("reminders.notifications.created")
    );
  };
  const getPriorityColor = (p) =>
    ({ urgent: "danger", high: "warning", medium: "info", low: "secondary" })[
      p
    ] || "secondary";
  const getTypeColor = (tp) =>
    ({
      event: "primary",
      payment: "warning",
      task: "purple",
      maintenance: "orange",
      followup: "success",
    })[tp] || "secondary";
  const getStatusColor = (st) =>
    ({
      completed: "success",
      active: "info",
      snoozed: "warning",
      cancelled: "danger",
    })[st] || "secondary";

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    type !== "all" ||
    priority !== "all";
  const showEmptyState =
    !loading && reminders.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults =
    !loading && reminders.length === 0 && hasActiveFilters && hasInitialLoad;
  const showData =
    hasInitialLoad && (reminders.length > 0 || (loading && totalCount > 0));

  const columns = [
    {
      header: t("reminders.columns.title"),
      accessor: "title",
      width: "20%",
      render: (row) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.title || t("reminders.untitled")}
        </div>
      ),
    },
    {
      header: t("reminders.columns.description"),
      accessor: "description",
      width: "25%",
      render: (row) => (
        <div
          className="text-gray-500 truncate max-w-xs"
          title={row.description}
        >
          {row.description || "-"}
        </div>
      ),
    },
    {
      header: t("reminders.columns.dateTime"),
      accessor: "reminderDate",
      width: "15%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <Calendar className="w-3 h-3" />
          {row.reminderDate
            ? format(new Date(row.reminderDate), "dd/MM/yyyy")
            : "-"}
          {row.reminderTime && (
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">
              {row.reminderTime}
            </span>
          )}
        </div>
      ),
    },
    {
      header: t("reminders.columns.type"),
      accessor: "type",
      width: "10%",
      render: (row) => (
        <Badge variant={getTypeColor(row.type)} className="capitalize">
          {row.type}
        </Badge>
      ),
    },
    {
      header: t("reminders.columns.priority"),
      accessor: "priority",
      width: "10%",
      render: (row) => (
        <Badge variant={getPriorityColor(row.priority)} className="capitalize">
          {row.priority}
        </Badge>
      ),
    },
    {
      header: t("reminders.columns.status"),
      accessor: "status",
      width: "10%",
      render: (row) => (
        <Badge variant={getStatusColor(row.status)} className="capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      header: t("reminders.columns.actions"),
      accessor: "actions",
      width: "10%",
      className: "text-center",
      render: (row) => {
        const isSnoozing = snoozingReminders.has(row._id);
        const isSnoozed = row.status === "snoozed";
        return (
          <div className="flex justify-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={isSnoozing}
              onClick={(e) => {
                e.stopPropagation();
                isSnoozed
                  ? handleUnsnooze(row)
                  : setSnoozeOptionsModal({ isOpen: true, reminder: row });
              }}
              className={isSnoozed ? "text-orange-500" : "text-gray-500"}
            >
              {isSnoozing ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : isSnoozed ? (
                <BellOff className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedReminder(row);
                setIsDetailModalOpen(true);
              }}
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
            >
              <Edit className="w-4 h-4 text-green-500" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteReminder(row._id, row.title);
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("reminders.title")}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {t("reminders.subtitle")}{" "}
            {hasInitialLoad &&
              totalCount > 0 &&
              ` • ${t("reminders.notifications.showingResults", { count: reminders.length, total: totalCount })}`}
          </p>
        </div>
        {!showEmptyState && (
          <Button
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={() => {
              setSelectedReminder(null);
              setIsFormOpen(true);
            }}
          >
            {t("reminders.addReminder")}
          </Button>
        )}
      </div>

      {hasInitialLoad && !showEmptyState && (
        <div className="relative mb-6 z-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="w-full sm:max-w-md relative">
              <Input
                icon={Search}
                placeholder={t("reminders.searchPlaceholder")}
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant={hasActiveFilters ? "primary" : "outline"}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 transition-all whitespace-nowrap ${isFilterOpen ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
              >
                <Filter className="w-4 h-4" />
                {t("reminders.filters.advanced") || "Filters"}
                {hasActiveFilters && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                    !
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  icon={X}
                  onClick={handleClearAllFilters}
                  className="text-gray-500"
                >
                  {t("reminders.clearFilters")}
                </Button>
              )}
            </div>
          </div>
          {isFilterOpen && (
            <div className="mt-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t("reminders.filters.options") || "Filter Options"}
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
                <Select
                  label={t("reminders.status.label")}
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value)}
                  options={[
                    { value: "all", label: t("reminders.status.all") },
                    { value: "active", label: t("reminders.status.active") },
                    {
                      value: "completed",
                      label: t("reminders.status.completed"),
                    },
                    { value: "snoozed", label: t("reminders.status.snoozed") },
                  ]}
                  className="w-full"
                />
                <Select
                  label={t("reminders.priority.label")}
                  value={localPriority}
                  onChange={(e) => setLocalPriority(e.target.value)}
                  options={[
                    { value: "all", label: t("reminders.priority.all") },
                    { value: "urgent", label: t("reminders.priority.urgent") },
                    { value: "high", label: t("reminders.priority.high") },
                    { value: "medium", label: t("reminders.priority.medium") },
                    { value: "low", label: t("reminders.priority.low") },
                  ]}
                  className="w-full"
                />
                <Select
                  label={t("reminders.type.label") || "Type"}
                  value={localType}
                  onChange={(e) => setLocalType(e.target.value)}
                  options={[
                    { value: "all", label: "All Types" },
                    { value: "event", label: "Event" },
                    { value: "payment", label: "Payment" },
                    { value: "task", label: "Task" },
                    { value: "maintenance", label: "Maintenance" },
                    { value: "followup", label: "Follow Up" },
                  ]}
                  className="w-full"
                />
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetLocalFilters}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  {t("reminders.filters.reset") || "Reset"}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="px-6"
                >
                  {t("reminders.filters.apply") || "Apply Filters"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col relative">
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
            <OrbitLoader />
            <p className="text-gray-500 dark:text-gray-400">
              {t("common.loading")}
            </p>
          </div>
        )}
        {showData && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table
              columns={columns}
              // ✅ Pass sliced data
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
              onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        )}
        {showNoResults && (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("reminders.noResults")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              {t("reminders.notifications.filtersCleared")}
            </p>
            <Button onClick={handleClearAllFilters} variant="outline" icon={X}>
              {t("reminders.clearFilters")}
            </Button>
          </div>
        )}
        {showEmptyState && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-6 ring-1 ring-gray-100 dark:ring-gray-700">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full">
                <Bell className="h-12 w-12 text-orange-500" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("reminders.noReminders")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8 leading-relaxed">
              Set up reminders for important tasks, payments, and events so you
              never miss a deadline.
            </p>
            <Button
              onClick={() => {
                setSelectedReminder(null);
                setIsFormOpen(true);
              }}
              variant="primary"
              size="lg"
              icon={<Plus className="size-4" />}
              className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
            >
              {t("reminders.createFirst")}
            </Button>
          </div>
        )}
      </div>

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
        isOpen={snoozeOptionsModal.isOpen}
        onClose={() => setSnoozeOptionsModal({ isOpen: false, reminder: null })}
        title={t("reminders.modals.snooze.title")}
        size="sm"
      >
        <div className="p-4 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSnoozeAction(1, "hours")}
          >
            1 Hour
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSnoozeAction(4, "hours")}
          >
            4 Hours
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSnoozeAction(1, "days")}
          >
            1 Day
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSnoozeAction(1, "weeks")}
          >
            1 Week
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal((p) => ({ ...p, isOpen: false }))}
        title={t("reminders.modals.delete.title")}
        size="sm"
      >
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {t("reminders.modals.delete.description", {
              name: confirmationModal.reminderName,
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
            <Button variant="danger" onClick={confirmationModal.onConfirm}>
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RemindersList;
