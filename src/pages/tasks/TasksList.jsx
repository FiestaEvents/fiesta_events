import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import Badge from "../../components/common/Badge";
import { taskService } from "../../api/index";
import { CheckSquare } from "../../components/icons/IconComponents";
import {
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Edit,
  Trash2,
  Download,
  Archive,
  Kanban as KanbanIcon,
  List as ListIcon,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Tag,
  RotateCcw,
  AlertTriangle,
  Info,
} from "lucide-react";
import TaskDetailModal from "./TaskDetailModal";
import TaskForm from "./TaskForm";
import { useToast } from "../../hooks/useToast";

const TasksList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError, showLoading, dismiss, showInfo } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("tasksViewMode") || "list"
  );

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    onConfirm: null,
    type: "info",
  });

  // Search & filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showArchived, setShowArchived] = useState(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(priority !== "all" && { priority }),
        ...(category !== "all" && { category }),
        isArchived: showArchived,
      };

      const response = showArchived
        ? await taskService.getArchived(params)
        : await taskService.getAll(params);

      let tasksData = [];
      let totalPages = 1;
      let totalCount = 0;

      if (response?.data?.data?.tasks) {
        tasksData = response.data.data.tasks || [];
        totalPages = response.data.data.totalPages || 1;
        totalCount = response.data.data.totalCount || tasksData.length;
      } else if (response?.data?.tasks) {
        tasksData = response.data.tasks || [];
        totalPages = response.data.totalPages || 1;
        totalCount = response.data.totalCount || tasksData.length;
      } else if (response?.tasks) {
        tasksData = response.tasks || [];
        totalPages = response.totalPages || 1;
        totalCount = response.totalCount || tasksData.length;
      } else if (Array.isArray(response?.data)) {
        tasksData = response.data;
      } else if (Array.isArray(response)) {
        tasksData = response;
      }

      setTasks(tasksData);
      setTotalPages(totalPages);
      setTotalCount(totalCount);
      setHasInitialLoad(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        t('tasks.messages.error.load');
      setError(errorMessage);
      setTasks([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, category, page, limit, showArchived, t]);

  // Show confirmation modal
  const showConfirmation = useCallback(
    (title, message, confirmText, type = "info", onConfirm) => {
      setConfirmationModal({
        isOpen: true,
        title,
        message,
        confirmText,
        type,
        onConfirm: () => {
          onConfirm();
          closeConfirmationModal();
        },
      });
    },
    []
  );

  // Close confirmation modal
  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({
      isOpen: false,
      title: "",
      message: "",
      confirmText: "",
      onConfirm: null,
      type: "info",
    });
  }, []);

  // Handle row click to open detail modal
  const handleRowClick = useCallback((task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  }, []);

  // Handle detail modal close
  const handleDetailModalClose = useCallback(() => {
    setSelectedTask(null);
    setIsDetailModalOpen(false);
  }, []);

  // Archive task (for active tasks)
  const handleArchiveTask = useCallback(
    async (taskId) => {
      if (!taskId) return;

      try {
        await taskService.archive(taskId);
        showSuccess(t('tasks.messages.success.archived'));
        fetchTasks();
        if (selectedTask?._id === taskId) {
          setSelectedTask(null);
          setIsDetailModalOpen(false);
        }
      } catch (err) {
        showError(err.response?.data?.message || t('tasks.messages.error.archive'));
      }
    },
    [fetchTasks, selectedTask, showSuccess, showError, t]
  );

  // Restore task (for archived tasks)
  const handleRestoreTask = useCallback(
    async (taskId) => {
      if (!taskId) return;

      try {
        await taskService.unarchive(taskId);
        showSuccess(t('tasks.messages.success.restored'));
        fetchTasks();
        if (selectedTask?._id === taskId) {
          setSelectedTask(null);
          setIsDetailModalOpen(false);
        }
      } catch (err) {
        showError(err.response?.data?.message || t('tasks.messages.error.restore'));
      }
    },
    [fetchTasks, selectedTask, showSuccess, showError, t]
  );

  // Delete task permanently (for archived tasks)
  const handleDeleteTask = useCallback(
    async (taskId) => {
      if (!taskId) return;

      try {
        await taskService.delete(taskId);
        showSuccess(t('tasks.messages.success.deleted'));
        fetchTasks();
        if (selectedTask?._id === taskId) {
          setSelectedTask(null);
          setIsDetailModalOpen(false);
        }
      } catch (err) {
        showError(err.response?.data?.message || t('tasks.messages.error.delete'));
      }
    },
    [fetchTasks, selectedTask, showSuccess, showError, t]
  );

  // Handle task action with confirmation
  const handleTaskAction = useCallback(
    (task, action) => {
      const taskTitle = task.title || t('tasks.messages.thisTask');
      
      const actionMessages = {
        archive: {
          title: t('tasks.messages.archiveConfirm.title'),
          message: t('tasks.messages.archiveConfirm.message', { title: taskTitle }),
          confirmText: t('tasks.messages.archiveConfirm.confirm'),
          type: "danger",
          action: () => handleArchiveTask(task._id),
        },
        restore: {
          title: t('tasks.messages.restoreConfirm.title'),
          message: t('tasks.messages.restoreConfirm.message', { title: taskTitle }),
          confirmText: t('tasks.messages.restoreConfirm.confirm'),
          type: "info",
          action: () => handleRestoreTask(task._id),
        },
        delete: {
          title: t('tasks.messages.deleteConfirm.title'),
          message: t('tasks.messages.deleteConfirm.message', { title: taskTitle }),
          confirmText: t('tasks.messages.deleteConfirm.confirm'),
          type: "danger",
          action: () => handleDeleteTask(task._id),
        },
      };

      const {
        title,
        message,
        confirmText,
        type,
        action: performAction,
      } = actionMessages[action];

      showConfirmation(title, message, confirmText, type, performAction);
    },
    [handleArchiveTask, handleRestoreTask, handleDeleteTask, showConfirmation, t]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem("tasksViewMode", viewMode);
  }, [viewMode]);

  const handleAddTask = useCallback(() => {
    setSelectedTask(null);
    setIsFormOpen(true);
  }, []);

  const handleEditTask = useCallback((task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewTask = useCallback(
    (task) => {
      console.log("Navigating to task:", task._id);
      navigate(`/tasks/${task._id}`);
    },
    [navigate]
  );

  const handleFormSuccess = useCallback(() => {
    fetchTasks();
    setSelectedTask(null);
    setIsFormOpen(false);
  }, [fetchTasks]);

  const handleFormClose = useCallback(() => {
    setSelectedTask(null);
    setIsFormOpen(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setCategory("all");
    setPage(1);
  }, []);

  // Helper functions
  const getPriorityColor = (priority) => {
    const colors = {
      low: "gray",
      medium: "blue",
      high: "orange",
      urgent: "red",
    };
    return colors[priority] || "gray";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      todo: "blue",
      in_progress: "purple",
      completed: "green",
      cancelled: "gray",
      blocked: "red",
    };
    return colors[status] || "gray";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isOverdue = (date, status) => {
    return (
      new Date(date) < new Date() &&
      !["completed", "cancelled"].includes(status)
    );
  };

  // Calculate statistics (only for active tasks)
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
    overdue: tasks.filter(
      (t) =>
        new Date(t.dueDate) < new Date() &&
        !["completed", "cancelled"].includes(t.status)
    ).length,
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    status !== "all" ||
    priority !== "all" ||
    category !== "all";
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

  // Table columns configuration
  const getColumns = () => {
    const baseColumns = [
      {
        header: t('tasks.table.title'),
        accessor: "title",
        sortable: true,
        width: "25%",
        render: (row) => (
          <div className="font-medium text-gray-900 dark:text-white">
            {row.title || "Untitled Task"}
          </div>
        ),
      },
      {
        header: t('tasks.table.status'),
        accessor: "status",
        sortable: true,
        width: "12%",
        render: (row) => (
          <Badge color={getStatusColor(row.status)}>
            {row.status ? t(`tasks.status.${row.status}`) : t('tasks.status.unknown')}
          </Badge>
        ),
      },
      {
        header: t('tasks.table.priority'),
        accessor: "priority",
        sortable: true,
        width: "12%",
        render: (row) => (
          <Badge color={getPriorityColor(row.priority)}>
            {row.priority ? t(`tasks.priority.${row.priority}`) : t('tasks.priority.medium')}
          </Badge>
        ),
      },
      {
        header: t('tasks.table.dueDate'),
        accessor: "dueDate",
        sortable: true,
        width: "12%",
        render: (row) => (
          <div
            className={`${isOverdue(row.dueDate, row.status) ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}
          >
            {formatDate(row.dueDate)}
          </div>
        ),
      },
      {
        header: t('tasks.table.assignedTo'),
        accessor: "assignedTo",
        sortable: true,
        width: "15%",
        render: (row) => (
          <div className="text-gray-600 dark:text-gray-400">
            {row.assignedTo?.name || t('tasks.form.fields.unassigned')}
          </div>
        ),
      },
      {
        header: t('tasks.table.progress'),
        accessor: "progress",
        sortable: true,
        width: "12%",
        render: (row) => (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full transition-all"
                style={{ width: `${row.progress || 0}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
              {row.progress || 0}%
            </span>
          </div>
        ),
      },
    ];

    const actionColumn = {
      header: t('tasks.table.actions'),
      accessor: "actions",
      width: showArchived ? "15%" : "12%",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(row);
            }}
            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
            title={t('tasks.viewTask')}
          >
            <Eye className="h-4 w-4" />
          </button>

          {!showArchived ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTask(row);
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                title={t('tasks.editTask')}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskAction(row, "archive");
                }}
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 p-1 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
                title={t('tasks.archiveTask')}
              >
                <Archive className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskAction(row, "restore");
                }}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                title={t('tasks.restoreTask')}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskAction(row, "delete");
                }}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                title={t('tasks.deletePermanently')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    };

    return [...baseColumns, actionColumn];
  };

  // Confirmation Modal Component
  const ConfirmationModal = () => {
    if (!confirmationModal.isOpen) return null;

    const getButtonVariant = () => {
      switch (confirmationModal.type) {
        case "danger":
          return "danger";
        case "warning":
          return "warning";
        default:
          return "primary";
      }
    };

    const getIcon = () => {
      switch (confirmationModal.type) {
        case "danger":
          return AlertTriangle;
        case "warning":
          return AlertTriangle;
        default:
          return Info;
      }
    };

    const IconComponent = getIcon();

    return (
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        title={confirmationModal.title}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`p-2 rounded-full ${
                confirmationModal.type === "danger"
                  ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  : confirmationModal.type === "warning"
                    ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              }`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300">
                {confirmationModal.message}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeConfirmationModal}>
              {t('tasks.form.buttons.cancel')}
            </Button>
            <Button
              variant={getButtonVariant()}
              onClick={confirmationModal.onConfirm}
            >
              {confirmationModal.confirmText}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {showArchived ? t('tasks.archivedTasks') : t('tasks.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {showArchived
              ? t('tasks.archivedSubtitle')
              : t('tasks.subtitle')}{" "}
            {hasInitialLoad &&
              totalCount > 0 &&
              t('tasks.showingTasks', { current: tasks.length, total: totalCount })}
          </p>
        </div>
        <div className="flex gap-2">
          {!showEmptyState && (
            <Button
              variant="outline"
              onClick={() => setShowArchived(!showArchived)}
              className="flex items-center gap-2"
            >
              {showArchived ? (
                <>
                  <Archive className="h-4 w-4" />
                  {t('tasks.activeTasks')}
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  {t('tasks.archived')}
                </>
              )}
            </Button>
          )}
          {!showArchived && !showEmptyState && (
            <Button
              variant="primary"
              onClick={handleAddTask}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('tasks.createTask')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards - Only show for active tasks */}
      {!showArchived && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            {
              label: t('tasks.stats.total'),
              value: stats.total,
              color: "purple",
              icon: CheckSquare,
            },
            {
              label: t('tasks.stats.pending'),
              value: stats.pending,
              color: "yellow",
              icon: Clock,
            },
            {
              label: t('tasks.stats.todo'),
              value: stats.todo,
              color: "blue",
              icon: ListIcon,
            },
            {
              label: t('tasks.stats.inProgress'),
              value: stats.inProgress,
              color: "orange",
              icon: Clock,
            },
            {
              label: t('tasks.stats.blocked'),
              value: stats.blocked,
              color: "red",
              icon: AlertCircle,
            },
            {
              label: t('tasks.stats.completed'),
              value: stats.completed,
              color: "green",
              icon: CheckSquare,
            },
            {
              label: t('tasks.stats.overdue'),
              value: stats.overdue,
              color: "red",
              icon: AlertCircle,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-lg`}
                >
                  <stat.icon
                    className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Mode Toggle - Only for active tasks */}
      {!showArchived && totalCount > 0 && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              icon={ListIcon}
              onClick={() => setViewMode("list")}
            >
              {t('tasks.view.list')}
            </Button>
            <Button
              variant={viewMode === "kanban" ? "primary" : "ghost"}
              size="sm"
              icon={KanbanIcon}
              onClick={() => setViewMode("kanban")}
            >
              {t('tasks.view.kanban')}
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                {t('tasks.messages.errorLoading')}
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
            <Button onClick={fetchTasks} size="sm" variant="outline">
              {t('tasks.retry')}
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Search}
                placeholder={showArchived ? t('tasks.searchArchivedPlaceholder') : t('tasks.searchPlaceholder')}
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <div className="sm:w-40">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Filter}
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                options={[
                  { value: "all", label: t('tasks.filters.allStatus') },
                  { value: "pending", label: t('tasks.status.pending') },
                  { value: "todo", label: t('tasks.status.todo') },
                  { value: "in_progress", label: t('tasks.status.in_progress') },
                  { value: "blocked", label: t('tasks.status.blocked') },
                  { value: "completed", label: t('tasks.status.completed') },
                ]}
              />
            </div>
            <div className="sm:w-40">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                value={priority}
                onChange={(e) => {
                  setPage(1);
                  setPriority(e.target.value);
                }}
                options={[
                  { value: "all", label: t('tasks.filters.allPriorities') },
                  { value: "low", label: t('tasks.priority.low') },
                  { value: "medium", label: t('tasks.priority.medium') },
                  { value: "high", label: t('tasks.priority.high') },
                  { value: "urgent", label: t('tasks.priority.urgent') },
                ]}
              />
            </div>
            <div className="sm:w-40">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                value={category}
                onChange={(e) => {
                  setPage(1);
                  setCategory(e.target.value);
                }}
                options={[
                  { value: "all", label: t('tasks.filters.allCategories') },
                  { value: "event_preparation", label: t('tasks.category.event_preparation') },
                  { value: "marketing", label: t('tasks.category.marketing') },
                  { value: "maintenance", label: t('tasks.category.maintenance') },
                  { value: "client_followup", label: t('tasks.category.client_followup') },
                  {
                    value: "partner_coordination",
                    label: t('tasks.category.partner_coordination'),
                  },
                  { value: "administrative", label: t('tasks.category.administrative') },
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
                {t('tasks.filters.clearFilters')}
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{t('tasks.filters.activeFilters')}:</span>
              {search.trim() && (
                <Badge color="blue">{t('tasks.search')}: "{search.trim()}"</Badge>
              )}
              {status !== "all" && (
                <Badge color="purple">{t('tasks.table.status')}: {t(`tasks.status.${status}`)}</Badge>
              )}
              {priority !== "all" && (
                <Badge color="orange">{t('tasks.table.priority')}: {t(`tasks.priority.${priority}`)}</Badge>
              )}
              {category !== "all" && (
                <Badge color="green">{t('tasks.form.fields.category')}: {t(`tasks.category.${category}`)}</Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && !hasInitialLoad && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {showArchived ? t('tasks.messages.loadingArchived') : t('tasks.messages.loading')}
          </p>
        </div>
      )}

      {/* Table Section */}
      {!loading &&
        hasInitialLoad &&
        tasks.length > 0 &&
        viewMode === "list" && (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={getColumns()}
                data={tasks}
                loading={loading}
                onRowClick={handleRowClick}
                pagination={true}
                currentPage={page}
                totalPages={totalPages}
                pageSize={limit}
                totalItems={totalCount}
                onPageChange={setPage}
                onPageSizeChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                pageSizeOptions={[10, 25, 50, 100]}
              />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  pageSize={limit}
                  onPageSizeChange={(newLimit) => {
                    setLimit(newLimit);
                    setPage(1);
                  }}
                  totalItems={totalCount}
                />
              </div>
            )}
          </>
        )}

      {/* Kanban View - Only for active tasks */}
      {!loading &&
        hasInitialLoad &&
        tasks.length > 0 &&
        viewMode === "kanban" &&
        !showArchived && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {[
              {
                id: "pending",
                label: t('tasks.status.pending'),
                status: "pending",
                icon: Clock,
              },
              { id: "todo", label: t('tasks.status.todo'), status: "todo", icon: ListIcon },
              {
                id: "in_progress",
                label: t('tasks.status.in_progress'),
                status: "in_progress",
                icon: Clock,
              },
              {
                id: "blocked",
                label: t('tasks.status.blocked'),
                status: "blocked",
                icon: AlertCircle,
              },
              {
                id: "completed",
                label: t('tasks.status.completed'),
                status: "completed",
                icon: CheckSquare,
              },
            ].map((column) => {
              const columnTasks = tasks.filter(
                (task) => task.status === column.status
              );
              return (
                <div
                  key={column.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <column.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {column.label}
                      </h3>
                    </div>
                    <Badge color="gray" size="sm">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <div
                        key={task._id}
                        className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:shadow-md transition-all group"
                        onClick={() => handleRowClick(task)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition">
                              {task.title}
                            </h4>
                            <Badge
                              color={getPriorityColor(task.priority)}
                              size="sm"
                            >
                              {t(`tasks.priority.${task.priority}`)}
                            </Badge>
                          </div>

                          {task.progress > 0 && (
                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                              <div
                                className="bg-orange-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span
                                className={
                                  isOverdue(task.dueDate, task.status)
                                    ? "text-red-600 dark:text-red-400 font-medium"
                                    : ""
                                }
                              >
                                {formatDate(task.dueDate)}
                              </span>
                            </div>
                            {task.assignedTo && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{task.assignedTo.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* No Results from Search/Filter */}
      {showNoResults && (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {showArchived ? t('tasks.messages.noArchivedResults') : t('tasks.messages.noResults')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {showArchived ? t('tasks.messages.noArchivedResultsDescription') : t('tasks.messages.noResultsDescription')}
          </p>
          <Button onClick={handleClearFilters} variant="outline">
            {t('tasks.filters.clearFilters')}
          </Button>
        </div>
      )}

      {/* Empty State - No tasks at all */}
      {showEmptyState && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <CheckSquare className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {showArchived ? t('tasks.messages.noArchivedTasks') : t('tasks.messages.noTasks')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {showArchived
              ? t('tasks.messages.noArchivedDescription')
              : t('tasks.messages.noTasksDescription')}
          </p>
          {!showArchived && (
            <Button onClick={handleAddTask} variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              {t('tasks.createFirstTask')}
            </Button>
          )}
        </div>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        task={selectedTask}
        onEdit={handleEditTask}
        refreshData={fetchTasks}
        showArchived={showArchived}
      />

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedTask ? t('tasks.form.editTitle') : t('tasks.form.createTitle')}
          size="lg"
        >
          <TaskForm
            task={selectedTask}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </Modal>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal />
    </div>
  );
};

export default TasksList;