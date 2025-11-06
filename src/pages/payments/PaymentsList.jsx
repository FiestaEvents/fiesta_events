import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Pagination from "../../components/common/Pagination";
import { paymentService } from "../../api/index";
import { toast } from "react-hot-toast";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  RotateCcw,
} from "lucide-react";

const PaymentsList = () => {
  const navigate = useNavigate();

  // State
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Refund state
  const [refundData, setRefundData] = useState({
    amount: "",
    reason: "",
  });

  // Filters
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    method: "",
    startDate: "",
    endDate: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchTerm || undefined,
        type: filters.type || undefined,
        status: filters.status || undefined,
        method: filters.method || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: currentPage,
        limit,
      };

      const response = await paymentService.getAll(params);

      // API service handleResponse returns { payments: [], pagination: {} }
      const paymentsData = response?.payments || [];
      const paginationData = response?.pagination || {};

      setPayments(paymentsData);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.total || paymentsData.length);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Failed to load payments. Please try again.");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, currentPage]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Handlers
  const handleCreatePayment = () => {
    navigate("/payments/new");
  };

  const handleEditPayment = (payment) => {
    navigate(`/payments/${payment._id || payment.id}/edit`);
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (e, payment) => {
    e.stopPropagation();
    setDeleteId(payment._id || payment.id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await paymentService.delete(deleteId);
      toast.success("Payment deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      fetchPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error(error.message || "Failed to delete payment");
    }
  };

  const handleRefundClick = (e, payment) => {
    e.stopPropagation();
    setSelectedPayment(payment);
    setRefundData({
      amount: payment.amount.toString(),
      reason: "",
    });
    setIsRefundModalOpen(true);
  };

  const handleRefundConfirm = async () => {
    try {
      if (!refundData.amount || parseFloat(refundData.amount) <= 0) {
        toast.error("Please enter a valid refund amount");
        return;
      }

      await paymentService.refund(selectedPayment._id || selectedPayment.id, {
        refundAmount: parseFloat(refundData.amount),
        refundReason: refundData.reason,
      });

      toast.success("Payment refunded successfully");
      setIsRefundModalOpen(false);
      setSelectedPayment(null);
      setRefundData({ amount: "", reason: "" });
      fetchPayments();
    } catch (error) {
      console.error("Error refunding payment:", error);
      toast.error(error.message || "Failed to refund payment");
    }
  };

  const handleExportCSV = () => {
    if (!payments || payments.length === 0) {
      toast.error("No payments to export");
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

      toast.success("Payments exported successfully");
    } catch (error) {
      console.error("Error exporting payments:", error);
      toast.error("Failed to export payments");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      type: "",
      status: "",
      method: "",
      startDate: "",
      endDate: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tn-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("tn-TN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getClientName = (payment) => {
    if (payment.client?.name) return payment.client.name;
    if (payment.event?.clientId?.name) return payment.event.clientId.name;
    return "N/A";
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

  // Calculate statistics
  const stats = {
    totalIncome: payments
      .filter((p) => p.type === "income")
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    totalExpenses: payments
      .filter((p) => p.type === "expense")
      .reduce((sum, p) => sum + (p.amount || 0), 0),
    completedPayments: payments.filter((p) =>
      ["completed", "paid"].includes((p.status || "").toLowerCase())
    ).length,
    pendingPayments: payments.filter(
      (p) => (p.status || "").toLowerCase() === "pending"
    ).length,
  };

  stats.netAmount = stats.totalIncome - stats.totalExpenses;

  // Table columns
  const columns = [
    { key: "type", label: "Type" },
    { key: "description", label: "Description" },
    { key: "client", label: "Client" },
    { key: "date", label: "Date" },
    { key: "method", label: "Method" },
    { key: "amount", label: "Amount", sortable: true },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const tableData = payments.map((payment) => ({
    id: payment._id || payment.id,
    type: (
      <Badge variant={payment.type === "income" ? "success" : "danger"}>
        <div className="flex items-center gap-1">
          {payment.type === "income" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span className="capitalize">{payment.type}</span>
        </div>
      </Badge>
    ),
    description: (
      <div>
        <div className="font-medium text-gray-900 dark:text-white">
          {payment.description || "N/A"}
        </div>
        {payment.reference && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Ref: {payment.reference}
          </div>
        )}
      </div>
    ),
    client: (
      <span className="text-gray-700 dark:text-gray-300">
        {getClientName(payment)}
      </span>
    ),
    date: (
      <span className="text-gray-700 dark:text-gray-300">
        {formatDate(payment.paidDate || payment.createdAt)}
      </span>
    ),
    method: (
      <span className="text-gray-700 dark:text-gray-300 capitalize">
        {(payment.method || "N/A").replace(/_/g, " ")}
      </span>
    ),
    amount: (
      <span
        className={`font-semibold ${
          payment.type === "income"
            ? "text-green-600 dark:text-green-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {payment.type === "income" ? "+" : "-"}
        {formatCurrency(payment.amount)}
      </span>
    ),
    status: (
      <Badge variant={getStatusVariant(payment.status)}>
        {payment.status || "Unknown"}
      </Badge>
    ),
    actions: (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleViewPayment(payment)}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="View Payment"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleEditPayment(payment)}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Edit Payment"
        >
          <Edit className="w-4 h-4" />
        </button>
        {payment.type === "income" &&
          ["completed", "paid"].includes(
            (payment.status || "").toLowerCase()
          ) && (
            <button
              onClick={(e) => handleRefundClick(e, payment)}
              className="p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
              title="Refund Payment"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        <button
          onClick={(e) => handleDeleteClick(e, payment)}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete Payment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ),
  }));

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-8 h-8" />
            Payments
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
            Track all income and expense payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={fetchPayments}
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="outline" icon={Download} onClick={handleExportCSV}>
            Export
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleCreatePayment}>
            Add Payment
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="p-4 flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button onClick={fetchPayments} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Income
                </div>
                <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(stats.totalIncome)}
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Expenses
                </div>
                <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(stats.totalExpenses)}
                </div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Net Amount
                </div>
                <div
                  className={`mt-2 text-3xl font-bold ${
                    stats.netAmount >= 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {formatCurrency(stats.netAmount)}
                </div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Payment Status
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Completed
                </span>
                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                  {stats.completedPayments}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Pending
                </span>
                <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pendingPayments}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Search by description, reference, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </Select>

              <Select
                label="Method"
                value={filters.method}
                onChange={(e) => handleFilterChange("method", e.target.value)}
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="mobile_payment">Mobile Payment</option>
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

      {/* Payments Table */}
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : payments.length > 0 ? (
            <>
              <Table columns={columns} data={tableData} />
              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    pageSize={limit}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || Object.values(filters).some((v) => v)
                  ? "No payments found matching your search."
                  : "No payments found. Create your first payment to get started."}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Payment Detail Modal */}
      {isDetailModalOpen && selectedPayment && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedPayment(null);
          }}
          title="Payment Details"
          size="lg"
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <Badge
                  variant={
                    selectedPayment.type === "income" ? "success" : "danger"
                  }
                >
                  {selectedPayment.type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Status
                </p>
                <Badge variant={getStatusVariant(selectedPayment.status)}>
                  {selectedPayment.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Amount
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(selectedPayment.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Method
                </p>
                <p className="text-gray-900 dark:text-white capitalize">
                  {(selectedPayment.method || "N/A").replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                <p className="text-gray-900 dark:text-white">
                  {formatDate(
                    selectedPayment.paidDate || selectedPayment.createdAt
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Reference
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedPayment.reference || "—"}
                </p>
              </div>
            </div>
            {selectedPayment.description && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Description
                </p>
                <p className="text-gray-900 dark:text-white">
                  {selectedPayment.description}
                </p>
              </div>
            )}
            {selectedPayment.refundAmount > 0 && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-2">
                  Refund Information
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Amount:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatCurrency(selectedPayment.refundAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Date:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(selectedPayment.refundDate)}
                    </span>
                  </div>
                  {selectedPayment.refundReason && (
                    <div className="col-span-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Reason:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedPayment.refundReason}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedPayment(null);
                }}
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditPayment(selectedPayment);
                }}
              >
                Edit Payment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Refund Modal */}
      <Modal
        isOpen={isRefundModalOpen}
        onClose={() => {
          setIsRefundModalOpen(false);
          setSelectedPayment(null);
          setRefundData({ amount: "", reason: "" });
        }}
        title="Refund Payment"
        size="sm"
      >
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <Input
              label="Refund Amount"
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
              label="Reason (Optional)"
              value={refundData.reason}
              onChange={(e) =>
                setRefundData((prev) => ({ ...prev, reason: e.target.value }))
              }
              placeholder="Enter refund reason"
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
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRefundConfirm}>
              Confirm Refund
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteId(null);
        }}
        title="Delete Payment"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this payment? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteId(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentsList;
