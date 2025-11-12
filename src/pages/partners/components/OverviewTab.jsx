// components/partners/OverviewTab.jsx
import React from "react";
import {
  Building,
  MapPin,
  FileText,
  Award,
  DollarSign,
  Calendar,
  Star,
  Users,
  Briefcase,
} from "lucide-react";

const OverviewTab = ({ partner, partnerStats, formatDate, formatCurrency }) => {
  return (
    <div className="space-y-6">
      {/* Company & Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partner.company && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Company Information
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Building className="w-5 h-5 text-gray-400 mr-2" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {partner.company}
                </span>
              </div>
              {partner.specialties && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {partner.specialties}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Services */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Services & Expertise
          </h4>
          <div className="flex flex-wrap gap-2">
            {partner.services && partner.services.length > 0 ? (
              partner.services.map((service, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium dark:bg-orange-900 dark:text-orange-300"
                >
                  {service}
                </span>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No specific services listed
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-700">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {partnerStats.totalEvents}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Events
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-700">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(partnerStats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Revenue
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-700">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {partner.rating?.toFixed(1) || "0.0"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Performance Rating
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-700">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {partnerStats.completionRate.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Completion Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {partner.notes && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Additional Notes
          </h4>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {partner.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Address */}
      {partner.address && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Business Address
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-start">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div className="text-gray-600 dark:text-gray-400">
                {partner.address.street && (
                  <p className="font-medium text-gray-900 dark:text-white">
                    {partner.address.street}
                  </p>
                )}
                <p>
                  {[
                    partner.address.city,
                    partner.address.state,
                    partner.address.zipCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {partner.address.country && <p>{partner.address.country}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hourly Rate */}
      {partner.hourlyRate && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Pricing Information
          </h4>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Standard Hourly Rate
                </p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {partner.priceType === "fixed"
                    ? `${formatCurrency(partner.fixedRate)}`
                    : `${formatCurrency(partner.hourlyRate)}/hr`}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;
