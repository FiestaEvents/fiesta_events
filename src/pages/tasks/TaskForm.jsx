import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Save,
  X,
  ClipboardList,
  Calendar,
  User,
  Flag,
  Link,
  Tag,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
  Eye,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { taskService, teamService, eventService, clientService, partnerService } from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';

const TaskForm = ({ task: taskProp, onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Determine if we're in edit mode
  const isEditMode = Boolean(id || taskProp?._id || taskProp?.id);
  const taskId = id || taskProp?._id || taskProp?.id;
  
  // Determine if we're in modal mode (has callbacks)
  const isModalMode = Boolean(onSuccess && onCancel);

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Helper function to format date for display (dd/mm/yyyy)
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Helper function to format date for input (yyyy-mm-dd)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Helper function to parse dd/mm/yyyy to Date object
  const parseDateFromDisplay = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('/');
    return new Date(year, month - 1, day);
  };

  // Get today's date in yyyy-mm-dd format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    category: 'other',
    dueDate: '', // Due date is now empty by default
    startDate: getTodayDate(), // Start date defaults to today
    reminderDate: '',
    estimatedHours: '',
    assignedTo: '',
    watchers: [],
    relatedEvent: '',
    relatedClient: '',
    relatedPartner: '',
    tags: [],
    subtasks: [],
    progress: 0,
  });

  // UI state
  const [teamMembers, setTeamMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [newSubtask, setNewSubtask] = useState({ title: '', description: '' });

  // Constants
  const TASK_PRIORITIES = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'medium', label: 'Medium', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  const TASK_STATUSES = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'todo', label: 'To Do', color: 'blue' },
    { value: 'in_progress', label: 'In Progress', color: 'purple' },
    { value: 'blocked', label: 'Blocked', color: 'red' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' }
  ];

  const TASK_CATEGORIES = [
    { value: 'event_preparation', label: 'Event Preparation' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'client_followup', label: 'Client Follow-up' },
    { value: 'partner_coordination', label: 'Partner Coordination' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'finance', label: 'Finance' },
    { value: 'setup', label: 'Setup' },
    { value: 'cleanup', label: 'Cleanup' },
    { value: 'other', label: 'Other' }
  ];

  // Step configuration
  const steps = [
    {
      number: 1,
      title: "Basic Info",
      icon: ClipboardList,
      color: "orange",
    },
    {
      number: 2,
      title: "Scheduling",
      icon: Calendar,
      color: "orange",
    },
    {
      number: 3,
      title: "Assignment",
      icon: User,
      color: "orange",
    },
    {
      number: 4,
      title: "Details",
      icon: CheckSquare,
      color: "orange",
    },
  ];

  // Load task data into form
  const loadTaskData = useCallback((taskData) => {
    if (!taskData) return;

    setFormData({
      title: taskData.title || '',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'todo',
      category: taskData.category || 'other',
      dueDate: taskData.dueDate ? formatDateForInput(taskData.dueDate) : '',
      startDate: taskData.startDate ? formatDateForInput(taskData.startDate) : getTodayDate(), // Default to today if no start date
      reminderDate: taskData.reminderDate ? formatDateForInput(taskData.reminderDate) : '',
      estimatedHours: taskData.estimatedHours || '',
      assignedTo: taskData.assignedTo?._id || taskData.assignedTo || '',
      watchers: taskData.watchers?.map(w => w._id || w) || [],
      relatedEvent: taskData.relatedEvent?._id || taskData.relatedEvent || '',
      relatedClient: taskData.relatedClient?._id || taskData.relatedClient || '',
      relatedPartner: taskData.relatedPartner?._id || taskData.relatedPartner || '',
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || [],
      progress: taskData.progress || 0,
    });
  }, []);

  // Fetch events by client ID
  const fetchEventsByClient = useCallback(async (clientId) => {
    if (!clientId) {
      setFilteredEvents(events);
      return;
    }

    try {
      setFetchLoading(true);
      const response = await eventService.getByClientId(clientId);
      const clientEvents = response?.events || response?.data?.events || response?.data || [];
      setFilteredEvents(clientEvents);
    } catch (error) {
      console.error('Error fetching client events:', error);
      toast.error('Failed to load client events');
      setFilteredEvents(events);
    } finally {
      setFetchLoading(false);
    }
  }, [events]);

  // Set client when event is selected
  const setClientFromEvent = useCallback((eventId) => {
    if (!eventId) {
      return;
    }

    const selectedEvent = events.find(event => event._id === eventId);
    if (selectedEvent && selectedEvent.client) {
      setFormData(prev => ({
        ...prev,
        relatedClient: selectedEvent.client._id || selectedEvent.client
      }));
    }
  }, [events]);

  // Fetch task data (for edit mode via route)
  const fetchTask = useCallback(async () => {
    if (!isEditMode || taskProp) return;

    try {
      setFetchLoading(true);
      const response = await taskService.getById(taskId);
      const taskData = response?.task || response?.data?.task || response;
      loadTaskData(taskData);
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error(error.message || 'Failed to load task');
      if (!isModalMode) {
        navigate('/tasks');
      }
    } finally {
      setFetchLoading(false);
    }
  }, [taskId, isEditMode, taskProp, loadTaskData, isModalMode, navigate]);

  // Fetch related data
  const fetchRelatedData = useCallback(async () => {
    try {
      setFetchLoading(true);
      
      const [teamRes, eventsRes, clientsRes, partnersRes] = await Promise.all([
        teamService.getAll({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        eventService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
        clientService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
        partnerService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
      ]);

      const teamData = teamRes?.team || teamRes?.data?.team || teamRes?.data || [];
      const eventsData = eventsRes?.events || eventsRes?.data?.events || eventsRes?.data || [];
      const clientsData = clientsRes?.clients || clientsRes?.data?.clients || clientsRes?.data || [];
      const partnersData = partnersRes?.partners || partnersRes?.data?.partners || partnersRes?.data || [];

      setTeamMembers(teamData);
      setEvents(eventsData);
      setFilteredEvents(eventsData);
      setClients(clientsData);
      setPartners(partnersData);
    } catch (error) {
      console.error('Error fetching related data:', error);
      toast.error('Failed to load form data');
    } finally {
      setFetchLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (taskProp) {
      loadTaskData(taskProp);
    } else {
      fetchTask();
    }
    
    fetchRelatedData();
  }, [taskProp, fetchTask, fetchRelatedData, loadTaskData]);

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Enhanced handler for client change
  const handleClientChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      relatedClient: value,
      relatedEvent: '' // Reset event when client changes
    }));
    
    // Fetch events for the selected client
    if (value) {
      fetchEventsByClient(value);
    } else {
      setFilteredEvents(events);
    }
  };

  // Enhanced handler for event change
  const handleEventChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, relatedEvent: value }));
    
    // Set client from selected event
    if (value) {
      setClientFromEvent(value);
    }
  };

  const handleWatchersChange = (userId) => {
    setFormData(prev => ({
      ...prev,
      watchers: prev.watchers.includes(userId)
        ? prev.watchers.filter(id => id !== userId)
        : [...prev.watchers, userId]
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleAddSubtask = () => {
    if (newSubtask.title.trim()) {
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, {
          title: newSubtask.title.trim(),
          description: newSubtask.description.trim(),
          completed: false,
          order: prev.subtasks.length
        }]
      }));
      setNewSubtask({ title: '', description: '' });
    }
  };

  const handleRemoveSubtask = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  // Step validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Task title is required';
      }
      if (!formData.category) {
        newErrors.category = 'Category is required';
      }
    }

    if (step === 2) {
      if (!formData.dueDate) {
        newErrors.dueDate = 'Due date is required';
      }

      if (formData.startDate && formData.dueDate) {
        if (new Date(formData.startDate) > new Date(formData.dueDate)) {
          newErrors.startDate = 'Start date must be before due date';
        }
      }

      if (formData.reminderDate && formData.dueDate) {
        if (new Date(formData.reminderDate) > new Date(formData.dueDate)) {
          newErrors.reminderDate = 'Reminder date must be before due date';
        }
      }

      if (formData.estimatedHours && (formData.estimatedHours < 0 || formData.estimatedHours > 1000)) {
        newErrors.estimatedHours = 'Estimated hours must be between 0 and 1000';
      }
    }

    if (step === 3) {
      // No required validations for assignment (optional fields)
    }

    if (step === 4) {
      // No required validations for details (optional fields)
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all required fields
  const validateAllRequired = () => {
    const newErrors = {};

    // Step 1 validations
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    // Step 2 validations
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  // Prevent Enter key from submitting form except on last step
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && currentStep < totalSteps) {
      e.preventDefault();
      handleNext(e);
    }
  };

  // Quick update handler
  const handleQuickUpdate = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateAllRequired()) {
      toast.error('Please fix all required fields before updating');
      setCurrentStep(1);
      return;
    }

    await handleSubmit(e);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // For create mode on non-final steps, validate current step only
    if (!isEditMode && currentStep < totalSteps) {
      if (!validateStep(currentStep)) {
        toast.error('Please fix the errors in the form');
        return;
      }
      handleNext(e);
      return;
    }

    // For final step or edit mode, validate all
    if (!validateAllRequired()) {
      toast.error('Please fix all required fields');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        category: formData.category,
        dueDate: new Date(formData.dueDate).toISOString(),
        progress: formData.progress,
        tags: formData.tags,
        subtasks: formData.subtasks,
      };

      // Optional fields
      if (formData.startDate) submitData.startDate = new Date(formData.startDate).toISOString();
      if (formData.reminderDate) submitData.reminderDate = new Date(formData.reminderDate).toISOString();
      if (formData.estimatedHours) submitData.estimatedHours = parseFloat(formData.estimatedHours);
      if (formData.assignedTo) submitData.assignedTo = formData.assignedTo;
      if (formData.watchers.length > 0) submitData.watchers = formData.watchers;
      if (formData.relatedEvent) submitData.relatedEvent = formData.relatedEvent;
      if (formData.relatedClient) submitData.relatedClient = formData.relatedClient;
      if (formData.relatedPartner) submitData.relatedPartner = formData.relatedPartner;

      if (isEditMode) {
        await taskService.update(taskId, submitData);
        toast.success('Task updated successfully');
      } else {
        await taskService.create(submitData);
        toast.success('Task created successfully');
      }

      // Handle success based on mode
      if (isModalMode && onSuccess) {
        onSuccess();
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      
      if (error.status === 400 || error.status === 422) {
        if (error.errors) {
          setErrors(error.errors);
        }
        toast.error(error.message || 'Please fix the validation errors');
      } else {
        const errorMessage = error.message || `Failed to ${isEditMode ? 'update' : 'create'} task`;
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = useCallback(() => {
    if (isModalMode && onCancel) {
      onCancel();
    } else {
      navigate('/tasks');
    }
  }, [isModalMode, onCancel, navigate]);

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                onClick={(e) => handleStepClick(step.number, e)}
                className={`flex flex-col items-center gap-2 transition-all ${
                  isCompleted || isCurrent
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
                disabled={!isCompleted && !isCurrent}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-orange-600 text-white"
                      : isCurrent
                        ? "bg-orange-600 text-white ring-4 ring-orange-200 dark:ring-orange-900"
                        : "bg-orange-200 dark:bg-orange-700 text-orange-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCompleted || isCurrent
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Step {step.number} of {totalSteps}
                  </div>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2 mb-8">
                  <div
                    className={`h-full transition-all duration-300 ${
                      step.number < currentStep
                        ? "bg-orange-600"
                        : "bg-transparent"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              Basic Information
            </h3>

            <Input
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              placeholder="Enter a clear, descriptive task title"
              className="w-full"
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Provide detailed information about the task, requirements, or instructions..."
              error={errors.description}
              className="w-full dark:bg-gray-800"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={TASK_PRIORITIES.map(p => ({ value: p.value, label: p.label }))}
                className="w-full"
              />

              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={TASK_STATUSES.map(s => ({ value: s.value, label: s.label }))}
                className="w-full"
              />

              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={errors.category}
                required
                options={TASK_CATEGORIES}
                className="w-full"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              Scheduling & Time Tracking
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="date"
                label="Start Date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
                className="w-full"
              />

              <Input
                type="date"
                label="Due Date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                error={errors.dueDate}
                required
                className="w-full"
              />

              <Input
                type="date"
                label="Reminder Date"
                name="reminderDate"
                value={formData.reminderDate}
                onChange={handleChange}
                error={errors.reminderDate}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Estimated Hours"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                error={errors.estimatedHours}
                min="0"
                max="1000"
                step="0.5"
                placeholder="0.0"
                className="w-full"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Progress (%)
                </label>
                <input
                  type="range"
                  name="progress"
                  value={formData.progress}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span className="font-medium text-orange-600">{formData.progress}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              Assignment & Collaboration
            </h3>

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
                }))
              ]}
              disabled={fetchLoading}
              className="w-full"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Watchers
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {teamMembers.map(member => (
                  <label key={member._id} className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.watchers.includes(member._id)}
                      onChange={() => handleWatchersChange(member._id)}
                      className="rounded text-orange-600"
                    />
                    <span className="text-sm text-gray-900 dark:text-white truncate">
                      {member.name || member.email}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Related Client"
                name="relatedClient"
                value={formData.relatedClient}
                onChange={handleClientChange}
                options={[
                  { value: '', label: 'No client' },
                  ...clients.map(client => ({
                    value: client._id,
                    label: client.name,
                  }))
                ]}
                disabled={fetchLoading}
                className="w-full"
              />

              <Select
                label="Related Event"
                name="relatedEvent"
                value={formData.relatedEvent}
                onChange={handleEventChange}
                options={[
                  { value: '', label: 'No event' },
                  ...filteredEvents.map(event => ({
                    value: event._id,
                    label: event.title,
                  }))
                ]}
                disabled={fetchLoading}
                className="w-full"
              />

              <Select
                label="Related Partner"
                name="relatedPartner"
                value={formData.relatedPartner}
                onChange={handleChange}
                options={[
                  { value: '', label: 'No partner' },
                  ...partners.map(partner => ({
                    value: partner._id,
                    label: partner.name,
                  }))
                ]}
                disabled={fetchLoading}
                className="w-full"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              Additional Details
            </h3>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tag and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} color="blue" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Subtasks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtasks
              </label>
              <div className="space-y-2 mb-3">
                <Input
                  label="Subtask Title"
                  value={newSubtask.title}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter subtask title"
                  className="w-full"
                />
                <Input
                  label="Subtask Description (optional)"
                  value={newSubtask.description}
                  onChange={(e) => setNewSubtask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                  className="w-full"
                />
                <Button type="button" variant="outline" icon={Plus} onClick={handleAddSubtask}>
                  Add Subtask
                </Button>
              </div>

              {formData.subtasks.length > 0 && (
                <div className="space-y-2">
                  {formData.subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{subtask.title}</p>
                        {subtask.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">{subtask.description}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleRemoveSubtask(index)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (fetchLoading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium mt-4">Loading task form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937]">
      {/* Header */}
      {!isModalMode && (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Task' : 'Create New Task'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isEditMode ? 'Update task details' : 'Fill in the details to create a new task'}
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="space-y-6"
      >
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        <div className="min-h-[400px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelClick}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>

            {/* Quick Update button - only show in edit mode and not on last step */}
            {isEditMode && currentStep < totalSteps && (
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickUpdate}
                loading={loading}
                disabled={loading}
                className="bg-orange-500 text-white dark:bg-orange-600 dark:hover:bg-orange-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Update Now
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={loading}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Task' : 'Create Task'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;