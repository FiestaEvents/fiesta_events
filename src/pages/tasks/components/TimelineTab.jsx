import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, User, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import EmptyState from '../../../components/common/EmptyState';

const TimelineTab = ({ task, formatDateTime }) => {
  const { t } = useTranslation();

  const TimelineItem = ({ date, title, description, icon }) => {
    const getIcon = () => {
      switch (icon) {
        case "create": return <Calendar className="w-4 h-4" />;
        case "assign": return <User className="w-4 h-4" />;
        case "complete": return <CheckSquare className="w-4 h-4" />;
        case "cancel": return <AlertCircle className="w-4 h-4" />;
        default: return <Clock className="w-4 h-4" />;
      }
    };

    return (
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {date ? formatDateTime(date) : t('tasks.detail.timeline.unknownDate')}
          </p>
        </div>
      </div>
    );
  };

  const timelineEvents = [];

  // Add creation event
  if (task.createdAt) {
    timelineEvents.push({
      date: task.createdAt,
      title: t('tasks.detail.timeline.events.created'),
      description: `${t('tasks.detail.timeline.by')} ${task.createdBy?.name || "System"}`,
      icon: "create"
    });
  }

  // Add assignment event
  if (task.assignedAt && task.assignedTo) {
    timelineEvents.push({
      date: task.assignedAt,
      title: t('tasks.detail.timeline.events.assigned'),
      description: `${t('tasks.detail.timeline.to')} ${task.assignedTo.name}`,
      icon: "assign"
    });
  }

  // Add completion event
  if (task.completedAt) {
    timelineEvents.push({
      date: task.completedAt,
      title: t('tasks.detail.timeline.events.completed'),
      description: task.completedBy 
        ? `${t('tasks.detail.timeline.by')} ${task.completedBy.name}` 
        : t('tasks.detail.timeline.events.completed'),
      icon: "complete"
    });
  }

  // Add cancellation event
  if (task.cancelledAt) {
    timelineEvents.push({
      date: task.cancelledAt,
      title: t('tasks.detail.timeline.events.cancelled'),
      description: task.cancellationReason || t('tasks.detail.timeline.noReason'),
      icon: "cancel"
    });
  }

  // Add status changes from task history if available
  if (task.history && Array.isArray(task.history)) {
    task.history.forEach(historyItem => {
      if (historyItem.type === 'status_change') {
        timelineEvents.push({
          date: historyItem.timestamp,
          title: t('tasks.detail.timeline.events.statusChanged', { status: historyItem.newStatus }),
          description: historyItem.notes || `${t('tasks.detail.timeline.by')} ${historyItem.user?.name || 'System'}`,
          icon: "status"
        });
      }
    });
  }

  // Sort timeline events by date
  const sortedTimelineEvents = timelineEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {t('tasks.detail.timeline.title')}
      </h3>

      {sortedTimelineEvents.length > 0 ? (
        <div className="space-y-6">
          {sortedTimelineEvents.map((event, index) => (
            <TimelineItem
              key={index}
              date={event.date}
              title={event.title}
              description={event.description}
              icon={event.icon}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title={t('tasks.detail.timeline.noEvents')}
          description={t('tasks.detail.timeline.noEventsDescription')}
          size="lg"
        />
      )}
    </div>
  );
};

export default TimelineTab;