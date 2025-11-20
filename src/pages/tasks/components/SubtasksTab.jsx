import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckSquare } from 'lucide-react';
import ProgressBar from '../../../components/common/ProgressBar';
import EmptyState from '../../../components/common/EmptyState';

const SubtasksTab = ({ task, progress, completedSubtasks, totalSubtasks, formatShortDate }) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('tasks.detail.subtasks.title')}
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {t('tasks.detail.subtasks.completed', { completed: completedSubtasks, total: totalSubtasks })}
        </span>
      </div>

      {totalSubtasks > 0 ? (
        <>
          <div className="mb-6">
            <ProgressBar value={progress} />
          </div>
          <div className="space-y-3">
            {task.subtasks.map((subtask, index) => (
              <div
                key={subtask._id || index}
                className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
              >
                <div className={`w-5 h-5 rounded border-2 mt-0.5 flex-shrink-0 ${
                  subtask.completed
                    ? "bg-green-500 border-green-500"
                    : "border-gray-300 dark:border-gray-500"
                }`}>
                  {subtask.completed && (
                    <CheckSquare className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <p className={`font-medium ${
                    subtask.completed
                      ? "line-through text-gray-500 dark:text-gray-400"
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {subtask.title}
                  </p>
                  {subtask.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {subtask.description}
                    </p>
                  )}
                  {subtask.completedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {subtask.completedBy 
                        ? t('tasks.detail.subtasks.completedBy', { 
                            date: formatShortDate(subtask.completedAt), 
                            user: subtask.completedBy.name || subtask.completedBy 
                          })
                        : t('tasks.detail.subtasks.completedDate', { date: formatShortDate(subtask.completedAt) })
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          icon={CheckSquare}
          title={t('tasks.detail.subtasks.noSubtasks')}
          description={t('tasks.detail.subtasks.noSubtasksDescription')}
          size="lg"
        />
      )}
    </div>
  );
};

export default SubtasksTab;