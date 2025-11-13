import React from 'react';
import { 
  Calendar, 
  User, 
  Tag,
  Clock,
  AlertTriangle
} from 'lucide-react';

const TaskInfo = ({ 
  task, 
  formatDate, 
  formatShortDate, 
  getStatusColor, 
  getPriorityColor,
  isOverdue 
}) => {
  const DetailItem = ({ label, value, icon: Icon, warning = false }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${warning ? 'text-red-500' : 'text-gray-400'}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </p>
        <p className={`text-sm ${warning ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-900 dark:text-white'}`}>
          {value || '-'}
        </p>
      </div>
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Task Information
      </h3>
      
      <div className="space-y-1">
        <DetailItem 
          label="Due Date" 
          value={formatShortDate(task.dueDate)} 
          icon={Calendar}
          warning={isOverdue(task.dueDate, task.status)}
        />
        
        {task.startDate && (
          <DetailItem label="Start Date" value={formatShortDate(task.startDate)} icon={Calendar} />
        )}
        
        {task.assignedTo && (
          <DetailItem label="Assigned To" value={task.assignedTo.name} icon={User} />
        )}
        
        {task.category && (
          <DetailItem label="Category" value={task.category.replace("_", " ")} icon={Tag} />
        )}
        
        {task.estimatedHours && (
          <DetailItem label="Estimated Hours" value={`${task.estimatedHours}h`} icon={Clock} />
        )}
        
        {task.actualHours && (
          <DetailItem label="Actual Hours" value={`${task.actualHours}h`} icon={Clock} />
        )}
      </div>

      {/* Blocked Status */}
      {task.status === "blocked" && task.blockedReason && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-300 mb-1">
                Task Blocked
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                {task.blockedReason}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskInfo;