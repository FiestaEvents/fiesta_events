import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import { paymentService } from "../../api/index";
import { DollarSign } from "../../components/icons/IconComponents";
import Card from "../../components/common/Card.tsx";
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
} from "lucide-react";
import PaymentDetailModal from "./PaymentDetailModal";
import PaymentForm from "./PaymentForm";
import Badge from "../../components/common/Badge";
import { useToast } from "../../context/ToastContext";
import formatCurrency from "../../utils/formatCurrency";

const PaymentsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    paymentId: null,
    paymentName: "",
    onConfirm: null
  });

  // Refund state
  const [refundData, setRefundData] = useState({
    amount: "",
    reason: "",
  });

  // Search & filter state
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch payments with toast notifications
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

      let paymentsData = [];
      let totalPages = 1;
      let totalCount = 0;

      if (response?.data?.data?.payments) {
        paymentsData = response.data.data.payments || [];
        totalPages = response.data.data.totalPages || 1;
        totalCount = response.data.data.totalCount || paymentsData.length;
      } else if (response?.data?.payments) {
        paymentsData = response.data.payments || [];
        totalPages = response.data.totalPages || 1;
        totalCount = response.data.totalCount || paymentsData.length;
      } else if (response?.payments) {
        paymentsData = response.payments || [];
        totalPages = response.totalPages || 1;
        totalCount = response.totalCount || paymentsData.length;
      } else if (Array.isArray(response?.data)) {
        paymentsData = response.data;
      } else if (Array.isArray(response)) {
        paymentsData = response;
      }

      setPayments(paymentsData);
      setTotalPages(totalPages);
      setTotalCount(totalCount);
      setHasInitialLoad(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        t('payments.notifications.error');
      setError(errorMessage);
      showError(errorMessage);
      setPayments([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, type, status, method, page, limit, showError, t]);

  // Show confirmation modal
  const showDeleteConfirmation = useCallback((paymentId, paymentName = t('payments.payment')) => {
    setConfirmationModal({
      isOpen: true,
      paymentId,
      paymentName,
      onConfirm: () => handleDeleteConfirm(paymentId, paymentName)
    });
  }, [t]);

  // Close confirmation modal
  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({
      isOpen: false,
      paymentId: null,
      paymentName: "",
      onConfirm: null
    });
  }, []);

  // Handle confirmed deletion
  const handleDeleteConfirm = useCallback(async (paymentId, paymentName = t('payments.payment')) => {
    if (!paymentId) {
      showError(t('payments.notifications.deleteError'));
      return;
    }

    try {
      await promise(
        paymentService.delete(paymentId),
        {
          loading: t('payments.notifications.deleting', { paymentName }),
          success: t('payments.notifications.deleteSuccess'),
          error: t('payments.notifications.deleteError')
        }
      );

      fetchPayments();
      
      if (selectedPayment?._id === paymentId) {
        setSelectedPayment(null);
        setIsDetailModalOpen(false);
      }
      
      closeConfirmationModal();
    } catch (err) {
      console.error("Delete payment error:", err);
      closeConfirmationModal();
    }
  }, [fetchPayments, selectedPayment, promise, showError, closeConfirmationModal, t]);

  const handleDeletePayment = useCallback((paymentId, paymentName = t('payments.payment')) => {
    showDeleteConfirmation(paymentId, paymentName);
  }, [showDeleteConfirmation, t]);

  // Handle row click to open detail modal
  const handleRowClick = useCallback((payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  }, []);

  // Handle detail modal close
  const handleDetailModalClose = useCallback(() => {
    setSelectedPayment(null);
    setIsDetailModalOpen(false);
  }, []);

  const handleRefundPayment = useCallback(
    async (paymentId, refundData) => {
      try {
        if (!refundData.amount || parseFloat(refundData.amount) <= 0) {
          showError(t('payments.modals.refund.invalidAmount'));
          return;
        }

        await promise(
          paymentService.refund(paymentId, {
            refundAmount: parseFloat(refundData.amount),
            refundReason: refundData.reason,
          }),
          {
            loading: t('payments.notifications.refunding'),
            success: t('payments.notifications.refundSuccess'),
            error: t('payments.notifications.refundError')
          }
        );

        setIsRefundModalOpen(false);
        setSelectedPayment(null);
        setRefundData({ amount: "", reason: "" });
        fetchPayments();
      } catch (err) {
        console.error("Refund payment error:", err);
      }
    },
    [fetchPayments, promise, showError, t]
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleAddPayment = useCallback(() => {
    setSelectedPayment(null);
    setIsFormOpen(true);
  }, []);

  const handleEditPayment = useCallback((payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewPayment = useCallback(
    (payment) => {
      if (payment && payment._id) {
        navigate(`/payments/${payment._id}`);
      } else {
        console.error("Invalid payment data:", payment);
        showError(t('payments.notifications.invalidData'));
      }
    },
    [navigate, showError, t]
  );

  const handleRefundClick = useCallback((payment) => {
    setSelectedPayment(payment);
    setRefundData({
      amount: payment.amount.toString(),
      reason: "",
    });
    setIsRefundModalOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchPayments();
    setSelectedPayment(null);
    setIsFormOpen(false);
    showSuccess(
      selectedPayment 
        ? t('payments.notifications.updateSuccess') 
        : t('payments.notifications.createSuccess')
    );
  }, [fetchPayments, selectedPayment, showSuccess, t]);

  const handleFormClose = useCallback(() => {
    setSelectedPayment(null);
    setIsFormOpen(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setType("all");
    setStatus("all");
    setMethod("all");
    setPage(1);
    showInfo(t('payments.notifications.filtersCleared'));
  }, [showInfo, t]);

  const handleRetry = useCallback(() => {
    fetchPayments();
    showInfo(t('payments.notifications.retrying'));
  }, [fetchPayments, showInfo, t]);

  const handleExportCSV = useCallback(() => {
    if (!payments || payments.length === 0) {
      showError(t('payments.notifications.noPaymentsExport'));
      return;
    }

    try {
      let csvContent =
        "Date,Type,Description,Client,Method,Amount,Status,Reference\n";

      payments.forEach((payment) => {
        const date = payment.paidDate || payment.createdAt || "";
        const type = payment.type || "";
        const description = (payment.description || "").replace(/,/g, " ");
        const client = getClientName(payment).replace(/,/g, " ");
        const method = (payment.method || "").replace(/_/g, " ");
        const amount = payment.amount || 0;
        const status = payment.status || "";
        const reference = (payment.reference || "").replace(/,/g, " ");

        csvContent += `${date},${type},"${description}","${client}","${method}",${amount},${status},"${reference}"\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess(t('payments.notifications.exportSuccess'));
    } catch (error) {
      console.error("Error exporting payments:", error);
      showError(t('payments.notifications.exportError'));
    }
  }, [payments, showSuccess, showError, t]);

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getClientName = (payment) => {
    if (payment.client?.name) return payment.client.name;
    if (payment.event?.clientId?.name) return payment.event.clientId.name;
    return "N/A";
  };

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

  // Stats calculation
  const stats = {
    completedIncome: payments
      .filter((p) => p.type === "income" && ["completed", "paid"].includes((p.status || "").toLowerCase()))
      .reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0),
    
    completedExpenses: payments
      .filter((p) => p.type === "expense" && ["completed", "paid"].includes((p.status || "").toLowerCase()))
      .reduce((sum, p) => sum + (p.netAmount || p.amount || 0), 0),
    
    pendingIncome: payments
      .filter((p) => p.type === "income" && (p.status || "").toLowerCase() === "pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    
    pendingExpenses: payments
      .filter((p) => p.type === "expense" && (p.status || "").toLowerCase() === "pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    
    completedPayments: payments.filter((p) =>
      ["completed", "paid"].includes((p.status || "").toLowerCase())
    ).length,
    
    pendingPayments: payments.filter(
      (p) => (p.status || "").toLowerCase() === "pending"
    ).length,
    
    failedPayments: payments.filter(
      (p) => (p.status || "").toLowerCase() === "failed"
    ).length,
  };

  stats.netCompleted = stats.completedIncome - stats.completedExpenses;
  stats.netPending = stats.pendingIncome - stats.pendingExpenses;
  stats.netProjected = stats.netCompleted + stats.netPending;

  // Stats Cards Section
  const StatsCardsSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Income Card */}
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-green-800 dark:text-green-300">
            {t('payments.stats.income')}
          </div>
          <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <div className="text-xs text-green-700 dark:text-green-400 mb-0.5">
              {t('payments.stats.completed')}
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(stats.completedIncome)}
            </div>
          </div>
          {stats.pendingIncome > 0 && (
            <div className="pt-2 border-t border-green-200 dark:border-green-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-green-700 dark:text-green-400">
                  {t('payments.stats.pending')}
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(stats.pendingIncome)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expenses Card */}
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-red-800 dark:text-red-300">
            {t('payments.stats.expenses')}
          </div>
          <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <div className="text-xs text-red-700 dark:text-red-400 mb-0.5">
              {t('payments.stats.completed')}
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(stats.completedExpenses)}
            </div>
          </div>
          {stats.pendingExpenses > 0 && (
            <div className="pt-2 border-t border-red-200 dark:border-red-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-red-700 dark:text-red-400">
                  {t('payments.stats.pending')}
                </span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(stats.pendingExpenses)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Net Amount Card */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {t('payments.stats.netAmount')}
          </div>
          <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <div className="text-xs text-blue-700 dark:text-blue-400 mb-0.5">
              {t('payments.stats.realized')}
            </div>
            <div
              className={`text-2xl font-bold ${
                stats.netCompleted >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(stats.netCompleted)}
            </div>
          </div>
          {(stats.pendingIncome > 0 || stats.pendingExpenses > 0) && (
            <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-700 dark:text-blue-400">
                  {t('payments.stats.projected')}
                </span>
                <span
                  className={`font-semibold ${
                    stats.netProjected >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(stats.netProjected)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Status Card */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-3">
          {t('payments.stats.paymentStatus')}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('payments.stats.completed')}
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {stats.completedPayments}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('payments.stats.pending')}
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {stats.pendingPayments}
            </span>
          </div>
          {stats.failedPayments > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('payments.statuses.failed')}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {stats.failedPayments}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const hasActiveFilters =
    search.trim() !== "" ||
    type !== "all" ||
    status !== "all" ||
    method !== "all";
  const showEmptyState =
    !loading &&
    !error &&
    payments.length === 0 &&
    !hasActiveFilters &&
    hasInitialLoad;
  const showNoResults =
    !loading &&
    !error &&
    payments.length === 0 &&
    hasActiveFilters &&
    hasInitialLoad;

  // Table columns configuration
  const columns = [
    {
      header: t('payments.table.type'),
      accessor: "type",
      sortable: true,
      width: "10%",
      render: (row) => (
        <Badge color={getTypeBadgeColor(row.type)}>
          <div className="flex items-center gap-1">
            {row.type === "income" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="capitalize">
              {t(`payments.types.${row.type}`)}
            </span>
          </div>
        </Badge>
      ),
    },
    {
      header: t('payments.table.description'),
      accessor: "description",
      sortable: true,
      width: "25%",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.description || "N/A"}
          </div>
          {row.reference && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('payments.table.reference')}: {row.reference}
            </div>
          )}
        </div>
      ),
    },
    {
      header: t('payments.table.client'),
      accessor: "client",
      sortable: true,
      width: "15%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {getClientName(row)}
        </div>
      ),
    },
    {
      header: t('payments.table.date'),
      accessor: "date",
      sortable: true,
      width: "12%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {formatDate(row.paidDate || row.createdAt)}
        </div>
      ),
    },
    {
      header: t('payments.table.method'),
      accessor: "method",
      sortable: true,
      width: "12%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400 capitalize">
          {t(`payments.methods.${row.method}`) || "N/A"}
        </div>
      ),
    },
    {
      header: t('payments.table.amount'),
      accessor: "amount",
      sortable: true,
      width: "13%",
      render: (row) => (
        <div
          className={`font-semibold ${
            row.type === "income"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {row.type === "income" ? "+" : "-"}
          {formatCurrency(row.amount)}
        </div>
      ),
    },
    {
      header: t('payments.table.status'),
      accessor: "status",
      sortable: true,
      width: "10%",
      render: (row) => (
        <Badge color={getStatusBadgeColor(row.status)}>
          {t(`payments.statuses.${row.status}`) || "Unknown"}
        </Badge>
      ),
    },
    {
      header: t('payments.table.actions'),
      accessor: "actions",
      width: "3%",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewPayment(row);
            }}
            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
            title={t('payments.viewPayment')}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditPayment(row);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            title={t('payments.editPayment')}
          >
            <Edit className="h-4 w-4" />
          </button>
          {row.type === "income" &&
            ["completed", "paid"].includes(
              (row.status || "").toLowerCase()
            ) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefundClick(row);
                }}
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 p-1 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
                title={t('payments.refundPayment')}
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePayment(row._id, row.description || t('payments.payment'));
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title={t('payments.deletePayment')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {t('payments.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('payments.subtitle')}
            {hasInitialLoad &&
              totalCount > 0 &&
              ` ${t('payments.showing', { count: payments.length, total: totalCount })}`}
          </p>
        </div>
        <div className="flex gap-2">
          {totalCount > 0 && (
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('payments.exportPayments')}
            </Button>
          )}
          {totalCount > 0 && (
            <Button
              variant="primary"
              onClick={handleAddPayment}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {t('payments.addPayment')}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCardsSection />

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                {t('payments.notifications.error')}
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
            <Button onClick={handleRetry} size="sm" variant="outline">
              {t('payments.notifications.retry')}
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Search}
                placeholder={t('payments.searchPlaceholder')}
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <div className="sm:w-40">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Filter}
                value={type}
                onChange={(e) => {
                  setPage(1);
                  setType(e.target.value);
                }}
                options={[
                  { value: "all", label: t('payments.filters.allTypes') },
                  { value: "income", label: t('payments.types.income') },
                  { value: "expense", label: t('payments.types.expense') },
                ]}
              />
            </div>
            <div className="sm:w-40">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                options={[
                  { value: "all", label: t('payments.filters.allStatus') },
                  { value: "pending", label: t('payments.statuses.pending') },
                  { value: "completed", label: t('payments.statuses.completed') },
                  { value: "failed", label: t('payments.statuses.failed') },
                  { value: "refunded", label: t('payments.statuses.refunded') },
                ]}
              />
            </div>
            <div className="sm:w-40">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                value={method}
                onChange={(e) => {
                  setPage(1);
                  setMethod(e.target.value);
                }}
                options={[
                  { value: "all", label: t('payments.filters.allMethods') },
                  { value: "cash", label: t('payments.methods.cash') },
                  { value: "card", label: t('payments.methods.card') },
                  { value: "credit_card", label: t('payments.methods.credit_card') },
                  { value: "bank_transfer", label: t('payments.methods.bank_transfer') },
                  { value: "check", label: t('payments.methods.check') },
                  { value: "mobile_payment", label: t('payments.methods.mobile_payment') },
                ]}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {t('payments.filters.clearFilters')}
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{t('payments.filters.activeFilters')}:</span>
              {search.trim() && (
                <Badge color="blue">{t('payments.search')}: "{search.trim()}"</Badge>
              )}
              {type !== "all" && <Badge color="green">{t('payments.filters.type')}: {type}</Badge>}
              {status !== "all" && <Badge color="purple">{t('payments.filters.status')}: {status}</Badge>}
              {method !== "all" && <Badge color="orange">{t('payments.filters.method')}: {method}</Badge>}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && !hasInitialLoad && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {t('payments.notifications.loading')}
          </p>
        </div>
      )}

      {/* Table Section */}
      {!loading && hasInitialLoad && payments.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={payments}
              loading={loading}
              onRowClick={handleRowClick}
              pagination={true}
              currentPage={page}
              totalPages={totalPages}
              pageSize={limit}
              totalItems={totalCount}
              onPageChange={setPage}
              onPageSizeChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={limit}
                onPageSizeChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                totalItems={totalCount}
              />
            </div>
          )}
        </>
      )}

      {/* No Results from Search/Filter */}
      {showNoResults && (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('payments.table.noResults')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('payments.table.noResultsDescription')}
          </p>
          <Button onClick={handleClearFilters} variant="outline">
            {t('payments.filters.clearFilters')}
          </Button>
        </div>
      )}

      {/* Empty State - No payments at all */}
      {showEmptyState && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <DollarSign className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('payments.table.noPayments')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('payments.getStarted')}
          </p>
          <Button onClick={handleAddPayment} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            {t('payments.recordFirstPayment')}
          </Button>
        </div>
      )}

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        payment={selectedPayment}
        onEdit={handleEditPayment}
        refreshData={fetchPayments}
      />

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedPayment ? t('payments.modals.paymentForm.editTitle') : t('payments.modals.paymentForm.newTitle')}
          size="lg"
        >
          <PaymentForm
            payment={selectedPayment}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </Modal>
      )}

      {/* Refund Modal */}
      {isRefundModalOpen && selectedPayment && (
        <Modal
          isOpen={isRefundModalOpen}
          onClose={() => {
            setSelectedPayment(null);
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
                max={selectedPayment?.amount}
                step="0.01"
              />
              <Input
                label={t('payments.modals.refund.reason')}
                value={refundData.reason}
                onChange={(e) =>
                  setRefundData((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder={t('payments.modals.refund.reasonPlaceholder')}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRefundModalOpen(false);
                  setSelectedPayment(null);
                  setRefundData({ amount: "", reason: "" });
                }}
              >
                {t('payments.modals.refund.cancel')}
              </Button>
              <Button
                variant="danger"
                onClick={() =>
                  handleRefundPayment(selectedPayment._id, refundData)
                }
              >
                {t('payments.modals.refund.confirm')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        title={t('payments.modals.delete.title')}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('payments.modals.delete.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t('payments.modals.delete.description', { paymentName: confirmationModal.paymentName })}
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeConfirmationModal}
                  className="px-4 py-2"
                >
                  {t('payments.modals.delete.cancel')}
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmationModal.onConfirm}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('payments.modals.delete.confirm')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentsList;