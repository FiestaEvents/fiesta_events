// components/events/components/EventPaymentsTab.jsx
import React from "react";
import { 
  CreditCard, 
  Plus, 
  DollarSign, 
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from "lucide-react";
import { formatCurrency } from "../../../utils/formatCurrency";
import Badge from "../../../components/common/Badge";

const EventPaymentsTab = ({ payments, event, onRecordPayment, formatDate }) => {
  const getPaymentStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100",
      failed: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100",
      refunded: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-100",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-100";
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: "Cash",
      credit_card: "Credit Card",
      bank_transfer: "Bank Transfer",
      check: "Check",
      mobile_payment: "Mobile Payment",
    };
    return labels[method] || method;
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment History ({payments?.length || 0})
          </h3>
        </div>
        <button
          onClick={onRecordPayment}
          className="px-4 py-2 flex items-center gap-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
        >
          <Plus className="h-4 w-4" />
          Record Payment
        </button>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalAmount)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Amount</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalPaid)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Paid ({paymentPercentage.toFixed(0)}%)
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(remainingAmount)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Payment Progress
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {paymentPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className="bg-orange-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(paymentPercentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Payment List */}
      {!payments || payments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No payments recorded yet</p>
          <button
            onClick={onRecordPayment}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Record First Payment
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="border border-gray-200 rounded-lg p-4 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </span>
                        <Badge className={`text-xs ${getPaymentStatusColor(payment.status)}`}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {getPaymentMethodLabel(payment.method)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(payment.paidDate || payment.createdAt)}
                    </div>
                  </div>

                  {payment.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {payment.description}
                    </p>
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

export default EventPaymentsTab;