// src/pages/invoices/InvoicesPage.jsx
import {
  AlertCircle,
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";
import Card from "../../components/common/Card";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceService } from "../../api/index";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Pagination from "../../components/common/Pagination";
import Select from "../../components/common/Select";
import { useToast } from "../../context/ToastContext";
import formatCurrency from "../../utils/formatCurrency";

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();

  // State
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    invoiceId: null,
    invoiceName: "",
    onConfirm: null
  });

  // Invoice Type Toggle
  const [invoiceType, setInvoiceType] = useState("client");

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    client: "",
    partner: "",
    event: "",
    startDate: "",
    endDate: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Enhanced invoice data normalizer
  const normalizeInvoiceData = (invoice) => {
    if (!invoice || typeof invoice !== "object") {
      console.warn("Invalid invoice data:", invoice);
      return null;
    }

    // Extract recipient information based on invoice type
    let recipientName = "";
    let recipientEmail = "";
    let recipientCompany = "";
    let recipientPhone = "";

    if (invoice.invoiceType === "client") {
      recipientName = invoice.client?.name || invoice.recipientName || "Client";
      recipientEmail = invoice.client?.email || invoice.recipientEmail;
      recipientCompany = invoice.client?.company || invoice.recipientCompany;
      recipientPhone = invoice.client?.phone || invoice.recipientPhone;
    } else {
      recipientName =
        invoice.partner?.name || invoice.recipientName || "Partner";
      recipientEmail = invoice.partner?.email || invoice.recipientEmail;
      recipientCompany = invoice.partner?.company || invoice.recipientCompany;
      recipientPhone = invoice.partner?.phone || invoice.recipientPhone;
    }

    // Calculate if invoice is overdue
    const isOverdue =
      invoice.status === "sent" &&
      invoice.dueDate &&
      new Date(invoice.dueDate) < new Date();

    return {
      _id: invoice._id || invoice.id,
      invoiceNumber:
        invoice.invoiceNumber || `INV-${(invoice._id || "").substring(0, 8)}`,
      invoiceType: invoice.invoiceType || "client",
      recipientName,
      recipientEmail,
      recipientCompany,
      recipientPhone,
      recipientAddress:
        invoice.recipientAddress ||
        invoice.client?.address ||
        invoice.partner?.address,
      totalAmount: invoice.totalAmount || 0,
      subtotal: invoice.subtotal || 0,
      tax: invoice.tax || 0,
      taxRate: invoice.taxRate || 0,
      discount: invoice.discount || 0,
      discountType: invoice.discountType || "fixed",
      status: invoice.status || "draft",
      issueDate: invoice.issueDate || new Date().toISOString(),
      dueDate:
        invoice.dueDate ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      sentAt: invoice.sentAt,
      paidAt: invoice.paidAt,
      items: invoice.items || [],
      notes: invoice.notes || "",
      terms: invoice.terms || "",
      currency: invoice.currency || "TND",
      paymentMethod: invoice.paymentMethod || "cash",
      paymentStatus: invoice.paymentStatus || {
        amountPaid: invoice.amountPaid || 0,
        amountDue: invoice.amountDue || invoice.totalAmount || 0,
        lastPaymentDate: invoice.lastPaymentDate,
      },
      event: invoice.event || null,
      isOverdue,
      createdAt: invoice.createdAt || new Date().toISOString(),
      updatedAt: invoice.updatedAt || new Date().toISOString(),
    };
  };

  // Fetch invoice statistics
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await invoiceService.getStats({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        invoiceType: invoiceType,
      });

      // Handle stats array format from backend
      const statsArray = response?.stats || response?.data?.stats || [];
      const typeStats = statsArray.find((s) => s._id === invoiceType) || {
        totalInvoices: 0,
        totalRevenue: 0,
        totalPaid: 0,
        totalDue: 0,
        draft: 0,
        sent: 0,
        paid: 0,
        partial: 0,
        overdue: 0,
        cancelled: 0,
      };

      setStats(typeStats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      showError("Failed to load invoice statistics");
    } finally {
      setStatsLoading(false);
    }
  }, [filters.startDate, filters.endDate, invoiceType, showError]);

  // Fetch invoices with enhanced data validation
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchTerm || undefined,
        invoiceType: invoiceType,
        status: filters.status || undefined,
        client:
          invoiceType === "client" ? filters.client || undefined : undefined,
        partner:
          invoiceType === "partner" ? filters.partner || undefined : undefined,
        event: filters.event || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: currentPage,
        limit: pageSize,
        sort: "-createdAt",
      };

      console.log("Fetching invoices with params:", params);
      const response = await invoiceService.getAll(params);

      // Handle response structure and validate data
      let invoicesData = response?.invoices || response?.data?.invoices || [];

      console.log("Raw invoices data:", invoicesData);

      // Normalize and validate invoice data
      invoicesData = invoicesData
        .map(normalizeInvoiceData)
        .filter((invoice) => invoice !== null);

      const paginationData = response?.pagination ||
        response?.data?.pagination || {
          current: currentPage,
          pages: 1,
          total: invoicesData.length,
        };

      console.log("Normalized invoices:", invoicesData);
      setInvoices(invoicesData);
      setTotalPages(paginationData.pages || paginationData.totalPages || 1);
      setTotalItems(paginationData.total || invoicesData.length);
      setHasInitialLoad(true);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      const errorMessage = error.message || "Failed to load invoices. Please try again.";
      setError(errorMessage);
      showError(errorMessage);
      setInvoices([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, currentPage, pageSize, invoiceType, showError]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Reset to page 1 when invoice type changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedRows([]);
  }, [invoiceType]);

  // Show confirmation modal
  const showDeleteConfirmation = useCallback((invoiceId, invoiceName = "Invoice") => {
    setConfirmationModal({
      isOpen: true,
      invoiceId,
      invoiceName,
      onConfirm: () => handleDeleteConfirm(invoiceId, invoiceName)
    });
  }, []);

  // Close confirmation modal
  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({
      isOpen: false,
      invoiceId: null,
      invoiceName: "",
      onConfirm: null
    });
  }, []);

  // Handle confirmed deletion
  const handleDeleteConfirm = useCallback(async (invoiceId, invoiceName = "Invoice") => {
    if (!invoiceId) {
      showError("Invalid invoice ID");
      return;
    }

    try {
      // Use the promise toast for loading state
      await promise(
        invoiceService.delete(invoiceId),
        {
          loading: `Deleting ${invoiceName}...`,
          success: `${invoiceName} deleted successfully`,
          error: `Failed to delete ${invoiceName}`
        }
      );

      // Refresh the invoices list
      fetchInvoices();
      fetchStats();
      
      // Close detail modal if the deleted invoice is currently selected
      if (selectedInvoice?._id === invoiceId) {
        setSelectedInvoice(null);
        setIsDetailModalOpen(false);
      }
      
      // Close confirmation modal
      closeConfirmationModal();
    } catch (err) {
      // Error is already handled by the promise toast
      console.error("Delete invoice error:", err);
      closeConfirmationModal();
    }
  }, [fetchInvoices, fetchStats, selectedInvoice, promise, showError, closeConfirmationModal]);

  // Updated invoice deletion handler
  const handleDeleteClick = useCallback((invoiceId, invoiceName = "Invoice") => {
    showDeleteConfirmation(invoiceId, invoiceName);
  }, [showDeleteConfirmation]);

  // Safe render helper function with fallback values
  const safeRender = (renderFunction, row, fallback = "-") => {
    if (!row || typeof row !== "object") {
      return fallback;
    }

    try {
      const result = renderFunction(row);
      // Check if the result is empty or undefined
      if (result === null || result === undefined || result === "") {
        return fallback;
      }
      return result;
    } catch (error) {
      console.error("Error rendering table cell:", error, row);
      return fallback;
    }
  };

  // Handlers
  const handleCreateInvoice = () => {
    navigate(`/invoices/new?type=${invoiceType}`);
  };

  const handleEditInvoice = (invoice) => {
    if (!invoice || !invoice._id) {
      showError("Invalid invoice data");
      return;
    }
    navigate(`/invoices/${invoice._id}/edit`);
  };

  const handleViewInvoice = async (invoice) => {
    if (!invoice || !invoice._id) {
      showError("Invalid invoice data");
      return;
    }

    try {
      const response = await invoiceService.getById(invoice._id);
      const invoiceData =
        response?.invoice || response?.data?.invoice || response?.data;
      setSelectedInvoice(normalizeInvoiceData(invoiceData) || invoice);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      showError("Failed to load invoice details");
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleCancelClick = (invoice) => {
    if (!invoice || !invoice._id) {
      showError("Invalid invoice data");
      return;
    }
    setSelectedInvoice(invoice);
    setIsCancelModalOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedInvoice || !selectedInvoice._id) return;

    try {
      await promise(
        invoiceService.cancel(selectedInvoice._id, cancelReason),
        {
          loading: "Cancelling invoice...",
          success: "Invoice cancelled successfully",
          error: "Failed to cancel invoice"
        }
      );
      setIsCancelModalOpen(false);
      setSelectedInvoice(null);
      setCancelReason("");
      fetchInvoices();
      fetchStats();
    } catch (err) {
      // Error is already handled by the promise toast
      console.error("Cancel invoice error:", err);
    }
  };

  const handleSendInvoice = async (invoice) => {
    if (!invoice || !invoice._id) {
      showError("Invalid invoice data");
      return;
    }

    try {
      await promise(
        invoiceService.send(invoice._id, {
          message:
            "Please find your invoice attached. Payment is due by the date specified.",
        }),
        {
          loading: "Sending invoice...",
          success: "Invoice sent successfully",
          error: "Failed to send invoice"
        }
      );
      fetchInvoices();
      fetchStats();
    } catch (err) {
      // Error is already handled by the promise toast
      console.error("Send invoice error:", err);
    }
  };

  const handleMarkAsPaid = async (invoice) => {
    if (!invoice || !invoice._id) {
      showError("Invalid invoice data");
      return;
    }

    try {
      await promise(
        invoiceService.markAsPaid(invoice._id, {
          paymentMethod: "cash",
        }),
        {
          loading: "Marking invoice as paid...",
          success: "Invoice marked as paid",
          error: "Failed to mark invoice as paid"
        }
      );
      fetchInvoices();
      fetchStats();
    } catch (err) {
      // Error is already handled by the promise toast
      console.error("Mark as paid error:", err);
    }
  };

  const handleDownloadInvoice = async (invoice) => {
    if (!invoice || !invoice._id) {
      showError("Invalid invoice data");
      return;
    }

    try {
      const blob = await promise(
        invoiceService.download(invoice._id),
        {
          loading: "Generating PDF...",
          success: "Invoice downloaded successfully",
          error: "Failed to download invoice"
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber || "document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Error is already handled by the promise toast
      console.error("Download invoice error:", err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      status: "",
      client: "",
      partner: "",
      event: "",
      startDate: "",
      endDate: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
    showInfo("Filters cleared");
  };

  const handleRetry = useCallback(() => {
    fetchInvoices();
    showInfo("Retrying to load invoices...");
  }, [fetchInvoices, showInfo]);

  const handleBulkSend = async () => {
    if (selectedRows.length === 0) {
      showError("Please select invoices to send");
      return;
    }

    try {
      const promises = selectedRows.map((id) =>
        invoiceService.send(id).catch((err) => {
          console.error(`Failed to send invoice ${id}:`, err);
          return null;
        })
      );

      await promise(
        Promise.all(promises),
        {
          loading: `Sending ${selectedRows.length} invoice(s)...`,
          success: `Sent ${selectedRows.length} invoice(s) successfully`,
          error: "Failed to send some invoices"
        }
      );
      setSelectedRows([]);
      fetchInvoices();
      fetchStats();
    } catch (err) {
      // Error is already handled by the promise toast
      console.error("Bulk send error:", err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Enhanced table columns configuration with improved action buttons
  const columns = [
    {
      accessor: "invoiceNumber",
      header: "Invoice #",
      sortable: true,
      width: "15%",
      render: (row) =>
        safeRender(
          (row) => (
            <div className="font-medium text-gray-900 dark:text-white">
              {row.invoiceNumber || `INV-${(row._id || "").substring(0, 8)}`}
            </div>
          ),
          row,
          "No Number"
        ),
    },
    {
      accessor: "recipientName",
      header: invoiceType === "client" ? "Client" : "Partner",
      sortable: true,
      width: "25%",
      render: (row) =>
        safeRender(
          (row) => (
            <div className="min-w-0">
              <p className="text-gray-900 dark:text-white font-medium">
                {row.recipientName || "No Recipient"}
              </p>
              {row.recipientEmail && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {row.recipientEmail}
                </p>
              )}
              {row.recipientCompany && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {row.recipientCompany}
                </p>
              )}
            </div>
          ),
          row,
          "No Recipient"
        ),
    },
    {
      accessor: "issueDate",
      header: "Issue Date",
      sortable: true,
      width: "12%",
      render: (row) =>
        safeRender(
          (row) => (
            <div className="text-gray-600 dark:text-gray-400">
              {row.issueDate
                ? new Date(row.issueDate).toLocaleDateString()
                : "-"}
            </div>
          ),
          row
        ),
    },
    {
      accessor: "dueDate",
      header: "Due Date",
      sortable: true,
      width: "12%",
      render: (row) =>
        safeRender(
          (row) => (
            <div className="text-gray-600 dark:text-gray-400">
              {row.dueDate ? new Date(row.dueDate).toLocaleDateString() : "-"}
            </div>
          ),
          row
        ),
    },
    {
      accessor: "totalAmount",
      header: "Amount",
      sortable: true,
      width: "12%",
      render: (row) =>
        safeRender(
          (row) => (
            <div className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(row.totalAmount)}
            </div>
          ),
          row
        ),
    },
    {
      accessor: "status",
      header: "Status",
      sortable: true,
      width: "12%",
      render: (row) =>
        safeRender(
          (row) => (
            <Badge
              color={
                row.status === "paid"
                  ? "green"
                  : row.status === "sent"
                    ? "blue"
                    : row.status === "partial"
                      ? "yellow"
                      : row.status === "overdue"
                        ? "red"
                        : row.status === "cancelled"
                          ? "gray"
                          : "orange"
              }
            >
              {row.status
                ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
                : "Draft"}
            </Badge>
          ),
          row
        ),
    },
    {
      header: "Actions",
      accessor: "actions",
      width: "15%", // Increased width to accommodate more actions
      className: "text-center",
      render: (row) => {
        if (!row || !row._id) return <span className="text-gray-400">-</span>;

        // Determine which actions are available based on invoice status
        const canEdit = ["draft", "sent", "partial", "overdue"].includes(
          row.status
        );
        const canDelete =
          ["draft"].includes(row.status) ||
          (row.status === "sent" && row.paymentStatus?.amountPaid === 0);
        const canSend = row.status === "draft";
        const canMarkPaid = ["sent", "partial", "overdue"].includes(row.status);

        return (
          <div className="flex justify-center gap-1 pl-2">
            {/* View Action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewInvoice(row);
              }}
              className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
              title="View Invoice"
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Edit Action - Now always visible for editable statuses */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditInvoice(row);
              }}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              title="Edit Invoice"
            >
              <Edit className="h-4 w-4" />
            </button>

            {/* Download Action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadInvoice(row);
              }}
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </button>

            {/* Send Action */}
            {canSend && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendInvoice(row);
                }}
                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 p-1 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                title="Send Invoice"
              >
                <Send className="h-4 w-4" />
              </button>
            )}

            {/* Mark as Paid Action */}
            {canMarkPaid && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAsPaid(row);
                }}
                className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"
                title="Mark as Paid"
              >
                <Check className="h-4 w-4" />
              </button>
            )}

            {/* Delete Action */}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row._id, row.invoiceNumber || "Invoice");
                }}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                title="Delete Invoice"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  // Helper variables for empty states
  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    Object.values(filters).some((value) => value !== "");
  const showEmptyState =
    !loading &&
    !error &&
    invoices.length === 0 &&
    !hasActiveFilters &&
    hasInitialLoad;
  const showNoResults =
    !loading &&
    !error &&
    invoices.length === 0 &&
    hasActiveFilters &&
    hasInitialLoad;

  if (loading && !hasInitialLoad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="p-6 bg-white space-y-6 dark:bg-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Invoices
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {invoiceType === "client"
              ? "Manage client invoices and receivables"
              : "Manage partner bills and payables"}
          </p>
        </div>
        {invoices.length > 0 && (
          <div className="flex items-center gap-3">
            {selectedRows.length > 0 && (
              <Button
                variant="outline"
                icon={Mail}
                onClick={handleBulkSend}
                loading={loading}
              >
                Send Selected ({selectedRows.length})
              </Button>
            )}

            <Button variant="primary" icon={Plus} onClick={handleCreateInvoice}>
              <Plus className="w-4 h-4 mr-2" />
              Create {invoiceType === "client" ? "Invoice" : "Bill"}
            </Button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                Error Loading Invoices
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
            <Button onClick={handleRetry} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Invoice Type Toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setInvoiceType("client")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              invoiceType === "client"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Client Invoices</span>
            {invoiceType === "client" && stats && (
              <Badge variant="white" className="ml-2">
                {stats.totalInvoices}
              </Badge>
            )}
          </button>

          <button
            onClick={() => setInvoiceType("partner")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              invoiceType === "partner"
                ? "bg-orange-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Partner Bills</span>
            {invoiceType === "partner" && stats && (
              <Badge variant="white" className="ml-2">
                {stats.totalInvoices}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {invoiceType === "client"
                    ? "Total Revenue"
                    : "Total Expenses"}
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    formatCurrency(stats?.totalRevenue || 0)
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {stats?.totalInvoices || 0} invoices
                </div>
              </div>
              <div
                className={`p-3 rounded-lg ${
                  invoiceType === "client"
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-purple-50 dark:bg-purple-900/20"
                }`}
              >
                <DollarSign
                  className={`w-6 h-6 ${
                    invoiceType === "client"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-purple-600 dark:text-purple-400"
                  }`}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Paid
                </div>
                <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                  {statsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    stats?.paid || 0
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(stats?.totalPaid || 0)}
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending
                </div>
                <div className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {statsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    (stats?.sent || 0) + (stats?.partial || 0)
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(stats?.totalDue || 0)} due
                </div>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overdue
                </div>
                <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                  {statsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    stats?.overdue || 0
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Needs attention
                </div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      {invoices.length > 0 && (
        <div className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search Bar and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  icon={Search}
                  placeholder={`Search by invoice number, ${invoiceType === "client" ? "client" : "partner"} name, or email...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                icon={showFilters ? ChevronUp : ChevronDown}
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                {showFilters ? "Hide" : "Show"} Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="primary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Expandable Filter Panel */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Select
                    label="Status"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
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
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    min={filters.startDate}
                  />

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      icon={X}
                      onClick={handleClearFilters}
                      className="w-full"
                      disabled={activeFiltersCount === 0}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !hasInitialLoad && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Loading invoices...
          </p>
        </div>
      )}

      {/* Table Section */}
      {!loading && hasInitialLoad && invoices.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={invoices}
              loading={loading}
              emptyMessage={
                searchTerm || filters.status
                  ? "No invoices found matching your search."
                  : `No ${invoiceType} invoices found. Create your first ${invoiceType === "client" ? "invoice" : "bill"} to get started.`
              }
              onRowClick={handleViewInvoice}
              selectable={true}
              onSelectionChange={setSelectedRows}
              selectedRows={selectedRows}
              striped={true}
              hoverable={true}
              pagination={true}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[10, 25, 50, 100]}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(newLimit) => {
                  setPageSize(newLimit);
                  setCurrentPage(1);
                }}
                totalItems={totalItems}
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
            No invoices found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No invoices match your current search or filter criteria.
          </p>
          <Button onClick={handleClearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Empty State - No invoices at all */}
      {showEmptyState && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No invoices yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by creating your first{" "}
            {invoiceType === "client" ? "invoice" : "bill"}.
          </p>
          <Button onClick={handleCreateInvoice} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Create First {invoiceType === "client" ? "Invoice" : "Bill"}
          </Button>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {isDetailModalOpen && selectedInvoice && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
          title="Invoice Details"
          size="lg"
        >
          <div className="p-6 space-y-6">
            {/* Invoice Header */}
            <div className="flex items-start justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Invoice #{selectedInvoice.invoiceNumber}
                  </h3>
                  <Badge
                    variant={
                      selectedInvoice.invoiceType === "client"
                        ? "info"
                        : "purple"
                    }
                    className="ml-2"
                  >
                    {selectedInvoice.invoiceType === "client" ? (
                      <>
                        <Users className="w-3 h-3 mr-1" /> Client
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-3 h-3 mr-1" /> Partner
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Issued: {formatDate(selectedInvoice.issueDate)}
                </p>
                {selectedInvoice.sentAt && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Sent: {formatDate(selectedInvoice.sentAt)}
                  </p>
                )}
              </div>
              <Badge
                color={
                  selectedInvoice.status === "paid"
                    ? "green"
                    : selectedInvoice.status === "sent"
                      ? "blue"
                      : selectedInvoice.status === "partial"
                        ? "yellow"
                        : selectedInvoice.status === "overdue"
                          ? "red"
                          : selectedInvoice.status === "cancelled"
                            ? "gray"
                            : "orange"
                }
                size="lg"
              >
                {selectedInvoice.status || "Draft"}
              </Badge>
            </div>

            {/* Recipient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedInvoice.invoiceType === "client"
                    ? "Bill To:"
                    : "Pay To:"}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  {selectedInvoice.recipientName}
                </p>
                {selectedInvoice.recipientCompany && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedInvoice.recipientCompany}
                  </p>
                )}
                {selectedInvoice.recipientEmail && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedInvoice.recipientEmail}
                  </p>
                )}
                {selectedInvoice.recipientPhone && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedInvoice.recipientPhone}
                  </p>
                )}
                {selectedInvoice.recipientAddress && (
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {selectedInvoice.recipientAddress.street && (
                      <p>{selectedInvoice.recipientAddress.street}</p>
                    )}
                    {(selectedInvoice.recipientAddress.city ||
                      selectedInvoice.recipientAddress.state) && (
                      <p>
                        {selectedInvoice.recipientAddress.city}
                        {selectedInvoice.recipientAddress.state &&
                          `, ${selectedInvoice.recipientAddress.state}`}
                        {selectedInvoice.recipientAddress.zipCode &&
                          ` ${selectedInvoice.recipientAddress.zipCode}`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Invoice Details:
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Due Date:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(selectedInvoice.dueDate)}
                    </span>
                  </div>
                  {selectedInvoice.event && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Event:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedInvoice.event.title}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.currency && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Currency:
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedInvoice.currency}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Items
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                          Description
                        </th>
                        <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                          Rate
                        </th>
                        <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {item.description || "No description"}
                              </p>
                              {item.category && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {item.category.replace(/_/g, " ")}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                            {item.quantity || 1}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                            {formatCurrency(item.rate)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(selectedInvoice.subtotal || 0)}
                    </span>
                  </div>
                  {selectedInvoice.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tax{" "}
                        {selectedInvoice.taxRate
                          ? `(${selectedInvoice.taxRate}%)`
                          : ""}
                        :
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(selectedInvoice.tax)}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Discount:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        -{formatCurrency(selectedInvoice.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </span>
                  </div>
                  {selectedInvoice.paymentStatus?.amountPaid > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Amount Paid:</span>
                        <span>
                          {formatCurrency(
                            selectedInvoice.paymentStatus.amountPaid
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900 dark:text-white">
                          Amount Due:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {formatCurrency(
                            selectedInvoice.paymentStatus.amountDue
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(selectedInvoice.notes || selectedInvoice.terms) && (
              <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                {selectedInvoice.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Notes
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedInvoice.notes}
                    </p>
                  </div>
                )}
                {selectedInvoice.terms && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Terms & Conditions
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedInvoice.terms}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={handleCloseModal}>
                Close
              </Button>
              <Button
                variant="outline"
                icon={Download}
                onClick={() => handleDownloadInvoice(selectedInvoice)}
              >
                Download PDF
              </Button>
              {selectedInvoice.status === "draft" && (
                <>
                  <Button
                    variant="outline"
                    icon={Edit}
                    onClick={() => {
                      handleEditInvoice(selectedInvoice);
                      handleCloseModal();
                    }}
                  >
                    Edit Invoice
                  </Button>
                  <Button
                    variant="primary"
                    icon={Send}
                    onClick={() => {
                      handleSendInvoice(selectedInvoice);
                      handleCloseModal();
                    }}
                  >
                    Send Invoice
                  </Button>
                </>
              )}
              {(selectedInvoice.status === "sent" ||
                selectedInvoice.status === "partial" ||
                selectedInvoice.status === "overdue") && (
                <>
                  <Button
                    variant="outline"
                    icon={Edit}
                    onClick={() => {
                      handleEditInvoice(selectedInvoice);
                      handleCloseModal();
                    }}
                  >
                    Edit Invoice
                  </Button>
                  <Button
                    variant="success"
                    icon={Check}
                    onClick={() => {
                      handleMarkAsPaid(selectedInvoice);
                      handleCloseModal();
                    }}
                  >
                    Mark as Paid
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        title="Confirm Deletion"
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
                Delete Invoice
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <strong>"{confirmationModal.invoiceName}"</strong>? 
                This action cannot be undone and all associated data will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeConfirmationModal}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmationModal.onConfirm}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Invoice
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Cancel Invoice Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedInvoice(null);
          setCancelReason("");
        }}
        title="Cancel Invoice"
        size="md"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Are you sure you want to cancel this invoice?
          </p>
          <Input
            label="Cancellation Reason (optional)"
            type="textarea"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Provide a reason for cancellation..."
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelModalOpen(false);
                setSelectedInvoice(null);
                setCancelReason("");
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleCancelConfirm}>
              Cancel Invoice
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoicesPage;