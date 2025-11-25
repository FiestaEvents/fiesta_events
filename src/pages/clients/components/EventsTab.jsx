import React from "react";
import {
  Calendar,
  User,
  DollarSign,
  CreditCard,
  ExternalLink,
  Plus,
  TrendingUp,
  Star,
  Clock,
  Briefcase,
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Button from "../../../components/common/Button";
import { StatusBadge } from "../../../components/common/Badge";

const EventsTab = ({
  events,
  eventsStats,
  loading,
  onCreateEvent,
  onViewEvent,
  onNavigateToEvent,
  formatDate, // Assumed to be strict DD/MM/YYYY from parent
}) => {
  const { t } = useTranslation();

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-orange-500" />
            {t("clientDetail.labels.eventHistory")} 
            <span className="text-gray-400 text-sm font-normal">({events.length})</span>
          </h3>
          {loading && (
            <p className="text-sm text-gray-500 mt-1 animate-pulse">{t("clientDetail.loading")}</p>
          )}
        </div>
        {events.length > 0 && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={onCreateEvent}
          >
            {t("clientDetail.buttons.createEvent")}
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard 
            icon={TrendingUp} 
            value={eventsStats.totalEvents} 
            label={t("clientDetail.labels.totalEvents")} 
          />
          <StatCard 
            icon={Star} 
            value={eventsStats.upcomingEvents} 
            label={t("clientDetail.labels.upcomingEvents")} 
          />
          <StatCard 
            icon={DollarSign} 
            value={formatCurrency(eventsStats.totalRevenue)} 
            label={t("clientDetail.labels.totalRevenue")} 
          />
          <StatCard 
            icon={Clock} 
            value={formatCurrency(eventsStats.pendingAmount)} 
            label={t("clientDetail.labels.outstanding")} 
          />
        </div>
      )}

      {/* Events List / Empty State */}
      {events.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t("clients.search.noResults")}
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={onCreateEvent}
          >
            {t("clientDetail.buttons.createFirstEvent")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event._id}
              onClick={() => onViewEvent(event)}
              className="group bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-orange-200 transition-all cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:hover:border-orange-900/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Event Title & Status */}
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">
                      {event.title}
                    </h4>
                    {/* ✅ Using Generic StatusBadge */}
                    <StatusBadge status={event.status} size="sm" />
                  </div>

                  {/* Event Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(event.startDate)}
                    </div>
                    
                    {event.guestCount && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {event.guestCount} {t("clientDetail.labels.guests", { count: event.guestCount })}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(event.pricing?.totalAmount || event.pricing?.basePrice || 0)}
                      </span>
                    </div>

                    {event.paymentSummary && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        {/* ✅ Using Generic StatusBadge for Payment */}
                        <StatusBadge 
                          status={event.paymentSummary?.status || "pending"} 
                          size="xs" 
                          dot={false}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* External Link Action */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => onNavigateToEvent(event._id, e)}
                  title={t("clientDetail.actions.viewFullEvent")}
                  className="ml-2 text-gray-400 hover:text-orange-600 dark:text-gray-500 dark:hover:text-orange-400"
                >
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Helper Sub-component for Stats ---
const StatCard = ({ icon: Icon, value, label }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-700 flex items-center gap-4">
    <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon className="w-6 h-6 text-orange-600 dark:text-orange-500" />
    </div>
    <div className="overflow-hidden">
      <div className="text-xl font-bold text-gray-900 dark:text-white truncate" title={value}>
        {value}
      </div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide truncate">
        {label}
      </div>
    </div>
  </div>
);

export default EventsTab;