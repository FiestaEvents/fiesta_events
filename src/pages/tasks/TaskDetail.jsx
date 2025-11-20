// TaskDetail.jsx
import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../hooks/useToast";

// Components
import Modal, { ConfirmModal } from "../../components/common/Modal";
import TaskForm from "./TaskForm.jsx";
import TaskHeader from "./components/TaskHeader.jsx";
import TaskInfo from "./components/TaskInfo.jsx";
import OverviewTab from "./components/OverviewTab.jsx";
import SubtasksTab from "./components/SubtasksTab.jsx";
import CommentsTab from "./components/CommentsTab.jsx";
import AttachmentsTab from "./components/AttachmentsTab.jsx";
import TimelineTab from "./components/TimelineTab.jsx";

// Hooks and Services
import { taskService } from "../../api/index";
import { useTaskDetail } from "../../hooks/useTaskDetail";

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { showSuccess, showError, showInfo, promise } = useToast();

  // Use custom hook for task data
  const { taskData, loading, error, refreshData } = useTaskDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Utility functions
  const formatDate = useCallback((date) => {
    if (!date) return "-";
    try {
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return date;
    }
  }, []);

  const formatShortDate = useCallback((date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const formatDateTime = useCallback((date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const getStatusLabel = useCallback((status) => {
    return t(`tasks.detail.status.${status}`) || status || t('tasks.detail.status.unknown');
  }, [t]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      todo:
        "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
      "in_progress":
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100",
      completed:
        "bg-green-600 text-white border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      cancelled:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
      blocked:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
      archived:
        "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
    );
  }, []);

  const getPriorityColor = useCallback((priority) => {
    const colors = {
      low:
        "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100",
      medium:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-100",
      high:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
      urgent:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
    };
    return (
      colors[priority] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
    );
  }, []);

  // Event handlers
  const handleEditTask = useCallback(() => {
    if (!id) {
      showError(t('tasks.detail.errors.edit'));
      return;
    }
    setIsEditModalOpen(true);
  }, [id, showError, t]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    showSuccess(t('tasks.detail.toasts.edit.success'));
  }, [refreshData, showSuccess, t]);

  const handleDeleteTask = useCallback(async () => {
    if (!id) {
      showError(t('tasks.detail.errors.delete'));
      return;
    }

    try {
      setDeleteLoading(true);
      await promise(
        taskService.delete(id),
        {
          loading: t('tasks.detail.toasts.delete.loading'),
          success: t('tasks.detail.toasts.delete.success'),
          error: t('tasks.detail.toasts.delete.error')
        }
      );
      setIsDeleteModalOpen(false);
      navigate("/tasks");
    } catch (err) {
      console.error("Delete task error:", err);
      // Error is handled by the promise toast
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate, promise, showError, t]);

  const handleStatusChange = useCallback(async (newStatus) => {
    if (!id) {
      showError(t('tasks.detail.errors.status'));
      return;
    }

    try {
      setActionLoading(true);
      await promise(
        taskService.updateStatus(id, newStatus),
        {
          loading: t('tasks.detail.toasts.status.loading'),
          success: t('tasks.detail.toasts.status.success', { status: newStatus.replace('_', ' ') }),
          error: t('tasks.detail.toasts.status.error')
        }
      );
      await refreshData();
    } catch (err) {
      console.error("Status change error:", err);
      // Error is handled by the promise toast
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshData, promise, showError, t]);

  const handleComplete = useCallback(async () => {
    if (!id) {
      showError(t('tasks.detail.errors.complete'));
      return;
    }

    try {
      setActionLoading(true);
      await promise(
        taskService.complete(id),
        {
          loading: t('tasks.detail.toasts.complete.loading'),
          success: t('tasks.detail.toasts.complete.success'),
          error: t('tasks.detail.toasts.complete.error')
        }
      );
      await refreshData();
    } catch (err) {
      console.error("Complete error:", err);
      // Error is handled by the promise toast
    } finally {
      setActionLoading(false);
    }
  }, [id, refreshData, promise, showError, t]);

  const handleArchive = useCallback(async () => {
    if (!id) {
      showError(t('tasks.detail.errors.archive'));
      return;
    }

    try {
      setActionLoading(true);
      await promise(
        taskService.archive(id),
        {
          loading: t('tasks.detail.toasts.archive.loading'),
          success: t('tasks.detail.toasts.archive.success'),
          error: t('tasks.detail.toasts.archive.error')
        }
      );
      setIsDeleteModalOpen(false);
      navigate("/tasks");
    } catch (err) {
      console.error("Archive error:", err);
      // Error is handled by the promise toast
    } finally {
      setActionLoading(false);
    }
  }, [id, navigate, promise, showError, t]);

  const handleRetry = useCallback(() => {
    refreshData();
    showInfo(t('tasks.detail.toasts.retry'));
  }, [refreshData, showInfo, t]);

  const isOverdue = useCallback((date, status) => {
    if (!date) return false;
    return new Date(date) < new Date() && !["completed", "cancelled"].includes(status);
  }, []);

  // Loading state
  if (loading && !taskData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t('tasks.detail.loading')}
          </p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !taskData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {!taskData ? t('tasks.detail.notFound') : t('tasks.detail.errorLoading')}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error?.message || t('tasks.detail.errorMessage')}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/tasks")}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg border hover:bg-gray-700 transition"
              >
                {t('tasks.detail.backToTasks')}
              </button>
              {error && (
                <button
                  onClick={handleRetry}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  {t('tasks.detail.tryAgain')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress
  const completedSubtasks = taskData?.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = taskData?.subtasks?.length || 0;
  const progress = taskData?.progress || (totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0);

  // Tabs configuration
  const tabs = [
    { id: "overview", label: t('tasks.detail.tabs.overview') },
    { id: "subtasks", label: t('tasks.detail.tabs.subtasks') },
    { id: "comments", label: t('tasks.detail.tabs.comments') },
    { id: "attachments", label: t('tasks.detail.tabs.attachments') },
    { id: "timeline", label: t('tasks.detail.tabs.timeline') },
  ];

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Task Details */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <TaskHeader
                  task={taskData}
                  onBack={() => navigate("/tasks")}
                  onEdit={handleEditTask}
                  onDelete={() => setIsDeleteModalOpen(true)}
                  onComplete={handleComplete}
                  onArchive={handleArchive}
                  onStatusChange={handleStatusChange}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  getPriorityColor={getPriorityColor}
                  actionLoading={actionLoading}
                  progress={progress}
                  completedSubtasks={completedSubtasks}
                  totalSubtasks={totalSubtasks}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-800">
                <TaskInfo 
                  task={taskData} 
                  formatDate={formatDate}
                  formatShortDate={formatShortDate}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                  isOverdue={isOverdue}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
              <div className="border-b border-gray-200 dark:border-orange-800">
                <nav className="flex -mb-px">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition ${
                        activeTab === tab.id
                          ? "border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-orange-300 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                      {tab.id === "comments" && taskData?.comments?.length > 0 && (
                        <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-orange-100 text-orange-600 dark:bg-orange-600 dark:text-orange-300">
                          {taskData.comments.length}
                        </span>
                      )}
                      {tab.id === "attachments" && taskData?.attachments?.length > 0 && (
                        <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-orange-100 text-orange-600 dark:bg-orange-600 dark:text-orange-300">
                          {taskData.attachments.length}
                        </span>
                      )}
                      {tab.id === "subtasks" && totalSubtasks > 0 && (
                        <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-orange-100 text-orange-600 dark:bg-orange-600 dark:text-orange-300">
                          {totalSubtasks}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <OverviewTab
                    task={taskData}
                    progress={progress}
                    completedSubtasks={completedSubtasks}
                    totalSubtasks={totalSubtasks}
                    formatDate={formatDate}
                    formatDateTime={formatDateTime}
                  />
                )}

                {activeTab === "subtasks" && (
                  <SubtasksTab
                    task={taskData}
                    progress={progress}
                    completedSubtasks={completedSubtasks}
                    totalSubtasks={totalSubtasks}
                    formatShortDate={formatShortDate}
                  />
                )}

                {activeTab === "comments" && (
                  <CommentsTab
                    task={taskData}
                    formatDateTime={formatDateTime}
                  />
                )}

                {activeTab === "attachments" && (
                  <AttachmentsTab
                    task={taskData}
                    formatShortDate={formatShortDate}
                  />
                )}

                {activeTab === "timeline" && (
                  <TimelineTab
                    task={taskData}
                    formatDateTime={formatDateTime}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('tasks.detail.modals.edit.title')}
        size="lg"
      >
        <TaskForm
          task={taskData}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTask}
        title={t('tasks.detail.modals.delete.title')}
        message={t('tasks.detail.modals.delete.message', { title: taskData?.title })}
        confirmText={t('tasks.detail.modals.delete.confirm')}
        cancelText={t('tasks.detail.modals.delete.cancel')}
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default TaskDetail;