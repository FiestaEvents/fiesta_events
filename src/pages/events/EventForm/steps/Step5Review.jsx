// src/components/events/EventForm/steps/Step5Review.jsx
import React from "react";
import { Calendar, DollarSign, FileCheck, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
            {t('eventForm.step5.eventSummary')}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">
                {t('eventForm.step5.title')}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formData.title || t('eventForm.step5.notAvailable')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">
                {t('eventForm.step5.type')}:
              </span>
              <Badge className="capitalize">
                {formData.type || t('eventForm.step5.notAvailable')}
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">
                {t('eventForm.step5.status')}:
              </span>
              <Badge
                variant={formData.status === "confirmed" ? "success" : "warning"}
                className="capitalize"
              >
                {formData.status}
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">
                {t('eventForm.step5.date')}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formData.startDate || t('eventForm.step5.notAvailable')}
                {formData.startDate !== formData.endDate && ` ${t('eventForm.step5.to')} ${formData.endDate}`}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">
                {t('eventForm.step5.time')}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formData.startTime || t('eventForm.step5.notAvailable')} - {formData.endTime || t('eventForm.step5.notAvailable')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">
                {t('eventForm.step5.venueSpace')}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedSpace?.name || t('eventForm.step5.notAvailable')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400">
                {t('eventForm.step5.client')}:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedClient?.name || t('eventForm.step5.notAvailable')}
              </span>
            </div>
            {formData.guestCount && (
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('eventForm.step5.guests')}:
                </span>
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
            {t('eventForm.step5.financialSummary')}
          </h4>
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">
                  {t('eventForm.step5.venuePrice')}:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {venuePrice?.toFixed(2) || "0.00"} {t('eventForm.currency')}
                </span>
              </div>
              {formData.partners.length > 0 && (
                <div className="border-t pt-2 dark:border-gray-600">
                  <p className="text-gray-600 dark:text-gray-400 mb-1 font-medium">
                    {t('eventForm.step5.partners')}:
                  </p>
                  {formData.partners.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between py-1 text-xs text-gray-600 dark:text-gray-400 pl-4"
                    >
                      <span>• {p.partnerName}:</span>
                      <span>
                        {((p.hourlyRate || 0) * calculateEventHours()).toFixed(2)} {t('eventForm.currency')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {formData.pricing.discount && parseFloat(formData.pricing.discount) > 0 && (
                <div className="flex justify-between py-2 border-t dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('eventForm.step5.discount')}:
                  </span>
                  <span className="font-medium text-red-600">
                    -
                    {formData.pricing.discountType === "percentage"
                      ? `${formData.pricing.discount}%`
                      : `${parseFloat(formData.pricing.discount).toFixed(2)} ${t('eventForm.currency')}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-orange-200 dark:border-orange-700 font-bold text-lg">
                <span className="text-gray-900 dark:text-white">
                  {t('eventForm.step5.total')}:
                </span>
                <span className="text-orange-600">
                  {totalPrice?.toFixed(2) || "0.00"} {t('eventForm.currency')}
                </span>
              </div>
              {formData.payment?.amount && parseFloat(formData.payment.amount) > 0 && (
                <>
                  <div className="flex justify-between py-2 border-t dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('eventForm.step5.initialPayment')}:
                    </span>
                    <span className="font-medium text-green-600">
                      {parseFloat(formData.payment.amount).toFixed(2)} {t('eventForm.currency')}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-gray-300 dark:border-gray-600 font-bold">
                    <span className="text-gray-900 dark:text-white">
                      {t('eventForm.step5.remaining')}:
                    </span>
                    <span className="text-orange-600">
                      {(totalPrice - parseFloat(formData.payment.amount || 0)).toFixed(2)} {t('eventForm.currency')}
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
                        {t('eventForm.step5.autoGenerateInvoice')}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('eventForm.step5.autoGenerateInvoiceDesc')}
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
          {t('eventForm.step5.additionalNotes')}
        </h4>
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder={t('eventForm.step5.additionalNotesPlaceholder')}
          maxLength={1000}
          showCount
        />
      </div>
    </div>
  );
};

export default Step5Review;