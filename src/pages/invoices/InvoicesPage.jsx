// src/pages/payments/InvoicesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Eye,
  Download,
  Search,
  X,
  Calendar,
  DollarSign,
  Send,
  Check,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
} from "lucide-react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import { invoiceService } from "../../api/index";
import { toast } from "react-hot-toast";

const InvoicesPage = () => {
  const navigate = useNavigate();

  // State
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchTerm || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: currentPage,
        limit,
      };

      const response = await invoiceService.getAll(params);

      // Handle response structure
      const invoicesData = response?.invoices || response?.data || [];
      const paginationData = response?.pagination || {};

      setInvoices(invoicesData);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.total || invoicesData.length);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError(error.message || "Failed to load invoices. Please try again.");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, currentPage]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Handlers
  const handleCreateInvoice = () => {
    navigate("/invoices/new");
  };

  const handleEditInvoice = (invoice) => {
    navigate(`/invoices/${invoice._id || invoice.id}/edit`);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleDeleteClick = (e, invoice) => {
    e.stopPropagation();
    setDeleteId(invoice._id || invoice.id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await invoiceService.delete(deleteId);
      toast.success("Invoice deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      fetchInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error(error.message || "Failed to delete invoice");
    }
  };

  const handleSendInvoice = async (e, invoice) => {
    e.stopPropagation();
    try {
      await invoiceService.send(invoice._id || invoice.id);
      toast.success("Invoice sent successfully");
      fetchInvoices();
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error(error.message || "Failed to send invoice");
    }
  };

  const handleDownloadInvoice = async (e, invoice) => {
    e.stopPropagation();
    try {
      const blob = await invoiceService.download(invoice._id || invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber || invoice.number || "document"}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error(error.message || "Failed to download invoice");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ status: "", startDate: "", endDate: "" });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "TND",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusVariant = (status) => {
    const statusLower = (status || "").toLowerCase();
    switch (statusLower) {
      case "paid":
        return "success";
      case "pending":
      case "sent":
        return "warning";
      case "overdue":
      case "cancelled":
        return "danger";
      case "draft":
        return "gray";
      default:
        return "info";
    }
  };

  // Calculate statistics
  const stats = {
    totalRevenue: invoices.reduce(
      (sum, inv) => sum + (inv.totalAmount || inv.amount || 0),
      0
    ),
    paidInvoices: invoices.filter(
      (inv) => (inv.status || "").toLowerCase() === "paid"
    ).length,
    pendingInvoices: invoices.filter((inv) =>
      ["pending", "sent"].includes((inv.status || "").toLowerCase())
    ).length,
    overdueInvoices: invoices.filter(
      (inv) => (inv.status || "").toLowerCase() === "overdue"
    ).length,
  };

  if (loading && invoices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Invoices
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
            Manage all client invoices and payments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={fetchInvoices}
            loading={loading}
          >
            Refresh
          </Button>
          <Button variant="primary" icon={Plus} onClick={handleCreateInvoice}>
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="p-4 flex items-center justify-between">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchInvoices}>
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
                  Total Revenue
                </div>
                <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.totalRevenue)}
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
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Paid Invoices
                </div>
                <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.paidInvoices}
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Invoices
                </div>
                <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.pendingInvoices}
                </div>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Overdue Invoices
                </div>
                <div className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.overdueInvoices}
                </div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
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
                placeholder="Search by invoice number, client name, or description..."
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
                label="Status"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
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

      {/* Invoices Table */}
      <Card>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                      >
                        {searchTerm || filters.status
                          ? "No invoices found matching your search."
                          : "No invoices found. Create your first invoice to get started."}
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr
                        key={invoice._id || invoice.id}
                        onClick={() => handleViewInvoice(invoice)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {invoice.invoiceNumber || invoice.number || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {invoice.clientName || invoice.client?.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {invoice.issueDate || invoice.date
                            ? formatDate(invoice.issueDate || invoice.date)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                          {invoice.dueDate
                            ? formatDate(invoice.dueDate)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                          {formatCurrency(
                            invoice.totalAmount || invoice.amount || 0
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusVariant(invoice.status)}>
                            {invoice.status || "Draft"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewInvoice(invoice);
                              }}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditInvoice(invoice);
                              }}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="Edit Invoice"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleSendInvoice(e, invoice)}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Send Invoice"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDownloadInvoice(e, invoice)}
                              className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteClick(e, invoice)}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
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
          )}
        </div>
      </Card>

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
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Invoice #
                  {selectedInvoice.invoiceNumber || selectedInvoice.number}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedInvoice.issueDate || selectedInvoice.date
                    ? formatDate(
                        selectedInvoice.issueDate || selectedInvoice.date
                      )
                    : ""}
                </p>
              </div>
              <Badge
                variant={getStatusVariant(selectedInvoice.status)}
                size="lg"
              >
                {selectedInvoice.status || "Draft"}
              </Badge>
            </div>

            {/* Client Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Bill To:
              </h4>
              <p className="text-gray-700 dark:text-gray-300">
                {selectedInvoice.clientName ||
                  selectedInvoice.client?.name ||
                  "N/A"}
              </p>
              {selectedInvoice.clientEmail && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedInvoice.clientEmail}
                </p>
              )}
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Issue Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedInvoice.issueDate || selectedInvoice.date
                    ? formatDate(
                        selectedInvoice.issueDate || selectedInvoice.date
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due Date
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedInvoice.dueDate
                    ? formatDate(selectedInvoice.dueDate)
                    : "N/A"}
                </p>
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
                          <td className="px-4 py-2 text-gray-900 dark:text-white">
                            {item.description || item.name || "N/A"}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                            {item.quantity || 0}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">
                            {formatCurrency(item.rate || item.price || 0)}
                          </td>
                          <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                            {formatCurrency(
                              (item.quantity || 0) *
                                (item.rate || item.price || 0)
                            )}
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
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span className="text-gray-900 dark:text-white">
                      {formatCurrency(
                        selectedInvoice.subtotal ||
                          selectedInvoice.totalAmount ||
                          0
                      )}
                    </span>
                  </div>
                  {selectedInvoice.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tax:
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
                      {formatCurrency(
                        selectedInvoice.totalAmount ||
                          selectedInvoice.amount ||
                          0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={handleCloseModal}>
                Close
              </Button>
              <Button
                variant="outline"
                icon={Download}
                onClick={(e) => handleDownloadInvoice(e, selectedInvoice)}
              >
                Download
              </Button>
              <Button
                variant="primary"
                icon={Send}
                onClick={(e) => handleSendInvoice(e, selectedInvoice)}
              >
                Send Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteId(null);
        }}
        title="Delete Invoice"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Are you sure you want to delete this invoice? This action cannot be
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

export default InvoicesPage;
