import React, { useEffect, useState, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Percent,
  DollarSign,
  Archive,
  Tags,
  MapPin,
  Users,
  AlertTriangle,
  Loader2
} from "lucide-react";

// Components
import { FormInput } from "../../../../components/forms/FormInput";
import { FormSelect } from "../../../../components/forms/FormSelect";
import { PartnerSelector } from "../components/PartnerSelector";
import { SupplySelector } from "../components/SupplySelector";
import { venueService } from "../../../../api/index";
import OrbitLoader from "../../../../components/common/LoadingSpinner"; 

const Step3VenuePricing = () => {
  const { t } = useTranslation();
  const {
    setValue,
    control,
    setError,
    clearErrors,
    getValues,
    formState: { errors },
  } = useFormContext();
  const [spaces, setSpaces] = useState([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);

  const watchedSpaceId = useWatch({ control, name: "venueSpaceId" });
  const discountType = useWatch({ control, name: "pricing.discountType" });
  const guestCount = useWatch({ control, name: "guestCount" });

  // 1. Fetch & Auto-Select First Space
  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setLoadingSpaces(true);
        const res = await venueService.getSpaces();
        const loadedSpaces = res.spaces || res.data?.spaces || [];
        setSpaces(loadedSpaces);

        // Auto-select first venue if nothing is selected
        const currentSelection = getValues("venueSpaceId");
        if (!currentSelection && loadedSpaces.length > 0) {
          const firstSpace = loadedSpaces[0];
          // console.log("📍 Auto-selecting first venue:", firstSpace.name);
          setValue("venueSpaceId", firstSpace._id, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      } catch (err) {
        console.error("Failed to load spaces", err);
      } finally {
        setLoadingSpaces(false);
      }
    };
    fetchSpaces();
  }, [setValue, getValues]); 

  // 2. Derive Selected Space
  const selectedSpace = useMemo(
    () => spaces.find((s) => s._id === watchedSpaceId),
    [spaces, watchedSpaceId]
  );

  //  FIX: Calculate maxVal here (Component Scope) so JSX can see it
  const maxCap = selectedSpace?.capacity?.seated || selectedSpace?.capacity || 0;
  const maxVal = typeof maxCap === "object" ? maxCap.max || 9999 : maxCap;

  // 3. Logic: Auto-fill Base Price & Capacity Check
  useEffect(() => {
    if (selectedSpace) {
      setValue("pricing.basePrice", selectedSpace.basePrice);

      // Use the calculated maxVal variable
      if (Number(guestCount) > Number(maxVal)) {
        setError("venueSpaceId", {
          type: "custom",
          message: t("eventForm.step3.warningCapacity", { count: guestCount, max: maxVal }) || `Warning: ${guestCount} exceeds capacity (${maxVal})`,
        });
      } else {
        clearErrors("venueSpaceId");
      }
    }
  }, [selectedSpace, guestCount, maxVal, setValue, setError, clearErrors, t]);

  const formatCapacity = (cap) => {
    if (!cap) return "N/A";
    return typeof cap === "object"
      ? `${cap.seated || cap.max} Guests`
      : `${cap} Guests`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* --- SECTION A: Venue Space --- */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
            <Building2 size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("eventForm.step3.title")}
          </h3>
        </div>

        {loadingSpaces ? (
          <div className="flex items-center justify-center p-8 text-gray-400 gap-2">
            <OrbitLoader /> {t("eventForm.step3.loading")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* 1. DROPDOWN */}
            <div className="space-y-2">
              <FormSelect
                name="venueSpaceId"
                label={t("eventForm.step3.selectVenueSpace")}
                placeholder={t("eventForm.step3.placeholder")}
                options={spaces.map((s) => ({
                  value: s._id,
                  label: s.name,
                }))}
              />

              {errors.venueSpaceId && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2 rounded-md">
                  <AlertTriangle size={14} className="shrink-0" />
                  {errors.venueSpaceId.message}
                </div>
              )}
            </div>

            {/* 2. DETAILS CARD */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t("eventForm.step3.selectedDetails")}
              </label>

              {selectedSpace ? (
                <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/50 rounded-lg p-4 transition-all animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-purple-900 dark:text-purple-100 text-sm flex items-center gap-2">
                        <MapPin size={14} /> {selectedSpace.name}
                      </h4>
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1 flex items-center gap-2">
                        <Users size={12} /> {t("eventForm.step3.maxCapacity")}
                        <span className="font-semibold">
                          {formatCapacity(selectedSpace.capacity)}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-purple-500 uppercase font-bold tracking-wider">
                       {t("eventForm.step3.baseRate")}
                      </span>
                      <span className="text-xl font-bold text-purple-800 dark:text-white">
                        {selectedSpace.basePrice}{" "}
                        <span className="text-xs font-medium">TND</span>
                      </span>
                    </div>
                  </div>

                  {/* Capacity Meter */}
                  <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${errors.venueSpaceId ? "bg-amber-500" : "bg-purple-500"}`}
                      style={{
                        width: `${Math.min((Number(guestCount || 0) / (typeof selectedSpace.capacity === "object" ? selectedSpace.capacity.max || 200 : selectedSpace.capacity || 200)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg h-[106px] flex flex-col justify-center items-center text-gray-400">
                  <Building2 size={24} className="mb-2 opacity-50" />
                  <span className="text-xs">No space selected</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* --- SECTION B: Pricing Adjustments --- */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
            <Tags size={20} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {t("eventForm.step3.pricingTitle")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            name="pricing.taxRate"
            label={t("eventForm.step3.taxRate")}
            type="number"
            placeholder="19"
          />

          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {t("eventForm.step3.discountMode")}
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() =>
                    setValue("pricing.discountType", "fixed", {
                      shouldDirty: true,
                    })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                    discountType === "fixed"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white"
                      : "text-gray-500"
                  }`}
                >
                  <DollarSign size={14} /> {t("eventForm.step3.fixed")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setValue("pricing.discountType", "percentage", {
                      shouldDirty: true,
                    })
                  }
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                    discountType === "percentage"
                      ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white"
                      : "text-gray-500"
                  }`}
                >
                  <Percent size={14} /> {t("eventForm.step3.percent")}
                </button>
              </div>
            </div>
            <div className="flex-1">
              <FormInput
                name="pricing.discount"
                label={t("eventForm.step3.discountValue")}
                type="number"
                min="0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partners & Supplies Sections */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <PartnerSelector />
      </section>

      <section className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <SupplySelector />
      </section>
    </div>
  );
};

export default Step3VenuePricing;