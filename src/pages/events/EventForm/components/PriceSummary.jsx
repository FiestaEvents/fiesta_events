//src/pages/events/EventForm/components/PriceSummary.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Package, Users, Home, TrendingUp } from "lucide-react";
import { useEventContext } from "../EventFormContext";

const PriceSummary = () => {
  const { t } = useTranslation();
  const { calculations, formData } = useEventContext();

  if (!calculations) return null;

  const {
    basePrice = 0,
    partnersTotal = 0,
    suppliesTotalCharge = 0,
    suppliesTotalCost = 0,
    suppliesMargin = 0,
    subtotalBeforeDiscount = 0,
    discountAmount = 0,
    subtotalAfterDiscount = 0,
    taxAmount = 0,
    totalPrice = 0,
  } = calculations;

  const hasSupplies = formData.supplies && formData.supplies.length > 0;
  const isMarginPositive = suppliesMargin >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-4 shadow-sm sticky top-6">
      <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
        <TrendingUp className="w-5 h-5 text-orange-600" />
        {t("eventForm.step3.priceSummary")}
      </h4>

      <div className="space-y-3 text-sm">
        {/* Base Price */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Home className="w-4 h-4 text-blue-500" />
            {t("eventForm.step3.venueBase")}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {basePrice.toFixed(3)} TND
          </span>
        </div>

        {/* Partners */}
        {partnersTotal > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              {t("eventForm.step3.partnersTotal")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {partnersTotal.toFixed(3)} TND
            </span>
          </div>
        )}

        {/* Supplies */}
        {hasSupplies && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Package className="w-4 h-4 text-green-500" />
              {t("eventForm.step3.suppliesTotal")}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {suppliesTotalCharge.toFixed(3)} TND
            </span>
          </div>
        )}

        {/* Supply Profitability Detail (Internal view only) */}
        {hasSupplies && (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg text-xs space-y-1.5 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>{t("eventForm.step3.supplyCostToVenue")}:</span>
              <span>{suppliesTotalCost.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>{t("eventForm.step3.clientCharge")}:</span>
              <span>{suppliesTotalCharge.toFixed(3)} TND</span>
            </div>
            {/* ✅ FIX: Dynamic Color and Sign for Margin */}
            <div
              className={`flex justify-between font-medium pt-1 border-t border-gray-200 dark:border-gray-700 ${isMarginPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              <span>{t("eventForm.step3.margin")}:</span>
              <span>
                {isMarginPositive ? "+" : ""}
                {suppliesMargin.toFixed(3)} TND
              </span>
            </div>
          </div>
        )}

        <hr className="border-gray-200 dark:border-gray-700 my-2" />

        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-700 dark:text-gray-300 font-medium">
            {t("eventForm.step3.subtotal")}
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {subtotalBeforeDiscount.toFixed(3)} TND
          </span>
        </div>

        {/* Discount */}
        {discountAmount > 0 && (
          <div className="flex justify-between text-red-600 dark:text-red-400 text-xs">
            <span>{t("eventForm.step3.discount")}</span>
            <span>-{discountAmount.toFixed(3)} TND</span>
          </div>
        )}

        {/* Tax */}
        {taxAmount > 0 && (
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{t("eventForm.step3.tax")}</span>
            <span>+{taxAmount.toFixed(3)} TND</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="pt-3 border-t-2 border-orange-100 dark:border-orange-900/30 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {t("eventForm.step3.total")}
            </span>
            <span className="text-xl font-bold text-orange-600 dark:text-orange-500">
              {totalPrice.toFixed(3)}{" "}
              <span className="text-sm font-medium">TND</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;
