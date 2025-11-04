import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination";
import { clientService } from "../../api/index";
import { UsersIcon } from "../../components/icons/IconComponents";
import { Plus, RefreshCw, Search, Filter, Eye, X } from "lucide-react";
import ClientDetail from "./ClientDetail.jsx";
import ClientForm from "./ClientForm.jsx";

const ClientsList = () => {
  const navigate = useNavigate(); // Add this hook
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch clients with proper API integration
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

      console.log("📄 Fetching clients with params:", params);

      const response = await clientService.getAll(params);
      console.log("📋 Clients API response:", response);

      // Handle different response structures
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
        totalPages = 1;
        totalCount = clientsData.length;
      } else if (Array.isArray(response)) {
        clientsData = response;
        totalPages = 1;
        totalCount = clientsData.length;
      } else {
        console.warn("⚠️ Unexpected response structure:", response);
        clientsData = [];
      }

      console.log("👥 Extracted clients:", clientsData);
      console.log("📊 Pagination info:", { totalPages, totalCount });

      setClients(clientsData);
      setTotalPages(totalPages);
      setTotalCount(totalCount);
      setHasInitialLoad(true);
    } catch (err) {
      console.error("❌ Error fetching clients:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load clients. Please try again.";
      setError(errorMessage);
      setClients([]);
      setTotalPages(1);
      setTotalCount(0);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, page, limit]);

  // Delete client function
  const handleDeleteClient = useCallback(
    async (clientId) => {
      if (!clientId) {
        alert("Invalid client ID");
        return;
      }

      if (
        !window.confirm(
          "Are you sure you want to delete this client? This action cannot be undone."
        )
      ) {
        return;
      }

      try {
        setLoading(true);
        console.log("🗑️ Deleting client:", clientId);

        const response = await clientService.delete(clientId);
        console.log("✅ Delete response:", response);

        alert("Client deleted successfully");
        fetchClients();

        if (selectedClient?._id === clientId) {
          handleCloseDetailModal();
        }
      } catch (err) {
        console.error("❌ Error deleting client:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to delete client. Please try again.";
        alert(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchClients, selectedClient]
  );

  // Effects
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Actions
  const handleAddClient = useCallback(() => {
    setSelectedClient(null);
    setIsFormOpen(true);
  }, []);

  const handleEditClient = useCallback((client) => {
    setSelectedClient(client);
    setIsDetailModalOpen(false);
    setIsFormOpen(true);
  }, []);

  // Fixed: Now using the navigate function that's properly defined
  const handleViewClient = useCallback((client) => {
    navigate(`/clients/${client._id}`, { 
      state: { client } 
    });
  }, [navigate]);

  const handleCloseDetailModal = useCallback(() => {
    setSelectedClient(null);
    setIsDetailModalOpen(false);
  }, []);

  const handleCloseForm = useCallback(() => {
    setSelectedClient(null);
    setIsFormOpen(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchClients();
    handleCloseForm();
  }, [fetchClients, handleCloseForm]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    fetchClients();
  }, [fetchClients]);

  const handleSearchChange = useCallback((e) => {
    setPage(1);
    setSearch(e.target.value);
  }, []);

  const handleStatusChange = useCallback((e) => {
    setPage(1);
    setStatus(e.target.value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = search.trim() !== "" || status !== "all";

  // Check if we should show the empty state (no clients at all, not due to filters)
  const showEmptyState =
    !loading &&
    !error &&
    clients.length === 0 &&
    !hasActiveFilters &&
    hasInitialLoad;

  // Check if we should show "no results" message (due to search/filters)
  const showNoResults =
    !loading &&
    !error &&
    clients.length === 0 &&
    hasActiveFilters &&
    hasInitialLoad;

  // Table columns configuration
  const tableColumns = [
    {
      key: "name",
      label: "CLIENT NAME",
      renderHeader: (column) => (
        <div className="font-semibold text-gray-700 dark:text-gray-300 uppercase text-xs">
          {column.label}
        </div>
      ),
    },
    {
      key: "email",
      label: "EMAIL ADDRESS",
      renderHeader: (column) => (
        <div className="font-semibold text-gray-700 dark:text-gray-300 uppercase text-xs">
          {column.label}
        </div>
      ),
    },
    {
      key: "phone",
      label: "PHONE NUMBER",
      renderHeader: (column) => (
        <div className="font-semibold text-gray-700 dark:text-gray-300 uppercase text-xs">
          {column.label}
        </div>
      ),
    },
    {
      key: "status",
      label: "STATUS",
      renderHeader: (column) => (
        <div className="font-semibold text-gray-700 dark:text-gray-300 uppercase text-xs">
          {column.label}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "DATE CREATED",
      renderHeader: (column) => (
        <div className="font-semibold text-gray-700 dark:text-gray-300 uppercase text-xs">
          {column.label}
        </div>
      ),
    },
    {
      key: "actions",
      label: "ACTIONS",
      renderHeader: (column) => (
        <div className="font-semibold text-gray-700 dark:text-gray-300 uppercase text-xs text-center">
          {column.label}
        </div>
      ),
    },
  ];

  const tableData = clients.map((client) => ({
    name: (
      <div className="font-medium text-gray-900 dark:text-white">
        {client.name || "Unnamed"}
      </div>
    ),
    email: (
      <div className="text-gray-600 dark:text-gray-400">
        {client.email || "No email"}
      </div>
    ),
    phone: (
      <div className="text-gray-600 dark:text-gray-400">
        {client.phone || "-"}
      </div>
    ),
    status: (
      <Badge
        color={
          client.status === "active"
            ? "red"
            : client.status === "inactive"
              ? "gray"
              : "yellow"
        }
      >
        {client.status || "N/A"}
      </Badge>
    ),
    createdAt: (
      <div className="text-gray-600 dark:text-gray-400">
        {client.createdAt
          ? new Date(client.createdAt).toLocaleDateString()
          : "-"}
      </div>
    ),
    actions: (
      <div className="flex justify-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleViewClient(client)}
          className="flex items-center gap-1"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
      </div>
    ),
  }));

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
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={handleAddClient}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 font-medium">
                Error Loading Clients
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
          <Button onClick={handleRefresh} size="sm" variant="outline">
            Retry
          </Button>
        </div>
      )}

      {/* Search & Filters - Always visible when initial load is complete */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Search}
                placeholder="Search clients by name, email, or phone..."
                value={search}
                onChange={handleSearchChange}
                aria-label="Search clients"
              />
            </div>
            <div className="sm:w-48">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Filter}
                value={status}
                onChange={handleStatusChange}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "prospect", label: "Prospect" },
                ]}
                aria-label="Filter by status"
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

          {/* Active Filters Display */}
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
      {loading && !hasInitialLoad ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Loading clients...
          </p>
        </div>
      ) : null}

      {/* Table Section */}
      {!loading && hasInitialLoad && clients.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table
              columns={tableColumns}
              data={tableData}
              emptyMessage="No clients found"
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                pageSize={limit}
                onPageSizeChange={handleLimitChange}
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
        <Card>
          <div className="text-center py-12">
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
        </Card>
      )}

      {/* Client Detail Modal */}
      {isDetailModalOpen && selectedClient && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          title="Client Details"
          size="lg"
          footer={
            <div className="flex justify-between w-full px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] rounded-b-lg">
              <div className="flex-1">
                <Button
                  variant="danger"
                  onClick={() => handleDeleteClient(selectedClient._id)}
                  disabled={loading}
                >
                  Delete Client
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCloseDetailModal}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleEditClient(selectedClient)}
                >
                  Edit Client
                </Button>
              </div>
            </div>
          }
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
          onClose={handleCloseForm}
          title={selectedClient ? "Edit Client" : "Add New Client"}
          size="lg"
        >
          <ClientForm
            client={selectedClient}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseForm}
          />
        </Modal>
      )}
    </div>
  );
};

export default ClientsList;
