import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Smartphone,
  Calendar,
  User,
  CheckSquare,
  ArrowUpRight,
  Layers,
  Radio
} from 'lucide-react';

// ✅ Generic Components
import Badge from '../../../components/common/Badge';

const DetailsTab = ({ reminder }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Helper: Map notification types to Icons
  const getNotificationIcon = (method) => {
    const map = {
      email: <Mail className="w-3.5 h-3.5" />,
      sms: <MessageSquare className="w-3.5 h-3.5" />,
      push: <Smartphone className="w-3.5 h-3.5" />,
      in_app: <Bell className="w-3.5 h-3.5" />,
    };
    return map[method] || <Bell className="w-3.5 h-3.5" />;
  };

  // Helper: Reusable Row Component (Matches ReminderInfo/RecurrenceTab)
  const InfoRow = ({ icon: Icon, label, children, color = "blue", action = null }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    };

    return (
      <div className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 group">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            {label}
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white break-words">
            {children}
          </div>
        </div>

        {action && (
          <button
            onClick={action}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-full transition-colors"
            title={t('common.viewDetails')}
          >
            <ArrowUpRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Layers className="w-5 h-5 text-indigo-500" />
        {t('reminders.details.additionalInfo')}
      </h3>

      <div className="flex flex-col gap-1">
        
        {/* --- Notification Methods --- */}
        <InfoRow 
          icon={Radio} 
          label={t('reminders.details.notificationMethods')} 
          color="blue"
        >
          {reminder.notificationMethods && reminder.notificationMethods.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {reminder.notificationMethods.map((method, index) => (
                <Badge 
                  key={index} 
                  variant="info" 
                  size="sm" 
                  icon={getNotificationIcon(method)}
                  className="capitalize"
                >
                  {method.replace("_", " ")}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 font-normal italic">
              {t('reminders.noNotificationMethods', 'No active notifications configured')}
            </span>
          )}
        </InfoRow>

        {/* --- Related Items --- */}
        
        {/* Related Event */}
        {reminder.relatedEvent && (
          <InfoRow 
            icon={Calendar}
            label={t('reminders.type.event')}
            color="orange"
            action={() => navigate(`/events/${reminder.relatedEvent._id}`)}
          >
            {reminder.relatedEvent.title}
          </InfoRow>
        )}

        {/* Related Client */}
        {reminder.relatedClient && (
          <InfoRow 
            icon={User}
            label={t('reminders.type.client')}
            color="indigo"
            action={() => navigate(`/clients/${reminder.relatedClient._id}`)}
          >
            {reminder.relatedClient.name}
          </InfoRow>
        )}

        {/* Related Task */}
        {reminder.relatedTask && (
          <InfoRow 
            icon={CheckSquare}
            label={t('reminders.type.task')}
            color="green"
            action={() => navigate(`/tasks/${reminder.relatedTask._id}`)}
          >
            {reminder.relatedTask.title}
          </InfoRow>
        )}

        {/* Empty State for Relations */}
        {!reminder.relatedEvent && !reminder.relatedClient && !reminder.relatedTask && (
          <div className="py-4 text-center">
            <p className="text-xs text-gray-400 italic">
              {t('reminders.details.noLinkedItems', 'This reminder is not linked to any specific events, clients, or tasks.')}
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default DetailsTab;