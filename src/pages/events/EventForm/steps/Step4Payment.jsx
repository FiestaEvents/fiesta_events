import React from "react";
import { CreditCard, Wallet, FileText, Calendar, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 

// ✅ Generic Components
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Textarea from "../../../../components/common/Textarea";
import DateInput from "../../../../components/common/DateInput";

const Step4Payment = () => {
  const { t } = useTranslation();
  const { formData, handleChange, errors, calculations } = useEventContext();

  // Calculation Helpers
  const total = calculations.totalPrice || 0;
  const paid = parseFloat(formData.payment.amount) || 0;
  const remaining = Math.max(0, total - paid);
  const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        
        {/* --- Header --- */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">
            {t('eventForm.step4.recordPayment')}
          </h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- Left Column: Financials --- */}
          <div className="space-y-5">
            
            {/* Payment Amount */}
            <Input
              label={t('eventForm.step4.paymentAmount')}
              name="payment.amount"
              type="number"
              value={formData.payment.amount}
              onChange={handleChange}
              error={errors["payment.amount"]}
              icon={DollarSign}
              placeholder="0.00"
              min="0"
            />

            {/* Payment Summary Card */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-200 dark:border-gray-600 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total Due</span>
                <span className="font-semibold text-gray-900 dark:text-white">{total.toFixed(2)} TND</span>
              </div>
              
              {/* Visual Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    remaining === 0 ? "bg-green-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Paid</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{paid.toFixed(2)} TND</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remaining</span>
                  <span className={`text-sm font-bold ${remaining > 0 ? "text-orange-600" : "text-green-600"}`}>
                    {remaining.toFixed(2)} TND
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <Select
              label={t('eventForm.step4.paymentMethod')}
              name="payment.paymentMethod"
              value={formData.payment.paymentMethod}
              onChange={handleChange}
              icon={Wallet}
              options={[
                { value: "cash", label: t('payment.methods.cash', 'Cash') },
                { value: "bank_transfer", label: t('payment.methods.transfer', 'Bank Transfer') },
                { value: "check", label: t('payment.methods.check', 'Check') }
              ]}
            />
          </div>

          {/* --- Right Column: Details --- */}
          <div className="space-y-5">
            
            {/* Date */}
            <DateInput 
              label={t('eventForm.step4.paymentDate')} 
              name="payment.paymentDate" 
              value={formData.payment.paymentDate} 
              onChange={handleChange}
              required // Usually good to require date if creating a payment record
            />

            {/* Notes */}
            <Textarea 
              label={t('eventForm.step4.paymentNotes')} 
              name="payment.notes" 
              value={formData.payment.notes} 
              onChange={handleChange} 
              rows={5}
              placeholder={t('eventForm.step4.notesPlaceholder', 'Add transaction ID, check number, or other details...')}
              className="resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Payment;