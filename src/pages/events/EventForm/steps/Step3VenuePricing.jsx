import React from "react";
import { Building, DollarSign, Users, Calculator, Plus, Percent, Receipt } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 

// ✅ Generic Components
import Select from "../../../../components/common/Select";
import Input from "../../../../components/common/Input";
import PartnerSelector from "../components/PartnerSelector";

const Step3VenuePricing = () => {
  const { t } = useTranslation();
  
  // 1. Context Extraction
  const { 
    formData, 
    handleChange, 
    venueSpaces, 
    partners, 
    errors, 
    warnings, 
    setFormData, 
    calculations 
  } = useEventContext();

  // 2. Partner Logic
  const handleAddPartner = (newPartner) => {
    setFormData(prev => ({ 
      ...prev, 
      partners: [...prev.partners, newPartner] 
    }));
  };

  const handleRemovePartner = (index) => {
    setFormData(prev => ({ 
      ...prev, 
      partners: prev.partners.filter((_, i) => i !== index) 
    }));
  };

  // 3. Safety Helper for Numbers
  const calc = (key) => (calculations?.[key] || 0).toFixed(2);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* --- Venue Space Selection (Full Width) --- */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
          <div className="p-1.5 sm:p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
            <Building className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
            {t('eventForm.step3.venueSpaceSelection')}
          </h4>
        </div>

        <Select
          name="venueSpaceId"
          label={t('eventForm.step3.selectVenueSpace')}
          value={formData.venueSpaceId}
          onChange={handleChange}
          error={errors.venueSpaceId}
          options={[
            { value: "", label: t('eventForm.step3.selectVenueSpacePlaceholder') || "Select Space" },
            ...venueSpaces.map(s => ({ 
              value: s._id, 
              label: `${s.name} (${s.basePrice} TND) - Cap: ${s.capacity?.max || 'N/A'}` 
            }))
          ]}
        />

        {/* Capacity Warnings */}
        {warnings.guestCount && (
          <div className={`mt-3 sm:mt-4 text-xs sm:text-sm p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3 border ${
            warnings.guestCount.type === 'error' 
              ? 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' 
              : 'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
          }`}>
            <div className={`mt-0.5 p-1 rounded-full shrink-0 ${warnings.guestCount.type === 'error' ? 'bg-red-200 dark:bg-red-900' : 'bg-amber-200 dark:bg-amber-900'}`}>
              <Users className="w-3 h-3" />
            </div>
            <span className="leading-relaxed font-medium">{warnings.guestCount.message}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* --- Left Column: Pricing & Breakdown --- */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
            <div className="p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {t('eventForm.step3.pricing')}
            </h4>
          </div>

          <div className="space-y-4 sm:space-y-5 flex-1">
            {/* Base Price */}
            <Input 
              label={t('eventForm.step3.basePriceLabel')} 
              name="pricing.basePrice" 
              type="number" 
              value={formData.pricing.basePrice} 
              onChange={handleChange} 
              error={errors["pricing.basePrice"]} 
              disabled 
              className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
            />
            
            {/* FIXED: Better mobile layout for discount & tax */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Discount Input Group */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('eventForm.step3.discount')}
                </label>
                {/* FIXED: Stack vertically on tiny screens, horizontal on sm+ */}
                <div className="flex flex-col xs:flex-row rounded-lg shadow-sm">
                  <input 
                    type="number" 
                    name="pricing.discount"
                    value={formData.pricing.discount} 
                    onChange={handleChange}
                    className="block w-full xs:flex-1 xs:min-w-0 rounded-lg xs:rounded-r-none border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white p-2 sm:p-2.5 transition-colors"
                    placeholder="0"
                  />
                  <div className="relative mt-2 xs:mt-0">
                    <select 
                      name="pricing.discountType" 
                      value={formData.pricing.discountType} 
                      onChange={handleChange}
                      className="h-full w-full xs:w-auto rounded-lg xs:rounded-l-none border xs:border-l-0 border-gray-300 bg-gray-50 px-3 py-2 sm:py-0 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 focus:ring-0 focus:border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors appearance-none pr-8"
                    >
                      <option value="fixed">TND</option>
                      <option value="percentage">%</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Rate */}
              <Input 
                label="Tax Rate (%)" 
                name="pricing.taxRate" 
                type="number" 
                step="0.1"
                value={formData.pricing.taxRate} 
                onChange={handleChange}
                placeholder="19"
                icon={Percent}
              />
            </div>

            {/* Live Receipt Preview */}
            <div className="mt-4 sm:mt-6 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 sm:mb-4">
                <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Calculation Breakdown
              </div>
              
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Venue Base</span>
                  <span className="font-medium text-gray-900 dark:text-white">{calc('basePrice')}</span>
                </div>
                
                {(calculations?.partnersTotal > 0) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Partners</span>
                    <span className="font-medium text-gray-900 dark:text-white">+ {calc('partnersTotal')}</span>
                  </div>
                )}

                {(calculations?.discountAmount > 0) && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>- {calc('discountAmount')}</span>
                  </div>
                )}

                <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

                <div className="flex justify-between font-medium text-gray-700 dark:text-gray-300">
                  <span>Subtotal (HT)</span>
                  <span>{calc('subtotalAfterDiscount')}</span>
                </div>

                <div className="flex justify-between text-gray-500">
                  <span>Tax ({formData.pricing.taxRate}%)</span>
                  <span>+ {calc('taxAmount')}</span>
                </div>

                <div className="my-2 border-t border-gray-200 dark:border-gray-700"></div>

                <div className="flex justify-between items-end pt-1">
                  <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">Total (TTC)</span>
                  <span className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-500 leading-none">
                    {calc('totalPrice')} <span className="text-xs sm:text-sm font-normal text-gray-500">TND</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column: Partner Selection --- */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
            <div className="p-1.5 sm:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {t('eventForm.step3.servicePartners')}
            </h4>
          </div>
          
          <PartnerSelector
            partners={partners}
            selectedPartners={formData.partners}
            onAddPartner={handleAddPartner}
            onRemovePartner={handleRemovePartner}
            calculateEventHours={() => calculations?.eventHours || 1}
          />
        </div>
      </div>
    </div>
  );
};

export default Step3VenuePricing;