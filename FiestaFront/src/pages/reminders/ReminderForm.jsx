import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reminderService, eventService, clientService, taskService, paymentService, userService } from '../../api/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Card from '../../components/common/Card';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReminderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

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
    type: 'other',
    priority: 'medium',
    reminderDate: '',
    reminderTime: '',
    isRecurring: false,
    recurrence: {
      frequency: 'daily',
      interval: 1,
      endDate: '',
      daysOfWeek: [],
      dayOfMonth: '',
    },
    notificationMethods: [],
    relatedEvent: '',
    relatedClient: '',
    relatedTask: '',
    relatedPayment: '',
    assignedTo: [],
    notes: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      fetchReminder();
    }
    fetchRelatedData();
  }, [id]);

  const fetchReminder = async () => {
    try {
      setIsLoading(true);
      const data = await reminderService.getById(id);
      const reminder = data.data;

      setFormData({
        title: reminder.title || '',
        description: reminder.description || '',
        type: reminder.type || 'other',
        priority: reminder.priority || 'medium',
        reminderDate: reminder.reminderDate ? new Date(reminder.reminderDate).toISOString().split('T')[0] : '',
        reminderTime: reminder.reminderTime || '',
        isRecurring: reminder.isRecurring || false,
        recurrence: {
          frequency: reminder.recurrence?.frequency || 'daily',
          interval: reminder.recurrence?.interval || 1,
          endDate: reminder.recurrence?.endDate ? new Date(reminder.recurrence.endDate).toISOString().split('T')[0] : '',
          daysOfWeek: reminder.recurrence?.daysOfWeek || [],
          dayOfMonth: reminder.recurrence?.dayOfMonth || '',
        },
        notificationMethods: reminder.notificationMethods || [],
        relatedEvent: reminder.relatedEvent?._id || '',
        relatedClient: reminder.relatedClient?._id || '',
        relatedTask: reminder.relatedTask?._id || '',
        relatedPayment: reminder.relatedPayment?._id || '',
        assignedTo: reminder.assignedTo?.map(u => u._id) || [],
        notes: reminder.notes || '',
      });
    } catch (error) {
      toast.error('Failed to load reminder');
      navigate('/reminders');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedData = async () => {
    try {
      const [eventsRes, clientsRes, tasksRes, paymentsRes, usersRes] = await Promise.all([
        eventService.getAll({ limit: 100 }),
        clientService.getAll({ limit: 100 }),
        taskService.getAll({ limit: 100 }),
        paymentService.getAll({ limit: 100 }),
        userService.getAll({ limit: 100 }),
      ]);

      setEvents(eventsRes.data || []);
      setClients(clientsRes.data || []);
      setTasks(tasksRes.data || []);
      setPayments(paymentsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch related data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('recurrence.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        recurrence: {
          ...prev.recurrence,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNotificationMethodToggle = (method) => {
    setFormData(prev => {
      const methods = prev.notificationMethods.includes(method)
        ? prev.notificationMethods.filter(m => m !== method)
        : [...prev.notificationMethods, method];
      
      return { ...prev, notificationMethods: methods };
    });
  };

  const handleDayOfWeekToggle = (day) => {
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
  };

  const handleAssignedUserToggle = (userId) => {
    setFormData(prev => {
      const users = prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(u => u !== userId)
        : [...prev.assignedTo, userId];
      
      return { ...prev, assignedTo: users };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.reminderDate) {
      newErrors.reminderDate = 'Date is required';
    }

    if (!formData.reminderTime) {
      newErrors.reminderTime = 'Time is required';
    }

    if (formData.isRecurring) {
      if (!formData.recurrence.frequency) {
        newErrors['recurrence.frequency'] = 'Frequency is required for recurring reminders';
      }
      
      if (formData.recurrence.interval < 1) {
        newErrors['recurrence.interval'] = 'Interval must be at least 1';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSaving(true);

      const submitData = {
        ...formData,
        recurrence: formData.isRecurring ? formData.recurrence : undefined,
        relatedEvent: formData.relatedEvent || undefined,
        relatedClient: formData.relatedClient || undefined,
        relatedTask: formData.relatedTask || undefined,
        relatedPayment: formData.relatedPayment || undefined,
      };

      if (isEditMode) {
        await reminderService.update(id, submitData);
        toast.success('Reminder updated successfully');
      } else {
        await reminderService.create(submitData);
        toast.success('Reminder created successfully');
      }

      navigate('/reminders');
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} reminder`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/reminders')}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Reminder' : 'Create Reminder'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Update reminder details' : 'Set up a new reminder'}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic Information
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={errors.title}
                    required
                    placeholder="Enter reminder title"
                  />

                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter reminder description (optional)"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="event">Event</option>
                      <option value="payment">Payment</option>
                      <option value="task">Task</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="followup">Follow-up</option>
                      <option value="other">Other</option>
                    </Select>

                    <Select
                      label="Priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Date"
                      type="date"
                      name="reminderDate"
                      value={formData.reminderDate}
                      onChange={handleChange}
                      error={errors.reminderDate}
                      required
                    />

                    <Input
                      label="Time"
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recurrence Settings
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Recurring Reminder
                    </span>
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Frequency"
                        name="recurrence.frequency"
                        value={formData.recurrence.frequency}
                        onChange={handleChange}
                        error={errors['recurrence.frequency']}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </Select>

                      <Input
                        label="Interval"
                        type="number"
                        name="recurrence.interval"
                        value={formData.recurrence.interval}
                        onChange={handleChange}
                        error={errors['recurrence.interval']}
                        min="1"
                        placeholder="e.g., 1"
                      />
                    </div>

                    {formData.recurrence.frequency === 'weekly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Days of Week
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleDayOfWeekToggle(index)}
                              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                formData.recurrence.daysOfWeek.includes(index)
                                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.recurrence.frequency === 'monthly' && (
                      <Input
                        label="Day of Month"
                        type="number"
                        name="recurrence.dayOfMonth"
                        value={formData.recurrence.dayOfMonth}
                        onChange={handleChange}
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
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Notification Methods */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notification Methods
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'email', label: 'Email' },
                    { value: 'sms', label: 'SMS' },
                    { value: 'push', label: 'Push' },
                    { value: 'in_app', label: 'In-App' },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => handleNotificationMethodToggle(method.value)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                        formData.notificationMethods.includes(method.value)
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Related Items */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Related Items (Optional)
                </h3>

                <div className="space-y-4">
                  <Select
                    label="Related Event"
                    name="relatedEvent"
                    value={formData.relatedEvent}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.title}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Related Client"
                    name="relatedClient"
                    value={formData.relatedClient}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Related Task"
                    name="relatedTask"
                    value={formData.relatedTask}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {tasks.map((task) => (
                      <option key={task._id} value={task._id}>
                        {task.title}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Related Payment"
                    name="relatedPayment"
                    value={formData.relatedPayment}
                    onChange={handleChange}
                  >
                    <option value="">None</option>
                    {payments.map((payment) => (
                      <option key={payment._id} value={payment._id}>
                        Payment #{payment._id.slice(-6)} - ${payment.amount}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assigned Users */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Assign Users
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {users.map((user) => (
                    <label
                      key={user._id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedTo.includes(user._id)}
                        onChange={() => handleAssignedUserToggle(user._id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </Card>

            {/* Additional Notes */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Additional Notes
                </h3>

                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add any additional notes..."
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
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? 'Saving...' : isEditMode ? 'Update Reminder' : 'Create Reminder'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    icon={X}
                    onClick={() => navigate('/reminders')}
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

export default ReminderEdit;