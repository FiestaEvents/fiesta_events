// src/pages/roles/RoleForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { roleService } from '../../api/index';
import Select from '../../components/common/Select';

const RoleForm = ({ role, onSuccess, onCancel }) => {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [permissions, setPermissions] = useState(role?.permissions || []);
  const [allPermissions, setAllPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch available permissions
    const fetchPermissions = async () => {
      try {
        const res = await roleService.getAllPermissions();
        setAllPermissions(res.data || []);
      } catch (err) {
        console.error('Error fetching permissions:', err);
      }
    };
    fetchPermissions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (role?.id) {
        await roleService.update(role.id, { name, description, permissions });
      } else {
        await roleService.create({ name, description, permissions });
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving role:', err);
      setError('Failed to save role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      <Input
        label="Role Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Enter role name"
      />

      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter role description"
      />

      <Select
        label="Permissions"
        value={permissions}
        onChange={(e) => setPermissions(Array.from(e.target.selectedOptions, o => o.value))}
        options={allPermissions.map(p => ({ value: p.id, label: p.name }))}
        multiple
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving...' : role ? 'Update Role' : 'Add Role'}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
