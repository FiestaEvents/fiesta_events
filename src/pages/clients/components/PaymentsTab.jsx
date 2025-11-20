import React from "react";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Plus,
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";

const PaymentsTab = ({ events, eventsStats, onRecordPayment }) => {
  const { t } = useTranslation();

  const handleRecordPaymentClick = () => {
    if (events.length === 0) {
      toast.error(t("payments.labels.noEventsAvailable"));
    } else if (events.length === 1) {
      onRecordPayment(events[0]._id);
    } else {
      toast.error(t("payments.labels.selectSpecificEvent"));
    }
  };

  const getPaymentMethodLabel = (method) => {
    return t(`payments.methods.${method}`) || method;
  };

  const getPaymentStatusLabel = (status) => {
    return t(`payments.status.${status}`) || status;
  };

  return (
    <div>
      {events.length > 0 && (
        <div className="flex items-center justify-end mb-6">
          <button
            onClick={handleRecordPaymentClick}
            className="px-4 py-2 flex items-center gap-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition dark:bg-orange-700 dark:hover:bg-green-600"
          >
            <Plus className="h-4 w-4" />
            {t("payments.buttons.recordPayment")}
          </button>
        </div>
      )}

      {/* Payment Statistics */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-700">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(eventsStats.totalRevenue)}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("payments.statistics.totalRevenue")}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-700">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(eventsStats.totalPaid)}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("payments.statistics.totalPaid")}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-700">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(eventsStats.pendingAmount)}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("payments.statistics.outstanding")}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-700">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {eventsStats.totalEvents}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  {t("payments.statistics.totalEvents")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Breakdown by Event */}
      {events.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-white">
            {t("payments.sections.paymentBreakdown")}
          </h4>
          <div className="space-y-4">
            {events.map((event) => {
              const totalAmount =
                event.pricing?.totalAmount || event.pricing?.basePrice || 0;
              const paidAmount = event.paymentSummary?.paidAmount || 0;
              const balance = totalAmount - paidAmount;
              const paymentStatus = event.paymentSummary?.status || "pending";

              return (
                <div
                  key={event._id}
                  className="border border-gray-200 rounded-lg p-4 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h5>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        paymentStatus === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : paymentStatus === "partial"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                      }`}
                    >
                      {getPaymentStatusLabel(paymentStatus)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {t("payments.labels.totalAmount")}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(totalAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {t("payments.labels.paidAmount")}
                      </div>
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(paidAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {t("payments.labels.balanceDue")}
                      </div>
                      <div
                        className={`font-semibold ${
                          balance > 0
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {formatCurrency(balance)}
                      </div>
                    </div>
                  </div>

                  {balance > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => onRecordPayment(event._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                      >
                        {t("payments.buttons.recordPayment")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-white">
          {t("payments.sections.recentPaymentHistory")}
        </h4>

        {/* Extract recent payments from all events */}
        {(() => {
          const allPayments = events
            .flatMap((event) =>
              (event.payments || []).map((payment) => ({
                ...payment,
                eventTitle: event.title,
                eventId: event._id,
              }))
            )
            .sort(
              (a, b) =>
                new Date(b.paidDate || b.createdAt) -
                new Date(a.paidDate || a.createdAt)
            )
            .slice(0, 10);

          return allPayments.length > 0 ? (
            <div className="space-y-3">
              {allPayments.map((payment, index) => (
                <div
                  key={payment._id || index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {payment.eventTitle}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {payment.method &&
                          `${getPaymentMethodLabel(payment.method)} • `}
                        {payment.paidDate
                          ? new Date(payment.paidDate).toLocaleDateString()
                          : t("clients.table.defaultValues.noDate")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div
                      className={`text-xs ${
                        payment.status === "completed"
                          ? "text-green-600 dark:text-green-400"
                          : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {getPaymentStatusLabel(payment.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 flex justify-center items-center flex-col">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {t("payments.labels.noPaymentHistory")}
              </p>
              <button
                onClick={handleRecordPaymentClick}
                className="mt-4 px-4 py-2 flex items-center gap-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                <Plus className="h-4 w-4" />
                {t("payments.buttons.recordFirstPayment")}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default PaymentsTab;