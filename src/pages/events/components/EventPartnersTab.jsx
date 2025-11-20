// components/events/components/EventPartnersTab.jsx
import React from "react";
import { Users, ExternalLink, Briefcase, DollarSign, CheckCircle } from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import Badge from "../../../components/common/Badge";
import { useTranslation } from "react-i18next";

const EventPartnersTab = ({ partners, loading, onRefresh, onNavigateToPartner }) => {
  const { t } = useTranslation();

  const getPartnerStatusColor = (status) => {
    const colors = {
      confirmed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100",
      cancelled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-100";
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: t("eventPartnersTab.status.confirmed"),
      pending: t("eventPartnersTab.status.pending"),
      cancelled: t("eventPartnersTab.status.cancelled"),
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          {t("eventPartnersTab.loading")}
        </p>
      </div>
    );
  }

  if (!partners || partners.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          {t("eventPartnersTab.emptyState.title")}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("eventPartnersTab.title", { count: partners.length })}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("eventPartnersTab.totalCost", { amount: formatCurrency(totalPartnersCost) })}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {partners.map((partner, index) => (
          <div
            key={partner._id || index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {(partner.partnerName || partner.partner?.name || t("eventPartnersTab.partner.unknown")).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {partner.partnerName || partner.partner?.name || t("eventPartnersTab.partner.unknown")}
                    </h4>
                    {partner.status && (
                      <Badge className={`text-xs ${getPartnerStatusColor(partner.status)}`}>
                        {getStatusLabel(partner.status)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mt-3">
                  {partner.service && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{partner.service}</span>
                    </div>
                  )}
                  {partner.hourlyRate !== undefined && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>{formatCurrency(partner.hourlyRate)}/hr</span>
                    </div>
                  )}
                </div>

                {partner.partner?.email && (
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {partner.partner.email}
                  </div>
                )}
              </div>

              {partner.partner?._id && (
                <button
                  onClick={() => onNavigateToPartner(partner.partner._id)}
                  className="ml-2 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition dark:text-orange-400 dark:hover:bg-orange-900/20"
                  title={t("eventPartnersTab.partner.viewDetails")}
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventPartnersTab;