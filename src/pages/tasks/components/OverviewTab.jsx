import React from 'react';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import ProgressBar from '../../../components/common/ProgressBar';
import EmptyState from '../../../components/common/EmptyState';

const OverviewTab = ({ task, progress, completedSubtasks, totalSubtasks, formatDate, formatDateTime }) => {
  return (
    <div className="space-y-6">
      {/* Progress & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Progress</p>
          <ProgressBar value={progress} size="lg" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
            {Math.round(progress)}%
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Subtasks</p>
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
            {completedSubtasks}/{totalSubtasks}
          </p>
        </div>

        {task.estimatedHours && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Estimated</p>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
              {task.estimatedHours}h
            </p>
          </div>
        )}

        {task.actualHours && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Actual</p>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
              {task.actualHours}h
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Description
        </h3>
        {task.description ? (
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {task.description}
          </p>
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="No description"
            description="No description provided for this task."
            size="sm"
          />
        )}
      </div>
    </div>
  );
};

export default OverviewTab;