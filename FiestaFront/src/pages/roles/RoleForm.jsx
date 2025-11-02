import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiList , useApiMutation, usePaginatedApi } from '../../hooks/useApi';
import { roleService, permissionService } from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RoleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: role, loading: fetchLoading } = useApi(
    () => isEditMode ? roleService.getById(id) : Promise.resolve(null),
    [id]
  );

  const { data: allPermissions } = usePaginatedApi(
    (params) => permissionService.getAll({ ...params, limit: 100 })
  );

  const updateMutation = useMutation(roleService.update);
  const createMutation = useMutation(roleService.create);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 0,
    isActive: true,
    permissions: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        level: role.level || 0,
        isActive: role.isActive !== undefined ? role.isActive : true,
        permissions: role.permissions?.map(p => p._id || p) || []
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const handleSelectAllInModule = (module) => {
    const modulePermissions = allPermissions?.data?.filter(p => p.module === module) || [];
    const modulePermissionIds = modulePermissions.map(p => p._id);
    
    const allSelected = modulePermissionIds.every(id => formData.permissions.includes(id));
    
    if (allSelected) {
      // Deselect all in this module
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.filter(id => !modulePermissionIds.includes(id))
      }));
    } else {
      // Select all in this module
      setFormData(prev => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...modulePermissionIds])]
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Role name is required';
    }

    if (formData.level < 0 || formData.level > 100) {
      newErrors.level = 'Level must be between 0 and 100';
    }

    if (formData.permissions.length === 0) {
      newErrors.permissions = 'At least one permission must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      if (isEditMode) {
        await updateMutation.mutate(id, formData);
        toast.success('Role updated successfully');
        navigate(`/roles/${id}`);
      } else {
        const response = await createMutation.mutate(formData);
        toast.success('Role created successfully');
        navigate(`/roles/${response._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save role');
    }
  };

  const handleCancel = () => {
    if (isEditMode) {
      navigate(`/roles/${id}`);
    } else {
      navigate('/roles');
    }
  };

  if (isEditMode && fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Group permissions by module
  const permissionsByModule = allPermissions?.data?.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {}) || {};

  const modules = Object.keys(permissionsByModule).sort();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              icon={ArrowLeft}
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Role' : 'Create Role'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode 
                  ? 'Update role information and permissions'
                  : 'Create a new role with specific permissions'
                }
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h3>
              <div className="space-y-6">
                <Input
                  label="Role Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  placeholder="e.g., Event Coordinator"
                  disabled={role?.isSystemRole}
                />

                <Textarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Describe what this role is responsible for..."
                />

                <div className="grid grid-cols-2 gap-6">
                  <Input
                    label="Level"
                    name="level"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.level}
                    onChange={handleChange}
                    error={errors.level}
                    helperText="Higher levels have more authority (0-100)"
                  />

                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Active Role
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Permissions */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Permissions
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Select the permissions for this role
                  </p>
                </div>
                <Badge color="purple">
                  {formData.permissions.length} selected
                </Badge>
              </div>

              {errors.permissions && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{errors.permissions}</p>
                </div>
              )}

              <div className="space-y-6">
                {modules.map((module) => {
                  const modulePermissions = permissionsByModule[module];
                  const allSelected = modulePermissions.every(p => 
                    formData.permissions.includes(p._id)
                  );
                  const someSelected = modulePermissions.some(p => 
                    formData.permissions.includes(p._id)
                  );

                  return (
                    <div key={module} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 capitalize">
                          {module.replace('_', ' ')}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSelectAllInModule(module)}
                        >
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {modulePermissions.map((permission) => (
                          <label
                            key={permission._id}
                            className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission._id)}
                              onChange={() => handlePermissionToggle(permission._id)}
                              className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {permission.displayName}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {permission.description}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge color="blue" size="sm">
                                  {permission.action}
                                </Badge>
                                {permission.scope && (
                                  <Badge color="gray" size="sm">
                                    {permission.scope}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              icon={X}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={updateMutation.loading || createMutation.loading}
            >
              {isEditMode ? 'Update Role' : 'Create Role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleForm;