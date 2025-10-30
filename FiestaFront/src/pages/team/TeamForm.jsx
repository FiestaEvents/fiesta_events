// src/pages/team/TeamForm.jsx
import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { teamService } from '../../api/index';

const TeamForm = ({ member, onSuccess, onCancel }) => {
  const [name, setName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [role, setRole] = useState(member?.role || 'staff');
  const [status, setStatus] = useState(member?.status || 'active');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (member?.id) {
        // Update existing member
        await teamService.update(member.id, { name, email, role, status });
      } else {
        // Create new member
        await teamService.create({ name, email, role, status });
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving member:', err);
      setError('Failed to save member. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

      <Input
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Enter full name"
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Enter email"
      />

      <Select
        label="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        options={[
          { value: 'admin', label: 'Admin' },
          { value: 'staff', label: 'Staff' },
        ]}
      />

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
        ]}
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
        </Button>
      </div>
    </form>
  );
};

export default TeamForm;
