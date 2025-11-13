import React from 'react';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Eye,
  ExternalLink,
  RefreshCw,
  Plus,
  AlertCircle
} from 'lucide-react';
import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';

const EventsTab = ({
  events,
  eventsStats,
  loading,
  onRefresh,
  onViewEvent,
  onNavigateToEvent,
  formatDate,
  getEventStatusColor,
  getStatusLabel
}) => {
  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPartnerCost = (event) => {
    const partnerData = event.partners?.[0]; // Assuming first partner is the current one
    return partnerData?.cost || partnerData?.hourlyRate || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Event History
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {events?.length || 0} events total
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={onRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        {events && events.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event, index) => (
              <div
                key={event._id || index}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => onViewEvent(event)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEventStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(getPartnerCost(event))}</span>
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewEvent(event);
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={ExternalLink}
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToEvent(event._id, e);
                      }}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="No Events Found"
            description="This partner hasn't been assigned to any events yet."
            size="lg"
          />
        )}
      </div>

      {/* Events Summary */}
      {events && events.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            Events Summary
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {eventsStats?.total || events.length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total Events</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {eventsStats?.completed || events.filter(e => e.status === 'completed').length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {eventsStats?.upcoming || events.filter(e => 
                  ['confirmed', 'pending', 'in-progress'].includes(e.status)
                ).length}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Upcoming</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(events.reduce((sum, event) => sum + getPartnerCost(event), 0))}
              </p>
              <p className="text-gray-600 dark:text-gray-400">Total Revenue</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsTab;