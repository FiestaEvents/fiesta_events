import React from "react";
import {
  Activity,
  Star,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency.js";
import { useTranslation } from "react-i18next";

const ActivityTab = ({
  events,
  eventsStats,
  formatDate,
  getStatusColor,
  getStatusLabel,
}) => {
  const { t } = useTranslation();

  // Generate activity timeline from events and payments
  const activityTimeline = React.useMemo(() => {
    const activities = [];

    events.forEach((event) => {
      // Add event creation activity
      activities.push({
        id: `${event._id}-created`,
        type: "event_created",
        title: t("clientDetail.activity.eventCreated"),
        description: t("clientDetail.activity.descriptions.eventCreated", { title: event.title }),
        event,
        date: event.createdAt,
        icon: Calendar,
        color: "blue",
      });

      // Add event status changes
      if (event.updatedAt && event.updatedAt !== event.createdAt) {
        activities.push({
          id: `${event._id}-updated`,
          type: "event_updated",
          title: t("clientDetail.activity.eventUpdated"),
          description: t("clientDetail.activity.descriptions.eventUpdated", { 
            title: event.title, 
            status: getStatusLabel(event.status) 
          }),
          event,
          date: event.updatedAt,
          icon: Activity,
          color: "purple",
        });
      }

      // Add payment activities
      if (event.payments && event.payments.length > 0) {
        event.payments.forEach((payment) => {
          if (payment.status === "completed" && payment.paidDate) {
            activities.push({
              id: `${payment._id}-payment`,
              type: "payment_received",
              title: t("clientDetail.activity.paymentReceived"),
              description: t("clientDetail.activity.descriptions.paymentReceived", { 
                amount: formatCurrency(payment.amount), 
                title: event.title 
              }),
              event,
              payment,
              date: payment.paidDate,
              icon: DollarSign,
              color: "green",
            });
          } else if (payment.status === "pending") {
            activities.push({
              id: `${payment._id}-payment-pending`,
              type: "payment_pending",
              title: t("clientDetail.activity.paymentPending"),
              description: t("clientDetail.activity.descriptions.paymentPending", { 
                amount: formatCurrency(payment.amount), 
                title: event.title 
              }),
              event,
              payment,
              date: payment.createdAt,
              icon: Clock,
              color: "orange",
            });
          }
        });
      }

      // Add upcoming event reminder for future events
      if (new Date(event.startDate) > new Date()) {
        activities.push({
          id: `${event._id}-upcoming`,
          type: "event_upcoming",
          title: t("clientDetail.activity.eventUpcoming"),
          description: t("clientDetail.activity.descriptions.eventUpcoming", { 
            title: event.title, 
            date: formatDate(event.startDate) 
          }),
          event,
          date: event.startDate,
          icon: Star,
          color: "yellow",
        });
      }
    });

    // Sort by date (newest first)
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [events, formatDate, getStatusLabel, t]);

  const getActivityIcon = (activity) => {
    const IconComponent = activity.icon;
    const colorClasses = {
      blue: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
      green:
        "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
      orange:
        "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
      purple:
        "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
      yellow:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
    };

    return (
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses[activity.color]}`}
      >
        <IconComponent className="w-4 h-4" />
      </div>
    );
  };

  const getActivityBadge = (type) => {
    const badges = {
      event_created:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      event_updated:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      payment_received:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      payment_pending:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      event_upcoming:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    };

    const labels = {
      event_created: t("clientDetail.activity.eventCreated"),
      event_updated: t("clientDetail.activity.eventUpdated"),
      payment_received: t("clientDetail.activity.paymentReceived"),
      payment_pending: t("clientDetail.activity.paymentPending"),
      event_upcoming: t("clientDetail.activity.eventUpcoming"),
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badges[type]}`}>
        {labels[type]}
      </span>
    );
  };

  return (
    <div>
      {/* Detailed Event Stats */}
      {events.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                status: "pending",
                label: t("clientDetail.status.pending"),
                icon: Clock,
                color: "yellow",
              },
              {
                status: "confirmed",
                label: t("clientDetail.status.confirmed"),
                icon: CheckCircle2,
                color: "blue",
              },
              {
                status: "completed",
                label: t("clientDetail.status.completed"),
                icon: CheckCircle2,
                color: "green",
              },
              {
                status: "cancelled",
                label: t("clientDetail.status.cancelled"),
                icon: AlertCircle,
                color: "red",
              },
            ].map(({ status, label, icon: Icon, color }) => {
              const count = events.filter(
                (event) => event.status === status
              ).length;
              return (
                <div
                  key={status}
                  className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        color === "yellow"
                          ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
                          : color === "blue"
                            ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                            : color === "green"
                              ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                              : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {count}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity Timeline */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-white">
          {t("clientDetail.labels.activityTimeline")}
        </h4>

        {activityTimeline.length > 0 ? (
          <div className="space-y-4">
            {activityTimeline.slice(0, 10).map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg dark:border-gray-700"
              >
                {getActivityIcon(activity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </h4>
                      {getActivityBadge(activity.type)}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(activity.date)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {activity.description}
                  </p>

                  {activity.event && (
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(activity.event.startDate)}
                      </span>
                      {activity.event.guestCount && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {activity.event.guestCount} {t("clientDetail.labels.guests", { count: activity.event.guestCount })}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(
                          activity.event.pricing?.totalAmount ||
                            activity.event.pricing?.basePrice ||
                            0
                        )}
                      </span>
                      {activity.event.paymentSummary && (
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded ${getStatusColor(activity.event.paymentSummary.status)}`}
                        >
                          <CreditCard className="w-3 h-3" />
                          {getStatusLabel(activity.event.paymentSummary.status)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {t("clientDetail.activity.noActivity")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTab;