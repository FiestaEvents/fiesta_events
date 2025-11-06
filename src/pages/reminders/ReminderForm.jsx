import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  X,
  Bell,
  Calendar,
  Link2,
  AlertCircle,
  Repeat,
  Mail,
  MessageSquare,
  Smartphone,
  BellRing,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react';

import { 
  reminderService, 
  eventService, 
  clientService, 
  taskService, 
  paymentService
} from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';

// Constants
const REMINDER_TYPES = {
  EVENT: 'event',
  PAYMENT: 'payment',
  TASK: 'task',
  MAINTENANCE: 'maintenance',
  FOLLOWUP: 'followup',
  OTHER: 'other'
};

const REMINDER_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

const RECURRENCE_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

const NOTIFICATION_METHODS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app'
};

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const ReminderForm = ({ reminder: reminderProp, onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Determine if we're in edit mode
  const isEditMode = Boolean(id || reminderProp?._id || reminderProp?.id);
  const reminderId = id || reminderProp?._id || reminderProp?.id;
  
  // Determine if we're in modal mode (has callbacks)
  const isModalMode = Boolean(onSuccess && onCancel);

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: REMINDER_TYPES.TASK,
    priority: REMINDER_PRIORITIES.MEDIUM,
    reminderDate: '',
    reminderTime: '',
    isRecurring: false,
    recurrence: {
      frequency: RECURRENCE_FREQUENCIES.DAILY,
      interval: 1,
      endDate: '',
      daysOfWeek: [],
      dayOfMonth: '',
    },
    notificationMethods: [NOTIFICATION_METHODS.IN_APP],
    relatedEvent: '',
    relatedClient: '',
    relatedTask: '',
    relatedPayment: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Step configuration
  const steps = [
    {
      number: 1,
      title: "Basic Info",
      icon: Bell,
      color: "orange",
    },
    {
      number: 2,
      title: "Related Items",
      icon: Link2,
      color: "orange",
    },
    {
      number: 3,
      title: "Notifications",
      icon: BellRing,
      color: "orange",
    },
    {
      number: 4,
      title: "Recurrence",
      icon: Repeat,
      color: "orange",
    },
  ];

  // Load reminder data into form
  const loadReminderData = useCallback((reminderData) => {
    if (!reminderData) return;

    setFormData({
      title: reminderData.title || '',
      description: reminderData.description || '',
      type: reminderData.type || REMINDER_TYPES.TASK,
      priority: reminderData.priority || REMINDER_PRIORITIES.MEDIUM,
      reminderDate: reminderData.reminderDate ? 
        new Date(reminderData.reminderDate).toISOString().split('T')[0] : '',
      reminderTime: reminderData.reminderTime || '',
      isRecurring: reminderData.isRecurring || false,
      recurrence: {
        frequency: reminderData.recurrence?.frequency || RECURRENCE_FREQUENCIES.DAILY,
        interval: reminderData.recurrence?.interval || 1,
        endDate: reminderData.recurrence?.endDate ? 
          new Date(reminderData.recurrence.endDate).toISOString().split('T')[0] : '',
        daysOfWeek: reminderData.recurrence?.daysOfWeek || [],
        dayOfMonth: reminderData.recurrence?.dayOfMonth?.toString() || '',
      },
      notificationMethods: reminderData.notificationMethods || [NOTIFICATION_METHODS.IN_APP],
      relatedEvent: reminderData.relatedEvent?._id || reminderData.relatedEvent || '',
      relatedClient: reminderData.relatedClient?._id || reminderData.relatedClient || '',
      relatedTask: reminderData.relatedTask?._id || reminderData.relatedTask || '',
      relatedPayment: reminderData.relatedPayment?._id || reminderData.relatedPayment || '',
      notes: reminderData.notes || '',
    });
  }, []);

  // Fetch reminder data (for edit mode via route)
  const fetchReminder = useCallback(async () => {
    if (!isEditMode || reminderProp) return;

    try {
      setIsLoading(true);
      const response = await reminderService.getById(reminderId);
      const reminderData = response?.reminder || response;
      loadReminderData(reminderData);
    } catch (error) {
      console.error('Error fetching reminder:', error);
      toast.error(error.message || 'Failed to load reminder');
      if (!isModalMode) {
        navigate('/reminders');
      }
    } finally {
      setIsLoading(false);
    }
  }, [reminderId, isEditMode, reminderProp, loadReminderData, isModalMode, navigate]);

  // Fetch related data
  const fetchRelatedData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const [eventsRes, clientsRes, tasksRes, paymentsRes] = await Promise.all([
        eventService.getAll({ page: 1, limit: 100 }),
        clientService.getAll({ page: 1, limit: 100 }),
        taskService.getAll({ page: 1, limit: 100 }),
        paymentService.getAll({ page: 1, limit: 100 }),
      ]);

      setEvents(eventsRes?.events || []);
      setClients(clientsRes?.clients || []);
      setTasks(tasksRes?.tasks || []);
      setPayments(paymentsRes?.payments || []);

    } catch (error) {
      console.error('Failed to fetch related data:', error);
      toast.error('Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    if (reminderProp) {
      loadReminderData(reminderProp);
    } else {
      fetchReminder();
    }
    
    fetchRelatedData();
  }, [reminderProp, fetchReminder, fetchRelatedData, loadReminderData]);

  // Form handlers
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('recurrence.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        recurrence: {
          ...prev.recurrence,
          [field]: type === 'number' ? parseInt(value) || '' : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseInt(value) || '' : value,
      }));
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleNotificationMethodToggle = useCallback((method) => {
    setFormData(prev => {
      const methods = prev.notificationMethods.includes(method)
        ? prev.notificationMethods.filter(m => m !== method)
        : [...prev.notificationMethods, method];
      
      return { ...prev, notificationMethods: methods };
    });
  }, []);

  const handleDayOfWeekToggle = useCallback((day) => {
    setFormData(prev => {
      const days = prev.recurrence.daysOfWeek.includes(day)
        ? prev.recurrence.daysOfWeek.filter(d => d !== day)
        : [...prev.recurrence.daysOfWeek, day];
      
      return {
        ...prev,
        recurrence: {
          ...prev.recurrence,
          daysOfWeek: days,
        },
      };
    });
  }, []);

  // Step validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = 'Title is required';
      }
      if (!formData.reminderDate) {
        newErrors.reminderDate = 'Date is required';
      } else {
        const reminderDate = new Date(formData.reminderDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (reminderDate < today) {
          newErrors.reminderDate = 'Date must be today or in the future';
        }
      }
      if (!formData.reminderTime) {
        newErrors.reminderTime = 'Time is required';
      }
    }

    if (step === 2) {
      if (!formData.relatedTask) {
        newErrors.relatedTask = 'Task is required';
      }
    }

    if (step === 3) {
      if (formData.notificationMethods.length === 0) {
        newErrors.notificationMethods = 'At least one notification method is required';
      }
    }

    if (step === 4 && formData.isRecurring) {
      if (!formData.recurrence.frequency) {
        newErrors['recurrence.frequency'] = 'Frequency is required for recurring reminders';
      }
      
      if (!formData.recurrence.interval || formData.recurrence.interval < 1) {
        newErrors['recurrence.interval'] = 'Interval must be at least 1';
      }

      if (formData.recurrence.frequency === RECURRENCE_FREQUENCIES.WEEKLY && 
          formData.recurrence.daysOfWeek.length === 0) {
        newErrors['recurrence.daysOfWeek'] = 'At least one day must be selected for weekly recurrence';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all required fields
  const validateAllRequired = () => {
    const newErrors = {};

    // Step 1 validations
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.reminderDate) {
      newErrors.reminderDate = 'Date is required';
    }
    if (!formData.reminderTime) {
      newErrors.reminderTime = 'Time is required';
    }

    // Step 2 validations
    if (!formData.relatedTask) {
      newErrors.relatedTask = 'Task is required';
    }

    // Step 3 validations
    if (formData.notificationMethods.length === 0) {
      newErrors.notificationMethods = 'At least one notification method is required';
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
      setIsSaving(true);

      // Prepare data for API
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        priority: formData.priority,
        reminderDate: formData.reminderDate,
        reminderTime: formData.reminderTime,
        isRecurring: formData.isRecurring,
        notificationMethods: formData.notificationMethods,
        notes: formData.notes.trim(),
        relatedTask: formData.relatedTask,
      };

      // Only include recurrence if isRecurring is true
      if (formData.isRecurring) {
        submitData.recurrence = {
          frequency: formData.recurrence.frequency,
          interval: parseInt(formData.recurrence.interval),
          endDate: formData.recurrence.endDate || undefined,
          daysOfWeek: formData.recurrence.frequency === RECURRENCE_FREQUENCIES.WEEKLY 
            ? formData.recurrence.daysOfWeek 
            : undefined,
          dayOfMonth: formData.recurrence.frequency === RECURRENCE_FREQUENCIES.MONTHLY 
            ? parseInt(formData.recurrence.dayOfMonth) 
            : undefined,
        };
      }

      // Only include optional related items if they have values
      if (formData.relatedEvent) submitData.relatedEvent = formData.relatedEvent;
      if (formData.relatedClient) submitData.relatedClient = formData.relatedClient;
      if (formData.relatedPayment) submitData.relatedPayment = formData.relatedPayment;

      if (isEditMode) {
        await reminderService.update(reminderId, submitData);
        toast.success('Reminder updated successfully');
      } else {
        await reminderService.create(submitData);
        toast.success('Reminder created successfully');
      }

      // Handle success based on mode
      if (isModalMode && onSuccess) {
        onSuccess();
      } else {
        navigate('/reminders');
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      
      if (error.status === 400 || error.status === 422) {
        if (error.errors) {
          setErrors(error.errors);
        }
        toast.error(error.message || 'Please fix the validation errors');
      } else {
        const errorMessage = error.message || `Failed to ${isEditMode ? 'update' : 'create'} reminder`;
        toast.error(errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelClick = useCallback(() => {
    if (isModalMode && onCancel) {
      onCancel();
    } else {
      navigate('/reminders');
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
                <Bell className="w-5 h-5 text-white" />
              </div>
              Basic Information
            </h3>

            <Input
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              placeholder="Enter reminder title..."
              className="w-full"
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Add a description for this reminder..."
              className="w-full dark:bg-gray-800"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full"
              >
                <option value={REMINDER_TYPES.EVENT}>Event</option>
                <option value={REMINDER_TYPES.PAYMENT}>Payment</option>
                <option value={REMINDER_TYPES.TASK}>Task</option>
                <option value={REMINDER_TYPES.MAINTENANCE}>Maintenance</option>
                <option value={REMINDER_TYPES.FOLLOWUP}>Follow-up</option>
                <option value={REMINDER_TYPES.OTHER}>Other</option>
              </Select>

              <Select
                label="Priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full"
              >
                <option value={REMINDER_PRIORITIES.LOW}>Low</option>
                <option value={REMINDER_PRIORITIES.MEDIUM}>Medium</option>
                <option value={REMINDER_PRIORITIES.HIGH}>High</option>
                <option value={REMINDER_PRIORITIES.URGENT}>Urgent</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                name="reminderDate"
                type="date"
                value={formData.reminderDate}
                onChange={handleChange}
                error={errors.reminderDate}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
              />

              <Input
                label="Time"
                name="reminderTime"
                type="time"
                value={formData.reminderTime}
                onChange={handleChange}
                error={errors.reminderTime}
                required
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
                <Link2 className="w-5 h-5 text-white" />
              </div>
              Related Items
            </h3>

            <Select
              label="Related Event"
              name="relatedEvent"
              value={formData.relatedEvent}
              onChange={handleChange}
              className="w-full"
            >
              <option value="">Select an event...</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title} - {new Date(event.startDate).toLocaleDateString()}
                </option>
              ))}
            </Select>

            <Select
              label="Related Client"
              name="relatedClient"
              value={formData.relatedClient}
              onChange={handleChange}
              className="w-full"
            >
              <option value="">Select a client...</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} {client.company ? `(${client.company})` : ''}
                </option>
              ))}
            </Select>

            <Select
              label="Related Task"
              name="relatedTask"
              value={formData.relatedTask}
              onChange={handleChange}
              error={errors.relatedTask}
              required
              className="w-full"
            >
              <option value="">Select a task...</option>
              {tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title} - {task.status} ({task.priority})
                </option>
              ))}
            </Select>

            <Select
              label="Related Payment"
              name="relatedPayment"
              value={formData.relatedPayment}
              onChange={handleChange}
              className="w-full"
            >
              <option value="">Select a payment...</option>
              {payments.map((payment) => (
                <option key={payment._id} value={payment._id}>
                  Payment #{payment._id?.slice(-6)} - ${payment.amount} ({payment.status})
                </option>
              ))}
            </Select>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <BellRing className="w-5 h-5 text-white" />
              </div>
              Notification Methods
            </h3>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Notification Methods <span className="text-red-500">*</span>
              </label>
              
              {[
                { value: NOTIFICATION_METHODS.EMAIL, label: 'Email', icon: Mail },
                { value: NOTIFICATION_METHODS.SMS, label: 'SMS', icon: MessageSquare },
                { value: NOTIFICATION_METHODS.PUSH, label: 'Push', icon: Smartphone },
                { value: NOTIFICATION_METHODS.IN_APP, label: 'In-App', icon: BellRing }
              ].map((method) => {
                const Icon = method.icon;
                const isSelected = formData.notificationMethods.includes(method.value);
                return (
                  <label key={method.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleNotificationMethodToggle(method.value)}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.label}</span>
                  </label>
                );
              })}
            </div>
            {errors.notificationMethods && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.notificationMethods}
              </p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Repeat className="w-5 h-5 text-white" />
              </div>
              Recurrence Settings
            </h3>

            <div className="flex items-center gap-3 mb-6">
              <input
                type="checkbox"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Recurrence</span>
            </div>
            
            {formData.isRecurring && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Frequency"
                    name="recurrence.frequency"
                    value={formData.recurrence.frequency}
                    onChange={handleChange}
                    error={errors['recurrence.frequency']}
                    className="w-full"
                  >
                    <option value={RECURRENCE_FREQUENCIES.DAILY}>Daily</option>
                    <option value={RECURRENCE_FREQUENCIES.WEEKLY}>Weekly</option>
                    <option value={RECURRENCE_FREQUENCIES.MONTHLY}>Monthly</option>
                    <option value={RECURRENCE_FREQUENCIES.YEARLY}>Yearly</option>
                  </Select>

                  <Input
                    label="Interval"
                    name="recurrence.interval"
                    type="number"
                    value={formData.recurrence.interval}
                    onChange={handleChange}
                    error={errors['recurrence.interval']}
                    min="1"
                    placeholder="e.g., 1"
                    className="w-full"
                  />
                </div>

                {formData.recurrence.frequency === RECURRENCE_FREQUENCIES.WEEKLY && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Days of Week <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <label
                          key={day.value}
                          className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            formData.recurrence.daysOfWeek.includes(day.value)
                              ? 'bg-orange-500 border-orange-500 text-white'
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-orange-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.recurrence.daysOfWeek.includes(day.value)}
                            onChange={() => handleDayOfWeekToggle(day.value)}
                            className="sr-only"
                          />
                          <span className="text-sm font-medium">{day.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors['recurrence.daysOfWeek'] && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors['recurrence.daysOfWeek']}
                      </p>
                    )}
                  </div>
                )}

                <Textarea
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add any additional notes about this reminder..."
                  className="w-full dark:bg-gray-800"
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium mt-4">Loading reminder form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      {/* Header */}
      {!isModalMode && (
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Reminder' : 'Create New Reminder'}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {isEditMode ? 'Update reminder details' : 'Set up notifications for important deadlines'}
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
                disabled={isSaving}
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
              disabled={isSaving}
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
                loading={isSaving}
                disabled={isSaving}
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
                disabled={isSaving}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={isSaving}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Update Reminder' : 'Create Reminder'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;