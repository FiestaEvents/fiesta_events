// src/components/events/EventForm/steps/Step5Review.jsx
import React from "react";
import { Calendar, DollarSign, FileCheck, FileText } from "lucide-react";
import Badge from "../../../../components/common/Badge";
import Textarea from "../../../../components/common/Textarea";
import Toggle from "../../../../components/common/Toggle";

const Step5Review = ({
  formData,
  handleChange,
  clients,
  venueSpaces,
  partners,
  totalPrice,
  venuePrice,
  partnersTotal,
  isEditMode,
}) => {
  const selectedClient = clients.find((c) => c._id === formData.clientId);
  const selectedSpace = venueSpaces.find((s) => s._id === formData.venueSpaceId);

  const calculateEventHours = () => {
    if (!formData.startDate || !formData.endDate) return 1;
    const startTime = formData.startTime || "00:00";
    const endTime = formData.endTime || "00:00";
    const start = new Date(`${formData.startDate}T${startTime}:00`);
    const end = new Date(`${formData.endDate}T${endTime}:00`);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    return Math.max(1, hours);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300 dark:text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Summary */}
        <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Event Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Title:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formData.title || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Type:</span>
              <Badge className="capitalize">{formData.type || "N/A"}</Badge>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Status:</span>
              <Badge
                variant={formData.status === "confirmed" ? "success" : "warning"}
                className="capitalize"
              >
                {formData.status}
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Date:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formData.startDate || "N/A"}
                {formData.startDate !== formData.endDate && ` to ${formData.endDate}`}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Time:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formData.startTime || "N/A"} - {formData.endTime || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Venue Space:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedSpace?.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">Client:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedClient?.name || "N/A"}
              </span>
            </div>
            {formData.guestCount && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Guests:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formData.guestCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Financial Summary
          </h4>
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Venue Price:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {venuePrice?.toFixed(2) || "0.00"} TND
                </span>
              </div>
              {formData.partners.length > 0 && (
                <div className="border-t pt-2 dark:border-gray-600">
                  <p className="text-gray-600 dark:text-gray-400 mb-1 font-medium">Partners:</p>
                  {formData.partners.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between py-1 text-xs text-gray-600 dark:text-gray-400 pl-4"
                    >
                      <span>• {p.partnerName}:</span>
                      <span>
                        {((p.hourlyRate || 0) * calculateEventHours()).toFixed(2)} TND
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {formData.pricing.discount && parseFloat(formData.pricing.discount) > 0 && (
                <div className="flex justify-between py-2 border-t dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                  <span className="font-medium text-red-600">
                    -
                    {formData.pricing.discountType === "percentage"
                      ? `${formData.pricing.discount}%`
                      : `${parseFloat(formData.pricing.discount).toFixed(2)} TND`}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-orange-200 dark:border-orange-700 font-bold text-lg">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-orange-600">{totalPrice?.toFixed(2) || "0.00"} TND</span>
              </div>
              {formData.payment?.amount && parseFloat(formData.payment.amount) > 0 && (
                <>
                  <div className="flex justify-between py-2 border-t dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">Initial Payment:</span>
                    <span className="font-medium text-green-600">
                      {parseFloat(formData.payment.amount).toFixed(2)} TND
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-gray-300 dark:border-gray-600 font-bold">
                    <span className="text-gray-900 dark:text-white">Remaining:</span>
                    <span className="text-orange-600">
                      {(totalPrice - parseFloat(formData.payment.amount || 0)).toFixed(2)} TND
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Auto-Generate Invoice Toggle */}
            {!isEditMode && (
              <div className="border-t pt-4 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-6 h-6 text-indigo-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Auto-Generate Invoice
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Create a draft invoice for this event automatically
                      </p>
                    </div>
                  </div>
                  <Toggle
                    enabled={formData.createInvoice || false}
                    onChange={(val) =>
                      handleChange({ target: { name: "createInvoice", value: val } })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" />
          Additional Notes
        </h4>
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Add any additional notes about this event..."
          maxLength={1000}
          showCount
        />
      </div>
    </div>
  );
};

export default Step5Review;