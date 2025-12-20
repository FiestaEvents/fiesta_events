import React from 'react';
import { useTranslation } from 'react-i18next'; 
import { Repeat, Calendar } from 'lucide-react';

const RecurrenceTab = ({ reminder }) => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Header */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Repeat className="w-5 h-5 text-gray-400" />
        {t('reminders.details.recurrenceSettings', 'Recurrence Settings')}
      </h3>

      {/* Not Available Message */}
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 ring-8 ring-gray-50/50 dark:ring-gray-800/50">
          <Calendar className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
          {t('reminders.recurrence.oneTime', 'One-Time Reminder')}
        </h4>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm leading-relaxed">
          {t('reminders.recurrence.noRecurrenceText', 'This reminder does not repeat. Recurring reminders are not currently supported.')}
        </p>

        {/* Future Feature Hint */}
        <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 max-w-md">
          <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
            💡 {t('reminders.recurrence.comingSoon', 'Recurring reminders will be available in a future update')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecurrenceTab;