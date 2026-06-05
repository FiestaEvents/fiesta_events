import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  TrendingUp,
  Box,
  FolderOpen,
  Filter,
  X,
  Eye,
} from "lucide-react";

//  API & Permissions
import { supplyService, supplyCategoryService } from "../../api/index";
import PermissionGuard from "../../components/auth/PermissionGuard"; // Guard

//  Generic Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import Table from "../../components/common/NewTable";
import Modal from "../../components/common/Modal";
import OrbitLoader from "../../components/common/LoadingSpinner";

//  Context
import { useToast } from "../../hooks/useToast";

//  Sub-components
import SupplyForm from "./SupplyForm";
import SupplyDetailModal from "./SupplyDetailModal";

const SuppliesPage = () => {
  const { t } = useTranslation();
  const { showError, showInfo } = useToast();
  const [supplies, setSupplies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    supply: null,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  // Local Filter Buffer
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localCategory, setLocalCategory] = useState("all");
  const [localStatus, setLocalStatus] = useState("all");
  const [localStockFilter, setLocalStockFilter] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync filters
  useEffect(() => {
    if (isFilterOpen) {
      setLocalCategory(selectedCategory);
      setLocalStatus(selectedStatus);
      setLocalStockFilter(stockFilter);
    }
  }, [isFilterOpen, selectedCategory, selectedStatus, stockFilter]);

  const handleApplyFilters = () => {
    setSelectedCategory(localCategory);
    setSelectedStatus(localStatus);
    setStockFilter(localStockFilter);
    setPage(1);
    setIsFilterOpen(false);
  };

  const handleResetLocalFilters = () => {
    setLocalCategory("all");
    setLocalStatus("all");
    setLocalStockFilter("all");
  };
  const handleClearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setStockFilter("all");
    setShowArchived(false);
    setPage(1);
    showInfo(t("common.filtersCleared"));
  };

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: searchTerm || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        stockStatus: stockFilter !== "all" ? stockFilter : undefined,
        includeArchived: showArchived,
      };

      const [suppliesRes, categoriesRes] = await Promise.all([
        supplyService.getAll(params),
        supplyCategoryService.getAll(),
      ]);

      const suppliesData =
        suppliesRes.supplies || suppliesRes.data?.supplies || [];
      const paginationData =
        suppliesRes.pagination || suppliesRes.data?.pagination || {};
      const categoriesData =
        categoriesRes.categories || categoriesRes.data?.categories || [];

      const totalItems = paginationData.total || suppliesData.length || 0;
      const calculatedTotalPages = Math.ceil(totalItems / limit);

      setSupplies(suppliesData);
      setCategories(categoriesData);
      setTotalCount(totalItems);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      setHasInitialLoad(true);
    } catch (error) {
      showError(t("supplies.errors.loadFailed"));
      setSupplies([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    searchTerm,
    selectedCategory,
    selectedStatus,
    stockFilter,
    showArchived,
    t,
    showError,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-Side Pagination Fallback
  const paginatedSupplies = useMemo(() => {
    if (supplies.length > limit) {
      const startIndex = (page - 1) * limit;
      return supplies.slice(startIndex, startIndex + limit);
    }
    return supplies;
  }, [supplies, page, limit]);

  // Handlers
  const handleRowClick = (supply) => {
    setSelectedSupply(supply);
    setIsDetailModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm.supply) return;
    try {
      await supplyService.delete(deleteConfirm.supply._id);
      fetchData();
      setDeleteConfirm({ open: false, supply: null });
      if (selectedSupply?._id === deleteConfirm.supply._id)
        setIsDetailModalOpen(false);
    } catch (error) {}
  };

  const handleFormSuccess = () => {
    fetchData();
    setIsFormOpen(false);
  };
  const handleOpenForm = (supply = null) => {
    setSelectedSupply(supply);
    setIsFormOpen(true);
  };

  // Stats
  const stats = useMemo(() => {
    const totalValue = supplies.reduce(
      (sum, s) => sum + s.currentStock * s.costPerUnit,
      0
    );
    const lowStock = supplies.filter(
      (s) => s.currentStock <= s.minimumStock && s.currentStock > 0
    ).length;
    const outOfStock = supplies.filter((s) => s.currentStock === 0).length;
    return { total: totalCount, totalValue, lowStock, outOfStock };
  }, [supplies, totalCount]);

  // UI Helpers
  const hasActiveFilters =
    searchTerm !== "" ||
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    stockFilter !== "all";
  const showEmptyState =
    !loading && supplies.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults =
    !loading && supplies.length === 0 && hasActiveFilters && hasInitialLoad;
  const showData =
    hasInitialLoad && (supplies.length > 0 || (loading && totalCount > 0));

  const getStockBadge = (supply) => {
    if (supply.currentStock === 0)
      return (
        <Badge variant="danger" icon={<XCircle className="w-3 h-3" />}>
          {t("supplies.status.outOfStock")}
        </Badge>
      );
    if (supply.currentStock <= supply.minimumStock)
      return (
        <Badge variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>
          {t("supplies.status.lowStock")}
        </Badge>
      );
    if (supply.currentStock >= supply.maximumStock)
      return (
        <Badge variant="info" icon={<TrendingUp className="w-3 h-3" />}>
          {t("supplies.status.overstocked")}
        </Badge>
      );
    return (
      <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
        {t("supplies.status.inStock")}
      </Badge>
    );
  };

  // Columns
  const columns = [
    {
      header: t("supplies.table.name"),
      accessor: "name",
      width: "25%",
      sortable: true,
      render: (supply) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <Package size={16} />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {supply.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {supply.categoryId?.name || t("supplies.status.uncategorized")}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: t("supplies.table.stock"),
      accessor: "currentStock",
      width: "15%",
      sortable: true,
      render: (supply) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {supply.currentStock} {supply.unit}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Min: {supply.minimumStock}
          </div>
        </div>
      ),
    },
    {
      header: t("supplies.table.value"),
      accessor: "value",
      width: "15%",
      render: (supply) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {(supply.currentStock * supply.costPerUnit).toFixed(3)} TND
        </div>
      ),
    },
    {
      header: t("supplies.table.status"),
      accessor: "status",
      width: "20%",
      sortable: true,
      render: (supply) => (
        <div className="flex flex-col gap-1 items-start">
          {getStockBadge(supply)}
        </div>
      ),
    },
    {
      header: t("partners.table.columns.actions"),
      accessor: "actions",
      width: "15%",
      className: "text-center",
      render: (supply) => (
        <div className="flex justify-center gap-2">
          {/* View: Everyone */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(supply);
            }}
            className="text-orange-500 hover:text-orange-600"
          >
            <Eye size={16} />
          </Button>

          {/*  Edit Guard */}
          <PermissionGuard permission="supplies.update.all">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenForm(supply);
              }}
              className="text-blue-500 hover:text-blue-600"
            >
              <Edit size={16} />
            </Button>
          </PermissionGuard>

          {/*  Delete Guard */}
          <PermissionGuard permission="supplies.delete.all">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirm({ open: true, supply });
              }}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 size={16} />
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
            {t("supplies.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("supplies.subtitle")}
            {hasInitialLoad && totalCount > 0 && ` • ${totalCount} items`}
          </p>
        </div>

        {/*  Create Guard */}
        {!showEmptyState && (
          <PermissionGuard permission="supplies.create">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => handleOpenForm()}
              className="flex-1 sm:flex-none justify-center"
            >
              {t("supplies.buttons.addSupply")}
            </Button>
          </PermissionGuard>
        )}
      </div>

      {/* Stats Cards */}
      {!showEmptyState && hasInitialLoad && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
          <StatCard
            label={t("supplies.stats.totalValue")}
            value={`${stats.totalValue.toFixed(0)} TND`}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            label={t("supplies.stats.lowStock")}
            value={stats.lowStock}
            icon={AlertTriangle}
            color="orange"
          />
          <StatCard
            label={t("supplies.stats.outOfStock")}
            value={stats.outOfStock}
            icon={XCircle}
            color="red"
          />
          <StatCard
            label={t("supplies.stats.totalItems")}
            value={stats.total}
            icon={Package}
            color="blue"
          />
        </div>
      )}

      {/* Filters */}
      {!showEmptyState && hasInitialLoad && (
        <div className="relative mb-6 z-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="w-full sm:max-w-md relative">
              <Input
                icon={Search}
                placeholder={t("supplies.filters.search")}
                value={searchTerm}
                onChange={(e) => {
                  setPage(1);
                  setSearchTerm(e.target.value);
                }}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant={hasActiveFilters ? "primary" : "outline"}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 transition-all whitespace-nowrap ${isFilterOpen ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
              >
                <Filter className="w-4 h-4" />
                {t("supplies.filters.advanced")}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  icon={X}
                  onClick={handleClearAllFilters}
                >
                  {t("common.clear")}
                </Button>
              )}
            </div>
          </div>
          {isFilterOpen && (
            <div className="mt-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-start">
                <Select
                  label={t("supplies.filters.category")}
                  value={localCategory}
                  onChange={(e) => setLocalCategory(e.target.value)}
                  options={[
                    {
                      value: "all",
                      label: t("supplies.filters.allCategories"),
                    },
                    ...categories.map((c) => ({ value: c._id, label: c.name })),
                  ]}
                  className="w-full"
                />
                <Select
                  label={t("supplies.filters.stockStatus")}
                  value={localStockFilter}
                  onChange={(e) => setLocalStockFilter(e.target.value)}
                  options={[
                    { value: "all", label: t("supplies.filters.allStock") },
                    { value: "low", label: t("supplies.filters.lowStock") },
                    { value: "out", label: t("supplies.filters.outOfStock") },
                  ]}
                  className="w-full"
                />
                <Select
                  label={t("supplies.filters.status")}
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value)}
                  options={[
                    { value: "all", label: "All Status" },
                    { value: "active", label: "Active" },
                    { value: "archived", label: "Archived" },
                  ]}
                  className="w-full"
                />
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <Button variant="outline" onClick={handleResetLocalFilters}>
                  {t("supplies.filters.reset")}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="px-6"
                >
                  {t("supplies.filters.apply")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col relative min-h-[300px]">
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg">
            <OrbitLoader />
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              {t("common.loading")}
            </p>
          </div>
        )}
        {showData && (
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <Table
              columns={columns}
              data={paginatedSupplies}
              loading={loading && hasInitialLoad}
              striped
              hoverable
              onRowClick={handleRowClick}
              pagination={true}
              currentPage={page}
              totalPages={totalPages}
              pageSize={limit}
              totalItems={totalCount}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setLimit(newSize);
                setPage(1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              emptyMessage={t("table.noData")}
            />
          </div>
        )}
        {showNoResults && (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("common.noResults")}
            </h3>
            <Button onClick={handleClearAllFilters} variant="outline" icon={X}>
              {t("common.clearFilters")}
            </Button>
          </div>
        )}
        {showEmptyState && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full mb-4">
              <Box className="h-12 w-12 text-orange-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("supplies.empty.title")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8">
              {t("supplies.empty.description")}
            </p>
            <PermissionGuard permission="supplies.create">
              <Button
                onClick={() => handleOpenForm()}
                variant="primary"
                size="lg"
                icon={Plus}
              >
                {t("supplies.buttons.addSupply")}
              </Button>
            </PermissionGuard>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          selectedSupply
            ? t("supplies.form.editTitle")
            : t("supplies.form.createTitle")
        }
        size="lg"
      >
        <SupplyForm
          supply={selectedSupply}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>
      <SupplyDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        supply={selectedSupply}
        onEdit={(s) => {
          setIsDetailModalOpen(false);
          handleOpenForm(s);
        }}
        refreshData={fetchData}
      />
      <Modal
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, supply: null })}
        title={t("supplies.delete.title")}
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-semibold">{t("common.warning")}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("supplies.delete.confirmMessage", {
              name: deleteConfirm.supply?.name,
            })}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, supply: null })}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green:
      "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    orange:
      "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    red: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  );
};

export default SuppliesPage;
