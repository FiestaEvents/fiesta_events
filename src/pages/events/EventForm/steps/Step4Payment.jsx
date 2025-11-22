// src/components/events/EventForm/steps/Step4Payment.jsx
import React from "react";
import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Textarea from "../../../../components/common/Textarea";
import DateInput from "../../../../components/common/DateInput"; // ✅ Import

const Step4Payment = () => {
  const { t } = useTranslation();
  const { formData, handleChange, errors, calculations } = useEventContext();

  const remaining = calculations.totalPrice - (parseFloat(formData.payment.amount) || 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-indigo-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">{t('eventForm.step4.recordPayment')}</h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              label={t('eventForm.step4.paymentAmount')}
              name="payment.amount"
              type="number"
              value={formData.payment.amount}
              onChange={handleChange}
              error={errors["payment.amount"]}
            />
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
              <div className="flex justify-between"><span>Total:</span> <strong>{calculations.totalPrice.toFixed(2)} TND</strong></div>
              <div className="flex justify-between text-orange-600 border-t border-blue-200 mt-2 pt-2">
                <span>Remaining:</span> <strong>{remaining.toFixed(2)} TND</strong>
              </div>
            </div>

            <Select
              label={t('eventForm.step4.paymentMethod')}
              name="payment.paymentMethod"
              value={formData.payment.paymentMethod}
              onChange={handleChange}
              options={[{ value: "cash", label: "Cash" }, { value: "bank_transfer", label: "Transfer" }, { value: "check", label: "Check" }]}
            />
          </div>

          <div className="space-y-4">
            {/* ✅ VISUAL FIX: Use DateInput */}
            <DateInput 
              label={t('eventForm.step4.paymentDate')} 
              name="payment.paymentDate" 
              value={formData.payment.paymentDate} 
              onChange={handleChange} 
            />
            <Textarea label={t('eventForm.step4.paymentNotes')} name="payment.notes" value={formData.payment.notes} onChange={handleChange} rows={4} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Payment;