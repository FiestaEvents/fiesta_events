import React from "react";
import { Users, ExternalLink, Briefcase, DollarSign, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "../../../utils/formatCurrency";

// ✅ Generic Components
import Button from "../../../components/common/Button";
import { StatusBadge } from "../../../components/common/Badge";

const EventPartnersTab = ({ partners, loading, onNavigateToPartner }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mb-3" />
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

  const totalPartnersCost = partners.reduce(
    (sum, partner) => sum + (partner.hourlyRate || 0),
    0
  );

  return (
    <div>
      {/* Header Summary */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            {t("eventPartnersTab.title", { count: partners.length })}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
            {t("eventPartnersTab.totalCost", { amount: formatCurrency(totalPartnersCost) })}
          </p>
        </div>
      </div>

      {/* Partners List */}
      <div className="space-y-4">
        {partners.map((partner, index) => {
          const partnerName = partner.partnerName || partner.partner?.name || t("eventPartnersTab.partner.unknown");
          const initial = partnerName.charAt(0).toUpperCase();

          return (
            <div
              key={partner._id || index}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  
                  {/* Partner Header */}
                  <div className="flex items-center gap-3 mb-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold shadow-sm">
                      {initial}
                    </div>
                    
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">
                        {partnerName}
                      </h4>
                      {/* ✅ Generic Status Badge */}
                      {partner.status && (
                        <div className="mt-1">
                          <StatusBadge status={partner.status} size="xs" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 pl-[3.25rem]">
                    {partner.service && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {partner.service}
                        </span>
                      </div>
                    )}
                    {partner.hourlyRate !== undefined && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>
                          {formatCurrency(partner.hourlyRate)}
                          <span className="text-xs text-gray-400">/hr</span>
                        </span>
                      </div>
                    )}
                  </div>

                  {partner.partner?.email && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 pl-[3.25rem]">
                      {partner.partner.email}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {partner.partner?._id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigateToPartner(partner.partner._id)}
                    title={t("eventPartnersTab.partner.viewDetails")}
                    className="ml-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventPartnersTab;