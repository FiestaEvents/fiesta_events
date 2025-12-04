import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Package,
  Plus,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  TrendingUp,
  Box,
  RefreshCw,
  FolderOpen,
  Filter,
  X,
} from "lucide-react";

// ✅ API & Services
import { supplyService, supplyCategoryService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import Table from "../../components/common/NewTable";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";

// ✅ Context
import { useToast } from "../../hooks/useToast";

const SuppliesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();

  // State
  const [supplies, setSupplies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    supply: null,
  });

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Build query params
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

      // Normalize data
      const suppliesData =
        suppliesRes.supplies || suppliesRes.data?.supplies || [];
      const paginationData =
        suppliesRes.pagination || suppliesRes.data?.pagination || {};
      const categoriesData =
        categoriesRes.categories || categoriesRes.data?.categories || [];

      setSupplies(suppliesData);
      setCategories(categoriesData);
      setTotalPages(paginationData.totalPages || 1);
      setTotalCount(paginationData.total || suppliesData.length);
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

  // Handlers
  const handleDelete = async () => {
    if (!deleteConfirm.supply) return;
    try {
      await promise(supplyService.delete(deleteConfirm.supply._id), {
        loading: t("supplies.delete.loading"),
        success: t("supplies.delete.success"),
        error: t("supplies.delete.error"),
      });
      fetchData();
      setDeleteConfirm({ open: false, supply: null });
    } catch (error) {
      // Handled by promise
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setStockFilter("all");
    setPage(1);
    showInfo(t("common.filtersCleared"));
  };

  // Stats Calculation
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

  // Logic States
  const hasActiveFilters =
    searchTerm !== "" ||
    selectedCategory !== "all" ||
    selectedStatus !== "all" ||
    stockFilter !== "all";
  const showEmptyState =
    !loading && supplies.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults =
    !loading && supplies.length === 0 && hasActiveFilters && hasInitialLoad;
  const showData = !loading && hasInitialLoad && supplies.length > 0;

  // Stock Status Badge
  const getStockBadge = (supply) => {
    if (supply.currentStock === 0)
      return (
        <Badge variant="danger">{t("supplies.status.outOfStock")}</Badge>
      );
    if (supply.currentStock <= supply.minimumStock)
      return (
        <Badge variant="warning" >
          {t("supplies.status.lowStock")}
        </Badge>
      );
    if (supply.currentStock >= supply.maximumStock)
      return (
        <Badge variant="info" >
          {t("supplies.status.overstocked")}
        </Badge>
      );
    return (
      <Badge variant="success">
        {t("supplies.status.inStock")}
      </Badge>
    );
  };

  // Table Columns
  const columns = [
    {
      header: t("supplies.table.name"),
      accessor: "name",
      width: "25%",
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
      render: (supply) => (
        <div className="flex flex-col gap-1 items-start">
          {getStockBadge(supply)}
        </div>
      ),
    },
    {
      header: t("common.actions"),
      accessor: "actions",
      width: "15%",
      className: "text-center",
      render: (supply) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/supplies/${supply._id}/edit`)}
            className="text-blue-500 hover:text-blue-600"
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteConfirm({ open: true, supply })}
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  // Pagination Footer
  const renderPagination = () => {
    const start = Math.min((page - 1) * limit + 1, totalCount);
    const end = Math.min(page * limit, totalCount);

    return (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div>
          {t("supplies.pagination.showing")}{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {start}
          </span>{" "}
          {t("supplies.pagination.to")}{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {end}
          </span>{" "}
          {t("supplies.pagination.of")}{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {totalCount}
          </span>{" "}
          {t("supplies.pagination.results")}
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
            <span>{t("supplies.pagination.perPage")}</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-white border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500 py-1"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {t("supplies.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("supplies.subtitle")}
            {hasInitialLoad && totalCount > 0 && ` • ${totalCount} items`}
          </p>
        </div>
        {!showEmptyState && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              icon={Download}
              onClick={() => {}}
              className="flex-1 sm:flex-none justify-center"
            >
              {t("common.export")}
            </Button>
            <Button
              variant="primary"
              icon={<Plus className="size-4" />}
              onClick={() => navigate("/supplies/new")}
              className="flex-1 sm:flex-none justify-center"
            >
              {t("supplies.buttons.addSupply")}
            </Button>
          </div>
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
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shrink-0">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              className="flex-1"
              icon={Search}
              placeholder={t("supplies.filters.search")}
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
            />
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setPage(1);
                  setSelectedCategory(e.target.value);
                }}
                options={[
                  { value: "all", label: t("supplies.filters.allCategories") },
                  ...categories.map((c) => ({ value: c._id, label: c.name })),
                ]}
                className="w-40"
              />
              <Select
                value={stockFilter}
                onChange={(e) => {
                  setPage(1);
                  setStockFilter(e.target.value);
                }}
                options={[
                  { value: "all", label: t("supplies.filters.allStock") },
                  { value: "low", label: t("supplies.filters.lowStock") },
                  { value: "out", label: t("supplies.filters.outOfStock") },
                ]}
                className="w-40"
              />
              {hasActiveFilters && (
                <Button variant="outline" icon={X} onClick={handleClearFilters}>
                  {t("common.clear")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Loading Overlay */}
        {loading && !hasInitialLoad && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              {t("common.loading")}
            </p>
          </div>
        )}

        {/* Data Table */}
        {showData && (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table
                columns={columns}
                data={supplies}
                loading={loading}
                striped
                hoverable
              />
            </div>
            {renderPagination()}
          </>
        )}

        {/* No Results (Filters active) */}
        {showNoResults && (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("common.noResults")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              {t("common.noResultsDesc", "Try adjusting your filters.")}
            </p>
            <Button onClick={handleClearFilters} variant="outline" icon={X}>
              {t("common.clearFilters")}
            </Button>
          </div>
        )}

        {/* Empty State (No Data at all) */}
        {showEmptyState && (
          <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 transition-colors">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-6 ring-1 ring-gray-100 dark:ring-gray-700">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-full">
                <Box className="h-12 w-12 text-orange-500" strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("supplies.empty.title")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8 leading-relaxed">
              {t("supplies.empty.description")}
            </p>
            <Button
              onClick={() => navigate("/supplies/new")}
              variant="primary"
              size="lg"
              icon={Plus}
              className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
            >
              {t("supplies.buttons.addSupply")}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
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
