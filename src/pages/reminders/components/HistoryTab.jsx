import React from 'react';
import { useTranslation } from 'react-i18next';
import { History, Clock, Construction } from 'lucide-react';

const HistoryTab = ({ reminder, formatDate }) => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Section Header */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <History className="w-5 h-5 text-blue-500" />
        {t('reminders.details.activityHistory')}
      </h3>

      {/* Content / Empty State */}
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4 ring-8 ring-blue-50/50 dark:ring-blue-900/10">
          <Clock className="w-8 h-8 text-blue-500 dark:text-blue-400" />
        </div>
        
        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
          {t('reminders.history.comingSoon', 'Activity Log Coming Soon')}
        </h4>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm leading-relaxed">
          {t('reminders.history.description', 'We are working on a detailed timeline to track changes, snoozes, and completion history for this reminder.')}
        </p>
      </div>
    </div>
  );
};

export default HistoryTab;