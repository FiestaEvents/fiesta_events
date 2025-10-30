import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { reminderService } from '../../api/index';

const ReminderForm = ({ reminder, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    type: 'general',
    status: 'pending',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title || '',
        description: reminder.description || '',
        date: reminder.date ? reminder.date.split('T')[0] : '',
        type: reminder.type || 'general',
        status: reminder.status || 'pending',
      });
    }
  }, [reminder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (reminder?._id) {
        await reminderService.update(reminder._id, formData);
      } else {
        await reminderService.create(formData);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Error saving reminder:', err);
      alert('Failed to save reminder. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Title" name="title" value={formData.title} onChange={handleChange} required />
      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
      />
      <Input
        type="datetime-local"
        label="Date & Time"
        name="date"
        value={formData.date}
        onChange={handleChange}
      />
      <Select label="Type" name="type" value={formData.type} onChange={handleChange}>
        <option value="event">Event</option>
        <option value="payment">Payment</option>
        <option value="task">Task</option>
        <option value="general">General</option>
      </Select>
      <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </Select>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : reminder ? 'Update Reminder' : 'Create Reminder'}
        </Button>
      </div>
    </form>
  );
};

export default ReminderForm;
