import React, { useState } from "react";
import {
  X,
  Trash2,
  Edit,
  RotateCcw,
  ArrowRight,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  User,
  Building,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";
import { paymentService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import formatCurrency from "../../utils/formatCurrency";

const PaymentDetailModal = ({
  isOpen,
  onClose,
  payment,
  onEdit,
  refreshData,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError, promise } = useToast();

  if (!isOpen || !payment) return null;

  const getStatusBadgeColor = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "completed":
      case "paid":
        return "green";
      case "pending":
        return "yellow";
      case "failed":
        return "red";
      case "refunded":
        return "blue";
      default:
        return "gray";
    }
  };

  const getTypeBadgeColor = (type) => {
    return type === "income" ? "green" : "red";
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const weekday = d.toLocaleString("en-GB", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "long" });
    const year = d.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  };

  const formatMethod = (method) => {
    if (!method) return t('payments.unknown');
    return t(`payments.methods.${method}`) || method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getClientName = () => {
    if (payment.client?.name) return payment.client.name;
    if (payment.event?.clientId?.name) return payment.event.clientId.name;
    return "N/A";
  };

  const getPartnerName = () => {
    if (payment.partner?.name) return payment.partner.name;
    if (payment.partnerId?.name) return payment.partnerId.name;
    return "N/A";
  };

  // Handle delete
  const handleDelete = async () => {
    if (!payment._id) return;

    try {
      setIsProcessing(true);
      await promise(paymentService.delete(payment._id), {
        loading: t('payments.notifications.deleting'),
        success: t('payments.notifications.deleteSuccess'),
        error: t('payments.notifications.deleteError'),
      });
      onClose();
      refreshData();
    } catch (error) {
      console.error("Failed to delete payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle refund
  const handleRefund = async () => {
    if (!payment._id) return;

    try {
      setIsProcessing(true);
      await promise(
        paymentService.refund(payment._id, {
          refundAmount: payment.amount,
          refundReason: t('payments.refund.defaultReason'),
        }),
        {
          loading: t('payments.notifications.refunding'),
          success: t('payments.notifications.refundSuccess'),
          error: t('payments.notifications.refundError'),
        }
      );
      onClose();
      refreshData();
    } catch (error) {
      console.error("Failed to refund payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/payments/${payment._id}`);
  };

  const canRefund =
    payment.type === "income" &&
    ["completed", "paid"].includes((payment.status || "").toLowerCase()) &&
    !payment.refundAmount;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="border-0">
            <div className="px-6 pt-5 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3
                    className="text-2xl font-bold leading-6 text-gray-900 dark:text-white"
                    id="modal-title"
                  >
                    {payment.description || t('payments.detail.title')}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge color={getTypeBadgeColor(payment.type)}>
                      {payment.type ? t(`payments.types.${payment.type}`).toUpperCase() : t('payments.unknown').toUpperCase()}
                    </Badge>
                    <Badge color={getStatusBadgeColor(payment.status)}>
                      {t(`payments.statuses.${payment.status}`) || t('payments.unknown')}
                    </Badge>
                    {payment.refundAmount !== 0 && (
                      <Badge color="blue">
                        {t('payments.detail.refundAmount')}: {formatCurrency(payment.refundAmount)}
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors ml-4 flex-shrink-0"
                  title={t('common.close')}
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {/* Amount */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-8 h-8 text-orange-500" />
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {t('payments.form.amount')}
                        </div>
                        <div
                          className={`text-2xl font-bold ${
                            payment.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {payment.type === "income" ? "+" : "-"}
                          {formatCurrency(payment.amount)}
                        </div>
                      </div>
                    </div>
                    {payment.netAmount &&
                      payment.netAmount !== payment.amount && (
                        <div className="text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {t('payments.form.netAmount')}
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(payment.netAmount)}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Payment Details */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {t('payments.detail.paymentInformation')}
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {/* Method */}
                    <div className="flex items-center gap-3 text-sm">
                      <CreditCard className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {t('payments.detail.paymentMethod')}
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatMethod(payment.method)}
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {t('payments.detail.paymentDate')}
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDateLong(
                            payment.paidDate || payment.createdAt
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Reference */}
                    {payment.reference && (
                      <div className="flex items-center gap-3 text-sm">
                        <FileText className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {t('payments.form.reference')}
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {payment.reference}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Related Entities */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {t('payments.detail.relatedTo')}
                  </h4>
                  <div className="space-y-3">
                    {/* Client */}
                    {(payment.client || payment.event?.clientId) && (
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {t('payments.form.client')}
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {getClientName()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Partner */}
                    {(payment.partner || payment.partnerId) && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {t('payments.partner')}
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {getPartnerName()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Event */}
                    {payment.event && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {t('payments.form.event')}
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {payment.event.title || t('payments.event')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fees and Refunds */}
                {(payment.fees || payment.refundAmount) && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      {t('payments.detail.feesRefunds')}
                    </h4>
                    <div className="space-y-2">
                      {payment.fees && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {t('payments.form.fees.processingFee')}
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {formatCurrency(payment.fees.processingFee || 0)}
                          </span>
                        </div>
                      )}
                      {payment.fees && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">
                            {t('payments.form.fees.platformFee')}
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {formatCurrency(payment.fees.platformFee || 0)}
                          </span>
                        </div>
                      )}
                      {payment.refundAmount !== 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-500 dark:text-red-400">
                            {t('payments.detail.refundAmount')}
                          </span>
                          <span className="text-red-600 dark:text-red-400 font-medium">
                            -{formatCurrency(payment.refundAmount)}
                          </span>
                        </div>
                      )}
                      {payment.refundReason && (
                        <div className="text-sm">
                          <div className="text-gray-500 dark:text-gray-400">
                            {t('payments.detail.refundReason')}
                          </div>
                          <div className="text-gray-900 dark:text-white mt-1">
                            {payment.refundReason}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {payment.description && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      {t('payments.form.description')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      {payment.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between gap-3 rounded-b-xl">
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  icon={Trash2}
                  onClick={handleDelete}
                  disabled={isProcessing}
                  size="sm"
                >
                  {isProcessing ? t('payments.deleting') : t('payments.deletePayment')}
                </Button>

                {canRefund && (
                  <Button
                    variant="outline"
                    icon={RotateCcw}
                    onClick={handleRefund}
                    disabled={isProcessing}
                    size="sm"
                  >
                    {isProcessing ? t('payments.refunding') : t('payments.refundPayment')}
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  icon={Edit}
                  onClick={() => onEdit(payment)}
                  size="sm"
                >
                  {t('payments.editPayment')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleViewFullDetails}
                  className="gap-2 flex items-center justify-center bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600"
                  title={t('payments.detail.moreDetails')}
                >
                  {t('payments.detail.moreDetails')}
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailModal;