import React from "react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext";

import Select from "../../../../components/common/Select";
import Input from "../../../../components/common/Input";
import PartnerSelector from "../components/PartnerSelector";
import SupplySelector from "../components/SupplySelector";
import PriceSummary from "../components/PriceSummary";

const Step3VenuePricing = () => {
  const { t } = useTranslation();
  const {
    formData,
    handleChange,
    venueSpaces,
    partners,
    errors,
    setFormData,
    calculations,
  } = useEventContext();

  const handleAddPartner = (newPartner) =>
    setFormData((prev) => ({
      ...prev,
      partners: [...prev.partners, newPartner],
    }));
  const handleRemovePartner = (index) =>
    setFormData((prev) => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index),
    }));

  const handleAddSupply = (newSupply) =>
    setFormData((prev) => ({
      ...prev,
      supplies: [...(prev.supplies || []), newSupply],
    }));
  const handleRemoveSupply = (index) =>
    setFormData((prev) => ({
      ...prev,
      supplies: (prev.supplies || []).filter((_, i) => i !== index),
    }));

  // ✅ New Generic Updater
  const handleUpdateSupply = (index, updates) => {
    setFormData((prev) => ({
      ...prev,
      supplies: (prev.supplies || []).map((supply, i) =>
        i === index ? { ...supply, ...updates } : supply
      ),
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t("eventForm.step3.venueSpace")}
          </h3>
          <Select
            label={t("eventForm.step3.selectVenueSpace")}
            name="venueSpaceId"
            value={formData.venueSpaceId}
            onChange={handleChange}
            error={errors.venueSpaceId}
            options={[
              {
                value: "",
                label: t("eventForm.step3.selectVenueSpacePlaceholder"),
              },
              ...venueSpaces.map((s) => ({
                value: s._id,
                label: `${s.name} (${s.basePrice} TND)`,
              })),
            ]}
          />
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {t("eventForm.step3.additionalServices")}
          </h3>
          <PartnerSelector
            partners={partners}
            selectedPartners={formData.partners}
            onAddPartner={handleAddPartner}
            onRemovePartner={handleRemovePartner}
            calculateEventHours={() => calculations?.eventHours || 1}
          />
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {t("eventForm.step3.eventSupplies")}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("eventForm.step3.eventSuppliesDescription")}
            </p>
          </div>
          <SupplySelector
            selectedSupplies={formData.supplies || []}
            onAddSupply={handleAddSupply}
            onRemoveSupply={handleRemoveSupply}
            onUpdateSupply={handleUpdateSupply} // ✅ Pass new handler
          />
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          <PriceSummary />
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-sm mb-3">
              {t("eventForm.step3.adjustments")}
            </h4>
            <Input
              label={t("eventForm.step3.discountAmount")}
              type="number"
              name="pricing.discount"
              value={formData.pricing.discount}
              onChange={handleChange}
              className="mb-3"
            />
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "pricing.discountType", value: "fixed" },
                  })
                }
                className={`flex-1 text-xs py-1 rounded ${formData.pricing.discountType === "fixed" ? "bg-orange-100 text-orange-700 font-bold" : "bg-gray-100"}`}
              >
                {t("eventForm.step3.fixed")} (TND)
              </button>
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
                className={`flex-1 text-xs py-1 rounded ${formData.pricing.discountType === "percentage" ? "bg-orange-100 text-orange-700 font-bold" : "bg-gray-100"}`}
              >
                {t("eventForm.step3.percentage")} (%)
              </button>
            </div>
            <Input
              label={t("eventForm.step3.taxRate")}
              type="number"
              name="pricing.taxRate"
              value={formData.pricing.taxRate}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3VenuePricing;
