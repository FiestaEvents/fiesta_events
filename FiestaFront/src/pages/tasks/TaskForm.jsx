import React, { useState, useEffect } from 'react';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { taskService } from '../../api/index';

const TaskForm = ({ task, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (task?._id) {
        await taskService.update(task._id, formData);
      } else {
        await taskService.create(formData);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Error saving task:', err);
      alert('Failed to save task. Please try again.');
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
        label="Assigned To"
        name="assignedTo"
        value={formData.assignedTo}
        onChange={handleChange}
      />
      <Input
        type="date"
        label="Due Date"
        name="dueDate"
        value={formData.dueDate}
        onChange={handleChange}
      />
      <Select label="Priority" name="priority" value={formData.priority} onChange={handleChange}>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </Select>
      <Select label="Status" name="status" value={formData.status} onChange={handleChange}>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </Select>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
