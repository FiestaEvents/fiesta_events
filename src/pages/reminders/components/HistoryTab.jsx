import React from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

const HistoryTab = ({ reminder, formatDate }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('reminders.details.activityHistory')}
      </h3>

      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          {t('reminders.history.comingSoon')}
        </p>
      </div>
    </div>
  );
};

export default HistoryTab;