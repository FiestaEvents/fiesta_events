import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
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
  FolderOpen,
} from "lucide-react";

// ✅ API & Services
import { paymentService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination";
import formatCurrency from "../../utils/formatCurrency";

// ✅ Context
import { useToast } from "../../context/ToastContext";

// ✅ Sub-components
import PaymentDetailModal from "./PaymentDetailModal";
import PaymentForm from "./PaymentForm";

// ================================================================
// CONSTANTS
// ================================================================

const INITIAL_FILTERS = {
  search: "",
  type: "all",
  status: "all",
  method: "all",
  page: 1,
  limit: 10,
};

const PAYMENT_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

const PAYMENT_STATUSES = {
  COMPLETED: "completed",
  PAID: "paid",
  PENDING: "pending",
  FAILED: "failed",
  REFUNDED: "refunded",
};

const BADGE_VARIANTS = {
  STATUS: {
    completed: "success",
    paid: "success",
    pending: "warning",
    failed: "danger",
    refunded: "info",
  },
  TYPE: {
    income: "success",
    expense: "danger",
  },
};

const STAT_CONFIGS = [
  {
    key: "income",
    labelKey: "payments.stats.income",
    bgClass: "bg-green-50 dark:bg-green-900/20",
    borderClass: "border-green-200 dark:border-green-800",
    textClass: "text-green-800 dark:text-green-300",
    iconBgClass: "bg-green-100 dark:bg-green-800",
    iconClass: "text-green-600 dark:text-green-400",
    valueClass: "text-green-700 dark:text-green-400",
    subTextClass: "text-green-600 dark:text-green-500",
    icon: TrendingUp,
    getValue: (stats) => stats.completedIncome,
    getSubValue: (stats) => stats.pendingIncome,
  },
  {
    key: "expenses",
    labelKey: "payments.stats.expenses",
    bgClass: "bg-red-50 dark:bg-red-900/20",
    borderClass: "border-red-200 dark:border-red-800",
    textClass: "text-red-800 dark:text-red-300",
    iconBgClass: "bg-red-100 dark:bg-red-800",
    iconClass: "text-red-600 dark:text-red-400",
    valueClass: "text-red-700 dark:text-red-400",
    subTextClass: "text-red-600 dark:text-red-500",
    icon: TrendingDown,
    getValue: (stats) => stats.completedExpenses,
    getSubValue: (stats) => stats.pendingExpenses,
  },
  {
    key: "netAmount",
    labelKey: "payments.stats.netAmount",
    bgClass: "bg-blue-50 dark:bg-blue-900/20",
    borderClass: "border-blue-200 dark:border-blue-800",
    textClass: "text-blue-800 dark:text-blue-300",
    iconBgClass: "bg-blue-100 dark:bg-blue-800",
    iconClass: "text-blue-600 dark:text-blue-400",
    valueClass: "text-blue-700 dark:text-blue-400",
    subTextClass: "text-blue-600 dark:text-blue-500",
    icon: DollarSign,
    getValue: (stats) => stats.netCompleted,
    getSubValue: (stats) => stats.netProjected,
    subLabel: "payments.stats.projected",
    isDynamic: true,
  },
  {
    key: "status",
    labelKey: "payments.stats.paymentStatus",
    bgClass: "bg-gray-50 dark:bg-gray-800",
    borderClass: "border-gray-200 dark:border-gray-700",
    textClass: "text-gray-800 dark:text-gray-300",
    iconBgClass: "bg-gray-200 dark:bg-gray-700",
    iconClass: "text-gray-600 dark:text-gray-400",
    icon: Activity,
    isStatusCard: true,
  },
];

// ================================================================
// HELPER FUNCTIONS
// ================================================================

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

const getBadgeVariant = (value, type) => {
  const variants =
    type === "status" ? BADGE_VARIANTS.STATUS : BADGE_VARIANTS.TYPE;
  return variants[value?.toLowerCase()] || "secondary";
};

const calculateStats = (payments) => {
  const stats = {
    completedIncome: 0,
    pendingIncome: 0,
    completedExpenses: 0,
    pendingExpenses: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
  };

  payments.forEach((payment) => {
    const status = payment.status?.toLowerCase();
    const isCompleted = [
      PAYMENT_STATUSES.COMPLETED,
      PAYMENT_STATUSES.PAID,
    ].includes(status);
    const isPending = status === PAYMENT_STATUSES.PENDING;
    const amount = payment.netAmount || payment.amount || 0;

    if (payment.type === PAYMENT_TYPES.INCOME) {
      if (isCompleted) stats.completedIncome += amount;
      if (isPending) stats.pendingIncome += amount;
    } else if (payment.type === PAYMENT_TYPES.EXPENSE) {
      if (isCompleted) stats.completedExpenses += amount;
      if (isPending) stats.pendingExpenses += amount;
    }

    if (isCompleted) stats.completedPayments++;
    if (isPending) stats.pendingPayments++;
    if (status === PAYMENT_STATUSES.FAILED) stats.failedPayments++;
  });

  stats.netCompleted = stats.completedIncome - stats.completedExpenses;
  stats.netPending = stats.pendingIncome - stats.pendingExpenses;
  stats.netProjected = stats.netCompleted + stats.netPending;

  return stats;
};

// ================================================================
// MAIN COMPONENT
// ================================================================

const PaymentsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError, showInfo, promise } = useToast();

  // State
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // UI States
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  // Filter States
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal States
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    paymentId: null,
    paymentName: "",
    onConfirm: null,
  });

  // Computed Values
  const stats = calculateStats(payments);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.method !== "all";

  // Logic States
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
  const showData = !loading && hasInitialLoad && payments.length > 0;

  // Data Fetching
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search.trim() && { search: filters.search.trim() }),
        ...(filters.type !== "all" && { type: filters.type }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.method !== "all" && { method: filters.method }),
      };

      const response = await paymentService.getAll(params);

      // Robust data extraction
      let data =
        response?.data?.data?.payments ||
        response?.data?.payments ||
        response?.payments ||
        [];
      if (!Array.isArray(data)) data = [];

      let pTotalPages =
        response?.data?.data?.totalPages || response?.pagination?.pages || 1;
      let pTotalCount =
        response?.data?.data?.totalCount ||
        response?.pagination?.total ||
        data.length;

      setPayments(data);
      setTotalPages(pTotalPages);
      setTotalCount(pTotalCount);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        t("payments.notifications.error");
      setError(msg);
      showError(msg);
      setPayments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setHasInitialLoad(true);
    }
  }, [filters, showError, t]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Handlers
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" && { page: 1 }),
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    showInfo(t("payments.notifications.filtersCleared"));
  }, [showInfo, t]);

  const handleDeleteConfirm = useCallback(
    async (paymentId, paymentName) => {
      try {
        await promise(paymentService.delete(paymentId), {
          loading: t("payments.notifications.deleting", { paymentName }),
          success: t("payments.notifications.deleteSuccess"),
          error: t("payments.notifications.deleteError"),
        });
        fetchPayments();
        setConfirmationModal({
          isOpen: false,
          paymentId: null,
          paymentName: "",
          onConfirm: null,
        });
        if (selectedPayment?._id === paymentId) setIsDetailModalOpen(false);
      } catch (err) {
        /* handled by promise */
      }
    },
    [fetchPayments, selectedPayment, promise, t]
  );

  const handleDeletePayment = useCallback(
    (paymentId, paymentName) => {
      setConfirmationModal({
        isOpen: true,
        paymentId,
        paymentName,
        onConfirm: () => handleDeleteConfirm(paymentId, paymentName),
      });
    },
    [handleDeleteConfirm]
  );

  const handleExportCSV = useCallback(() => {
    if (!payments.length)
      return showError(t("payments.notifications.noPaymentsExport"));
    showSuccess(t("payments.notifications.exportSuccess"));
  }, [payments.length, showError, showSuccess, t]);

  const handleFormSuccess = useCallback(() => {
    fetchPayments();
    setIsFormOpen(false);
    setSelectedPayment(null);
    showSuccess(
      selectedPayment
        ? t("payments.notifications.updateSuccess")
        : t("payments.notifications.createSuccess")
    );
  }, [fetchPayments, selectedPayment, showSuccess, t]);

  // Table Columns
  const tableColumns = [
    {
      header: t("payments.table.type"),
      accessor: "type",
      width: "10%",
      render: (row) => (
        <Badge variant={getBadgeVariant(row.type, "type")}>
          <div className="flex items-center gap-1">
            {row.type === PAYMENT_TYPES.INCOME ? (
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
      header: t("payments.table.description"),
      accessor: "description",
      width: "25%",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.description || "N/A"}
          </div>
          {row.reference && (
            <div className="text-xs text-gray-500">
              {t("payments.table.reference")}: {row.reference}
            </div>
          )}
        </div>
      ),
    },
    {
      header: t("payments.table.client"),
      accessor: "client",
      width: "15%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {getClientName(row)}
        </div>
      ),
    },
    {
      header: t("payments.table.date"),
      accessor: "date",
      width: "12%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {formatDate(row.paidDate || row.createdAt)}
        </div>
      ),
    },
    {
      header: t("payments.table.amount"),
      accessor: "amount",
      width: "13%",
      render: (row) => (
        <div
          className={`font-bold ${row.type === PAYMENT_TYPES.INCOME ? "text-green-600" : "text-red-600"}`}
        >
          {row.type === PAYMENT_TYPES.INCOME ? "+" : "-"}
          {formatCurrency(row.amount)}
        </div>
      ),
    },
    {
      header: t("payments.table.status"),
      accessor: "status",
      width: "10%",
      render: (row) => (
        <Badge variant={getBadgeVariant(row.status, "status")}>
          {t(`payments.statuses.${row.status}`) || "Unknown"}
        </Badge>
      ),
    },
    {
      header: t("payments.table.actions"),
      accessor: "actions",
      width: "15%",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPayment(row);
              setIsDetailModalOpen(true);
            }}
            className="text-gray-500 hover:text-orange-600"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPayment(row);
              setIsFormOpen(true);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {row.type === PAYMENT_TYPES.INCOME &&
            [PAYMENT_STATUSES.COMPLETED, PAYMENT_STATUSES.PAID].includes(
              row.status?.toLowerCase()
            ) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPayment(row);
                  setIsRefundModalOpen(true);
                }}
                className="text-yellow-500 hover:text-yellow-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePayment(row._id, row.description);
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // ✅ Unified Pagination Footer
  const renderPagination = () => {
    const start = Math.min((filters.page - 1) * filters.limit + 1, totalCount);
    const end = Math.min(filters.page * filters.limit, totalCount);

    return (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div>
          Showing{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {start}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {end}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {totalCount}
          </span>{" "}
          results
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {totalPages > 1 && (
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => updateFilter("page", page)}
              pageSize={null}
            />
          )}
          <div className="flex items-center gap-2">
            <span>Per page:</span>
            <select
              value={filters.limit}
              onChange={(e) => {
                updateFilter("limit", Number(e.target.value));
              }}
              className="bg-white border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 py-1"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("payments.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("payments.subtitle")}
            {hasInitialLoad &&
              totalCount > 0 &&
              ` • ${t("payments.notifications.showingResults", { count: payments.length, total: totalCount })}`}
          </p>
        </div>

        {!showEmptyState && (
          <div className="flex gap-2 w-full sm:w-auto">
            {totalCount > 0 && (
              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
              >
                <Download className="h-4 w-4" />
                {t("payments.exportPayments")}
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => {
                setSelectedPayment(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
            >
              <Plus className="h-4 w-4" />
              {t("payments.addPayment")}
            </Button>
          </div>
        )}
      </div>

      {/* 2. Stats (Hidden if empty or no data) */}
      {!showEmptyState && hasInitialLoad && payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {STAT_CONFIGS.map((config) => {
            const Icon = config.icon;
            if (config.isStatusCard) {
              return (
                <div
                  key={config.key}
                  className={`p-4 rounded-lg border ${config.bgClass} ${config.borderClass}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`text-sm font-medium ${config.textClass}`}>
                      {t(config.labelKey)}
                    </div>
                    <div className={`p-2 rounded-lg ${config.iconBgClass}`}>
                      <Icon className={`w-5 h-5 ${config.iconClass}`} />
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        {t("payments.statuses.completed")}
                      </span>
                      <span className="font-bold dark:text-white">
                        {stats.completedPayments}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                        {t("payments.statuses.pending")}
                      </span>
                      <span className="font-bold dark:text-white">
                        {stats.pendingPayments}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            const mainValue = config.getValue(stats);
            const subValue = config.getSubValue(stats);
            return (
              <div
                key={config.key}
                className={`p-4 rounded-lg border ${config.bgClass} ${config.borderClass}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`text-sm font-medium ${config.textClass}`}>
                    {t(config.labelKey)}
                  </div>
                  <div className={`p-2 rounded-lg ${config.iconBgClass}`}>
                    <Icon className={`w-5 h-5 ${config.iconClass}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <div
                    className={`text-2xl font-bold ${config.isDynamic && mainValue < 0 ? "text-red-600" : config.valueClass}`}
                  >
                    {formatCurrency(mainValue)}
                  </div>
                  <div className={`text-xs ${config.subTextClass}`}>
                    {t(config.subLabel || "payments.stats.pending")}:{" "}
                    {formatCurrency(subValue)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Filters (Hidden if empty) */}
      {!showEmptyState && hasInitialLoad && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg flex flex-col sm:flex-row gap-4 shrink-0">
          <Input
            className="flex-1"
            icon={Search}
            placeholder={t("payments.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
          <div className="sm:w-40">
            <Select
              value={filters.type}
              onChange={(e) => updateFilter("type", e.target.value)}
              options={[
                { value: "all", label: "All Types" },
                { value: "income", label: "Income" },
                { value: "expense", label: "Expense" },
              ]}
            />
          </div>
          <div className="sm:w-40">
            <Select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              options={[
                { value: "all", label: "All Status" },
                { value: "pending", label: "Pending" },
                { value: "completed", label: "Completed" },
              ]}
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" icon={X} onClick={handleClearFilters}>
              {t("payments.filters.clearFilters")}
            </Button>
          )}
        </div>
      )}

      {/* 4. Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Loading Overlay */}
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              {t("common.loading", "Loading...")}
            </p>
          </div>
        )}

        {/* Data Table */}
        {showData && (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table
                columns={tableColumns}
                data={payments}
                loading={loading}
                emptyMessage={t("payments.table.empty")}
                onRowClick={(row) => {
                  setSelectedPayment(row);
                  setIsDetailModalOpen(true);
                }}
                striped
                hoverable
              />
            </div>
            {renderPagination()}
          </>
        )}

        {/* ✅ NO RESULTS (Active Filter) */}
        {showNoResults && (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("payments.table.noResults")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              {t(
                "payments.filters.noResultsDesc",
                "Try adjusting your filters to find what you're looking for."
              )}
            </p>
            <Button onClick={handleClearFilters} variant="outline" icon={X}>
              {t("payments.filters.clearFilters")}
            </Button>
          </div>
        )}

        {/* ✅ EMPTY STATE (No Data) - Enhanced Design */}
        {showEmptyState && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-6 ring-1 ring-gray-100 dark:ring-gray-700">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full">
                <DollarSign
                  className="h-12 w-12 text-orange-500"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("payments.table.noPayments")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8 leading-relaxed">
              Get started by recording your first payment transaction to track
              your financials.
            </p>
            <Button
              onClick={() => {
                setSelectedPayment(null);
                setIsFormOpen(true);
              }}
              variant="primary"
              size="lg"
              icon={Plus}
              className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
            >
              {t("payments.recordFirstPayment")}
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <PaymentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        payment={selectedPayment}
        onEdit={(p) => {
          setSelectedPayment(p);
          setIsDetailModalOpen(false);
          setIsFormOpen(true);
        }}
        refreshData={fetchPayments}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          selectedPayment
            ? t("payments.modals.paymentForm.editTitle")
            : t("payments.modals.paymentForm.newTitle")
        }
        size="lg"
      >
        <PaymentForm
          payment={selectedPayment}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal((p) => ({ ...p, isOpen: false }))}
        title={t("payments.modals.delete.title")}
        size="sm"
      >
        <div className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {t("payments.modals.delete.description", {
              paymentName: confirmationModal.paymentName,
            })}
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmationModal((p) => ({ ...p, isOpen: false }))
              }
            >
              {t("payments.modals.delete.cancel")}
            </Button>
            <Button variant="danger" onClick={confirmationModal.onConfirm}>
              {t("payments.modals.delete.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentsList;
