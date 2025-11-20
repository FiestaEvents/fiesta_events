import React from "react";
import {
  Calendar,
  User,
  DollarSign,
  CreditCard,
  ExternalLink,
  Plus,
  RefreshCw,
  TrendingUp,
  Star,
  Clock,
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useTranslation } from "react-i18next";

const EventsTab = ({
  events,
  eventsStats,
  loading,
  onRefresh,
  onCreateEvent,
  onViewEvent,
  onNavigateToEvent,
  formatDate,
  getStatusColor,
  getStatusLabel,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("clientDetail.labels.eventHistory")} ({events.length})
          </h3>
          {loading && (
            <p className="text-sm text-gray-500 mt-1">{t("clientDetail.loading")}</p>
          )}
        </div>
        {events.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onCreateEvent}
              className="px-4 py-2 flex items-center gap-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
            >
              <Plus className="h-4 w-4" />
              {t("clientDetail.buttons.createEvent")}
            </button>
          </div>
        )}
      </div>

      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-600">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {eventsStats.totalEvents}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("clientDetail.labels.totalEvents")}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-600">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {eventsStats.upcomingEvents}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("clientDetail.labels.upcomingEvents")}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-600">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(eventsStats.totalRevenue)}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("clientDetail.labels.totalRevenue")}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-600">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(eventsStats.pendingAmount)}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("clientDetail.labels.outstanding")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 ? (
        <div className="text-center py-12 flex justify-center items-center flex-col">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("clients.search.noResults")}
          </p>
          <button
            onClick={onCreateEvent}
            className="mt-4 px-4 py-2 flex items-center gap-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            <Plus className="h-4 w-4" />
            {t("clientDetail.buttons.createFirstEvent")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event._id}
              onClick={() => onViewEvent(event)}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer dark:border-gray-700 dark:hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}
                    >
                      {getStatusLabel(event.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(event.startDate)}
                    </div>
                    {event.guestCount && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {event.guestCount} {t("clientDetail.labels.guests", { count: event.guestCount })}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {formatCurrency(
                        event.pricing?.totalAmount ||
                          event.pricing?.basePrice ||
                          0
                      )}
                    </div>
                    {event.paymentSummary && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span
                          className={`inline-block px-3 py-0.5 rounded-full text-sm border ${getStatusColor(event.paymentSummary?.status || "pending")}`}
                        >
                          {getStatusLabel(
                            event.paymentSummary?.status || "pending"
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => onNavigateToEvent(event._id, e)}
                  className="ml-2 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition dark:text-orange-400 dark:hover:bg-orange-900"
                  title={t("clientDetail.actions.viewFullEvent")}
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsTab;