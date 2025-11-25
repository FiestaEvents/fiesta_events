import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  Copy,
  Archive,
  Users,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileSignature,
  DollarSign,
  PenTool,
  MailOpen,
  MoreHorizontal,
  AlertTriangle,
  X,
  Download // ✅ Imported Download icon
} from "lucide-react";

// Services
import { contractService } from "../../api/index";

// Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import Badge from "../../components/common/Badge";

// Context & Hooks
import { useToast } from "../../hooks/useToast";
import formatCurrency from "../../utils/formatCurrency";

// ============================================
// STATUS CONFIG
// ============================================
const statusConfig = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300", icon: FileText },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Send },
  viewed: { label: "Viewed", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: MailOpen },
  signed: { label: "Signed", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  expired: { label: "Expired", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
};

// ============================================
// STATS CARDS
// ============================================
const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    { label: "Total Contracts", value: stats?.total || 0, icon: FileText, color: "text-gray-600" },
    { label: "Pending Signature", value: stats?.pendingSignatures || 0, icon: PenTool, color: "text-amber-600" },
    { label: "Signed", value: stats?.signed || 0, icon: CheckCircle, color: "text-green-600" },
    { label: "Total Value", value: formatCurrency(stats?.signedValue || 0), icon: DollarSign, color: "text-orange-600", isValue: true },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {card.label}
              </span>
              <Icon size={16} className={card.color} />
            </div>
            <div className={`text-2xl font-bold ${card.isValue ? 'text-orange-600' : 'text-gray-900 dark:text-white'}`}>
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ContractListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { showSuccess, showError, showInfo, promise } = useToast();

  // State
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Filters & Pagination
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "");
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Confirmation Modal
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    contractId: null,
    contractTitle: "",
    actionType: "", // 'delete' | 'send'
    onConfirm: null,
  });

  const [menuOpenId, setMenuOpenId] = useState(null);

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { contractType: typeFilter }),
      };

      // Parallel fetch
      const [contractsRes, statsRes] = await Promise.all([
        contractService.getAll(params),
        contractService.getStats(),
      ]);

      // ✅ DATA EXTRACTION
      const responseData = contractsRes?.message || contractsRes?.data || contractsRes || {};
      let dataList = responseData.contracts || [];
      if (!Array.isArray(dataList)) dataList = [];

      const paginationData = responseData.pagination || {};
      
      // ✅ PAGINATION MAPPING
      const pTotalPages = paginationData.pages || 1;
      const pTotalCount = paginationData.total || dataList.length || 0;

      setContracts(dataList);
      setTotalPages(pTotalPages);
      setTotalCount(pTotalCount);
      
      // Stats extraction
      setStats(statsRes?.message || statsRes?.data || statsRes || {});
      
      setHasInitialLoad(true);

      // Sync URL params
      const urlParams = {};
      if (search) urlParams.search = search;
      if (statusFilter) urlParams.status = statusFilter;
      if (typeFilter) urlParams.type = typeFilter;
      setSearchParams(urlParams);

    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load contracts";
      setError(errorMessage);
      showError(errorMessage);
      setContracts([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, statusFilter, typeFilter, setSearchParams, showError]);

  // Initial Load & Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContracts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchContracts]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setPage(1);
    showInfo("Filters cleared");
  };

  const handleActionClick = (action, contract) => {
    setMenuOpenId(null);
    
    if (action === "delete") {
      setConfirmationModal({
        isOpen: true,
        contractId: contract._id,
        contractTitle: contract.title,
        actionType: "delete",
        onConfirm: () => executeDelete(contract._id, contract.title)
      });
    } else if (action === "send") {
      setConfirmationModal({
        isOpen: true,
        contractId: contract._id,
        contractTitle: contract.title,
        actionType: "send",
        onConfirm: () => executeSend(contract._id, contract.title)
      });
    } else if (action === "duplicate") {
      executeDuplicate(contract._id);
    } else if (action === "archive") {
      executeArchive(contract._id);
    } else if (action === "download") {
      executeDownload(contract._id, contract.title);
    }
  };

  // --- Execute API Calls ---

  const executeDelete = async (id, title) => {
    try {
      await promise(contractService.delete(id), {
        loading: `Deleting "${title}"...`,
        success: "Contract deleted successfully",
        error: "Failed to delete contract"
      });
      fetchContracts();
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      // handled by toast
    }
  };

  const executeSend = async (id, title) => {
    try {
      await promise(contractService.send(id), {
        loading: `Sending "${title}"...`,
        success: "Contract sent successfully",
        error: "Failed to send contract"
      });
      fetchContracts();
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      // handled by toast
    }
  };

  const executeDuplicate = async (id) => {
    try {
      await promise(contractService.duplicate(id), {
        loading: "Duplicating contract...",
        success: "Contract duplicated successfully",
        error: "Failed to duplicate"
      });
      fetchContracts();
    } catch (err) {
      // handled by toast
    }
  };

  const executeArchive = async (id) => {
    try {
      await promise(contractService.archive(id), {
        loading: "Archiving contract...",
        success: "Contract archived successfully",
        error: "Failed to archive"
      });
      fetchContracts();
    } catch (err) {
      // handled by toast
    }
  };

  // ✅ ADDED: Download Handler
  const executeDownload = async (id, title) => {
    try {
      showInfo("Preparing download...");
      // Assuming contractService.download exists and returns a blob/url
      // If not, you might need to add it to your service or use a direct link
      const response = await contractService.download(id); 
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'contract'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showSuccess("Download started");
    } catch (err) {
      console.error("Download error", err);
      showError("Failed to download PDF");
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "" || typeFilter !== "";
  const showEmptyState = !loading && !error && contracts.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults = !loading && !error && contracts.length === 0 && hasActiveFilters && hasInitialLoad;

  const renderPaginationFooter = () => {
    if (totalCount === 0) return null;

    if (totalPages > 1) {
      return (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={limit}
            onPageSizeChange={(val) => { setLimit(val); setPage(1); }}
            totalItems={totalCount}
          />
        </div>
      );
    }

    const start = Math.min((page - 1) * limit + 1, totalCount);
    const end = Math.min(page * limit, totalCount);

    return (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div>
          Showing <span className="font-medium text-gray-900 dark:text-white">{start}</span> to{" "}
          <span className="font-medium text-gray-900 dark:text-white">{end}</span> of{" "}
          <span className="font-medium text-gray-900 dark:text-white">{totalCount}</span> results
        </div>
        <div className="flex items-center gap-2">
          <span>Per page:</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 p-1"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  // ============================================
  // COLUMNS
  // ============================================
  const columns = [
    {
      header: "Contract Info",
      accessor: "title",
      width: "30%",
      render: (row) => {
        const isClient = row.contractType === "client";
        return (
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isClient ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
              }`}>
                <FileSignature size={18} />
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]" title={row.title}>
                  {row.title || "Untitled Contract"}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {row.contractNumber || "NO-REF"}
                </div>
              </div>
          </div>
        );
      }
    },
    {
      header: "Status",
      accessor: "status",
      width: "15%",
      render: (row) => {
        const status = statusConfig[row.status] || statusConfig.draft;
        const Icon = status.icon;
        return (
           <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
              <Icon size={12} /> {status.label}
           </span>
        );
      }
    },
    {
      header: "Party / Event",
      accessor: "party",
      width: "25%",
      render: (row) => {
        const isClient = row.contractType === "client";
        // Safely access nested properties based on your API response
        const clientName = row.client?.name || "";
        const partnerName = row.partner?.name || "";
        const partyName = row.partyName || (isClient ? clientName : partnerName) || "Unknown Party";
        
        return (
          <div className="text-sm">
             <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                {isClient ? <Users size={14} className="text-gray-400"/> : <Briefcase size={14} className="text-gray-400"/>}
                <span className="truncate max-w-[180px]" title={partyName}>{partyName}</span>
             </div>
             {row.event && (
               <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <Calendar size={12} />
                  <span className="truncate max-w-[180px]">{row.event.title}</span>
               </div>
             )}
          </div>
        );
      }
    },
    {
      header: "Amount",
      accessor: "totalAmount",
      width: "15%",
      render: (row) => (
        <div className="font-bold text-gray-700 dark:text-gray-300">
          {formatCurrency(row.totalAmount)}
        </div>
      )
    },
    {
      header: "Actions",
      accessor: "actions",
      width: "15%",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2 relative">
           {/* Direct VIEW Action */}
           <Button 
             variant="ghost" 
             size="sm" 
             icon={Eye} 
             onClick={(e) => { e.stopPropagation(); navigate(`/contracts/${row._id}`); }} 
             className="text-gray-500 hover:text-orange-600" 
             title="View Details"
           />
           
           {/* Menu Trigger */}
           <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                icon={MoreHorizontal} 
                onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === row._id ? null : row._id); }} 
                className="text-gray-500 hover:text-gray-700" 
              />
              
              {menuOpenId === row._id && (
                <>
                  <div className="fixed inset-0 z-10 cursor-default" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                     
                     {/* View Action */}
                     <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/contracts/${row._id}`); }} 
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                     >
                        <Eye size={14} /> View Details
                     </button>

                     {/* ✅ ADDED: Download Action */}
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleActionClick("download", row); }} 
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                     >
                        <Download size={14} /> Download PDF
                     </button>

                     {/* Edit Action (Draft only) */}
                     {row.status === 'draft' && (
                        <button 
                           onClick={(e) => { e.stopPropagation(); navigate(`/contracts/${row._id}/edit`); }} 
                           className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-blue-600"
                        >
                           <Edit size={14} /> Edit Contract
                        </button>
                     )}

                     {/* Delete Action (Draft only) */}
                     {row.status === 'draft' && (
                        <button 
                           onClick={(e) => { e.stopPropagation(); handleActionClick("delete", row); }} 
                           className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 text-red-600"
                        >
                           <Trash2 size={14} /> Delete Contract
                        </button>
                     )}

                     <div className="my-1 border-t border-gray-100 dark:border-gray-700"></div>

                     {/* Duplicate Action */}
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleActionClick("duplicate", row); }} 
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                     >
                        <Copy size={14} /> Duplicate
                     </button>
                     
                     {/* Send Action (Draft only) */}
                     {row.status === 'draft' && (
                        <button 
                           onClick={(e) => { e.stopPropagation(); handleActionClick("send", row); }} 
                           className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                        >
                           <Send size={14} /> Send
                        </button>
                     )}
                     
                     {/* Archive Action */}
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleActionClick("archive", row); }} 
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                     >
                        <Archive size={14} /> Archive
                     </button>
                  </div>
                </>
              )}
           </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contracts</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your agreements {hasInitialLoad && totalCount > 0 && `(${totalCount})`}
          </p>
        </div>
        <div className="flex gap-2">
           {/* Buttons shown even on empty state to allow creation */}
           <Button variant="outline" onClick={() => navigate("/contracts/new?type=partner")} icon={Briefcase}>
             Partner
           </Button>
           <Button variant="primary" onClick={() => navigate("/contracts/new?type=client")} icon={Plus}>
             Contract
           </Button>
        </div>
      </div>

      {/* Stats */}
      {hasInitialLoad && <StatsCards stats={stats} />}

      {/* Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
               className="flex-1" 
               icon={Search} 
               placeholder="Search contracts..." 
               value={search} 
               onChange={(e) => { setPage(1); setSearch(e.target.value); }} 
            />
            <div className="sm:w-48">
              <Select 
                icon={Filter}
                value={statusFilter}
                onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
                options={[
                  { value: "", label: "All Status" },
                  ...Object.entries(statusConfig).map(([k, v]) => ({ value: k, label: v.label }))
                ]}
              />
            </div>
            <div className="sm:w-48">
               <Select
                  icon={Briefcase}
                  value={typeFilter}
                  onChange={(e) => { setPage(1); setTypeFilter(e.target.value); }}
                  options={[
                     { value: "", label: "All Types" },
                     { value: "client", label: "Client Contracts" },
                     { value: "partner", label: "Partner Contracts" }
                  ]}
               />
            </div>
            {hasActiveFilters && (
              <Button variant="outline" icon={X} onClick={handleClearFilters}>Clear</Button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !hasInitialLoad && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Loading contracts...</p>
        </div>
      )}

      {/* Table Content */}
      {!loading && hasInitialLoad && contracts.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={contracts}
              loading={loading}
              onRowClick={(row) => navigate(`/contracts/${row._id}`)}
              striped
              hoverable
            />
          </div>
          
          {renderPaginationFooter()}
        </>
      )}

      {/* Empty / No Results States */}
      {showNoResults ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
          <Button onClick={handleClearFilters} variant="outline">Clear Filters</Button>
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <FileSignature className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No contracts created yet</h3>
          <p className="text-gray-500 mb-6">Create your first contract to get started</p>
          <div className="flex justify-center gap-3">
             <Button variant="outline" onClick={() => navigate("/contracts/new?type=partner")} icon={Briefcase}>
               New Partner Contract
             </Button>
             <Button variant="primary" onClick={() => navigate("/contracts/new?type=client")} icon={Plus}>
               New Client Contract
             </Button>
          </div>
        </div>
      ) : null}

      {/* Generic Confirmation Modal */}
      <Modal 
        isOpen={confirmationModal.isOpen} 
        onClose={() => setConfirmationModal(p => ({ ...p, isOpen: false }))} 
        title={confirmationModal.actionType === "delete" ? "Delete Contract" : "Send Contract"} 
        size="md"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 rounded-full p-2 ${
              confirmationModal.actionType === 'delete' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {confirmationModal.actionType === 'delete' ? <AlertTriangle size={24} /> : <Send size={24} />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {confirmationModal.actionType === 'delete' ? "Confirm Deletion" : "Confirm Sending"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {confirmationModal.actionType === 'delete' 
                  ? `Are you sure you want to delete "${confirmationModal.contractTitle}"? This action cannot be undone.`
                  : `Are you sure you want to send "${confirmationModal.contractTitle}" for signing?`
                }
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmationModal(p => ({ ...p, isOpen: false }))}>
                  Cancel
                </Button>
                <Button 
                  variant={confirmationModal.actionType === 'delete' ? 'danger' : 'primary'} 
                  onClick={confirmationModal.onConfirm}
                  icon={confirmationModal.actionType === 'delete' ? Trash2 : Send}
                >
                  {confirmationModal.actionType === 'delete' ? "Delete" : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ContractListPage;