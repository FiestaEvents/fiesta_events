// components/events/components/EventActivityTab.jsx
import React from "react";
import {
  Clock,
  Calendar,
  Edit,
  CheckCircle,
  XCircle,
  Users,
  DollarSign,
} from "lucide-react";

const EventActivityTab = ({ event, formatDateTime }) => {
  // Generate activity timeline from event data
  const generateTimeline = () => {
    const timeline = [];

    // Event created
    if (event.createdAt) {
      timeline.push({
        id: "created",
        type: "created",
        title: "Event Created",
        description: `Event "${event.title}" was created`,
        timestamp: event.createdAt,
        icon: Calendar,
        color: "blue",
      });
    }

    // Status changes
    if (event.status) {
      const statusMap = {
        confirmed: {
          title: "Event Confirmed",
          description: "Event status changed to confirmed",
          icon: CheckCircle,
          color: "green",
        },
        "in-progress": {
          title: "Event In Progress",
          description: "Event is currently in progress",
          icon: Clock,
          color: "purple",
        },
        completed: {
          title: "Event Completed",
          description: "Event has been completed",
          icon: CheckCircle,
          color: "green",
        },
        cancelled: {
          title: "Event Cancelled",
          description: "Event was cancelled",
          icon: XCircle,
          color: "red",
        },
      };

      if (statusMap[event.status] && event.status !== "pending") {
        timeline.push({
          id: `status-${event.status}`,
          type: "status",
          ...statusMap[event.status],
          timestamp: event.updatedAt || event.createdAt,
        });
      }
    }

    // Partners added
    if (event.partners && event.partners.length > 0) {
      timeline.push({
        id: "partners",
        type: "partners",
        title: "Partners Assigned",
        description: `${event.partners.length} partner(s) assigned to event`,
        timestamp: event.createdAt,
        icon: Users,
        color: "blue",
      });
    }

    // Pricing set
    if (event.pricing?.totalAmount) {
      timeline.push({
        id: "pricing",
        type: "pricing",
        title: "Pricing Configured",
        description: `Total amount set to ${event.pricing.totalAmount} TND`,
        timestamp: event.updatedAt || event.createdAt,
        icon: DollarSign,
        color: "green",
      });
    }

    // Last updated
    if (event.updatedAt && event.updatedAt !== event.createdAt) {
      timeline.push({
        id: "updated",
        type: "updated",
        title: "Event Updated",
        description: "Event details were modified",
        timestamp: event.updatedAt,
        icon: Edit,
        color: "orange",
      });
    }

    // Sort by timestamp (newest first)
    return timeline.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  const timeline = generateTimeline();

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
      green: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
      orange: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
      purple: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
      red: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Activity Timeline
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Track all changes and updates to this event
        </p>
      </div>

      {timeline.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No activity recorded</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

          {/* Timeline items */}
          <div className="space-y-6">
            {timeline.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="relative flex gap-4">
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${getColorClasses(
                      item.color
                    )}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                        {formatDateTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Metadata */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Event Metadata
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Created:</span>
            <p className="font-medium text-gray-900 dark:text-white mt-1">
              {formatDateTime(event.createdAt)}
            </p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
            <p className="font-medium text-gray-900 dark:text-white mt-1">
              {formatDateTime(event.updatedAt)}
            </p>
          </div>
          {event._id && (
            <div className="col-span-2">
              <span className="text-gray-500 dark:text-gray-400">Event ID:</span>
              <p className="font-mono text-xs text-gray-900 dark:text-white mt-1 break-all">
                {event._id}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventActivityTab;