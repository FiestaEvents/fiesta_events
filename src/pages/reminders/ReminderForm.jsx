import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Save, 
  X,
  Bell,
  Calendar,
  Users,
  Link,
  FileText
} from 'lucide-react';

// Services
import { 
  reminderService, 
  eventService, 
  clientService, 
  taskService, 
  paymentService, 
  userService 
} from '../../api/index';

// Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Constants from Reminder model
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
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

const ReminderForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: REMINDER_TYPES.OTHER,
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
    assignedTo: [],
    notes: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch reminder data
  const fetchReminder = useCallback(async () => {
    if (!isEditMode) return;

    try {
      setIsLoading(true);
      // FIXED: API service handleResponse already normalizes the response
      const response = await reminderService.getById(id);
      
      // Response should be { reminder: {...} } after handleResponse
      const reminderData = response?.reminder || response;

      if (reminderData) {
        setFormData({
          title: reminderData.title || '',
          description: reminderData.description || '',
          type: reminderData.type || REMINDER_TYPES.OTHER,
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
          assignedTo: reminderData.assignedTo?.map(u => u._id || u) || [],
          notes: reminderData.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching reminder:', error);
      toast.error(error.message || 'Failed to load reminder');
      navigate('/reminders');
    } finally {
      setIsLoading(false);
    }
  }, [id, isEditMode, navigate]);

  // Fetch related data
  const fetchRelatedData = useCallback(async () => {
    try {
      const [eventsRes, clientsRes, tasksRes, paymentsRes, usersRes] = await Promise.all([
        eventService.getAll({ page: 1, limit: 100 }),
        clientService.getAll({ page: 1, limit: 100 }),
        taskService.getAll({ page: 1, limit: 100 }),
        paymentService.getAll({ page: 1, limit: 100 }),
        userService.getAll({ page: 1, limit: 100 }),
      ]);

      // FIXED: API service handleResponse returns normalized data
      // Expected response structure: { events: [], pagination: {} }
      setEvents(eventsRes?.events || []);
      setClients(clientsRes?.clients || []);
      setTasks(tasksRes?.tasks || []);
      setPayments(paymentsRes?.payments || []);
      setUsers(usersRes?.users || []);

    } catch (error) {
      console.error('Failed to fetch related data:', error);
      toast.error('Failed to load related data');
    }
  }, []);

  // Effects
  useEffect(() => {
    fetchReminder();
    fetchRelatedData();
  }, [fetchReminder, fetchRelatedData]);

  // Event handlers
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

    // Clear error for this field
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

  const handleAssignedUserToggle = useCallback((userId) => {
    setFormData(prev => {
      const users = prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(u => u !== userId)
        : [...prev.assignedTo, userId];
      
      return { ...prev, assignedTo: users };
    });
  }, []);

  // Validation
  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.reminderDate) {
      newErrors.reminderDate = 'Date is required';
    } else {
      // FIXED: Proper date comparison
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

    if (formData.isRecurring) {
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

      if (formData.recurrence.frequency === RECURRENCE_FREQUENCIES.MONTHLY) {
        const dayOfMonth = parseInt(formData.recurrence.dayOfMonth);
        if (!formData.recurrence.dayOfMonth || isNaN(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
          newErrors['recurrence.dayOfMonth'] = 'Day of month must be between 1 and 31';
        }
      }

      // FIXED: Validate end date if provided
      if (formData.recurrence.endDate) {
        const endDate = new Date(formData.recurrence.endDate);
        const reminderDate = new Date(formData.reminderDate);
        
        if (endDate <= reminderDate) {
          newErrors['recurrence.endDate'] = 'End date must be after reminder date';
        }
      }
    }

    // FIXED: Validate at least one notification method
    if (formData.notificationMethods.length === 0) {
      newErrors.notificationMethods = 'At least one notification method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the form errors');
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
      };

      // FIXED: Only include recurrence if isRecurring is true
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

      // Only include related items if they have values
      if (formData.relatedEvent) submitData.relatedEvent = formData.relatedEvent;
      if (formData.relatedClient) submitData.relatedClient = formData.relatedClient;
      if (formData.relatedTask) submitData.relatedTask = formData.relatedTask;
      if (formData.relatedPayment) submitData.relatedPayment = formData.relatedPayment;
      
      // Only include assignedTo if there are users
      if (formData.assignedTo.length > 0) {
        submitData.assignedTo = formData.assignedTo;
      }

      if (isEditMode) {
        await reminderService.update(id, submitData);
        toast.success('Reminder updated successfully');
      } else {
        await reminderService.create(submitData);
        toast.success('Reminder created successfully');
      }

      navigate('/reminders');
    } catch (error) {
      console.error('Error saving reminder:', error);
      
      // FIXED: Handle validation errors from API
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

  const handleCancel = useCallback(() => {
    navigate('/reminders');
  }, [navigate]);

  // Select options
  const typeOptions = [
    { value: REMINDER_TYPES.EVENT, label: 'Event' },
    { value: REMINDER_TYPES.PAYMENT, label: 'Payment' },
    { value: REMINDER_TYPES.TASK, label: 'Task' },
    { value: REMINDER_TYPES.MAINTENANCE, label: 'Maintenance' },
    { value: REMINDER_TYPES.FOLLOWUP, label: 'Follow-up' },
    { value: REMINDER_TYPES.OTHER, label: 'Other' }
  ];

  const priorityOptions = [
    { value: REMINDER_PRIORITIES.LOW, label: 'Low' },
    { value: REMINDER_PRIORITIES.MEDIUM, label: 'Medium' },
    { value: REMINDER_PRIORITIES.HIGH, label: 'High' },
    { value: REMINDER_PRIORITIES.URGENT, label: 'Urgent' }
  ];

  const frequencyOptions = [
    { value: RECURRENCE_FREQUENCIES.DAILY, label: 'Daily' },
    { value: RECURRENCE_FREQUENCIES.WEEKLY, label: 'Weekly' },
    { value: RECURRENCE_FREQUENCIES.MONTHLY, label: 'Monthly' },
    { value: RECURRENCE_FREQUENCIES.YEARLY, label: 'Yearly' }
  ];

  const notificationMethodOptions = [
    { value: NOTIFICATION_METHODS.EMAIL, label: 'Email' },
    { value: NOTIFICATION_METHODS.SMS, label: 'SMS' },
    { value: NOTIFICATION_METHODS.PUSH, label: 'Push Notification' },
    { value: NOTIFICATION_METHODS.IN_APP, label: 'In-App' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={handleCancel}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Reminder' : 'Create Reminder'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditMode ? 'Update reminder details and settings' : 'Set up a new reminder for events, tasks, or payments'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Title *"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={errors.title}
                    required
                    placeholder="Enter reminder title"
                    maxLength={200}
                  />

                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter reminder description (optional)"
                    maxLength={1000}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Type *"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      options={typeOptions}
                      required
                    />

                    <Select
                      label="Priority *"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      options={priorityOptions}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Date *"
                      type="date"
                      name="reminderDate"
                      value={formData.reminderDate}
                      onChange={handleChange}
                      error={errors.reminderDate}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />

                    <Input
                      label="Time *"
                      type="time"
                      name="reminderTime"
                      value={formData.reminderTime}
                      onChange={handleChange}
                      error={errors.reminderTime}
                      required
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Recurrence Settings */}
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Recurrence Settings
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleChange}
                      className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recurring Reminder
                    </span>
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Frequency *"
                        name="recurrence.frequency"
                        value={formData.recurrence.frequency}
                        onChange={handleChange}
                        options={frequencyOptions}
                        error={errors['recurrence.frequency']}
                      />

                      <Input
                        label="Interval *"
                        type="number"
                        name="recurrence.interval"
                        value={formData.recurrence.interval}
                        onChange={handleChange}
                        error={errors['recurrence.interval']}
                        min="1"
                        placeholder="e.g., 1"
                      />
                    </div>

                    {formData.recurrence.frequency === RECURRENCE_FREQUENCIES.WEEKLY && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Days of Week *
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => handleDayOfWeekToggle(day.value)}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                formData.recurrence.daysOfWeek.includes(day.value)
                                  ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-300'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                              }`}
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>
                        {errors['recurrence.daysOfWeek'] && (
                          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                            {errors['recurrence.daysOfWeek']}
                          </p>
                        )}
                      </div>
                    )}

                    {formData.recurrence.frequency === RECURRENCE_FREQUENCIES.MONTHLY && (
                      <Input
                        label="Day of Month *"
                        type="number"
                        name="recurrence.dayOfMonth"
                        value={formData.recurrence.dayOfMonth}
                        onChange={handleChange}
                        error={errors['recurrence.dayOfMonth']}
                        min="1"
                        max="31"
                        placeholder="e.g., 15"
                      />
                    )}

                    <Input
                      label="End Date (Optional)"
                      type="date"
                      name="recurrence.endDate"
                      value={formData.recurrence.endDate}
                      onChange={handleChange}
                      error={errors['recurrence.endDate']}
                      min={formData.reminderDate}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Notification Methods */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Notification Methods *
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {notificationMethodOptions.map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => handleNotificationMethodToggle(method.value)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.notificationMethods.includes(method.value)
                          ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-300'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
                {errors.notificationMethods && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-2">
                    {errors.notificationMethods}
                  </p>
                )}
              </div>
            </Card>

            {/* Related Items */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Link className="w-5 h-5 text-orange-500" />
                  Related Items (Optional)
                </h3>

                <div className="space-y-4">
                  <Select
                    label="Related Event"
                    name="relatedEvent"
                    value={formData.relatedEvent}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'None' },
                      ...events.map((event) => ({
                        value: event._id || event.id,
                        label: event.title
                      }))
                    ]}
                  />

                  <Select
                    label="Related Client"
                    name="relatedClient"
                    value={formData.relatedClient}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'None' },
                      ...clients.map((client) => ({
                        value: client._id || client.id,
                        label: client.name
                      }))
                    ]}
                  />

                  <Select
                    label="Related Task"
                    name="relatedTask"
                    value={formData.relatedTask}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'None' },
                      ...tasks.map((task) => ({
                        value: task._id || task.id,
                        label: task.title
                      }))
                    ]}
                  />

                  <Select
                    label="Related Payment"
                    name="relatedPayment"
                    value={formData.relatedPayment}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'None' },
                      ...payments.map((payment) => ({
                        value: payment._id || payment.id,
                        label: `Payment #${(payment._id || payment.id).slice(-6)} - $${payment.amount}`
                      }))
                    ]}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Users */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Assign Users
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <label
                        key={user._id || user.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignedTo.includes(user._id || user.id)}
                          onChange={() => handleAssignedUserToggle(user._id || user.id)}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No users available</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Additional Notes */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Additional Notes
                </h3>

                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add any additional notes..."
                  maxLength={500}
                />
              </div>
            </Card>

            {/* Action Buttons */}
            <Card>
              <div className="p-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Save}
                    loading={isSaving}
                    className="w-full"
                  >
                    {isEditMode ? 'Update Reminder' : 'Create Reminder'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    icon={X}
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;