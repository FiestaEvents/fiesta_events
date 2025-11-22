import React, { useState } from "react";
import { DollarSign, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; // ✅ Context

const PriceSummary = () => {
  const { t } = useTranslation();
  const { calculations } = useEventContext(); // Pull calculated math
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 shadow-lg">
      <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => setShowDetails(!showDetails)}>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500 rounded-lg"><DollarSign className="w-5 h-5 text-white" /></div>
          <h3 className="text-lg font-semibold text-gray-800">Price Summary</h3>
        </div>
        {showDetails ? <ChevronUp className="text-orange-600" /> : <ChevronDown className="text-orange-600" />}
      </div>

      {showDetails && (
        <div className="space-y-2 mb-4 border-b border-orange-200 pb-2">
          <div className="flex justify-between text-sm"><span>Venue:</span> <strong>{calculations.basePrice.toFixed(2)}</strong></div>
          <div className="flex justify-between text-sm"><span>Partners:</span> <strong>{calculations.partnersTotal.toFixed(2)}</strong></div>
          {calculations.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-red-600"><span>Discount:</span> <strong>-{calculations.discountAmount.toFixed(2)}</strong></div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center bg-orange-500 text-white p-3 rounded-lg">
        <span className="font-bold">Total</span>
        <span className="font-bold text-xl">{calculations.totalPrice.toFixed(2)} TND</span>
      </div>
    </div>
  );
};

export default PriceSummary;