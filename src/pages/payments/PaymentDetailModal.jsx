import React, { useState } from "react";
import { Trash2, Edit, RotateCcw, ArrowRight, Calendar, CreditCard, FileText, User, Building, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Badge, { StatusBadge } from "../../components/common/Badge";
import { useToast } from "../../context/ToastContext";
import { paymentService } from "../../api/index";
import formatCurrency from "../../utils/formatCurrency";

const PaymentDetailModal = ({ isOpen, onClose, payment, onEdit, refreshData }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { promise } = useToast();

  if (!payment) return null;

  const formatDateLong = (date) => new Date(date).toLocaleDateString("en-GB", { day: '2-digit', month: 'long', year: 'numeric' });

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      await promise(paymentService.delete(payment._id), {
        loading: t('payments.notifications.deleting'),
        success: t('payments.notifications.deleteSuccess'),
        error: t('payments.notifications.deleteError'),
      });
      setShowDeleteConfirm(false);
      onClose();
      if (refreshData) refreshData();
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  const handleRefund = async () => {
    try {
      setIsProcessing(true);
      await promise(paymentService.refund(payment._id, { refundAmount: payment.amount, refundReason: "Requested" }), {
        loading: t('payments.notifications.refunding'),
        success: t('payments.notifications.refundSuccess'),
        error: t('payments.notifications.refundError'),
      });
      onClose();
      if (refreshData) refreshData();
    } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-sm">
        <Icon size={16} /> <span>{label}</span>
      </div>
      <span className="font-medium text-gray-900 dark:text-white text-sm">{value || "-"}</span>
    </div>
  );

  const canRefund = payment.type === "income" && ["completed", "paid"].includes(payment.status?.toLowerCase()) && !payment.refundAmount;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={t('payments.detail.title', 'Payment Details')} size="md">
        <div className="space-y-6">
          {/* Header Badges */}
          <div className="flex gap-2 -mt-2 justify-center">
            <StatusBadge status={payment.status} />
            <Badge variant={payment.type === "income" ? "success" : "danger"} className="capitalize">
              {payment.type}
            </Badge>
          </div>

          {/* Amount Hero */}
          <div className={`text-center p-6 rounded-2xl ${payment.type === "income" ? "bg-green-50 dark:bg-green-900/20 text-green-700" : "bg-red-50 dark:bg-red-900/20 text-red-700"}`}>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{t('payments.totalAmount', 'Total Amount')}</p>
            <h2 className="text-4xl font-extrabold">{payment.type === "income" ? "+" : "-"}{formatCurrency(payment.amount)}</h2>
          </div>

          {/* Details List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 px-4">
            <InfoRow icon={CreditCard} label={t('payments.detail.paymentMethod', 'Method')} value={payment.method} />
            <InfoRow icon={Calendar} label={t('payments.detail.paymentDate', 'Date')} value={formatDateLong(payment.paidDate || payment.createdAt)} />
            <InfoRow icon={FileText} label={t('payments.form.reference', 'Reference')} value={payment.reference} />
            {payment.client && <InfoRow icon={User} label={t('payments.form.client', 'Client')} value={payment.client.name} />}
            {payment.partner && <InfoRow icon={Building} label={t('payments.partner', 'Partner')} value={payment.partner.name} />}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="danger" //  Fixed: Danger Variant
                icon={Trash2} 
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isProcessing}
                size="sm"
                className="w-full sm:w-auto"
              >
                {t("common.delete", "Delete")}
              </Button>

              {canRefund && (
                <Button 
                  variant="outline" 
                  icon={RotateCcw} 
                  onClick={handleRefund} 
                  loading={isProcessing} 
                  size="sm"
                  className="w-full sm:w-auto text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  {t('payments.refunding', 'Refund')}
                </Button>
              )}
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                icon={Edit} 
                onClick={() => onEdit(payment)}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                {t("common.edit", "Edit")}
              </Button>
              
              <Button 
                variant="primary" 
                icon={ArrowRight} 
                onClick={() => { onClose(); navigate(`/payments/${payment._id}`); }}
                size="sm"
                className="flex-1 sm:flex-none gap-2"
              >
                {t("common.viewDetails", "View Details")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title={t("common.confirmDelete", "Confirm Delete")} size="sm">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {t("payments.notifications.deleteConfirm", "Are you sure you want to delete this payment record?")}
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>{t("common.cancel", "Cancel")}</Button>
            <Button variant="danger" loading={isProcessing} onClick={handleDelete}>{t("common.delete", "Delete")}</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PaymentDetailModal;