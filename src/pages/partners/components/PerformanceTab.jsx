import React from 'react';
import { 
  Star, 
  TrendingUp, 
  Award, 
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../../../components/common/ProgressBar';

const PerformanceTab = ({ partner, events, eventsStats }) => {
  const { t } = useTranslation();

  // Calculate performance metrics
  const totalEvents = events?.length || 0;
  const completedEvents = events?.filter(e => e.status === 'completed').length || 0;
  const completionRate = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
  
  const totalRevenue = events?.reduce((sum, event) => {
    const partnerData = event.partners?.find(p => {
      const partnerId = p.partner?._id?.$oid || p.partner?._id || p.partner;
      return partnerId === partner?._id;
    });
    return sum + (partnerData?.cost || partnerData?.hourlyRate || 0);
  }, 0) || 0;

  const averageRevenue = totalEvents > 0 ? totalRevenue / totalEvents : 0;
  const performanceScore = partner?.rating ? (partner.rating / 5) * 100 : 0;

  const MetricCard = ({ title, value, description, icon: Icon, color = "blue" }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${color} flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {value}
          </p>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const PerformanceIndicator = ({ label, value, max = 100, color = "blue" }) => {
    const percentage = (value / max) * 100;
    const getColorClass = (percent) => {
      if (percent >= 80) return 'text-green-600 dark:text-green-400';
      if (percent >= 60) return 'text-orange-600 dark:text-orange-400';
      return 'text-red-600 dark:text-red-400';
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
          <span className={getColorClass(percentage)}>{value}</span>
        </div>
        <ProgressBar value={percentage} color={color} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title={t("performanceTab.metrics.overallRating")}
          value={partner?.rating ? partner.rating.toFixed(1) : t("common.notAvailable")}
          description={t("common.rating", { value: "5.0" })}
          icon={Star}
          color="bg-yellow-500"
        />
        
        <MetricCard
          title={t("performanceTab.metrics.completionRate")}
          value={t("common.percentage", { value: Math.round(completionRate) })}
          description={t("common.eventsCount", { completed: completedEvents, total: totalEvents })}
          icon={CheckCircle}
          color="bg-green-500"
        />
        
        <MetricCard
          title={t("performanceTab.metrics.totalRevenue")}
          value={t("common.currency", { amount: totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) })}
          description={t("performanceTab.metrics.allTime")}
          icon={DollarSign}
          color="bg-purple-500"
        />
        
        <MetricCard
          title={t("performanceTab.metrics.averagePerEvent")}
          value={t("common.currency", { amount: averageRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) })}
          description={t("performanceTab.metrics.averageRevenue")}
          icon={TrendingUp}
          color="bg-blue-500"
        />
      </div>

      {/* Performance Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("performanceTab.performanceScore.title")}
          </h3>
        </div>
        
        <div className="space-y-2">
          <PerformanceIndicator
            label={t("performanceTab.performanceScore.serviceQuality")}
            value={partner?.rating || 0}
            max={5}
            color="orange"
          />
          <PerformanceIndicator
            label={t("performanceTab.performanceScore.reliability")}
            value={completionRate}
            color="green"
          />
          <PerformanceIndicator
            label={t("performanceTab.performanceScore.revenueGeneration")}
            value={Math.min((totalRevenue / 10000) * 100, 100)}
            color="purple"
          />
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t("performanceTab.performanceOverview.title")}
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedEvents}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("performanceTab.performanceOverview.eventsCompleted")}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalEvents}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("performanceTab.performanceOverview.totalAssignments")}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {t("common.currency", { amount: totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) })}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("performanceTab.performanceOverview.revenueGenerated")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {completionRate < 80 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                {t("performanceTab.recommendations.improvementOpportunity")}
              </h4>
              <p className="text-orange-700 dark:text-orange-400 text-sm">
                {completionRate < 60 
                  ? t("performanceTab.recommendations.lowCompletion")
                  : t("performanceTab.recommendations.goodProgress")
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceTab;