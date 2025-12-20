import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  Archive,
  Kanban as KanbanIcon,
  List as ListIcon,
  Clock,
  AlertCircle,
  RotateCcw,
  Info,
  CheckSquare,
  LayoutGrid,
  Calendar,
  Eye,
  FolderOpen,
  Filter,
} from "lucide-react";

// ✅ API & Permissions
import { taskService } from "../../api/index";
import PermissionGuard from "../../components/auth/PermissionGuard";
import { usePermission } from "../../hooks/usePermission";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";

// ✅ Context
import { useToast } from "../../context/ToastContext";

// ✅ Sub-components
import TaskDetailModal from "./TaskDetailModal";
import TaskForm from "./TaskForm";

// ================================================================
// CONFIG
// ================================================================

const VIEW_MODES = { LIST: "list", KANBAN: "kanban" };
const INITIAL_STATE = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  page: 1,
  limit: 10,
};

const KANBAN_COLUMNS = [
  {
    id: "pending",
    status: "pending",
    label: "tasks.status.pending",
    color: "yellow",
    icon: Clock,
  },
  {
    id: "todo",
    status: "todo",
    label: "tasks.status.todo",
    color: "blue",
    icon: ListIcon,
  },
  {
    id: "in_progress",
    status: "in_progress",
    label: "tasks.status.in_progress",
    color: "purple",
    icon: RotateCcw,
  },
  {
    id: "blocked",
    status: "blocked",
    label: "tasks.status.blocked",
    color: "red",
    icon: AlertCircle,
  },
  {
    id: "completed",
    status: "completed",
    label: "tasks.status.completed",
    color: "green",
    icon: CheckSquare,
  },
];

const BADGE_VARIANTS = {
  PRIORITY: {
    urgent: "danger",
    high: "warning",
    medium: "info",
    low: "secondary",
  },
  STATUS: {
    completed: "success",
    active: "info",
    pending: "warning",
    todo: "primary",
    in_progress: "purple",
    blocked: "danger",
    cancelled: "secondary",
  },
  COLUMN_COLOR: {
    yellow: "warning",
    red: "danger",
    green: "success",
    blue: "info",
    purple: "purple",
  },
};

const COLUMN_STYLES = {
  BG: {
    yellow:
      "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30",
    blue: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30",
    purple:
      "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30",
    red: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30",
    green:
      "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30",
  },
  TEXT: {
    yellow: "text-yellow-700 dark:text-yellow-400",
    blue: "text-blue-700 dark:text-blue-400",
    purple: "text-purple-700 dark:text-purple-400",
    red: "text-red-700 dark:text-red-400",
    green: "text-green-700 dark:text-green-400",
  },
};

const STAT_STYLES = {
  red: "bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30",
  green:
    "bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30",
  yellow:
    "bg-yellow-50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30",
  gray: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
};

// Helpers
const getBadgeVariant = (val, type) =>
  (type === "priority" ? BADGE_VARIANTS.PRIORITY : BADGE_VARIANTS.STATUS)[
    val?.toLowerCase()
  ] || "secondary";
const isOverdue = (date, status) =>
  new Date(date) < new Date() &&
  !["completed", "cancelled", "archived", "blocked"].includes(status);
const formatDate = (date) =>
  !date ? "-" : new Date(date).toLocaleDateString("en-GB");
const getStoredViewMode = () =>
  localStorage.getItem("tasksViewMode") || VIEW_MODES.KANBAN;
const setStoredViewMode = (mode) => localStorage.setItem("tasksViewMode", mode);

// ================================================================
// MAIN COMPONENT
// ================================================================

