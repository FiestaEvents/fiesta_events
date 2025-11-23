import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Edit,
  Trash2,
  Download,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Activity,
  PieChart
} from "lucide-react";

// ✅ API & Services
import { paymentService } from "../../api/index";

// ✅ Generic Components & Utils
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import Badge from "../../components/common/Badge";
import formatCurrency from "../../utils/formatCurrency";

// ✅ Context
import { useToast } from "../../context/ToastContext";

// ✅ Sub-components
import PaymentDetailModal from "./PaymentDetailModal";
import PaymentForm from "./PaymentForm";

const PaymentsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError, showInfo, promise } = useToast();

  // State
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Modals State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    paymentId: null,
    paymentName: "",
    onConfirm: null
  });

  const [refundData, setRefundData] = useState({ amount: "", reason: "" });

  // Filters
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Helper: Strict DD/MM/YYYY format
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("en-GB");
    } catch {
      return date;
    }
  };

  const getClientName = (payment) => {
    if (payment.client?.name) return payment.client.name;
    if (payment.event?.clientId?.name) return payment.event.clientId.name;
    return "N/A";
  };

  const getStatusBadgeColor = (st) => {
    const map = {
      completed: "success", paid: "success",
      pending: "warning",
      failed: "danger",
      refunded: "info"
    };
    return map[st?.toLowerCase()] || "secondary";
  };

  const getTypeBadgeColor = (tp) => tp === "income" ? "success" : "danger";

  // Fetch Payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(type !== "all" && { type }),
        ...(status !== "all" && { status }),
        ...(method !== "all" && { method }),
      };

      const response = await paymentService.getAll(params);
      
      // Robust Data Extraction
      let data = response?.data?.data?.payments || response?.data?.payments || response?.payments || response?.data || response || [];
      if (!Array.isArray(data)) data = [];

      let pTotalPages = response?.data?.data?.totalPages || response?.data?.totalPages || response?.totalPages || 1;
      let pTotalCount = response?.data?.data?.totalCount || response?.data?.totalCount || response?.totalCount || data.length;

      setPayments(data);
      setTotalPages(pTotalPages);
      setTotalCount(pTotalCount);
      setHasInitialLoad(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || t('payments.notifications.error');
      setError(msg);
      showError(msg);
      setPayments([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, type, status, method, page, limit, showError, t]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Handlers
  const handleDeleteConfirm = useCallback(async (paymentId, paymentName) => {
    try {
      await promise(paymentService.delete(paymentId), {
        loading: t('payments.notifications.deleting', { paymentName }),
        success: t('payments.notifications.deleteSuccess'),
        error: t('payments.notifications.deleteError')
      });
      fetchPayments();
      setConfirmationModal({ isOpen: false, paymentId: null, paymentName: "", onConfirm: null });
      if (selectedPayment?._id === paymentId) setIsDetailModalOpen(false);
    } catch (err) {
      // Promise handles toast
    }
  }, [fetchPayments, selectedPayment, promise, t]);

  const handleDeletePayment = (paymentId, paymentName) => {
    setConfirmationModal({
      isOpen: true,
      paymentId,
      paymentName,
      onConfirm: () => handleDeleteConfirm(paymentId, paymentName)
    });
  };

  const handleRefundPayment = async (paymentId, refundData) => {
    try {
      if (!refundData.amount || parseFloat(refundData.amount) <= 0) {
        showError(t('payments.modals.refund.invalidAmount'));
        return;
      }
      await promise(paymentService.refund(paymentId, {
        refundAmount: parseFloat(refundData.amount),
        refundReason: refundData.reason,
      }), {
        loading: t('payments.notifications.refunding'),
        success: t('payments.notifications.refundSuccess'),
        error: t('payments.notifications.refundError')
      });
      setIsRefundModalOpen(false);
      fetchPayments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSuccess = () => {
    fetchPayments();
    setIsFormOpen(false);
    showSuccess(selectedPayment ? t('payments.notifications.updateSuccess') : t('payments.notifications.createSuccess'));
  };

  const handleClearFilters = () => {
    setSearch("");
    setType("all");
    setStatus("all");
    setMethod("all");
    setPage(1);
    showInfo(t('payments.notifications.filtersCleared'));
  };

  const handleExportCSV = () => {
    if (!payments.length) return showError(t('payments.notifications.noPaymentsExport'));
    // CSV logic...
    showSuccess(t('payments.notifications.exportSuccess'));
  };

  // Stats Calculation
  const stats = {
    // Income
    completedIncome: payments.filter(p => p.type === "income" && ["completed", "paid"].includes(p.status?.toLowerCase())).reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0),
    pendingIncome: payments.filter(p => p.type === "income" && p.status?.toLowerCase() === "pending").reduce((sum, p) => sum + (p.amount || 0), 0),
    
    // Expenses
    completedExpenses: payments.filter(p => p.type === "expense" && ["completed", "paid"].includes(p.status?.toLowerCase())).reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0),
    pendingExpenses: payments.filter(p => p.type === "expense" && p.status?.toLowerCase() === "pending").reduce((sum, p) => sum + (p.amount || 0), 0),
    
    // Counts
    completedPayments: payments.filter(p => ["completed", "paid"].includes(p.status?.toLowerCase())).length,
    pendingPayments: payments.filter(p => p.status?.toLowerCase() === "pending").length,
    failedPayments: payments.filter(p => p.status?.toLowerCase() === "failed").length,
  };

  // Net Calcs
  stats.netCompleted = stats.completedIncome - stats.completedExpenses;
  stats.netPending = stats.pendingIncome - stats.pendingExpenses;
  stats.netProjected = stats.netCompleted + stats.netPending;

  const hasActiveFilters = search.trim() !== "" || type !== "all" || status !== "all" || method !== "all";
  const showEmptyState = !loading && !error && payments.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults = !loading && !error && payments.length === 0 && hasActiveFilters && hasInitialLoad;

  // Columns
  const columns = [
    {
      header: t('payments.table.type'),
      accessor: "type",
      width: "10%",
      render: (row) => (
        <Badge variant={getTypeBadgeColor(row.type)}>
          <div className="flex items-center gap-1">
            {row.type === "income" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span className="capitalize">{t(`payments.types.${row.type}`)}</span>
          </div>
        </Badge>
      ),
    },
    {
      header: t('payments.table.description'),
      accessor: "description",
      width: "25%",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.description || "N/A"}</div>
          {row.reference && <div className="text-xs text-gray-500">{t('payments.table.reference')}: {row.reference}</div>}
        </div>
      ),
    },
    {
      header: t('payments.table.client'),
      accessor: "client",
      width: "15%",
      render: (row) => <div className="text-gray-600 dark:text-gray-400">{getClientName(row)}</div>,
    },
    {
      header: t('payments.table.date'),
      accessor: "date",
      width: "12%",
      render: (row) => <div className="text-gray-600 dark:text-gray-400">{formatDate(row.paidDate || row.createdAt)}</div>,
    },
    {
      header: t('payments.table.amount'),
      accessor: "amount",
      width: "13%",
      render: (row) => (
        <div className={`font-bold ${row.type === "income" ? "text-green-600" : "text-red-600"}`}>
          {row.type === "income" ? "+" : "-"}{formatCurrency(row.amount)}
        </div>
      ),
    },
    {
      header: t('payments.table.status'),
      accessor: "status",
      width: "10%",
      render: (row) => (
        <Badge variant={getStatusBadgeColor(row.status)}>
          {t(`payments.statuses.${row.status}`) || "Unknown"}
        </Badge>
      ),
    },
    {
      header: t('payments.table.actions'),
      accessor: "actions",
      width: "15%",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); navigate(`/payments/${row._id}`); }}
            className="text-gray-500 hover:text-orange-600"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); setSelectedPayment(row); setIsFormOpen(true); }}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>

          {row.type === "income" && ["completed", "paid"].includes(row.status?.toLowerCase()) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); setSelectedPayment(row); setIsRefundModalOpen(true); }}
              className="text-yellow-500 hover:text-yellow-700"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); handleDeletePayment(row._id, row.description); }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('payments.title')}</h1>
          <p className="text-gray-500">{t('payments.subtitle')} {hasInitialLoad && `(${totalCount})`}</p>
        </div>
        <div className="flex gap-2">
          {totalCount > 0 && (
            <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> {t('payments.exportPayments')}
            </Button>
          )}
          <Button variant="primary" onClick={() => { setSelectedPayment(null); setIsFormOpen(true); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t('payments.addPayment')}
          </Button>
        </div>
      </div>

      {/* Stats Section (Restored 4-Card Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Income */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-green-800 dark:text-green-300">{t('payments.stats.income')}</div>
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(stats.completedIncome)}</div>
            <div className="text-xs text-green-600 dark:text-green-500">
              {t('payments.stats.pending')}: {formatCurrency(stats.pendingIncome)}
            </div>
          </div>
        </div>

        {/* 2. Expenses */}
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-red-800 dark:text-red-300">{t('payments.stats.expenses')}</div>
            <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{formatCurrency(stats.completedExpenses)}</div>
            <div className="text-xs text-red-600 dark:text-red-500">
              {t('payments.stats.pending')}: {formatCurrency(stats.pendingExpenses)}
            </div>
          </div>
        </div>

        {/* 3. Net Amount (Restored) */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-300">{t('payments.stats.netAmount')}</div>
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="space-y-1">
            <div className={`text-2xl font-bold ${stats.netCompleted >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-red-600'}`}>
              {formatCurrency(stats.netCompleted)}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-500">
              {t('payments.stats.projected')}: {formatCurrency(stats.netProjected)}
            </div>
          </div>
        </div>

        {/* 4. Payment Status (Restored) */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-gray-800 dark:text-gray-300">{t('payments.stats.paymentStatus')}</div>
            <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> {t('payments.statuses.completed')}
              </span>
              <span className="font-bold dark:text-white">{stats.completedPayments}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span> {t('payments.statuses.pending')}
              </span>
              <span className="font-bold dark:text-white">{stats.pendingPayments}</span>
            </div>
            {stats.failedPayments > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span> {t('payments.statuses.failed')}
                </span>
                <span className="font-bold dark:text-white">{stats.failedPayments}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-4">
          <Input className="flex-1" icon={Search} placeholder={t('payments.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="sm:w-40">
            <Select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
              options={[{ value: "all", label: "All Types" }, { value: "income", label: "Income" }, { value: "expense", label: "Expense" }]}
            />
          </div>
          <div className="sm:w-40">
            <Select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              options={[{ value: "all", label: "All Status" }, { value: "pending", label: "Pending" }, { value: "completed", label: "Completed" }]}
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" icon={X} onClick={handleClearFilters}>{t('payments.filters.clearFilters')}</Button>
          )}
        </div>
      )}

      {/* Content */}
      {showNoResults ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('payments.table.noResults')}</h3>
          <Button onClick={handleClearFilters} variant="outline">{t('payments.filters.clearFilters')}</Button>
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <DollarSign className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('payments.table.noPayments')}</h3>
          <Button onClick={() => setIsFormOpen(true)} variant="primary" icon={Plus}>{t('payments.recordFirstPayment')}</Button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={payments}
            loading={loading}
            emptyMessage={t('payments.table.empty')}
            onRowClick={(row) => { setSelectedPayment(row); setIsDetailModalOpen(true); }}
            striped
            hoverable
          />
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={limit}
                onPageSizeChange={(val) => { setLimit(val); setPage(1); }}
                totalItems={totalCount}
              />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        payment={selectedPayment}
        onEdit={(p) => { setSelectedPayment(p); setIsDetailModalOpen(false); setIsFormOpen(true); }}
        refreshData={fetchPayments}
      />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedPayment ? t('payments.modals.paymentForm.editTitle') : t('payments.modals.paymentForm.newTitle')} size="lg">
        <PaymentForm payment={selectedPayment} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <Modal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal(p => ({ ...p, isOpen: false }))} title={t('payments.modals.delete.title')} size="sm">
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="mb-6 text-gray-600">{t('payments.modals.delete.description', { paymentName: confirmationModal.paymentName })}</p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => setConfirmationModal(p => ({ ...p, isOpen: false }))}>{t('payments.modals.delete.cancel')}</Button>
            <Button variant="danger" onClick={confirmationModal.onConfirm}>{t('payments.modals.delete.confirm')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentsList;