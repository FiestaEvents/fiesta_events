import React from "react";
import { Calendar, DollarSign, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; // ✅ Context
import Textarea from "../../../../components/common/Textarea";
import Toggle from "../../../../components/common/Toggle";

const Step5Review = () => {
  const { t } = useTranslation();
  const { formData, handleChange, clients, venueSpaces, calculations, meta } = useEventContext();
  
  const selectedClient = clients.find(c => c._id === formData.clientId);
  const selectedSpace = venueSpaces.find(s => s._id === formData.venueSpaceId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary */}
        <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5 text-sm space-y-2">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> {t('eventForm.step5.eventSummary')}
          </h4>
          <div className="flex justify-between border-b py-2"><span>Title:</span> <strong>{formData.title}</strong></div>
          <div className="flex justify-between border-b py-2"><span>Date:</span> <strong>{formData.startDate}</strong></div>
          <div className="flex justify-between border-b py-2"><span>Client:</span> <strong>{selectedClient?.name}</strong></div>
          <div className="flex justify-between border-b py-2"><span>Venue:</span> <strong>{selectedSpace?.name}</strong></div>
        </div>

        {/* Financials */}
        <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5 text-sm space-y-2">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" /> {t('eventForm.step5.financialSummary')}
          </h4>
          <div className="flex justify-between border-b py-2"><span>Venue Cost:</span> <strong>{calculations.basePrice}</strong></div>
          <div className="flex justify-between border-b py-2"><span>Partners:</span> <strong>{calculations.partnersTotal}</strong></div>
          <div className="flex justify-between border-b py-2 text-lg font-bold text-orange-600"><span>Total:</span> <strong>{calculations.totalPrice.toFixed(2)}</strong></div>
          
{!meta.isEditMode && (
  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
    <div className="flex flex-col">
        <span className="font-semibold text-gray-900 dark:text-white">Auto-Generate Invoice</span>
        <span className="text-xs text-gray-500">Create a draft invoice for this client</span>
    </div>
    <Toggle 
        enabled={formData.createInvoice} 
        onChange={(val) => handleChange({ target: { name: "createInvoice", value: val } })} 
    />
  </div>
)}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
        <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="w-5 h-5 text-purple-500" /> Notes</h4>
        <Textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />
      </div>
    </div>
  );
};

export default Step5Review;