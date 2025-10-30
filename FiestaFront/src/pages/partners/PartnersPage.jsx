import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { partnerService } from '../../api/index';
import { PlusIcon, RefreshCwIcon, UsersIcon } from '../../components/icons/IconComponents';
import PartnerDetails from './PartnerDetails.jsx';
import PartnerForm from './PartnerForm.jsx';

const PartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch partners
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search.trim() || undefined,
        type: type !== 'all' ? type : undefined,
        page,
        limit,
      };
      const res = await partnerService.getAll(params);
      if (res.data) {
        if (Array.isArray(res.data)) {
          setPartners(res.data);
          setTotalPages(1);
        } else {
          setPartners(res.data.partners || []);
          setTotalPages(res.data.totalPages || 1);
        }
      } else {
        setPartners([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to load partners. Please try again.');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, [search, type, page, limit]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Actions
  const handleAddPartner = useCallback(() => {
    setSelectedPartner(null);
    setIsFormOpen(true);
  }, []);

  const handleEditPartner = useCallback((partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewPartner = useCallback((partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPartner(null);
    setIsModalOpen(false);
    setIsFormOpen(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchPartners();
    handleCloseModal();
  }, [fetchPartners, handleCloseModal]);

  const handleRefresh = useCallback(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleSearchChange = useCallback((e) => {
    setPage(1);
    setSearch(e.target.value);
  }, []);

  const handleTypeChange = useCallback((e) => {
    setPage(1);
    setType(e.target.value);
  }, []);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Partners</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Manage your vendors, suppliers, and partner organizations.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCwIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleAddPartner}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Partner
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
            placeholder="Search by name or company..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search partners"
          />
        </div>
        <div className="sm:w-48">
          <Select
            value={type}
            onChange={handleTypeChange}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'vendor', label: 'Vendor' },
              { value: 'supplier', label: 'Supplier' },
              { value: 'sponsor', label: 'Sponsor' },
            ]}
            aria-label="Filter by type"
          />
        </div>
      </Card>

      {/* Table Section */}
      <Card>
        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <UsersIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">Loading partners...</p>
          </div>
        ) : partners.length > 0 ? (
          <>
            <Table
              columns={['Name', 'Company', 'Email', 'Phone', 'Type', 'Status', 'Actions']}
              data={partners.map((p) => [
                p.name || 'Unnamed',
                p.company || '-',
                p.email || '-',
                p.phone || '-',
                <Badge key={`type-${p._id || p.id}`} color="blue">
                  {p.type || 'vendor'}
                </Badge>,
                <Badge
                  key={`status-${p._id || p.id}`}
                  color={p.status === 'active' ? 'green' : 'gray'}
                >
                  {p.status || 'inactive'}
                </Badge>,
                <div key={`actions-${p._id || p.id}`} className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewPartner(p)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleEditPartner(p)}
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
            <p className="mt-2">No partners found. Try adjusting your filters.</p>
          </div>
        )}
      </Card>

      {/* View Modal */}
      {isModalOpen && selectedPartner && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Partner Details">
          <PartnerDetails partner={selectedPartner} onEdit={() => handleEditPartner(selectedPartner)} />
        </Modal>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseModal}
          title={selectedPartner ? 'Edit Partner' : 'Add Partner'}
        >
          <PartnerForm
            partner={selectedPartner}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default PartnersPage;
