import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Eye,
  Mail,
  Plus,
  Search,
  Send,
  Settings,
  Trash2,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";

// ✅ Generic Components
import Badge, { StatusBadge } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable"; // Internal pagination supported
import Select from "../../components/common/Select";
import InvoiceFormPage from "./InvoiceFormPage";

// ✅ Services & Utils
import { invoiceService } from "../../api/index";
import { useToast } from "../../hooks/useToast";
import formatCurrency from "../../utils/formatCurrency";

const InvoicesPage = () => {
  const navigate = useNavigate();
  const { showSuccess, apiError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  
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
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    invoiceId: null,
    invoiceName: "",
    onConfirm: null
  });

  // ✅ Helper: Strict DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // ==========================================
  // DATA NORMALIZATION
  // ==========================================
  const normalizeInvoiceData = (invoice) => {
    if (!invoice || typeof invoice !== "object") return null;

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

      const data = response?.stats || response?.data?.stats || {};

      if (Array.isArray(data)) {
        const typeStats = data.find((s) => s._id === invoiceType) || {};
        setStats({
          totalRevenue: typeStats.totalRevenue || 0,
          paid: typeStats.paid || 0,
          totalDue: typeStats.totalDue || 0,
          overdue: typeStats.overdue || 0
        });
      } else {
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
      apiError(error, t("invoices.errors.loadInvoicesFailed"));
      setInvoices([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, currentPage, pageSize, invoiceType, t, apiError]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setCurrentPage(1); setSelectedRows([]); }, [invoiceType]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleCreateInvoice = () => {
    setFormMode("create");
    setEditingInvoice(null);
    setIsFormModalOpen(true);
  };

  const handleRowClick = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditInvoice = async (invoice) => {
    try {
      const response = await invoiceService.getById(invoice._id);
      const fullInvoice = response?.invoice || response?.data?.invoice || invoice;
      setFormMode("edit");
      setEditingInvoice(normalizeInvoiceData(fullInvoice));
      setIsDetailModalOpen(false);
      setIsFormModalOpen(true);
    } catch (error) {
      apiError(error, t("invoices.errors.loadDetailsFailed"));
    }
  };

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
      // Toast handled by promise
    }
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
      apiError(err, t("invoices.download.errors.generic"));
    }
  };

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
          apiError(err, t("invoices.delete.error"));
        }
      }
    });
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

  const handleClearFilters = () => {
    setFilters({ status: "", startDate: "", endDate: "" });
    setSearchTerm("");
  };

  // ==========================================
  // TABLE CONFIG
  // ==========================================
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
      render: (row) => <div className="text-gray-600 dark:text-gray-400 font-mono">{formatDate(row.dueDate)}</div>
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
      render: (row) => <StatusBadge status={row.status} size="sm" />
    },
    {
      header: "Actions",
      width: "20%",
      className: "text-center",
      render: (row) => {
        const canEdit = ["draft", "sent"].includes(row.status);
        return (
          <div className="flex justify-center gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRowClick(row); }} className="text-gray-500 hover:text-blue-600">
              <Eye size={16} />
            </Button>
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditInvoice(row); }} className="text-gray-500 hover:text-orange-600">
                <Edit size={16} />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(row); }} className="text-gray-500 hover:text-green-600">
              <Download size={16} />
            </Button>
            {row.status === "draft" && (
               <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(row._id, row.invoiceNumber); }} className="text-gray-500 hover:text-red-600">
                 <Trash2 size={16} />
               </Button>
            )}
          </div>
        );
      }
    }
  ];

  if (loading && !hasInitialLoad) return <div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="p-6 bg-white space-y-6 dark:bg-gray-900 min-h-screen">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("invoices.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your {invoiceType} invoices</p>
        </div>
        
        <div className="flex items-center gap-3">
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
        <StatBox label="Total Revenue" value={stats?.totalRevenue} loading={statsLoading} icon={TrendingUp} color="blue" />
        <StatBox label="Paid" value={stats?.paid} loading={statsLoading} icon={CheckCircle} color="green" />
        <StatBox label="Pending" value={stats?.totalDue} loading={statsLoading} icon={Clock} color="yellow" />
        <StatBox label="Overdue" value={stats?.overdue} loading={statsLoading} icon={XCircle} color="red" />
      </div>

      {/* 3. CONTROLS */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
           {/* Type Toggle */}
           <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button 
                onClick={() => setInvoiceType("client")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  invoiceType === "client" ? "bg-white shadow text-orange-600 dark:bg-gray-600 dark:text-white" : "text-gray-500 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                <Users size={16} /> Client Invoices
              </button>
              <button 
                onClick={() => setInvoiceType("partner")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  invoiceType === "partner" ? "bg-white shadow text-orange-600 dark:bg-gray-600 dark:text-white" : "text-gray-500 dark:text-gray-300 hover:text-gray-900"
                }`}
              >
                <Briefcase size={16} /> Partner Bills
              </button>
           </div>

           {/* Search & Filter */}
           <div className="flex gap-3 flex-1 justify-end w-full md:w-auto">
              <div className="w-full md:w-64">
                 <Input 
                   icon={Search} 
                   placeholder="Search..." 
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
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <Select 
                label="Status" 
                value={filters.status} 
                onChange={(e) => setFilters(p => ({...p, status: e.target.value}))}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "draft", label: "Draft" },
                  { value: "sent", label: "Sent" },
                  { value: "paid", label: "Paid" },
                  { value: "overdue", label: "Overdue" }
                ]}
              />
              <Input type="date" label="Start Date" value={filters.startDate} onChange={(e) => setFilters(p => ({...p, startDate: e.target.value}))} />
              <Input type="date" label="End Date" value={filters.endDate} onChange={(e) => setFilters(p => ({...p, endDate: e.target.value}))} />
              <div className="sm:col-span-3 flex justify-end">
                 <Button variant="ghost" onClick={handleClearFilters}>Clear Filters</Button>
              </div>
           </div>
        )}
      </div>

      {/* 4. TABLE WITH INTEGRATED PAGINATION */}
      {invoices.length > 0 ? (
        <Table 
           columns={columns} 
           data={invoices} 
           onRowClick={handleRowClick}
           selectable={true}
           selectedRows={selectedRows}
           onSelectionChange={setSelectedRows}
           striped
           // Pagination props
           pagination={true}
           currentPage={currentPage}
           totalPages={totalPages}
           totalItems={totalItems}
           onPageChange={setCurrentPage}
           pageSize={pageSize}
           onPageSizeChange={setPageSize}
        />
      ) : (
         <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300 dark:bg-gray-800 dark:border-gray-700">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No invoices found</h3>
            <Button variant="primary" icon={Plus} onClick={handleCreateInvoice} className="mt-4">Create Invoice</Button>
         </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Form Modal */}
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

      {/* Detail Modal */}
      {selectedInvoice && isDetailModalOpen && (
         <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} size="lg" title={`Invoice ${selectedInvoice.invoiceNumber}`}>
            <div className="p-6 space-y-6">
               <div className="flex justify-between border-b pb-4 border-gray-100 dark:border-gray-700">
                  <div>
                     <h3 className="text-xl font-bold">{selectedInvoice.recipientName}</h3>
                     <p className="text-gray-500">{selectedInvoice.recipientEmail}</p>
                  </div>
                  <StatusBadge status={selectedInvoice.status} size="lg" />
               </div>

               <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                     <tr>
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-right">Qty</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total</th>
                     </tr>
                  </thead>
                  <tbody>
                     {selectedInvoice.items.map((item, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                           <td className="p-3">{item.description}</td>
                           <td className="p-3 text-right">{item.quantity}</td>
                           <td className="p-3 text-right">{formatCurrency(item.rate)}</td>
                           <td className="p-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               
               <div className="flex justify-end pt-4">
                  <div className="w-64 space-y-2 text-right">
                     <div className="flex justify-between text-lg font-bold"><span>Total:</span> <span>{formatCurrency(selectedInvoice.totalAmount)}</span></div>
                  </div>
               </div>

               <div className="flex justify-end gap-2 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)} icon={Download}>Download PDF</Button>
                  {selectedInvoice.status === 'draft' && <Button variant="primary" onClick={() => navigate(`/invoices/send/${selectedInvoice._id}`)} icon={Send}>Send Invoice</Button>}
               </div>
            </div>
         </Modal>
      )}

      {/* Delete Confirmation */}
      <Modal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal({...confirmationModal, isOpen: false})} title="Confirm Deletion" size="sm">
         <div className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="mb-6 text-gray-600">Are you sure you want to delete <strong>{confirmationModal.invoiceName}</strong>?</p>
            <div className="flex justify-center gap-3">
               <Button variant="outline" onClick={() => setConfirmationModal({...confirmationModal, isOpen: false})}>Cancel</Button>
               <Button variant="danger" onClick={confirmationModal.onConfirm}>Delete</Button>
            </div>
         </div>
      </Modal>

    </div>
  );
};

// --- Helper Sub-component ---
const StatBox = ({ label, value, loading, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {loading ? "..." : formatCurrency(value)}
        </p>
      </div>
    </div>
  );
};

export default InvoicesPage;