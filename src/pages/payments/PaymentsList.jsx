import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import { paymentService } from "../../api/index";
import { DollarSign } from "../../components/icons/IconComponents";
import { Plus, Search, Filter, Eye, X, Edit, Trash2, RefreshCw, Download, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";
import PaymentDetails from "./PaymentDetail";
import PaymentForm from "./PaymentForm";
import Badge from "../../components/common/Badge";
import { toast } from "react-hot-toast";

const PaymentsList = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Refund state
  const [refundData, setRefundData] = useState({
    amount: "",
    reason: "",
  });

  // Fetch payments
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
        "Failed to load payments. Please try again.";
      setError(errorMessage);
      setPayments([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, type, status, method, page, limit]);

  const handleDeletePayment = useCallback(
    async (paymentId) => {
      if (
        !paymentId ||
        !window.confirm("Are you sure you want to delete this payment?")
      ) {
        return;
      }

      try {
        await paymentService.delete(paymentId);
        toast.success("Payment deleted successfully");
        fetchPayments();
        if (selectedPayment?._id === paymentId) {
          setSelectedPayment(null);
          setIsDetailModalOpen(false);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete payment");
      }
    },
    [fetchPayments, selectedPayment]
  );

  const handleRefundPayment = useCallback(
    async (paymentId, refundData) => {
      try {
        if (!refundData.amount || parseFloat(refundData.amount) <= 0) {
          toast.error("Please enter a valid refund amount");
          return;
        }

        await paymentService.refund(paymentId, {
          refundAmount: parseFloat(refundData.amount),
          refundReason: refundData.reason,
        });

        toast.success("Payment refunded successfully");
        setIsRefundModalOpen(false);
        setSelectedPayment(null);
        setRefundData({ amount: "", reason: "" });
        fetchPayments();
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to refund payment");
      }
    },
    [fetchPayments]
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

  const handleViewPayment = useCallback((payment) => {
    setSelectedPayment(payment);
    setIsDetailModalOpen(true);
  }, []);

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
  }, [fetchPayments]);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setType("all");
    setStatus("all");
    setMethod("all");
    setPage(1);
  }, []);

  const handleExportCSV = useCallback(() => {
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
  }, [payments]);

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

  const hasActiveFilters = search.trim() !== "" || type !== "all" || status !== "all" || method !== "all";
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

  // Table columns configuration for the new Table component
  const columns = [
    {
      header: "Type",
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
            <span className="capitalize">{row.type}</span>
          </div>
        </Badge>
      ),
    },
    {
      header: "Description",
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
              Ref: {row.reference}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Client",
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
      header: "Date",
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
      header: "Method",
      accessor: "method",
      sortable: true,
      width: "12%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400 capitalize">
          {(row.method || "N/A").replace(/_/g, " ")}
        </div>
      ),
    },
    {
      header: "Amount",
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
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "10%",
      render: (row) => (
        <Badge color={getStatusBadgeColor(row.status)}>
          {row.status || "Unknown"}
        </Badge>
      ),
    },
    {
      header: "Actions",
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
            title="View Payment"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditPayment(row);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            title="Edit Payment"
          >
            <Edit className="h-4 w-4" />
          </button>
          {row.type === "income" &&
            ["completed", "paid"].includes((row.status || "").toLowerCase()) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefundClick(row);
                }}
                className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 p-1 rounded hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
                title="Refund Payment"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePayment(row._id);
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Delete Payment"
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Payments
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track all income and expense payments.{" "}
            {hasInitialLoad &&
              totalCount > 0 &&
              `Showing ${payments.length} of ${totalCount} payments`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchPayments}
            loading={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {totalCount > 0 && (
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
          {totalCount > 0 && (
            <Button
              variant="primary"
              onClick={handleAddPayment}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-800 dark:text-green-300">
                Total Income
              </div>
              <div className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalIncome)}
              </div>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-800 dark:text-red-300">
                Total Expenses
              </div>
              <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats.totalExpenses)}
              </div>
            </div>
            <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Net Amount
              </div>
              <div className={`mt-1 text-2xl font-bold ${
                stats.netAmount >= 0
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formatCurrency(stats.netAmount)}
              </div>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">
            Payment Status
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Completed
              </span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {stats.completedPayments}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Pending
              </span>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingPayments}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                Error Loading Payments
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
            <Button onClick={fetchPayments} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Search}
                placeholder="Search by description, reference, or client..."
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
                  { value: "all", label: "All Types" },
                  { value: "income", label: "Income" },
                  { value: "expense", label: "Expense" },
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
                  { value: "all", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "completed", label: "Completed" },
                  { value: "failed", label: "Failed" },
                  { value: "refunded", label: "Refunded" },
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
                  { value: "all", label: "All Methods" },
                  { value: "cash", label: "Cash" },
                  { value: "card", label: "Card" },
                  { value: "credit_card", label: "Credit Card" },
                  { value: "bank_transfer", label: "Bank Transfer" },
                  { value: "check", label: "Check" },
                  { value: "mobile_payment", label: "Mobile Payment" },
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
                Clear
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Active filters:</span>
              {search.trim() && (
                <Badge color="blue">Search: "{search.trim()}"</Badge>
              )}
              {type !== "all" && (
                <Badge color="green">Type: {type}</Badge>
              )}
              {status !== "all" && (
                <Badge color="purple">Status: {status}</Badge>
              )}
              {method !== "all" && (
                <Badge color="orange">Method: {method}</Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && !hasInitialLoad && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Loading payments...
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
              // Enable pagination
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
            No payments found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No payments match your current search or filter criteria.
          </p>
          <Button onClick={handleClearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Empty State - No payments at all */}
      {showEmptyState && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <DollarSign className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No payments yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by recording your first payment.
          </p>
          <Button onClick={handleAddPayment} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Record First Payment
          </Button>
        </div>
      )}

      {/* Payment Detail Modal */}
      {isDetailModalOpen && selectedPayment && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setSelectedPayment(null);
            setIsDetailModalOpen(false);
          }}
          title="Payment Details"
          size="lg"
        >
          <div className="p-6">
            <PaymentDetails payment={selectedPayment} />
          </div>
        </Modal>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setSelectedPayment(null);
            setIsFormOpen(false);
          }}
          title={selectedPayment ? "Edit Payment" : "Record New Payment"}
          size="lg"
        >
          <PaymentForm
            payment={selectedPayment}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setSelectedPayment(null);
              setIsFormOpen(false);
            }}
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
              <Button 
                variant="primary" 
                onClick={() => handleRefundPayment(selectedPayment._id, refundData)}
              >
                Confirm Refund
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentsList;