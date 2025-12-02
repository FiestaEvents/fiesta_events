import React from "react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 
import Input from "../../../../components/common/Input";
import Textarea from "../../../../components/common/Textarea";
import DateInput from "../../../../components/common/DateInput";

const Step4Payment = () => {
  const { t } = useTranslation();
  const { formData, handleChange, errors, calculations } = useEventContext();

  const methods = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "check", label: "Check" }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Record Initial Payment</h3>
        <p className="text-gray-500 mt-1">Total Estimated Amount: <span className="font-bold text-orange-600">{calculations.totalPrice.toFixed(2)} TND</span></p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="space-y-6">
          <Input
            label="Amount Paid"
            name="payment.amount"
            type="number"
            value={formData.payment.amount}
            onChange={handleChange}
            error={errors["payment.amount"]}
            placeholder="0.00"
            className="text-lg font-medium"
          />

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
             <div className="flex gap-2">
               {methods.map(m => (
                 <button
                   key={m.value}
                   type="button"
                   onClick={() => handleChange({ target: { name: "payment.paymentMethod", value: m.value } })}
                   className={`
                     flex-1 py-2 rounded-lg text-sm font-medium border transition-all
                     ${formData.payment.paymentMethod === m.value
                       ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                       : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                     }
                   `}
                 >
                   {m.label}
                 </button>
               ))}
             </div>
          </div>

          <DateInput 
            label="Date Received"
            name="payment.paymentDate"
            value={formData.payment.paymentDate}
            onChange={handleChange}
          />
          
          <Textarea 
            label="Notes"
            name="payment.notes"
            value={formData.payment.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Transaction ID, Check Number..."
          />
        </div>
      </div>
    </div>
  );
};

export default Step4Payment;