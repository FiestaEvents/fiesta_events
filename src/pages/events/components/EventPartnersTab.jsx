import React from "react";
import {
  Users,
  ExternalLink,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../../utils/formatCurrency";
import OrbitLoader from "../../../components/common/LoadingSpinner";
// ✅ Generic Components
import Button from "../../../components/common/Button";
import { StatusBadge } from "../../../components/common/Badge";

const EventPartnersTab = ({ partners, loading, onNavigateToPartner }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <OrbitLoader className="w-8 h-8 text-orange-600 animate-spin mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          {t("eventPartnersTab.loading")}
        </p>
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          {t("eventPartnersTab.emptyState.title")}
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          {t("eventPartnersTab.emptyState.description")}
        </p>
      </div>
    );
  }

  // ✅ Calculate total cost from partners
  const totalPartnersCost = partners.reduce(
    (sum, partner) => sum + (partner.cost || 0),
    0
  );

  return (
    <div>
      {/* Header Summary */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              {t("eventPartnersTab.title", { count: partners.length })}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {partners.filter((p) => p.status === "confirmed").length}{" "}
              confirmed
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {t("eventPartnersTab.totalCost")}
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPartnersCost)}
            </p>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="space-y-4">
        {partners.map((partner, index) => {
          // Get partner info from populated partner object or fallback
          const partnerData = partner.partner || {};
          const partnerName =
            partnerData.name || t("eventPartnersTab.partner.unknown");
          const partnerEmail = partnerData.email;
          const partnerPhone = partnerData.phone;
          const partnerCategory = partnerData.category;
          const initial = partnerName.charAt(0).toUpperCase();

          return (
            <div
              key={partner._id || index}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all dark:bg-gray-800 dark:border-gray-700 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Partner Header */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-lg shadow-sm">
                      {initial}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {partnerName}
                        </h4>
                        {partner.status && (
                          <StatusBadge status={partner.status} size="xs" />
                        )}
                      </div>
                      {partnerCategory && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {partnerCategory.replace("_", " ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Service & Cost Details */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                    {partner.service && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                            {t("eventPartnersTab.partner.service")}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {partner.service}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {/* Cost */}
                      {partner.cost !== undefined && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                              {t("eventPartnersTab.partner.cost")}
                            </p>
                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(partner.cost)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Hours */}
                      {partner.hours !== undefined && partner.hours > 0 && (
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                              {t("eventPartnersTab.partner.hours")}
                            </p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {partner.hours}{" "}
                              {partner.hours === 1 ? "hour" : "hours"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  {(partnerEmail || partnerPhone) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        {partnerEmail && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">📧</span>
                            {partnerEmail}
                          </span>
                        )}
                        {partnerPhone && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">📞</span>
                            {partnerPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {partnerData._id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateToPartner(partnerData._id)}
                    title={t("eventPartnersTab.partner.viewDetails")}
                    className="ml-4 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/10 rounded-lg p-4 border border-orange-200 dark:border-orange-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {t("eventPartnersTab.summary.title")}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {partners.length} partner{partners.length !== 1 ? "s" : ""} •{" "}
                  {partners.filter((p) => p.status === "confirmed").length}{" "}
                  confirmed
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
                {t("eventPartnersTab.summary.totalCost")}
              </p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(totalPartnersCost)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPartnersTab;
