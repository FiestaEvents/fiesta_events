import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import { clientService } from "../../api/index";
import { UsersIcon } from "../../components/icons/IconComponents";
import ClientDetailModal from "./ClientDetailModal.jsx";
import {
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Edit,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import ClientForm from "./ClientForm.jsx";
import Badge from "../../components/common/Badge";
import { useTranslation } from "react-i18next";
import { useToast } from "../../context/ToastContext";

const ClientsList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    clientId: null,
    clientName: "",
    onConfirm: null,
  });

  // Search & filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch clients with toast notifications
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

      let clientsData = [];
      let totalPages = 1;
      let totalCount = 0;

      if (response?.data?.data?.clients) {
        clientsData = response.data.data.clients || [];
        totalPages = response.data.data.totalPages || 1;
        totalCount = response.data.data.totalCount || clientsData.length;
      } else if (response?.data?.clients) {
        clientsData = response.data.clients || [];
        totalPages = response.data.totalPages || 1;
        totalCount = response.data.totalCount || clientsData.length;
      } else if (response?.clients) {
        clientsData = response.clients || [];
        totalPages = response.totalPages || 1;
        totalCount = response.totalCount || clientsData.length;
      } else if (Array.isArray(response?.data)) {
        clientsData = response.data;
      } else if (Array.isArray(response)) {
        clientsData = response;
      }

      setClients(clientsData);
      setTotalPages(totalPages);
      setTotalCount(totalCount);
      setHasInitialLoad(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        t("clients.errors.loadingDefault");
      setError(errorMessage);
      showError(errorMessage);
      setClients([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, page, limit, showError, t]);

  // Show confirmation modal
  const showDeleteConfirmation = useCallback(
    (clientId, clientName = "Client") => {
      setConfirmationModal({
        isOpen: true,
        clientId,
        clientName,
        onConfirm: () => handleDeleteConfirm(clientId, clientName),
      });
    },
    []
  );

  // Close confirmation modal
  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({
      isOpen: false,
      clientId: null,
      clientName: "",
      onConfirm: null,
    });
  }, []);

  // Handle confirmed deletion
  const handleDeleteConfirm = useCallback(
    async (clientId, clientName = "Client") => {
      if (!clientId) {
        showError(t("clients.errors.invalidId"));
        return;
      }

      try {
        await promise(clientService.delete(clientId), {
          loading: t("clients.toast.deleting", { name: clientName }),
          success: t("clients.toast.deleteSuccess", { name: clientName }),
          error: t("clients.toast.deleteError", { name: clientName }),
        });

        fetchClients();

        if (selectedClient?._id === clientId) {
          setSelectedClient(null);
          setIsDetailModalOpen(false);
        }

        closeConfirmationModal();
      } catch (err) {
        console.error("Delete client error:", err);
        closeConfirmationModal();
      }
    },
    [fetchClients, selectedClient, promise, showError, closeConfirmationModal, t]
  );

  // Updated client deletion handler
  const handleDeleteClient = useCallback(
    (clientId, clientName = "Client") => {
      showDeleteConfirmation(clientId, clientName);
    },
    [showDeleteConfirmation]
  );

  // Handle row click to open detail modal
  const handleRowClick = useCallback((client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(true);
  }, []);

  // Handle view client
  const handleViewClient = useCallback(
    (client) => {
      navigate(`/clients/${client._id}`, { state: { client } });
    },
    [navigate]
  );

  // Handle edit client
  const handleEditClient = useCallback((client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(false);
    setIsFormOpen(true);
  }, []);

  // Handle add client
  const handleAddClient = useCallback(() => {
    setSelectedClient(null);
    setIsFormOpen(true);
  }, []);

  // Handle form success
  const handleFormSuccess = useCallback(() => {
    fetchClients();
    setSelectedClient(null);
    setIsFormOpen(false);
    showSuccess(
      selectedClient
        ? t("clients.toast.updateSuccess")
        : t("clients.toast.createSuccess")
    );
  }, [fetchClients, selectedClient, showSuccess, t]);

  // Handle form close
  const handleFormClose = useCallback(() => {
    setSelectedClient(null);
    setIsFormOpen(false);
  }, []);

  // Handle detail modal close
  const handleDetailModalClose = useCallback(() => {
    setSelectedClient(null);
    setIsDetailModalOpen(false);
  }, []);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setPage(1);
    showInfo(t("clients.toast.filtersCleared"));
  }, [showInfo, t]);

  // Retry loading
  const handleRetry = useCallback(() => {
    fetchClients();
    showInfo(t("clients.loading.retrying"));
  }, [fetchClients, showInfo, t]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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

  // Table columns configuration
  const columns = [
    {
      header: t("clients.table.columns.name"),
      accessor: "name",
      sortable: true,
      width: "25%",
      render: (row) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.name || t("clients.table.defaultValues.unnamed")}
        </div>
      ),
    },
    {
      header: t("clients.table.columns.email"),
      accessor: "email",
      sortable: true,
      width: "25%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400 flex flex-col">
          <span>{row.email || t("clients.table.defaultValues.noEmail")}</span>
        </div>
      ),
    },
    {
      header: t("clients.table.columns.phone"),
      accessor: "phone",
      sortable: true,
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
      sortable: true,
      width: "15%",
      render: (row) => (
        <Badge
          color={
            row.status === "active"
              ? "green"
              : row.status === "inactive"
                ? "red"
                : "yellow"
          }
        >
          {t(`clients.status.${row.status}`) || "N/A"}
        </Badge>
      ),
    },
    {
      header: t("clients.table.columns.createdAt"),
      accessor: "createdAt",
      sortable: true,
      width: "15%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.createdAt 
            ? new Date(row.createdAt).toLocaleDateString() 
            : t("clients.table.defaultValues.noDate")}
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewClient(row);
            }}
            className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
            title={t("clients.table.actions.view")}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClient(row);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            title={t("clients.table.actions.edit")}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClient(row._id, row.name || "Client");
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title={t("clients.table.actions.delete")}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("clients.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("clients.description")}{" "}
            {hasInitialLoad &&
              totalCount > 0 &&
              t("clients.showingCount", { count: clients.length, total: totalCount })}
          </p>
        </div>
        {totalCount > 0 && (
          <Button
            variant="primary"
            onClick={handleAddClient}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("clients.buttons.addClient")}
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                {t("clients.errors.loadingTitle")}
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
            <Button onClick={handleRetry} size="sm" variant="outline">
              {t("clients.buttons.retry")}
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Search}
                placeholder={t("clients.search.placeholder")}
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <div className="sm:w-48">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Filter}
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                options={[
                  { value: "all", label: t("clients.filters.allStatus") },
                  { value: "active", label: t("clients.status.active") },
                  { value: "inactive", label: t("clients.status.inactive") },
                ]}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {t("clients.buttons.clear")}
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{t("clients.filters.activeFilters")}</span>
              {search.trim() && (
                <Badge color="blue">
                  {t("clients.filters.searchLabel", { search: search.trim() })}
                </Badge>
              )}
              {status !== "all" && (
                <Badge color="purple">
                  {t("clients.filters.statusLabel", { status: t(`clients.status.${status}`) })}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && !hasInitialLoad && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            {t("clients.loading.initial")}
          </p>
        </div>
      )}

      {/* Table Section */}
      {!loading && hasInitialLoad && clients.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={clients}
              loading={loading}
              onRowClick={handleRowClick}
              pagination={true}
              currentPage={page}
              totalPages={totalPages}
              pageSize={limit}
              totalItems={totalCount}
              onPageChange={setPage}
              onPageSizeChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              striped={true}
              hoverable={true}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={limit}
                onPageSizeChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                totalItems={totalCount}
              />
            </div>
          )}
        </>
      )}

      {/* No Results from Search/Filter */}
      {showNoResults && (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("clients.search.noResults")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("clients.search.noResultsDescription")}
          </p>
          <Button onClick={handleClearFilters} variant="outline">
            {t("clients.buttons.clearAllFilters")}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <UsersIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("clients.empty.title")}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("clients.empty.description")}
          </p>
          <Button onClick={handleAddClient} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            {t("clients.buttons.addFirstClient")}
          </Button>
        </div>
      )}

      {/* Client Detail Modal */}
      <ClientDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        client={selectedClient}
        onEdit={handleEditClient}
        refreshData={fetchClients}
      />

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={selectedClient ? t("clients.modal.editTitle") : t("clients.modal.addTitle")}
        size="lg"
      >
        <ClientForm
          client={selectedClient}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        title={t("clients.modal.deleteTitle")}
        size="md"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t("clients.buttons.deleteClient")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("clients.modal.deleteMessage", { name: confirmationModal.clientName })}
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeConfirmationModal}
                  className="px-4 py-2"
                >
                  {t("clients.buttons.cancel")}
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmationModal.onConfirm}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("clients.buttons.deleteClient")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientsList;