import React from 'react';
import { useTranslation } from 'react-i18next'; 
import { 
  Repeat, 
  CalendarClock, 
  Calendar, 
  Hash, 
  CalendarDays,
  CheckCircle2
} from 'lucide-react';

// ✅ Generic Components  
import Badge from '../../../components/common/Badge';

const RecurrenceTab = ({ reminder, formatDate }) => {
  const { t } = useTranslation();

  // Helper Row Component (Matched to ReminderInfo style)
  const InfoRow = ({ icon: Icon, label, children, value, color = "blue" }) => {
    if (!value && !children) return null;

    const colorClasses = {
      orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
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
          
          <div className="text-sm font-semibold text-gray-900 dark:text-white break-words">
            {children || value}
          </div>
        </div>
      </div>
    );
  };

  const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Repeat className="w-5 h-5 text-green-500" />
        {t('reminders.details.recurrenceSettings')}
      </h3>

      {reminder.isRecurring ? (
        <div className="flex flex-col gap-1">
          
          {/* Frequency */}
          <InfoRow 
            icon={Repeat} 
            label={t('reminders.form.fields.frequency')} 
            value={reminder.recurrence?.frequency}
            color="purple" 
            className="capitalize"
          />

          {/* Interval */}
          <InfoRow 
            icon={Hash} 
            label={t('reminders.form.fields.interval')}
            color="blue"
          >
             {t('reminders.every')} {reminder.recurrence?.interval} {reminder.recurrence?.frequency}
          </InfoRow>

          {/* End Date */}
          <InfoRow 
            icon={CalendarClock} 
            label={t('reminders.recurrence.endDate')}
            value={reminder.recurrence?.endDate ? formatDate(reminder.recurrence.endDate) : t('reminders.recurrence.forever')}
            color="orange"
          />

          {/* Days of Week (Custom Render) */}
          {reminder.recurrence?.daysOfWeek && reminder.recurrence.daysOfWeek.length > 0 && (
            <InfoRow 
              icon={CalendarDays} 
              label={t('reminders.form.fields.daysOfWeek')}
              color="teal"
            >
              <div className="flex flex-wrap gap-2 mt-1">
                {reminder.recurrence.daysOfWeek.map((day) => (
                  <Badge 
                    key={day} 
                    variant="info" 
                    size="sm"
                    className="font-normal"
                  >
                    {daysMap[day]}
                  </Badge>
                ))}
              </div>
            </InfoRow>
          )}

          {/* Day of Month */}
          {reminder.recurrence?.dayOfMonth && (
            <InfoRow 
              icon={Calendar} 
              label={t('reminders.recurrence.dayOfMonth')}
              color="green"
            >
              {t('reminders.recurrence.day')} {reminder.recurrence.dayOfMonth}
            </InfoRow>
          )}

        </div>
      ) : (
        /* Empty State aligned with Reference Style */
        <div className="flex flex-col items-center justify-center py-10 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-gray-900 dark:text-white font-medium mb-1">
            {t('reminders.recurrence.oneTime')}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
            {t('reminders.recurrence.noRecurrenceText', 'This reminder does not repeat.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default RecurrenceTab;