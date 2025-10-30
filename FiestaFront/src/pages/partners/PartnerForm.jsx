import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { partnerService } from '../../api/index';

const PartnerForm = ({ partner, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: '',
    type: 'vendor',
    status: 'active',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || '',
        company: partner.company || '',
        email: partner.email || '',
        phone: partner.phone || '',
        address: partner.address || '',
        type: partner.type || 'vendor',
        status: partner.status || 'active',
        notes: partner.notes || '',
      });
    }
  }, [partner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (partner?._id) {
        await partnerService.update(partner._id, formData);
      } else {
        await partnerService.create(formData);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Error saving partner:', err);
      alert('Failed to save partner. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
      <Input label="Company" name="company" value={formData.company} onChange={handleChange} />
      <Input label="Email" name="email" value={formData.email} onChange={handleChange} />
      <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
      <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
      <Select label="Type" name="type" value={formData.type} onChange={handleChange}>
        <option value="vendor">Vendor</option>
        <option value="supplier">Supplier</option>
        <option value="sponsor">Sponsor</option>
      </Select>
      <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </Select>
      <Input label="Notes" name="notes" value={formData.notes} onChange={handleChange} />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : partner ? 'Update Partner' : 'Create Partner'}
        </Button>
      </div>
    </form>
  );
};

export default PartnerForm;
