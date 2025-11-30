import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
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
  Filter,
  X,
  FolderOpen
} from "lucide-react";

// ✅ Generic Components
import Badge, { StatusBadge } from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";

// ✅ Services & Utils
import { invoiceService } from "../../api/index";
import { useToast } from "../../context/ToastContext";
import formatCurrency from "../../utils/formatCurrency";

const InvoicesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Logic State
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [invoiceType, setInvoiceType] = useState("client"); // 'client' or 'partner'

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    startDate: "",
    endDate: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selection & Modals
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
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
      items: invoice.items || [],
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
      const statsData = Array.isArray(data) ? (data.find((s) => s._id === invoiceType) || {}) : data;

      setStats({
        totalRevenue: statsData.totalRevenue || 0,
        paid: statsData.paid || 0,
        totalDue: statsData.totalDue || 0,
        overdue: statsData.overdue || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [filters, invoiceType]);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        search: searchTerm.trim() || undefined,
        invoiceType: invoiceType,
        status: filters.status !== "all" ? filters.status : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        page,
        limit,
        sort: "-createdAt",
      };

      const response = await invoiceService.getAll(params);
      
      let rawData = response?.invoices || response?.data?.invoices || [];
      const data = rawData.map(normalizeInvoiceData).filter(Boolean);
      
      const pTotalPages = response?.pagination?.pages || response?.data?.pagination?.pages || 1;
      const pTotalCount = response?.pagination?.total || response?.data?.pagination?.total || data.length;

      setInvoices(data);
      setTotalPages(pTotalPages);
      setTotalCount(pTotalCount);
      setHasInitialLoad(true);
    } catch (err) {
      const msg = err.response?.data?.message || t("invoices.errors.loadInvoicesFailed");
      setError(msg);
      showError(msg);
      setInvoices([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters, page, limit, invoiceType, t, showError]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { 
      setPage(1); 
      setSelectedRows([]); 
  }, [invoiceType]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleCreateInvoice = () => navigate(`/invoices/new?type=${invoiceType}`);
  
  const handleEditInvoice = (invoice) => navigate(`/invoices/${invoice._id}/edit`);

  const handleRowClick = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  }, []);

  const handleDownloadInvoice = async (invoice) => {
    try {
      showInfo(t("invoices.download.generating"));
      const blob = await invoiceService.download(invoice._id);
      if (!blob || blob.size === 0) throw new Error(t("invoices.errors.emptyFile"));
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess(t("invoices.download.success", { invoiceNumber: invoice.invoiceNumber }));
    } catch (err) {
      showError(t("invoices.download.errors.generic"));
    }
  };

  const handleDeleteConfirm = async (id, name) => {
    try {
        await promise(invoiceService.delete(id), {
            loading: t("invoices.delete.loading"),
            success: t("invoices.delete.success", { invoiceName: name }),
            error: t("invoices.delete.error", { invoiceName: name })
        });
        fetchInvoices();
        fetchStats();
        setConfirmationModal({ isOpen: false, invoiceId: null, invoiceName: "", onConfirm: null });
        if (selectedInvoice?._id === id) setIsDetailModalOpen(false);
    } catch (e) {
        // Handled by promise
    }
  };

  const handleDeleteClick = (id, name) => {
    setConfirmationModal({
      isOpen: true,
      invoiceId: id,
      invoiceName: name,
      onConfirm: () => handleDeleteConfirm(id, name)
    });
  };

  const handleClearFilters = () => {
    setFilters({ status: "all", startDate: "", endDate: "" });
    setSearchTerm("");
    setPage(1);
    showInfo(t("invoices.filters.clear"));
  };

  // Logic for UI States
  const hasActiveFilters = searchTerm.trim() !== "" || filters.status !== "all" || filters.startDate !== "" || filters.endDate !== "";
  const showEmptyState = !loading && !error && invoices.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults = !loading && !error && invoices.length === 0 && hasActiveFilters && hasInitialLoad;
  const showData = !loading && hasInitialLoad && invoices.length > 0;

  // ==========================================
  // RENDER HELPERS
  // ==========================================
  
  const renderPagination = () => {
    const start = Math.min((page - 1) * limit + 1, totalCount);
    const end = Math.min(page * limit, totalCount);

    return (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        
        {/* Left: Info Text */}
        <div>
          {t("invoices.pagination.showing", { start, end, total: totalCount })}
        </div>

        {/* Right: Pagination Buttons + Per Page Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          {totalPages > 1 && (
             <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={null} 
             />
          )}

          {/* Explicit "Per page" Dropdown */}
          <div className="flex items-center gap-2">
            <span>{t("invoices.pagination.perPage")}</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="bg-white border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 py-1"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // COLUMNS
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
      header: t("invoices.table.headers.recipient"),
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
      render: (row) => <div className="text-gray-600 dark:text-gray-400 font-mono text-sm">{formatDate(row.dueDate)}</div>
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
      header: t("invoices.table.headers.actions"),
      width: "20%",
      className: "text-center",
      render: (row) => {
        const canEdit = ["draft", "sent"].includes(row.status);
        return (
          <div className="flex justify-center gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleRowClick(row); }} className="text-gray-500 hover:text-blue-600" title={t("invoices.actions.view")}>
              <Eye size={16} />
            </Button>
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditInvoice(row); }} className="text-gray-500 hover:text-orange-600" title={t("invoices.actions.edit")}>
                <Edit size={16} />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(row); }} className="text-gray-500 hover:text-green-600" title={t("invoices.actions.download")}>
              <Download size={16} />
            </Button>
            {row.status === "draft" && (
               <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(row._id, row.invoiceNumber); }} className="text-gray-500 hover:text-red-600" title={t("invoices.actions.delete")}>
                 <Trash2 size={16} />
               </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("invoices.title")}</h1>
          <p className="text-gray-500 dark:text-gray-400">
             {t("invoices.subtitle", { type: invoiceType === 'client' ? t("invoices.recipient.client") : t("invoices.recipient.partner") })}
             {hasInitialLoad && totalCount > 0 && ` (${totalCount})`}
          </p>
        </div>
        
        {/* Actions */}
        {!showEmptyState && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="outline" icon={Settings} onClick={() => navigate("/invoices/settings")} className="hidden md:flex">
                    {t("invoices.settings")}
                </Button>
                <Button variant="primary" icon={Plus} onClick={handleCreateInvoice} className="flex-1 sm:flex-none justify-center">
                    {t("invoices.create.button", { type: t("invoices.types.invoice") })}
                </Button>
            </div>
        )}
      </div>

      {/* 2. STATS & TABS */}
      {!showEmptyState && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <StatBox label={t("invoices.stats.totalRevenue")} value={stats?.totalRevenue} loading={statsLoading} icon={TrendingUp} color="blue" />
                <StatBox label={t("invoices.stats.paid")} value={stats?.paid} loading={statsLoading} icon={CheckCircle} color="green" />
                <StatBox label={t("invoices.stats.pending")} value={stats?.totalDue} loading={statsLoading} icon={Clock} color="yellow" />
                <StatBox label={t("invoices.stats.overdue")} value={stats?.overdue} loading={statsLoading} icon={XCircle} color="red" />
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shrink-0 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 self-start md:self-auto">
                        <button 
                            onClick={() => setInvoiceType("client")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                            invoiceType === "client" ? "bg-white shadow text-orange-600 dark:bg-gray-600 dark:text-white" : "text-gray-500 dark:text-gray-300 hover:text-gray-900"
                            }`}
                        >
                            <Users size={16} /> {t("invoices.tabs.clients")}
                        </button>
                        <button 
                            onClick={() => setInvoiceType("partner")}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                            invoiceType === "partner" ? "bg-white shadow text-orange-600 dark:bg-gray-600 dark:text-white" : "text-gray-500 dark:text-gray-300 hover:text-gray-900"
                            }`}
                        >
                            <Briefcase size={16} /> {t("invoices.tabs.partners")}
                        </button>
                    </div>

                    <div className="flex gap-3 flex-1 justify-end w-full md:w-auto">
                        <Input 
                            className="w-full md:w-64"
                            icon={Search} 
                            placeholder={t("invoices.recipient.searchPlaceholder")} 
                            value={searchTerm} 
                            onChange={(e) => { setPage(1); setSearchTerm(e.target.value); }} 
                        />
                        <Button variant="outline" icon={Filter} onClick={() => setShowFilters(!showFilters)} className={showFilters ? "bg-gray-100 dark:bg-gray-700" : ""}>
                            {t("invoices.filters.status")}
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="ghost" icon={X} onClick={handleClearFilters} className="text-gray-500">
                                {t("invoices.filters.clear")}
                            </Button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                        <Select 
                            label={t("invoices.filters.status")} 
                            value={filters.status} 
                            onChange={(e) => { setPage(1); setFilters(p => ({...p, status: e.target.value})) }}
                            options={[
                            { value: "all", label: t("invoices.status.all") },
                            { value: "draft", label: t("invoices.status.draft") },
                            { value: "sent", label: t("invoices.status.sent") },
                            { value: "paid", label: t("invoices.status.paid") },
                            { value: "overdue", label: t("invoices.status.overdue") }
                            ]}
                        />
                        <Input type="date" label={t("invoices.filters.startDate")} value={filters.startDate} onChange={(e) => setFilters(p => ({...p, startDate: e.target.value}))} />
                        <Input type="date" label={t("invoices.filters.endDate")} value={filters.endDate} onChange={(e) => setFilters(p => ({...p, endDate: e.target.value}))} />
                    </div>
                )}
            </div>
        </>
      )}

      {/* 3. CONTENT AREA */}
      <div className="flex-1 flex flex-col relative">
         {loading && !hasInitialLoad && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">{t("invoices.create.loading")}</p>
            </div>
         )}

         {/* Data & Pagination */}
         {showData && (
            <>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <Table 
                        columns={columns} 
                        data={invoices} 
                        onRowClick={handleRowClick}
                        selectable={true}
                        selectedRows={selectedRows}
                        onSelectionChange={setSelectedRows}
                        striped
                        hoverable
                    />
                </div>
                {/* ✅ Render the Unified Pagination Footer */}
                {renderPagination()}
            </>
         )}

         {/* No Results & Empty States */}
         {showNoResults && (
            <div className="flex flex-col items-center justify-center flex-1 py-12">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("invoices.empty.noResults")}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                    {t("invoices.empty.noResultsDesc")}
                </p>
                <Button onClick={handleClearFilters} variant="outline" icon={X}>{t("invoices.empty.clearAll")}</Button>
            </div>
         )}

         {showEmptyState && (
            <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-6 ring-1 ring-gray-100 dark:ring-gray-700">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full">
                        <FileText className="h-12 w-12 text-orange-500" strokeWidth={1.5} />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("invoices.empty.title")}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8 leading-relaxed">
                    {t("invoices.empty.description")}
                </p>
                <Button onClick={handleCreateInvoice} variant="primary" size="lg" icon={Plus} className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow">
                    {t("invoices.create.firstButton")}
                </Button>
            </div>
         )}
      </div>

      {/* ================= MODALS ================= */}
      {selectedInvoice && isDetailModalOpen && (
         <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} size="lg" title={t("invoices.modal.title", { number: selectedInvoice.invoiceNumber })}>
            <div className="p-6 space-y-6">
               <div className="flex justify-between border-b pb-4 border-gray-100 dark:border-gray-700">
                  <div>
                     <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedInvoice.recipientName}</h3>
                     <p className="text-gray-500">{selectedInvoice.recipientEmail}</p>
                     <p className="text-xs text-gray-400 mt-1">{selectedInvoice.recipientCompany}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={selectedInvoice.status} size="lg" />
                    <p className="text-xs text-gray-400 mt-2">{t("invoices.modal.due")} {formatDate(selectedInvoice.dueDate)}</p>
                  </div>
               </div>
               <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                   <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                         <tr>
                            <th className="p-3 text-left">{t("invoices.modal.headers.description")}</th>
                            <th className="p-3 text-right">{t("invoices.modal.headers.qty")}</th>
                            <th className="p-3 text-right">{t("invoices.modal.headers.price")}</th>
                            <th className="p-3 text-right">{t("invoices.modal.headers.total")}</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                         {selectedInvoice.items.map((item, i) => (
                            <tr key={i}>
                               <td className="p-3 text-gray-900 dark:text-white">{item.description}</td>
                               <td className="p-3 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                               <td className="p-3 text-right text-gray-600 dark:text-gray-400">{formatCurrency(item.rate)}</td>
                               <td className="p-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
               </div>
               <div className="flex justify-end pt-2">
                  <div className="w-64 space-y-2 text-right">
                     <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                         <span>{t("invoices.modal.total")}</span> <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                     </div>
                  </div>
               </div>
               <div className="flex justify-end gap-2 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <Button variant="outline" onClick={() => handleDownloadInvoice(selectedInvoice)} icon={Download}>{t("invoices.actions.download")}</Button>
                  {selectedInvoice.status === 'draft' && (
                    <Button variant="primary" onClick={() => { setIsDetailModalOpen(false); handleEditInvoice(selectedInvoice); }} icon={Edit}>{t("invoices.actions.edit")}</Button>
                  )}
               </div>
            </div>
         </Modal>
      )}

      <Modal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal(p => ({ ...p, isOpen: false }))} title={t("invoices.delete.title")} size="md">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-2">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("invoices.delete.title")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t("invoices.delete.message", { name: confirmationModal.invoiceName })}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmationModal(p => ({ ...p, isOpen: false }))}>{t("invoices.actions.cancel")}</Button>
                <Button variant="danger" onClick={confirmationModal.onConfirm} icon={Trash2}>{t("invoices.actions.delete")}</Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  );
};

// --- Helper Component ---
const StatBox = ({ label, value, loading, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    yellow: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`p-3 rounded-lg ${colors[color]}`}><Icon className="w-6 h-6" /></div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{loading ? "..." : formatCurrency(value)}</p>
      </div>
    </div>
  );
};

export default InvoicesPage;