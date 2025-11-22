import React from "react";
import { Building, DollarSign, Users, Calculator } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 
import Select from "../../../../components/common/Select";
import Input from "../../../../components/common/Input";
import PartnerSelector from "../components/PartnerSelector";

const Step3VenuePricing = () => {
  const { t } = useTranslation();
  
  // 1. Extract everything from Context
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

  // 2. Partner Handlers
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

  // 3. Safety Accessor for Calculations
  // This prevents the "undefined" crash if the context hasn't finished calc yet
  const calc = (key) => (calculations?.[key] || 0).toFixed(2);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-5 duration-300">
      
      {/* === SECTION 1: VENUE SPACE === */}
      <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Building className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
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
          <div className={`mt-3 text-sm p-3 rounded-lg flex items-start gap-2 border ${
            warnings.guestCount.type === 'error' 
              ? 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' 
              : 'bg-amber-50 border-amber-100 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
          }`}>
            <span>{warnings.guestCount.message}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* === SECTION 2: PRICING & TAX === */}
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {t('eventForm.step3.pricing')}
            </h4>
          </div>

          <div className="space-y-5">
            {/* Base Price (Read Only) */}
            <Input 
              label={t('eventForm.step3.basePriceLabel')} 
              name="pricing.basePrice" 
              type="number" 
              value={formData.pricing.basePrice} 
              onChange={handleChange} 
              error={errors["pricing.basePrice"]} 
              disabled 
              className="bg-gray-50 dark:bg-gray-700"
            />
            
            {/* Discount & Tax Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('eventForm.step3.discount')}
                </label>
                <div className="flex rounded-lg shadow-sm">
                  <input 
                    type="number" 
                    name="pricing.discount"
                    value={formData.pricing.discount} 
                    onChange={handleChange}
                    className="block w-full min-w-0 flex-1 rounded-l-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white p-2.5"
                    placeholder="0"
                  />
                  <select 
                    name="pricing.discountType" 
                    value={formData.pricing.discountType} 
                    onChange={handleChange}
                    className="inline-flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  >
                    <option value="fixed">TND</option>
                    <option value="percentage">%</option>
                  </select>
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
              />
            </div>

            {/* === LIVE RECEIPT PREVIEW === */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-500 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700 font-medium">
                <Calculator size={14} /> Calculation Breakdown
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Venue Base:</span>
                <span>{calc('basePrice')}</span>
              </div>
              
              {(calculations?.partnersTotal > 0) && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Partners:</span>
                  <span>+ {calc('partnersTotal')}</span>
                </div>
              )}

              {(calculations?.discountAmount > 0) && (
                <div className="flex justify-between text-red-500">
                  <span>Discount:</span>
                  <span>- {calc('discountAmount')}</span>
                </div>
              )}

              <div className="flex justify-between font-semibold text-gray-900 dark:text-white pt-1 border-t border-dashed border-gray-200 dark:border-gray-700">
                <span>Subtotal (HT):</span>
                {/* ✅ Safety check applied here */}
                <span>{calc('subtotalAfterDiscount')}</span>
              </div>

              <div className="flex justify-between text-gray-500">
                <span>Tax ({formData.pricing.taxRate}%):</span>
                <span>+ {calc('taxAmount')}</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-300 dark:border-gray-600 font-bold text-lg text-orange-600 dark:text-orange-400">
                <span>Total (TTC):</span>
                <span>{calc('totalPrice')} TND</span>
              </div>
            </div>
          </div>
        </div>

        {/* === SECTION 3: PARTNERS === */}
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {t('eventForm.step3.servicePartners')}
            </h4>
          </div>
          
          <PartnerSelector
            partners={partners}
            selectedPartners={formData.partners}
            onAddPartner={handleAddPartner}
            onRemovePartner={handleRemovePartner}
            // Use safe accessor for eventHours too
            calculateEventHours={() => calculations?.eventHours || 1}
          />
        </div>
      </div>
    </div>
  );
};

export default Step3VenuePricing;