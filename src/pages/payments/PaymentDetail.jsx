import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { paymentService } from '../../api/index';
import { toast } from 'react-hot-toast';
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
  Download,
} from 'lucide-react';

const PaymentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // State
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundData, setRefundData] = useState({
    amount: '',
    reason: '',
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
      console.error('Error fetching payment:', error);
      toast.error(error.message || 'Failed to load payment');
      navigate('/payments');
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
      toast.success('Payment deleted successfully');
      navigate('/payments');
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error(error.message || 'Failed to delete payment');
    }
  };

  const handleRefund = async () => {
    try {
      if (!refundData.amount || parseFloat(refundData.amount) <= 0) {
        toast.error('Please enter a valid refund amount');
        return;
      }

      if (parseFloat(refundData.amount) > payment.amount) {
        toast.error('Refund amount cannot exceed payment amount');
        return;
      }

      await paymentService.refund(id, {
        refundAmount: parseFloat(refundData.amount),
        refundReason: refundData.reason,
      });

      toast.success('Payment refunded successfully');
      setIsRefundModalOpen(false);
      setRefundData({ amount: '', reason: '' });
      fetchPayment(); // Refresh payment data
    } catch (error) {
      console.error('Error refunding payment:', error);
      toast.error(error.message || 'Failed to refund payment');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusVariant = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'refunded':
        return 'info';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch (statusLower) {
      case 'completed':
      case 'paid':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'failed':
        return XCircle;
      case 'refunded':
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
        <p className="text-gray-600 dark:text-gray-400">Payment not found</p>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(payment.status);
  const TypeIcon = payment.type === 'income' ? TrendingUp : TrendingDown;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/payments')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-8 h-8" />
              Payment Details
            </h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
              {payment.reference || `Payment #${id.slice(-8)}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {payment.type === 'income' && 
           ['completed', 'paid'].includes((payment.status || '').toLowerCase()) &&
           !payment.refundAmount && (
            <Button
              variant="outline"
              icon={RotateCcw}
              onClick={() => {
                setRefundData({ amount: payment.amount.toString(), reason: '' });
                setIsRefundModalOpen(true);
              }}
            >
              Refund
            </Button>
          )}
          <Button variant="outline" icon={Edit} onClick={handleEdit}>
            Edit
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Overview */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Payment Overview
              </h3>

              <div className="space-y-6">
                {/* Type and Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      payment.type === 'income' 
                        ? 'bg-green-50 dark:bg-green-900/20' 
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      <TypeIcon className={`w-6 h-6 ${
                        payment.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Payment Type</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {payment.type}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(payment.status)}>
                    <div className="flex items-center gap-1">
                      <StatusIcon className="w-3 h-3" />
                      <span className="capitalize">{payment.status}</span>
                    </div>
                  </Badge>
                </div>

                {/* Amount */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
                  <p className={`text-4xl font-bold ${
                    payment.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {payment.type === 'income' ? '+' : '-'}{formatCurrency(payment.amount)}
                  </p>
                </div>

                {/* Description */}
                {payment.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Description
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
                      Payment Method
                    </p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900 dark:text-white font-medium capitalize">
                        {(payment.method || 'N/A').replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Reference Number
                    </p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {payment.reference || '—'}
                    </p>
                  </div>

                  {payment.dueDate && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Due Date
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
                        Paid Date
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
          </Card>

          {/* Fees Breakdown */}
          {(payment.fees?.processingFee > 0 || 
            payment.fees?.platformFee > 0 || 
            payment.fees?.otherFees > 0) && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Fees & Charges
                </h3>
                <div className="space-y-3">
                  {payment.fees.processingFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Processing Fee</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(payment.fees.processingFee)}
                      </span>
                    </div>
                  )}
                  {payment.fees.platformFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(payment.fees.platformFee)}
                      </span>
                    </div>
                  )}
                  {payment.fees.otherFees > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Other Fees</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(payment.fees.otherFees)}
                      </span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white font-semibold">
                        Net Amount
                      </span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(payment.netAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Refund Information */}
          {payment.refundAmount > 0 && (
            <Card>
              <div className="p-6 bg-orange-50 dark:bg-orange-900/20">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Refund Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Refund Amount</span>
                    <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(payment.refundAmount)}
                    </span>
                  </div>
                  {payment.refundDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Refund Date</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDate(payment.refundDate)}
                      </span>
                    </div>
                  )}
                  {payment.refundReason && (
                    <div className="pt-3 border-t border-orange-200 dark:border-orange-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">Reason</p>
                      <p className="text-gray-900 dark:text-white">{payment.refundReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Related Information */}
          {(payment.event || payment.client) && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Related Information
                </h3>
                <div className="space-y-4">
                  {payment.event && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Event</p>
                      <button
                        onClick={() => navigate(`/events/${payment.event._id || payment.event}`)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {payment.event.title || 'View Event'}
                      </button>
                    </div>
                  )}
                  {payment.client && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Client</p>
                      <button
                        onClick={() => navigate(`/clients/${payment.client._id || payment.client}`)}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {payment.client.name || 'View Client'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={Edit}
                  onClick={handleEdit}
                >
                  Edit Payment
                </Button>
                {payment.type === 'income' && 
                 ['completed', 'paid'].includes((payment.status || '').toLowerCase()) &&
                 !payment.refundAmount && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={RotateCcw}
                    onClick={() => {
                      setRefundData({ amount: payment.amount.toString(), reason: '' });
                      setIsRefundModalOpen(true);
                    }}
                  >
                    Process Refund
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  icon={Trash2}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete Payment
                </Button>
              </div>
            </div>
          </Card>

          {/* Metadata */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Metadata
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDateTime(payment.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDateTime(payment.updatedAt)}
                  </p>
                </div>
                {payment.processedBy && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Processed By</p>
                    <p className="text-gray-900 dark:text-white">
                      {payment.processedBy.name || 'System'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false);
          setRefundData({ amount: '', reason: '' });
        }}
        title="Process Refund"
        size="sm"
      >
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <Input
              label="Refund Amount"
              type="number"
              value={refundData.amount}
              onChange={(e) => setRefundData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              min="0"
              max={payment?.amount}
              step="0.01"
              icon={DollarSign}
            />
            <Input
              label="Reason for Refund"
              value={refundData.reason}
              onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Enter refund reason (optional)"
            />
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This will refund {formatCurrency(parseFloat(refundData.amount) || 0)} to the client.
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsRefundModalOpen(false);
                setRefundData({ amount: '', reason: '' });
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRefund}
            >
              Confirm Refund
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Payment"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this payment? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentDetail;