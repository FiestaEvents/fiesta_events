// src/components/events/EventForm/steps/Step3VenuePricing.jsx
import React, { useState } from "react";
import {
  Building,
  DollarSign,
  Users,
  AlertTriangle,
  MapPin,
  Percent,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Select from "../../../../components/common/Select";
import Input from "../../../../components/common/Input";
import Badge from "../../../../components/common/Badge";
import Button from "../../../../components/common/Button";
import PartnerSelector from "../components/PartnerSelector";

const Step3VenuePricing = ({
  formData,
  handleChange,
  venueSpaces,
  partners,
  errors,
  warnings,
  onAddPartner,
  onRemovePartner,
}) => {
  const { t } = useTranslation();
  const selectedSpace = venueSpaces.find(
    (s) => s._id === formData.venueSpaceId
  );

  // Helper functions for discount calculation
  const calculateDiscount = () => {
    const discount = parseFloat(formData.pricing.discount) || 0;
    const basePrice = parseFloat(formData.pricing.basePrice) || 0;

    if (formData.pricing.discountType === "percentage") {
      return ((basePrice * discount) / 100).toFixed(2);
    }
    return discount.toFixed(2);
  };

  const calculateFinalPrice = () => {
    const basePrice = parseFloat(formData.pricing.basePrice) || 0;
    const discountAmount = parseFloat(calculateDiscount());
    return Math.max(0, basePrice - discountAmount).toFixed(2);
  };

  return (
    <div className="space-y-6 animate-in fade-in-from-right-5 duration-300">
      {/* Venue Space Selection */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-purple-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {t('eventForm.step3.venueSpaceSelection')}
          </h4>
        </div>

        {/* Conflict Warning */}
        {warnings.dateConflict && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                {warnings.dateConflict.message}
              </p>
              {warnings.dateConflict.conflicts?.map((event, idx) => (
                <p
                  key={idx}
                  className="text-xs text-red-700 dark:text-red-400 mt-1"
                >
                  • {event.title} (
                  {new Date(event.startDate).toLocaleDateString()})
                </p>
              ))}
            </div>
          </div>
        )}

        <Select
          name="venueSpaceId"
          label={t('eventForm.step3.selectVenueSpace')}
          value={formData.venueSpaceId}
          onChange={handleChange}
          error={errors.venueSpaceId}
          required
          options={[
            { value: "", label: t('eventForm.step3.selectVenueSpacePlaceholder') },
            ...venueSpaces
              .filter((space) => space.isActive && !space.isArchived)
              .map((space) => ({
                value: space._id,
                label: `${space.name} - ${space.basePrice} ${t('eventForm.currency')} (${space.capacity?.min || 0}-${space.capacity?.max || 0} ${t('eventForm.step3.guests')})`,
              })),
          ]}
        />

        {/* Selected Space Details */}
        {selectedSpace && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-900/20 border rounded-lg">
            <div className="flex justify-between items-start gap-3 mb-3">
              <h5 className="font-semibold text-gray-700 dark:text-gray-300">
                {t('eventForm.step3.selectedVenueSpace')}
              </h5>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  handleChange({ target: { name: "venueSpaceId", value: "" } })
                }
              >
                {t('eventForm.step3.changeSpace')}
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedSpace.name}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('eventForm.step3.basePrice')}:
                  </span>
                  <p className="font-bold text-orange-600">
                    {selectedSpace.basePrice} {t('eventForm.currency')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('eventForm.step3.capacity')}:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedSpace.capacity?.min || 0}-
                    {selectedSpace.capacity?.max || 0}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('eventForm.step3.status')}:
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white capitalize">
                    {selectedSpace.isReserved 
                      ? t('eventForm.step3.reserved') 
                      : t('eventForm.step3.available')}
                  </p>
                </div>
              </div>
              {selectedSpace.amenities?.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('eventForm.step3.amenities')}:
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedSpace.amenities.map((amenity, idx) => (
                      <Badge key={idx} className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Capacity Warning */}
        {warnings.guestCount && (
          <div
            className={`mt-4 p-3 border-2 rounded-lg flex items-start gap-2 ${
              warnings.guestCount.type === "error"
                ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
            }`}
          >
            <AlertTriangle
              className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                warnings.guestCount.type === "error"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}
            />
            <span
              className={`text-sm ${
                warnings.guestCount.type === "error"
                  ? "text-red-800 dark:text-red-300"
                  : "text-yellow-800 dark:text-yellow-300"
              }`}
            >
              {warnings.guestCount.message}
            </span>
          </div>
        )}
      </div>

      {/* Pricing and Partners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {t('eventForm.step3.pricing')}
            </h4>
          </div>
          <div className="space-y-4">
            <Input
              label={t('eventForm.step3.basePriceLabel')}
              name="pricing.basePrice"
              type="number"
              step="0.01"
              value={formData.pricing.basePrice}
              onChange={handleChange}
              error={errors["pricing.basePrice"]}
              leftElement={
                <span className="text-sm font-semibold text-gray-500 pointer-events-none">
                  {t('eventForm.currency')}
                </span>
              }
              disabled
            />
            
            {/* Discounts */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('eventForm.step3.discount')}
              </label>
              
              {/* Minimal Tab Toggle */}
              <div className="flex items-center gap-1 border-b-2 border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: {
                        name: "pricing.discountType",
                        value: "percentage",
                      },
                    })
                  }
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all ${
                    formData.pricing.discountType === "percentage"
                      ? "text-orange-600 border-b-2 border-orange-600 -mb-0.5 dark:text-orange-400 dark:border-orange-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  <span>{t('eventForm.step3.discountTypes.percentage')}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: { name: "pricing.discountType", value: "fixed" },
                    })
                  }
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all ${
                    formData.pricing.discountType === "fixed"
                      ? "text-orange-600 border-b-2 border-orange-600 -mb-0.5 dark:text-orange-400 dark:border-orange-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{t('eventForm.step3.discountTypes.fixed')}</span>
                </button>
              </div>

              {/* Discount Input */}
              <div className="relative">
                <input
                  name="pricing.discount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={
                    formData.pricing.discountType === "percentage"
                      ? "100"
                      : undefined
                  }
                  value={formData.pricing.discount}
                  onChange={(e) => {
                    const value = e.target.value;

                    if (value === "") {
                      handleChange(e);
                      return;
                    }

                    const numValue = parseFloat(value);

                    if (!isNaN(numValue) && numValue >= 0) {
                      if (
                        formData.pricing.discountType === "percentage" &&
                        numValue > 100
                      ) {
                        return;
                      }
                      
                      const formattedValue = Math.round(numValue * 100) / 100;
                      e.target.value = formattedValue.toString();
                      handleChange(e);
                    } else if (numValue < 0) {
                      e.target.value = "";
                      handleChange({
                        target: {
                          name: "pricing.discount",
                          value: ""
                        }
                      });
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && !isNaN(parseFloat(value)) && parseFloat(value) >= 0) {
                      const formattedValue = parseFloat(value).toFixed(2);
                      if (formattedValue !== value) {
                        e.target.value = formattedValue;
                        handleChange({
                          target: {
                            name: "pricing.discount",
                            value: formattedValue
                          }
                        });
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    const invalidKeys = ['-', 'e', 'E', '+'];
                    if (invalidKeys.includes(e.key)) {
                      e.preventDefault();
                      return;
                    }

                    if (e.key === '.' && e.target.value.includes('.')) {
                      e.preventDefault();
                      return;
                    }

                    if (
                      !/[\d.]/.test(e.key) &&
                      !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    const pastedText = e.clipboardData.getData("text");
                    const numValue = parseFloat(pastedText);

                    if (isNaN(numValue) || numValue < 0) {
                      e.preventDefault();
                      return;
                    }

                    if (
                      formData.pricing.discountType === "percentage" &&
                      numValue > 100
                    ) {
                      e.preventDefault();
                      return;
                    }

                    const formattedValue = Math.round(numValue * 100) / 100;
                    if (formattedValue.toString() !== pastedText) {
                      e.preventDefault();
                      handleChange({
                        target: {
                          name: "pricing.discount",
                          value: formattedValue.toString()
                        }
                      });
                    }
                  }}
                  onWheel={(e) => {
                    e.target.blur();
                  }}
                  placeholder={
                    formData.pricing.discountType === "percentage"
                      ? "0"
                      : "0.00"
                  }
                  className="w-full px-3 py-2 pr-14 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 pointer-events-none">
                  {formData.pricing.discountType === "percentage" ? "%" : t('eventForm.currency')}
                </span>
              </div>

              {/* Inline Preview */}
              {formData.pricing.discount > 0 &&
                formData.pricing.basePrice > 0 && (
                  <div className="flex items-baseline gap-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t('eventForm.step3.finalPrice')}:
                    </span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {calculateFinalPrice()} {t('eventForm.currency')}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400">
                      (-{calculateDiscount()} {t('eventForm.currency')})
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Partners */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {t('eventForm.step3.servicePartners')}
            </h4>
          </div>
          <PartnerSelector
            partners={partners}
            selectedPartners={formData.partners}
            onAddPartner={onAddPartner}
            onRemovePartner={onRemovePartner}
          />
        </div>
      </div>
    </div>
  );
};

export default Step3VenuePricing;