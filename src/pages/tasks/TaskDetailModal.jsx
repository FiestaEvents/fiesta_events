import React, { useState } from "react";
import {
  Trash2,
  Edit,
  Archive,
  RotateCcw,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Tag,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

//  Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";

// Services & Hooks
import { useToast } from "../../context/ToastContext";
import { taskService } from "../../api/index";

const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onEdit,
  refreshData,
  showArchived = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { promise } = useToast();

  if (!task) return null;

  // --- Helpers ---

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isOverdue = (date, status) => {
    return (
      new Date(date) < new Date() &&
      !["completed", "cancelled", "archived", "blocked"].includes(
        status?.toLowerCase()
      )
    );
  };

  // Badge Helpers
  const getPriorityVariant = (p) => {
    const map = {
      urgent: "danger",
      high: "warning",
      medium: "info",
      low: "secondary",
    };
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
      cancelled: "secondary",
    };
    return map[s?.toLowerCase()] || "secondary";
  };

  // --- Actions ---

  const handleAction = async (apiCall, messages) => {
    try {
      setIsProcessing(true);
      await promise(apiCall, messages);
      onClose();
      if (refreshData) refreshData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = () =>
    handleAction(() => taskService.archive(task._id), {
      loading: t("taskDetailModal.actions.archive.loading"),
      success: t("taskDetailModal.actions.archive.success"),
      error: t("taskDetailModal.actions.archive.error"),
    });

  const handleRestore = () =>
    handleAction(() => taskService.unarchive(task._id), {
      loading: t("taskDetailModal.actions.restore.loading"),
      success: t("taskDetailModal.actions.restore.success"),
      error: t("taskDetailModal.actions.restore.error"),
    });

  const handleDelete = () =>
    handleAction(() => taskService.delete(task._id), {
      loading: t("taskDetailModal.actions.delete.loading"),
      success: t("taskDetailModal.actions.delete.success"),
      error: t("taskDetailModal.actions.delete.error"),
    });

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/tasks/${task._id}`);
  };

  // UI Row Helper
  const InfoRow = ({ icon: Icon, label, value, color = "blue" }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100">
      <div
        className={`p-2 rounded-full bg-${color}-50 text-${color}-600 dark:bg-${color}-900/20 dark:text-${color}-400`}
      >
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white text-sm">
          {value || "-"}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("taskDetailModal.title")}
        size="md"
      >
        <div className="space-y-6">
          {/* --- Header --- */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-5 rounded-xl border border-blue-100 dark:border-gray-600 flex gap-4 items-start">
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-blue-600 dark:text-blue-400">
              <CheckCircle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-snug">
                {task.title || t("tasks.untitled")}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant={getStatusVariant(task.status)}
                  className="capitalize"
                >
                  {t(`tasks.status.${task.status}`)}
                </Badge>
                <Badge
                  variant={getPriorityVariant(task.priority)}
                  className="capitalize"
                >
                  {t(`tasks.priority.${task.priority}`)}
                </Badge>
                {isOverdue(task.dueDate, task.status) && (
                  <Badge variant="danger" icon={<AlertCircle size={12} />}>
                    {t("taskDetailModal.overdue")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* --- Progress Bar --- */}
          <div className="px-1">
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
              <span>{t("taskDetailModal.progress")}</span>
              <span>{task.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${task.progress || 0}%` }}
              />
            </div>
          </div>

          {/* --- Details Grid --- */}
          <div className="grid grid-cols-1 gap-2">
            <InfoRow
              icon={Calendar}
              label={t("taskDetailModal.dueDate")}
              value={formatDate(task.dueDate)}
              color={isOverdue(task.dueDate, task.status) ? "red" : "blue"}
            />
            <InfoRow
              icon={User}
              label={t("taskDetailModal.assignedTo")}
              value={task.assignedTo?.name || t("tasks.form.fields.unassigned")}
              color="purple"
            />
            {task.estimatedHours && (
              <InfoRow
                icon={Clock}
                label={t("taskDetailModal.estimatedHours")}
                value={`${task.estimatedHours}h`}
                color="orange"
              />
            )}
          </div>

          {/* --- Description --- */}
          {task.description && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                {t("taskDetailModal.description")}
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed line-clamp-3">
                {task.description}
              </p>
            </div>
          )}

          {/* --- Related Tags --- */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {task.tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  icon={<Tag size={10} />}
                  className="text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* --- Footer Actions --- */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2 w-full sm:w-auto">
              {!showArchived ? (
                <Button
                  variant="outline"
                  className="text-orange-600 hover:bg-orange-50"
                  icon={Archive}
                  onClick={handleArchive}
                  disabled={isProcessing}
                  size="sm"
                >
                  {t("common.archive")}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    icon={RotateCcw}
                    onClick={handleRestore}
                    disabled={isProcessing}
                    size="sm"
                  >
                    {t("common.restore")}
                  </Button>
                  <Button
                    variant="danger"
                    icon={Trash2}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isProcessing}
                    size="sm"
                  >
                    {t("common.delete")}
                  </Button>
                </>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              {!showArchived && (
                <Button
                  variant="outline"
                  icon={Edit}
                  onClick={() => onEdit(task)}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  {t("common.edit")}
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={handleViewFullDetails}
                className="flex-1 sm:flex-none gap-2"
              >
                {t("taskDetailModal.actions.moreDetails")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t("common.confirmDelete")}
        size="sm"
      >
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t("taskDetailModal.delete.confirmMessage", { title: task.title })}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              loading={isProcessing}
              onClick={handleDelete}
            >
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TaskDetailModal;