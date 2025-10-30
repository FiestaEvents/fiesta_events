import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { clientService } from '../../api/index';

const ClientForm = ({ client, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
        address: client.address || '',
        notes: client.notes || '',
        status: client.status || 'active',
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (client?._id) {
        await clientService.update(client._id, formData);
      } else {
        await clientService.create(formData);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Error saving client:', err);
      alert('Failed to save client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />
      <Input
        label="Phone"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
      />
      <Input
        label="Company"
        name="company"
        value={formData.company}
        onChange={handleChange}
      />
      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleChange}
      />
      <Input
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
      />
      <Select
        label="Status"
        name="status"
        value={formData.status}
        onChange={handleChange}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="prospect">Prospect</option>
      </Select>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
