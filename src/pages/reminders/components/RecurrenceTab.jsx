import React from 'react';
import { useTranslation } from 'react-i18next';
import { Repeat } from 'lucide-react';

const RecurrenceTab = ({ reminder, formatDate }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('reminders.details.recurrenceSettings')}
      </h3>

      {reminder.isRecurring ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('reminders.form.fields.frequency')}
              </label>
              <p className="text-gray-900 dark:text-white mt-1 capitalize">
                {reminder.recurrence?.frequency}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('reminders.form.fields.interval')}
              </label>
              <p className="text-gray-900 dark:text-white mt-1">
                {t('reminders.every')} {reminder.recurrence?.interval}{" "}
                {reminder.recurrence?.frequency}
              </p>
            </div>
          </div>

          {reminder.recurrence?.endDate && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('reminders.recurrence.endDate')}
              </label>
              <p className="text-gray-900 dark:text-white mt-1">
                {formatDate(reminder.recurrence.endDate)}
              </p>
            </div>
          )}

          {reminder.recurrence?.daysOfWeek &&
            reminder.recurrence.daysOfWeek.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('reminders.form.fields.daysOfWeek')}
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {reminder.recurrence.daysOfWeek.map((day) => (
                    <span
                      key={day}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded border border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300"
                    >
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {reminder.recurrence?.dayOfMonth && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('reminders.recurrence.dayOfMonth')}
              </label>
              <p className="text-gray-900 dark:text-white mt-1">
                {t('reminders.recurrence.day')} {reminder.recurrence.dayOfMonth}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Repeat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('reminders.recurrence.oneTime')}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecurrenceTab;