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
  Users
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
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

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

      // Data extraction logic
      let data = response?.data?.data?.clients || response?.data?.clients || response?.clients || response?.data || response || [];
      if (!Array.isArray(data)) data = [];

      let pTotalPages = response?.data?.data?.totalPages || response?.data?.totalPages || response?.totalPages || 1;
      let pTotalCount = response?.data?.data?.totalCount || response?.data?.totalCount || response?.totalCount || data.length;

      setClients(data);
      setTotalPages(pTotalPages);
      setTotalCount(pTotalCount);
      setHasInitialLoad(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || t("clients.errors.loadingDefault");
      setError(errorMessage);
      showError(errorMessage);
      setClients([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, page, limit, showError, t]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // --- Handlers ---

  const handleDeleteConfirm = useCallback(async (clientId, clientName) => {
    try {
      await promise(clientService.delete(clientId), {
        loading: t("clients.toast.deleting", { name: clientName }),
        success: t("clients.toast.deleteSuccess", { name: clientName }),
        error: t("clients.toast.deleteError", { name: clientName }),
      });
      fetchClients();
      setConfirmationModal({ isOpen: false, clientId: null, clientName: "", onConfirm: null });
      if (selectedClient?._id === clientId) setIsDetailModalOpen(false);
    } catch (err) {
      // Promise handles UI feedback
    }
  }, [fetchClients, selectedClient, promise, t]);

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
    showSuccess(selectedClient ? t("clients.toast.updateSuccess") : t("clients.toast.createSuccess"));
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setPage(1);
    showInfo(t("clients.toast.filtersCleared"));
  };

  const handleRetry = () => {
    fetchClients();
    showInfo(t("clients.loading.retrying"));
  };

  const hasActiveFilters = search.trim() !== "" || status !== "all";
  const showEmptyState = !loading && !error && clients.length === 0 && !hasActiveFilters && hasInitialLoad;
  const showNoResults = !loading && !error && clients.length === 0 && hasActiveFilters && hasInitialLoad;

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
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); navigate(`/clients/${row._id}`, { state: { client: row } }); }}
            className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
            title={t("clients.table.actions.view")}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); setSelectedClient(row); setIsFormOpen(true); }}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            title={t("clients.table.actions.edit")}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); handleDeleteClient(row._id, row.name); }}
            className="text-red-600 hover:text-red-700 dark:text-red-400"
            title={t("clients.table.actions.delete")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // ✅ Helper to render custom footer if Pagination component hides itself on single page
  const renderPagination = () => {
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

    // Custom single page footer
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
            className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("clients.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("clients.description")} {hasInitialLoad && totalCount > 0 && `(${totalCount})`}
          </p>
        </div>
        {totalCount > 0 && (
          <Button variant="primary" onClick={() => { setSelectedClient(null); setIsFormOpen(true); }} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t("clients.buttons.addClient")}
          </Button>
        )}
      </div>

      {/* Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input className="flex-1" icon={Search} placeholder={t("clients.search.placeholder")} value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} />
            <div className="sm:w-48">
              <Select 
                icon={Filter} 
                value={status} 
                onChange={(e) => { setPage(1); setStatus(e.target.value); }}
                options={[
                  { value: "all", label: t("clients.filters.allStatus") },
                  { value: "active", label: t("clients.status.active") },
                  { value: "inactive", label: t("clients.status.inactive") }
                ]}
              />
            </div>
            {hasActiveFilters && (
              <Button variant="outline" icon={X} onClick={handleClearFilters}>{t("clients.buttons.clear")}</Button>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !hasInitialLoad && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">{t("clients.loading.initial")}</p>
        </div>
      )}

      {/* Table */}
      {!loading && hasInitialLoad && clients.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={clients}
              loading={loading}
              onRowClick={(row) => { setSelectedClient(row); setIsDetailModalOpen(true); }}
              striped
              hoverable
            />
          </div>
          
          {/* ✅ Pagination (Always Visible if data exists) */}
          {renderPagination()}
        </>
      )}

      {/* Empty / No Results */}
      {showNoResults ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("clients.search.noResults")}</h3>
          <Button onClick={handleClearFilters} variant="outline">{t("clients.buttons.clearAllFilters")}</Button>
        </div>
      ) : showEmptyState ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("clients.empty.title")}</h3>
          <Button onClick={() => setIsFormOpen(true)} variant="primary" icon={Plus}>{t("clients.buttons.addFirstClient")}</Button>
        </div>
      ) : null}

      {/* Modals */}
      <ClientDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        client={selectedClient}
        onEdit={() => { setIsDetailModalOpen(false); setIsFormOpen(true); }}
        refreshData={fetchClients}
      />

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedClient ? t("clients.modal.editTitle") : t("clients.modal.addTitle")} size="lg">
        <ClientForm client={selectedClient} onSuccess={handleFormSuccess} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <Modal isOpen={confirmationModal.isOpen} onClose={() => setConfirmationModal(p => ({ ...p, isOpen: false }))} title={t("clients.modal.deleteTitle")} size="md">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 rounded-full p-2">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t("clients.buttons.deleteClient")}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t("clients.modal.deleteMessage", { name: confirmationModal.clientName })}</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmationModal(p => ({ ...p, isOpen: false }))}>{t("clients.buttons.cancel")}</Button>
                <Button variant="danger" onClick={confirmationModal.onConfirm} icon={Trash2}>{t("clients.buttons.deleteClient")}</Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientsList;