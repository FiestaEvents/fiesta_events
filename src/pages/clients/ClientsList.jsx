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
  AlertTriangle,
  Users,
  FolderOpen,
} from "lucide-react";

//  API & Services
import { clientService } from "../../api/index";

//  Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import { StatusBadge } from "../../components/common/Badge";

//  Auth & Permissions
import PermissionGuard from "../../components/auth/PermissionGuard"; 
import { useToast } from "../../context/ToastContext";

//  Sub-components
import ClientDetailModal from "./ClientDetailModal";
import ClientForm from "./ClientForm";

const ClientsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();

  // State
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Confirmation modal
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    clientId: null,
    clientName: "",
    onConfirm: null,
  });

  // Filters (Active)
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Filters (Buffered/UI)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState("all");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Helper: Strict DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return t("clients.table.defaultValues.noDate");
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Sync local filters with active filters when panel opens
  useEffect(() => {
    if (isFilterOpen) {
      setLocalStatus(status);
    }
  }, [isFilterOpen, status]);

  const handleApplyFilters = () => {
    setStatus(localStatus);
    setPage(1);
    setIsFilterOpen(false);
    showSuccess(t("clients.toast.filtersApplied") || "Filters applied");
  };

  const handleResetLocalFilters = () => {
    setLocalStatus("all");
  };

  const handleClearAllFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
    showInfo(t("clients.toast.filtersCleared"));
  };

  // Fetch clients
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
      };

      const response = await clientService.getAll(params);

      // Robust data extraction
      let data =
        response?.data?.data?.clients ||
        response?.data?.clients ||
        response?.clients ||
        [];
      if (!Array.isArray(data)) data = [];

      // Pagination Calculation
      const totalItems =
        response?.data?.data?.totalCount ||
        response?.pagination?.total ||
        data.length;
      const calculatedTotalPages = Math.ceil(totalItems / limit);

      setClients(data);
      setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
      setTotalCount(totalItems);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        t("clients.errors.loadingDefault");
      setError(errorMessage);
      showError(errorMessage);
      setClients([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
      setHasInitialLoad(true);
    }
  }, [search, status, page, limit, showError, t]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Client-Side Slicing Fallback
  const paginatedClients = useMemo(() => {
    if (clients.length > limit) {
      const startIndex = (page - 1) * limit;
      return clients.slice(startIndex, startIndex + limit);
    }
    return clients;
  }, [clients, page, limit]);

  // --- Handlers ---

  const handleDeleteConfirm = useCallback(
    async (clientId, clientName) => {
      try {
        await promise(clientService.delete(clientId), {
          loading: t("clients.toast.deleting", { name: clientName }),
          success: t("clients.toast.deleteSuccess", { name: clientName }),
          error: t("clients.toast.deleteError", { name: clientName }),
        });
        fetchClients();
        setConfirmationModal({
          isOpen: false,
          clientId: null,
          clientName: "",
          onConfirm: null,
        });
        if (selectedClient?._id === clientId) setIsDetailModalOpen(false);
      } catch (err) {
        // Promise handles UI feedback
      }
    },
    [fetchClients, selectedClient, promise, t]
  );

  const handleDeleteClient = (clientId, clientName) => {
    setConfirmationModal({
      isOpen: true,
      clientId,
      clientName,
      onConfirm: () => handleDeleteConfirm(clientId, clientName),
    });
  };

  const handleFormSuccess = () => {
    fetchClients();
    setIsFormOpen(false);
    showSuccess(
      selectedClient
        ? t("clients.toast.updateSuccess")
        : t("clients.toast.createSuccess")
    );
  };

  // Logic States
  const hasActiveFilters = search.trim() !== "" || status !== "all";

  const showEmptyState =
    !loading &&
    !error &&
    clients.length === 0 &&
    !hasActiveFilters &&
    hasInitialLoad;

  const showNoResults =
    !loading &&
    !error &&
    clients.length === 0 &&
    hasActiveFilters &&
    hasInitialLoad;

  const showData =
    hasInitialLoad && (clients.length > 0 || (loading && totalCount > 0));

  // Columns Configuration
  const columns = [
    {
      header: t("clients.table.columns.name"),
      accessor: "name",
      width: "25%",
      sortable: true,
      render: (row) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.name || t("clients.table.defaultValues.unnamed")}
        </div>
      ),
    },
    {
      header: t("clients.table.columns.email"),
      accessor: "email",
      width: "25%",
      sortable: true,
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.email || t("clients.table.defaultValues.noEmail")}
        </div>
      ),
    },
    {
      header: t("clients.table.columns.phone"),
      accessor: "phone",
      width: "15%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.phone || t("clients.table.defaultValues.noPhone")}
        </div>
      ),
    },
    {
      header: t("clients.table.columns.status"),
      accessor: "status",
      width: "15%",
      sortable: true,
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: t("clients.table.columns.createdAt"),
      accessor: "createdAt",
      width: "15%",
      sortable: true,
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {formatDate(row.createdAt)}
        </div>
      ),
    },
    {
      header: t("clients.table.columns.actions"),
      accessor: "actions",
      width: "10%",
      className: "text-center",
      render: (row) => (
        <div className="flex justify-center gap-2">
          {/* View Action - Basic Read Permission */}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/clients/${row._id}`, { state: { client: row } });
            }}
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
            title={t("common.view")}
          >
            <Eye className="h-4 w-4" />
          </Button>

          {/* Edit Action - Protected */}
          <PermissionGuard permission="clients.update.all">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedClient(row);
                setIsFormOpen(true);
              }}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              title={t("common.edit")}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </PermissionGuard>

          {/* Delete Action - Protected */}
          <PermissionGuard permission="clients.delete.all">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClient(row._id, row.name);
              }}
              className="text-red-600 hover:text-red-700 dark:text-red-400"
              title={t("common.delete")}
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
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("clients.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t("clients.description")}
            {hasInitialLoad &&
              totalCount > 0 &&
              ` • ${t("clients.toast.showingResults", { count: clients.length, total: totalCount })}`}
          </p>
        </div>

        {/* Add Client Button - Protected */}
        {!showEmptyState && (
          <PermissionGuard permission="clients.create">
            <Button
              variant="primary"
              onClick={() => {
                setSelectedClient(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> {t("clients.buttons.addClient")}
            </Button>
          </PermissionGuard>
        )}
      </div>

      {/* FILTERS */}
      {hasInitialLoad && !showEmptyState && (
        <div className="relative mb-6 z-20">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search Bar */}
            <div className="w-full sm:max-w-md relative">
              <Input
                icon={Search}
                placeholder={t("clients.search.placeholder")}
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
                className="w-full"
              />
            </div>

            {/* Advanced Filters Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant={hasActiveFilters ? "primary" : "outline"}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 transition-all whitespace-nowrap ${isFilterOpen ? "ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-gray-900" : ""}`}
              >
                <Filter className="w-4 h-4" />
                {t("clients.filters.advanced") || "Filters"}
                {hasActiveFilters && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                    !
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  icon={X}
                  onClick={handleClearAllFilters}
                  className="text-gray-500"
                >
                  {t("clients.buttons.clear")}
                </Button>
              )}
            </div>
          </div>

          {/* Expandable Filter Panel */}
          {isFilterOpen && (
            <div className="mt-3 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                  {t("clients.filters.filterOptions") || "Filter Options"}
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                <Select
                  label={t("clients.table.columns.status")}
                  value={localStatus}
                  onChange={(e) => setLocalStatus(e.target.value)}
                  options={[
                    { value: "all", label: t("clients.filters.allStatus") },
                    { value: "active", label: t("clients.status.active") },
                    { value: "inactive", label: t("clients.status.inactive") },
                  ]}
                  className="w-full"
                />
              </div>

              {/* Footer Actions */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleResetLocalFilters}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  {t("clients.buttons.reset") || "Reset"}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                  className="px-6"
                >
                  {t("clients.buttons.apply") || "Apply Filters"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Table Data */}
        {showData && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table
              columns={columns}
              data={paginatedClients}
              loading={loading}
              onRowClick={(row) => {
                setSelectedClient(row);
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

        {/* No Results */}
        {showNoResults && (
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
              <FolderOpen className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("clients.search.noResults")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              {t("clients.search.noResultsDesc")}
            </p>
            <Button onClick={handleClearAllFilters} variant="outline" icon={X}>
              {t("clients.buttons.clearAllFilters")}
            </Button>
          </div>
        )}

        {/* Empty State */}
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
              {t("clients.empty.title")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8 leading-relaxed">
              {t("clients.empty.description")}
            </p>

            <PermissionGuard permission="clients.create">
              <Button
                onClick={() => {
                  setSelectedClient(null);
                  setIsFormOpen(true);
                }}
                variant="primary"
                size="lg"
                icon={<Plus className="size-4" />}
                className="shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-shadow"
              >
                {t("clients.buttons.addFirstClient")}
              </Button>
            </PermissionGuard>
          </div>
        )}
      </div>

      {/* Modals */}
      <ClientDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        client={selectedClient}
        onEdit={() => {
          // Protected inside the modal logic or here
          setIsDetailModalOpen(false);
          setIsFormOpen(true);
        }}
        refreshData={fetchClients}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={
          selectedClient
            ? t("clients.modal.editTitle")
            : t("clients.modal.addTitle")
        }
        size="lg"
      >
        <ClientForm
          client={selectedClient}
          onSuccess={handleFormSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal((p) => ({ ...p, isOpen: false }))}
        title={t("clients.modal.deleteTitle")}
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-semibold">{t("clients.modal.deleteTitle")}</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("clients.modal.deleteMessage", {
              name: confirmationModal.clientName,
            })}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() =>
                setConfirmationModal((p) => ({ ...p, isOpen: false }))
              }
            >
              {t("clients.buttons.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={confirmationModal.onConfirm}
              icon={Trash2}
            >
              {t("clients.buttons.deleteClient")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientsList;
