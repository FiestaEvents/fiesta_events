import React, { useMemo } from "react";
import {
  Activity,
  Star,
  DollarSign,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Badge, { StatusBadge } from "../../../components/common/Badge";

const ActivityTab = ({
  events,
  formatDate, // Assumes this function returns dd/mm/yyyy from parent
}) => {
  const { t } = useTranslation();

  // Generate activity timeline from events and payments
  const activityTimeline = useMemo(() => {
    const activities = [];

    events.forEach((event) => {
      // 1. Event Creation
      activities.push({
        id: `${event._id}-created`,
        type: "event_created",
        title: t("clientDetail.activity.eventCreated", "Event Created"),
        description: t("clientDetail.activity.descriptions.eventCreated", { title: event.title }),
        event,
        date: event.createdAt,
        icon: Calendar,
        variant: "info", // Blue
      });

      // 2. Event Updates
      if (event.updatedAt && event.updatedAt !== event.createdAt) {
        activities.push({
          id: `${event._id}-updated`,
          type: "event_updated",
          title: t("clientDetail.activity.eventUpdated", "Event Updated"),
          description: t("clientDetail.activity.descriptions.eventUpdated", { 
            title: event.title, 
            status: event.status
          }),
          event,
          date: event.updatedAt,
          icon: Activity,
          variant: "purple",
        });
      }

      // 3. Payments
      if (event.payments && event.payments.length > 0) {
        event.payments.forEach((payment) => {
          if (payment.status === "completed" && payment.paidDate) {
            activities.push({
              id: `${payment._id}-payment`,
              type: "payment_received",
              title: t("clientDetail.activity.paymentReceived", "Payment Received"),
              description: t("clientDetail.activity.descriptions.paymentReceived", { 
                amount: formatCurrency(payment.amount), 
                title: event.title 
              }),
              event,
              payment,
              date: payment.paidDate,
              icon: DollarSign,
              variant: "success", // Green
            });
          } else if (payment.status === "pending") {
            activities.push({
              id: `${payment._id}-payment-pending`,
              type: "payment_pending",
              title: t("clientDetail.activity.paymentPending", "Payment Pending"),
              description: t("clientDetail.activity.descriptions.paymentPending", { 
                amount: formatCurrency(payment.amount), 
                title: event.title 
              }),
              event,
              payment,
              date: payment.createdAt,
              icon: Clock,
              variant: "warning", // Orange
            });
          }
        });
      }

      // 4. Future Events
      if (new Date(event.startDate) > new Date()) {
        activities.push({
          id: `${event._id}-upcoming`,
          type: "event_upcoming",
          title: t("clientDetail.activity.eventUpcoming", "Upcoming Event"),
          description: t("clientDetail.activity.descriptions.eventUpcoming", { 
            title: event.title, 
            date: formatDate(event.startDate) 
          }),
          event,
          date: event.startDate,
          icon: Star,
          variant: "warning", // Yellow
        });
      }
    });

    // Sort by date (newest first)
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [events, formatDate, t]);

  // --- Helpers ---

  const getActivityIcon = (activity) => {
    const IconComponent = activity.icon;
    
    // Map variants to specific background colors for icons
    const bgColors = {
      info: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      success: "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      warning: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
      purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      danger: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
    };

    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgColors[activity.variant] || bgColors.info}`}>
        <IconComponent className="w-5 h-5" />
      </div>
    );
  };

  const StatCard = ({ status, icon: Icon, color }) => {
    const count = events.filter((e) => e.status === status).length;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4 transition-transform hover:scale-105">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
            {count}
          </p>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
            {t(`clientDetail.status.${status}`)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      
      {/* --- Stats Grid --- */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard status="pending" icon={Clock} color="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400" />
          <StatCard status="confirmed" icon={CheckCircle2} color="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" />
          <StatCard status="completed" icon={CheckCircle2} color="bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400" />
          <StatCard status="cancelled" icon={AlertCircle} color="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" />
        </div>
      )}

      {/* --- Activity Timeline --- */}
      <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" />
          {t("clientDetail.labels.activityTimeline", "Activity Timeline")}
        </h4>

        {activityTimeline.length > 0 ? (
          <div className="relative pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-8 ml-2">
            {activityTimeline.slice(0, 10).map((activity) => (
              <div key={activity.id} className="relative">
                
                {/* Timeline Dot (Icon) */}
                <div className="absolute -left-[38px] top-0">
                  {getActivityIcon(activity)}
                </div>

                {/* Activity Card */}
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm ml-2 hover:shadow-md transition-shadow">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                        {activity.title}
                      </h5>
                      <Badge variant={activity.variant} size="xs" className="capitalize">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {formatDate(activity.date)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    {activity.description}
                  </p>

                  {/* Context Data (Event Snapshot) */}
                  {activity.event && (
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDate(activity.event.startDate)}</span>
                      </div>
                      
                      {activity.event.guestCount && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span>{activity.event.guestCount} Guests</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300 ml-auto">
                        <DollarSign className="w-3.5 h-3.5 text-green-500" />
                        {formatCurrency(activity.event.pricing?.totalAmount || 0)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- Empty State --- */
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 text-gray-400 dark:text-gray-500">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {t("clientDetail.activity.noActivity", "No recent activity found for this client.")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTab;