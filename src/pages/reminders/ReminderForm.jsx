import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Save, 
  X,
  Bell,
  Link2,
  Repeat,
  BellRing,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle
} from 'lucide-react';

// ✅ API & Services
import { 
  reminderService, 
  eventService, 
  clientService, 
  taskService, 
  paymentService
} from '../../api/index';

// ✅ Generic Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// ✅ Hooks
import { useToast } from '../../hooks/useToast';

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
  const { t } = useTranslation();
  const { showSuccess, apiError, showError } = useToast();
  
  const isEditMode = Boolean(id || reminderProp?._id);
  const reminderId = id || reminderProp?._id;
  const isModalMode = Boolean(onSuccess && onCancel);

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Data Lists
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

  // Load data helper
  const loadReminderData = useCallback((data) => {
    if (!data) return;
    setFormData({
      title: data.title || '',
      description: data.description || '',
      type: data.type || REMINDER_TYPES.TASK,
      priority: data.priority || REMINDER_PRIORITIES.MEDIUM,
      reminderDate: data.reminderDate ? new Date(data.reminderDate).toISOString().split('T')[0] : '',
      reminderTime: data.reminderTime || '',
      isRecurring: data.isRecurring || false,
      recurrence: {
        frequency: data.recurrence?.frequency || RECURRENCE_FREQUENCIES.DAILY,
        interval: data.recurrence?.interval || 1,
        endDate: data.recurrence?.endDate ? new Date(data.recurrence.endDate).toISOString().split('T')[0] : '',
        daysOfWeek: data.recurrence?.daysOfWeek || [],
        dayOfMonth: data.recurrence?.dayOfMonth?.toString() || '',
      },
      notificationMethods: data.notificationMethods || [NOTIFICATION_METHODS.IN_APP],
      relatedEvent: data.relatedEvent?._id || data.relatedEvent || '',
      relatedClient: data.relatedClient?._id || data.relatedClient || '',
      relatedTask: data.relatedTask?._id || data.relatedTask || '',
      relatedPayment: data.relatedPayment?._id || data.relatedPayment || '',
      notes: data.notes || '',
    });
  }, []);

  // Fetch Initial Data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // 1. Load Dropdown Data
        const [eventsRes, clientsRes, tasksRes, paymentsRes] = await Promise.all([
          eventService.getAll(),
          clientService.getAll(),
          taskService.getAll(),
          paymentService.getAll(),
        ]);
        
        // Robust data extraction
        setEvents(eventsRes?.events || eventsRes?.data || []);
        setClients(clientsRes?.clients || clientsRes?.data || []);
        setTasks(tasksRes?.tasks || tasksRes?.data || []);
        setPayments(paymentsRes?.payments || paymentsRes?.data || []);

        // 2. Load Reminder if Edit Mode
        if (isEditMode && !reminderProp) {
          const res = await reminderService.getById(reminderId);
          loadReminderData(res.reminder || res);
        } else if (reminderProp) {
          loadReminderData(reminderProp);
        }
      } catch (err) {
        apiError(err, t('reminders.notifications.loadError'));
        if (!isModalMode) navigate('/reminders');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [isEditMode, reminderId, reminderProp, isModalMode, navigate, loadReminderData, apiError, t]);

  // Handlers
  const handleChange = (name, value) => {
    if (name.startsWith('recurrence.')) {
      const field = name.split('.')[1];
      setFormData(p => ({ ...p, recurrence: { ...p.recurrence, [field]: value } }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleNotificationToggle = (method) => {
    setFormData(p => {
      const methods = p.notificationMethods.includes(method)
        ? p.notificationMethods.filter(m => m !== method)
        : [...p.notificationMethods, method];
      return { ...p, notificationMethods: methods };
    });
  };

  const handleDayToggle = (day) => {
    setFormData(p => {
      const days = p.recurrence.daysOfWeek.includes(day)
        ? p.recurrence.daysOfWeek.filter(d => d !== day)
        : [...p.recurrence.daysOfWeek, day];
      return { ...p, recurrence: { ...p.recurrence, daysOfWeek: days } };
    });
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = t('reminders.validation.titleRequired');
      if (!formData.reminderDate) newErrors.reminderDate = t('reminders.validation.dateRequired');
      if (!formData.reminderTime) newErrors.reminderTime = t('reminders.validation.timeRequired');
    }
    if (step === 3 && formData.notificationMethods.length === 0) {
      newErrors.notificationMethods = t('reminders.validation.notificationMethodsRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(p => Math.min(p + 1, totalSteps));
    else showError(t('reminders.validation.fixErrors'));
  };

  // Shared Submit Logic
  const submitData = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        recurrence: formData.isRecurring ? {
          ...formData.recurrence,
          interval: parseInt(formData.recurrence.interval),
          endDate: formData.recurrence.endDate || undefined,
        } : undefined
      };

      // Cleanup empty relation fields
      if (!payload.relatedEvent) delete payload.relatedEvent;
      if (!payload.relatedClient) delete payload.relatedClient;
      if (!payload.relatedTask) delete payload.relatedTask;
      if (!payload.relatedPayment) delete payload.relatedPayment;

      if (isEditMode) {
        await reminderService.update(reminderId, payload);
        showSuccess(t('reminders.notifications.updated'));
      } else {
        await reminderService.create(payload);
        showSuccess(t('reminders.notifications.created'));
      }

      if (onSuccess) onSuccess();
      else navigate('/reminders');
    } catch (error) {
      apiError(error, t('reminders.notifications.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      handleNext();
      return;
    }
    if (!validateStep(4)) return showError(t('reminders.validation.fixAllErrors'));
    await submitData();
  };

  // Quick Update Handler
  const handleQuickUpdate = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1);
      return showError(t('reminders.validation.fixErrors'));
    }
    await submitData();
  };

  // Render Helpers
  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8 px-4">
      {[
        { icon: Bell, title: t('reminders.form.basicInfo') },
        { icon: Link2, title: t('reminders.form.relatedItems') },
        { icon: BellRing, title: t('reminders.form.notifications') },
        { icon: Repeat, title: t('reminders.form.recurrence') }
      ].map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        const Icon = step.icon;

        return (
          <div key={stepNum} className="flex flex-col items-center relative z-10">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 cursor-pointer transition-all ${
                isActive ? "bg-orange-600 border-orange-600 text-white scale-110" 
                : isDone ? "bg-green-500 border-green-500 text-white" 
                : "bg-white border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600"
              }`}
              onClick={() => { if (isDone) setCurrentStep(stepNum); }}
            >
              {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
            </div>
            <span className={`text-xs font-medium mt-2 ${isActive ? "text-orange-600" : "text-gray-500"}`}>
              {step.title}
            </span>
            {idx < 3 && (
              <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${
                isDone ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
              }`} style={{ width: "calc(100% * 4)" }} />
            )} 
          </div>
        );
      })}
    </div>
  );

  if (isLoading) return <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-sm">
      {!isModalMode && (
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {isEditMode ? t('reminders.form.editTitle') : t('reminders.form.createTitle')}
        </h1>
      )}

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="space-y-6 min-h-[400px]">
        
        {/* STEP 1: BASIC INFO */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <Input 
              label={t('reminders.form.fields.title')}
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              error={errors.title}
              required
            />
            <Textarea 
              label={t('reminders.form.fields.description')}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select 
                label={t('reminders.form.fields.type')}
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                options={Object.values(REMINDER_TYPES).map(v => ({ value: v, label: t(`reminders.type.${v}`) }))}
              />
              <Select 
                label={t('reminders.form.fields.priority')}
                value={formData.priority}
                onChange={(e) => handleChange("priority", e.target.value)}
                options={Object.values(REMINDER_PRIORITIES).map(v => ({ value: v, label: t(`reminders.priority.${v}`) }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label={t('reminders.form.fields.date')}
                type="date"
                value={formData.reminderDate}
                onChange={(e) => handleChange("reminderDate", e.target.value)}
                error={errors.reminderDate}
                required
              />
              <Input 
                label={t('reminders.form.fields.time')}
                type="time"
                value={formData.reminderTime}
                onChange={(e) => handleChange("reminderTime", e.target.value)}
                error={errors.reminderTime}
                required
              />
            </div>
          </div>
        )}

        {/* STEP 2: RELATED ITEMS */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <Select 
              label={t('reminders.form.fields.relatedEvent')}
              value={formData.relatedEvent}
              onChange={(e) => handleChange("relatedEvent", e.target.value)}
              options={[{ value: "", label: "None" }, ...events.map(e => ({ value: e._id, label: e.title }))]}
            />
            <Select 
              label={t('reminders.form.fields.relatedClient')}
              value={formData.relatedClient}
              onChange={(e) => handleChange("relatedClient", e.target.value)}
              options={[{ value: "", label: "None" }, ...clients.map(c => ({ value: c._id, label: c.name }))]}
            />
            <Select 
              label={t('reminders.form.fields.relatedTask')}
              value={formData.relatedTask}
              onChange={(e) => handleChange("relatedTask", e.target.value)}
              options={[{ value: "", label: "None" }, ...tasks.map(t => ({ value: t._id, label: t.title }))]}
            />
          </div>
        )}

        {/* STEP 3: NOTIFICATIONS */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('reminders.form.fields.notificationMethods')} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(NOTIFICATION_METHODS).map((method) => (
                <label key={method} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.notificationMethods.includes(method)}
                    onChange={() => handleNotificationToggle(method)}
                    className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm capitalize">{method.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
            {errors.notificationMethods && <p className="text-red-500 text-sm mt-1">{errors.notificationMethods}</p>}
          </div>
        )}

        {/* STEP 4: RECURRENCE */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center gap-2 mb-4">
              <input 
                type="checkbox" 
                checked={formData.isRecurring} 
                onChange={(e) => handleChange("isRecurring", e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded"
              />
              <span className="text-sm font-medium">{t('reminders.form.enableRecurrence')}</span>
            </div>

            {formData.isRecurring && (
              <div className="space-y-4 pl-6 border-l-2 border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <Select 
                    label={t('reminders.form.fields.frequency')}
                    value={formData.recurrence.frequency}
                    onChange={(e) => handleChange("recurrence.frequency", e.target.value)}
                    options={Object.values(RECURRENCE_FREQUENCIES).map(v => ({ value: v, label: t(`reminders.recurrence.${v}`) }))}
                  />
                  <Input 
                    label={t('reminders.form.fields.interval')}
                    type="number"
                    min="1"
                    value={formData.recurrence.interval}
                    onChange={(e) => handleChange("recurrence.interval", e.target.value)}
                  />
                </div>
                
                {formData.recurrence.frequency === RECURRENCE_FREQUENCIES.WEEKLY && (
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('reminders.form.fields.daysOfWeek')}</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map(day => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleDayToggle(day.value)}
                          className={`px-3 py-1 rounded text-xs border ${
                            formData.recurrence.daysOfWeek.includes(day.value) 
                              ? "bg-orange-500 text-white border-orange-500" 
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {t(`reminders.weekdays.${day.label.toLowerCase()}`).substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Textarea 
              label={t('reminders.form.fields.notes')}
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
            />
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={() => setCurrentStep(p => p - 1)} icon={ChevronLeft}>
              {t('reminders.form.buttons.previous')}
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={onCancel || (() => navigate('/reminders'))}>
              {t('reminders.form.buttons.cancel')}
            </Button>
          )}

          <div className="flex gap-3">
            {/* Quick Update Button */}
            {isEditMode && currentStep < totalSteps && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleQuickUpdate}
                loading={isSaving}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <Save className="w-4 h-4 mr-2" /> {t('reminders.form.buttons.updateNow')}
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button type="button" variant="primary" onClick={handleNext}>
                {t('reminders.form.buttons.next')} <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" variant="primary" loading={isSaving} icon={Save}>
                {isEditMode ? t('reminders.form.buttons.update') : t('reminders.form.buttons.create')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;