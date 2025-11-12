// components/partners/PerformanceTab.jsx
import React from "react";
import {
  Target,
  BarChart3,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";

const PerformanceTab = ({ partner, partnerStats, formatCurrency }) => {
  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-orange-600" />
              Performance Score
            </h4>
            <div className="text-center">
              <div className="inline-flex items-baseline">
                <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                  {partnerStats.performanceScore.toFixed(0)}%
                </span>
                <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
                  /100%
                </span>
              </div>
              <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-orange-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${partnerStats.performanceScore}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Based on partner rating and completion rate
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
              Event Statistics
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Events
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {partnerStats.totalEvents}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Completed Events
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {partnerStats.completedEvents}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Upcoming Events
                </span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {partnerStats.upcomingEvents}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Completion Rate
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {partnerStats.completionRate.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
            Financial Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
              </div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(partnerStats.totalRevenue)}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average per Event
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(partnerStats.averageRevenue)}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Hourly Rate
                </p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {partner.hourlyRate
                  ? formatCurrency(partner.hourlyRate)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating & Reviews */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-orange-600" />
            Partner Rating
          </h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {partner.rating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-lg text-gray-500 dark:text-gray-400">
                    /5.0
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(partner.rating || 0)
                          ? "text-orange-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Response Rate
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {partner.responseRate || "N/A"}
              </p>
            </div>
          </div>

          {partner.reviews && partner.reviews.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                Recent Feedback
              </h5>
              <div className="space-y-3">
                {partner.reviews.slice(0, 2).map((review, index) => (
                  <div
                    key={index}
                    className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= review.rating
                                ? "text-orange-400 fill-current"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {review.date ? formatDate(review.date) : "Recent"}
                      </span>
                    </div>
                    <p className="italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTab;
