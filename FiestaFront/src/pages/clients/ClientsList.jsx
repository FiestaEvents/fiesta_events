import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { clientService } from '../../api/index';
import { UsersIcon } from '../../components/icons/IconComponents';
import { Plus, RefreshCw, Search, Filter } from 'lucide-react';
import ClientDetail from './ClientDetail.jsx';
import ClientForm from './ClientForm.jsx';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Search & filter state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
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
        ...(status !== 'all' && { status }),
      };

      console.log('🔄 Fetching clients with params:', params);

      const response = await clientService.getAll(params);
      console.log('📋 Clients API response:', response);

      // Handle different response structures
      let clientsData = [];
      let totalPages = 1;
      let totalCount = 0;

      if (response?.data?.data?.clients) {
        // Structure: { data: { data: { clients: [], totalPages, totalCount } } }
        clientsData = response.data.data.clients || [];
        totalPages = response.data.data.totalPages || 1;
        totalCount = response.data.data.totalCount || clientsData.length;
      } else if (response?.data?.clients) {
        // Structure: { data: { clients: [], totalPages, totalCount } }
        clientsData = response.data.clients || [];
        totalPages = response.data.totalPages || 1;
        totalCount = response.data.totalCount || clientsData.length;
      } else if (response?.clients) {
        // Structure: { clients: [], totalPages, totalCount }
        clientsData = response.clients || [];
        totalPages = response.totalPages || 1;
        totalCount = response.totalCount || clientsData.length;
      } else if (Array.isArray(response?.data)) {
        // Structure: { data: [] }
        clientsData = response.data;
        totalPages = 1;
        totalCount = clientsData.length;
      } else if (Array.isArray(response)) {
        // Structure: []
        clientsData = response;
        totalPages = 1;
        totalCount = clientsData.length;
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
        clientsData = [];
      }

      console.log('👥 Extracted clients:', clientsData);
      console.log('📊 Pagination info:', { totalPages, totalCount });

      setClients(clientsData);
      setTotalPages(totalPages);
      setTotalCount(totalCount);

    } catch (err) {
      console.error('❌ Error fetching clients:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load clients. Please try again.';
      setError(errorMessage);
      setClients([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, status, page, limit]);

  // Delete client function
  const handleDeleteClient = useCallback(async (clientId) => {
    if (!clientId) {
      toast.error('Invalid client ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Deleting client:', clientId);

      const response = await clientService.delete(clientId);
      console.log('✅ Delete response:', response);

      // Show success message
      toast.success('Client deleted successfully');
      
      // Refresh the list
      fetchClients();
      
      // Close modal if the deleted client was selected
      if (selectedClient?._id === clientId) {
        handleCloseModal();
      }

    } catch (err) {
      console.error('❌ Error deleting client:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete client. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchClients, selectedClient]);

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
    setIsModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewClient = useCallback((client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedClient(null);
    setIsModalOpen(false);
    setIsFormOpen(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchClients();
    handleCloseModal();
  }, [fetchClients, handleCloseModal]);

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

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  // Table columns configuration
  const tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = clients.map((client) => ({
    name: client.name || 'Unnamed',
    email: client.email || 'No email',
    phone: client.phone || '-',
    status: (
      <Badge
        color={
          client.status === 'active'
            ? 'green'
            : client.status === 'inactive'
            ? 'gray'
            : 'yellow'
        }
      >
        {client.status || 'N/A'}
      </Badge>
    ),
    createdAt: client.createdAt
      ? new Date(client.createdAt).toLocaleDateString()
      : '-',
    actions: (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleViewClient(client)}
        >
          View
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleEditClient(client)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDeleteClient(client._id)}
          disabled={loading}
        >
          Delete
        </Button>
      </div>
    )
  }));

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your client records and relationships. {totalCount > 0 && `Showing ${clients.length} of ${totalCount} clients`}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 font-medium">Error Loading Clients</p>
                <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
              </div>
            </div>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Search & Filters */}
      <Card>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Search clients by name, email, or phone..."
                value={search}
                onChange={handleSearchChange}
                aria-label="Search clients"
              />
            </div>
            <div className="sm:w-48">
              <Select
                icon={Filter}
                value={status}
                onChange={handleStatusChange}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'prospect', label: 'Prospect' },
                ]}
                aria-label="Filter by status"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Table Section */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Loading clients...</p>
          </div>
        ) : clients.length > 0 ? (
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
              <div className="mt-6 px-4 pb-4">
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
        ) : (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No clients found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {search || status !== 'all' 
                ? 'Try adjusting your search criteria or filters.' 
                : 'Get started by adding your first client.'
              }
            </p>
            {!search && status === 'all' && (
              <Button onClick={handleAddClient} variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add First Client
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* View Modal */}
      {isModalOpen && selectedClient && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          title="Client Details"
          size="lg"
        >
          <ClientDetail 
            client={selectedClient} 
            onEdit={() => handleEditClient(selectedClient)}
            onDelete={() => handleDeleteClient(selectedClient._id)}
          />
        </Modal>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseModal}
          title={selectedClient ? 'Edit Client' : 'Add New Client'}
          size="lg"
        >
          <ClientForm
            client={selectedClient}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default ClientsList;