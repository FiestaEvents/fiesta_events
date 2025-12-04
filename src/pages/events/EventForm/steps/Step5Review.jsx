import React from "react";
import { Package, Users, Home } from "lucide-react";
import { useEventContext } from "../EventFormContext"; 
import Textarea from "../../../../components/common/Textarea";
import Badge from "../../../../components/common/Badge";

const Step5Review = () => {
  const { formData, handleChange, clients, venueSpaces, calculations } = useEventContext();
  
  const client = clients.find(c => c._id === formData.clientId);
  const space = venueSpaces.find(s => s._id === formData.venueSpaceId);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Final Review</h3>
        <p className="text-gray-500">Please review all details before creating the event.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Event Details */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
           <h4 className="font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">Event Details</h4>
           <dl className="space-y-2 text-sm">
             <div className="flex justify-between"><dt className="text-gray-500">Title:</dt> <dd className="font-medium">{formData.title}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Date:</dt> <dd className="font-medium">{formData.startDate}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Time:</dt> <dd className="font-medium">{formData.startTime} - {formData.endTime}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Type:</dt> <dd className="font-medium capitalize">{formData.type}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Guests:</dt> <dd className="font-medium">{formData.guestCount || "N/A"}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Client:</dt> <dd className="font-medium text-blue-600">{client?.name}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Venue:</dt> <dd className="font-medium text-purple-600">{space?.name}</dd></div>
           </dl>
        </div>

        {/* Financial Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
           <h4 className="font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">Financials</h4>
           <dl className="space-y-2 text-sm">
             <div className="flex items-center justify-between">
               <dt className="text-gray-500 flex items-center gap-2">
                 <Home className="w-4 h-4" />
                 Base Price:
               </dt>
               <dd>{calculations.basePrice.toFixed(3)} TND</dd>
             </div>
             
             {calculations.partnersTotal > 0 && (
               <div className="flex items-center justify-between">
                 <dt className="text-gray-500 flex items-center gap-2">
                   <Users className="w-4 h-4" />
                   Partners:
                 </dt>
                 <dd>{calculations.partnersTotal.toFixed(3)} TND</dd>
               </div>
             )}
             
             {calculations.suppliesTotalCharge > 0 && (
               <div className="flex items-center justify-between">
                 <dt className="text-gray-500 flex items-center gap-2">
                   <Package className="w-4 h-4" />
                   Supplies:
                 </dt>
                 <dd>{calculations.suppliesTotalCharge.toFixed(3)} TND</dd>
               </div>
             )}
             
             {calculations.discountAmount > 0 && (
               <div className="flex justify-between text-red-600">
                 <dt>Discount:</dt>
                 <dd>-{calculations.discountAmount.toFixed(3)} TND</dd>
               </div>
             )}
             
             {calculations.taxAmount > 0 && (
               <div className="flex justify-between">
                 <dt className="text-gray-500">Tax ({calculations.taxRate}%):</dt>
                 <dd>{calculations.taxAmount.toFixed(3)} TND</dd>
               </div>
             )}
             
             <div className="mt-4 pt-4 border-t flex justify-between text-lg font-bold text-gray-900 dark:text-white">
               <dt>Total:</dt>
               <dd className="text-orange-600">{calculations.totalPrice.toFixed(3)} TND</dd>
             </div>
           </dl>
        </div>
      </div>

      {/* ⭐ PARTNERS BREAKDOWN */}
      {formData.partners?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Service Partners ({formData.partners.length})
          </h4>
          <div className="space-y-2">
            {calculations.partnersDetails.map((partner, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{partner.partnerName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{partner.service}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{partner.calculatedCost.toFixed(3)} TND</p>
                  {partner.priceType === "hourly" && (
                    <p className="text-xs text-gray-500">{partner.rate} TND/hr × {partner.displayHours}h</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⭐ SUPPLIES BREAKDOWN */}
      {formData.supplies?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Event Supplies ({formData.supplies.length})
          </h4>
          <div className="space-y-2">
            {formData.supplies.map((supply, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-sm">{supply.supplyName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {supply.quantityRequested} {supply.supplyUnit} • {supply.supplyCategoryName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {supply.pricingType === "included" ? (
                    <Badge variant="success" size="sm">Included</Badge>
                  ) : supply.pricingType === "chargeable" ? (
                    <div>
                      <p className="font-bold text-green-600">
                        {(supply.quantityRequested * supply.chargePerUnit).toFixed(3)} TND
                      </p>
                      <p className="text-xs text-gray-500">
                        {supply.chargePerUnit.toFixed(3)} TND/{supply.supplyUnit}
                      </p>
                    </div>
                  ) : (
                    <Badge variant="secondary" size="sm">Optional</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Supply Cost Summary */}
          {calculations.suppliesTotalCost > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Venue Cost</p>
                  <p className="font-bold text-red-600">{calculations.suppliesTotalCost.toFixed(3)} TND</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Client Charge</p>
                  <p className="font-bold text-green-600">{calculations.suppliesTotalCharge.toFixed(3)} TND</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Margin</p>
                  <p className="font-bold text-blue-600">+{calculations.suppliesMargin.toFixed(3)} TND</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <Textarea 
          label="Final Notes" 
          name="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          rows={4}
          placeholder="Any special instructions..."
        />
      </div>
      
      {/* Invoice Generation Option */}
      <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <input 
          type="checkbox" 
          id="invoice"
          checked={formData.createInvoice}
          onChange={(e) => handleChange({ target: { name: "createInvoice", value: e.target.checked } })}
          className="w-5 h-5 text-blue-600 rounded"
        />
        <label htmlFor="invoice" className="text-sm font-medium text-blue-800 dark:text-blue-300">
          Automatically generate a draft invoice for this event
        </label>
      </div>
    </div>
  );
};

export default Step5Review;