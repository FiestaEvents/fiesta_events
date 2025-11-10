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
import { Plus, Search, Filter, Eye, X, Edit, Trash2, AlertTriangle } from "lucide-react";
import ClientDetail from "./ClientDetail.jsx";
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
    onConfirm: null
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
        "Failed to load clients. Please try again.";
      setError(errorMessage);
      showError(errorMessage);
      setClients([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, page, limit, showError]);

  // Show confirmation modal
  const showDeleteConfirmation = useCallback((clientId, clientName = "Client") => {
    setConfirmationModal({
      isOpen: true,
      clientId,
      clientName,
      onConfirm: () => handleDeleteConfirm(clientId, clientName)
    });
  }, []);

  // Close confirmation modal
  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({
      isOpen: false,
      clientId: null,
      clientName: "",
      onConfirm: null
    });
  }, []);

  // Handle confirmed deletion
  const handleDeleteConfirm = useCallback(async (clientId, clientName = "Client") => {
    if (!clientId) {
      showError("Invalid client ID");
      return;
    }

    try {
      // Use the promise toast for loading state
      await promise(
        clientService.delete(clientId),
        {
          loading: `Deleting ${clientName}...`,
          success: `${clientName} deleted successfully`,
          error: `Failed to delete ${clientName}`
        }
      );

      // Refresh the clients list
      fetchClients();
      
      // Close detail modal if the deleted client is currently selected
      if (selectedClient?._id === clientId) {
        setSelectedClient(null);
        setIsDetailModalOpen(false);
      }
      
      // Close confirmation modal
      closeConfirmationModal();
    } catch (err) {
      // Error is already handled by the promise toast
      console.error("Delete client error:", err);
      closeConfirmationModal();
    }
  }, [fetchClients, selectedClient, promise, showError, closeConfirmationModal]);

  // Updated client deletion handler
  const handleDeleteClient = useCallback((clientId, clientName = "Client") => {
    showDeleteConfirmation(clientId, clientName);
  }, [showDeleteConfirmation]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAddClient = useCallback(() => {
    setSelectedClient(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClient = useCallback((client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewClient = useCallback(
    (client) => {
      navigate(`/clients/${client._id}`, { state: { client } });
    },
    [navigate]
  );

  const handleFormSuccess = useCallback(() => {
    fetchClients();
    setSelectedClient(null);
    setIsFormOpen(false);
    showSuccess(
      selectedClient 
        ? "Client updated successfully" 
        : "Client created successfully"
    );
  }, [fetchClients, selectedClient, showSuccess]);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setPage(1);
    showInfo("Filters cleared");
  }, [showInfo]);

  const handleRetry = useCallback(() => {
    fetchClients();
    showInfo("Retrying to load clients...");
  }, [fetchClients, showInfo]);

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

  // Table columns configuration for the new Table component
  const columns = [
    {
      header: "Client Name",
      accessor: "name",
      sortable: true,
      width: "25%",
      render: (row) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.name || "Unnamed"}
        </div>
      ),
    },
    {
      header: "Email Address",
      accessor: "email",
      sortable: true,
      width: "25%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.email || "No email"}
        </div>
      ),
    },
    {
      header: "Phone Number",
      accessor: "phone",
      sortable: true,
      width: "15%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.phone || "-"}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "15%",
      render: (row) => {
        const statusLabels = {
          active: t("Active"),
          inactive: t("Inactive"),
        };

        return (
          <Badge
            color={
              row.status === "active"
                ? "green"
                : row.status === "inactive"
                  ? "red"
                  : "yellow"
            }
          >
            {statusLabels[row.status] || "N/A"}
          </Badge>
        );
      },
    },
    {
      header: "Date Created",
      accessor: "createdAt",
      sortable: true,
      width: "15%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "-"}
        </div>
      ),
    },
    {
      header: "Actions",
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
            title="View Client"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditClient(row);
            }}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            title="Edit Client"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClient(row._id, row.name || "Client");
            }}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Delete Client"
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Clients
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your client records and relationships.{" "}
            {hasInitialLoad &&
              totalCount > 0 &&
              `Showing ${clients.length} of ${totalCount} clients`}
          </p>
        </div>
        {totalCount > 0 && (
          <Button
            variant="primary"
            onClick={handleAddClient}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                Error Loading Clients
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
            <Button onClick={handleRetry} size="sm" variant="outline">
              Retry
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
                placeholder="Search clients by name, email, or phone..."
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
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
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
                Clear
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Active filters:</span>
              {search.trim() && (
                <Badge color="blue">Search: "{search.trim()}"</Badge>
              )}
              {status !== "all" && (
                <Badge color="purple">Status: {status}</Badge>
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
            Loading clients...
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
              // Enable pagination
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
        <div className="text-center py-12 bg">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No clients found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No clients match your current search or filter criteria.
          </p>
          <Button onClick={handleClearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Empty State - No clients at all */}
      {showEmptyState && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <UsersIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No clients yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by adding your first client.
          </p>
          <Button onClick={handleAddClient} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add First Client
          </Button>
        </div>
      )}

      {/* Client Detail Modal */}
      {isDetailModalOpen && selectedClient && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setSelectedClient(null);
            setIsDetailModalOpen(false);
          }}
          title="Client Details"
          size="lg"
        >
          <div className="p-6">
            <ClientDetail client={selectedClient} />
          </div>
        </Modal>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => {
            setSelectedClient(null);
            setIsFormOpen(false);
          }}
          title={selectedClient ? "Edit Client" : "Add New Client"}
          size="lg"
        >
          <ClientForm
            client={selectedClient}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setSelectedClient(null);
              setIsFormOpen(false);
            }}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        title="Confirm Deletion"
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
                Delete Client
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <strong>"{confirmationModal.clientName}"</strong>? 
                This action cannot be undone and all associated data will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeConfirmationModal}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmationModal.onConfirm}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Client
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