import React from "react";
import { 
  X, 
  Clock, 
  DollarSign, 
  Users, 
  Music, 
  Utensils, 
  Camera, 
  Zap, 
  Briefcase 
} from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Select from "../../../../components/common/Select";
import Badge from "../../../../components/common/Badge";
import Button from "../../../../components/common/Button";

const PartnerSelector = ({ partners, selectedPartners, onAddPartner, onRemovePartner, calculateEventHours }) => {
  const { t } = useTranslation();
  
  // Ensure we can call the function, otherwise default to 1
  const hours = typeof calculateEventHours === 'function' ? calculateEventHours() : 1;

  const availablePartners = partners.filter(
    (p) => !selectedPartners.some((sp) => sp.partner === p._id)
  );

  // Helper: Get icon based on service category
  const getServiceIcon = (category = "") => {
    const cat = category.toLowerCase();
    if (cat.includes("music") || cat.includes("dj")) return Music;
    if (cat.includes("cater") || cat.includes("food")) return Utensils;
    if (cat.includes("photo") || cat.includes("video")) return Camera;
    if (cat.includes("light") || cat.includes("decor")) return Zap;
    return Briefcase;
  };

  const handleSelect = (e) => {
    const partnerId = e.target.value;
    if (!partnerId) return;
    
    const p = partners.find(x => x._id === partnerId);
    if (p) {
      const priceType = p.priceType || "fixed";
      const rate = priceType === "hourly" ? (p.hourlyRate || 0) : (p.fixedRate || 0);
      const cost = priceType === "hourly" ? rate * hours : rate;

      onAddPartner({
        partner: p._id,
        partnerName: p.name,
        service: p.category || "Service",
        priceType: priceType,
        rate: rate,
        hours: priceType === "hourly" ? 1 : undefined,
        cost: cost,
        status: "confirmed"
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* --- Selection Input --- */}
      <Select
        label={t('eventForm.components.partnerSelector.addLabel', 'Add Service Partner')}
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

      {/* --- Selected Partners List --- */}
      <div className="space-y-2 sm:space-y-3">
        {selectedPartners.length > 0 ? (
          selectedPartners.map((p, idx) => {
            const ServiceIcon = getServiceIcon(p.service);
            
            return (
              <div 
                key={idx} 
                className="group flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-3 p-3 sm:p-3 bg-white dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm hover:border-blue-300 dark:hover:border-blue-500 transition-all"
              >
                {/* FIXED: Better mobile layout with stacked info and cost/action */}
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {/* Icon Box */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <ServiceIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
                      {p.partnerName}
                    </p>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                      <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{p.service}</span>
                      <Badge 
                        variant="secondary" 
                        size="sm" 
                        className="h-4 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] uppercase tracking-wider shrink-0"
                        icon={p.priceType === 'hourly' ? <Clock size={8} className="sm:w-[10px] sm:h-[10px]" /> : <DollarSign size={8} className="sm:w-[10px] sm:h-[10px]" />}
                      >
                        {p.priceType}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Cost & Action */}
                <div className="flex items-center justify-between xs:justify-end gap-2 sm:gap-4 xs:flex-shrink-0 border-t xs:border-t-0 pt-2 xs:pt-0 border-gray-100 dark:border-gray-600">
                  <div className="text-left xs:text-right">
                    <p className="font-bold text-orange-600 dark:text-orange-400 text-xs sm:text-sm leading-none">
                      {(p.cost || 0).toFixed(2)} <span className="text-[10px] sm:text-xs font-normal text-gray-500">TND</span>
                    </p>
                    {p.priceType === 'hourly' && (
                      <p className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                        ({p.hours || hours}h × {p.rate})
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onRemovePartner(idx)} 
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 sm:p-2 h-7 w-7 sm:h-8 sm:w-8 shrink-0"
                  >
                    <X size={14} className="sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          /* --- Empty State --- */
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic text-center">
              {t('eventForm.components.partnerSelector.noPartners', 'No partners added yet.')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerSelector;