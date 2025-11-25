import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Clock, 
  Bell,
  Tag,
  Repeat,
  FileText,
  AlignLeft,
  AlertCircle
} from 'lucide-react';

// ✅ Generic Components
import Badge from '../../../components/common/Badge';

const ReminderInfo = ({ reminder, formatDate }) => {
  const { t } = useTranslation();

  // Helper: Strict 24h Time Format
  const formatTime = (time) => {
    if (!time) return "";
    try {
      // Append dummy date to parse time string correctly
      return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return time;
    }
  };

  // Helper for Badge Variants
  const getPriorityVariant = (p) => {
    const map = { urgent: "danger", high: "warning", medium: "info", low: "secondary" };
    return map[p?.toLowerCase()] || "secondary";
  };

  const getTypeVariant = (t) => {
    const map = { event: "blue", payment: "yellow", task: "purple", maintenance: "orange", followup: "success" };
    return map[t?.toLowerCase()] || "secondary";
  };

  // Helper Row Component
  const InfoRow = ({ icon: Icon, label, value, color = "blue", isBadge = false, badgeVariant = "secondary" }) => {
    if (!value) return null;

    const colorClasses = {
      orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
      gray: "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
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
              {value}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Bell className="w-5 h-5 text-orange-500" />
        {t('reminders.details.reminderInfo')}
      </h3>
      
      <div className="flex flex-col gap-1">
        
        {/* --- TIMING --- */}
        <InfoRow 
          icon={Calendar} 
          label={t('reminders.form.fields.date')} 
          value={formatDate(reminder.reminderDate || reminder.dueDate)} 
          color="orange"
        />
        
        <InfoRow 
          icon={Clock} 
          label={t('reminders.form.fields.time')} 
          value={formatTime(reminder.reminderTime)} 
          color="blue"
        />

        {/* --- CLASSIFICATION --- */}
        <InfoRow 
          icon={Tag} 
          label={t('reminders.form.fields.type')} 
          value={reminder.type} 
          color="purple"
          isBadge={true}
          badgeVariant={getTypeVariant(reminder.type)}
        />
        
        <InfoRow 
          icon={AlertCircle} 
          label={t('reminders.form.fields.priority')} 
          value={reminder.priority} 
          color="red"
          isBadge={true}
          badgeVariant={getPriorityVariant(reminder.priority)}
        />

        {/* --- RECURRENCE --- */}
        {reminder.isRecurring && (
          <InfoRow 
            icon={Repeat} 
            label={t('reminders.recurrence.label')} 
            value={
              reminder.recurrence 
                ? `${reminder.recurrence.frequency} (Every ${reminder.recurrence.interval})` 
                : t('reminders.yes')
            } 
            color="green"
          />
        )}
      </div>

      {/* --- CONTENT --- */}
      <div className="mt-6 space-y-4">
        {reminder.description && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5" />
              {t('reminders.form.fields.description')}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {reminder.description}
            </p>
          </div>
        )}
        
        {reminder.notes && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800/30">
            <h4 className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              {t('reminders.form.fields.notes')}
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed italic">
              "{reminder.notes}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReminderInfo;