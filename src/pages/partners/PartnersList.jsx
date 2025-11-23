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

// ✅ Context
import { useToast } from "../../hooks/useToast";

// ✅ Sub-components
import PartnerForm from "./PartnerForm";
import PartnerDetailModal from "./PartnerDetailModal";

const PartnersList = () => {
  const navigate = useNavigate();
  const { showSuccess, apiError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // State
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
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

      setPartners(data.filter(p => p && p._id)); // Basic safety filter
      setTotalPages(pagination.pages || 1);
      setTotalCount(pagination.total || data.length);
      setHasInitialLoad(true);
    } catch (err) {
      apiError(err, t("partners.errors.loading"));
      setPartners([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, page, limit, t, apiError]);

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

  const hasActiveFilters = search.trim() !== "" || status !== "all" || category !== "all";
  const showEmptyState = !loading && partners.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults = !loading && partners.length === 0 && hasActiveFilters && hasInitialLoad;

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
          {/* ✅ FIX: Explicit children icons and classes */}
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

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("partners.title")}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("partners.subtitle")}
            {hasInitialLoad && totalCount > 0 && ` • ${t("partners.showingResults", { count: partners.length, total: totalCount })}`}
          </p>
        </div>
        {totalCount > 0 && (
          <Button variant="primary" icon={Plus} onClick={() => { setSelectedPartner(null); setIsFormOpen(true); }}>
            {t("partners.actions.addPartner")}
          </Button>
        )}
      </div>

      {/* Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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

      {/* Content */}
      {showNoResults ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("partners.table.noResults.title")}</h3>
          <Button onClick={handleClearFilters} variant="outline">{t("partners.actions.clearFilters")}</Button>
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("partners.emptyState.title")}</h3>
          <Button onClick={() => { setSelectedPartner(null); setIsFormOpen(true); }} variant="primary" icon={Plus}>
            {t("partners.emptyState.addFirst")}
          </Button>
        </div>
      ) : (
        <Table
          columns={columns}
          data={partners}
          loading={loading}
          emptyMessage={t("partners.table.empty")}
          onRowClick={(row) => { setSelectedPartner(row); setIsDetailModalOpen(true); }}
          striped
          hoverable
          pagination={totalPages}
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
          totalItems={totalCount}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        />
      )}

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