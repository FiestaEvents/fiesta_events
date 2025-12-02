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
  AlertTriangle,
  X,
  Download,
  FolderOpen 
} from "lucide-react";

// ✅ Services
import { contractService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";

// ✅ Context & Hooks
import { useToast } from "../../hooks/useToast";
import formatCurrency from "../../utils/formatCurrency";

// ============================================
// STATS CARDS
// ============================================
const StatsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: "Total Contracts",
      value: stats?.total || 0,
      icon: FileText,
      color: "text-gray-600",
    },
    {
      label: "Pending Signatures",
      value: stats?.pendingSignatures || 0,
      icon: PenTool,
      color: "text-amber-600",
    },
    {
      label: "Revenue (Clients)",
      value: formatCurrency(stats?.revenue || 0),
      icon: DollarSign,
      color: "text-green-600",
      isValue: true,
    },
    {
      label: "Expenses (Partners)",
      value: formatCurrency(stats?.expenses || 0),
      icon: Briefcase,
      color: "text-red-500", 
      isValue: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {card.label}
              </span>
              <Icon size={16} className={card.color} />
            </div>
            <div
              className={`text-2xl font-bold ${card.isValue ? "text-orange-600" : "text-gray-900 dark:text-white"}`}
            >
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
  const { t, i18n } = useTranslation();
  const { promise, showSuccess, showError, showInfo } = useToast();

  // State
  const [contracts, setContracts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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
    actionType: "", 
    onConfirm: null,
  });

  // Status Config 
  const getStatusConfig = (status) => {
    const config = {
      draft: { label: t("contracts.status.draft"), color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300", icon: FileText },
      sent: { label: t("contracts.status.sent"), color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: Send },
      viewed: { label: t("contracts.status.viewed"), color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400", icon: MailOpen },
      signed: { label: t("contracts.status.signed"), color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
      expired: { label: t("contracts.status.expired"), color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: Clock },
      cancelled: { label: t("contracts.status.cancelled"), color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
      rejected: { label: t("contracts.status.rejected"), color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
    };
    return config[status] || config.draft;
  };

  // ============================================
  // FETCH DATA
  // ============================================
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { contractType: typeFilter }),
      };

      const [contractsRes, statsRes] = await Promise.all([
        contractService.getAll(params),
        contractService.getStats(),
      ]);

      let dataList = [];
      let paginationData = {};

      // ✅ FIX: Handle the specific JSON structure provided
      // Structure: { success: true, message: { contracts: [], pagination: {} } }
      if (contractsRes?.message?.contracts) {
        dataList = contractsRes.message.contracts;
        paginationData = contractsRes.message.pagination || {};
      } 
      // Fallback for other potential structures
      else if (contractsRes?.contracts) {
        dataList = contractsRes.contracts;
        paginationData = contractsRes.pagination || {};
      } else if (contractsRes?.data?.contracts) {
        dataList = contractsRes.data.contracts;
        paginationData = contractsRes.data.pagination || {};
      }

      setContracts(Array.isArray(dataList) ? dataList : []);
      setTotalPages(paginationData.pages || 1);
      setTotalCount(paginationData.total || (Array.isArray(dataList) ? dataList.length : 0));
      
      // Handle Stats structure if similar
      setStats(statsRes?.message || statsRes?.data || statsRes || {});
      
      // Update URL params
      const urlParams = {};
      if (search) urlParams.search = search;
      if (statusFilter) urlParams.status = statusFilter;
      if (typeFilter) urlParams.type = typeFilter;
      setSearchParams(urlParams);

    } catch (err) {
      console.error("Fetch error:", err);
      setContracts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setHasInitialLoad(true);
    }
  }, [page, limit, search, statusFilter, typeFilter, setSearchParams]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchContracts(); }, 300);
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
  };

  const handleDeleteClick = (row) => {
    setConfirmationModal({
      isOpen: true,
      contractId: row._id,
      contractTitle: row.title,
      actionType: "delete",
      onConfirm: async () => {
        try {
          await promise(contractService.delete(row._id), {
            loading: t("contracts.list.messages.deleting"),
            success: t("contracts.list.messages.deleteSuccess"),
            error: t("contracts.list.messages.deleteError"),
          });
          fetchContracts();
          setConfirmationModal((p) => ({ ...p, isOpen: false }));
        } catch (e) { console.error(e); }
      },
    });
  };

  const handleDownload = async (row) => {
    try {
      showInfo(t("contracts.list.messages.downloadStart"));
      const response = await contractService.download(row._id);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${row.title || "contract"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      showSuccess(t("contracts.list.messages.downloadSuccess"));
    } catch (err) {
      showError(t("contracts.list.messages.downloadError"));
    }
  };

  const handleEdit = (row) => navigate(`/contracts/${row._id}/edit`);
  const handleView = (row) => navigate(`/contracts/${row._id}`);

  // ============================================
  // LOGIC STATES
  // ============================================
  const hasActiveFilters = search.trim() !== "" || statusFilter !== "" || typeFilter !== "";
  
  // Empty State: No loading, no data, no filters, but HAS loaded once
  const showEmptyState = !loading && contracts.length === 0 && !hasActiveFilters && hasInitialLoad;
  
  // No Results: No loading, no data, BUT filters active
  const showNoResults = !loading && contracts.length === 0 && hasActiveFilters && hasInitialLoad;
  
  // Data: Not loading, has loaded once, has data
  const showData = !loading && hasInitialLoad && contracts.length > 0;
  
  const isRTL = i18n.dir() === "rtl";

  // ============================================
  // RENDER HELPERS
  // ============================================

  // ✅ Unified Pagination Footer
  const renderPagination = () => {
    const start = Math.min((page - 1) * limit + 1, totalCount);
    const end = Math.min(page * limit, totalCount);

    return (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div>
          Showing <span className="font-medium text-gray-900 dark:text-white">{start}</span> to{" "}
          <span className="font-medium text-gray-900 dark:text-white">{end}</span> of{" "}
          <span className="font-medium text-gray-900 dark:text-white">{totalCount}</span> results
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={null} 
            />
          )}
          <div className="flex items-center gap-2">
            <span>Per page:</span>
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

  // ============================================
  // TABLE COLUMNS
  // ============================================
  const columns = [
    {
      header: t("contracts.list.columns.info"),
      accessor: "title",
      width: "30%",
      render: (row) => {
        const isClient = row.contractType === "client";
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isClient ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600" : "bg-purple-100 dark:bg-purple-900/30 text-purple-600"}`}>
              <FileSignature size={18} />
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[200px]" title={row.title}>
                {row.title || t("contracts.list.untitled")}
              </div>
              <div className="text-xs text-gray-500 font-mono">{row.contractNumber || "NO-REF"}</div>
            </div>
          </div>
        );
      },
    },
    {
      header: t("contracts.list.columns.status"),
      accessor: "status",
      width: "15%",
      render: (row) => {
        const status = getStatusConfig(row.status);
        const Icon = status.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <Icon size={12} /> {status.label}
          </span>
        );
      },
    },
    {
      header: t("contracts.list.columns.party"),
      accessor: "party",
      width: "25%",
      render: (row) => {
        const isClient = row.contractType === "client";
        // ✅ FIX: Access party.name based on your JSON structure
        const partyName = row.party?.name || row.partyName || t("contracts.list.unknown");
        return (
          <div className="text-sm">
            <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
              {isClient ? <Users size={14} className="text-gray-400" /> : <Briefcase size={14} className="text-gray-400" />}
              <span className="truncate max-w-[180px]" title={partyName}>{partyName}</span>
            </div>
            {row.event && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <Calendar size={12} /><span className="truncate max-w-[180px]">{row.event.title}</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: t("contracts.list.columns.amount"),
      accessor: "totalAmount",
      width: "10%",
      // ✅ FIX: Access financials.totalTTC based on your JSON
      render: (row) => (
        <div className="font-bold text-green-600 dark:text-green-300">
            {formatCurrency(row.financials?.totalTTC || row.totalAmount || 0)}
        </div>
      ),
    },
    {
      header: t("contracts.list.columns.actions"),
      width: "20%",
      className: "text-center",
      render: (row) => {
        const canEdit = ["draft", "sent"].includes(row.status);
        return (
          <div className="flex justify-center gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleView(row); }} className="text-gray-500 hover:text-blue-600 hover:bg-blue-50">
              <Eye size={16}
              className="text-orange-600" />
            </Button>
            {canEdit && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(row); }} className="text-gray-500 hover:text-orange-600 hover:bg-orange-50">
                <Edit size={16} 
                className="text-blue-600"/>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDownload(row); }} className="text-gray-500 hover:text-green-600 hover:bg-green-50">
              <Download size={16} 
              className="text-green-600"/>
            </Button>
            {row.status === "draft" && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteClick(row); }} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("contracts.list.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("contracts.list.subtitle")}
            {hasInitialLoad && totalCount > 0 && ` • ${t("contracts.list.showingResults", { count: contracts.length, total: totalCount })}`}
          </p>
        </div>
        {!showEmptyState && (
            <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" onClick={() => navigate("/contracts/new?type=partner")} icon={Briefcase} className="flex-1 sm:flex-none justify-center">
                    {t("contracts.list.newPartner")}
                </Button>
                <Button variant="primary" onClick={() => navigate("/contracts/new?type=client")} icon={Plus} className="flex-1 sm:flex-none justify-center">
                    {t("contracts.list.newClient")}
                </Button>
            </div>
        )}
      </div>

      {/* 2. Stats & Filters (Hidden if empty) */}
      {!showEmptyState && hasInitialLoad && (
        <>
            <StatsCards stats={stats} />

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shrink-0">
                <div className="flex flex-col sm:flex-row gap-4">
                <Input className="flex-1" icon={Search} placeholder={t("contracts.list.searchPlaceholder")} value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
                <div className="sm:w-48">
                    <Select
                    icon={Filter} value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
                    options={[
                        { value: "", label: t("contracts.list.filter.allStatus") }, { value: "draft", label: t("contracts.status.draft") },
                        { value: "sent", label: t("contracts.status.sent") }, { value: "signed", label: t("contracts.status.signed") },
                    ]}
                    />
                </div>
                <div className="sm:w-48">
                    <Select
                    icon={Briefcase} value={typeFilter} onChange={(e) => { setPage(1); setTypeFilter(e.target.value); }}
                    options={[
                        { value: "", label: t("contracts.list.filter.allTypes") }, { value: "client", label: t("contracts.types.client") },
                        { value: "partner", label: t("contracts.types.partner") },
                    ]}
                    />
                </div>
                {hasActiveFilters && (
                    <Button variant="outline" icon={X} onClick={handleClearFilters}>
                        {t("common.actions.clear")}
                    </Button>
                )}
                </div>
            </div>
        </>
      )}

      {/* 3. Content Area */}
      <div className="flex-1 flex flex-col relative">
        
         {/* Loading Overlay */}
         {loading && !hasInitialLoad && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
            </div>
         )}

         {/* Data Table */}
         {showData && (
            <>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <Table
                    columns={columns}
                    data={contracts}
                    loading={loading}
                    onRowClick={(row) => navigate(`/contracts/${row._id}`)}
                    striped
                    hoverable
                    />
                </div>
                {renderPagination()}
            </>
         )}

         {/* ✅ NO RESULTS (Active Filter) */}
         {showNoResults && (
            <div className="flex flex-col items-center justify-center flex-1 py-12">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
                    <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("common.noResults")}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                    {t("contracts.list.noResultsDesc", "No contracts found. Try adjusting your search or filters.")}
                </p>
                <Button onClick={handleClearFilters} variant="outline" icon={X}>
                    {t("common.actions.clearFilters")}
                </Button>
            </div>
         )}

         {/* ✅ EMPTY STATE (No Data) - Enhanced Design */}
         {showEmptyState && (
            <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-6 ring-1 ring-gray-100 dark:ring-gray-700">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full">
                        <FileSignature className="h-12 w-12 text-orange-500" strokeWidth={1.5} />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("contracts.list.emptyTitle")}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-8 leading-relaxed">
                    {t("contracts.list.emptyDesc")}
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => navigate("/contracts/new?type=partner")} icon={Briefcase} className="shadow-sm">
                        {t("contracts.list.newPartner")}
                    </Button>
                    <Button variant="primary" onClick={() => navigate("/contracts/new?type=client")} icon={Plus} className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30">
                        {t("contracts.list.newClient")}
                    </Button>
                </div>
            </div>
         )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal((p) => ({ ...p, isOpen: false }))}
        title={t("contracts.list.dialog.deleteTitle")}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-full p-2 bg-red-100 dark:bg-red-900/20 text-red-600">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t("contracts.list.dialog.confirm")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("contracts.list.dialog.deleteMsg", { title: confirmationModal.contractTitle })}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmationModal((p) => ({ ...p, isOpen: false }))}>
                  {t("common.actions.cancel")}
                </Button>
                <Button variant="danger" onClick={confirmationModal.onConfirm} icon={Trash2}>
                  {t("common.actions.delete")}
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