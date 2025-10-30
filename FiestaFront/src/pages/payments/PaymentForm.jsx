import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { paymentService } from '../../api/index';

const PaymentForm = ({ payment, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    reference: '',
    payerName: '',
    amount: '',
    method: 'cash',
    status: 'pending',
    date: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (payment) {
      setFormData({
        reference: payment.reference || '',
        payerName: payment.payerName || '',
        amount: payment.amount || '',
        method: payment.method || 'cash',
        status: payment.status || 'pending',
        date: payment.date ? payment.date.split('T')[0] : '',
        notes: payment.notes || '',
      });
    }
  }, [payment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (payment?._id) {
        await paymentService.update(payment._id, formData);
      } else {
        await paymentService.create(formData);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Error saving payment:', err);
      alert('Failed to save payment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Reference" name="reference" value={formData.reference} onChange={handleChange} required />
      <Input label="Payer Name" name="payerName" value={formData.payerName} onChange={handleChange} required />
      <Input label="Amount" name="amount" type="number" value={formData.amount} onChange={handleChange} required />
      <Input label="Date" name="date" type="date" value={formData.date} onChange={handleChange} />

      <Select label="Payment Method" name="method" value={formData.method} onChange={handleChange}>
        <option value="cash">Cash</option>
        <option value="card">Card</option>
        <option value="bank">Bank Transfer</option>
        <option value="online">Online</option>
      </Select>

      <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
        <option value="failed">Failed</option>
      </Select>

      <Input label="Notes" name="notes" value={formData.notes} onChange={handleChange} />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : payment ? 'Update Payment' : 'Create Payment'}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
