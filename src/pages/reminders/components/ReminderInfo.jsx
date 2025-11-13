import React from 'react';
import { 
  Calendar, 
  Clock, 
  Bell,
  User,
  Repeat,
  FileText
} from 'lucide-react';

const ReminderInfo = ({ reminder, formatDate, getStatusColor, getPriorityColor }) => {
  const DetailItem = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {label}
        </p>
        <p className="text-sm text-gray-900 dark:text-white break-words">
          {value || '-'}
        </p>
      </div>
    </div>
  );

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Reminder Information
      </h3>
      
      <div className="space-y-1">
        <DetailItem label="Reminder Date" value={formatDate(reminder.reminderDate || reminder.dueDate)} icon={Calendar} />
        
        {reminder.reminderTime && (
          <DetailItem label="Reminder Time" value={formatTime(reminder.reminderTime)} icon={Clock} />
        )}
        
        <DetailItem label="Type" value={reminder.type?.replace('_', ' ') || 'General'} icon={Bell} />
        
        <DetailItem label="Priority" value={reminder.priority?.charAt(0).toUpperCase() + reminder.priority?.slice(1)} icon={Bell} />
        
        {reminder.isRecurring && (
          <DetailItem label="Recurring" value="Yes" icon={Repeat} />
        )}
        
        {reminder.description && (
          <DetailItem label="Description" value={reminder.description} icon={FileText} />
        )}
        
        {reminder.notes && (
          <DetailItem label="Notes" value={reminder.notes} icon={FileText} />
        )}
      </div>
    </div>
  );
};

export default ReminderInfo;