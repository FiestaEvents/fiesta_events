import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePaginationList, useApiMutation } from "../../hooks/useApi";
import { roleService } from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Table from "../../components/common/Table";
import Modal from "../../components/common/Modal";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import {
  Shield,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Users,
  Key,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const RolesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const {
    data: roles,
    loading,
    pagination,
    setPage,
    refetch,
  } = usePaginationList(
    (params) =>
      roleService.getAll({
        ...params,
        search: searchTerm,
      }),
    [searchTerm]
  );

  const deleteMutation = useApiMutation(roleService.delete);

  const handleDelete = async () => {
    if (!selectedRole) return;

    if (selectedRole.isSystemRole) {
      toast.error("Cannot delete system roles");
      return;
    }

    try {
      await deleteMutation.mutate(selectedRole._id);
      toast.success("Role deleted successfully");
      setShowDeleteModal(false);
      setSelectedRole(null);
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete role");
    }
  };

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

  const columns = [
    {
      key: "name",
      label: "Role Name",
      sortable: true,
      render: (role) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{role.name}</span>
            {role.isSystemRole && (
              <Badge color="blue" size="sm">
                System
              </Badge>
            )}
          </div>
          {role.description && (
            <p className="text-sm text-gray-500 mt-1">{role.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (role) => (
        <div className="flex items-center">
          <Key className="w-4 h-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">
            {role.permissions?.length || 0} permissions
          </span>
        </div>
      ),
    },
    {
      key: "level",
      label: "Level",
      sortable: true,
      render: (role) => <Badge color="purple">Level {role.level || 0}</Badge>,
    },
    {
      key: "isActive",
      label: "Status",
      render: (role) => (
        <Badge color={role.isActive ? "green" : "gray"}>
          {role.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (role) => (
        <span className="text-sm text-gray-600">
          {formatDate(role.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (role) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => navigate(`/roles/${role._id}`)}
          >
            View
          </Button>
          {!role.isSystemRole && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={Edit}
                onClick={() => navigate(`/roles/${role._id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => {
                  setSelectedRole(role);
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Roles & Permissions
          </h1>
          <p className="text-gray-600 mt-1">
            Manage roles and their associated permissions
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate("/roles/new")}
        >
          Create Role
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50">
        <div className="p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">About Roles & Permissions</p>
            <p className="mt-1">
              Roles define what team members can do in your venue. System roles
              (Owner, Manager, Staff, Viewer) cannot be deleted, but you can
              create custom roles with specific permissions for your team's
              needs.
            </p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pagination?.total || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System Roles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {roles?.filter((r) => r.isSystemRole).length || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Custom Roles</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {roles?.filter((r) => !r.isSystemRole).length || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Input
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />
      </div>

      {/* Roles Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : roles?.length > 0 ? (
        <Table columns={columns} data={roles} loading={loading} />
      ) : (
        <EmptyState
          icon={Shield}
          title="No Roles Found"
          description={
            searchTerm
              ? "No roles match your search criteria."
              : "Create custom roles to manage team permissions."
          }
          action={{
            label: "Create Role",
            onClick: () => navigate("/roles/new"),
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Role"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the role{" "}
            <strong>{selectedRole?.name}</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              This action cannot be undone. Team members assigned to this role
              will need to be reassigned.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteMutation.loading}
            >
              Delete Role
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolesPage;
