import React from "react";
import { useEventContext } from "../EventFormContext"; 
import Textarea from "../../../../components/common/Textarea";

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
        {/* Summary Block */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
           <h4 className="font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">Event Details</h4>
           <dl className="space-y-2 text-sm">
             <div className="flex justify-between"><dt className="text-gray-500">Title:</dt> <dd className="font-medium">{formData.title}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Date:</dt> <dd className="font-medium">{formData.startDate}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Type:</dt> <dd className="font-medium capitalize">{formData.type}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Client:</dt> <dd className="font-medium text-blue-600">{client?.name}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Venue:</dt> <dd className="font-medium text-purple-600">{space?.name}</dd></div>
           </dl>
        </div>

        {/* Financial Block */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
           <h4 className="font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">Financials</h4>
           <dl className="space-y-2 text-sm">
             <div className="flex justify-between"><dt className="text-gray-500">Base Price:</dt> <dd>{calculations.basePrice.toFixed(2)}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Partners:</dt> <dd>{calculations.partnersTotal.toFixed(2)}</dd></div>
             <div className="flex justify-between"><dt className="text-gray-500">Tax:</dt> <dd>{calculations.taxAmount.toFixed(2)}</dd></div>
             <div className="mt-4 pt-4 border-t flex justify-between text-lg font-bold text-gray-900 dark:text-white">
               <dt>Total:</dt> <dd className="text-orange-600">{calculations.totalPrice.toFixed(2)} TND</dd>
             </div>
           </dl>
        </div>
      </div>

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