// src/pages/roles/RolePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import { PlusIcon, RefreshCwIcon } from '../../components/icons/IconComponents';
import { roleService } from '../../api/index';
import RoleForm from './RoleForm';
import RoleDetails from './RoleDetails';

const RolePage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        search: search.trim() || undefined,
        page,
        limit,
      };
      const res = await roleService.getAll(params);
      if (res.data) {
        if (Array.isArray(res.data)) {
          setRoles(res.data);
          setTotalPages(1);
        } else {
          setRoles(res.data.roles || []);
          setTotalPages(res.data.totalPages || 1);
        }
      } else {
        setRoles([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles.');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Stats
  const totalRoles = roles.length;
  const adminRoles = roles.filter(r => r.name.toLowerCase().includes('admin')).length;
  const staffRoles = totalRoles - adminRoles;

  // Handlers
  const handleAddRole = () => {
    setSelectedRole(null);
    setIsFormOpen(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleViewRole = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
    setIsModalOpen(false);
    setIsFormOpen(false);
  };

  const handleFormSuccess = () => {
    fetchRoles();
    handleCloseModal();
  };

  const handleRefresh = () => {
    fetchRoles();
  };

  const handleSearchChange = (e) => {
    setPage(1);
    setSearch(e.target.value);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Roles</h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Manage roles and their permissions.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCwIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleAddRole}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Role
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Roles</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalRoles}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Admin Roles</div>
          <div className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{adminRoles}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Staff Roles</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">{staffRoles}</div>
        </Card>
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

      {/* Search */}
      <Card className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
        <div className="flex-1">
          <Input
            placeholder="Search roles..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Search roles"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {roles.length > 0 ? (
          <>
            <Table
              columns={['Role Name', 'Description', 'Permissions', 'Actions']}
              data={roles.map(role => [
                role.name,
                role.description || '-',
                role.permissions?.length || 0,
                <div key={`actions-${role.id}`} className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleViewRole(role)}>View</Button>
                  <Button size="sm" variant="secondary" onClick={() => handleEditRole(role)}>Edit</Button>
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
            <p>No roles found. Try adjusting your search.</p>
          </div>
        )}
      </Card>

      {/* View Role Modal */}
      {isModalOpen && selectedRole && (
        <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Role Details">
          <RoleDetails role={selectedRole} onEdit={() => handleEditRole(selectedRole)} />
        </Modal>
      )}

      {/* Add/Edit Role Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseModal}
          title={selectedRole ? 'Edit Role' : 'Add Role'}
        >
          <RoleForm role={selectedRole} onSuccess={handleFormSuccess} onCancel={handleCloseModal} />
        </Modal>
      )}
    </div>
  );
};

export default RolePage;
