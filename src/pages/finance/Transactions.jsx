import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { financeService } from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import Pagination from "../../components/common/Pagination";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
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
} from "lucide-react";
import { toast } from "react-hot-toast";

const Transactions = () => {
  const navigate = useNavigate();
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

  // FIXED: Manual state management instead of useApiList
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch transactions
  const fetchTransactions = async (page = 1) => {
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
        limit: 10,
      };

      const response = await financeService.getAll(params);

      // API service handleResponse returns { finance: [], pagination: {} }
      const financeData = response?.finance || [];
      const paginationData = response?.pagination || {
        page: 1,
        pages: 1,
        total: 0,
      };

      setTransactions(financeData);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error(error.message || "Failed to load transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchQuery, filters]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

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
      toast.success("Transaction deleted successfully");
      setDeleteModal({ show: false, id: null });
      fetchTransactions(pagination.page);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error(error.message || "Failed to delete transaction");
    }
  };

  // FIXED: Client-side CSV export
  const handleExport = async () => {
    try {
      if (!transactions || transactions.length === 0) {
        toast.error("No transactions to export");
        return;
      }

      // Generate CSV content
      let csvContent =
        "Date,Description,Type,Category,Amount,Payment Method,Reference,Status\n";

      transactions.forEach((transaction) => {
        const date = new Date(transaction.date).toLocaleDateString();
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

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Transactions exported successfully");
    } catch (error) {
      console.error("Error exporting transactions:", error);
      toast.error("Failed to export transactions");
    }
  };

  // FIXED: Return variant name, not color
  const getTypeVariant = (type) => {
    return type === "income" ? "success" : "danger";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tn-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("tn-TN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "type",
      label: "Type",
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
    },
    {
      key: "paymentMethod",
      label: "Payment Method",
    },
    {
      key: "reference",
      label: "Reference",
    },
    {
      key: "actions",
      label: "Actions",
    },
  ];

  const tableData = transactions.map((transaction) => ({
    id: transaction._id || transaction.id,
    date: (
      <div className="text-sm text-gray-900 dark:text-white">
        {formatDate(transaction.date)}
      </div>
    ),
    description: (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">
          {transaction.description}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {(transaction.category || "").replace(/_/g, " ")}
        </div>
      </div>
    ),
    type: (
      <Badge variant={getTypeVariant(transaction.type)}>
        <div className="flex items-center gap-1">
          {transaction.type === "income" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span className="capitalize">{transaction.type}</span>
        </div>
      </Badge>
    ),
    amount: (
      <div
        className={`font-semibold ${
          transaction.type === "income"
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {transaction.type === "income" ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </div>
    ),
    paymentMethod: (
      <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
        {(transaction.paymentMethod || "").replace(/_/g, " ")}
      </span>
    ),
    reference: (
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {transaction.reference || "-"}
      </span>
    ),
    actions: (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() =>
            navigate(
              `/finance/transactions/${transaction._id || transaction.id}`
            )
          }
        />
        <Button
          variant="ghost"
          size="sm"
          icon={Edit}
          onClick={() =>
            navigate(
              `/finance/transactions/${transaction._id || transaction.id}/edit`
            )
          }
        />
        <Button
          variant="ghost"
          size="sm"
          icon={Trash2}
          onClick={() =>
            setDeleteModal({
              show: true,
              id: transaction._id || transaction.id,
            })
          }
        />
      </div>
    ),
  }));

  // Calculate statistics
  const stats =
    transactions.length > 0
      ? [
          {
            label: "Total Income",
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
            label: "Total Expenses",
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
            label: "Net Amount",
            value: formatCurrency(
              transactions.reduce((sum, t) => {
                return t.type === "income"
                  ? sum + (t.amount || 0)
                  : sum - (t.amount || 0);
              }, 0)
            ),
            icon: DollarSign,
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            iconColor: "text-blue-600 dark:text-blue-400",
          },
          {
            label: "Total Transactions",
            value: transactions.length,
            icon: Wallet,
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            iconColor: "text-purple-600 dark:text-purple-400",
          },
        ]
      : [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage all financial transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Download} onClick={handleExport}>
            Export
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate("/finance/transactions/new")}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
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
              </Card>
            );
          })}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              {/* FIXED: Typo - Input not Inputes */}
              <Input
                icon={Search}
                placeholder="Search by description, category, or reference..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Type"
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              >
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Select>

              <Select
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="event_revenue">Event Revenue</option>
                <option value="partner_payment">Partner Payment</option>
                <option value="utilities">Utilities</option>
                <option value="maintenance">Maintenance</option>
                <option value="marketing">Marketing</option>
                <option value="staff_salary">Staff Salary</option>
                <option value="equipment">Equipment</option>
                <option value="insurance">Insurance</option>
                <option value="taxes">Taxes</option>
                <option value="other">Other</option>
              </Select>

              <Input
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
              />

              <Input
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                min={filters.startDate}
              />

              <Input
                label="Min Amount"
                type="number"
                value={filters.minAmount}
                onChange={(e) =>
                  handleFilterChange("minAmount", e.target.value)
                }
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <Input
                label="Max Amount"
                type="number"
                value={filters.maxAmount}
                onChange={(e) =>
                  handleFilterChange("maxAmount", e.target.value)
                }
                placeholder="0.00"
                min="0"
                step="0.01"
              />

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : transactions && transactions.length > 0 ? (
            <>
              <Table columns={columns} data={tableData} />
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  totalItems={pagination.total}
                  pageSize={10}
                  onPageChange={(page) => fetchTransactions(page)}
                />
              </div>
            </>
          ) : (
            <EmptyState
              icon={Wallet}
              title="No transactions found"
              description="Get started by adding your first transaction"
              action={{
                label: "Add Transaction",
                onClick: () => navigate("/finance/transactions/new"),
              }}
            />
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, id: null })}
        title="Delete Transaction"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this transaction? This action cannot
            be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ show: false, id: null })}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
