import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock,
  Activity,
  Star,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

//  Utils & Generics
import formatCurrency from '../../../utils/formatCurrency';
import { StatusBadge } from '../../../components/common/Badge';

const OverviewTab = ({ partner, events, formatDate }) => {
  const { t } = useTranslation();

  // --- Calculations ---
  const totalEvents = events?.length || 0;
  const completedEvents = events?.filter(e => e.status === 'completed').length || 0;
  const upcomingEvents = events?.filter(e => ['confirmed', 'pending', 'in-progress'].includes(e.status)).length || 0;
  
  // Calculate specific revenue for THIS partner across all events
  const totalRevenue = events?.reduce((sum, event) => {
    const partnerEntry = event.partners?.find(p => {
      const pId = p.partner?._id || p.partner;
      return pId === partner?._id;
    });
    return sum + (partnerEntry?.cost || partnerEntry?.hourlyRate || 0);
  }, 0) || 0;

  const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
  const performanceScore = partner?.rating ? (partner.rating / 5) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox
          label={t('overviewTab.stats.totalEvents', 'Total Events')}
          value={totalEvents}
          icon={Calendar}
          color="blue"
        />
        <StatBox
          label={t('overviewTab.stats.completedEvents', 'Completed')}
          value={completedEvents}
          icon={CheckCircle}
          color="green"
        />
        <StatBox
          label={t('overviewTab.stats.upcomingEvents', 'Upcoming')}
          value={upcomingEvents}
          icon={Clock}
          color="yellow"
        />
        <StatBox
          label={t('overviewTab.stats.totalRevenue', 'Total Earnings')}
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* 2. Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Completion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('overviewTab.metrics.completionRate', 'Completion Rate')}
            </h3>
          </div>
          
          <div className="space-y-4">
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {t('common.eventsCount', { completed: completedEvents, total: totalEvents })}
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {Math.round(completionRate)}%
              </span>
            </div>
          </div>
        </div>

        {/* Performance Score (Rating) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('overviewTab.metrics.performanceScore', 'Performance Score')}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-yellow-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${performanceScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                {t('overviewTab.metrics.basedOnRating', 'Based on client ratings')}
              </span>
              <span className="font-bold text-gray-900 dark:text-white">
                {partner?.rating ? partner.rating.toFixed(1) : "N/A"} / 5.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Activity List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            {t('overviewTab.recentActivity.title', 'Recent Activity')}
          </h3>
        </div>
        
        <div className="p-6">
          {events && events.length > 0 ? (
            <div className="space-y-4">
              {events.slice(0, 5).map((event, index) => {
                // Find specific cost for this partner in this event
                const partnerEntry = event.partners?.find(p => {
                  const pId = p.partner?._id || p.partner;
                  return pId === partner?._id;
                });
                const cost = partnerEntry?.cost || partnerEntry?.hourlyRate || 0;

                return (
                  <div key={event._id || index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.startDate)}
                        </span>
                        <span>•</span>
                        <StatusBadge status={event.status} size="xs" />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(cost)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {t('common.earnings', 'Earnings')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                {t('overviewTab.recentActivity.noActivity', 'No recent activity found.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Helper Sub-component ---
const StatBox = ({ label, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default OverviewTab;