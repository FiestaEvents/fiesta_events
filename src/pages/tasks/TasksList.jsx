import React, { useState, useEffect, useCallback } from "react";
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
  FolderOpen, // ✅ Added for No Results
} from "lucide-react";

// API & Services
import { taskService } from "../../api/index";

// Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination"; // ✅ Ensure this is imported
import Badge from "../../components/common/Badge";

// Context & Sub-components
import { useToast } from "../../context/ToastContext";
import TaskDetailModal from "./TaskDetailModal";
import TaskForm from "./TaskForm";

// ================================================================
// CONSTANTS
// ================================================================

const VIEW_MODES = {
  LIST: "list",
  KANBAN: "kanban",
};

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

// ================================================================
// HELPER FUNCTIONS
// ================================================================

const getBadgeVariant = (value, type) => {
  const variants =
    type === "priority" ? BADGE_VARIANTS.PRIORITY : BADGE_VARIANTS.STATUS;
  return variants[value?.toLowerCase()] || "secondary";
};

const isOverdue = (date, status) => {
  const excludedStatuses = ["completed", "cancelled", "archived", "blocked"];
  return new Date(date) < new Date() && !excludedStatuses.includes(status);
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB");
};

const normalizeTasksResponse = (response) => {
  const dataRoot = response?.data?.data || response?.data || response;

  if (dataRoot?.tasks) {
    return {
      tasks: dataRoot.tasks,
      totalPages: dataRoot.totalPages || 1,
      totalCount: dataRoot.totalCount || dataRoot.tasks.length,
    };
  }

  if (Array.isArray(dataRoot)) {
    return {
      tasks: dataRoot,
      totalPages: 1,
      totalCount: dataRoot.length,
    };
  }

  return { tasks: [], totalPages: 1, totalCount: 0 };
};

const getStoredViewMode = () => {
  return localStorage.getItem("tasksViewMode") || VIEW_MODES.KANBAN;
};

const setStoredViewMode = (mode) => {
  localStorage.setItem("tasksViewMode", mode);
};

// ================================================================
// MAIN COMPONENT
// ================================================================

const TasksList = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, promise } = useToast();

  // ============================================================
  // STATE MANAGEMENT
  // ============================================================

  // Data States
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

  // Filter States
  const [filters, setFilters] = useState(INITIAL_STATE);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null,
    type: "info",
  });

  // ============================================================
  // COMPUTED VALUES
  // ============================================================

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
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
    hasInitialLoad;

  const showNoResults =
    !loading &&
    !error &&
    tasks.length === 0 &&
    hasActiveFilters &&
    hasInitialLoad;

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

  // ============================================================
  // DATA FETCHING
  // ============================================================

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

      const {
        tasks: tasksData,
        totalPages: pages,
        totalCount: count,
      } = normalizeTasksResponse(response);

      setTasks(tasksData);
      setTotalPages(pages);
      setTotalCount(count);
      setHasInitialLoad(true);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError(t("tasks.messages.error.load"));
      setTasks([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [filters, showArchived, viewMode, t]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setStoredViewMode(viewMode);
  }, [viewMode]);

  // ============================================================
  // FILTER HANDLERS
  // ============================================================

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" && { page: 1 }),
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_STATE);
  }, []);

  // ============================================================
  // TASK ACTIONS
  // ============================================================

const handleDragEnd = async (result) => {
  const { destination, source, draggableId } = result;

  // No changes needed
  if (
    !destination ||
    (destination.droppableId === source.droppableId &&
      destination.index === source.index)
  ) {
    return;
  }

  const newStatus = destination.droppableId;
  const oldStatus = source.droppableId;

  // Find the task being moved
  const taskToUpdate = tasks.find((t) => t._id === draggableId);
  
  if (!taskToUpdate) {
    showError(t("tasks.toasts.status.error"));
    return;
  }

  console.log("🔄 Updating task:", {
    taskId: draggableId,
    oldStatus,
    newStatus,
    task: taskToUpdate
  });

  // Optimistic UI Update
  setTasks((prevTasks) =>
    prevTasks.map((task) =>
      task._id === draggableId ? { ...task, status: newStatus } : task
    )
  );

  try {
    // Option 1: If you have an updateStatus method
    const response = await taskService.updateStatus(draggableId, newStatus);
    
    console.log("✅ Update response:", response);
    
    showSuccess(
      t("tasks.toasts.status.success", {
        status: t(`tasks.status.${newStatus}`),
      })
    );

    // Verify the update by refetching (optional but recommended)
    // await fetchTasks();

  } catch (error) {
    console.error("❌ Update failed:", error);
    
    // Revert optimistic update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === draggableId ? { ...task, status: oldStatus } : task
      )
    );
    
    showError(
      error?.response?.data?.message || 
      error?.message || 
      t("tasks.toasts.status.error")
    );
  }
};
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
          if (selectedTask?._id === task._id) {
            setIsDetailModalOpen(false);
          }
        } catch (err) {
          // Error handled by promise
        }
      };

      const actionConfigs = {
        archive: {
          title: t("tasks.messages.archiveConfirm.title"),
          message: t("tasks.messages.archiveConfirm.message", {
            title: taskTitle,
          }),
          confirmText: t("common.archive"),
          type: "danger",
          action: () =>
            executeAction(
              taskService.archive,
              "tasks.notifications.archiving",
              "tasks.messages.success.archived"
            ),
        },
        restore: {
          title: t("tasks.messages.restoreConfirm.title"),
          message: t("tasks.messages.restoreConfirm.message", {
            title: taskTitle,
          }),
          confirmText: t("common.restore"),
          type: "info",
          action: () =>
            executeAction(
              taskService.unarchive,
              "tasks.notifications.restoring",
              "tasks.messages.success.restored"
            ),
        },
        delete: {
          title: t("tasks.messages.deleteConfirm.title"),
          message: t("tasks.messages.deleteConfirm.message", {
            title: taskTitle,
          }),
          confirmText: t("common.delete"),
          type: "danger",
          action: () =>
            executeAction(
              taskService.delete,
              "tasks.notifications.deleting",
              "tasks.messages.success.deleted"
            ),
        },
      };

      const config = actionConfigs[action];
      if (config) {
        showConfirmation(
          config.title,
          config.message,
          config.confirmText,
          config.type,
          config.action
        );
      }
    },
    [showConfirmation, t, fetchTasks, selectedTask, promise]
  );

  // ============================================================
  // MODAL HANDLERS
  // ============================================================

  const openTaskDetail = useCallback((task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  }, []);

  const openTaskForm = useCallback((task = null) => {
    setSelectedTask(task);
    setIsFormOpen(true);
  }, []);

  const closeTaskDetail = useCallback(() => {
    setIsDetailModalOpen(false);
  }, []);

  const closeTaskForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedTask(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchTasks();
    closeTaskForm();
  }, [fetchTasks, closeTaskForm]);

  const handleEditFromDetail = useCallback((task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(false);
    setIsFormOpen(true);
  }, []);

  // ============================================================
  // TABLE COLUMNS CONFIGURATION
  // ============================================================

  const tableColumns = [
    {
      header: t("tasks.table.title"),
      accessor: "title",
      sortable: true,
      width: "25%",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {row.title || "Untitled"}
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
      sortable: true,
      width: "12%",
      render: (row) => (
        <Badge
          variant={getBadgeVariant(row.status, "status")}
          className="capitalize"
        >
          {t(`tasks.status.${row.status}`)}
        </Badge>
      ),
    },
    {
      header: t("tasks.table.priority"),
      accessor: "priority",
      sortable: true,
      width: "12%",
      render: (row) => (
        <Badge
          variant={getBadgeVariant(row.priority, "priority")}
          className="capitalize"
        >
          {t(`tasks.priority.${row.priority}`)}
        </Badge>
      ),
    },
    {
      header: t("tasks.table.dueDate"),
      accessor: "dueDate",
      sortable: true,
      width: "15%",
      render: (row) => (
        <div
          className={`flex items-center gap-1.5 ${
            isOverdue(row.dueDate, row.status)
              ? "text-red-600 font-medium"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(row.dueDate)}
        </div>
      ),
    },
    {
      header: t("tasks.table.assignedTo"),
      accessor: "assignedTo",
      sortable: true,
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
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openTaskDetail(row);
            }}
          >
            <Eye className="w-4 h-4 text-blue-500" />
          </Button>
          {!showArchived ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openTaskForm(row);
                }}
              >
                <Edit className="w-4 h-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskAction(row, "archive");
                }}
              >
                <Archive className="w-4 h-4 text-orange-500" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskAction(row, "restore");
                }}
              >
                <RotateCcw className="w-4 h-4 text-green-500" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskAction(row, "delete");
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // ============================================================
  // PAGINATION RENDERER
  // ============================================================

  // ✅ Unified Pagination Footer
  const renderPagination = () => {
    const start = Math.min((filters.page - 1) * filters.limit + 1, totalCount);
    const end = Math.min(filters.page * filters.limit, totalCount);

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
            {totalCount}
          </span>{" "}
          results
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {totalPages > 1 && (
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => updateFilter("page", page)}
              pageSize={null}
            />
          )}
          <div className="flex items-center gap-2">
            <span>Per page:</span>
            <select
              value={filters.limit}
              onChange={(e) => {
                updateFilter("limit", Number(e.target.value));
                updateFilter("page", 1);
              }}
              className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 py-1"
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

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const renderHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          {showArchived ? t("tasks.archivedTasks") : t("tasks.title")}
          {showArchived && (
            <Badge variant="warning" size="lg">
              Archived
            </Badge>
          )}
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {showArchived ? t("tasks.archivedSubtitle") : t("tasks.subtitle")}
          {hasInitialLoad && !showEmptyState && (
            <span className="ml-1 text-gray-400">({totalCount} items)</span>
          )}
        </p>
      </div>

      {!showEmptyState && (
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!showArchived && (
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setViewMode(VIEW_MODES.LIST)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === VIEW_MODES.LIST
                    ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
              >
                <ListIcon className="w-4 h-4" />
                {t("tasks.view.list", "List")}
              </button>
              <button
                onClick={() => setViewMode(VIEW_MODES.KANBAN)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === VIEW_MODES.KANBAN
                    ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
              >
                <KanbanIcon className="w-4 h-4" />
                {t("tasks.view.kanban", "Kanban")}
              </button>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
            icon={showArchived ? LayoutGrid : Archive}
          >
            {showArchived ? t("tasks.activeTasks") : t("tasks.archived")}
          </Button>

          {!showArchived && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => openTaskForm()}
            >
              {t("tasks.createTask")}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderStats = () => {
    if (showArchived || showEmptyState || tasks.length === 0) return null;

    return (
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
    );
  };

  const renderFilters = () => {
    if (!hasInitialLoad || showEmptyState) return null;

    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4 shrink-0">
        <Input
          className="flex-1"
          icon={Search}
          placeholder={t(
            showArchived
              ? "tasks.searchArchivedPlaceholder"
              : "tasks.searchPlaceholder"
          )}
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
        />
        <div className="sm:w-40">
          <Select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            options={[
              { value: "all", label: t("tasks.filters.allStatus") },
              { value: "pending", label: t("tasks.status.pending") },
              { value: "todo", label: t("tasks.status.todo") },
              { value: "in_progress", label: t("tasks.status.in_progress") },
              { value: "blocked", label: t("tasks.status.blocked") },
              { value: "completed", label: t("tasks.status.completed") },
            ]}
          />
        </div>
        <div className="sm:w-40">
          <Select
            value={filters.priority}
            onChange={(e) => updateFilter("priority", e.target.value)}
            options={[
              { value: "all", label: t("tasks.filters.allPriorities") },
              { value: "low", label: t("tasks.priority.low") },
              { value: "medium", label: t("tasks.priority.medium") },
              { value: "high", label: t("tasks.priority.high") },
              { value: "urgent", label: t("tasks.priority.urgent") },
            ]}
          />
        </div>
        {hasActiveFilters && (
          <Button variant="outline" icon={X} onClick={handleClearFilters}>
            {t("tasks.filters.clearFilters")}
          </Button>
        )}
      </div>
    );
  };

  // ============================================================
  // RENDER: MAIN CONTENT
  // ============================================================

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      {renderHeader()}
      {renderStats()}
      {renderFilters()}

      {/* Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Loading Overlay */}
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              {t("common.loading", "Loading...")}
            </p>
          </div>
        )}

        {/* List View */}
        {viewMode === VIEW_MODES.LIST && !showEmptyState && !showNoResults && (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table
                columns={tableColumns}
                data={tasks}
                loading={loading}
                onRowClick={openTaskDetail}
                striped
                hoverable
              />
            </div>
            {renderPagination()}
          </>
        )}

        {/* Kanban View */}
        {viewMode === VIEW_MODES.KANBAN &&
          !showEmptyState &&
          !showNoResults &&
          !showArchived && (
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
                          {/* Droppable Area */}
                          <Droppable droppableId={column.status}>
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`p-3 flex-1 space-y-3 transition-colors duration-200 min-h-[150px] ${snapshot.isDraggingOver ? "bg-gray-100/50 dark:bg-gray-700/50" : ""}`}
                              >
                                {columnTasks.map((task, index) => (
                                  <Draggable
                                    key={task._id}
                                    draggableId={task._id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        onClick={() => openTaskDetail(task)}
                                        style={{
                                          ...provided.draggableProps.style,
                                        }}
                                        className={`bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm group hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-grab ${snapshot.isDragging ? "shadow-xl ring-2 ring-blue-500/20 rotate-1 z-50" : ""}`}
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

        {/* ✅ NO RESULTS (Active Filter) */}
        {showNoResults && (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("tasks.messages.noResults")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              {t(
                "tasks.messages.noResultsDescription",
                "Try adjusting your filters to find what you're looking for."
              )}
            </p>
            <Button onClick={handleClearFilters} variant="outline" icon={X}>
              {t("tasks.filters.clearFilters")}
            </Button>
          </div>
        )}

        {/* ✅ EMPTY STATE (No Data) - Enhanced Design */}
        {showEmptyState && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
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
              {t(
                "tasks.messages.noTasksDescription",
                "Get started by creating your first task to track your progress and manage your work efficiently."
              )}
            </p>
            {!showArchived && (
              <Button
                onClick={() => openTaskForm()}
                variant="primary"
                size="lg"
                icon={Plus}
                className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
              >
                {t("tasks.createFirstTask")}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeTaskDetail}
        task={selectedTask}
        onEdit={handleEditFromDetail}
        refreshData={fetchTasks}
        showArchived={showArchived}
      />

      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={closeTaskForm}
          title={
            selectedTask
              ? t("tasks.form.editTitle")
              : t("tasks.form.createTitle")
          }
          size="lg"
        >
          <TaskForm
            task={selectedTask}
            onSuccess={handleFormSuccess}
            onCancel={closeTaskForm}
          />
        </Modal>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        title={confirmationModal.title}
        size="sm"
      >
        <div className="p-6 text-center">
          {confirmationModal.type === "danger" ? (
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
              <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
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
