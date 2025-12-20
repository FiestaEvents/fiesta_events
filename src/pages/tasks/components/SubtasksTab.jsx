import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ListTodo, 
  CheckCircle2, 
  Circle, 
  User, 
  Calendar,
  CheckSquare,
} from 'lucide-react';

// ✅ Services & Hooks
import { taskService } from '../../../api/index';
import { useToast } from '../../../context/ToastContext';
import OrbitLoader from '../../../components/common/LoadingSpinner';
const SubtasksTab = ({ task, progress, completedSubtasks, totalSubtasks, formatShortDate, refreshData }) => {
  const { t } = useTranslation();
  const { showError } = useToast();
  
  // Track which subtasks are currently being toggled to show loading spinners
  const [togglingItems, setTogglingItems] = useState(new Set());

  const handleToggleSubtask = async (subtaskId, currentStatus) => {
    // Prevent double clicks
    if (togglingItems.has(subtaskId)) return;

    // Optimistically add to loading set
    setTogglingItems(prev => new Set(prev).add(subtaskId));

    try {
      // Call API to update specific subtask
      await taskService.updateSubtask(task._id, subtaskId, { 
        completed: !currentStatus 
      });
      
      // Refresh parent data to calculate new progress/totals
      await refreshData();
    } catch (error) {
      console.error("Failed to toggle subtask", error);
      showError(t('tasks.detail.subtasks.errorToggle'));
    } finally {
      // Remove from loading set
      setTogglingItems(prev => {
        const next = new Set(prev);
        next.delete(subtaskId);
        return next;
      });
    }
  };

  return (
    <div>
      {/* --- Header --- */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-purple-500" />
          {t('tasks.detail.subtasks.title')}
        </h3>
        
        {totalSubtasks > 0 && (
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-full">
            {completedSubtasks} / {totalSubtasks} {t('common.completed')}
          </span>
        )}
      </div>

      {totalSubtasks > 0 ? (
        <div className="space-y-6">
          
          {/* --- Progress Bar --- */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <span>{t('tasks.detail.overview.progress')}</span>
              <span className="text-purple-600 dark:text-purple-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* --- List --- */}
          <div className="space-y-3">
            {task.subtasks.map((subtask, index) => {
              const isToggling = togglingItems.has(subtask._id);
              
              return (
                <div
                  key={subtask._id || index}
                  onClick={() => handleToggleSubtask(subtask._id, subtask.completed)}
                  className={`group flex items-start p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    subtask.completed
                      ? "bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 opacity-75"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:border-purple-200 dark:hover:border-purple-900"
                  }`}
                >
                  {/* Checkbox Icon / Loader */}
                  <div className="mt-0.5 flex-shrink-0">
                    {isToggling ? (
                      <OrbitLoader className="w-5 h-5 text-purple-500 animate-spin" />
                    ) : (
                      <div className={`transition-colors ${
                        subtask.completed ? "text-green-500" : "text-gray-300 dark:text-gray-600 group-hover:text-purple-500"
                      }`}>
                        {subtask.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="ml-4 flex-1 min-w-0">
                    <p className={`text-sm font-semibold break-words transition-all ${
                      subtask.completed
                        ? "text-gray-500 dark:text-gray-500 line-through"
                        : "text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400"
                    }`}>
                      {subtask.title}
                    </p>
                    
                    {subtask.description && (
                      <p className={`text-xs mt-1 ${
                        subtask.completed ? "text-gray-400" : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {subtask.description}
                      </p>
                    )}

                    {/* Metadata (Completed By) */}
                    {subtask.completed && subtask.completedAt && (
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatShortDate(subtask.completedAt)}
                        </div>
                        {subtask.completedBy && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                            <User className="w-3 h-3" />
                            {subtask.completedBy.name || t('tasks.unknown')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* --- Standard Empty State --- */
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4 text-purple-400 dark:text-purple-500">
            <CheckSquare className="w-8 h-8" />
          </div>
          <h4 className="text-gray-900 dark:text-white font-medium mb-1">
            {t('tasks.detail.subtasks.noSubtasks')}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
            {t('tasks.detail.subtasks.noSubtasksDescription', 'Break this task down into smaller steps to track progress better.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default SubtasksTab;