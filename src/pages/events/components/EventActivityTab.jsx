import React, { useMemo } from "react";
import {
  Clock,
  Calendar,
  Edit,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
  Activity
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../../utils/formatCurrency";

const EventActivityTab = ({ event, formatDateTime }) => {
  const { t } = useTranslation();

  // Generate activity timeline from event data
  const timeline = useMemo(() => {
    const items = [];

    // 1. Event Created
    if (event.createdAt) {
      items.push({
        id: "created",
        type: "created",
        title: t("eventActivityTab.activity.created.title"),
        description: t("eventActivityTab.activity.created.description", { eventTitle: event.title }),
        timestamp: event.createdAt,
        icon: Calendar,
        color: "info", // Blue
      });
    }

    // 2. Status Logic
    if (event.status) {
      const statusMap = {
        confirmed: {
          title: t("eventActivityTab.activity.status.confirmed.title"),
          description: t("eventActivityTab.activity.status.confirmed.description"),
          icon: CheckCircle,
          color: "success", // Green
        },
        "in-progress": {
          title: t("eventActivityTab.activity.status.in-progress.title"),
          description: t("eventActivityTab.activity.status.in-progress.description"),
          icon: Clock,
          color: "purple",
        },
        completed: {
          title: t("eventActivityTab.activity.status.completed.title"),
          description: t("eventActivityTab.activity.status.completed.description"),
          icon: CheckCircle,
          color: "success",
        },
        cancelled: {
          title: t("eventActivityTab.activity.status.cancelled.title"),
          description: t("eventActivityTab.activity.status.cancelled.description"),
          icon: XCircle,
          color: "danger", // Red
        },
      };

      if (statusMap[event.status] && event.status !== "pending") {
        items.push({
          id: `status-${event.status}`,
          type: "status",
          ...statusMap[event.status],
          timestamp: event.updatedAt || event.createdAt,
        });
      }
    }

    // 3. Partners Added
    if (event.partners && event.partners.length > 0) {
      items.push({
        id: "partners",
        type: "partners",
        title: t("eventActivityTab.activity.partners.title"),
        description: t("eventActivityTab.activity.partners.description", { count: event.partners.length }),
        timestamp: event.createdAt, // Or updatedAt if we tracked partner addition date
        icon: Users,
        color: "info",
      });
    }

    // 4. Pricing Set
    if (event.pricing?.totalAmount) {
      items.push({
        id: "pricing",
        type: "pricing",
        title: t("eventActivityTab.activity.pricing.title"),
        description: t("eventActivityTab.activity.pricing.description", { 
          amount: formatCurrency(event.pricing.totalAmount) 
        }),
        timestamp: event.updatedAt || event.createdAt,
        icon: DollarSign,
        color: "success",
      });
    }

    // 5. General Update
    // Only show if update is significantly later than creation (> 1 min)
    if (event.updatedAt && event.createdAt && new Date(event.updatedAt) - new Date(event.createdAt) > 60000) {
      items.push({
        id: "updated",
        type: "updated",
        title: t("eventActivityTab.activity.updated.title"),
        description: t("eventActivityTab.activity.updated.description"),
        timestamp: event.updatedAt,
        icon: Edit,
        color: "warning", // Orange
      });
    }

    // Sort by timestamp (newest first)
    return items.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }, [event, t]);

  const getColorClasses = (color) => {
    // Matching Theme Colors
    const colors = {
      info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      success: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
      warning: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", // Brand Orange
      purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
      danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    };
    return colors[color] || colors.info;
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" />
          {t("eventActivityTab.title")}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
          {t("eventActivityTab.subtitle")}
        </p>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {t("eventActivityTab.noActivity")}
          </p>
        </div>
      ) : (
        <div className="relative pl-4">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[1.65rem] top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

          {/* Timeline items */}
          <div className="space-y-8">
            {timeline.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative flex gap-6">
                  {/* Icon Circle */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ring-4 ring-white dark:ring-gray-800 ${getColorClasses(
                      item.color
                    )}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content Card */}
                  <div className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2 font-medium">
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Metadata Footer */}
      <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
          {t("eventActivityTab.metadata.title")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span className="text-gray-500 dark:text-gray-400">
              {t("eventActivityTab.metadata.created")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDateTime(event.createdAt)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
            <span className="text-gray-500 dark:text-gray-400">
              {t("eventActivityTab.metadata.lastUpdated")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatDateTime(event.updatedAt)}
            </span>
          </div>
          {event._id && (
            <div className="col-span-1 md:col-span-2 flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
              <span className="text-gray-500 dark:text-gray-400">
                {t("eventActivityTab.metadata.eventId")}
              </span>
              <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                {event._id}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventActivityTab;