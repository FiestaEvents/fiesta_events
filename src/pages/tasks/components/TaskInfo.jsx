import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  AlertTriangle,
  Info,
  Timer,
  CalendarClock
} from 'lucide-react';

// ✅ Generic Components
import Badge from '../../../components/common/Badge';

const TaskInfo = ({ 
  task, 
  formatDate, // Assumed to be DD/MM/YYYY from parent
  isOverdue 
}) => {
  const { t } = useTranslation();

  // Helper: Reusable Info Row (Matches ReminderInfo style)
  const InfoRow = ({ icon: Icon, label, children, value, color = "blue", isBadge = false, badgeVariant = "secondary" }) => {
    if (!value && !children) return null;

    const colorClasses = {
      gray: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
    };

    return (
      <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
            {label}
          </div>
          
          {isBadge ? (
            <Badge variant={badgeVariant} className="capitalize">
              {value}
            </Badge>
          ) : (
            <div className="text-sm font-semibold text-gray-900 dark:text-white break-words">
              {children || value}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Section Header */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-500" />
        {t('tasks.detail.info.title')}
      </h3>
      
      <div className="flex flex-col gap-1">
        
        {/* --- Dates --- */}
        
        {/* Due Date */}
        <InfoRow 
          icon={Calendar} 
          label={t('tasks.detail.info.dueDate')} 
          color={isOverdue(task.dueDate, task.status) ? "red" : "orange"}
        >
          <span className={isOverdue(task.dueDate, task.status) ? "text-red-600 dark:text-red-400" : ""}>
            {formatDate(task.dueDate)}
          </span>
        </InfoRow>
        
        {/* Start Date */}
        {task.startDate && (
          <InfoRow 
            icon={CalendarClock} 
            label={t('tasks.detail.info.startDate')} 
            value={formatDate(task.startDate)} 
            color="blue"
          />
        )}
        
        {/* --- Metadata --- */}

        {/* Assigned To */}
        {task.assignedTo && (
          <InfoRow 
            icon={User} 
            label={t('tasks.detail.info.assignedTo')} 
            value={task.assignedTo.name} 
            color="purple"
          />
        )}
        
        {/* Category */}
        {task.category && (
          <InfoRow 
            icon={Tag} 
            label={t('tasks.detail.info.category')} 
            value={task.category.replace(/_/g, " ")} 
            color="teal"
            isBadge={true}
            badgeVariant="info"
          />
        )}
        
        {/* --- Time Tracking --- */}

        {/* Estimated Hours */}
        {task.estimatedHours && (
          <InfoRow 
            icon={Timer} 
            label={t('tasks.detail.info.estimatedHours')} 
            value={`${task.estimatedHours}h`} 
            color="gray"
          />
        )}
        
        {/* Actual Hours */}
        {task.actualHours && (
          <InfoRow 
            icon={Clock} 
            label={t('tasks.detail.info.actualHours')} 
            value={`${task.actualHours}h`} 
            color="green"
          />
        )}
      </div>

      {/* --- Blocked Status Alert --- */}
      {task.status === "blocked" && task.blockedReason && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-800 dark:text-red-300 mb-1 uppercase tracking-wide">
                {t('tasks.detail.info.taskBlocked')}
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 leading-relaxed">
                "{task.blockedReason}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskInfo;