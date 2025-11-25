import React from "react";
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  FileText
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Button from "../../../components/common/Button";
import { StatusBadge } from "../../../components/common/Badge";

const EventPaymentsTab = ({ payments, event, onRecordPayment, formatDate }) => {
  const { t } = useTranslation();

  const getPaymentMethodLabel = (method) => {
    return t(`eventPaymentsTab.payment.method.${method}`) || method.replace('_', ' ');
  };

  // Calculate payment summary
  const totalAmount = event?.pricing?.totalAmount || 0;
  const totalPaid = payments?.reduce((sum, payment) => {
    if (payment.status === "completed") {
      return sum + (payment.amount || 0);
    }
    return sum;
  }, 0) || 0;
  
  const remainingAmount = Math.max(0, totalAmount - totalPaid);
  const paymentPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  return (
    <div>
      {/* Header & Action */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-orange-500" />
            {t("eventPaymentsTab.title", { count: payments?.length || 0 })}
          </h3>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={onRecordPayment}
        >
          {t("eventPaymentsTab.actions.recordPayment")}
        </Button>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard 
          icon={DollarSign}
          color="bg-blue-500"
          value={formatCurrency(totalAmount)}
          label={t("eventPaymentsTab.summary.totalAmount")}
        />
        <StatCard 
          icon={TrendingUp}
          color="bg-green-500"
          value={formatCurrency(totalPaid)}
          label={`${t("eventPaymentsTab.summary.paid")} (${paymentPercentage.toFixed(0)}%)`}
        />
        <StatCard 
          icon={TrendingDown}
          color="bg-orange-500"
          value={formatCurrency(remainingAmount)}
          label={t("eventPaymentsTab.summary.remaining")}
        />
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            {t("eventPaymentsTab.summary.progress")}
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {paymentPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 dark:bg-gray-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              paymentPercentage >= 100 ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Payment List */}
      {!payments || payments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t("eventPaymentsTab.emptyState.title")}
          </p>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={onRecordPayment}
            >
              {t("eventPaymentsTab.actions.recordFirstPayment")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="bg-white border border-gray-200 rounded-lg p-5 dark:bg-gray-800 dark:border-gray-700 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </span>
                        {/* ✅ Generic Status Badge */}
                        <StatusBadge status={payment.status} size="xs" />
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium capitalize">
                        {getPaymentMethodLabel(payment.method)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pl-[3.5rem]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(payment.paidDate || payment.createdAt)}
                    </div>
                  </div>

                  {payment.description && (
                    <div className="mt-3 pl-[3.5rem] flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <p>{payment.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Helper Component for Stats ---
const StatCard = ({ icon: Icon, color, value, label }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-700 flex items-center gap-4">
    <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="overflow-hidden">
      <div className="text-xl font-bold text-gray-900 dark:text-white truncate" title={value}>
        {value}
      </div>
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
        {label}
      </div>
    </div>
  </div>
);

export default EventPaymentsTab;