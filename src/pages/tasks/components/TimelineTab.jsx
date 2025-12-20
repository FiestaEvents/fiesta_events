import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  User, 
  CheckSquare, 
  AlertCircle, 
  Clock, 
  History,
  ArrowRight
} from 'lucide-react';

// ✅ Generic Components
import EmptyState from '../../../components/common/EmptyState'; // Assuming this exists based on input
import Badge from '../../../components/common/Badge';

const TimelineTab = ({ task, formatDateTime }) => {
  const { t } = useTranslation();

  // Helper: Map Icon Types to Colors & Icons
  const getEventStyle = (type) => {
    const map = {
      create: { icon: Calendar, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
      assign: { icon: User, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
      complete: { icon: CheckSquare, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
      cancel: { icon: AlertCircle, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
      status: { icon: ArrowRight, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800" },
      default: { icon: Clock, color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", border: "border-gray-200 dark:border-gray-700" },
    };
    return map[type] || map.default;
  };

  const TimelineItem = ({ date, title, description, icon, isLast }) => {
    const style = getEventStyle(icon);
    const IconComponent = style.icon;

    return (
      <div className="relative pl-8 pb-8 last:pb-0 group">
        {/* Vertical Line */}
        {!isLast && (
          <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 group-last:hidden"></div>
        )}

        {/* Icon Bubble */}
        <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-900 ${style.color}`}>
          <IconComponent className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-4 shadow-sm -mt-2 transition-shadow hover:shadow-md">
          <div className="flex justify-between items-start gap-4 mb-1">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              {title}
            </h4>
            <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
              {date ? formatDateTime(date) : t('tasks.detail.timeline.unknownDate')}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    );
  };

  // Build Event List
  const timelineEvents = [];

  if (task.createdAt) {
    timelineEvents.push({
      date: task.createdAt,
      title: t('tasks.detail.timeline.events.created'),
      description: (
        <span>
          {t('tasks.detail.timeline.by')} <span className="font-medium text-gray-900 dark:text-white">{task.createdBy?.name || "System"}</span>
        </span>
      ),
      icon: "create"
    });
  }

  if (task.assignedAt && task.assignedTo) {
    timelineEvents.push({
      date: task.assignedAt,
      title: t('tasks.detail.timeline.events.assigned'),
      description: (
        <span>
          {t('tasks.detail.timeline.to')} <span className="font-medium text-gray-900 dark:text-white">{task.assignedTo.name}</span>
        </span>
      ),
      icon: "assign"
    });
  }

  if (task.history && Array.isArray(task.history)) {
    task.history.forEach(item => {
      if (item.type === 'status_change') {
        timelineEvents.push({
          date: item.timestamp,
          title: t('tasks.detail.timeline.events.statusChanged'),
          description: (
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" size="sm">{item.oldStatus}</Badge>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <Badge variant="primary" size="sm">{item.newStatus}</Badge>
              <span className="text-xs text-gray-400 ml-1">
                ({t('tasks.detail.timeline.by')} {item.user?.name || 'System'})
              </span>
            </div>
          ),
          icon: "status"
        });
      }
    });
  }

  if (task.completedAt) {
    timelineEvents.push({
      date: task.completedAt,
      title: t('tasks.detail.timeline.events.completed'),
      description: task.completedBy 
        ? <span>{t('tasks.detail.timeline.by')} <span className="font-medium text-gray-900 dark:text-white">{task.completedBy.name}</span></span>
        : t('tasks.detail.timeline.events.completed'),
      icon: "complete"
    });
  }

  if (task.cancelledAt) {
    timelineEvents.push({
      date: task.cancelledAt,
      title: t('tasks.detail.timeline.events.cancelled'),
      description: task.cancellationReason || t('tasks.detail.timeline.noReason'),
      icon: "cancel"
    });
  }

  // Sort descending (newest first) for timeline usually looks better, 
  // but can be ascending based on preference. Using Ascending here to match logic.
  const sortedTimelineEvents = timelineEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-orange-500" />
          {t('tasks.detail.timeline.title')}
        </h3>
        <Badge variant="secondary" size="sm">
          {sortedTimelineEvents.length} {t('common.events', 'Events')}
        </Badge>
      </div>

      {sortedTimelineEvents.length > 0 ? (
        <div className="relative pl-2">
          {sortedTimelineEvents.map((event, index) => (
            <TimelineItem
              key={index}
              {...event}
              isLast={index === sortedTimelineEvents.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="py-12">
          <EmptyState
            icon={Clock}
            title={t('tasks.detail.timeline.noEvents')}
            description={t('tasks.detail.timeline.noEventsDescription')}
          />
        </div>
      )}
    </div>
  );
};

export default TimelineTab;