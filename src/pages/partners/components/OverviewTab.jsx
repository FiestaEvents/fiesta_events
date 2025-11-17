import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import ProgressBar from '../../../components/common/ProgressBar';

const OverviewTab = ({ partner, events, eventsStats, formatDate }) => {
  // Calculate stats
  const totalEvents = events?.length || 0;
  const completedEvents = events?.filter(e => e.status === 'completed').length || 0;
  const upcomingEvents = events?.filter(e => 
    ['confirmed', 'pending', 'in-progress'].includes(e.status)
  ).length || 0;
  
  const totalRevenue = events?.reduce((sum, event) => {
    const partnerData = event.partners?.find(p => {
      const partnerId = p.partner?._id?.$oid || p.partner?._id || p.partner;
      return partnerId === partner?._id;
    });
    return sum + (partnerData?.cost || partnerData?.hourlyRate || 0);
  }, 0) || 0;

  const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
  const performanceScore = partner?.rating ? (partner.rating / 5) * 100 : 0;

  const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.color}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={totalEvents}
          icon={Calendar}
          color="bg-blue-500"
        />
        
        <StatCard
          title="Completed Events"
          value={completedEvents}
          icon={CheckCircle}
          color="bg-green-500"
        />
        
        <StatCard
          title="Upcoming Events"
          value={upcomingEvents}
          icon={Clock}
          color="bg-orange-500"
        />
        
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Completion Rate
          </h3>
          <div className="space-y-4">
            <ProgressBar value={completionRate} size="lg" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {completedEvents} of {totalEvents} events completed
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(completionRate)}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Score
          </h3>
          <div className="space-y-4">
            <ProgressBar value={performanceScore} size="lg" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Based on partner rating
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {partner?.rating ? partner.rating.toFixed(1) : 'N/A'} / 5.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
        </div>
        
        <div className="p-6">
          {events && events.length > 0 ? (
            <div className="space-y-4">
              {events.slice(0, 5).map((event, index) => (
                <div key={event._id || index} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {formatDate(event.startDate)} • {event.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${event.partners?.find(p => {
                        const partnerId = p.partner?._id?.$oid || p.partner?._id || p.partner;
                        return partnerId === partner?._id;
                      })?.cost || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No recent activity found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;