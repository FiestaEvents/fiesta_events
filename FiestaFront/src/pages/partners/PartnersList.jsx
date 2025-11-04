import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { partnerService } from '../../api/index';
import { Plus, RefreshCw, Search, Filter, Building, Users } from 'lucide-react';
import PartnerDetail from './PartnerDetail.jsx';
import PartnerForm from './PartnerForm.jsx';
import { toast } from 'react-hot-toast';

const PartnersList = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingPartner, setDeletingPartner] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch partners with proper API integration
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(type !== 'all' && { type }),
        ...(status !== 'all' && { status }),
      };

      console.log('🔄 Fetching partners with params:', params);

      const response = await partnerService.getAll(params);
      console.log('📋 Partners API response:', response);

      // Handle different response structures
      let partnersData = [];
      let totalPages = 1;
      let totalCount = 0;

      if (response?.data?.data?.partners) {
        partnersData = response.data.data.partners || [];
        totalPages = response.data.data.totalPages || 1;
        totalCount = response.data.data.totalCount || partnersData.length;
      } else if (response?.data?.partners) {
        partnersData = response.data.partners || [];
        totalPages = response.data.totalPages || 1;
        totalCount = response.data.totalCount || partnersData.length;
      } else if (response?.partners) {
        partnersData = response.partners || [];
        totalPages = response.totalPages || 1;
        totalCount = response.totalCount || partnersData.length;
      } else if (Array.isArray(response?.data)) {
        partnersData = response.data;
        totalPages = 1;
        totalCount = partnersData.length;
      } else if (Array.isArray(response)) {
        partnersData = response;
        totalPages = 1;
        totalCount = partnersData.length;
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
        partnersData = [];
      }

      console.log('🤝 Extracted partners:', partnersData);
      console.log('📊 Pagination info:', { totalPages, totalCount });

      setPartners(partnersData);
      setTotalPages(totalPages);
      setTotalCount(totalCount);

    } catch (err) {
      console.error('❌ Error fetching partners:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load partners. Please try again.';
      setError(errorMessage);
      setPartners([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [search, type, status, page, limit]);

  // Delete partner function
  const handleDeletePartner = useCallback(async (partnerId) => {
    if (!partnerId) {
      toast.error('Invalid partner ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this partner? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingPartner(partnerId);
      console.log('🗑️ Deleting partner:', partnerId);

      const response = await partnerService.delete(partnerId);
      console.log('✅ Delete response:', response);

      toast.success('Partner deleted successfully');
      
      // Refresh the list
      fetchPartners();
      
      // Close modal if the deleted partner was selected
      if (selectedPartner?._id === partnerId) {
        handleCloseModal();
      }

    } catch (err) {
      console.error('❌ Error deleting partner:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete partner. Please try again.';
      toast.error(errorMessage);
    } finally {
      setDeletingPartner(null);
    }
  }, [fetchPartners, selectedPartner]);

  // Effects
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
    toast.success(selectedPartner ? 'Partner updated successfully' : 'Partner created successfully');
  }, [fetchPartners, handleCloseModal, selectedPartner]);

  const handleRefresh = useCallback(() => {
    setPage(1);
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

  const handleStatusChange = useCallback((e) => {
    setPage(1);
    setStatus(e.target.value);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  // Get badge color for partner type
  const getTypeColor = (partnerType) => {
    const colors = {
      vendor: 'blue',
      supplier: 'green',
      sponsor: 'purple',
      contractor: 'orange',
      other: 'gray'
    };
    return colors[partnerType] || 'gray';
  };

  // Get badge color for partner status
  const getStatusColor = (partnerStatus) => {
    const colors = {
      active: 'green',
      inactive: 'gray',
      pending: 'yellow',
      suspended: 'red'
    };
    return colors[partnerStatus] || 'gray';
  };

  // Table columns configuration
  const tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'hourlyRate', label: 'Hourly Rate' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = partners.map((partner) => ({
    name: partner.name || 'Unnamed',
    company: partner.company || '-',
    email: partner.email || '-',
    phone: partner.phone || '-',
    type: (
      <Badge color={getTypeColor(partner.type)} className="capitalize">
        {partner.type || 'vendor'}
      </Badge>
    ),
    status: (
      <Badge color={getStatusColor(partner.status)} className="capitalize">
        {partner.status || 'inactive'}
      </Badge>
    ),
    hourlyRate: partner.hourlyRate ? `$${partner.hourlyRate}` : '-',
    actions: (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleViewPartner(partner)}
        >
          View
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleEditPartner(partner)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => handleDeletePartner(partner._id)}
          disabled={deletingPartner === partner._id}
          loading={deletingPartner === partner._id}
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Partners</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your vendors, suppliers, and partner organizations. 
            {totalCount > 0 && ` Showing ${partners.length} of ${totalCount} partners`}
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
            onClick={handleAddPartner}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Partner
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-red-800 dark:text-red-200 font-medium">Error Loading Partners</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <Input
                icon={Search}
                placeholder="Search partners by name or company..."
                value={search}
                onChange={handleSearchChange}
                aria-label="Search partners"
              />
            </div>
            <div className="sm:col-span-1">
              <Select
                icon={Filter}
                value={type}
                onChange={handleTypeChange}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'vendor', label: 'Vendor' },
                  { value: 'supplier', label: 'Supplier' },
                  { value: 'sponsor', label: 'Sponsor' },
                  { value: 'contractor', label: 'Contractor' },
                  { value: 'other', label: 'Other' },
                ]}
                aria-label="Filter by type"
              />
            </div>
            <div className="sm:col-span-1">
              <Select
                icon={Filter}
                value={status}
                onChange={handleStatusChange}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'suspended', label: 'Suspended' },
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
          <div className="text-center py-20">
            <LoadingSpinner size="medium" />
            <p className="mt-3 text-gray-600 dark:text-gray-400">Loading partners...</p>
          </div>
        ) : partners.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={tableColumns}
                data={tableData}
                emptyMessage="No partners found"
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
          <EmptyState
            icon={Users}
            title="No Partners Found"
            description={
              search || type !== 'all' || status !== 'all'
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by adding your first partner.'
            }
            action={
              !search && type === 'all' && status === 'all'
                ? {
                    label: 'Add First Partner',
                    onClick: handleAddPartner
                  }
                : undefined
            }
          />
        )}
      </Card>

      {/* View Modal */}
      {isModalOpen && selectedPartner && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          title="Partner Details"
          size="lg"
        >
          <PartnerDetail 
            partner={selectedPartner} 
            onEdit={() => handleEditPartner(selectedPartner)}
            onDelete={() => handleDeletePartner(selectedPartner._id)}
          />
        </Modal>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseModal}
          title={selectedPartner ? 'Edit Partner' : 'Add New Partner'}
          size="lg"
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

export default PartnersList;