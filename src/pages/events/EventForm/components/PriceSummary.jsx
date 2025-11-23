import React, { useState } from "react";
import { DollarSign, ChevronDown, ChevronUp, Receipt, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext";

const PriceSummary = () => {
  const { t } = useTranslation();
  const { calculations } = useEventContext();
  const [showDetails, setShowDetails] = useState(true); // Default to open for better visibility

  // Safety helper
  const formatPrice = (amount) => (amount || 0).toFixed(2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300">
      
      {/* --- Header (Clickable) --- */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" 
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
            <Receipt className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            {t('eventForm.priceSummary.title', 'Price Summary')}
          </h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          {showDetails ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* --- Details Section (Collapsible) --- */}
      {showDetails && (
        <div className="p-4 space-y-3 border-t border-gray-100 dark:border-gray-700 text-sm animate-in slide-in-from-top-1">
          
          {/* Venue */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">{t('eventForm.step3.basePriceLabel', 'Venue Base')}</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatPrice(calculations.basePrice)}</span>
          </div>

          {/* Partners */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500 dark:text-gray-400">{t('eventForm.step3.servicePartners', 'Services')}</span>
            <span className="font-medium text-gray-900 dark:text-white">{formatPrice(calculations.partnersTotal)}</span>
          </div>

          {/* Discount (Conditional) */}
          {calculations.discountAmount > 0 && (
            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
              <span>{t('eventForm.step3.discount', 'Discount')}</span>
              <span className="font-medium">- {formatPrice(calculations.discountAmount)}</span>
            </div>
          )}

          {/* Tax (Conditional) */}
          {calculations.taxAmount > 0 && (
            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
              <span>{t('eventForm.step3.tax', 'Tax')} ({calculations.taxRate}%)</span>
              <span>+ {formatPrice(calculations.taxAmount)}</span>
            </div>
          )}
        </div>
      )}

      {/* --- Total Footer --- */}
      <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border-t border-orange-100 dark:border-orange-800/30">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider">
              {t('eventForm.priceSummary.total', 'Total Due')}
            </span>
            <span className="text-xs text-orange-600/70 dark:text-orange-400/70">
              (TTC)
            </span>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-500 leading-none">
            {formatPrice(calculations.totalPrice)} <span className="text-sm">TND</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceSummary;