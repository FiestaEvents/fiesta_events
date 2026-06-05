import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  CreditCard,
  FileText,
  User,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Briefcase
} from "lucide-react";

//  Generic Components
import Button from "../../components/common/Button";
import Badge, { StatusBadge } from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";

//  Sub-components (for editing within the page)
import PaymentForm from "./PaymentForm";

//  Services & Utils
import { paymentService } from "../../api/index";
import { useToast } from "../../hooks/useToast";
import formatCurrency from "../../utils/formatCurrency";

const PaymentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { showSuccess, apiError } = useToast();

  // State
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundData, setRefundData] = useState({ amount: "", reason: "" });

  //  Helper: Strict DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  const getTypeVariant = (type) => type === "income" ? "success" : "danger";

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getById(id);
      setPayment(response.payment || response);
    } catch (error) {
      apiError(error, t('payments.notifications.loadError'));
      navigate("/payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  // --- Handlers ---

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    setIsEditModalOpen(false);
    await fetchPayment();
    showSuccess(t('payments.notifications.updateSuccess'));
  };

  const handleDelete = async () => {
    try {
      await paymentService.delete(id);
      showSuccess(t('payments.notifications.deleteSuccess'));
      navigate("/payments");
    } catch (error) {
      apiError(error, t('payments.notifications.deleteError'));
    }
  };

  const handleRefund = async () => {
    try {
      if (!refundData.amount || parseFloat(refundData.amount) <= 0) {
        apiError(null, t('payments.modals.refund.invalidAmount'));
        return;
      }
      if (parseFloat(refundData.amount) > payment.amount) {
        apiError(null, t('payments.modals.refund.amountExceeded'));
        return;
      }

      await paymentService.refund(id, {
        refundAmount: parseFloat(refundData.amount),
        refundReason: refundData.reason,
      });
      
      showSuccess(t('payments.notifications.refundSuccess'));
      setIsRefundModalOpen(false);
      setRefundData({ amount: "", reason: "" });
      fetchPayment();
    } catch (error) {
      apiError(error, t('payments.notifications.refundError'));
    }
  };

  if (loading) return <div className="flex h-screen justify-center items-center"><OrbitLoader /></div>;
  if (!payment) return <div className="text-center py-12">{t('payments.notFound')}</div>;

  const TypeIcon = payment.type === "income" ? TrendingUp : TrendingDown;

  return (
    <div className="p-6 bg-white rounded-lg dark:bg-gray-900 min-h-screen space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/payments")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Back')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {t('payments.detail.title')}
          </h1>
          <p className="text-sm text-gray-500">{payment.reference ? `${t('payments.table.reference')}: ${payment.reference}` : `#${id.slice(-8)}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- LEFT COLUMN (Main Info) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Amount & Status Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${payment.type === "income" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                  <TypeIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{t('payments.form.type')}</p>
                  <Badge variant={getTypeVariant(payment.type)} className="capitalize mt-1">
                    {t(`payments.types.${payment.type}`)}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">{t('payments.form.status')}</p>
                <StatusBadge status={payment.status} size="lg" />
              </div>
            </div>

            <div className="text-center py-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('payments.totalAmount')}</p>
              <div className={`text-5xl font-bold tracking-tight ${payment.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                {payment.type === "income" ? "+" : "-"}{formatCurrency(payment.amount)}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              {t('payments.detail.overview')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <DetailItem 
                icon={CreditCard} 
                label={t('payments.detail.paymentMethod')} 
                value={t(`payments.methods.${payment.method}`) || payment.method} 
                color="blue"
              />
              <DetailItem 
                icon={FileText} 
                label={t('payments.form.reference')} 
                value={payment.reference || "N/A"} 
                color="purple"
              />
              <DetailItem 
                icon={Calendar} 
                label={t('payments.form.paidDate')} 
                value={formatDate(payment.paidDate)} 
                color="green"
              />
              <DetailItem 
                icon={Calendar} 
                label={t('payments.form.dueDate')} 
                value={formatDate(payment.dueDate)} 
                color="orange"
              />
            </div>

            {payment.description && (
              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('payments.form.description')}</h4>
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {payment.description}
                </div>
              </div>
            )}
          </div>

          {/* Refund Information Block */}
          {payment.refundAmount > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-4 flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                {t('payments.refundInformation')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-orange-600/70 uppercase font-bold mb-1">{t('payments.detail.refundAmount')}</p>
                  <p className="text-xl font-bold text-orange-700 dark:text-orange-400">{formatCurrency(payment.refundAmount)}</p>
                </div>
                {payment.refundDate && (
                  <div>
                    <p className="text-xs text-orange-600/70 uppercase font-bold mb-1">{t('payments.refundDate')}</p>
                    <p className="text-orange-900 dark:text-orange-200 font-medium">{formatDate(payment.refundDate)}</p>
                  </div>
                )}
                {payment.refundReason && (
                  <div className="md:col-span-2">
                    <p className="text-xs text-orange-600/70 uppercase font-bold mb-1">{t('payments.detail.refundReason')}</p>
                    <p className="text-orange-900 dark:text-orange-200 bg-white/50 dark:bg-black/20 p-3 rounded-lg text-sm">
                      {payment.refundReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN (Sidebar) --- */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">{t('payments.quickActions')}</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                icon={Edit} 
                onClick={handleEdit} //  Fixed missing handler
                className="w-full justify-start hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20"
              >
                {t('payments.editPayment')}
              </Button>
              
              {payment.type === "income" && ["completed", "paid"].includes(payment.status?.toLowerCase()) && !payment.refundAmount && (
                <Button 
                  variant="outline" 
                  icon={RotateCcw} 
                  onClick={() => { setRefundData({ amount: payment.amount, reason: "" }); setIsRefundModalOpen(true); }}
                  className="w-full justify-start text-yellow-600 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 dark:border-yellow-800 dark:text-yellow-400"
                >
                  {t('payments.processRefund')}
                </Button>
              )}

              <Button 
                variant="outline" 
                icon={Trash2} 
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:border-red-900 dark:text-red-400"
              >
                {t('payments.deletePayment')}
              </Button>
            </div>
          </div>

          {/* Related Info */}
          {(payment.event || payment.client) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('payments.detail.relatedInformation')}
              </h3>
              <div className="space-y-4">
                {payment.event && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-semibold">{t('payments.form.event')}</p>
                    <button 
                      onClick={() => navigate(`/events/${payment.event._id || payment.event}/detail`)}
                      className="text-sm font-bold text-gray-900 dark:text-white hover:underline flex items-center gap-1"
                    >
                      {payment.event.title || t('payments.viewEvent')}
                      <ArrowLeft className="w-3 h-3 rotate-180" />
                    </button>
                  </div>
                )}
                {payment.client && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-1 font-semibold">{t('payments.form.client')}</p>
                    <button 
                      onClick={() => navigate(`/clients/${payment.client._id || payment.client}`)}
                      className="text-sm font-bold text-gray-900 dark:text-white hover:underline flex items-center gap-1"
                    >
                      {payment.client.name || t('payments.viewClient')}
                      <ArrowLeft className="w-3 h-3 rotate-180" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{t('payments.detail.metadata')}</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{t('payments.detail.created')}</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">{formatDateTime(payment.createdAt)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-500">{t('payments.detail.lastUpdated')}</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">{formatDateTime(payment.updatedAt)}</span>
              </div>
              {payment.processedBy && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">{t('payments.detail.processedBy')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{payment.processedBy.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals --- */}

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={t('payments.modals.paymentForm.editTitle')} size="lg">
        <PaymentForm payment={payment} onSuccess={handleEditSuccess} onCancel={() => setIsEditModalOpen(false)} />
      </Modal>

      {/* Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => setIsRefundModalOpen(false)}
        title={t('payments.modals.refund.title')}
        size="sm"
      >
        <div className="space-y-4 p-4">
          <Input
            label={t('payments.modals.refund.amount')}
            type="number"
            value={refundData.amount}
            onChange={(e) => setRefundData(p => ({ ...p, amount: e.target.value }))}
            icon={DollarSign}
            max={payment.amount}
          />
          <Input
            label={t('payments.modals.refund.reason')}
            value={refundData.reason}
            onChange={(e) => setRefundData(p => ({ ...p, reason: e.target.value }))}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsRefundModalOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={handleRefund}>{t('payments.modals.refund.confirm')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('payments.modals.delete.title')}
        size="sm"
      >
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-6">{t('payments.deleteConfirmation')}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="danger" onClick={handleDelete}>{t('payments.modals.delete.confirm')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// --- Helper Component ---
const DetailItem = ({ icon: Icon, label, value, color = "gray" }) => {
  const colors = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20",
    orange: "text-orange-600 bg-orange-50 dark:bg-orange-900/20",
    gray: "text-gray-600 bg-gray-100 dark:bg-gray-800"
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

export default PaymentDetail;