import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Wallet,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  Download,
  DollarSign,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ API & Services
import { financeService } from "../../api/index";

// ✅ Generic Components & Utils
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Table from "../../components/common/NewTable";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import formatCurrency from "../../utils/formatCurrency";

// ✅ Hooks
import { useToast } from "../../hooks/useToast";

const Transactions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, apiError, showError } = useToast(); // Custom toast hook

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);

  // ✅ Helper: Strict DD/MM/YYYY format
  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("en-GB");
    } catch {
      return date;
    }
  };

  // Fetch transactions
  const fetchTransactions = useCallback(
    async (page = 1) => {
      try {
        setIsLoading(true);

        const params = {
          search: searchQuery || undefined,
          type: filters.type || undefined,
          category: filters.category || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          minAmount: filters.minAmount || undefined,
          maxAmount: filters.maxAmount || undefined,
          page,
          limit: pageSize,
        };

        // Remove undefined values
        Object.keys(params).forEach((key) => {
          if (params[key] === undefined) delete params[key];
        });

        const response = await financeService.getAll(params);

        const financeData = response?.finance || response?.data?.records || [];
        const paginationData = response?.pagination ||
          response?.data?.pagination || {
            page: page,
            pages: 1,
            total: financeData.length,
          };

        setTransactions(financeData);
        setPagination(paginationData);
      } catch (error) {
        apiError(error, t("transactions.errors.loadFailed"));
        setTransactions([]);
        setPagination({ page: 1, pages: 1, total: 0 });
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, filters, pageSize, t, apiError]
  );

  // Reset to page 1 when search or filters change
  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      type: "",
      category: "",
      startDate: "",
      endDate: "",
      minAmount: "",
      maxAmount: "",
    });
    setSearchQuery("");
  };

  const handleDelete = async () => {
    try {
      await financeService.delete(deleteModal.id);
      showSuccess(t("transactions.success.deleted"));
      setDeleteModal({ show: false, id: null });
      fetchTransactions(pagination.page);
    } catch (error) {
      apiError(error, t("transactions.errors.deleteFailed"));
    }
  };

  // CSV export
  const handleExport = () => {
    try {
      if (!transactions || transactions.length === 0) {
        showError(t("transactions.errors.noData"));
        return;
      }

      let csvContent =
        "Date,Description,Type,Category,Amount,Payment Method,Reference,Status\n";

      transactions.forEach((transaction) => {
        const date = formatDate(transaction.date);
        const description = (transaction.description || "").replace(/,/g, " ");
        const type = transaction.type || "";
        const category = (transaction.category || "").replace(/_/g, " ");
        const amount = transaction.amount || 0;
        const paymentMethod = (transaction.paymentMethod || "").replace(
          /_/g,
          " "
        );
        const reference = (transaction.reference || "").replace(/,/g, " ");
        const status = transaction.status || "";

        csvContent += `${date},"${description}",${type},"${category}",${amount},"${paymentMethod}","${reference}",${status}\n`;
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess(t("transactions.success.exported"));
    } catch (error) {
      console.error("Error exporting transactions:", error);
      showError(t("transactions.errors.exportFailed"));
    }
  };

  // Helper for badge variants
  const getTypeVariant = (type) => (type === "income" ? "success" : "danger");

  // Define table columns
  const columns = [
    {
      accessor: "date",
      header: t("transactions.table.date"),
      sortable: true,
      width: "12%",
      render: (row) => (
        <div className="text-sm text-gray-900 dark:text-white font-mono">
          {formatDate(row.date)}
        </div>
      ),
    },
    {
      accessor: "description",
      header: t("transactions.table.description"),
      width: "25%",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.description || t("transactions.table.noDescription")}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
            {t(`transactions.categories.${row.category}`) ||
              (row.category || "").replace(/_/g, " ")}
          </div>
        </div>
      ),
    },
    {
      accessor: "type",
      header: t("transactions.table.type"),
      width: "12%",
      render: (row) => (
        <Badge variant={getTypeVariant(row.type)} size="sm">
          <div className="flex items-center gap-1">
            {row.type === "income" ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="capitalize">
              {row.type === "income"
                ? t("transactions.filters.income")
                : t("transactions.filters.expense")}
            </span>
          </div>
        </Badge>
      ),
    },
    {
      accessor: "amount",
      header: t("transactions.table.amount"),
      sortable: true,
      width: "15%",
      render: (row) => (
        <div
          className={`font-bold ${row.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          {row.type === "income" ? "+" : "-"}
          {formatCurrency(Math.abs(row.amount || 0))}
        </div>
      ),
    },
    {
      accessor: "paymentMethod",
      header: t("transactions.table.paymentMethod"),
      width: "14%",
      render: (row) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
          {(row.paymentMethod || "").replace(/_/g, " ")}
        </span>
      ),
    },
    {
      accessor: "reference",
      header: t("transactions.table.reference"),
      width: "12%",
      render: (row) => (
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {row.reference || "-"}
        </span>
      ),
    },
    {
      accessor: "actions",
      header: t("transactions.table.actions"),
      width: "10%",
      className: "text-center",
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/finance/transactions/${row._id || row.id}`);
            }}
            className="text-gray-500 hover:text-blue-600"
          />
          <Button
            variant="outline"
            size="sm"
            icon={Edit}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/finance/transactions/${row._id || row.id}/edit`);
            }}
            className="text-gray-500 hover:text-orange-600"
          />
          <Button
            variant="outline"
            size="sm"
            icon={Trash2}
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ show: true, id: row._id || row.id });
            }}
            className="text-gray-500 hover:text-red-600"
          />
        </div>
      ),
    },
  ];

  // Calculate statistics
  const stats = useMemo(
    () => [
      {
        label: t("transactions.stats.totalIncome"),
        value: formatCurrency(
          transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + (t.amount || 0), 0)
        ),
        icon: TrendingUp,
        bgColor: "bg-green-50 dark:bg-green-900/20",
        iconColor: "text-green-600 dark:text-green-400",
      },
      {
        label: t("transactions.stats.totalExpenses"),
        value: formatCurrency(
          transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + (t.amount || 0), 0)
        ),
        icon: TrendingDown,
        bgColor: "bg-red-50 dark:bg-red-900/20",
        iconColor: "text-red-600 dark:text-red-400",
      },
      {
        label: t("transactions.stats.netAmount"),
        value: formatCurrency(
          transactions.reduce(
            (sum, t) =>
              t.type === "income"
                ? sum + (t.amount || 0)
                : sum - (t.amount || 0),
            0
          )
        ),
        icon: DollarSign,
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        iconColor: "text-blue-600 dark:text-blue-400",
      },
      {
        label: t("transactions.stats.totalTransactions"),
        value: transactions.length,
        icon: Wallet,
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        iconColor: "text-purple-600 dark:text-purple-400",
      },
    ],
    [transactions, t]
  );

  const categoryOptions = useMemo(
    () => [
      { value: "", label: t("transactions.filters.allCategories") },
      {
        value: "event_revenue",
        label: t("transactions.categories.event_revenue"),
      },
      {
        value: "partner_payment",
        label: t("transactions.categories.partner_payment"),
      },
      { value: "utilities", label: t("transactions.categories.utilities") },
      { value: "maintenance", label: t("transactions.categories.maintenance") },
      { value: "marketing", label: t("transactions.categories.marketing") },
      {
        value: "staff_salary",
        label: t("transactions.categories.staff_salary"),
      },
      { value: "equipment", label: t("transactions.categories.equipment") },
      { value: "insurance", label: t("transactions.categories.insurance") },
      { value: "taxes", label: t("transactions.categories.taxes") },
      { value: "other", label: t("transactions.categories.other") },
    ],
    [t]
  );

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("transactions.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t("transactions.description")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Download} onClick={handleExport}>
            {t("transactions.actions.export")}
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="size-4" />}
            onClick={() => navigate("/finance/transactions/new")}
          >
            {t("transactions.actions.addTransaction")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder={t("transactions.actions.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-gray-100 dark:bg-gray-700" : ""}
            >
              {t("transactions.actions.filters")}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label={t("transactions.filters.type")}
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                options={[
                  { value: "", label: t("transactions.filters.allTypes") },
                  { value: "income", label: t("transactions.filters.income") },
                  {
                    value: "expense",
                    label: t("transactions.filters.expense"),
                  },
                ]}
              />

              <Select
                label={t("transactions.filters.category")}
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                options={categoryOptions}
              />

              <Input
                label={t("transactions.filters.startDate")}
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />

              <Input
                label={t("transactions.filters.endDate")}
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                min={filters.startDate}
              />

              <Input
                label={t("transactions.filters.minAmount")}
                type="number"
                value={filters.minAmount}
                onChange={(e) =>
                  handleFilterChange("minAmount", e.target.value)
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                icon={DollarSign}
              />

              <Input
                label={t("transactions.filters.maxAmount")}
                type="number"
                value={filters.maxAmount}
                onChange={(e) =>
                  handleFilterChange("maxAmount", e.target.value)
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                icon={DollarSign}
              />

              <div className="flex items-end md:col-span-3">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400"
                >
                  {t("transactions.actions.clearFilters")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <Table
        columns={columns}
        data={transactions}
        loading={isLoading}
        emptyMessage={t("transactions.table.emptyMessage")}
        striped={true}
        hoverable={true}
        pagination={true}
        currentPage={pagination.page}
        totalPages={pagination.pages}
        pageSize={pageSize}
        totalItems={pagination.total}
        onPageChange={(page) => fetchTransactions(page)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          fetchTransactions(1);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        title={t("transactions.deleteModal.title")}
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertTriangle className="w-5 h-5" />
            <p className="font-medium">
              {t("transactions.deleteModal.warning") || "Are you sure?"}
            </p>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t("transactions.deleteModal.message")}
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ show: false, id: null })}
            >
              {t("transactions.actions.cancel")}
            </Button>
            <Button variant="danger" onClick={handleDelete} icon={Trash2}>
              {t("transactions.actions.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
