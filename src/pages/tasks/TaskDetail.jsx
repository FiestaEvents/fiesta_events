import React, { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  FileText,
  ListTodo,
  MessageSquare,
  Paperclip,
  History
} from "lucide-react";

// ✅ API & Services
import { taskService } from "../../api/index";
import { useTaskDetail } from "../../hooks/useTaskDetail";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import TaskForm from "./TaskForm";

// ✅ Sub-components
import TaskHeader from "./components/TaskHeader";
import TaskInfo from "./components/TaskInfo";
import OverviewTab from "./components/OverviewTab";
import SubtasksTab from "./components/SubtasksTab";
import CommentsTab from "./components/CommentsTab";
import AttachmentsTab from "./components/AttachmentsTab";
import TimelineTab from "./components/TimelineTab";

// ✅ Context
import { useToast } from "../../context/ToastContext";

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { showSuccess, promise, showInfo } = useToast();

  // Data Hook
  const { taskData, loading, error, refreshData } = useTaskDetail(id);

  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Local Loading States
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Helpers ---

  const formatDate = useCallback((date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  const formatDateTime = useCallback((date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);
const formatShortDate = useCallback((date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}, []);

  // ✅ Is Overdue Helper
  const isOverdue = useCallback((date, status) => {
    if (!date) return false;
    return (
      new Date(date) < new Date() &&
      !["completed", "cancelled", "archived", "blocked"].includes(status?.toLowerCase())
    );
  }, []);

  // Map Status to Badge Variants
  const getStatusVariant = useCallback((status) => {
    const map = {
      pending: "warning",
      todo: "blue",
      in_progress: "purple",
      completed: "success",
      cancelled: "secondary",
      blocked: "danger",
      archived: "gray"
    };
    return map[status] || "secondary";
  }, []);

  // Map Priority to Badge Variants
  const getPriorityVariant = useCallback((priority) => {
    const map = {
      low: "gray",
      medium: "info",
      high: "warning",
      urgent: "danger"
    };
    return map[priority] || "secondary";
  }, []);

  // --- Actions ---

  const handleAction = async (apiCall, toastMessages, onSuccess = () => {}) => {
    try {
      setActionLoading(true);
      await promise(apiCall, toastMessages);
      await refreshData();
      onSuccess();
    } catch (err) {
      // Toast handles error display
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    handleAction(
      taskService.updateStatus(id, newStatus),
      {
        loading: t('tasks.detail.toasts.status.loading'),
        success: t('tasks.detail.toasts.status.success', { status: newStatus.replace('_', ' ') }),
        error: t('tasks.detail.toasts.status.error')
      }
    );
  };

  const handleComplete = () => {
    handleAction(
      taskService.complete(id),
      {
        loading: t('tasks.detail.toasts.complete.loading'),
        success: t('tasks.detail.toasts.complete.success'),
        error: t('tasks.detail.toasts.complete.error')
      }
    );
  };

  const handleArchive = () => {
    handleAction(
      taskService.archive(id),
      {
        loading: t('tasks.detail.toasts.archive.loading'),
        success: t('tasks.detail.toasts.archive.success'),
        error: t('tasks.detail.toasts.archive.error')
      },
      () => navigate("/tasks")
    );
  };

  const handleDeleteTask = async () => {
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
      // Toast handles error
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Configuration ---

  const tabs = [
    { id: "overview", label: t('tasks.detail.tabs.overview'), icon: FileText },
    { id: "subtasks", label: t('tasks.detail.tabs.subtasks'), icon: ListTodo, count: taskData?.subtasks?.length },
    { id: "comments", label: t('tasks.detail.tabs.comments'), icon: MessageSquare, count: taskData?.comments?.length },
    { id: "attachments", label: t('tasks.detail.tabs.attachments'), icon: Paperclip, count: taskData?.attachments?.length },
    { id: "timeline", label: t('tasks.detail.tabs.timeline'), icon: History },
  ];

  // --- Loading & Error States ---

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">{t('tasks.detail.loading')}</p>
      </div>
    );
  }

  if (error || !taskData) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('tasks.detail.errorLoading')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error?.message || t('tasks.detail.notFound')}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/tasks")} icon={ArrowLeft}>
              {t('tasks.detail.backToTasks')}
            </Button>
            <Button variant="primary" onClick={() => { refreshData(); showInfo(t('tasks.detail.toasts.retry')); }}>
              {t('tasks.detail.tryAgain')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculations
  const completedSubtasks = taskData.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = taskData.subtasks?.length || 0;
  const progress = taskData.progress || (totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- Left Column: Header & Info (4 Cols) --- */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <TaskHeader
                task={taskData}
                onBack={() => navigate("/tasks")}
                onEdit={() => setIsEditModalOpen(true)}
                onDelete={() => setIsDeleteModalOpen(true)}
                onComplete={handleComplete}
                onArchive={handleArchive}
                onStatusChange={handleStatusChange}
                getStatusVariant={getStatusVariant} 
                getPriorityVariant={getPriorityVariant} 
                actionLoading={actionLoading}
                progress={progress}
                completedSubtasks={completedSubtasks}
                totalSubtasks={totalSubtasks}
              />
            </div>

            {/* Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <TaskInfo 
                task={taskData} 
                formatDate={formatDate}
                formatDateTime={formatDateTime}
                isOverdue={isOverdue} // ✅ FIXED: Passed the isOverdue prop
              />
            </div>
          </div>

          {/* --- Right Column: Tabs & Content (8 Cols) --- */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[600px] flex flex-col">
              
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex overflow-x-auto no-scrollbar" aria-label="Tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        group flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                        ${activeTab === tab.id
                          ? "border-orange-500 text-orange-600 dark:text-orange-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300"
                        }
                      `}
                    >
                      <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-orange-500" : "text-gray-400 group-hover:text-gray-500"}`} />
                      {tab.label}
                      
                      {tab.count > 0 && (
                        <span className={`ml-1 py-0.5 px-2 rounded-full text-xs ${
                          activeTab === tab.id 
                            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" 
                            : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1">
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
                    refreshData={refreshData}
                    formatShortDate={formatShortDate}
                  />
                )}

                {activeTab === "comments" && (
                  <CommentsTab
                    task={taskData}
                    formatDateTime={formatDateTime}
                    refreshData={refreshData}
                  />
                )}

                {activeTab === "attachments" && (
                  <AttachmentsTab
                    task={taskData}
                    formatDate={formatDate}
                    refreshData={refreshData}
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

      {/* --- Edit Modal --- */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('tasks.detail.modals.edit.title')}
        size="lg"
      >
        <TaskForm
          task={taskData}
          onSuccess={() => {
            setIsEditModalOpen(false);
            refreshData();
            showSuccess(t('tasks.detail.toasts.edit.success'));
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* --- Delete Confirmation Modal --- */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('tasks.detail.modals.delete.title')}
        size="sm"
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('tasks.detail.modals.delete.message', { title: taskData?.title })}
          </p>
          
          <div className="flex justify-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDeleteTask}
              loading={deleteLoading}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetail;