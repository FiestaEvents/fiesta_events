import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  FolderOpen,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";

// API & Services
import { partnerService } from "../../api/index";

//  Generic Components & Utils
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";
import PermissionGuard from "../../components/auth/PermissionGuard"; 
import { usePermission } from "../../hooks/usePermission";

// Context
import { useToast } from "../../context/ToastContext";

// Sub-components
import PartnerForm from "./PartnerForm";
import PartnerDetailModal from "./PartnerDetailModal";
import PartnerCatalog from "./components/PartnerCatalog";
import PortfolioManageModal from "./components/PortfolioManageModal";

const PartnersList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const { t } = useTranslation();

  // Permissions
  const canEdit = usePermission("partners.update.all");

  // State Management
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [error, setError] = useState(null);

  // View Mode
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'catalog'

  // Modals
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Portfolio Modal State
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [portfolioPartner, setPortfolioPartner] = useState(null);

  // Confirmation modal
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    partnerId: null,
    partnerName: "",
    onConfirm: null,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("all");
  const [localCategory, setLocalCategory] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const categoryOptions = [
    { value: "all", label: t("partners.actions.filters.allCategories") },
    { value: "driver", label: t("partners.categories.driver") },
    { value: "bakery", label: t("partners.categories.bakery") },
    { value: "catering", label: t("partners.categories.catering") },
    { value: "decoration", label: t("partners.categories.decoration") },
    { value: "photography", label: t("partners.categories.photography") },
    { value: "music", label: t("partners.categories.music") },
    { value: "security", label: t("partners.categories.security") },
    { value: "cleaning", label: t("partners.categories.cleaning") },
    { value: "audio_visual", label: t("partners.categories.audio_visual") },
    { value: "floral", label: t("partners.categories.floral") },
    { value: "entertainment", label: t("partners.categories.entertainment") },
    { value: "hairstyling", label: t("partners.categories.hairstyling") },
    { value: "other", label: t("partners.categories.other") },
  ];

  useEffect(() => {
    if (isFilterOpen) {
      setLocalStatus(status);
      setLocalCategory(category);
    }
  }, [isFilterOpen, status, category]);

  const handleApplyFilters = () => {
    setStatus(localStatus);
    setCategory(localCategory);
    setPage(1);
    setIsFilterOpen(false);
    showSuccess(t("partners.notifications.filtersApplied"));
  };

  const handleResetLocalFilters = () => {
    setLocalStatus("all");
    setLocalCategory("all");
  };

  const handleClearAllFilters = () => {
    setSearch("");
    setStatus("all");
    setCategory("all");
    setPage(1);
    showInfo(t("partners.notifications.filtersCleared"));
  };

  //  Fetch Logic
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If in catalog mode, fetch more items to fill grid
      const currentLimit = viewMode === "catalog" ? 100 : limit;

      const params = {
        page,
        limit: currentLimit,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(category !== "all" && { category }),
      };

      const response = await partnerService.getAll(params);
      let data = response?.partners || response?.data || response || [];
      if (!Array.isArray(data)) data = [];

      const totalItems = response?.pagination?.total || data.length || 0;
      const calculatedTotalPages = Math.ceil(totalItems / currentLimit);

      setPartners(data.filter((p) => p && p._id));
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      setTotalCount(totalItems);
    } catch (err) {
      setError(t("partners.errors.loading"));
      setPartners([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setHasInitialLoad(true);
    }
  }, [search, status, category, page, limit, viewMode, t]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Client-Side Slicing Fallback
  const paginatedPartners = useMemo(() => {
    // Only slice if in list mode and we have more data than the limit (and backend isn't paginating correctly)
    if (viewMode === 'list' && partners.length > limit) {
      const startIndex = (page - 1) * limit;
      return partners.slice(startIndex, startIndex + limit);
    }
    return partners;
  }, [partners, page, limit, viewMode]);

  // --- Handlers ---
  const handleDeleteConfirm = useCallback(
    async (partnerId, partnerName) => {
      try {
        await promise(partnerService.delete(partnerId), {
          loading: t("partners.deleteModal.deleting", { name: partnerName }),
          success: t("partners.notifications.deleted"),
          error: t("partners.deleteModal.errorDeleting", { name: partnerName }),
        });
        fetchPartners();
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        if (selectedPartner?._id === partnerId) setIsDetailModalOpen(false);
      } catch (err) {}
    },
    [fetchPartners, selectedPartner, promise, t]
  );

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
    showSuccess(
      selectedPartner
        ? t("partners.notifications.updated")
        : t("partners.notifications.added")
    );
  };

  //  Portfolio Handlers
  const handleEditPortfolio = (partner) => {
    setPortfolioPartner(partner);
    setPortfolioModalOpen(true);
  };

  const handlePortfolioUpdate = () => {
    fetchPartners(); // Refresh data to show new image in card
  };

  const formatCategory = (cat) =>
    categoryOptions.find((opt) => opt.value === cat)?.label || cat;

  const hasActiveFilters =
    search.trim() !== "" || status !== "all" || category !== "all";
  const showEmptyState =
    !loading &&
    !error &&
    partners.length === 0 &&
    !hasActiveFilters &&
    hasInitialLoad;
  const showNoResults =
    !loading &&
    !error &&
    partners.length === 0 &&
    hasActiveFilters &&
    hasInitialLoad;
  const showData =
    hasInitialLoad && (partners.length > 0 || (loading && totalCount > 0));

  // Columns
  const columns = [
    {
      header: t("partners.table.columns.name"),
      accessor: "name",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.name}
          </div>
          {row.company && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {row.company}
            </div>
          )}
        </div>
      ),
    },
    {
      header: t("partners.table.columns.contact"),
      accessor: "email",
      width: "20%",
      sortable: true,
      render: (row) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {row.email || "-"}
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            {row.phone || "-"}
          </div>
        </div>
      ),
    },
    {
      header: t("partners.table.columns.category"),
      accessor: "category",
      width: "15%",
      sortable: true,
      render: (row) => (
        <Badge variant="info">{formatCategory(row.category)}</Badge>
      ),
    },
    {
      header: t("partners.table.columns.rating"),
      accessor: "rating",
      width: "12%",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {row.rating?.toFixed(1) || "0.0"}
          </span>
          <span className="text-xs text-gray-500">
            ({row.totalJobs || 0})
          </span>
        </div>
      ),
    },
    {
      header: t("partners.table.columns.status"),
      accessor: "status",
      width: "12%",
      sortable: true,
      render: (row) => (
        <Badge variant={row.status === "active" ? "success" : "danger"}>
          {row.status === "active"
            ? t("partners.actions.filters.active")
            : t("partners.actions.filters.inactive")}
        </Badge>
      ),
    },
    {
      header: t("partners.table.columns.price"),
      accessor: "price",
      width: "10%",
      render: (row) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {row.priceType === "hourly"
            ? `${row.hourlyRate} TND/hr`
            : `${row.fixedRate} TND`}
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
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/partners/${row._id}`, { state: { partner: row } });
            }}
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <PermissionGuard permission="partners.update.all">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPartner(row);
                setIsFormOpen(true);
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="partners.delete.all">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePartner(row._id, row.name);
              }}
              className="text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("partners.title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("partners.subtitle")}
            {hasInitialLoad &&
              totalCount > 0 &&
              ` • ${t("partners.showingResults", { count: partners.length, total: totalCount })}`}
          </p>
        </div>

        {!showEmptyState && (
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 shadow text-orange-600"
                    : "text-gray-500"
                }`}
                title={t("common.listView")}
              >
                <ListIcon size={18} />
              </button>
              <button
                onClick={() => setViewMode("catalog")}
                className={`p-2 rounded-md transition-all ${
                  viewMode === "catalog"
                    ? "bg-white dark:bg-gray-600 shadow text-orange-600"
                    : "text-gray-500"
                }`}
                title={t("common.catalogView")}
              >
                <LayoutGrid size={18} />
              </button>
            </div>

            {/* Create Button */}
            <PermissionGuard permission="partners.create">
              <Button
                variant="primary"
                icon={<Plus className="size-4" />}
                onClick={() => {
                  setSelectedPartner(null);
                  setIsFormOpen(true);
                }}
              >
                {t("partners.actions.addPartner")}
              </Button>
            </PermissionGuard>
          </div>
        )}
      </div>

      {/*  VIEW SWITCHER */}
      {viewMode === "list" ? (
        <>
          {/* LIST VIEW (Filters & Table) */}
          {hasInitialLoad && !showEmptyState && (
            <div className="relative mb-6 z-20">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="w-full sm:max-w-md relative">
                  <Input
                    icon={Search}
                    placeholder={t("partners.actions.search")}
                    value={search}
                    onChange={(e) => {
                      setPage(1);
                      setSearch(e.target.value);
                    }}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant={hasActiveFilters ? "primary" : "outline"}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center gap-2 transition-all whitespace-nowrap ${
                      isFilterOpen
                        ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900"
                        : ""
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    {t("partners.actions.filters.advanced")}
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      icon={X}
                      onClick={handleClearAllFilters}
                      className="text-gray-500"
                    >
                      {t("partners.actions.clearFilters")}
                    </Button>
                  )}
                </div>
              </div>
              {isFilterOpen && (
                <div className="mt-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                    <Select
                      label={t("partners.table.columns.category")}
                      value={localCategory}
                      onChange={(e) => setLocalCategory(e.target.value)}
                      options={categoryOptions}
                      className="w-full"
                    />
                    <Select
                      label={t("partners.table.columns.status")}
                      value={localStatus}
                      onChange={(e) => setLocalStatus(e.target.value)}
                      options={[
                        {
                          value: "all",
                          label: t("partners.actions.filters.allStatus"),
                        },
                        {
                          value: "active",
                          label: t("partners.actions.filters.active"),
                        },
                        {
                          value: "inactive",
                          label: t("partners.actions.filters.inactive"),
                        },
                      ]}
                      className="w-full"
                    />
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={handleResetLocalFilters}
                    >
                      {t("partners.actions.filters.reset")}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleApplyFilters}
                      className="px-6"
                    >
                      {t("partners.actions.filters.apply")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 flex flex-col relative">
            {loading && !hasInitialLoad && (
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg min-h-[300px]">
                <OrbitLoader />
                <p className="text-gray-500 dark:text-gray-400">
                  {t("partners.loading.initial", "Loading...")}
                </p>
              </div>
            )}

            {showData && (
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table
                  columns={columns}
                  data={paginatedPartners} // Use client-sliced data
                  loading={loading}
                  onRowClick={(row) => {
                    setSelectedPartner(row);
                    setIsDetailModalOpen(true);
                  }}
                  striped
                  hoverable
                  pagination={true}
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={totalCount}
                  pageSize={limit}
                  onPageChange={setPage}
                  onPageSizeChange={(newSize) => {
                    setLimit(newSize);
                    setPage(1);
                  }}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
              </div>
            )}

            {showNoResults && (
              <div className="flex flex-col items-center justify-center flex-1 py-12">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
                  <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t("partners.table.noResults.title")}
                </h3>
                <Button
                  onClick={handleClearAllFilters}
                  variant="outline"
                  icon={X}
                >
                  {t("partners.actions.clearFilters")}
                </Button>
              </div>
            )}

            {showEmptyState && (
              <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-6 ring-1 ring-gray-100 dark:ring-gray-700">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full">
                    <Users
                      className="h-12 w-12 text-orange-500"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t("partners.emptyState.title")}
                </h3>
                <PermissionGuard permission="partners.create">
                  <Button
                    onClick={() => {
                      setSelectedPartner(null);
                      setIsFormOpen(true);
                    }}
                    variant="primary"
                    size="lg"
                    icon={<Plus className="size-4" />}
                  >
                    {t("partners.emptyState.addFirst")}
                  </Button>
                </PermissionGuard>
              </div>
            )}
          </div>
        </>
      ) : (
        /*  CATALOG VIEW */
        <PartnerCatalog
          partners={partners}
          loading={loading}
          onEditPortfolio={canEdit ? handleEditPortfolio : null}
        />
      )}

      {/* --- Modals --- */}
      <PartnerDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        partner={selectedPartner}
        onEdit={(p) => {
          setSelectedPartner(p);
          setIsDetailModalOpen(false);
          setIsFormOpen(true);
        }}
        refreshData={fetchPartners}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          selectedPartner
            ? t("partnerForm.editTitle")
            : t("partnerForm.addTitle")
        }
        size="lg"
      >
        <PartnerForm
          partner={selectedPartner}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/*  Portfolio Management Modal */}
      {portfolioModalOpen && portfolioPartner && (
        <PortfolioManageModal
          isOpen={portfolioModalOpen}
          onClose={() => setPortfolioModalOpen(false)}
          partner={portfolioPartner}
          onUpdate={handlePortfolioUpdate}
        />
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
        }
        title={t("partners.deleteModal.title")}
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-semibold">{t("partners.deleteModal.title")}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("partners.deleteModal.description", {
              name: confirmationModal.partnerName,
            })}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
              }
            >
              {t("partners.deleteModal.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={confirmationModal.onConfirm}
              icon={Trash2}
            >
              {t("partners.deleteModal.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnersList;