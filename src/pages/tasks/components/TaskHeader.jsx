import React from "react";
import { useTranslation } from "react-i18next";
import {
  CheckSquare,
  Edit,
  Trash2,
  Play,
  Pause,
  Archive,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

//  Generic Components
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";

const TaskHeader = ({
  task,
  onBack,
  onEdit,
  onDelete,
  onComplete,
  onArchive,
  onStatusChange,
  getStatusVariant,
  getPriorityVariant,
  actionLoading,
  progress,
  completedSubtasks,
  totalSubtasks,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 bg-white dark:bg-gray-800">
      {/* Top Navigation & Actions */}
      <div className="flex justify-between items-center gap-2 mb-8">
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t("tasks.detail.header.backToTasks")}
            </span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            title={t("tasks.detail.header.editTask")}
            className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/30"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            title={t("tasks.detail.header.deleteTask")}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Task Identity */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg mx-auto mb-4 ring-4 ring-orange-50 dark:ring-orange-900/20">
          <CheckSquare className="w-9 h-9" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 leading-tight px-2">
          {task.title || t("tasks.untitled")}
        </h1>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {task.status && (
            <Badge
              variant={getStatusVariant(task.status)}
              size="md"
              dot={true}
              className="capitalize"
            >
              {t(`tasks.status.${task.status}`)}
            </Badge>
          )}

          {task.priority && (
            <Badge
              variant={getPriorityVariant(task.priority)}
              size="md"
              className="capitalize"
            >
              {t(`tasks.priority.${task.priority}`)}
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <span>{t("tasks.detail.overview.progress")}</span>
          <span className="text-orange-600 dark:text-orange-400">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 text-center flex justify-center items-center gap-1">
          <CheckSquare className="w-3 h-3" />
          {completedSubtasks} / {totalSubtasks}{" "}
          {t("tasks.detail.subtasks.label", "Subtasks Completed")}
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col gap-3">
        {/* Status Actions */}
        {task.status === "todo" && (
          <Button
            onClick={() => onStatusChange("in_progress")}
            disabled={actionLoading}
            className="w-full justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
            icon={Play}
          >
            {t("tasks.detail.header.actions.startWorking")}
          </Button>
        )}

        {task.status === "in_progress" && (
          <Button
            onClick={() => onStatusChange("todo")}
            disabled={actionLoading}
            variant="outline"
            className="w-full justify-center border-dashed"
            icon={Pause}
          >
            {t("tasks.detail.header.actions.pauseTask")}
          </Button>
        )}

        {/* Completion */}
        {task.status !== "completed" && (
          <Button
            onClick={onComplete}
            disabled={actionLoading}
            className="w-full justify-center bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
            icon={CheckCircle}
          >
            {t("tasks.detail.header.actions.markComplete")}
          </Button>
        )}

        {/* Archive */}
        <Button
          onClick={onArchive}
          disabled={actionLoading}
          variant="outline"
          className="w-full justify-center text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          icon={Archive}
        >
          {t("tasks.detail.header.actions.archiveTask")}
        </Button>
      </div>
    </div>
  );
};

export default TaskHeader;
