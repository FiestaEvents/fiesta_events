import React from "react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 
import Input from "../../../../components/common/Input";
import Textarea from "../../../../components/common/Textarea";
import DateInput from "../../../../components/common/DateInput";
import { DollarSign, CreditCard, Banknote, FileText } from "lucide-react";

const Step4Payment = () => {
  const { t } = useTranslation();
  const { formData, handleChange, errors, calculations } = useEventContext();

  // Helper to update nested payment fields
  const handlePaymentChange = (field, value) => {
    // Create a synthetic event or direct update object for the parent handleChange
    handleChange({
      target: {
        name: `payment.${field}`,
        value: value
      }
    });
  };

  const methods = [
    { value: "cash", label: t("payments.methods.cash", "Cash"), icon: Banknote },
    { value: "bank_transfer", label: t("payments.methods.bank_transfer", "Transfer"), icon: FileText },
    { value: "check", label: t("payments.methods.check", "Check"), icon: CreditCard },
    // { value: "card", label: t("payments.methods.card", "Card"), icon: CreditCard } // Optional
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Summary */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("eventForm.step4.recordPayment")}
        </h3>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-full border border-orange-100 dark:border-orange-800">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t("eventForm.step4.totalEstimated")}
          </span>
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {calculations.totalPrice.toFixed(2)} TND
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
        
        {/* Amount Input */}
        <div>
          <Input
            label={t("eventForm.payment.amountLabel", "Amount Paid (TND)")}
            name="payment.amount"
            type="number"
            value={formData.payment?.amount || ""}
            onChange={(e) => handlePaymentChange("amount", e.target.value)}
            error={errors["payment.amount"]}
            placeholder="0.00"
            className="text-lg font-medium"
            icon={DollarSign}
            min="0"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t("eventForm.payment.amountHelp", "Leave empty if no payment is received yet.")}
          </p>
        </div>

        {/* Payment Method Selection */}
        <div>
           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
             {t("eventForm.payment.methodLabel", "Payment Method")}
           </label>
           <div className="grid grid-cols-3 gap-3">
             {methods.map((m) => {
               const Icon = m.icon;
               const isSelected = formData.payment?.paymentMethod === m.value;
               return (
                 <button
                   key={m.value}
                   type="button"
                   onClick={() => handlePaymentChange("paymentMethod", m.value)}
                   className={`
                     flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl text-sm font-medium border transition-all duration-200
                     ${isSelected
                       ? "bg-orange-50 border-orange-500 text-orange-700 dark:bg-orange-900/20 dark:border-orange-500 dark:text-orange-400 shadow-sm"
                       : "bg-white border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                     }
                   `}
                 >
                   <Icon className={`w-5 h-5 ${isSelected ? "text-orange-600" : "text-gray-400"}`} />
                   {m.label}
                 </button>
               );
             })}
           </div>
        </div>

        {/* Date & Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DateInput 
            label={t("eventForm.payment.dateLabel", "Date Received")}
            name="payment.paymentDate"
            value={formData.payment?.paymentDate || ""}
            onChange={(e) => handlePaymentChange("paymentDate", e.target.value)}
            className="w-full"
          />
          
          <Textarea 
            label={t("eventForm.payment.notesLabel", "Notes / Reference")}
            name="payment.notes"
            value={formData.payment?.notes || ""}
            onChange={(e) => handlePaymentChange("notes", e.target.value)}
            rows={2}
            placeholder={t("eventForm.payment.notesPlaceholder", "Transaction ID, Check Number...")}
            className="w-full"
          />
        </div>

      </div>
    </div>
  );
};

export default Step4Payment;