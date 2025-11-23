import React from "react";
import { Calendar, DollarSign, FileText, User, MapPin, Receipt, FileInput } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 

// ✅ Generic Components
import Textarea from "../../../../components/common/Textarea";
import Toggle from "../../../../components/common/Toggle";

const Step5Review = () => {
  const { t } = useTranslation();
  const { formData, handleChange, clients, venueSpaces, calculations, meta } = useEventContext();
  
  const selectedClient = clients.find(c => c._id === formData.clientId);
  const selectedSpace = venueSpaces.find(s => s._id === formData.venueSpaceId);

  // Helper for consistent row styling
  const ReviewRow = ({ label, value, highlight = false }) => (
    <div className={`flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0 ${highlight ? 'bg-gray-50 dark:bg-gray-700/30 -mx-4 px-4 rounded-lg mt-2' : ''}`}>
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-gray-900 dark:text-white text-base' : 'text-gray-900 dark:text-white'}`}>
        {value || "-"}
      </span>
    </div>
  );

  // Simple date formatter for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "-";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- Event Summary Card --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('eventForm.step5.eventSummary')}
            </h4>
          </div>

          <div className="space-y-1">
            <ReviewRow label={t('eventForm.step1.eventTitle')} value={formData.title} />
            <ReviewRow label={t('eventForm.step1.eventDate')} value={formatDisplayDate(formData.startDate)} />
            
            <div className="flex items-center gap-2 py-3 border-b border-gray-100 dark:border-gray-700">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{t('eventForm.step2.client')}</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{selectedClient?.name}</span>
            </div>

            <div className="flex items-center gap-2 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{t('eventForm.step3.venue')}</span>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{selectedSpace?.name}</span>
            </div>
          </div>
        </div>

        {/* --- Financial Summary Card --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('eventForm.step5.financialSummary')}
            </h4>
          </div>

          <div className="space-y-1 flex-1">
            <ReviewRow label="Venue Cost" value={`${calculations.basePrice?.toFixed(2)} TND`} />
            <ReviewRow label="Partners & Services" value={`${calculations.partnersTotal?.toFixed(2)} TND`} />
            
            {/* Total Highlight */}
            <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30 flex justify-between items-center">
              <span className="font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider text-xs">
                Total Estimated
              </span>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {calculations.totalPrice?.toFixed(2)} <span className="text-sm font-medium">TND</span>
              </span>
            </div>
          </div>

          {/* --- Invoice Generation Toggle --- */}
          {!meta.isEditMode && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600 transition-colors hover:border-blue-300 dark:hover:border-blue-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm text-blue-500">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {t('eventForm.step5.autoInvoice', 'Auto-Generate Invoice')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('eventForm.step5.invoiceHint', 'Create a draft invoice for this client immediately')}
                    </span>
                  </div>
                </div>
                <Toggle 
                  enabled={formData.createInvoice} 
                  onChange={(val) => handleChange({ target: { name: "createInvoice", value: val } })} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* --- Notes Section --- */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-400" />
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {t('eventForm.step5.finalNotes', 'Final Notes / Instructions')}
          </h4>
        </div>
        <Textarea 
          name="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          rows={3} 
          placeholder={t('eventForm.step5.notesPlaceholder', 'Add any special instructions for this event...')}
          className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 resize-none focus:bg-white dark:focus:bg-gray-900"
        />
      </div>
    </div>
  );
};

export default Step5Review;