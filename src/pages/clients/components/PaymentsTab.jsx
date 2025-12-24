import React from "react";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Plus,
  CreditCard,
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useTranslation } from "react-i18next";

// ✅ Generic Components & Hooks
import Button from "../../../components/common/Button";
import { StatusBadge } from "../../../components/common/Badge";
import { useToast } from "../../../context/ToastContext"; // Assuming context path
import PermissionGuard from "../../../components/auth/PermissionGuard";
const PaymentsTab = ({ events, eventsStats, onRecordPayment }) => {
  const { t } = useTranslation();
  const { showError } = useToast();

  const handleRecordPaymentClick = () => {
    if (events.length === 0) {
      showError(t("payments.labels.noEventsAvailable"));
    } else if (events.length === 1) {
      onRecordPayment(events[0]._id);
    } else {
      showError(t("payments.labels.selectSpecificEvent"));
    }
  };

  const getPaymentMethodLabel = (method) => {
    return t(`payments.methods.${method}`) || method;
  };

  // ✅ Helper: Strict DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return t("clients.table.defaultValues.noDate");
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div>
      {/* Top Action Bar */}
      {events.length > 0 && (
        <div className="flex items-center justify-end mb-6">
          <PermissionGuard permission="payments.create">
          <Button
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={handleRecordPaymentClick}
          >
            {t("payments.buttons.recordPayment")}
          </Button>
          </PermissionGuard>
        </div>
      )}

      {/* Payment Statistics Cards */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={DollarSign}
            value={formatCurrency(eventsStats.totalRevenue)}
            label={t("payments.statistics.totalRevenue")}
          />
          <StatCard
            icon={CheckCircle2}
            value={formatCurrency(eventsStats.totalPaid)}
            label={t("payments.statistics.totalPaid")}
          />
          <StatCard
            icon={Clock}
            value={formatCurrency(eventsStats.pendingAmount)}
            label={t("payments.statistics.outstanding")}
          />
          <StatCard
            icon={TrendingUp}
            value={eventsStats.totalEvents}
            label={t("payments.statistics.totalEvents")}
          />
        </div>
      )}

      {/* Payment Breakdown by Event */}
      {events.length > 0 && (
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
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
                  className="bg-white border border-gray-200 rounded-lg p-5 dark:bg-gray-800 dark:border-gray-700 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {event.title}
                    </h5>
                    {/* ✅ Generic Status Badge */}
                    <StatusBadge status={paymentStatus} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-4">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                        {t("payments.labels.totalAmount")}
                      </div>
                      <div className="font-bold text-gray-900 dark:text-white text-base">
                        {formatCurrency(totalAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                        {t("payments.labels.paidAmount")}
                      </div>
                      <div className="font-bold text-green-600 dark:text-green-400 text-base">
                        {formatCurrency(paidAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">
                        {t("payments.labels.balanceDue")}
                      </div>
                      <div
                        className={`font-bold text-base ${
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
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                       <PermissionGuard permission="payments.create">
                      <Button
                        size="sm"
                        variant="success" // Assuming success variant maps to green in theme
                        onClick={() => onRecordPayment(event._id)}
                        className="shadow-none"
                      >
                        {t("payments.buttons.recordPayment")}
                      </Button>
                      </PermissionGuard>
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
        <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          {t("payments.sections.recentPaymentHistory")}
        </h4>

        {/* Logic to flatten and sort payments */}
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
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.status === "completed"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}
                    >
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {payment.eventTitle}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {payment.method &&
                          `${getPaymentMethodLabel(payment.method)} • `}
                        {/* ✅ Formatted Date DD/MM/YYYY */}
                        {formatDate(payment.paidDate)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="mt-1">
                      <StatusBadge status={payment.status} size="xs" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t("payments.labels.noPaymentHistory")}
              </p>
              <Button
                variant="primary"
                icon={<Plus className="size-4" />}
                onClick={handleRecordPaymentClick}
              >
                {t("payments.buttons.recordFirstPayment")}
              </Button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

// --- Helper for Consistent Stats Cards ---
const StatCard = ({ icon: Icon, value, label }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-700 flex items-center gap-4">
    <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="overflow-hidden">
      <div
        className="text-xl font-bold text-gray-900 dark:text-white truncate"
        title={value}
      >
        {value}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
        {label}
      </div>
    </div>
  </div>
);

export default PaymentsTab;