const TasksList = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, promise } = useToast();

  // ✅ Permissions
  const canUpdate = usePermission("tasks.update.all");

  // State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // UI States
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState(getStoredViewMode);
  const [showArchived, setShowArchived] = useState(false);

  // Filters
  const [filters, setFilters] = useState(INITIAL_STATE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Local Filter Buffer
  const [localStatus, setLocalStatus] = useState("all");
  const [localPriority, setLocalPriority] = useState("all");
  const [localCategory, setLocalCategory] = useState("all");

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null,
    type: "info",
  });

  useEffect(() => {
    if (isFilterOpen) {
      setLocalStatus(filters.status);
      setLocalPriority(filters.priority);
      setLocalCategory(filters.category);
    }
  }, [isFilterOpen, filters]);

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      status: localStatus,
      priority: localPriority,
      category: localCategory,
      page: 1,
    }));
    setIsFilterOpen(false);
    showSuccess(t("tasks.notifications.filtersApplied"));
  };

  const handleResetLocalFilters = () => {
    setLocalStatus("all");
    setLocalPriority("all");
    setLocalCategory("all");
  };
  const handleClearAllFilters = () => {
    setFilters(INITIAL_STATE);
  };

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" && { page: 1 }),
    }));
  }, []);

  // Stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
  };

  const statCards = [
    {
      label: t("tasks.stats.total"),
      value: stats.total,
      color: "gray",
      icon: LayoutGrid,
    },
    {
      label: t("tasks.status.pending"),
      value: stats.pending,
      color: "yellow",
      icon: Clock,
    },
    {
      label: t("tasks.status.in_progress"),
      value: stats.inProgress,
      color: "purple",
      icon: RotateCcw,
    },
    {
      label: t("tasks.status.blocked"),
      value: stats.blocked,
      color: "red",
      icon: AlertCircle,
    },
    {
      label: t("tasks.status.completed"),
      value: stats.completed,
      color: "green",
      icon: CheckSquare,
    },
  ];

  // Fetch Logic
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: filters.page,
        limit: viewMode === VIEW_MODES.KANBAN ? 100 : filters.limit,
        ...(filters.search.trim() && { search: filters.search.trim() }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.priority !== "all" && { priority: filters.priority }),
        ...(filters.category !== "all" && { category: filters.category }),
        isArchived: showArchived,
      };

      const response = showArchived
        ? await taskService.getArchived(params)
        : await taskService.getAll(params);
      let data =
        response?.data?.data?.tasks ||
        response?.data?.tasks ||
        response?.tasks ||
        [];
      if (!Array.isArray(data)) data = [];

      let totalItems =
        response?.data?.data?.totalCount ||
        response?.pagination?.total ||
        data.length;
      if (viewMode === VIEW_MODES.KANBAN && totalItems < data.length)
        totalItems = data.length;

      const calculatedTotalPages = Math.ceil(
        totalItems / (viewMode === VIEW_MODES.KANBAN ? 100 : filters.limit)
      );

      setTasks(data);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      setTotalCount(totalItems);
    } catch (err) {
      console.error(err);
      setError(t("tasks.messages.error.load"));
      setTasks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setHasInitialLoad(true);
    }
  }, [filters, showArchived, viewMode, t]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  useEffect(() => {
    setStoredViewMode(viewMode);
  }, [viewMode]);

  const paginatedTasks = useMemo(() => {
    if (viewMode === VIEW_MODES.LIST && tasks.length > filters.limit) {
      const startIndex = (filters.page - 1) * filters.limit;
      return tasks.slice(startIndex, startIndex + filters.limit);
    }
    return tasks;
  }, [tasks, filters.page, filters.limit, viewMode]);

  const handleFormSuccess = useCallback(() => {
    fetchTasks();
    setIsFormOpen(false);
    setSelectedTask(null);
    showSuccess(
      selectedTask
        ? t("tasks.messages.success.updated")
        : t("tasks.messages.success.created")
    );
  }, [fetchTasks, selectedTask, showSuccess, t]);

  // Drag & Drop
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;

    if (!canUpdate) {
      showError(t("common.noPermission"));
      return;
    }

    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    // Optimistic Update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === draggableId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await taskService.updateStatus(draggableId, newStatus);
      showSuccess(
        t("tasks.toasts.status.success", {
          status: t(`tasks.status.${newStatus}`),
        })
      );
    } catch (error) {
      // Revert
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === draggableId ? { ...task, status: oldStatus } : task
        )
      );
      showError(t("tasks.toasts.status.error"));
    }
  };

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all";
  const showEmptyState =
    !loading &&
    !error &&
    tasks.length === 0 &&
    !hasActiveFilters &&
    !showArchived &&
    hasInitialLoad;
  const showNoResults =
    !loading &&
    !error &&
    tasks.length === 0 &&
    (hasActiveFilters || showArchived) &&
    hasInitialLoad;

  const showConfirmation = useCallback(
    (title, message, confirmText, type, onConfirm) => {
      setConfirmationModal({
        isOpen: true,
        title,
        message,
        confirmText,
        type,
        onConfirm: () => {
          onConfirm();
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        },
      });
    },
    []
  );

  const handleTaskAction = useCallback(
    (task, action) => {
      const taskTitle = task.title || t("tasks.messages.thisTask");
      const executeAction = async (apiMethod, loadingMsg, successMsg) => {
        try {
          await promise(apiMethod(task._id), {
            loading: t(loadingMsg),
            success: t(successMsg),
            error: t("common.error"),
          });
          fetchTasks();
          if (selectedTask?._id === task._id) setIsDetailModalOpen(false);
        } catch (err) {}
      };

      if (action === "archive")
        showConfirmation(
          t("tasks.messages.archiveConfirm.title"),
          t("tasks.messages.archiveConfirm.message", { title: taskTitle }),
          t("common.archive"),
          "danger",
          () =>
            executeAction(
              taskService.archive,
              "tasks.notifications.archiving",
              "tasks.messages.success.archived"
            )
        );
      else if (action === "restore")
        showConfirmation(
          t("tasks.messages.restoreConfirm.title"),
          t("tasks.messages.restoreConfirm.message", { title: taskTitle }),
          t("common.restore"),
          "info",
          () =>
            executeAction(
              taskService.unarchive,
              "tasks.notifications.restoring",
              "tasks.messages.success.restored"
            )
        );
      else if (action === "delete")
        showConfirmation(
          t("tasks.messages.deleteConfirm.title"),
          t("tasks.messages.deleteConfirm.message", { title: taskTitle }),
          t("common.delete"),
          "danger",
          () =>
            executeAction(
              taskService.delete,
              "tasks.notifications.deleting",
              "tasks.messages.success.deleted"
            )
        );
    },
    [showConfirmation, t, fetchTasks, selectedTask, promise]
  );

  // Table Columns
  const tableColumns = [
    {
      header: t("tasks.table.title"),
      accessor: "title",
      width: "25%",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {row.title || t("tasks.untitled")}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
            {row.description}
          </span>
        </div>
      ),
    },
    {
      header: t("tasks.table.status"),
      accessor: "status",
      width: "12%",
      render: (row) => (
        <Badge variant={getBadgeVariant(row.status, "status")}>
          {t(`tasks.status.${row.status}`)}
        </Badge>
      ),
    },
    {
      header: t("tasks.table.priority"),
      accessor: "priority",
      width: "12%",
      render: (row) => (
        <Badge variant={getBadgeVariant(row.priority, "priority")}>
          {t(`tasks.priority.${row.priority}`)}
        </Badge>
      ),
    },
    {
      header: t("tasks.table.dueDate"),
      accessor: "dueDate",
      width: "15%",
      render: (row) => (
        <div
          className={`flex items-center gap-1.5 ${isOverdue(row.dueDate, row.status) ? "text-red-600 font-medium" : "text-gray-600 dark:text-gray-400"}`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(row.dueDate)}
        </div>
      ),
    },
    {
      header: t("tasks.table.assignedTo"),
      accessor: "assignedTo",
      width: "15%",
      render: (row) =>
        row.assignedTo ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
              {row.assignedTo.name?.charAt(0) || "U"}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {row.assignedTo.name}
            </span>
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      header: t("tasks.table.actions"),
      accessor: "actions",
      width: "12%",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-1">
          {/* View: Everyone */}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTask(row);
              setIsDetailModalOpen(true);
            }}
          >
            <Eye className="w-4 h-4 text-blue-500" />
          </Button>

          {!showArchived ? (
            <>
              {/* Edit Guard */}
              <PermissionGuard permission="tasks.update.all">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTask(row);
                    setIsFormOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 text-green-500" />
                </Button>
              </PermissionGuard>
              {/* Archive Guard */}
              <PermissionGuard permission="tasks.delete.all">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskAction(row, "archive");
                  }}
                >
                  <Archive className="w-4 h-4 text-orange-500" />
                </Button>
              </PermissionGuard>
            </>
          ) : (
            <>
              {/* Restore/Delete Guard */}
              <PermissionGuard permission="tasks.delete.all">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskAction(row, "restore");
                  }}
                >
                  <RotateCcw className="w-4 h-4 text-green-500" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTaskAction(row, "delete");
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </PermissionGuard>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {showArchived ? t("tasks.archivedTasks") : t("tasks.title")}
            {showArchived && (
              <Badge variant="warning" size="lg">
                {t("common.archived")}
              </Badge>
            )}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {showArchived ? t("tasks.archivedSubtitle") : t("tasks.subtitle")}
            {hasInitialLoad &&
              totalCount > 0 &&
              ` • ${t("tasks.messages.resultsCount", { count: totalCount })}`}
          </p>
        </div>

        {!showEmptyState && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {showArchived ? (
              <Button
                variant="danger"
                onClick={() => setShowArchived(false)}
                icon={X}
              >
                {t("tasks.returnToActive")}
              </Button>
            ) : (
              <>
                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode(VIEW_MODES.LIST)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === VIEW_MODES.LIST ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}
                  >
                    <ListIcon className="w-4 h-4" /> {t("tasks.view.list")}
                  </button>
                  <button
                    onClick={() => setViewMode(VIEW_MODES.KANBAN)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === VIEW_MODES.KANBAN ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700"}`}
                  >
                    <KanbanIcon className=" w-4 h-4" /> {t("tasks.view.kanban")}
                  </button>
                </div>
                <PermissionGuard permission="tasks.delete.all">
                  <Button
                    variant="outline"
                    onClick={() => setShowArchived(true)}
                    icon={Archive}
                  >
                    {t("tasks.archived")}
                  </Button>
                </PermissionGuard>

                <PermissionGuard permission="tasks.create">
                  <Button
                    variant="primary"
                    icon={<Plus className="size-4" />}
                    onClick={() => {
                      setSelectedTask(null);
                      setIsFormOpen(true);
                    }}
                  >
                    {t("tasks.createTask")}
                  </Button>
                </PermissionGuard>
              </>
            )}
          </div>
        )}
      </div>

      {/* STATS */}
      {!showEmptyState &&
        !showArchived &&
        hasInitialLoad &&
        tasks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 shrink-0">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className={`p-4 rounded-lg border flex items-center justify-between ${STAT_STYLES[stat.color]}`}
              >
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`w-8 h-8 opacity-20 text-gray-600`} />
              </div>
            ))}
          </div>
        )}

      {/* FILTERS */}
      {!showEmptyState && hasInitialLoad && (
        <div className="relative mb-6 z-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="w-full sm:max-w-md relative">
              <Input
                icon={Search}
                placeholder={t("tasks.searchPlaceholder")}
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant={hasActiveFilters ? "primary" : "outline"}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 transition-all whitespace-nowrap ${isFilterOpen ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
              >
                <Filter className="w-4 h-4" /> {t("tasks.filters.advanced")}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  icon={X}
                  onClick={handleClearAllFilters}
                  className="text-gray-500"
                >
                  {t("tasks.filters.clearFilters")}
                </Button>
              )}
            </div>
          </div>
          {isFilterOpen && (
            <div className="mt-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* ... Filter Content ... */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
                <Select
                  label={t("tasks.filters.allStatus")}
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value)}
                  options={[
                    { value: "all", label: t("tasks.filters.allStatus") },
                    { value: "pending", label: t("tasks.status.pending") },
                    { value: "todo", label: t("tasks.status.todo") },
                    {
                      value: "in_progress",
                      label: t("tasks.status.in_progress"),
                    },
                    { value: "blocked", label: t("tasks.status.blocked") },
                    { value: "completed", label: t("tasks.status.completed") },
                  ]}
                />
                <Select
                  label={t("tasks.filters.allPriorities")}
                  value={localPriority}
                  onChange={(e) => setLocalPriority(e.target.value)}
                  options={[
                    { value: "all", label: t("tasks.filters.allPriorities") },
                    { value: "low", label: t("tasks.priority.low") },
                    { value: "medium", label: t("tasks.priority.medium") },
                    { value: "high", label: t("tasks.priority.high") },
                    { value: "urgent", label: t("tasks.priority.urgent") },
                  ]}
                />
                <Select
                  label={t("tasks.categoryLabel")}
                  value={localCategory}
                  onChange={(e) => setLocalCategory(e.target.value)}
                  options={[
                    { value: "all", label: t("tasks.filters.allCategories") },
                    {
                      value: "event_preparation",
                      label: t("tasks.category.event_preparation"),
                    },
                    {
                      value: "administrative",
                      label: t("tasks.category.administrative"),
                    },
                    {
                      value: "marketing",
                      label: t("tasks.category.marketing"),
                    },
                    { value: "finance", label: t("tasks.category.finance") },
                    { value: "other", label: t("tasks.category.other") },
                  ]}
                />
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <Button variant="outline" onClick={handleResetLocalFilters}>
                  {t("tasks.filters.reset")}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="px-6"
                >
                  {t("tasks.filters.apply")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col relative min-h-[400px]">
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 dark:bg-gray-900/80 rounded-lg">
            <OrbitLoader />
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              {t("common.loading")}
            </p>
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === VIEW_MODES.LIST &&
          !showEmptyState &&
          !showNoResults &&
          hasInitialLoad && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table
                columns={tableColumns}
                data={paginatedTasks}
                loading={loading}
                onRowClick={(row) => {
                  setSelectedTask(row);
                  setIsDetailModalOpen(true);
                }}
                striped
                hoverable
                pagination={true}
                currentPage={filters.page}
                totalPages={totalPages}
                totalItems={totalCount}
                pageSize={filters.limit}
                onPageChange={(page) => updateFilter("page", page)}
                onPageSizeChange={(newSize) => {
                  updateFilter("limit", newSize);
                  updateFilter("page", 1);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </div>
          )}

        {/* KANBAN VIEW (With Drag & Drop) */}
        {viewMode === VIEW_MODES.KANBAN &&
          !showEmptyState &&
          !showNoResults &&
          !showArchived &&
          hasInitialLoad && (
            <div className="overflow-x-auto pb-4">
              <div className="min-w-[1000px]">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="grid grid-cols-5 gap-4 items-start h-full min-h-[600px]">
                    {KANBAN_COLUMNS.map((column) => {
                      const columnTasks = tasks.filter(
                        (task) => task.status === column.status
                      );
                      return (
                        <div
                          key={column.id}
                          className="flex flex-col h-full rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                        >
                          {/* Column Header */}
                          <div
                            className={`p-3 border-b rounded-t-xl flex items-center justify-between ${COLUMN_STYLES.BG[column.color]}`}
                          >
                            <div className="flex items-center gap-2">
                              <column.icon
                                className={`w-4 h-4 ${COLUMN_STYLES.TEXT[column.color]}`}
                              />
                              <h3
                                className={`font-semibold text-sm ${COLUMN_STYLES.TEXT[column.color]}`}
                              >
                                {t(column.label)}
                              </h3>
                            </div>
                            <Badge
                              variant={
                                BADGE_VARIANTS.COLUMN_COLOR[column.color]
                              }
                              size="sm"
                              className="bg-white/50 dark:bg-black/20 border-0"
                            >
                              {columnTasks.length}
                            </Badge>
                          </div>

                          <Droppable
                            droppableId={column.status}
                            isDropDisabled={!canUpdate}
                          >
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`p-3 flex-1 space-y-3 transition-colors duration-200 min-h-[150px] ${snapshot.isDraggingOver ? "bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-200 dark:ring-blue-800 rounded-b-xl" : ""}`}
                              >
                                {columnTasks.map((task, index) => (
                                  <Draggable
                                    key={task._id}
                                    draggableId={task._id}
                                    index={index}
                                    isDragDisabled={!canUpdate}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={(e) => {
                                          if (
                                            snapshot.isDragging ||
                                            e.defaultPrevented
                                          )
                                            return;
                                          setSelectedTask(task);
                                          setIsDetailModalOpen(true);
                                        }}
                                        style={{
                                          ...provided.draggableProps.style,
                                        }}
                                        className={`bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm group hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-grab ${snapshot.isDragging ? "shadow-xl ring-2 ring-blue-500/20 rotate-2 z-50 scale-105" : ""}`}
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <Badge
                                            variant={getBadgeVariant(
                                              task.priority,
                                              "priority"
                                            )}
                                            size="sm"
                                            className="text-[10px] px-1.5 py-0.5 uppercase tracking-wider"
                                          >
                                            {task.priority}
                                          </Badge>
                                          {isOverdue(
                                            task.dueDate,
                                            task.status
                                          ) && (
                                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                          )}
                                        </div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug">
                                          {task.title}
                                        </h4>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700 mt-2">
                                          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            <span
                                              className={
                                                isOverdue(
                                                  task.dueDate,
                                                  task.status
                                                )
                                                  ? "text-red-500 font-medium"
                                                  : ""
                                              }
                                            >
                                              {formatDate(task.dueDate)}
                                            </span>
                                          </div>
                                          {task.assignedTo && (
                                            <div
                                              className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold"
                                              title={task.assignedTo.name}
                                            >
                                              {task.assignedTo.name.charAt(0)}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      );
                    })}
                  </div>
                </DragDropContext>
              </div>
            </div>
          )}

        {showNoResults && (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("tasks.messages.noResults")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              {t("tasks.messages.noResultsDescription")}
            </p>
            <Button onClick={handleClearAllFilters} variant="outline" icon={X}>
              {t("tasks.filters.clearFilters")}
            </Button>
          </div>
        )}

        {showEmptyState && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-6 ring-1 ring-gray-100 dark:ring-gray-700">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full">
                <CheckSquare
                  className="h-12 w-12 text-orange-500"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("tasks.messages.noTasks")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8 leading-relaxed">
              {t("tasks.messages.noTasksDescription")}
            </p>

            <PermissionGuard permission="tasks.create">
              <Button
                onClick={() => {
                  setSelectedTask(null);
                  setIsFormOpen(true);
                }}
                variant="primary"
                size="lg"
                icon={<Plus className="size-4" />}
              >
                {t("tasks.createFirstTask")}
              </Button>
            </PermissionGuard>
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={selectedTask}
        onEdit={(t) => {
          setSelectedTask(t);
          setIsDetailModalOpen(false);
          setIsFormOpen(true);
        }}
        refreshData={fetchTasks}
        showArchived={showArchived}
      />
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          selectedTask ? t("tasks.form.editTitle") : t("tasks.form.createTitle")
        }
        size="lg"
      >
        <TaskForm
          task={selectedTask}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        title={confirmationModal.title}
        size="sm"
      >
        <div className="p-6 text-center">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmationModal.type === "danger" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
          >
            {confirmationModal.type === "danger" ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <Info className="w-6 h-6" />
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {confirmationModal.message}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
              }
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant={confirmationModal.type}
              onClick={confirmationModal.onConfirm}
            >
              {confirmationModal.confirmText}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TasksList;
