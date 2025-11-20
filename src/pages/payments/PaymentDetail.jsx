import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import { paymentService } from "../../api/index";
import { toast } from "react-hot-toast";
import formatCurrency from "../../utils/formatCurrency";
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from "lucide-react";

const PaymentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  // State
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundData, setRefundData] = useState({
    amount: "",
    reason: "",
  });

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getById(id);
      setPayment(response.payment || response);
    } catch (error) {
      console.error("Error fetching payment:", error);
      toast.error(error.message || t('payments.notifications.loadError'));
      navigate("/payments");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/payments/${id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await paymentService.delete(id);
      toast.success(t('payments.notifications.deleteSuccess'));
      navigate("/payments");
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error(error.message || t('payments.notifications.deleteError'));
    }
  };

  const handleRefund = async () => {
    try {
      if (!refundData.amount || parseFloat(refundData.amount) <= 0) {
        toast.error(t('payments.modals.refund.invalidAmount'));
        return;
      }

      if (parseFloat(refundData.amount) > payment.amount) {
        toast.error(t('payments.modals.refund.amountExceeded'));
        return;
      }

      await paymentService.refund(id, {
        refundAmount: parseFloat(refundData.amount),
        refundReason: refundData.reason,
      });

      toast.success(t('payments.notifications.refundSuccess'));
      setIsRefundModalOpen(false);
      setRefundData({ amount: "", reason: "" });
      fetchPayment(); // Refresh payment data
    } catch (error) {
      console.error("Error refunding payment:", error);
      toast.error(error.message || t('payments.notifications.refundError'));
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  const getStatusVariant = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "completed":
      case "paid":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      case "refunded":
        return "info";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "completed":
      case "paid":
        return CheckCircle;
      case "pending":
        return Clock;
      case "failed":
        return XCircle;
      case "refunded":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">{t('payments.notFound')}</p>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(payment.status);
  const TypeIcon = payment.type === "income" ? TrendingUp : TrendingDown;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate("/payments")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={t('common.back')}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-8 h-8" />
              {t('payments.detail.title')}
            </h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
              {payment.reference || `${t('payments.payment')} #${id.slice(-8)}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Overview */}
          <div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('payments.detail.overview')}
              </h3>

              <div className="space-y-6">
                {/* Type and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-lg ${
                        payment.type === "income"
                          ? "bg-green-50 dark:bg-green-900/20"
                          : "bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      <TypeIcon
                        className={`w-6 h-6 ${
                          payment.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('payments.form.type')}
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {t(`payments.types.${payment.type}`)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(payment.status)}>
                    <div className="flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      <span className="capitalize">
                        {t(`payments.statuses.${payment.status}`)}
                      </span>
                    </div>
                  </Badge>
                </div>

                {/* Amount */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('payments.totalAmount')}
                  </p>
                  <p
                    className={`text-4xl font-bold ${
                      payment.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {payment.type === "income" ? "+" : "-"}
                    {formatCurrency(payment.amount)}
                  </p>
                </div>

                {/* Description */}
                {payment.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      {t('payments.form.description')}
                    </p>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {payment.description}
                    </p>
                  </div>
                )}

                {/* Payment Details Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('payments.detail.paymentMethod')}
                    </p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white font-medium capitalize">
                        {t(`payments.methods.${payment.method}`) || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {t('payments.form.reference')}
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {payment.reference || "—"}
                    </p>
                  </div>

                  {payment.dueDate && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {t('payments.form.dueDate')}
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(payment.dueDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {payment.paidDate && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {t('payments.form.paidDate')}
                      </p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-gray-900 dark:text-white">
                          {formatDate(payment.paidDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Fees Breakdown */}
          {(payment.fees?.processingFee > 0 ||
            payment.fees?.platformFee > 0 ||
            payment.fees?.otherFees > 0) && (
            <div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('payments.feesCharges')}
                </h3>
                <div className="space-y-3">
                  {payment.fees.processingFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('payments.form.fees.processingFee')}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(payment.fees.processingFee)}
                      </span>
                    </div>
                  )}
                  {payment.fees.platformFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('payments.form.fees.platformFee')}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(payment.fees.platformFee)}
                      </span>
                    </div>
                  )}
                  {payment.fees.otherFees > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t('payments.form.fees.otherFees')}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(payment.fees.otherFees)}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white font-semibold">
                        {t('payments.form.netAmount')}
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(payment.netAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Refund Information */}
          {payment.refundAmount > 0 && (
            <div>
              <div className="p-6 bg-orange-50 dark:bg-orange-900/20">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {t('payments.refundInformation')}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">
                      {t('payments.detail.refundAmount')}
                    </span>
                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(payment.refundAmount)}
                    </span>
                  </div>
                  {payment.refundDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">
                        {t('payments.refundDate')}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(payment.refundDate)}
                      </span>
                    </div>
                  )}
                  {payment.refundReason && (
                    <div className="pt-3 border-t border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                        {t('payments.detail.refundReason')}
                      </p>
                      <p className="text-gray-900 dark:text-white">
                        {payment.refundReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Related Information */}
          {(payment.event || payment.client) && (
            <div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('payments.detail.relatedInformation')}
                </h3>
                <div className="space-y-4">
                  {payment.event && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {t('payments.form.event')}
                      </p>
                      <button
                        onClick={() =>
                          navigate(
                            `/events/${payment.event._id || payment.event}`
                          )
                        }
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {payment.event.title || t('payments.viewEvent')}
                      </button>
                    </div>
                  )}
                  {payment.client && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {t('payments.form.client')}
                      </p>
                      <button
                        onClick={() =>
                          navigate(
                            `/clients/${payment.client._id || payment.client}`
                          )
                        }
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {payment.client.name || t('payments.viewClient')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('payments.quickActions')}
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={Edit}
                  onClick={handleEdit}
                >
                  {t('payments.editPayment')}
                </Button>
                {payment.type === "income" &&
                  ["completed", "paid"].includes(
                    (payment.status || "").toLowerCase()
                  ) &&
                  !payment.refundAmount && (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      icon={RotateCcw}
                      onClick={() => {
                        setRefundData({
                          amount: payment.amount.toString(),
                          reason: "",
                        });
                        setIsRefundModalOpen(true);
                      }}
                    >
                      {t('payments.processRefund')}
                    </Button>
                  )}
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  icon={Trash2}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  {t('payments.deletePayment')}
                </Button>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('payments.detail.metadata')}
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('payments.detail.created')}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDateTime(payment.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('payments.detail.lastUpdated')}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDateTime(payment.updatedAt)}
                  </p>
                </div>
                {payment.processedBy && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('payments.detail.processedBy')}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {payment.processedBy.name || t('payments.system')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false);
          setRefundData({ amount: "", reason: "" });
        }}
        title={t('payments.modals.refund.title')}
        size="sm"
      >
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <Input
              label={t('payments.modals.refund.amount')}
              type="number"
              value={refundData.amount}
              onChange={(e) =>
                setRefundData((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0.00"
              min="0"
              max={payment?.amount}
              step="0.01"
              icon={DollarSign}
            />
            <Input
              label={t('payments.modals.refund.reason')}
              value={refundData.reason}
              onChange={(e) =>
                setRefundData((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder={t('payments.modals.refund.reasonPlaceholder')}
            />
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                {t('payments.refundWarning', { 
                  amount: formatCurrency(parseFloat(refundData.amount) || 0)
                })}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsRefundModalOpen(false);
                setRefundData({ amount: "", reason: "" });
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleRefund}>
              {t('payments.modals.refund.confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('payments.modals.delete.title')}
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('payments.deleteConfirmation')}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t('payments.modals.delete.confirm')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentDetail;