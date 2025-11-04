import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  User, 
  Flag, 
  ClipboardList,
  Save,
  X
} from 'lucide-react';
import { taskService, teamService } from '../../api/index';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Textarea from '../../components/common/Textarea';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const TaskForm = ({ isOpen, onClose, task, onSuccess }) => {
  const isEditMode = !!task;
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
  });

  // UI state
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Constants following documentation patterns
  const TASK_PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
  };

  const TASK_STATUSES = {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    DONE: 'done'
  };

  const priorityOptions = [
    { value: TASK_PRIORITIES.LOW, label: 'Low' },
    { value: TASK_PRIORITIES.MEDIUM, label: 'Medium' },
    { value: TASK_PRIORITIES.HIGH, label: 'High' }
  ];

  const statusOptions = [
    { value: TASK_STATUSES.TODO, label: 'To Do' },
    { value: TASK_STATUSES.IN_PROGRESS, label: 'In Progress' },
    { value: TASK_STATUSES.DONE, label: 'Done' }
  ];

  // Fetch team members for assignment
  const fetchTeamMembers = useCallback(async () => {
    try {
      setFetchLoading(true);
      
      const response = await teamService.getAll({ page: 1, limit: 100 });
      
      // Handle response structure according to documentation
      let teamData = [];
      if (response?.data?.team) {
        teamData = response.data.team;
      } else if (response?.data) {
        teamData = response.data;
      } else if (Array.isArray(response)) {
        teamData = response;
      }

      setTeamMembers(teamData);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to load team members');
      setTeamMembers([]);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen, fetchTeamMembers]);

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority || TASK_PRIORITIES.MEDIUM,
        status: task.status || TASK_STATUSES.TODO,
      });
    }
  }, [task, isOpen]);

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) < new Date().setHours(0, 0, 0, 0)) {
      newErrors.dueDate = 'Due date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedTo: formData.assignedTo || undefined,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status
      };

      let response;
      if (isEditMode) {
        response = await taskService.update(task._id, submitData);
        toast.success('Task updated successfully');
      } else {
        response = await taskService.create(submitData);
        toast.success('Task created successfully');
      }

      handleClose();
      onSuccess?.(response);
    } catch (error) {
      console.error('Error saving task:', error);
      
      // Handle validation errors from API
      if (error.status === 422 && error.errors) {
        setErrors(error.errors);
        toast.error('Please fix the validation errors');
      } else {
        const errorMessage = error.message || `Failed to ${isEditMode ? 'update' : 'create'} task`;
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: TASK_PRIORITIES.MEDIUM,
      status: TASK_STATUSES.TODO,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Task' : 'Create New Task'}
      size="lg"
    >
      {fetchLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Basic Task Information */}
            <Card className="border-0 shadow-sm">
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-orange-500" />
                  Task Details
                </h4>
                <div className="space-y-4">
                  <Input
                    label="Task Title *"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={errors.title}
                    required
                    placeholder="Enter task title"
                    icon={ClipboardList}
                  />

                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the task details, requirements, or instructions..."
                    error={errors.description}
                  />
                </div>
              </div>
            </Card>

            {/* Assignment & Scheduling */}
            <Card className="border-0 shadow-sm">
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  Assignment & Scheduling
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Assign To"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...teamMembers.map(member => ({
                        value: member._id,
                        label: member.name || member.email,
                        ...(member.avatar && { avatar: member.avatar })
                      }))
                    ]}
                    icon={User}
                  />

                  <Input
                    type="date"
                    label="Due Date *"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    error={errors.dueDate}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    icon={Calendar}
                  />
                </div>
              </div>
            </Card>

            {/* Status & Priority */}
            <Card className="border-0 shadow-sm">
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-orange-500" />
                  Status & Priority
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    options={priorityOptions}
                    icon={Flag}
                  />

                  <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    options={statusOptions}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-600">
            <Button
              type="button"
              variant="outline"
              icon={X}
              onClick={handleClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={loading}
              className="min-w-[140px]"
            >
              {isEditMode ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default TaskForm;