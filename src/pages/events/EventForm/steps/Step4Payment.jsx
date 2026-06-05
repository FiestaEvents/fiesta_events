import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Wallet, Banknote, CreditCard, Laptop } from "lucide-react";
import { FormInput } from "../../../../components/forms/FormInput";
import { FormSelect } from "../../../../components/forms/FormSelect";
import { useEventCalculations } from "../../../../hooks/useEventCalculations";

const Step4Payment = () => {
  const { t } = useTranslation();
  const { control, setValue, register, formState: { errors } } = useFormContext();
  const calculations = useEventCalculations(control);
  const paymentMethod = useWatch({ control, name: "payment.method" });
  
  const methodOptions = [
    { value: "cash", label: t("eventForm.step4.methods.cash"), icon: Banknote },
    { value: "check", label: t("eventForm.step4.methods.check"), icon: CreditCard },
    { value: "bank_transfer", label: t("eventForm.step4.methods.transfer"), icon: Laptop },
    { value: "online", label: t("eventForm.step4.methods.online"), icon: Wallet },
  ];

  const handleMethodSelect = (val, e) => {
      e.preventDefault(); // Stop bubbling
      setValue("payment.method", val, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      {/* TOTAL CARD */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl text-center text-white shadow-xl">
         <span className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-2 block">
            {t("eventForm.step4.grandTotal")}
         </span>
         <span className="text-4xl font-black">
            {calculations.total.toFixed(3)} <span className="text-xl font-normal opacity-70">TND</span>
         </span>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
            {t("eventForm.step4.recordPayment")}
        </h3>
        
        {/* ROW 1: Amount & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
               <FormInput 
                 name="payment.amount" 
                 label={t("eventForm.step4.amountReceived")} 
                 type="number" 
                 min="0.01" step="0.001" 
                 placeholder="0.000"
                 className="text-lg font-medium" 
               />
            </div>
             {/* Payment Status */}
             <div>
                <FormSelect
                    name="payment.status"
                    label={t("eventForm.step4.paymentStatus")}
                    options={[
                        {value: 'pending', label: t("eventForm.step4.status.pending")},
                        {value: 'completed', label: t("eventForm.step4.status.completed")},
                        {value: 'failed', label: t("eventForm.step4.status.failed")}
                    ]}
                />
             </div>
        </div>

        {/* ROW 2: Method Selector */}
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t("eventForm.step4.method")}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {methodOptions.map(m => {
                    const Icon = m.icon;
                    return (
                        <button
                          key={m.value}
                          type="button" 
                          onClick={(e) => handleMethodSelect(m.value, e)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm transition-all ${paymentMethod === m.value ? "border-orange-500 bg-orange-50 text-gray-700 font-bold shadow-sm ring-1 ring-orange-500 dark:bg-orange-500 dark:text-white":"border-gray-200 text-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:bg-gray-400 dark:text-gray-700"}`}
                        >
                            <Icon size={18} className="mb-1" />
                            {m.label}
                        </button>
                    )
                })}
            </div>
            {/* Validated Hidden Input */}
            <input type="hidden" {...register("payment.method")} />
            {errors.payment?.method && <p className="text-red-500 text-xs mt-1">{errors.payment.method.message}</p>}
        </div>

        {/* ROW 3: Validator Required Fields (Dates & References) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <FormInput 
             name="payment.paymentDate" 
             type="date" 
             label={t("eventForm.step4.paymentDate")} 
           />
           <FormInput 
             name="payment.dueDate" 
             type="date" 
             label={t("eventForm.step4.dueDate")} 
           />
           <FormInput 
             name="payment.reference" 
             label={t("eventForm.step4.referenceId")} 
             placeholder={t("eventForm.step4.referencePlaceholder")} 
           />
        </div>
        
        <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("eventForm.step4.descriptionLabel")}
            </label>
            <textarea 
               {...register("payment.description")} 
               rows={2} 
               className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 text-sm focus:border-orange-500 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500" 
               placeholder={t("eventForm.step4.descriptionPlaceholder")}
            />
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
             <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" {...register("createInvoice")} className="w-5 h-5 accent-blue-600 rounded" />
                 <div>
                    <span className="block font-bold text-gray-900 dark:text-white text-sm">
                        {t("eventForm.step4.createInvoice")}
                    </span>
                    <span className="block text-xs text-gray-500">
                        {t("eventForm.step4.createInvoiceDesc")}
                    </span>
                 </div>
             </label>
        </div>
      </div>
    </div>
  );
};
export default Step4Payment;