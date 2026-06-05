import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  User,
  CheckSquare,
  ArrowUpRight,
  Layers,
  Users,
  Link2
} from 'lucide-react';

// Generic Components
import Badge from '../../../components/common/Badge';

const DetailsTab = ({ reminder }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Helper: Reusable Row Component
  const InfoRow = ({ icon: Icon, label, children, color = "blue", action = null }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
      teal: "bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400",
    };

    return (
      <div className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 group hover:bg-gray-50 dark:hover:bg-gray-800/30 px-4 -mx-4 rounded-lg transition-colors">
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
            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:text-orange-400 dark:hover:bg-orange-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            title={t('common.viewDetails')}
          >
            <ArrowUpRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  // Check if any related items exist
  const hasRelatedItems = reminder.relatedEvent || reminder.relatedClient || reminder.relatedTask;

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-500" />
          {t('reminders.details.additionalInfo', 'Additional Information')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('reminders.details.subtitle', 'View linked items and assigned users')}
        </p>
      </div>

      {/* Assigned Users */}
      {reminder.assignedTo && reminder.assignedTo.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {t('reminders.assignedTo', 'Assigned To')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {reminder.assignedTo.map((user) => (
              <Badge 
                key={user._id} 
                variant="info" 
                size="md"
              >
                <User className="w-3 h-3 inline mr-1" />
                {user.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Related Items */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          {t('reminders.relatedItems', 'Related Items')}
        </h4>

        {hasRelatedItems ? (
          <div className="space-y-1">
            
            {/* Related Event */}
            {reminder.relatedEvent && (
              <InfoRow 
                icon={Calendar}
                label={t('reminders.type.event', 'Event')}
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
                label={t('common.client', 'Client')}
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
                label={t('common.task', 'Task')}
                color="green"
                action={() => navigate(`/tasks/${reminder.relatedTask._id}`)}
              >
                {reminder.relatedTask.title}
              </InfoRow>
            )}

          </div>
        ) : (
          /* Empty State for Relations */
          <div className="py-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Link2 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('reminders.details.noLinkedItems', 'This reminder is not linked to any items')}
            </p>
          </div>
        )}
      </div>

      {/* Payment Link (if exists) */}
      {reminder.relatedPayment && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('reminders.relatedPayment', 'Related Payment')}
          </h4>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              {t('reminders.paymentLinked', 'This reminder is associated with a payment')}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default DetailsTab;