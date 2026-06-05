import React from "react";
import {
  Calendar,
  MapPin,
  DollarSign,
  Eye,
  ExternalLink,
  RefreshCw,
  Briefcase,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";

//  Generic Components
import Button from "../../../components/common/Button";
import { StatusBadge } from "../../../components/common/Badge";

//  Utils
import formatCurrency from "../../../utils/formatCurrency";
import PermissionGuard from "../../../components/auth/PermissionGuard";
const EventsTab = ({
  events,
  eventsStats,
  loading,
  onRefresh,
  onViewEvent,
  onNavigateToEvent,
  formatDate, // Assumed strict DD/MM/YYYY from parent
}) => {
  const { t } = useTranslation();

  const getPartnerCost = (event) => {
    // Logic to extract what this specific partner charged for this event
    const partnerData = event.partners?.[0]; // Assuming context provides the specific partner link
    return partnerData?.cost || partnerData?.hourlyRate || 0;
  };

  // Calculate derived stats if not provided
  const stats = {
    total: eventsStats?.total || events.length,
    completed:
      eventsStats?.completed ||
      events.filter((e) => e.status === "completed").length,
    upcoming:
      eventsStats?.upcoming ||
      events.filter((e) =>
        ["confirmed", "pending", "in-progress"].includes(e.status)
      ).length,
    revenue: events.reduce((sum, event) => sum + getPartnerCost(event), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-500" />
            {t("eventsTab.title", "Event History")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("eventsTab.totalEvents", { count: events?.length || 0 })}
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {events && events.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {events.map((event) => (
              <div
                key={event._id}
                className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                onClick={() => onViewEvent(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Title & Status */}
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-orange-600 transition-colors">
                        {event.title}
                      </h4>
                      <StatusBadge status={event.status} size="xs" />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(getPartnerCost(event))}
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewEvent(event);
                      }}
                      className="text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                     <PermissionGuard permission="events.read.all">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToEvent(event._id, e);
                      }}
                      className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {t("eventsTab.noEvents.title", "No Events Found")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {t(
                "eventsTab.noEvents.description",
                "This partner has not been assigned to any events yet."
              )}
            </p>
          </div>
        )}
      </div>

      {/* Events Summary Stats */}
      {events && events.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label={t("eventsTab.summary.totalEvents", "Total Events")}
            value={stats.total}
            icon={Calendar}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <StatCard
            label={t("eventsTab.summary.completed", "Completed")}
            value={stats.completed}
            icon={CheckCircle}
            color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />
          <StatCard
            label={t("eventsTab.summary.upcoming", "Upcoming")}
            value={stats.upcoming}
            icon={Clock}
            color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
          />
          <StatCard
            label={t("eventsTab.summary.totalRevenue", "Partner Earnings")}
            value={formatCurrency(stats.revenue)}
            icon={TrendingUp}
            color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          />
        </div>
      )}
    </div>
  );
};

// Helper for Stats
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center">
    <div className={`p-2 rounded-full mb-2 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <span className="text-xl font-bold text-gray-900 dark:text-white">
      {value}
    </span>
    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">
      {label}
    </span>
  </div>
);

export default EventsTab;
