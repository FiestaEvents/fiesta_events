// src/components/events/EventForm/steps/Step4Payment.jsx
import React from "react";
import { CreditCard, AlertCircle } from "lucide-react";
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Textarea from "../../../../components//common/Textarea";

const paymentMethodOptions = [
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "check", label: "Check" },
  { value: "mobile_payment", label: "Mobile Payment" },
];

const paymentStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const Step4Payment = ({ formData, handleChange, errors, totalPrice }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      {/* Info Banner */}
      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
        <AlertCircle className="w-5 h-5" />
        <p>
          This step is optional. You can record payments later from the payments section.
        </p>
      </div>

      {/* Payment Form */}
      <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-indigo-500" />
          <h4 className="font-semibold text-gray-900 dark:text-white">
            Record Initial Payment (Optional)
          </h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <Input
              label="Payment Amount"
              name="payment.amount"
              type="number"
              step="0.01"
              value={formData.payment?.amount || ""}
              onChange={handleChange}
              error={errors["payment.amount"]}
              leftElement={
                <span className="text-sm font-semibold text-gray-500 pointer-events-none">
                  TND
                </span>
              }
              placeholder="0.00"
            />

            {totalPrice && formData.payment?.amount && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                  <span className="font-semibold">{totalPrice.toFixed(2)} TND</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Payment:</span>
                  <span className="font-semibold text-green-600">
                    {parseFloat(formData.payment.amount).toFixed(2)} TND
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-blue-300 dark:border-blue-700">
                  <span className="font-semibold text-gray-900 dark:text-white">Remaining:</span>
                  <span className="font-bold text-orange-600">
                    {(totalPrice - parseFloat(formData.payment.amount)).toFixed(2)} TND
                  </span>
                </div>
              </div>
            )}

            <Select
              label="Payment Method"
              name="payment.paymentMethod"
              value={formData.payment?.paymentMethod || "cash"}
              onChange={handleChange}
              options={paymentMethodOptions}
            />

            <Input
              label="Payment Date"
              name="payment.paymentDate"
              type="date"
              value={formData.payment?.paymentDate || new Date().toISOString().split("T")[0]}
              onChange={handleChange}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <Select
              label="Payment Status"
              name="payment.status"
              value={formData.payment?.status || "pending"}
              onChange={handleChange}
              options={paymentStatusOptions}
            />

            <Textarea
              label="Payment Notes"
              name="payment.notes"
              value={formData.payment?.notes || ""}
              onChange={handleChange}
              rows={6}
              placeholder="Any notes about this payment..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step4Payment;