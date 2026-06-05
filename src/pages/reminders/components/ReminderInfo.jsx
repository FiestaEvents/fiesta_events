import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  AlignLeft, 
  Calendar, 
  Tag, 
  Link2, 
  User,
  Clock,
  AlertCircle
} from 'lucide-react';

// Generic Components
import Badge from '../../../components/common/Badge';

const ReminderInfo = ({ reminder, formatDate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!reminder) return null;

  // Helper to get priority badge styling
  const getPriorityBadge = (priority) => {
    const variants = {
      urgent: { variant: 'danger', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
      high: { variant: 'warning', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      medium: { variant: 'info', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      low: { variant: 'secondary', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
    };
    return variants[priority?.toLowerCase()] || variants.low;
  };

  const priorityStyle = getPriorityBadge(reminder.priority);

  // Info Block Component
  const InfoBlock = ({ icon: Icon, label, children, className = "" }) => (
    <div className={`flex items-start gap-4 ${className}`}>
      <div className="p-3 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 mt-1 flex-shrink-0">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </h4>
        <div className="text-gray-900 dark:text-white text-base">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      
      {/* Description */}
      <InfoBlock 
        icon={AlignLeft} 
        label={t('reminders.form.fields.description', 'Description')}
      >
        {reminder.description ? (
          <p className="leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {reminder.description}
          </p>
        ) : (
          <span className="text-gray-400 dark:text-gray-500 italic text-sm">
            {t('reminders.noDescription', 'No description provided')}
          </span>
        )}
      </InfoBlock>

      {/* Date & Time + Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Date & Time */}
        <InfoBlock 
          icon={Calendar} 
          label={t('reminders.dateTime', 'Date & Time')}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-semibold">
                {formatDate ? formatDate(reminder.reminderDate) : new Date(reminder.reminderDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {reminder.reminderTime}
              </span>
            </div>
          </div>
        </InfoBlock>

        {/* Type & Priority */}
        <InfoBlock 
          icon={Tag} 
          label={t('reminders.category', 'Category')}
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" size="md" className="capitalize">
              {t(`reminders.type.${reminder.type}`, reminder.type)}
            </Badge>
            <Badge 
              variant={priorityStyle.variant}
              size="md" 
              className="capitalize"
            >
              {t(`reminders.priority.${reminder.priority}`, reminder.priority)}
            </Badge>
          </div>
        </InfoBlock>
      </div>

      {/* Linked Items (If any) */}
      {(reminder.relatedEvent || reminder.relatedClient || reminder.relatedTask || reminder.relatedPayment) && (
        <InfoBlock 
          icon={Link2} 
          label={t('reminders.linkedTo', 'Linked Items')}
        >
          <div className="flex flex-wrap gap-2">
            
            {reminder.relatedEvent && (
              <button
                onClick={() => navigate(`/events/${reminder.relatedEvent._id}`)}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-orange-50 text-orange-700 border border-orange-100 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800 dark:hover:bg-orange-900/30 transition-colors text-sm font-medium"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {reminder.relatedEvent.title || t('common.event', 'Event')}
              </button>
            )}
            
            {reminder.relatedClient && (
              <button
                onClick={() => navigate(`/clients/${reminder.relatedClient._id}`)}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800 dark:hover:bg-indigo-900/30 transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4 mr-2" />
                {reminder.relatedClient.name || t('common.client', 'Client')}
              </button>
            )}
            
            {reminder.relatedTask && (
              <button
                onClick={() => navigate(`/tasks/${reminder.relatedTask._id}`)}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-100 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30 transition-colors text-sm font-medium"
              >
                <Tag className="w-4 h-4 mr-2" />
                {reminder.relatedTask.title || t('common.task', 'Task')}
              </button>
            )}

            {reminder.relatedPayment && (
              <div className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 text-sm font-medium">
                <AlertCircle className="w-4 h-4 mr-2" />
                {t('reminders.paymentLinked', 'Payment')}
              </div>
            )}
          </div>
        </InfoBlock>
      )}

      {/* Created By Footer */}
      {reminder.createdBy && (
        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                {t('common.createdBy', 'Created by')}
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {reminder.createdBy.name || t('common.unknown', 'Unknown')}
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(reminder.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderInfo;