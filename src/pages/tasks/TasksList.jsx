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
  CheckSquare,
  LayoutGrid,
  Filter,
  Calendar,
  Eye,
} from "lucide-react";

// API & Permissions
import { taskService } from "../../api/index";
import PermissionGuard from "../../components/auth/PermissionGuard";
import { usePermission } from "../../hooks/usePermission";
import { useToast } from "../../context/ToastContext";

// Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";
import TaskDetailModal from "./TaskDetailModal";
import TaskForm from "./TaskForm";

// --- CONFIG ---
const VIEW_MODES = { LIST: "list", KANBAN: "kanban" };

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

//  ADDED MISSING STAT STYLES
const STAT_STYLES = {
  gray: "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-white",
  yellow:
    "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100",
  purple:
    "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800 text-purple-900 dark:text-purple-100",
  red: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-900 dark:text-red-100",
  green:
    "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 text-green-900 dark:text-green-100",
  blue: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-900 dark:text-blue-100",
};

// --- HELPERS ---
const getBadgeVariant = (val, type) =>
  (type === "priority" ? BADGE_VARIANTS.PRIORITY : BADGE_VARIANTS.STATUS)[
    val?.toLowerCase()
  ] || "secondary";
const isOverdue = (date, status) =>
  new Date(date) < new Date() &&
  !["completed", "cancelled", "archived", "blocked"].includes(status);
const formatDate = (date) =>
  !date ? "-" : new Date(date).toLocaleDateString("en-GB");

const TasksList = () => {
  const { t } = useTranslation();
  const { showSuccess, showError, promise } = useToast();
  const canUpdate = usePermission("tasks.update.all");

  // State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("tasksViewMode") || VIEW_MODES.KANBAN
  );
  const [showArchived, setShowArchived] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination (List Only)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedTask, setSelectedTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // --- STATS CALCULATION ---
  const stats = useMemo(
    () => ({
      total: totalCount,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    }),
    [tasks, totalCount]
  );

  const statCards = [
    {
      label: "tasks.stats.total",
      value: stats.total,
      color: "gray",
      icon: LayoutGrid,
      filter: "all",
    },
    {
      label: "tasks.status.pending",
      value: stats.pending,
      color: "yellow",
      icon: Clock,
      filter: "pending",
    },
    {
      label: "tasks.status.in_progress",
      value: stats.inProgress,
      color: "purple",
      icon: RotateCcw,
      filter: "in_progress",
    },
    {
      label: "tasks.status.blocked",
      value: stats.blocked,
      color: "red",
      icon: AlertCircle,
      filter: "blocked",
    },
    {
      label: "tasks.status.completed",
      value: stats.completed,
      color: "green",
      icon: CheckSquare,
      filter: "completed",
    },
  ];

  // --- FETCHING ---
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: viewMode === VIEW_MODES.KANBAN ? 200 : limit,
        search: search.trim() || undefined,
        status: status !== "all" ? status : undefined,
        priority: priority !== "all" ? priority : undefined,
        category: category !== "all" ? category : undefined,
        isArchived: showArchived,
      };

      const apiMethod = showArchived
        ? taskService.getArchived
        : taskService.getAll;
      const res = await apiMethod(params);

      const data = res?.data?.tasks || res?.tasks || [];
      const total = res?.pagination?.total || data.length;

      setTasks(data);
      setTotalCount(total);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, priority, category, showArchived, viewMode]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  useEffect(() => {
    localStorage.setItem("tasksViewMode", viewMode);
  }, [viewMode]);

  // --- HANDLERS ---
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    )
      return;
    if (!canUpdate) return showError(t("common.noPermission"));

    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await taskService.updateStatus(draggableId, newStatus);
      showSuccess(t("tasks.notifications.statusUpdated"));
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === draggableId ? { ...t, status: oldStatus } : t
        )
      );
      showError(t("tasks.notifications.updateError"));
    }
  };

  const handleTaskAction = async (task, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this task?`))
      return;
    try {
      if (action === "delete") await taskService.delete(task._id);
      if (action === "archive") await taskService.archive(task._id);
      if (action === "restore") await taskService.unarchive(task._id);
      showSuccess(t(`tasks.notifications.${action}d`));
      fetchTasks();
    } catch (e) {
      showError(t("common.error"));
    }
  };

  const handleStatClick = (filterStatus) => {
    setStatus(filterStatus);
    setIsFilterOpen(true);
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setCategory("all");
  };

  // --- RENDER ---
  const columns = [
    {
      header: t("tasks.table.title"),
      accessor: "title",
      render: (row) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.title}
        </div>
      ),
    },
    {
      header: t("tasks.table.status"),
      accessor: "status",
      render: (row) => (
        <Badge variant={getBadgeVariant(row.status, "status")}>
          {t(`tasks.status.${row.status}`)}
        </Badge>
      ),
    },
    {
      header: t("tasks.table.priority"),
      accessor: "priority",
      render: (row) => (
        <Badge variant={getBadgeVariant(row.priority, "priority")}>
          {t(`tasks.priority.${row.priority}`)}
        </Badge>
      ),
    },
    {
      header: t("tasks.table.dueDate"),
      accessor: "dueDate",
      render: (row) => (
        <div
          className={`flex items-center gap-1.5 ${isOverdue(row.dueDate, row.status) ? "text-red-600 font-bold" : "text-gray-500"}`}
        >
          <Calendar size={14} /> {formatDate(row.dueDate)}
        </div>
      ),
    },
    {
      header: t("tasks.table.actions"),
      accessor: "actions",
      className: "text-center",
      width: "100px",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedTask(row);
              setIsDetailModalOpen(true);
            }}
          >
            <Eye size={16} className="text-blue-500" />
          </Button>
          <PermissionGuard permission="tasks.update.all">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTask(row);
                setIsFormOpen(true);
              }}
            >
              <Edit size={16} className="text-green-500" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="tasks.delete.all">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTaskAction(row, "delete")}
            >
              <Trash2 size={16} className="text-red-500" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md min-h-[600px] flex flex-col">
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
            {t("tasks.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode(VIEW_MODES.LIST)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === VIEW_MODES.LIST ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700"}`}
            >
              <ListIcon size={16} /> {t("tasks.view.list")}
            </button>
            <button
              onClick={() => setViewMode(VIEW_MODES.KANBAN)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === VIEW_MODES.KANBAN ? "bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700"}`}
            >
              <KanbanIcon size={16} /> {t("tasks.view.kanban")}
            </button>
          </div>
          <PermissionGuard permission="tasks.create">
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => {
                setSelectedTask(null);
                setIsFormOpen(true);
              }}
            >
              {t("tasks.createTask")}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* STATS GRID (Clickable) */}
      {!showArchived && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              onClick={() => handleStatClick(stat.filter)}
              className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all hover:scale-105 hover:shadow-md ${STAT_STYLES[stat.color]}`}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-70">
                  {t(stat.label)}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className="w-8 h-8 opacity-20" />
            </div>
          ))}
        </div>
      )}

      {/* FILTERS */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-1/3">
            <Input
              icon={Search}
              placeholder={t("tasks.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "all", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "todo", label: "To Do" },
                { value: "in_progress", label: "In Progress" },
                { value: "completed", label: "Completed" },
              ]}
              className="w-40"
            />
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={[
                { value: "all", label: "All Priorities" },
                { value: "urgent", label: "Urgent" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
              className="w-40"
            />
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="flex items-center gap-2 text-gray-500 border-gray-300 dark:border-gray-600 hover:text-red-600 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              title={t("tasks.filters.clearFilters")}
            >
              <X size={16} />
              <span>{t("tasks.filters.reset")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
            <OrbitLoader />
          </div>
        ) : viewMode === VIEW_MODES.LIST ? (
          <Table
            columns={columns}
            data={tasks}
            pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="min-w-[1000px]">
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-5 gap-4 items-start h-full min-h-[600px]">
                  {KANBAN_COLUMNS.map((col) => {
                    const colTasks = tasks.filter(
                      (t) => t.status === col.status
                    );
                    return (
                      <div
                        key={col.id}
                        className="flex flex-col h-full rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                      >
                        <div
                          className={`p-3 border-b rounded-t-xl flex items-center justify-between ${COLUMN_STYLES.BG[col.color]}`}
                        >
                          <div className="flex items-center gap-2">
                            <col.icon
                              className={`w-4 h-4 ${COLUMN_STYLES.TEXT[col.color]}`}
                            />
                            <h3
                              className={`font-semibold text-sm ${COLUMN_STYLES.TEXT[col.color]}`}
                            >
                              {t(col.label)}
                            </h3>
                          </div>
                          <Badge
                            variant="neutral"
                            size="sm"
                            className="bg-white/50"
                          >
                            {colTasks.length}
                          </Badge>
                        </div>

                        <Droppable
                          droppableId={col.status}
                          isDropDisabled={!canUpdate}
                        >
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`p-3 flex-1 space-y-3 min-h-[150px] ${snapshot.isDraggingOver ? "bg-blue-50/50 rounded-b-xl" : ""}`}
                            >
                              {colTasks.map((task, idx) => (
                                <Draggable
                                  key={task._id}
                                  draggableId={task._id}
                                  index={idx}
                                  isDragDisabled={!canUpdate}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      onClick={() => {
                                        setSelectedTask(task);
                                        setIsDetailModalOpen(true);
                                      }}
                                      className={`bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-grab ${snapshot.isDragging ? "shadow-xl rotate-2 z-50 scale-105" : ""}`}
                                      style={provided.draggableProps.style}
                                    >
                                      <div className="flex justify-between items-start mb-2">
                                        <Badge
                                          variant={getBadgeVariant(
                                            task.priority,
                                            "priority"
                                          )}
                                          size="sm"
                                        >
                                          {t(`tasks.priority.${task.priority}`)}
                                        </Badge>
                                        {isOverdue(
                                          task.dueDate,
                                          task.status
                                        ) && (
                                          <AlertCircle
                                            size={14}
                                            className="text-red-500"
                                          />
                                        )}
                                      </div>
                                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                        {task.title}
                                      </h4>
                                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-50 dark:border-gray-700">
                                        <div className="flex items-center gap-1">
                                          <Calendar size={12} />{" "}
                                          {formatDate(task.dueDate)}
                                        </div>
                                        {task.assignedTo && (
                                          <div
                                            className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold"
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
      </div>

      {/* MODALS */}
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        task={selectedTask}
        onEdit={() => {
          setIsDetailModalOpen(false);
          setIsFormOpen(true);
        }}
        refreshData={fetchTasks}
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
          onSuccess={() => {
            fetchTasks();
            setIsFormOpen(false);
          }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default TasksList;
