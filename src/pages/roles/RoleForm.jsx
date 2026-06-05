import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { Save, X, CheckSquare, Square } from "lucide-react";

import { roleService } from "../../api/index";
import PermissionMatrix from "./PermissionMatrix";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import OrbitLoader from "../../components/common/LoadingSpinner";

const RoleForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Data State
  const [roleData, setRoleData] = useState({ name: "", description: "" });
  const [allPermissions, setAllPermissions] = useState({}); // Grouped by module
  const [rawPermissions, setRawPermissions] = useState([]); // Flat list for "Select All"
  const [selectedPermIds, setSelectedPermIds] = useState([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // 1. Get All Permissions
      const permRes = await roleService.getPermissions();
      const groupedPerms = permRes.permissions || permRes.data?.permissions || {};
      const flatPerms = permRes.raw || permRes.data?.raw || [];
      
      setAllPermissions(groupedPerms);
      setRawPermissions(flatPerms);

      // 2. If Edit Mode, Get Role Details
      if (isEditMode) {
        const roleRes = await roleService.getById(id);
        const role = roleRes.role || roleRes.data; 
        
        setRoleData({ 
          name: role.name, 
          description: role.description || "" 
        });
        
        const currentIds = (role.permissions || []).map(p => 
          typeof p === 'object' ? p._id : p
        );
        setSelectedPermIds(currentIds);
      }
    } catch (err) {
      console.error(err);
      toast.error(t("roles.form.notifications.loadError"));
      navigate("/roles");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roleData.name.trim()) {
      return toast.error(t("roles.form.validation.nameRequired"));
    }
    if (selectedPermIds.length === 0) {
      return toast.error(t("roles.form.validation.permissionRequired"));
    }

    setSaving(true);
    try {
      const payload = {
        name: roleData.name,
        description: roleData.description,
        permissionIds: selectedPermIds
      };

      if (isEditMode) {
        await roleService.update(id, payload);
        toast.success(t("roles.form.notifications.updated"));
        window.dispatchEvent(new Event("profileUpdated"));
      } else {
        await roleService.create(payload);
        toast.success(t("roles.form.notifications.created"));
      }
      navigate("/roles");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t("roles.form.notifications.saveError"));
    } finally {
      setSaving(false);
    }
  };

  // Helper Actions
  const handleSelectAll = () => {
    const allIds = rawPermissions.map(p => p._id);
    setSelectedPermIds(allIds);
    toast.success(t("roles.form.notifications.selectedAll"));
  };

  const handleDeselectAll = () => {
    setSelectedPermIds([]);
    toast.success(t("roles.form.notifications.cleared"));
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><OrbitLoader /></div>;

  const isOwnerRole = roleData.name === "Owner";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 bg-white dark:bg-gray-900 rounded-lg min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? t("roles.form.editTitle") : t("roles.form.createTitle")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("roles.form.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate("/roles")} icon={X}>
            {t("common.cancel")}
          </Button>
          {!isOwnerRole && (
            <Button onClick={handleSubmit} disabled={saving} loading={saving} icon={Save}>
              {t("common.save")}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("roles.form.detailsTitle")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={t("roles.form.fields.name")}
              value={roleData.name}
              onChange={(e) => setRoleData({...roleData, name: e.target.value})}
              disabled={isOwnerRole}
              required
              placeholder={t("roles.form.placeholders.name")}
              darkMode={true}
              className="w-full"
            />
            <Input
              label={t("roles.form.fields.description")}
              value={roleData.description}
              onChange={(e) => setRoleData({...roleData, description: e.target.value})}
              disabled={isOwnerRole}
              placeholder={t("roles.form.placeholders.description")}
              darkMode={true}
              className="w-full"
            />
          </div>
        </div>

        {/* Permissions Matrix Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm ">
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("roles.form.permissionsTitle")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("roles.form.permissionsCount", { count: selectedPermIds.length })}
              </p>
            </div>
            
            {!isOwnerRole && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <CheckSquare className="w-4 h-4" /> {t("roles.form.selectAll")}
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Square className="w-4 h-4" /> {t("roles.form.clear")}
                </button>
              </div>
            )}
          </div>

          {isOwnerRole ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-400 text-center">
              {t("roles.form.ownerWarning")}
            </div>
          ) : (
            <PermissionMatrix
              availablePermissions={allPermissions}
              selectedIds={selectedPermIds}
              onChange={setSelectedPermIds}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleForm;