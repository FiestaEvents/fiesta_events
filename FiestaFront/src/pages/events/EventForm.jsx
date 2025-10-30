// EventForm.jsx
import React, { useState, useCallback } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import eventService from '../../api/index';

const EventForm = ({ event, onSuccess, onCancel }) => {
  const [form, setForm] = useState(
    event || {
      title: '',
      date: '',
      location: '',
      guests: '',
      status: 'pending',
      description: '',
      notes: '',
    }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!form.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!form.date) {
      errors.date = 'Date is required';
    }
    
    if (form.guests && (isNaN(form.guests) || parseInt(form.guests) < 0)) {
      errors.guests = 'Guests must be a positive number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [validationErrors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);
    
    try {
      // Prepare data for submission
      const submitData = {
        ...form,
        guests: form.guests ? parseInt(form.guests) : 0,
      };

      if (event && (event._id || event.id)) {
        await eventService.update(event._id || event.id, submitData);
      } else {
        await eventService.create(submitData);
      }
      
      onSuccess?.();
    } catch (err) {
      console.error('Error saving event:', err);
      setError(err.response?.data?.message || 'Failed to save event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <Input 
          label="Title" 
          name="title" 
          value={form.title} 
          onChange={handleChange} 
          required 
          error={validationErrors.title}
        />
      </div>

      <div>
        <Input 
          label="Date" 
          type="datetime-local" 
          name="date" 
          value={form.date} 
          onChange={handleChange} 
          required 
          error={validationErrors.date}
        />
      </div>

      <div>
        <Input 
          label="Location" 
          name="location" 
          value={form.location} 
          onChange={handleChange}
          placeholder="Enter event location"
        />
      </div>

      <div>
        <Input 
          label="Number of Guests" 
          type="number" 
          name="guests" 
          value={form.guests} 
          onChange={handleChange}
          min="0"
          error={validationErrors.guests}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange} 
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          rows="3"
          placeholder="Enter event description..."
          value={form.description}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Staff Notes
        </label>
        <textarea
          name="notes"
          rows="2"
          placeholder="Internal notes for staff..."
          value={form.notes}
          onChange={handleChange}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
