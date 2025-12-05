import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Filter,
} from "lucide-react";
import OrbitLoader from "../../components/common/LoadingSpinner";
// ✅ API & Services
import { paymentService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable"; // Using NewTable
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";

import formatCurrency from "../../utils/formatCurrency";

// ✅ Context
import { useToast } from "../../context/ToastContext";

// ✅ Sub-components
import PaymentDetailModal from "./PaymentDetailModal";
import PaymentForm from "./PaymentForm";

// ... (Constants and Helpers remain the same)
const INITIAL_FILTERS = {
  search: "",
  type: "all",
  status: "all",
  method: "all",
  page: 1,
  limit: 10,
};
const PAYMENT_TYPES = { INCOME: "income", EXPENSE: "expense" };
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
  TYPE: { income: "success", expense: "danger" },
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

const PaymentsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError, showInfo, promise } = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localType, setLocalType] = useState("all");
  const [localStatus, setLocalStatus] = useState("all");
  const [localMethod, setLocalMethod] = useState("all");

  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    paymentId: null,
    paymentName: "",
    onConfirm: null,
  });

  const stats = calculateStats(payments);
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.method !== "all";

  useEffect(() => {
    if (isFilterOpen) {
      setLocalType(filters.type);
      setLocalStatus(filters.status);
      setLocalMethod(filters.method);
    }
  }, [isFilterOpen, filters]);

  const handleApplyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      type: localType,
      status: localStatus,
      method: localMethod,
      page: 1,
    }));
    setIsFilterOpen(false);
    showSuccess(
      t("payments.notifications.filtersApplied") || "Filters applied"
    );
  };

  const handleResetLocalFilters = () => {
    setLocalType("all");
    setLocalStatus("all");
    setLocalMethod("all");
  };

  const handleClearAllFilters = () => {
    setFilters(INITIAL_FILTERS);
    showInfo(t("payments.notifications.filtersCleared"));
  };

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
  const showData =
    hasInitialLoad && (payments.length > 0 || (loading && totalCount > 0));

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
      let data =
        response?.data?.data?.payments ||
        response?.data?.payments ||
        response?.payments ||
        [];
      if (!Array.isArray(data)) data = [];

      // ✅ FIX: Robust Calculation
      const totalItems =
        response?.data?.data?.totalCount ||
        response?.pagination?.total ||
        data.length;
      const calculatedTotalPages = Math.ceil(totalItems / filters.limit);

      setPayments(data);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      setTotalCount(totalItems);
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

  // ✅ FIX: Client-Side Slicing Fallback
  const paginatedPayments = useMemo(() => {
    if (payments.length > filters.limit) {
      const startIndex = (filters.page - 1) * filters.limit;
      return payments.slice(startIndex, startIndex + filters.limit);
    }
    return payments;
  }, [payments, filters.page, filters.limit]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" && { page: 1 }),
    }));
  }, []);

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
      } catch (err) {}
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

  const tableColumns = [
    {
      header: t("payments.table.type"),
      accessor: "type",
      width: "10%",
      sortable: true,
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
      sortable: true,
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
      sortable: true,
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
      sortable: true,
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
      sortable: true,
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
            variant="outline"
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
            variant="outline"
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
                variant="outline"
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
            variant="outline"
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

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("payments.title")}
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {t("payments.subtitle")}{" "}
            {/*hasInitialLoad && totalCount > 0 &&` • ${t("payments.notifications.showingResults", { count: payments.length, total: totalCount })}`*/}
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

      {!showEmptyState && hasInitialLoad && (
        <div className="relative mb-6 z-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="w-full sm:max-w-md relative">
              <Input
                icon={Search}
                placeholder={t("payments.searchPlaceholder")}
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant={hasActiveFilters ? "primary" : "outline"}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 transition-all whitespace-nowrap ${isFilterOpen ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
              >
                <Filter className="w-4 h-4" />
                {t("payments.filters.advanced") || "Filters"}
                {hasActiveFilters && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                    !
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  icon={X}
                  onClick={handleClearAllFilters}
                  className="text-gray-500"
                >
                  {t("payments.filters.clearFilters")}
                </Button>
              )}
            </div>
          </div>
          {isFilterOpen && (
            <div className="mt-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t("payments.filters.options") || "Filter Options"}
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
                <Select
                  label={t("payments.table.type")}
                  value={localType}
                  onChange={(e) => setLocalType(e.target.value)}
                  options={[
                    { value: "all", label: "All Types" },
                    { value: "income", label: "Income" },
                    { value: "expense", label: "Expense" },
                  ]}
                  className="w-full"
                />
                <Select
                  label={t("payments.table.status")}
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value)}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "pending", label: "Pending" },
                    { value: "completed", label: "Completed" },
                  ]}
                  className="w-full"
                />
                <Select
                  label={t("payments.table.method") || "Method"}
                  value={localMethod}
                  onChange={(e) => setLocalMethod(e.target.value)}
                  options={[
                    { value: "all", label: "All Methods" },
                    { value: "cash", label: "Cash" },
                    { value: "card", label: "Card" },
                    { value: "transfer", label: "Transfer" },
                    { value: "check", label: "Check" },
                  ]}
                  className="w-full"
                />
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetLocalFilters}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  {t("payments.filters.reset") || "Reset"}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="px-6"
                >
                  {t("payments.filters.apply") || "Apply Filters"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex flex-col relative">
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
            <OrbitLoader />
            <p className="text-gray-500 dark:text-gray-400">
              {t("common.loading", "Loading...")}
            </p>
          </div>
        )}
        {showData && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table
              columns={tableColumns}
              // ✅ Pass sliced data
              data={paginatedPayments}
              loading={loading}
              emptyMessage={t("payments.table.empty")}
              onRowClick={(row) => {
                setSelectedPayment(row);
                setIsDetailModalOpen(true);
              }}
              striped
              hoverable
              pagination={true}
              currentPage={filters.page}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={filters.limit}
              onPageChange={(page) => updateFilter("page", page)}
              onPageSizeChange={(newSize) => {
                updateFilter("limit", newSize);
                updateFilter("page", 1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>
        )}
        {showNoResults && (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("payments.table.noResults")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              {t("payments.filters.noResultsDesc")}
            </p>
            <Button onClick={handleClearAllFilters} variant="outline" icon={X}>
              {t("payments.filters.clearFilters")}
            </Button>
          </div>
        )}
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
              icon={<Plus className="size-4" />}
              className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
            >
              {t("payments.recordFirstPayment")}
            </Button>
          </div>
        )}
      </div>

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
