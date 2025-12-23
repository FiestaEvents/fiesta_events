import React, { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Package, Users, Home, User, Calendar } from "lucide-react";
import { useEventCalculations } from "../../../../hooks/useEventCalculations";
import { clientService, venueService } from "../../../../api/index";

const Step5Review = () => {
  const { t } = useTranslation();
  const { control, register } = useFormContext();

  const formData = useWatch({ control });
  const calculations = useEventCalculations(control);

  const [clientDetails, setClientDetails] = useState(null);
  const [venueDetails, setVenueDetails] = useState(null);

  useEffect(() => {
    const resolveData = async () => {
      if (formData.clientId) {
        try {
          const res = await clientService.getById(formData.clientId);
          const client = res.client || res.data?.client || res.data || res;
          setClientDetails(client);
        } catch (e) {
          console.error("Could not fetch client name", e);
        }
      }

      if (formData.venueSpaceId) {
        try {
          const res = await venueService.getSpaces();
          const spaces = res.spaces || res.data?.spaces || [];
          const selectedSpace = spaces.find(
            (s) => s._id === formData.venueSpaceId
          );
          setVenueDetails(selectedSpace);
        } catch (e) {
          console.error("Could not fetch venue details", e);
        }
      }
    };
    resolveData();
  }, [formData.clientId, formData.venueSpaceId]);

  const {
    basePrice,
    partnersCost,
    suppliesChargeToClient,
    suppliesMargin,
    discountAmount,
    taxAmount,
    total,
  } = calculations;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t("eventForm.step5.title")}
        </h3>
        <p className="text-gray-500">{t("eventForm.step5.description")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* --- EVENT DETAILS CARD --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
            <Calendar className="w-4 h-4 text-orange-500" />{" "}
            {t("eventForm.step5.summaryTitle")}
          </h4>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">
                {t("eventForm.step5.fields.title")}
              </dt>
              <dd className="font-bold text-gray-900 dark:text-white">
                {formData.title || t("common.untitled")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">
                {t("eventForm.step5.fields.date")}
              </dt>
              <dd className="font-medium">
                {formData.startDate}
                {formData.sameDayEvent
                  ? ""
                  : ` ${t("common.to")} ${formData.endDate}`}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">
                {t("eventForm.step5.fields.time")}
              </dt>
              <dd className="font-medium">
                {formData.startTime} - {formData.endTime}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">
                {t("eventForm.step5.fields.guests")}
              </dt>
              <dd className="font-medium">{formData.guestCount}</dd>
            </div>

            <div className="border-t border-dashed my-2 border-gray-100 dark:border-gray-700" />

            <div className="flex justify-between items-center">
              <dt className="text-gray-500 flex items-center gap-1">
                <User size={14} /> {t("eventForm.step5.fields.client")}
              </dt>
              <dd className="font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded text-xs truncate max-w-[150px]">
                {clientDetails?.name || t("common.loading")}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-gray-500 flex items-center gap-1">
                <Home size={14} /> {t("eventForm.step5.fields.venue")}
              </dt>
              <dd className="font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded text-xs truncate max-w-[150px]">
                {venueDetails?.name || t("common.loading")}
              </dd>
            </div>
          </dl>
        </div>

        {/* --- FINANCIAL SUMMARY CARD --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700">
            <Home className="w-4 h-4 text-green-500" />{" "}
            {t("eventForm.step5.financialsTitle")}
          </h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <dt>{t("eventForm.step5.financials.baseFee")}</dt>
              <dd>{(basePrice || 0).toFixed(3)}</dd>
            </div>
            {partnersCost > 0 && (
              <div className="flex justify-between text-blue-600 dark:text-blue-400">
                <dt>{t("eventForm.step5.financials.partners")}</dt>
                <dd>+{(partnersCost || 0).toFixed(3)}</dd>
              </div>
            )}
            {suppliesChargeToClient > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <dt>{t("eventForm.step5.financials.supplies")}</dt>
                <dd>+{(suppliesChargeToClient || 0).toFixed(3)}</dd>
              </div>
            )}

            <div className="border-t border-dashed my-2 border-gray-200 dark:border-gray-700" />

            {discountAmount > 0 && (
              <div className="flex justify-between text-red-500 text-xs">
                <dt>{t("eventForm.step5.financials.discount")}</dt>
                <dd>-{(discountAmount || 0).toFixed(3)}</dd>
              </div>
            )}

            <div className="flex justify-between text-gray-500 text-xs">
              <dt>{t("eventForm.step5.financials.tax")}</dt>
              <dd>+{(taxAmount || 0).toFixed(3)}</dd>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <dt className="font-bold text-lg text-gray-900 dark:text-white">
                {t("eventForm.step5.financials.total")}
              </dt>
              <dd className="font-bold text-xl text-orange-600 dark:text-orange-500">
                {(total || 0).toFixed(3)} TND
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* --- PARTNERS BREAKDOWN --- */}
      {formData.partners?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3 uppercase tracking-wider text-xs">
            {t("eventForm.step5.selectedPartners")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.partners.map((p, idx) => {
              const isHourly =
                (p.priceType || "fixed").toLowerCase() === "hourly";
              return (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
                      <Users size={14} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{p.partnerName}</p>
                      <p className="text-[10px] text-gray-500 capitalize">
                        {p.service} • {p.priceType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">
                      {(isHourly
                        ? (p.hours || 1) * p.rate
                        : Number(p.rate)
                      ).toFixed(3)}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {isHourly ? `${p.rate}/hr` : t("eventForm.step5.fixed")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SUPPLIES BREAKDOWN --- */}
      {formData.supplies?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3 uppercase tracking-wider text-xs">
            {t("eventForm.step5.allocatedInventory")}
          </h4>
          <div className="space-y-2">
            {formData.supplies.map((s, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{s.supplyName}</p>
                    <p className="text-xs text-gray-500">
                      {s.quantityRequested} x {s.supplyUnit}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {s.pricingType === "chargeable" ? (
                    <>
                      <span className="font-bold text-green-600 text-sm">
                        {(s.quantityRequested * s.chargePerUnit).toFixed(3)}
                      </span>
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded ml-2">
                        {t("eventForm.step5.extra")}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                      {t("eventForm.step5.included")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Internal Margin */}
          {suppliesMargin > 0 && (
            <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg text-xs flex justify-between items-center border border-emerald-100">
              <span className="text-emerald-800 font-medium">
                {t("eventForm.step5.estimatedProfit")}
              </span>
              <span className="font-bold text-emerald-600">
                +{suppliesMargin.toFixed(3)} TND
              </span>
            </div>
          )}
        </div>
      )}

      {/* --- FINAL NOTES --- */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t("eventForm.step5.finalNotes")}
        </label>
        <textarea
          {...register("notes")}
          rows={2}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm focus:border-orange-500 outline-none"
          placeholder={t("eventForm.step5.notesPlaceholder")}
        />
      </div>
    </div>
  );
};

export default Step5Review;
