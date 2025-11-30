import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Edit,
  Trash2,
  Users,
  Star,
  AlertTriangle,
  FolderOpen // ✅ Added for No Results state
} from "lucide-react";

// ✅ API & Services
import { partnerService } from "../../api/index";

// ✅ Generic Components & Utils
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination"; // ✅ Added for unified footer

// ✅ Context
import { useToast } from "../../context/ToastContext"; // Ensure correct path based on previous files

// ✅ Sub-components
import PartnerForm from "./PartnerForm";
import PartnerDetailModal from "./PartnerDetailModal";

const PartnersList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // State
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Confirmation modal
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    partnerId: null,
    partnerName: "",
    onConfirm: null,
  });

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const categoryOptions = [
    { value: "all", label: t("partners.actions.filters.allCategories") },
    { value: "driver", label: "Driver" },
    { value: "bakery", label: "Bakery" },
    { value: "catering", label: "Catering" },
    { value: "decoration", label: "Decoration" },
    { value: "photography", label: "Photography" },
    { value: "music", label: "Music" },
    { value: "security", label: "Security" },
    { value: "cleaning", label: "Cleaning" },
    { value: "audio_visual", label: "Audio/Visual" },
    { value: "floral", label: "Floral" },
    { value: "entertainment", label: "Entertainment" },
    { value: "hairstyling", label: "Hair Styling" },
    { value: "other", label: "Other" },
  ];

  // Fetch partners
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(category !== "all" && { category }),
      };

      const response = await partnerService.getAll(params);
      
      // Robust data extraction
      let data = response?.partners || response?.data || response || [];
      if (!Array.isArray(data)) data = [];

      // Pagination extraction
      const pagination = response?.pagination || {
        pages: 1,
        total: data.length
      };

      setPartners(data.filter(p => p && p._id));
      setTotalPages(pagination.pages || 1);
      setTotalCount(pagination.total || data.length);
      setHasInitialLoad(true);
    } catch (err) {
      const msg = err.response?.data?.message || t("partners.errors.loading");
      setError(msg);
      showError(msg);
      setPartners([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, page, limit, t, showError]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // --- Handlers ---

  const handleDeleteConfirm = useCallback(async (partnerId, partnerName) => {
    try {
      await promise(partnerService.delete(partnerId), {
        loading: t("partners.deleteModal.deleting", { name: partnerName }),
        success: t("partners.notifications.deleted"),
        error: t("partners.deleteModal.errorDeleting", { name: partnerName }),
      });

      fetchPartners();
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      if (selectedPartner?._id === partnerId) setIsDetailModalOpen(false);
    } catch (err) {
      // Promise toast handles UI feedback
    }
  }, [fetchPartners, selectedPartner, promise, t]);

  const handleDeletePartner = (partnerId, partnerName) => {
    setConfirmationModal({
      isOpen: true,
      partnerId,
      partnerName,
      onConfirm: () => handleDeleteConfirm(partnerId, partnerName),
    });
  };

  const handleFormSuccess = () => {
    fetchPartners();
    setIsFormOpen(false);
    showSuccess(selectedPartner ? t("partners.notifications.updated") : t("partners.notifications.added"));
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setCategory("all");
    setPage(1);
    showInfo(t("partners.notifications.filtersCleared"));
  };

  const formatCategory = (cat) => categoryOptions.find((opt) => opt.value === cat)?.label || cat;

  // Logic States
  const hasActiveFilters = search.trim() !== "" || status !== "all" || category !== "all";
  const showEmptyState = !loading && !error && partners.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults = !loading && !error && partners.length === 0 && hasActiveFilters && hasInitialLoad;
  const showData = !loading && hasInitialLoad && partners.length > 0;

  // Table Columns
  const columns = [
    {
      header: t("partners.table.columns.name"),
      accessor: "name",
      sortable: true,
      width: "20%",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.name || "Unnamed"}</div>
          {row.company && <div className="text-xs text-gray-500 dark:text-gray-400">{row.company}</div>}
        </div>
      ),
    },
    {
      header: t("partners.table.columns.contact"),
      accessor: "email",
      sortable: true,
      width: "20%",
      render: (row) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">{row.email || "-"}</div>
          <div className="text-gray-600 dark:text-gray-400">{row.phone || "-"}</div>
        </div>
      ),
    },
    {
      header: t("partners.table.columns.category"),
      accessor: "category",
      sortable: true,
      width: "15%",
      render: (row) => <Badge variant="info">{formatCategory(row.category)}</Badge>,
    },
    {
      header: t("partners.table.columns.rating"),
      accessor: "rating",
      sortable: true,
      width: "12%",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">{row.rating?.toFixed(1) || "0.0"}</span>
          <span className="text-xs text-gray-500">({row.totalJobs || 0})</span>
        </div>
      ),
    },
    {
      header: t("partners.table.columns.status"),
      accessor: "status",
      sortable: true,
      width: "12%",
      render: (row) => (
        <Badge variant={row.status === "active" ? "success" : "danger"}>
          {row.status === "active" ? t("partners.actions.filters.active") : t("partners.actions.filters.inactive")}
        </Badge>
      ),
    },
    {
      header: t("partners.table.columns.price"),
      accessor: "price",
      width: "10%",
      render: (row) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.priceType === "hourly" ? `${row.hourlyRate} TND/hr` : `${row.fixedRate} TND`}
        </div>
      ),
    },
    {
      header: t("partners.table.columns.actions"),
      accessor: "actions",
      width: "10%",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); navigate(`/partners/${row._id}`, { state: { partner: row } }); }}
            className="text-gray-500 hover:text-orange-600"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); setSelectedPartner(row); setIsFormOpen(true); }}
            className="text-gray-500 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); handleDeletePartner(row._id, row.name); }} 
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

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

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("partners.title")}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("partners.subtitle")}
            {hasInitialLoad && totalCount > 0 && ` • ${t("partners.showingResults", { count: partners.length, total: totalCount })}`}
          </p>
        </div>
        {/* Only show header Add button if NOT in empty state */}
        {!showEmptyState && (
          <Button variant="primary" icon={Plus} onClick={() => { setSelectedPartner(null); setIsFormOpen(true); }}>
            {t("partners.actions.addPartner")}
          </Button>
        )}
      </div>

      {/* Filters (Hide in pure empty state) */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input 
              className="flex-1" 
              icon={Search} 
              placeholder={t("partners.actions.search")} 
              value={search} 
              onChange={(e) => { setPage(1); setSearch(e.target.value); }} 
            />
            <div className="sm:w-48">
              <Select 
                icon={Filter} 
                value={category} 
                onChange={(e) => { setPage(1); setCategory(e.target.value); }} 
                options={categoryOptions} 
              />
            </div>
            <div className="sm:w-40">
              <Select 
                value={status} 
                onChange={(e) => { setPage(1); setStatus(e.target.value); }} 
                options={[
                  { value: "all", label: t("partners.actions.filters.allStatus") },
                  { value: "active", label: t("partners.actions.filters.active") },
                  { value: "inactive", label: t("partners.actions.filters.inactive") },
                ]} 
              />
            </div>
            {hasActiveFilters && (
              <Button variant="outline" icon={X} onClick={handleClearFilters}>
                {t("partners.actions.clearFilters")}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Loading Overlay */}
        {loading && !hasInitialLoad && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">{t("partners.loading.initial", "Loading...")}</p>
            </div>
        )}

        {/* Data Table */}
        {showData && (
            <>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <Table
                        columns={columns}
                        data={partners}
                        loading={loading}
                        onRowClick={(row) => { setSelectedPartner(row); setIsDetailModalOpen(true); }}
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("partners.table.noResults.title")}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
                    {t("partners.notifications.filtersCleared", "Adjust your filters to find who you're looking for.")}
                </p>
                <Button onClick={handleClearFilters} variant="outline" icon={X}>
                    {t("partners.actions.clearFilters")}
                </Button>
            </div>
        )}

        {/* ✅ EMPTY STATE (No Data) - Enhanced Design */}
        {showEmptyState && (
            <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-6 ring-1 ring-gray-100 dark:ring-gray-700">
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full">
                        <Users className="h-12 w-12 text-orange-500" strokeWidth={1.5} />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("partners.emptyState.title")}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8 leading-relaxed">
                   {t("partners.emptyState.description", "Collaborate with trusted vendors. Add your first partner to start managing contracts and services.")}
                </p>
                <Button 
                    onClick={() => { setSelectedPartner(null); setIsFormOpen(true); }} 
                    variant="primary" 
                    size="lg"
                    icon={Plus}
                    className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
                >
                    {t("partners.emptyState.addFirst")}
                </Button>
            </div>
        )}
      </div>

      {/* Modals */}
      <PartnerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        partner={selectedPartner}
        onEdit={(p) => { setSelectedPartner(p); setIsDetailModalOpen(false); setIsFormOpen(true); }}
        refreshData={fetchPartners}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedPartner ? t("partnerForm.editTitle") : t("partnerForm.addTitle")}
        size="lg"
      >
        <PartnerForm
          partner={selectedPartner}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        title={t("partners.deleteModal.title")}
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-semibold">{t("partners.deleteModal.title")}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("partners.deleteModal.description", { name: confirmationModal.partnerName })}
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}>
              {t("partners.deleteModal.cancel")}
            </Button>
            <Button variant="danger" onClick={confirmationModal.onConfirm} icon={Trash2}>
              {t("partners.deleteModal.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnersList;