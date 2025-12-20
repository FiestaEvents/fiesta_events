import React from 'react';
import { useTranslation } from 'react-i18next';
import { History, Clock, Calendar, CheckCircle, User, Edit } from 'lucide-react';

const HistoryTab = ({ reminder, formatDate }) => {
  const { t } = useTranslation();

  // Timeline Events (for future implementation)
  const timelineEvents = [
    {
      type: 'created',
      icon: Calendar,
      date: reminder.createdAt,
      user: reminder.createdBy,
      color: 'blue',
    },
    reminder.updatedAt !== reminder.createdAt && {
      type: 'updated',
      icon: Edit,
      date: reminder.updatedAt,
      color: 'orange',
    },
    reminder.status === 'completed' && reminder.completedAt && {
      type: 'completed',
      icon: CheckCircle,
      date: reminder.completedAt,
      color: 'green',
    },
  ].filter(Boolean);

  return (
    <div>
      {/* Section Header */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <History className="w-5 h-5 text-blue-500" />
        {t('reminders.details.activityHistory', 'Activity History')}
      </h3>

      {/* Current Timeline (Basic) */}
      {timelineEvents.length > 0 && (
        <div className="mb-8 space-y-4">
          {timelineEvents.map((event, index) => {
            const Icon = event.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
              orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800',
              green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
            };

            return (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${colorClasses[event.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {t(`reminders.history.${event.type}`, event.type)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate ? formatDate(event.date) : new Date(event.date).toLocaleDateString()}
                    {event.user && (
                      <span className="ml-2">
                        {t('common.by', 'by')} {event.user.name}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Coming Soon Feature */}
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-dashed border-blue-200 dark:border-blue-800">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 ring-8 ring-blue-50/50 dark:ring-blue-900/10">
          <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
          {t('reminders.history.comingSoon', 'Detailed Activity Log Coming Soon')}
        </h4>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md leading-relaxed mb-4">
          {t('reminders.history.description', 'Track all changes, status updates, snoozes, and completion history for this reminder.')}
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            {t('reminders.history.features.edits', 'Edit History')}
          </span>
          <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
             {t('reminders.history.features.completions', 'Completions')}
          </span>
          <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
             {t('reminders.history.features.assignments', 'Assignments')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;