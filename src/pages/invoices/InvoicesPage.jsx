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
import { useTranslation } from "react-i18next"; // Add this import

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const { t } = useTranslation(); // Add translation hook

  // State
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
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
      recipientName = invoice.client?.name || invoice.recipientName || t("invoices.recipient.client");
      recipientEmail = invoice.client?.email || invoice.recipientEmail;
      recipientCompany = invoice.client?.company || invoice.recipientCompany;
      recipientPhone = invoice.client?.phone || invoice.recipientPhone;
    } else {
      recipientName = invoice.partner?.name || invoice.recipientName || t("invoices.recipient.partner");
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
      invoiceNumber: invoice.invoiceNumber || `INV-${(invoice._id || "").substring(0, 8)}`,
      invoiceType: invoice.invoiceType || "client",
      recipientName,
      recipientEmail,
      recipientCompany,
      recipientPhone,
      recipientAddress: invoice.recipientAddress || invoice.client?.address || invoice.partner?.address,
      totalAmount: invoice.totalAmount || 0,
      subtotal: invoice.subtotal || 0,
      tax: invoice.tax || 0,
      taxRate: invoice.taxRate || 0,
      discount: invoice.discount || 0,
      discountType: invoice.discountType || "fixed",
      status: invoice.status || "draft",
      issueDate: invoice.issueDate || new Date().toISOString(),
      dueDate: invoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
      showError(t("invoices.errors.loadStatsFailed"));
    } finally {
      setStatsLoading(false);
    }
  }, [filters.startDate, filters.endDate, invoiceType, showError, t]);

  // Fetch invoices with enhanced data validation
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchTerm || undefined,
        invoiceType: invoiceType,
        status: filters.status || undefined,
        client: invoiceType === "client" ? filters.client || undefined : undefined,
        partner: invoiceType === "partner" ? filters.partner || undefined : undefined,
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
      const errorMessage = error.message || t("invoices.errors.loadInvoicesFailed");
      setError(errorMessage);
      showError(errorMessage);
      setInvoices([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, currentPage, pageSize, invoiceType, showError, t]);

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
  const showDeleteConfirmation = useCallback((invoiceId, invoiceName = t("invoices.defaultInvoiceName")) => {
    setConfirmationModal({
      isOpen: true,
      invoiceId,
      invoiceName,
      onConfirm: () => handleDeleteConfirm(invoiceId, invoiceName)
    });
  }, [t]);

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
  const handleDeleteConfirm = useCallback(async (invoiceId, invoiceName = t("invoices.defaultInvoiceName")) => {
    if (!invoiceId) {
      showError(t("invoices.errors.invalidInvoiceId"));
      return;
    }

    try {
      // Use the promise toast for loading state
      await promise(
        invoiceService.delete(invoiceId),
        {
          loading: t("invoices.delete.loading", { invoiceName }),
          success: t("invoices.delete.success", { invoiceName }),
          error: t("invoices.delete.error", { invoiceName })
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
  }, [fetchInvoices, fetchStats, selectedInvoice, promise, showError, closeConfirmationModal, t]);

  // Updated invoice deletion handler
  const handleDeleteClick = useCallback((invoiceId, invoiceName = t("invoices.defaultInvoiceName")) => {
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

  const handleRowClick = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  }, []);

  const handleDetailModalClose = useCallback(() => {
    setSelectedInvoice(null);
    setIsDetailModalOpen(false);
  }, []);

  const handleEditInvoice = (invoice) => {
    if (!invoice || !invoice._id) {
      showError(t("invoices.errors.invalidInvoiceData"));
      return;
    }
    setIsDetailModalOpen(false);
    navigate(`/invoices/${invoice._id}/edit`);
  };

  const handleViewInvoice = async (invoice) => {
    if (!invoice || !invoice._id) {
      showError(t("invoices.errors.invalidInvoiceData"));
      return;
    }

    try {
      const response = await invoiceService.getById(invoice._id);
      const invoiceData = response?.invoice || response?.data?.invoice || response?.data;
      setSelectedInvoice(normalizeInvoiceData(invoiceData) || invoice);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      showError(t("invoices.errors.loadDetailsFailed"));
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleCancelClick = (invoice) => {
    if (!invoice || !invoice._id) {
      showError(t("invoices.errors.invalidInvoiceData"));
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
          loading: t("invoices.cancel.loading"),
          success: t("invoices.cancel.success"),
          error: t("invoices.cancel.error")
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
      showError(t("invoices.errors.invalidInvoiceData"));
      return;
    }

    try {
      await promise(
        invoiceService.send(invoice._id, {
          message: t("invoices.send.message"),
        }),
        {
          loading: t("invoices.send.loading"),
          success: t("invoices.send.success"),
          error: t("invoices.send.error")
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
      showError(t("invoices.errors.invalidInvoiceData"));
      return;
    }

    try {
      await promise(
        invoiceService.markAsPaid(invoice._id, {
          paymentMethod: "cash",
        }),
        {
          loading: t("invoices.markAsPaid.loading"),
          success: t("invoices.markAsPaid.success"),
          error: t("invoices.markAsPaid.error")
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
      showError(t("invoices.errors.invalidInvoiceData"));
      return;
    }

    try {
      // Show loading state
      showInfo(t("invoices.download.generating"));

      console.log("Starting download for invoice:", invoice._id);
      
      const blob = await invoiceService.download(invoice._id);
      
      console.log("Received blob:", blob);
      
      // Validate blob
      if (!blob || !(blob instanceof Blob)) {
        throw new Error(t("invoices.download.errors.invalidFile"));
      }

      if (blob.size === 0) {
        throw new Error(t("invoices.download.errors.emptyFile"));
      }

      // Check if it's actually a PDF
      if (blob.type && blob.type !== 'application/pdf') {
        console.warn('Unexpected file type:', blob.type);
        // Try to read the blob as text to see if it's an error message
        const text = await blob.text();
        if (text.includes('error') || text.includes('Error')) {
          throw new Error(t("invoices.download.errors.serverError"));
        }
        // If it's not text error, continue with download
      }

      // Create filename
      const invoiceNumber = invoice.invoiceNumber || `INV-${invoice._id.substring(0, 8)}`;
      const filename = `${invoiceNumber}.pdf`;

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);

      showSuccess(t("invoices.download.success", { invoiceNumber }));
      
    } catch (err) {
      console.error("Download invoice error details:", err);
      
      let errorMessage = t("invoices.download.errors.generic");
      
      // Provide specific error messages
      if (err.message.includes('PDF generation failed')) {
        errorMessage = t("invoices.download.errors.generationFailed");
      } else if (err.message.includes('Server error')) {
        errorMessage = t("invoices.download.errors.serverError");
      } else if (err.message.includes('timeout')) {
        errorMessage = t("invoices.download.errors.timeout");
      } else if (err.message.includes('not found')) {
        errorMessage = t("invoices.download.errors.notFound");
      } else if (err.message.includes('empty')) {
        errorMessage = t("invoices.download.errors.emptyFile");
      } else if (err.message.includes('Server returned an error')) {
        errorMessage = t("invoices.download.errors.serverError");
      }
      
      showError(errorMessage);
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
    showInfo(t("invoices.filters.cleared"));
  };

  const handleRetry = useCallback(() => {
    fetchInvoices();
    showInfo(t("invoices.retry.loading"));
  }, [fetchInvoices, showInfo, t]);

  const handleBulkSend = async () => {
    if (selectedRows.length === 0) {
      showError(t("invoices.bulkSend.noSelection"));
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
          loading: t("invoices.bulkSend.loading", { count: selectedRows.length }),
          success: t("invoices.bulkSend.success", { count: selectedRows.length }),
          error: t("invoices.bulkSend.error")
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
      header: t("invoices.table.headers.invoiceNumber"),
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
          t("invoices.table.noNumber")
        ),
    },
    {
      accessor: "recipientName",
      header: invoiceType === "client" ? t("invoices.table.headers.client") : t("invoices.table.headers.partner"),
      sortable: true,
      width: "25%",
      render: (row) =>
        safeRender(
          (row) => (
            <div className="min-w-0">
              <p className="text-gray-900 dark:text-white font-medium">
                {row.recipientName || t("invoices.table.noRecipient")}
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
          t("invoices.table.noRecipient")
        ),
    },
    {
      accessor: "issueDate",
      header: t("invoices.table.headers.issueDate"),
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
      header: t("invoices.table.headers.dueDate"),
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
      header: t("invoices.table.headers.amount"),
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
      header: t("invoices.table.headers.status"),
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
                ? t(`invoices.status.${row.status}`)
                : t("invoices.status.draft")}
            </Badge>
          ),
          row
        ),
    },
    {
      header: t("invoices.table.headers.actions"),
      accessor: "actions",
      width: "15%",
      className: "text-center",
      render: (row) => {
        if (!row || !row._id) return <span className="text-gray-400">-</span>;

        // Determine which actions are available based on invoice status
        const canEdit = ["draft", "sent", "partial", "overdue"].includes(row.status);
        const canDelete = ["draft"].includes(row.status) || (row.status === "sent" && row.paymentStatus?.amountPaid === 0);
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
              title={t("invoices.actions.view")}
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Edit Action */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditInvoice(row);
              }}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              title={t("invoices.actions.edit")}
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
              title={t("invoices.actions.download")}
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
                title={t("invoices.actions.send")}
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
                title={t("invoices.actions.markAsPaid")}
              >
                <Check className="h-4 w-4" />
              </button>
            )}

            {/* Delete Action */}
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row._id, row.invoiceNumber || t("invoices.defaultInvoiceName"));
                }}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                title={t("invoices.actions.delete")}
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
  const hasActiveFilters = searchTerm.trim() !== "" || Object.values(filters).some((value) => value !== "");
  const showEmptyState = !loading && !error && invoices.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults = !loading && !error && invoices.length === 0 && hasActiveFilters && hasInitialLoad;

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
            {t("invoices.title")}
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {invoiceType === "client" 
              ? t("invoices.subtitle.client") 
              : t("invoices.subtitle.partner")}
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
                {t("invoices.bulkSend.button", { count: selectedRows.length })}
              </Button>
            )}

            <Button variant="primary" icon={Plus} onClick={handleCreateInvoice}>
              <Plus className="w-4 h-4 mr-2" />
              {t("invoices.create.button", { 
                type: invoiceType === "client" 
                  ? t("invoices.types.invoice") 
                  : t("invoices.types.bill") 
              })}
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
                {t("invoices.errors.title")}
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
            <Button onClick={handleRetry} size="sm" variant="outline">
              {t("invoices.retry.button")}
            </Button>
          </div>
        </div>
      )}

      {/* Header with Invoice Type Toggle on the right */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-2">
        </div> 
        {/* Invoice Type Toggle - Right Side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setInvoiceType("client")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              invoiceType === "client"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t("invoices.types.clientInvoices")}</span>
            {invoiceType === "client" && stats && (
              <Badge variant="white" className="ml-1">
                {stats.totalInvoices}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setInvoiceType("partner")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              invoiceType === "partner"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{t("invoices.types.partnerBills")}</span>
            {invoiceType === "partner" && stats && (
              <Badge variant="white" className="ml-1">
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
                    ? t("invoices.stats.totalRevenue")
                    : t("invoices.stats.totalExpenses")}
                </div>
                <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    formatCurrency(stats?.totalRevenue || 0)
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("invoices.stats.invoiceCount", { count: stats?.totalInvoices || 0 })}
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
                  {t("invoices.stats.paid")}
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
                  {t("invoices.stats.pending")}
                </div>
                <div className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {statsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    (stats?.sent || 0) + (stats?.partial || 0)
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("invoices.stats.amountDue", { amount: formatCurrency(stats?.totalDue || 0) })}
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
                  {t("invoices.stats.overdue")}
                </div>
                <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
                  {statsLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    stats?.overdue || 0
                  )}
                </div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("invoices.stats.needsAttention")}
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
                  placeholder={t("invoices.search.placeholder", { 
                    type: invoiceType === "client" ? "client" : "partner" 
                  })}
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
                {showFilters ? t("invoices.filters.hide") : t("invoices.filters.show")}
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
                    label={t("invoices.filters.status.label")}
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                  >
                    <option value="">{t("invoices.filters.status.all")}</option>
                    <option value="draft">{t("invoices.status.draft")}</option>
                    <option value="sent">{t("invoices.status.sent")}</option>
                    <option value="paid">{t("invoices.status.paid")}</option>
                    <option value="partial">{t("invoices.status.partial")}</option>
                    <option value="overdue">{t("invoices.status.overdue")}</option>
                    <option value="cancelled">{t("invoices.status.cancelled")}</option>
                  </Select>

                  <Input
                    label={t("invoices.filters.startDate")}
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                  />

                  <Input
                    label={t("invoices.filters.endDate")}
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
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
                      {t("invoices.filters.clearAll")}
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
            {t("invoices.loading")}
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
                  ? t("invoices.table.empty.search")
                  : t("invoices.table.empty.default", { 
                      type: invoiceType === "client" ? "invoice" : "bill" 
                    })
              }
              onRowClick={handleRowClick} 
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
            {t("invoices.empty.search.title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("invoices.empty.search.description")}
          </p>
          <Button onClick={handleClearFilters} variant="outline">
            {t("invoices.filters.clearAll")}
          </Button>
        </div>
      )}

      {/* Empty State - No invoices at all */}
      {showEmptyState && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("invoices.empty.default.title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("invoices.empty.default.description", { 
              type: invoiceType === "client" ? "invoice" : "bill" 
            })}
          </p>
          <Button onClick={handleCreateInvoice} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            {t("invoices.create.firstButton", { 
              type: invoiceType === "client" 
                ? t("invoices.types.invoice") 
                : t("invoices.types.bill") 
            })}
          </Button>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {isDetailModalOpen && selectedInvoice && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
          title={t("invoices.detailModal.title")}
          size="lg"
        >
          <div className="p-6 space-y-6">
            {/* Invoice Header */}
            <div className="flex items-start justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t("invoices.detailModal.invoiceNumber", { number: selectedInvoice.invoiceNumber })}
                  </h3>
                  <Badge
                    variant={selectedInvoice.invoiceType === "client" ? "info" : "purple"}
                    className="ml-2"
                  >
                    {selectedInvoice.invoiceType === "client" ? (
                      <>
                        <Users className="w-3 h-3 mr-1" /> {t("invoices.types.client")}
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-3 h-3 mr-1" /> {t("invoices.types.partner")}
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {t("invoices.detailModal.issued", { date: formatDate(selectedInvoice.issueDate) })}
                </p>
                {selectedInvoice.sentAt && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("invoices.detailModal.sent", { date: formatDate(selectedInvoice.sentAt) })}
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
                {t(`invoices.status.${selectedInvoice.status}`) || t("invoices.status.draft")}
              </Badge>
            </div>

            {/* Recipient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedInvoice.invoiceType === "client"
                    ? t("invoices.detailModal.billTo")
                    : t("invoices.detailModal.payTo")}
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
                    {(selectedInvoice.recipientAddress.city || selectedInvoice.recipientAddress.state) && (
                      <p>
                        {selectedInvoice.recipientAddress.city}
                        {selectedInvoice.recipientAddress.state && `, ${selectedInvoice.recipientAddress.state}`}
                        {selectedInvoice.recipientAddress.zipCode && ` ${selectedInvoice.recipientAddress.zipCode}`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {t("invoices.detailModal.invoiceDetails")}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      {t("invoices.detailModal.dueDate")}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(selectedInvoice.dueDate)}
                    </span>
                  </div>
                  {selectedInvoice.event && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t("invoices.detailModal.event")}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedInvoice.event.title}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.currency && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        {t("invoices.detailModal.currency")}
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
                  {t("invoices.detailModal.items")}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">
                          {t("invoices.detailModal.description")}
                        </th>
                        <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                          {t("invoices.detailModal.quantity")}
                        </th>
                        <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                          {t("invoices.detailModal.rate")}
                        </th>
                        <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                          {t("invoices.detailModal.amount")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {item.description || t("invoices.detailModal.noDescription")}
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
                      {t("invoices.detailModal.subtotal")}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(selectedInvoice.subtotal || 0)}
                    </span>
                  </div>
                  {selectedInvoice.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("invoices.detailModal.tax")}
                        {selectedInvoice.taxRate ? ` (${selectedInvoice.taxRate}%)` : ""}:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(selectedInvoice.tax)}
                      </span>
                    </div>
                  )}
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {t("invoices.detailModal.discount")}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        -{formatCurrency(selectedInvoice.discount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">
                      {t("invoices.detailModal.total")}
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(selectedInvoice.totalAmount)}
                    </span>
                  </div>
                  {selectedInvoice.paymentStatus?.amountPaid > 0 && (
                    <>
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>{t("invoices.detailModal.amountPaid")}</span>
                        <span>
                          {formatCurrency(selectedInvoice.paymentStatus.amountPaid)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-gray-900 dark:text-white">
                          {t("invoices.detailModal.amountDue")}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {formatCurrency(selectedInvoice.paymentStatus.amountDue)}
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
                      {t("invoices.detailModal.notes")}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedInvoice.notes}
                    </p>
                  </div>
                )}
                {selectedInvoice.terms && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {t("invoices.detailModal.terms")}
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
                {t("invoices.actions.close")}
              </Button>
              <Button
                variant="outline"
                icon={Download}
                onClick={() => handleDownloadInvoice(selectedInvoice)}
              >
                {t("invoices.actions.downloadPdf")}
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
                    {t("invoices.actions.editInvoice")}
                  </Button>
                  <Button
                    variant="primary"
                    icon={Send}
                    onClick={() => {
                      handleSendInvoice(selectedInvoice);
                      handleCloseModal();
                    }}
                  >
                    {t("invoices.actions.sendInvoice")}
                  </Button>
                </>
              )}
              {(selectedInvoice.status === "sent" || selectedInvoice.status === "partial" || selectedInvoice.status === "overdue") && (
                <>
                  <Button
                    variant="outline"
                    icon={Edit}
                    onClick={() => {
                      handleEditInvoice(selectedInvoice);
                      handleCloseModal();
                    }}
                  >
                    {t("invoices.actions.editInvoice")}
                  </Button>
                  <Button
                    variant="success"
                    icon={Check}
                    onClick={() => {
                      handleMarkAsPaid(selectedInvoice);
                      handleCloseModal();
                    }}
                  >
                    {t("invoices.actions.markAsPaid")}
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
        title={t("invoices.delete.confirm.title")}
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
                {t("invoices.delete.confirm.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("invoices.delete.confirm.description", { invoiceName: confirmationModal.invoiceName })}
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeConfirmationModal}
                  className="px-4 py-2"
                >
                  {t("invoices.actions.cancel")}
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmationModal.onConfirm}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("invoices.actions.deleteInvoice")}
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
        title={t("invoices.cancel.modal.title")}
        size="md"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("invoices.cancel.modal.description")}
          </p>
          <Input
            label={t("invoices.cancel.modal.reasonLabel")}
            type="textarea"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder={t("invoices.cancel.modal.reasonPlaceholder")}
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
              {t("invoices.actions.cancel")}
            </Button>
            <Button variant="danger" onClick={handleCancelConfirm}>
              {t("invoices.actions.cancelInvoice")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoicesPage;