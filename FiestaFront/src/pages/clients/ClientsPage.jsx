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
import { PlusIcon, RefreshCwIcon, UsersIcon } from '../../components/icons/IconComponents';
import ClientDetails from './ClientDetails.jsx';
import ClientForm from './ClientForm.jsx';

const ClientsPage = () => {
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
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch clients
  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search.trim() || undefined,
        status: status !== 'all' ? status : undefined,
        page,
        limit,
      };
      const res = await clientService.getAll(params);

      if (res.data) {
        if (Array.isArray(res.data)) {
          setClients(res.data);
          setTotalPages(1);
        } else {
          setClients(res.data.clients || []);
          setTotalPages(res.data.totalPages || 1);
        }
      } else {
        setClients([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Please try again.');
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, page, limit]);

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

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Manage your client records and relationships.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCwIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleAddClient}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Search & Filters */}
      <Card className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search clients"
          />
        </div>
        <div className="sm:w-48">
          <Select
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
      </Card>

      {/* Table Section */}
      <Card>
        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <UsersIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">Loading clients...</p>
          </div>
        ) : clients.length > 0 ? (
          <>
            <Table
              columns={['Name', 'Email', 'Phone', 'Status', 'Created', 'Actions']}
              data={clients.map((client) => [
                client.name || 'Unnamed',
                client.email || 'No email',
                client.phone || '-',
                <Badge
                  key={`badge-${client._id || client.id}`}
                  color={
                    client.status === 'active'
                      ? 'green'
                      : client.status === 'inactive'
                      ? 'gray'
                      : 'yellow'
                  }
                >
                  {client.status || 'N/A'}
                </Badge>,
                client.createdAt
                  ? new Date(client.createdAt).toLocaleDateString()
                  : '-',
                <div key={`actions-${client._id || client.id}`} className="flex gap-2">
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
                </div>,
              ])}
            />
            <div className="mt-6 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={limit}
                onPageSizeChange={setLimit}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <UsersIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">No clients found. Try adjusting your filters.</p>
          </div>
        )}
      </Card>

      {/* View Modal */}
      {isModalOpen && selectedClient && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Client Details">
          <ClientDetails client={selectedClient} onEdit={() => handleEditClient(selectedClient)} />
        </Modal>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseModal}
          title={selectedClient ? 'Edit Client' : 'Add Client'}
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

export default ClientsPage;
