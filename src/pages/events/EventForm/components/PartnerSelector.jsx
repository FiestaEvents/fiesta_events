// src/components/events/EventForm/components/PartnerSelector.jsx
import React from "react";
import { X, CheckCircle, Clock, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import Select from "../../../../components/common/Select";

const PartnerSelector = ({
  partners,
  selectedPartners,
  onAddPartner,
  onRemovePartner,
  prefilledPartner,
  calculateEventHours,
}) => {
  const { t } = useTranslation();
  
  const availablePartners = partners.filter(
    (p) => !selectedPartners.some((sp) => sp.partner === p._id)
  );

  const handleSelectPartner = (e) => {
    const partnerId = e.target.value;
    if (!partnerId) return;
    
    const partner = partners.find((p) => p._id === partnerId);
    if (partner) {
      onAddPartner({
        partner: partner._id,
        partnerName: partner.name,
        service: partner.category || t('eventForm.components.partnerSelector.generalService'),
        priceType: partner.priceType || "fixed",
        rate: partner.priceType === "hourly" ? partner.hourlyRate : partner.fixedRate,
        hours: partner.priceType === "hourly" ? 1 : 0,
        status: "confirmed",
      });
    }
  };

  const getPartnerCost = (partner, hours) => {
    const rate = partner.rate || 0;
    
    if (partner.priceType === "hourly") {
      return rate * (hours || 1);
    } else {
      return rate;
    }
  };

  const formatPartnerPrice = (partner) => {
    const rate = partner.rate || 0;
    
    if (partner.priceType === "hourly") {
      return `${rate} ${t('eventForm.currency')}/${t('eventForm.components.partnerSelector.hour')}`;
    } else {
      return `${rate} ${t('eventForm.currency')}`;
    }
  };

  const formatPartnerCostBreakdown = (partner, hours) => {
    const rate = partner.rate || 0;
    
    if (partner.priceType === "hourly") {
      return `${rate} ${t('eventForm.currency')}/${t('eventForm.components.partnerSelector.hour')} × ${hours}${t('eventForm.components.partnerSelector.hourShort')} = ${getPartnerCost(partner, hours).toFixed(2)} ${t('eventForm.currency')}`;
    } else {
      return `${t('eventForm.components.partnerSelector.fixedRate')}: ${rate.toFixed(2)} ${t('eventForm.currency')}`;
    }
  };

  return (
    <div className="space-y-3">
      {/* Prefilled Partner Banner */}
      {prefilledPartner && (
        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">
              {t('eventForm.components.partnerSelector.preSelected')}
            </span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            <strong>{prefilledPartner.name}</strong> {t('eventForm.components.partnerSelector.autoAdded')}
          </p>
        </div>
      )}

      {/* Add Partner Dropdown */}
      <Select
        value=""
        onChange={handleSelectPartner}
        options={[
          { value: "", label: t('eventForm.components.partnerSelector.selectPartner') },
          ...availablePartners.map((p) => {
            const price = p.priceType === "hourly" 
              ? `${p.hourlyRate || 0} ${t('eventForm.currency')}/${t('eventForm.components.partnerSelector.hour')}`
              : `${p.fixedRate || 0} ${t('eventForm.currency')} (${t('eventForm.components.partnerSelector.fixed')})`;
            return {
              value: p._id,
              label: `${p.name} - ${price}`,
            };
          }),
        ]}
        className="w-full"
      />

      {/* Selected Partners List */}
      {selectedPartners.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('eventForm.components.partnerSelector.addedPartners', { count: selectedPartners.length })}
          </p>
          {selectedPartners.map((partner, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {partner.partnerName?.charAt(0).toUpperCase() || "P"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {partner.partnerName}
                    </div>
                    {partner.priceType === "hourly" ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">
                        <Clock className="w-3 h-3" />
                        {t('eventForm.components.partnerSelector.hourly')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">
                        <DollarSign className="w-3 h-3" />
                        {t('eventForm.components.partnerSelector.fixed')}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {formatPartnerCostBreakdown(partner, calculateEventHours?.())}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <div className="text-right">
                  <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {getPartnerCost(partner, calculateEventHours?.()).toFixed(2)} {t('eventForm.currency')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePartner(idx)}
                  className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title={t('eventForm.components.partnerSelector.removePartner')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {selectedPartners.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
          {t('eventForm.components.partnerSelector.noPartners')}
        </div>
      )}
    </div>
  );
};

export default PartnerSelector;