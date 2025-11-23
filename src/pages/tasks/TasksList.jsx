import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Edit,
  Trash2,
  Archive,
  Kanban as KanbanIcon,
  List as ListIcon,
  Clock,
  AlertCircle,
  RotateCcw,
  AlertTriangle,
  Info,
  CheckSquare,
  LayoutGrid,
  Calendar
} from "lucide-react";

// ✅ API & Services
import { taskService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import Badge from "../../components/common/Badge";

// ✅ Context & Sub-components
import { useToast } from "../../context/ToastContext";
import TaskDetailModal from "./TaskDetailModal";
import TaskForm from "./TaskForm";

const TasksList = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, promise } = useToast();

  // Data States
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // UI States
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Default to list view if not set
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

  // Helpers for Badges
  const getPriorityVariant = (p) => {
    const map = { urgent: "danger", high: "warning", medium: "info", low: "secondary" };
    return map[p?.toLowerCase()] || "secondary";
  };

  const getStatusVariant = (s) => {
    const map = { 
      completed: "success", 
      active: "info", 
      pending: "warning", 
      todo: "primary", 
      in_progress: "purple", 
      blocked: "danger",
      cancelled: "secondary"
    };
    return map[s?.toLowerCase()] || "secondary";
  };

  // ==============================================================
  // FETCH TASKS
  // ==============================================================
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        // If Kanban mode, we load more items to ensure columns aren't empty
        limit: viewMode === "kanban" ? 100 : limit, 
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(priority !== "all" && { priority }),
        ...(category !== "all" && { category }),
        isArchived: showArchived,
      };

      const response = showArchived
        ? await taskService.getArchived(params)
        : await taskService.getAll(params);

      // Normalize Response Data
      let tasksData = [];
      let totalPagesVal = 1;
      let totalCountVal = 0;

      const dataRoot = response?.data?.data || response?.data || response;
      
      if (dataRoot?.tasks) {
        tasksData = dataRoot.tasks;
        totalPagesVal = dataRoot.totalPages || 1;
        totalCountVal = dataRoot.totalCount || tasksData.length;
      } else if (Array.isArray(dataRoot)) {
        tasksData = dataRoot;
        totalCountVal = dataRoot.length;
      }

      setTasks(tasksData || []);
      setTotalPages(totalPagesVal);
      setTotalCount(totalCountVal);
      setHasInitialLoad(true);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setError(t("tasks.messages.error.load"));
      setTasks([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, category, page, limit, showArchived, t, viewMode]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    localStorage.setItem("tasksViewMode", viewMode);
  }, [viewMode]);

  // ==============================================================
  // DRAG AND DROP HANDLER
  // ==============================================================
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    // 1. Optimistic UI Update
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === draggableId ? { ...task, status: newStatus } : task
      )
    );

    // 2. API Call with Toast Promise
    try {
 await promise(taskService.updateStatus(draggableId, newStatus), {
        loading: t('tasks.toasts.status.loading'),
        // Pass the translated status label into the success message
        success: t('tasks.toasts.status.success', { status: t(`tasks.status.${newStatus}`) }),
        error: t('tasks.toasts.status.error')
      });
    } catch (error) {
      // Revert UI on failure
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === draggableId ? { ...task, status: oldStatus } : task
        )
      );
    }
  };

  // ==============================================================
  // ACTIONS
  // ==============================================================

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

  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleTaskAction = useCallback(
    (task, action) => {
      const taskTitle = task.title || t("tasks.messages.thisTask");
      
      const executeAction = async (apiMethod, loadingMsg, successMsg) => {
        try {
          await promise(apiMethod(task._id), {
            loading: t(loadingMsg),
            success: t(successMsg),
            error: t('common.error')
          });
          fetchTasks();
          if (selectedTask?._id === task._id) {
            setIsDetailModalOpen(false);
          }
        } catch (err) {
          // Handled by promise
        }
      };

      const actions = {
        archive: {
          title: t("tasks.messages.archiveConfirm.title"),
          message: t("tasks.messages.archiveConfirm.message", { title: taskTitle }),
          confirmText: t("common.archive"),
          type: "danger",
          action: () => executeAction(taskService.archive, 'tasks.notifications.archiving', 'tasks.messages.success.archived'),
        },
        restore: {
          title: t("tasks.messages.restoreConfirm.title"),
          message: t("tasks.messages.restoreConfirm.message", { title: taskTitle }),
          confirmText: t("common.restore"),
          type: "info",
          action: () => executeAction(taskService.unarchive, 'tasks.notifications.restoring', 'tasks.messages.success.restored'),
        },
        delete: {
          title: t("tasks.messages.deleteConfirm.title"),
          message: t("tasks.messages.deleteConfirm.message", { title: taskTitle }),
          confirmText: t("common.delete"),
          type: "danger",
          action: () => executeAction(taskService.delete, 'tasks.notifications.deleting', 'tasks.messages.success.deleted'),
        },
      };

      const config = actions[action];
      if(config) showConfirmation(config.title, config.message, config.confirmText, config.type, config.action);
    },
    [showConfirmation, t, fetchTasks, selectedTask, promise]
  );

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setCategory("all");
    setPage(1);
  }, []);

  const isOverdue = (date, status) => {
    return new Date(date) < new Date() && !["completed", "cancelled", "archived", "blocked"].includes(status);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  // Stats Logic
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
  };

  const hasActiveFilters = search.trim() !== "" || status !== "all" || priority !== "all" || category !== "all";
  const showEmptyState = !loading && !error && tasks.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults = !loading && !error && tasks.length === 0 && hasActiveFilters && hasInitialLoad;

  const kanbanColumns = [
    { id: "pending", status: "pending", label: t("tasks.status.pending"), color: "yellow", icon: Clock },
    { id: "todo", status: "todo", label: t("tasks.status.todo"), color: "blue", icon: ListIcon },
    { id: "in_progress", status: "in_progress", label: t("tasks.status.in_progress"), color: "purple", icon: RotateCcw },
    { id: "blocked", status: "blocked", label: t("tasks.status.blocked"), color: "red", icon: AlertCircle },
    { id: "completed", status: "completed", label: t("tasks.status.completed"), color: "green", icon: CheckSquare },
  ];

  const columns = [
    {
      header: t("tasks.table.title"),
      accessor: "title",
      sortable: true,
      width: "25%",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">{row.title || "Untitled"}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{row.description}</span>
        </div>
      ),
    },
    {
      header: t("tasks.table.status"),
      accessor: "status",
      sortable: true,
      width: "12%",
      render: (row) => <Badge variant={getStatusVariant(row.status)} className="capitalize">{t(`tasks.status.${row.status}`)}</Badge>,
    },
    {
      header: t("tasks.table.priority"),
      accessor: "priority",
      sortable: true,
      width: "12%",
      render: (row) => <Badge variant={getPriorityVariant(row.priority)} className="capitalize">{t(`tasks.priority.${row.priority}`)}</Badge>,
    },
    {
      header: t("tasks.table.dueDate"),
      accessor: "dueDate",
      sortable: true,
      width: "15%",
      render: (row) => (
        <div className={`flex items-center gap-1.5 ${isOverdue(row.dueDate, row.status) ? "text-red-600 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
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
      render: (row) => row.assignedTo ? (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
            {row.assignedTo.name?.charAt(0) || "U"}
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">{row.assignedTo.name}</span>
        </div>
      ) : <span className="text-gray-400">-</span>,
    },
    {
      header: t("tasks.table.actions"),
      accessor: "actions",
      width: "12%",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-1">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTask(row); setIsDetailModalOpen(true); }}>
            <Eye className="w-4 h-4 text-blue-500" />
          </Button>
          {!showArchived ? (
            <>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedTask(row); setIsFormOpen(true); }}>
                <Edit className="w-4 h-4 text-green-500" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleTaskAction(row, "archive"); }}>
                <Archive className="w-4 h-4 text-orange-500" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleTaskAction(row, "restore"); }}>
                <RotateCcw className="w-4 h-4 text-green-500" />
              </Button>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleTaskAction(row, "delete"); }}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      ),
    }
  ];

  // ✅ CUSTOM PAGINATION RENDERER (Matches ClientsList logic)
  const renderPagination = () => {
    // 1. If standard pagination is needed (multiple pages)
    if (totalPages > 1) {
      return (
        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={limit}
            onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
            totalItems={totalCount}
          />
        </div>
      );
    }

    // 2. Custom footer for single page results (or when pagination component hides itself)
    const start = Math.min((page - 1) * limit + 1, totalCount);
    const end = Math.min(page * limit, totalCount);

    if (totalCount === 0) return null;

    return (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div>
          Showing <span className="font-medium text-gray-900 dark:text-white">{start}</span> to{" "}
          <span className="font-medium text-gray-900 dark:text-white">{end}</span> of{" "}
          <span className="font-medium text-gray-900 dark:text-white">{totalCount}</span> results
        </div>
        <div className="flex items-center gap-2">
          <span>Per page:</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 py-1"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      {/* --- Header & Actions --- */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {showArchived ? t("tasks.archivedTasks") : t("tasks.title")}
            {showArchived && <Badge variant="warning" size="lg">Archived</Badge>}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {showArchived ? t("tasks.archivedSubtitle") : t("tasks.subtitle")} 
            {hasInitialLoad && <span className="ml-1 text-gray-400">({totalCount} items)</span>}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!showArchived && (
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg border border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "list" 
                  ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
              >
                <ListIcon className="w-4 h-4" />
                {t("tasks.view.list", "List View")}
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  viewMode === "kanban" 
                  ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                }`}
              >
                <KanbanIcon className="w-4 h-4" />
                {t("tasks.view.kanban", "Kanban Board")}
              </button>
            </div>
          )}

          {!showEmptyState && (
            <Button 
              variant="outline" 
              onClick={() => setShowArchived(!showArchived)} 
              icon={showArchived ? LayoutGrid : Archive}
            >
              {showArchived ? t("tasks.activeTasks") : t("tasks.archived")}
            </Button>
          )}
          
          {!showArchived && (
            <Button variant="primary" icon={Plus} onClick={() => { setSelectedTask(null); setIsFormOpen(true); }}>
              {t("tasks.createTask")}
            </Button>
          )}
        </div>
      </div>

      {/* --- Stats Overview (Only Active) --- */}
      {!showArchived && !showEmptyState && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { label: t("tasks.stats.total"), value: stats.total, color: "gray", icon: LayoutGrid },
            { label: t("tasks.status.pending"), value: stats.pending, color: "yellow", icon: Clock },
            { label: t("tasks.status.in_progress"), value: stats.inProgress, color: "purple", icon: RotateCcw },
            { label: t("tasks.status.blocked"), value: stats.blocked, color: "red", icon: AlertCircle },
            { label: t("tasks.status.completed"), value: stats.completed, color: "green", icon: CheckSquare },
          ].map((stat) => (
            <div key={stat.label} className={`p-4 rounded-lg border flex items-center justify-between ${
              stat.color === 'red' ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' :
              stat.color === 'green' ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' :
              stat.color === 'yellow' ? 'bg-yellow-50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30' :
              'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 opacity-20 text-${stat.color === 'gray' ? 'gray' : stat.color}-600`} />
            </div>
          ))}
        </div>
      )}

      {/* --- Filters --- */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <Input 
            className="flex-1" 
            icon={Search} 
            placeholder={t(showArchived ? "tasks.searchArchivedPlaceholder" : "tasks.searchPlaceholder")}
            value={search} 
            onChange={(e) => { setPage(1); setSearch(e.target.value); }} 
          />
          <div className="sm:w-40">
            <Select 
              value={status} 
              onChange={(e) => { setPage(1); setStatus(e.target.value); }}
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
              value={priority} 
              onChange={(e) => { setPage(1); setPriority(e.target.value); }}
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
      )}

      {/* --- Content Area --- */}
      
      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
          </div>
          <Button onClick={fetchTasks} size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-100">{t("common.retry")}</Button>
        </div>
      )}

      {/* Loading State */}
      {loading && !hasInitialLoad && (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400 animate-pulse">{t("common.loading")}</p>
        </div>
      )}

      {/* Empty States */}
      {showNoResults ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t("tasks.messages.noResults")}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">{t("tasks.messages.noResultsDescription")}</p>
          <Button variant="outline" onClick={handleClearFilters}>{t("tasks.filters.clearFilters")}</Button>
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t("tasks.messages.noTasks")}</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 mb-4">{t("tasks.messages.noTasksDescription")}</p>
          {!showArchived && (
            <Button variant="primary" icon={Plus} onClick={() => setIsFormOpen(true)}>{t("tasks.createFirstTask")}</Button>
          )}
        </div>
      ) : null}

      {/* List View */}
      {!loading && hasInitialLoad && tasks.length > 0 && viewMode === "list" && (
        <>
          <Table 
            columns={columns} 
            data={tasks} 
            loading={loading} 
            onRowClick={(row) => { setSelectedTask(row); setIsDetailModalOpen(true); }}
            striped
            hoverable
          />
          {/* ✅ Call the pagination helper here */}
          {renderPagination()}
        </>
      )}

      {/* Kanban View */}
      {!loading && hasInitialLoad && tasks.length > 0 && viewMode === "kanban" && !showArchived && (
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[1000px]">
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-5 gap-4 items-start h-full min-h-[600px]">
                {kanbanColumns.map((column) => {
                  const columnTasks = tasks.filter((task) => task.status === column.status);
                  
                  const bgColors = {
                    yellow: "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800/30",
                    blue: "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30",
                    purple: "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30",
                    red: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30",
                    green: "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30",
                  };
                  const textColors = {
                    yellow: "text-yellow-700 dark:text-yellow-400",
                    blue: "text-blue-700 dark:text-blue-400",
                    purple: "text-purple-700 dark:text-purple-400",
                    red: "text-red-700 dark:text-red-400",
                    green: "text-green-700 dark:text-green-400",
                  };

                  return (
                    <div key={column.id} className="flex flex-col h-full rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      
                      {/* Column Header */}
                      <div className={`p-3 border-b rounded-t-xl flex items-center justify-between ${bgColors[column.color]}`}>
                        <div className="flex items-center gap-2">
                          <column.icon className={`w-4 h-4 ${textColors[column.color]}`} />
                          <h3 className={`font-semibold text-sm ${textColors[column.color]}`}>{column.label}</h3>
                        </div>
                        <Badge variant={column.color === 'yellow' ? 'warning' : column.color === 'red' ? 'danger' : column.color === 'green' ? 'success' : 'info'} size="sm" className="bg-white/50 dark:bg-black/20 border-0">
                          {columnTasks.length}
                        </Badge>
                      </div>

                      {/* Droppable Area */}
                      <Droppable droppableId={column.status}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`p-3 flex-1 space-y-3 transition-colors duration-200 min-h-[150px] ${
                              snapshot.isDraggingOver ? "bg-gray-100/50 dark:bg-gray-700/50" : ""
                            }`}
                          >
                            {columnTasks.map((task, index) => (
                              <Draggable key={task._id} draggableId={task._id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    onClick={() => { setSelectedTask(task); setIsDetailModalOpen(true); }}
                                    style={{ ...provided.draggableProps.style }}
                                    className={`
                                      bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm group
                                      hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-grab
                                      ${snapshot.isDragging ? "shadow-xl ring-2 ring-blue-500/20 rotate-1 z-50" : ""}
                                    `}
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <Badge variant={getPriorityVariant(task.priority)} size="sm" className="text-[10px] px-1.5 py-0.5 uppercase tracking-wider">
                                        {task.priority}
                                      </Badge>
                                      {isOverdue(task.dueDate, task.status) && (
                                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                      )}
                                    </div>
                                    
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug">
                                      {task.title}
                                    </h4>

                                    <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-700 mt-2">
                                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span className={isOverdue(task.dueDate, task.status) ? "text-red-500 font-medium" : ""}>
                                          {formatDate(task.dueDate)}
                                        </span>
                                      </div>
                                      
                                      {task.assignedTo && (
                                        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold" title={task.assignedTo.name}>
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

      {/* --- Modals --- */}
      <TaskDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        task={selectedTask} 
        onEdit={(t) => { setSelectedTask(t); setIsDetailModalOpen(false); setIsFormOpen(true); }} 
        refreshData={fetchTasks} 
        showArchived={showArchived} 
      />
      
      {isFormOpen && (
        <Modal 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          title={selectedTask ? t("tasks.form.editTitle") : t("tasks.form.createTitle")} 
          size="lg"
        >
          <TaskForm 
            task={selectedTask} 
            onSuccess={() => { fetchTasks(); setIsFormOpen(false); setSelectedTask(null); }} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </Modal>
      )}

      {/* Confirmation Modal */}
      <Modal isOpen={confirmationModal.isOpen} onClose={closeConfirmationModal} title={confirmationModal.title} size="sm">
        <div className="p-6 text-center">
          {confirmationModal.type === 'danger' ? (
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
            <Button variant="outline" onClick={closeConfirmationModal}>
              {t("common.cancel")}
            </Button>
            <Button variant={confirmationModal.type} onClick={confirmationModal.onConfirm}>
              {confirmationModal.confirmText}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TasksList;