import React from 'react';
import { 
  Star, 
  TrendingUp, 
  Award, 
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

//  Generic Components & Utils
import ProgressBar from '../../../components/common/ProgressBar'; // Assuming this exists
import formatCurrency from '../../../utils/formatCurrency';

const PerformanceTab = ({ partner, events }) => {
  const { t } = useTranslation();

  // --- Metrics Calculation ---
  const totalEvents = events?.length || 0;
  const completedEvents = events?.filter(e => e.status === 'completed').length || 0;
  const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
  
  // Calculate revenue specific to this partner
  const totalRevenue = events?.reduce((sum, event) => {
    const partnerEntry = event.partners?.find(p => {
      const pId = p.partner?._id || p.partner;
      return pId === partner?._id;
    });
    return sum + (partnerEntry?.cost || partnerEntry?.hourlyRate || 0);
  }, 0) || 0;

  const averageRevenue = totalEvents > 0 ? totalRevenue / totalEvents : 0;

  // --- Sub-components ---

  const StatBox = ({ title, value, subtext, icon: Icon, color }) => {
    const colorClasses = {
      yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
      green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    };

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex items-center gap-4">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtext && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}
        </div>
      </div>
    );
  };

  const PerformanceBar = ({ label, value, max = 100, color = "blue" }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toFixed(1) : value}
            {max === 100 && "%"}
          </span>
        </div>
        {/* Fallback if ProgressBar component isn't available */}
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 bg-${color}-500`} 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox
          title={t("performanceTab.metrics.overallRating", "Rating")}
          value={partner?.rating ? partner.rating.toFixed(1) : "N/A"}
          subtext={t("common.rating", { value: "5.0" })}
          icon={Star}
          color="yellow"
        />
        <StatBox
          title={t("performanceTab.metrics.completionRate", "Completion")}
          value={`${Math.round(completionRate)}%`}
          subtext={t("common.eventsCount", { completed: completedEvents, total: totalEvents })}
          icon={CheckCircle}
          color="green"
        />
        <StatBox
          title={t("performanceTab.metrics.totalRevenue", "Total Revenue")}
          value={formatCurrency(totalRevenue)}
          subtext={t("performanceTab.metrics.allTime", "Lifetime Earnings")}
          icon={DollarSign}
          color="purple"
        />
        <StatBox
          title={t("performanceTab.metrics.averagePerEvent", "Avg. per Event")}
          value={formatCurrency(averageRevenue)}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* 2. Detailed Performance Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality & Reliability */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Award className="w-5 h-5 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t("performanceTab.performanceScore.title", "Performance Score")}
            </h3>
          </div>
          
          <div className="space-y-6">
            <PerformanceBar
              label={t("performanceTab.performanceScore.serviceQuality", "Service Quality (Rating)")}
              value={partner?.rating || 0}
              max={5}
              color="orange"
            />
            <PerformanceBar
              label={t("performanceTab.performanceScore.reliability", "Reliability (Completion)")}
              value={completionRate}
              color="green"
            />
            <PerformanceBar
              label={t("performanceTab.performanceScore.revenueGeneration", "Revenue Potential")}
              value={Math.min((totalRevenue / 10000) * 100, 100)} // Example scale
              color="purple"
            />
          </div>
        </div>

        {/* Activity Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t("performanceTab.performanceOverview.title", "Activity Summary")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{totalEvents}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{t("performanceTab.performanceOverview.totalAssignments", "Assigned")}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">{completedEvents}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{t("performanceTab.performanceOverview.eventsCompleted", "Completed")}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">{totalEvents - completedEvents}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{t("common.pending", "Pending")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recommendations (Conditional) */}
      {completionRate > 0 && completionRate < 80 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-orange-800 dark:text-orange-300 text-sm mb-1">
              {t("performanceTab.recommendations.improvementOpportunity", "Attention Required")}
            </h4>
            <p className="text-sm text-orange-700 dark:text-orange-400 opacity-90">
              {completionRate < 60 
                ? t("performanceTab.recommendations.lowCompletion", "Completion rate is critically low. Review partner reliability.")
                : t("performanceTab.recommendations.goodProgress", "Completion rate is below target. Monitor upcoming events closely.")
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTab;