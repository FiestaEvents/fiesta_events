import React from "react";
import { useTranslation } from "react-i18next";
import { CheckSquare, Edit, Trash2, Play, Pause, Archive, ArrowLeft } from "lucide-react";

const TaskHeader = ({
  task,
  onBack,
  onEdit,
  onDelete,
  onComplete,
  onArchive,
  onStatusChange,
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  actionLoading,
  progress,
  completedSubtasks,
  totalSubtasks,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8 dark:bg-gray-800 dark:border-gray-700">
      {/* Action Buttons */}
      <div className="flex justify-between gap-2 mb-4">
        <div>
          <button
            onClick={onBack}
            className="flex items-center border border-gray-300 p-1 rounded-lg pr-2 gap-2 text-sm text-gray-600 hover:text-gray-900 transition dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('tasks.detail.header.backToTasks')}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition dark:text-gray-400 dark:hover:bg-blue-900 dark:hover:text-white"
            title={t('tasks.detail.header.editTask')}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-400 dark:hover:bg-red-900"
            title={t('tasks.detail.header.deleteTask')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
          <CheckSquare className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mt-4 dark:text-white">
          {task.title || "Untitled Task"}
        </h1>

        <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}
          >
            {getStatusLabel(task.status)}
          </span>
          
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}
          >
            {t('tasks.detail.header.priority', { priority: task.priority })}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>{t('tasks.detail.overview.progress')}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
          {t('tasks.detail.subtasks.completed', { completed: completedSubtasks, total: totalSubtasks })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        {task.status === "todo" && (
          <button
            onClick={() => onStatusChange("in_progress")}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg border border-blue-200 hover:bg-blue-200 transition disabled:opacity-50 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-800"
          >
            <Play className="w-4 h-4" />
            {actionLoading 
              ? t('tasks.detail.header.actions.starting')
              : t('tasks.detail.header.actions.startWorking')
            }
          </button>
        )}
        
        {task.status === "in_progress" && (
          <button
            onClick={() => onStatusChange("todo")}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-200 transition disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <Pause className="w-4 h-4" />
            {actionLoading 
              ? t('tasks.detail.header.actions.pausing')
              : t('tasks.detail.header.actions.pauseTask')
            }
          </button>
        )}
        
        {task.status !== "completed" && (
          <button
            onClick={onComplete}
            disabled={actionLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-200 hover:bg-green-200 transition disabled:opacity-50 dark:bg-green-900 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800"
          >
            <CheckSquare className="w-4 h-4" />
            {actionLoading 
              ? t('tasks.detail.header.actions.completing')
              : t('tasks.detail.header.actions.markComplete')
            }
          </button>
        )}
        
        <button
          onClick={onArchive}
          disabled={actionLoading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-200 hover:bg-gray-200 transition disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <Archive className="w-4 h-4" />
          {actionLoading 
            ? t('tasks.detail.header.actions.archiving')
            : t('tasks.detail.header.actions.archiveTask')
          }
        </button>
      </div>
    </div>
  );
};

export default TaskHeader;