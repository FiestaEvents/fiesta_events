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
  AlertTriangle,
  Users,
  FolderOpen,
} from "lucide-react";

// ✅ API & Services
import { clientService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import Badge, { StatusBadge } from "../../components/common/Badge";

// ✅ Context & Sub-components
import { useToast } from "../../context/ToastContext";
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

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Helper: Strict DD/MM/YYYY format
  const formatDate = (dateString) => {
    if (!dateString) return t("clients.table.defaultValues.noDate");
    return new Date(dateString).toLocaleDateString("en-GB");
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

      let pTotalPages =
        response?.data?.data?.totalPages || response?.pagination?.pages || 1;
      let pTotalCount =
        response?.data?.data?.totalCount ||
        response?.pagination?.total ||
        data.length;

      setClients(data);
      setTotalPages(pTotalPages);
      setTotalCount(pTotalCount);
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
      setHasInitialLoad(true); // ✅ Ensures Empty State logic only triggers after load
    }
  }, [search, status, page, limit, showError, t]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

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
    // ✅ Single Source of Truth for Success Toast
    showSuccess(
      selectedClient
        ? t("clients.toast.updateSuccess")
        : t("clients.toast.createSuccess")
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
    showInfo(t("clients.toast.filtersCleared"));
  };

  // ✅ Logic States
  const hasActiveFilters = search.trim() !== "" || status !== "all";

  // Show Empty State: No loading, no error, empty list, no filters
  const showEmptyState =
    !loading &&
    !error &&
    clients.length === 0 &&
    !hasActiveFilters &&
    hasInitialLoad;

  // Show No Results: No loading, no error, empty list, BUT filters are active
  const showNoResults =
    !loading &&
    !error &&
    clients.length === 0 &&
    hasActiveFilters &&
    hasInitialLoad;

  // Show Data
  const showData = !loading && hasInitialLoad && clients.length > 0;

  // Columns
  const columns = [
    {
      header: t("clients.table.columns.name"),
      accessor: "name",
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
      width: "25%",
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
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: t("clients.table.columns.createdAt"),
      accessor: "createdAt",
      width: "15%",
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
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/clients/${row._id}`, { state: { client: row } });
            }}
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedClient(row);
              setIsFormOpen(true);
            }}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClient(row._id, row.name);
            }}
            className="text-red-600 hover:text-red-700 dark:text-red-400"
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
          Showing{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {start}
          </span>{" "}
          to{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {end}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {totalCount}
          </span>{" "}
          results
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

        {/* Only show header Add button if NOT in empty state */}
        {!showEmptyState && (
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
        )}
      </div>

      {/* Filters (Hide in pure empty state) */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              className="flex-1"
              icon={Search}
              placeholder={t("clients.search.placeholder")}
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <div className="sm:w-48">
              <Select
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
              <Button variant="outline" icon={X} onClick={handleClearFilters}>
                {t("clients.buttons.clear")}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-lg min-h-[300px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">
              {t("clients.loading.initial")}
            </p>
          </div>
        )}

        {/* Table Data */}
        {showData && (
          <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table
                columns={columns}
                data={clients}
                loading={loading}
                onRowClick={(row) => {
                  setSelectedClient(row);
                  setIsDetailModalOpen(true);
                }}
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("clients.search.noResults")}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6">
              {t(
                "clients.search.noResultsDesc",
                "We couldn't find any clients matching your current filters."
              )}
            </p>
            <Button onClick={handleClearFilters} variant="outline" icon={X}>
              {t("clients.buttons.clearAllFilters")}
            </Button>
          </div>
        )}

        {/* ✅ EMPTY STATE (Initial) - Enhanced Design */}
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
              {t(
                "clients.empty.description",
                "Get started by adding your first client. Manage their details and interactions all in one place."
              )}
            </p>

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
          </div>
        )}
      </div>

      {/* Modals */}
      <ClientDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        client={selectedClient}
        onEdit={() => {
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
