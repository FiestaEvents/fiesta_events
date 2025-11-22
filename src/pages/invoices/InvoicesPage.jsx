import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  Settings, // ✅ Imported
  Trash2,
  Users,
  X,
  AlertTriangle,
} from "lucide-react";

// Components
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Pagination from "../../components/common/Pagination";
import Select from "../../components/common/Select";
import InvoiceFormPage from "./InvoiceFormPage";

// Services & Utils
import { invoiceService } from "../../api/index";
import { useToast } from "../../context/ToastContext";
import formatCurrency from "../../utils/formatCurrency";

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [invoiceType, setInvoiceType] = useState("client"); // 'client' or 'partner'
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Selection
  const [selectedRows, setSelectedRows] = useState([]);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Modals State
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [editingInvoice, setEditingInvoice] = useState(null);
  
  // Action Modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    invoiceId: null,
    invoiceName: "",
    onConfirm: null
  });

  // ==========================================
  // DATA NORMALIZATION
  // ==========================================
  const normalizeInvoiceData = (invoice) => {
    if (!invoice || typeof invoice !== "object") return null;

    // Extract recipient info based on type
    let recipientName = "", recipientEmail = "", recipientCompany = "";

    if (invoice.invoiceType === "client") {
      recipientName = invoice.client?.name || invoice.recipientName || t("invoices.recipient.client");
      recipientEmail = invoice.client?.email || invoice.recipientEmail;
      recipientCompany = invoice.client?.company || invoice.recipientCompany;
    } else {
      recipientName = invoice.partner?.name || invoice.recipientName || t("invoices.recipient.partner");
      recipientEmail = invoice.partner?.email || invoice.recipientEmail;
      recipientCompany = invoice.partner?.company || invoice.recipientCompany;
    }

    return {
      ...invoice,
      _id: invoice._id || invoice.id,
      invoiceNumber: invoice.invoiceNumber || `INV-${(invoice._id || "").substring(0, 8)}`,
      recipientName,
      recipientEmail,
      recipientCompany,
      totalAmount: invoice.totalAmount || 0,
      status: invoice.status || "draft",
      issueDate: invoice.issueDate || new Date().toISOString(),
      dueDate: invoice.dueDate || new Date().toISOString(),
      currency: invoice.currency || "TND",
      items: invoice.items || [],
      paymentStatus: invoice.paymentStatus || { amountPaid: 0, amountDue: invoice.totalAmount || 0 },
    };
  };

  // ==========================================
  // API CALLS
  // ==========================================
  
const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await invoiceService.getStats({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        invoiceType: invoiceType,
      });

      // ✅ FIX: Handle the direct object returned by the new backend
      const data = response?.stats || response?.data?.stats || {};

      // Check if data is an array (Legacy) or Object (New Backend)
      if (Array.isArray(data)) {
        const typeStats = data.find((s) => s._id === invoiceType) || {};
        setStats({
          totalRevenue: typeStats.totalRevenue || 0,
          paid: typeStats.paid || 0,
          totalDue: typeStats.totalDue || 0,
          overdue: typeStats.overdue || 0
        });
      } else {
        // New Backend returns the object directly calculated
        setStats({
          totalRevenue: data.totalRevenue || 0,
          paid: data.paid || 0,
          totalDue: data.totalDue || 0,
          overdue: data.overdue || 0
        });
      }

    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({ totalRevenue: 0, paid: 0, totalDue: 0, overdue: 0 });
    } finally {
      setStatsLoading(false);
    }
  }, [filters, invoiceType]);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchTerm || undefined,
        invoiceType: invoiceType,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page: currentPage,
        limit: pageSize,
        sort: "-createdAt",
      };

      const response = await invoiceService.getAll(params);
      let invoicesData = response?.invoices || response?.data?.invoices || [];

      // Normalize
      invoicesData = invoicesData
        .map(normalizeInvoiceData)
        .filter((invoice) => invoice !== null);

      const paginationData = response?.pagination || response?.data?.pagination || {
          current: currentPage, pages: 1, total: invoicesData.length
      };

      setInvoices(invoicesData);
      setTotalPages(paginationData.pages || 1);
      setTotalItems(paginationData.total || invoicesData.length);
      setHasInitialLoad(true);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError(t("invoices.errors.loadInvoicesFailed"));
      setInvoices([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, currentPage, pageSize, invoiceType, t]);

  // Effects
  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setCurrentPage(1); setSelectedRows([]); }, [invoiceType]);

  // ==========================================
  // HANDLERS
  // ==========================================

  // --- Navigation ---
  const handleCreateInvoice = () => {
    setFormMode("create");
    setEditingInvoice(null);
    setIsFormModalOpen(true);
  };

  // --- Details & Edit ---
  const handleRowClick = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  }, []);

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleEditInvoice = async (invoice) => {
    try {
      const response = await invoiceService.getById(invoice._id);
      const fullInvoice = response?.invoice || response?.data?.invoice || invoice;
      setFormMode("edit");
      setEditingInvoice(normalizeInvoiceData(fullInvoice));
      setIsDetailModalOpen(false);
      setIsFormModalOpen(true);
    } catch (error) {
      showError(t("invoices.errors.loadDetailsFailed"));
    }
  };

  // --- Form Submission ---
  const handleFormSubmit = async (invoiceData) => {
    try {
      if (formMode === "create") {
        await promise(invoiceService.create(invoiceData), {
          loading: t("invoices.create.loading"),
          success: t("invoices.create.success"),
          error: t("invoices.create.error")
        });
      } else {
        await promise(invoiceService.update(editingInvoice._id, invoiceData), {
          loading: t("invoices.update.loading"),
          success: t("invoices.update.success"),
          error: t("invoices.update.error")
        });
      }
      setIsFormModalOpen(false);
      setEditingInvoice(null);
      fetchInvoices();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Actions (Send, Pay, Cancel, Download) ---
  const handleSendInvoice = async (invoice) => {
    try {
      await promise(invoiceService.send(invoice._id, { message: "Invoice attached." }), {
        loading: t("invoices.send.loading"),
        success: t("invoices.send.success"),
        error: t("invoices.send.error")
      });
      fetchInvoices();
    } catch (err) { console.error(err); }
  };

  const handleMarkAsPaid = async (invoice) => {
    try {
      await promise(invoiceService.markAsPaid(invoice._id, { paymentMethod: "cash" }), {
        loading: t("invoices.markAsPaid.loading"),
        success: t("invoices.markAsPaid.success"),
        error: t("invoices.markAsPaid.error")
      });
      fetchInvoices();
      fetchStats();
    } catch (err) { console.error(err); }
  };

  const handleDownloadInvoice = async (invoice) => {
    try {
      showInfo(t("invoices.download.generating"));
      const blob = await invoiceService.download(invoice._id);
      
      if (!blob || blob.size === 0) throw new Error("Empty file");
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess(t("invoices.download.success"));
    } catch (err) {
      showError(t("invoices.download.errors.generic"));
    }
  };

  // --- Delete & Cancel ---
  const handleDeleteClick = (id, name) => {
    setConfirmationModal({
      isOpen: true,
      invoiceId: id,
      invoiceName: name,
      onConfirm: async () => {
        try {
          await invoiceService.delete(id);
          showSuccess(t("invoices.delete.success"));
          fetchInvoices();
          fetchStats();
          setConfirmationModal({ isOpen: false, invoiceId: null, invoiceName: "", onConfirm: null });
        } catch (err) {
          showError(t("invoices.delete.error"));
        }
      }
    });
  };

  const handleCancelConfirm = async () => {
    if (!selectedInvoice) return;
    try {
      await promise(invoiceService.cancel(selectedInvoice._id, cancelReason), {
        loading: t("invoices.cancel.loading"),
        success: t("invoices.cancel.success"),
        error: t("invoices.cancel.error")
      });
      setIsCancelModalOpen(false);
      setCancelReason("");
      fetchInvoices();
    } catch (err) { console.error(err); }
  };

  const handleBulkSend = async () => {
    if (!selectedRows.length) return;
    try {
      const promises = selectedRows.map(id => invoiceService.send(id).catch(e => null));
      await promise(Promise.all(promises), {
        loading: "Sending...", success: "Batch sent!", error: "Error sending batch"
      });
      setSelectedRows([]);
      fetchInvoices();
    } catch (e) { console.error(e); }
  };

  // --- Filters ---
  const handleFilterChange = (key, value) => setFilters(p => ({ ...p, [key]: value }));
  const handleClearFilters = () => {
    setFilters({ status: "", startDate: "", endDate: "" });
    setSearchTerm("");
  };

  // ==========================================
  // TABLE CONFIG
  // ==========================================
  const safeRender = (fn, row, fallback = "-") => {
    try { return fn(row) || fallback; } catch { return fallback; }
  };

  const columns = [
    {
      accessor: "invoiceNumber",
      header: t("invoices.table.headers.invoiceNumber"),
      width: "15%",
      render: (row) => <div className="font-medium text-gray-900 dark:text-white">{row.invoiceNumber}</div>
    },
    {
      accessor: "recipientName",
      header: "Recipient",
      width: "25%",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.recipientName}</div>
          <div className="text-xs text-gray-500">{row.recipientCompany}</div>
        </div>
      )
    },
    {
      accessor: "dueDate",
      header: t("invoices.table.headers.dueDate"),
      width: "15%",
      render: (row) => <div className="text-gray-600 dark:text-gray-400">{new Date(row.dueDate).toLocaleDateString()}</div>
    },
    {
      accessor: "totalAmount",
      header: t("invoices.table.headers.amount"),
      width: "15%",
      render: (row) => <div className="font-bold text-gray-900 dark:text-white">{formatCurrency(row.totalAmount)}</div>
    },
    {
      accessor: "status",
      header: t("invoices.table.headers.status"),
      width: "10%",
      render: (row) => {
        const colors = { paid: "green", sent: "blue", draft: "gray", overdue: "red", partial: "yellow" };
        return <Badge color={colors[row.status] || "gray"}>{row.status}</Badge>;
      }
    },
    {
      header: "Actions",
      width: "20%",
      className: "text-center",
      render: (row) => {
        const canEdit = ["draft", "sent"].includes(row.status);
        return (
          <div className="flex justify-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); handleViewInvoice(row); }} className="p-1 text-gray-500 hover:text-orange-500"><Eye size={16} /></button>
            {canEdit && <button onClick={(e) => { e.stopPropagation(); handleEditInvoice(row); }} className="p-1 text-gray-500 hover:text-blue-500"><Edit size={16} /></button>}
            <button onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(row); }} className="p-1 text-gray-500 hover:text-green-500"><Download size={16} /></button>
            {row.status === "draft" && (
               <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(row._id, row.invoiceNumber); }} className="p-1 text-gray-500 hover:text-red-500"><Trash2 size={16} /></button>
            )}
          </div>
        );
      }
    }
  ];

  // ==========================================
  // RENDER
  // ==========================================

  if (loading && !hasInitialLoad) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="p-6 bg-white space-y-6 dark:bg-gray-900 min-h-screen">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("invoices.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your {invoiceType} invoices and bills</p>
        </div>
        
        <div className="flex items-center gap-3">
           {/* SETTINGS BUTTON */}
           <Button variant="outline" icon={Settings} onClick={() => navigate("/invoices/settings")}>
              {t("invoices.settings", "Settings")}
           </Button>

           {selectedRows.length > 0 && (
             <Button variant="outline" icon={Mail} onClick={handleBulkSend}>
               Bulk Send ({selectedRows.length})
             </Button>
           )}

           <Button variant="primary" icon={Plus} onClick={handleCreateInvoice}>
              {t("invoices.create.button", { type: invoiceType === "client" ? "Invoice" : "Bill" })}
           </Button>
        </div>
      </div>

      {/* 2. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
           <div className="text-gray-500 text-sm">Total Revenue</div>
           <div className="text-2xl font-bold">{statsLoading ? "..." : formatCurrency(stats?.totalRevenue || 0)}</div>
        </Card>
        <Card className="p-4 border-green-100 bg-green-50/50">
           <div className="text-green-700 text-sm">Paid</div>
           <div className="text-2xl font-bold text-green-700">{statsLoading ? "..." : formatCurrency(stats?.paid || 0)}</div>
        </Card>
        <Card className="p-4 border-yellow-100 bg-yellow-50/50">
           <div className="text-yellow-700 text-sm">Pending</div>
           <div className="text-2xl font-bold text-yellow-700">{statsLoading ? "..." : formatCurrency(stats?.totalDue || 0)}</div>
        </Card>
        <Card className="p-4 border-red-100 bg-red-50/50">
           <div className="text-red-700 text-sm">Overdue</div>
           <div className="text-2xl font-bold text-red-700">{statsLoading ? "..." : stats?.overdue || 0}</div>
        </Card>
      </div>

      {/* 3. CONTROLS (Type Toggle & Search) */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-4 rounded-lg dark:bg-gray-800">
         {/* Type Toggle */}
         <div className="flex bg-white dark:bg-gray-700 rounded-lg p-1 shadow-sm self-start">
            <button 
              onClick={() => setInvoiceType("client")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                invoiceType === "client" ? "bg-orange-500 text-white shadow" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              <Users size={16} /> Client Invoices
            </button>
            <button 
              onClick={() => setInvoiceType("partner")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                invoiceType === "partner" ? "bg-orange-500 text-white shadow" : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              }`}
            >
              <Briefcase size={16} /> Partner Bills
            </button>
         </div>

         {/* Search & Filter */}
         <div className="flex gap-2 flex-1 justify-end">
            <div className="w-full md:w-64">
               <Input 
                 icon={Search} 
                 placeholder="Search invoices..." 
                 value={searchTerm} 
                 onChange={(e) => setSearchTerm(e.target.value)} 
               />
            </div>
            <Button variant="outline" icon={showFilters ? ChevronUp : ChevronDown} onClick={() => setShowFilters(!showFilters)}>
               Filter
            </Button>
         </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <Select 
              label="Status" 
              value={filters.status} 
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
               <option value="">All Statuses</option>
               <option value="draft">Draft</option>
               <option value="sent">Sent</option>
               <option value="paid">Paid</option>
               <option value="overdue">Overdue</option>
            </Select>
            <Input type="date" label="Start Date" value={filters.startDate} onChange={(e) => handleFilterChange("startDate", e.target.value)} />
            <Input type="date" label="End Date" value={filters.endDate} onChange={(e) => handleFilterChange("endDate", e.target.value)} />
            <div className="sm:col-span-3 flex justify-end">
               <Button variant="ghost" onClick={handleClearFilters}>Clear Filters</Button>
            </div>
         </div>
      )}

      {/* 4. TABLE */}
      {error ? (
         <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 text-center">
            {error} <Button size="sm" variant="outline" onClick={fetchInvoices} className="ml-2">Retry</Button>
         </div>
      ) : invoices.length > 0 ? (
        <>
          <Table 
             columns={columns} 
             data={invoices} 
             onRowClick={handleRowClick}
             selectable={true}
             selectedRows={selectedRows}
             onSelectionChange={setSelectedRows}
             striped
          />
          <Pagination 
             currentPage={currentPage} 
             totalPages={totalPages} 
             totalItems={totalItems} 
             onPageChange={setCurrentPage} 
             pageSize={pageSize}
             onPageSizeChange={setPageSize}
          />
        </>
      ) : (
         <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-700">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No invoices found</h3>
            <p className="text-gray-500 mt-1">Create a new invoice to get started.</p>
            <div className="mt-6">
               <Button variant="primary" icon={Plus} onClick={handleCreateInvoice}>Create Invoice</Button>
            </div>
         </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Form Modal (Create/Edit) */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} size="xl" title={formMode === 'create' ? "New Invoice" : "Edit Invoice"}>
         <div className="p-4">
            <InvoiceFormPage 
               mode={formMode} 
               invoiceType={invoiceType} 
               invoice={editingInvoice} 
               onSubmit={handleFormSubmit} 
               onCancel={() => setIsFormModalOpen(false)} 
            />
         </div>
      </Modal>

      {/* Detail Modal (View) */}
      {selectedInvoice && isDetailModalOpen && (
         <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} size="lg" title={`Invoice ${selectedInvoice.invoiceNumber}`}>
            <div className="p-6 space-y-6">
               <div className="flex justify-between border-b pb-4">
                  <div>
                     <h3 className="text-xl font-bold">{selectedInvoice.recipientName}</h3>
                     <p className="text-gray-500">{selectedInvoice.recipientEmail}</p>
                  </div>
                  <Badge size="lg">{selectedInvoice.status}</Badge>
               </div>

               {/* Items */}
               <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                     <tr>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Price</th>
                        <th className="p-2 text-right">Total</th>
                     </tr>
                  </thead>
                  <tbody>
                     {selectedInvoice.items.map((item, i) => (
                        <tr key={i} className="border-b">
                           <td className="p-2">{item.description}</td>
                           <td className="p-2 text-right">{item.quantity}</td>
                           <td className="p-2 text-right">{formatCurrency(item.rate)}</td>
                           <td className="p-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               
               <div className="flex justify-end pt-4">
                  <div className="w-64 space-y-2 text-right">
                     <div className="flex justify-between text-gray-600"><span>Subtotal:</span> <span>{formatCurrency(selectedInvoice.subtotal)}</span></div>
                     <div className="flex justify-between font-bold text-lg"><span>Total:</span> <span>{formatCurrency(selectedInvoice.totalAmount)}</span></div>
                  </div>
               </div>

               <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)} icon={Download}>Download PDF</Button>
                  {selectedInvoice.status === 'draft' && <Button variant="primary" onClick={() => handleSendInvoice(selectedInvoice)} icon={Send}>Send Invoice</Button>}
                  {selectedInvoice.status === 'sent' && <Button variant="success" onClick={() => handleMarkAsPaid(selectedInvoice)} icon={Check}>Mark Paid</Button>}
               </div>
            </div>
         </Modal>
      )}

      {/* Delete Confirmation */}
      <Modal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal({...confirmationModal, isOpen: false})} title="Confirm Deletion" size="sm">
         <div className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="mb-6 text-gray-600">Are you sure you want to delete <strong>{confirmationModal.invoiceName}</strong>? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
               <Button variant="outline" onClick={() => setConfirmationModal({...confirmationModal, isOpen: false})}>Cancel</Button>
               <Button variant="danger" onClick={confirmationModal.onConfirm}>Delete Invoice</Button>
            </div>
         </div>
      </Modal>

    </div>
  );
};

export default InvoicesPage;