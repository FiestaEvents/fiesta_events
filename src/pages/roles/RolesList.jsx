import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { 
  Shield, 
  Plus, 
  Search, 
  Key, 
  Users, 
  AlertCircle,
  Trash2,
  Eye,
  Edit
} from "lucide-react";

import { roleService } from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Badge from "../../components/common/Badge";
import Table from "../../components/common/NewTable";
import Modal from "../../components/common/Modal";

const RolesList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // State
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Pagination & Filtering
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // ==========================================
  // FETCH DATA
  // ==========================================
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
      const dataPayload = res.data || res;
      
      if (dataPayload.roles) {
        setRoles(dataPayload.roles);
        setTotalItems(dataPayload.total || dataPayload.roles.length);
      } else if (Array.isArray(dataPayload)) {
        setRoles(dataPayload);
        setTotalItems(dataPayload.length);
      } else {
        setRoles([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError(t("roles.alerts.loadError"));
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [search, page, limit, t]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // ==========================================
  // HANDLERS
  // ==========================================
  
  const handleRefresh = () => fetchRoles();

  const confirmDelete = (role) => {
    if (role.isSystemRole) {
      return toast.error(t("roles.alerts.systemRoleDelete"));
    }
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    
    setDeleteLoading(true);
    try {
      await roleService.delete(roleToDelete._id);
      toast.success(t("roles.alerts.deleteSuccess"));
      setDeleteModalOpen(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || t("roles.alerts.deleteError"));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Stats Calculation
  const totalRoles = totalItems;
  const systemRoles = roles.filter(r => r.isSystemRole).length;
  const customRoles = roles.filter(r => !r.isSystemRole).length;

  // ==========================================
  // TABLE COLUMNS
  // ==========================================
  const columns = [
    { 
      header: t("roles.table.roleName"), 
      accessor: "name",
      render: (role) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">{role.name}</span>
            {role.isSystemRole && (
              <Badge color="blue" size="sm">{t("roles.systemRole")}</Badge>
            )}
          </div>
          {role.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{role.description}</p>
          )}
        </div>
      )
    },
    { 
      header: t("roles.table.permissions"), 
      accessor: "permissions",
      render: (role) => (
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {t("roles.table.permissionsCount", { count: role.permissions?.length || 0 })}
          </span>
        </div>
      )
    },
    { 
      header: t("roles.table.level"), 
      accessor: "level",
      render: (role) => <Badge color="purple">Lvl {role.level || 0}</Badge>
    },
    { 
      header: t("roles.table.status"), 
      accessor: "isActive",
      render: (role) => (
        <Badge color={role.isActive ? "green" : "gray"}>
          {role.isActive ? t("common.active") : t("common.inactive") || "Inactive"}
        </Badge>
      )
    },
    {
      header: t("roles.table.actions"),
      accessor: "actions",
      render: (role) => (
        <div className="flex gap-2 justify-end">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => navigate(`/roles/${role._id}/edit`)}
            title={role.isSystemRole ? t("common.view") : t("common.edit")}
          >
            {role.isSystemRole ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
          </Button>
          
          {!role.isSystemRole && (
            <Button 
              size="sm" 
              variant="danger" 
              onClick={() => confirmDelete(role)}
              title={t("common.delete")}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-white dark:bg-gray-900 rounded-lg min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-orange-600" />
            {t("roles.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("roles.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={() => navigate("/roles/new")}>
            <Plus className="w-5 h-5 mr-2 inline-block" />
            {t("roles.create")}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3 dark:bg-gray-800 dark:border-gray-700">
        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <p className="font-medium">{t("roles.infoBanner.title")}</p>
          <p className="mt-1 opacity-90">
            {t("roles.infoBanner.description")}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center dark:border-gray-700 dark:bg-gray-800">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("roles.stats.total")}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 dark:text-white">{totalRoles}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-full dark:bg-purple-900/20">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center dark:border-gray-700 dark:bg-gray-800">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("roles.stats.system")}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 dark:text-white">{systemRoles}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full dark:bg-blue-900/20">
            <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center dark:border-gray-700 dark:bg-gray-800">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t("roles.stats.custom")}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1 dark:text-white">{customRoles}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-full dark:bg-green-900/20">
            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            placeholder={t("roles.searchPlaceholder")}
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="pl-10"
            darkMode={true}
          />
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100 dark:border-gray-700 dark:bg-gray-800">
        <Table
          columns={columns}
          data={roles}
          loading={loading}
          pagination={true}
          currentPage={page}
          pageSize={limit}
          totalItems={totalItems}
          totalPages={Math.ceil(totalItems / limit)}
          onPageChange={setPage}
          onPageSizeChange={(newSize) => {
            setLimit(newSize);
            setPage(1);
          }}
          emptyMessage={t("common.noData")}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title={t("roles.deleteConfirmation.title")}
        size="sm"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 dark:bg-red-900/20 dark:border-red-800">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{t("roles.deleteConfirmation.warning")}</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {t("roles.deleteConfirmation.message", { name: roleToDelete?.name })}
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              loading={deleteLoading}
            >
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default RolesList;