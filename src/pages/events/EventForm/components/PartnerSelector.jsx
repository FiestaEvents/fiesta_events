// src/components/events/EventForm/components/PartnerSelector.jsx
import React from "react";
import { X, Clock, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import Select from "../../../../components/common/Select";

const PartnerSelector = ({ partners, selectedPartners, onAddPartner, onRemovePartner, calculateEventHours }) => {
  const { t } = useTranslation();
  // Ensure we can call the function, otherwise default to 1
  const hours = typeof calculateEventHours === 'function' ? calculateEventHours() : 1;

  const availablePartners = partners.filter(
    (p) => !selectedPartners.some((sp) => sp.partner === p._id)
  );

  const handleSelect = (e) => {
    const partnerId = e.target.value;
    if (!partnerId) return;
    
    const p = partners.find(x => x._id === partnerId);
    if (p) {
      const priceType = p.priceType || "fixed";
      // Determine correct rate and cost immediately
      const rate = priceType === "hourly" ? (p.hourlyRate || 0) : (p.fixedRate || 0);
      const cost = priceType === "hourly" ? rate * hours : rate;

      onAddPartner({
        partner: p._id,
        partnerName: p.name,
        service: p.category || "Service",
        priceType: priceType,
        rate: rate,
        hours: priceType === "hourly" ? 1 : undefined,
        cost: cost, // ✅ Set initial cost correctly here
        status: "confirmed"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Select
        label="Add Partner Service"
        value=""
        onChange={handleSelect}
        options={[
          { value: "", label: t('eventForm.components.partnerSelector.selectPartner') || "Select Partner..." },
          ...availablePartners.map(p => ({
            value: p._id,
            label: `${p.name} - ${p.category} (${p.priceType === 'hourly' ? p.hourlyRate + '/hr' : p.fixedRate})`
          }))
        ]}
      />

      <div className="space-y-2">
        {selectedPartners.map((p, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{p.partnerName}</p>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span>{p.service}</span>
                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center gap-1">
                  {p.priceType === 'hourly' ? <Clock size={10} /> : <DollarSign size={10} />}
                  {p.priceType}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-orange-600">
                  {/* Display calculated cost from Context if available, otherwise manual calc */}
                  {(p.cost || 0).toFixed(2)} TND
                </p>
                {p.priceType === 'hourly' && (
                  <p className="text-xs text-gray-400">({p.hours || hours} hrs x {p.rate})</p>
                )}
              </div>
              <button type="button" onClick={() => onRemovePartner(idx)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {selectedPartners.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-2 italic">No partners added yet.</p>
        )}
      </div>
    </div>
  );
};

export default PartnerSelector;