// components/partners/EventsTab.jsx
import React from "react";
import {
  Calendar,
  DollarSign,
  ExternalLink,
  TrendingUp,
  Star,
  Clock,
  CheckCircle2,
} from "lucide-react";

const EventsTab = ({
  events,
  partnerStats,
  loading,
  onRefresh,
  onViewEvent,
  onNavigateToEvent,
  formatDate,
  formatDateTime,
  getEventStatusColor,
  formatCurrency,
  partnerId,
  partnerData,
}) => {
  // Calculate partner-specific revenue for each event
  const getPartnerRevenue = (event) => {
    const partnerData = event.partners?.find((p) => {
      const partnerIdValue =
        p.partner?._id?.$oid || p.partner?._id || p.partner;
      return (
        partnerIdValue === partnerId || partnerIdValue === partnerData?._id
      );
    });
    return partnerData?.cost || partnerData?.hourlyRate || 0;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Event History ({events.length})
          </h3>
          {loading && (
            <p className="text-sm text-gray-500 mt-1">Loading events...</p>
          )}
        </div>
      </div>

      {/* Partner Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-600">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {partnerStats.totalEvents}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Total Events
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-600">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {partnerStats.completedEvents}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Completed
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
                {formatCurrency(partnerStats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Total Revenue
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
                {formatCurrency(partnerStats.averageRevenue)}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Avg per Event
              </div>
            </div>
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">
            This partner hasn't been assigned to any events yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const partnerRevenue = getPartnerRevenue(event);

            return (
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
                        className={`px-2 py-1 rounded text-xs font-medium ${getEventStatusColor(
                          event.status
                        )}`}
                      >
                        {event.status?.charAt(0).toUpperCase() +
                          event.status?.slice(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDateTime(event.startDate)}
                      </div>
                      {event.type && (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs dark:bg-gray-700 dark:text-gray-300">
                            {event.type}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Partner-specific revenue */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Partner Revenue
                      </div>
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(partnerRevenue)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => onNavigateToEvent(event._id, e)}
                    className="ml-2 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition dark:text-orange-400 dark:hover:bg-orange-900"
                    title="View Full Event Page"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsTab;
