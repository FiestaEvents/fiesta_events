// src/components/events/EventForm/components/PriceSummary.jsx
import React, { useState } from "react";
import { DollarSign, Info, ChevronDown, ChevronUp } from "lucide-react";

const PriceSummary = ({
  venuePrice,
  partners = [], // Array of partner objects with pricing details
  partnersTotal, // Fallback total if partners array not provided
  discount,
  discountType,
  totalPrice,
  visible,
}) => {
  const [showPartnerDetails, setShowPartnerDetails] = useState(false);

  if (!visible) return null;

  // Calculate partners total from array if provided
  const calculatedPartnersTotal = partners.length > 0
    ? partners.reduce((sum, p) => sum + (p.cost || 0), 0)
    : (partnersTotal || 0);

  // Calculate discount amount
  const discountAmount = discountType === "percentage"
    ? (venuePrice + calculatedPartnersTotal) * (discount / 100)
    : discount;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            Price Summary
          </h3>
        </div>
      </div>

      <div className="space-y-3">
        {/* Venue Price */}
        <div className="flex items-center justify-between py-2 border-b border-orange-200">
          <span className="text-gray-700 font-medium">Venue:</span>
          <span className="text-gray-900 font-semibold">
            {venuePrice.toFixed(2)} TND
          </span>
        </div>

        {/* Partners Section */}
        {calculatedPartnersTotal > 0 && (
          <div className="border-b border-orange-200 pb-2">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Partners:</span>
                {partners.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPartnerDetails(!showPartnerDetails)}
                    className="text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    {showPartnerDetails ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
              <span className="text-gray-900 font-semibold">
                {calculatedPartnersTotal.toFixed(2)} TND
              </span>
            </div>

            {/* Partner Details Breakdown */}
            {showPartnerDetails && partners.length > 0 && (
              <div className="ml-4 space-y-2 mt-2 bg-white rounded-lg p-3">
                {partners.map((partner, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm py-1.5"
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-700">
                        {partner.partnerName || `Partner ${index + 1}`}
                      </span>
                      <span className="text-xs text-gray-500">
                        {partner.service || partner.category}
                        {partner.priceType && (
                          <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">
                            {partner.priceType === "fixed" ? "Fixed" : "Hourly"}
                          </span>
                        )}
                      </span>
                      {partner.priceType === "hourly" && partner.hours && (
                        <span className="text-xs text-gray-500">
                          {partner.hours} hours × {partner.rate?.toFixed(2)} TND
                        </span>
                      )}
                    </div>
                    <span className="text-gray-900 font-medium">
                      {(partner.cost || 0).toFixed(2)} TND
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="flex items-center justify-between py-2 border-b border-orange-200">
            <span className="text-gray-700 font-medium">Discount:</span>
            <span className="text-red-600 font-semibold">
              -
              {discountType === "percentage"
                ? `${discount}% (${discountAmount.toFixed(2)} TND)`
                : `${discount.toFixed(2)} TND`}
            </span>
          </div>
        )}

        {/* Total */}
        <div className="flex items-center justify-between py-3 bg-orange-500 rounded-lg px-4 mt-2">
          <span className="text-white font-bold text-lg">Total:</span>
          <span className="text-white font-bold text-xl">
            {totalPrice.toFixed(2)} TND
          </span>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-4 flex items-start gap-2 text-xs text-gray-600 bg-white rounded-lg p-3">
        <Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
        <span>
          Real-time calculation. Partner costs are calculated based on their
          pricing type (fixed rate or hourly rate).
        </span>
      </div>
    </div>
  );
};

export default PriceSummary;