import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  PieChart, 
  Timer, 
  FileText,
  Activity
} from 'lucide-react';

const OverviewTab = ({ task, progress, completedSubtasks, totalSubtasks }) => {
  const { t } = useTranslation();

  // Helper: Stat Card Component
  const StatCard = ({ label, value, icon: Icon, color }) => {
    const colorStyles = {
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
            {value}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* --- Key Metrics Grid --- */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" />
          {t('tasks.detail.overview.metrics')}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Progress */}
          <StatCard 
            label={t('tasks.detail.overview.progress')} 
            value={`${Math.round(progress)}%`} 
            icon={PieChart} 
            color="blue" 
          />

          {/* Subtasks */}
          <StatCard 
            label={t('tasks.detail.overview.subtasks')} 
            value={`${completedSubtasks}/${totalSubtasks}`} 
            icon={CheckSquare} 
            color="purple" 
          />

          {/* Estimated Hours */}
          {task.estimatedHours ? (
            <StatCard 
              label={t('tasks.detail.overview.estimated')} 
              value={`${task.estimatedHours}h`} 
              icon={Timer} 
              color="orange" 
            />
          ) : (
            <StatCard 
              label={t('tasks.detail.overview.estimated')} 
              value="-" 
              icon={Timer} 
              color="orange" 
            />
          )}

          {/* Actual Hours */}
          {task.actualHours ? (
            <StatCard 
              label={t('tasks.detail.overview.actual')} 
              value={`${task.actualHours}h`} 
              icon={Clock} 
              color="green" 
            />
          ) : (
            <StatCard 
              label={t('tasks.detail.overview.actual')} 
              value="-" 
              icon={Clock} 
              color="green" 
            />
          )}
        </div>
      </div>

      {/* --- Description --- */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          {t('tasks.detail.overview.description')}
        </h3>
        
        {task.description ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        ) : (
          /* --- Empty State --- */
          <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 text-gray-400 dark:text-gray-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {t('tasks.detail.overview.noDescription', 'No description provided for this task.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;