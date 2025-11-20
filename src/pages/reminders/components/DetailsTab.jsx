import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Mail, 
  MessageSquare, 
  Bell,
  Calendar,
  User,
  CheckCircle,
  Link as LinkIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DetailsTab = ({ reminder, formatDate, getStatusColor, getPriorityColor }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getNotificationIcon = (method) => {
    const icons = {
      email: Mail,
      sms: MessageSquare,
      push: Bell,
      in_app: Bell,
    };
    return icons[method] || Bell;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  return (
    <div className="space-y-6">
      {/* Notification Methods */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('reminders.details.notificationMethods')}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {reminder.notificationMethods?.map((method, index) => {
            const Icon = getNotificationIcon(method);
            return (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
              >
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300 capitalize">
                  {method.replace("_", " ")}
                </span>
              </div>
            );
          })}
        </div>
        {(!reminder.notificationMethods || reminder.notificationMethods.length === 0) && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('reminders.noNotificationMethods')}
          </p>
        )}
      </div>

      {/* Related Items */}
      {(reminder.relatedEvent || reminder.relatedClient || reminder.relatedTask) && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('reminders.details.relatedTo')}
          </h3>
          <div className="space-y-3">
            {reminder.relatedEvent && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {reminder.relatedEvent.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('reminders.type.event')}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/events/${reminder.relatedEvent._id}`)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {reminder.relatedClient && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {reminder.relatedClient.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('reminders.type.client')}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/clients/${reminder.relatedClient._id}`)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {reminder.relatedTask && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {reminder.relatedTask.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('reminders.type.task')}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/tasks/${reminder.relatedTask._id}`)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsTab;