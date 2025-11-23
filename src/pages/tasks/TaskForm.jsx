import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Save,
  X,
  ClipboardList,
  Calendar,
  User,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';

// ✅ API & Services
import { taskService, teamService, eventService, clientService, partnerService } from '../../api/index';

// ✅ Generic Components
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DateInput from '../../components/common/DateInput'; 
import Textarea from '../../components/common/Textarea';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';

// ✅ Context
import { useToast } from '../../context/ToastContext';

const TaskForm = ({ task: taskProp, onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError, showWarning } = useToast();
  
  const isEditMode = Boolean(id || taskProp?._id || taskProp?.id);
  const taskId = id || taskProp?._id || taskProp?.id;
  const isModalMode = Boolean(onSuccess && onCancel);

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    category: 'other',
    dueDate: '', 
    startDate: getTodayDate(),
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
    { value: 'low', label: t('tasks.priority.low') },
    { value: 'medium', label: t('tasks.priority.medium') },
    { value: 'high', label: t('tasks.priority.high') },
    { value: 'urgent', label: t('tasks.priority.urgent') }
  ];

  const TASK_STATUSES = [
    { value: 'pending', label: t('tasks.status.pending') },
    { value: 'todo', label: t('tasks.status.todo') },
    { value: 'in_progress', label: t('tasks.status.in_progress') },
    { value: 'blocked', label: t('tasks.status.blocked') },
    { value: 'completed', label: t('tasks.status.completed') },
    { value: 'cancelled', label: t('tasks.status.cancelled') }
  ];

  const TASK_CATEGORIES = [
    { value: 'event_preparation', label: t('tasks.category.event_preparation') },
    { value: 'marketing', label: t('tasks.category.marketing') },
    { value: 'maintenance', label: t('tasks.category.maintenance') },
    { value: 'client_followup', label: t('tasks.category.client_followup') },
    { value: 'partner_coordination', label: t('tasks.category.partner_coordination') },
    { value: 'administrative', label: t('tasks.category.administrative') },
    { value: 'finance', label: t('tasks.category.finance') },
    { value: 'setup', label: t('tasks.category.setup') },
    { value: 'cleanup', label: t('tasks.category.cleanup') },
    { value: 'other', label: t('tasks.category.other') }
  ];

  const steps = [
    { number: 1, title: t('tasks.form.steps.basicInfo'), icon: ClipboardList },
    { number: 2, title: t('tasks.form.steps.scheduling'), icon: Calendar },
    { number: 3, title: t('tasks.form.steps.assignment'), icon: User },
    { number: 4, title: t('tasks.form.steps.details'), icon: CheckSquare },
  ];

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const loadTaskData = useCallback((taskData) => {
    if (!taskData) return;
    setFormData({
      title: taskData.title || '',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      status: taskData.status || 'todo',
      category: taskData.category || 'other',
      dueDate: taskData.dueDate ? formatDateForInput(taskData.dueDate) : '',
      startDate: taskData.startDate ? formatDateForInput(taskData.startDate) : getTodayDate(),
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

  const fetchTask = useCallback(async () => {
    if (!isEditMode || taskProp) return;
    try {
      setFetchLoading(true);
      const response = await taskService.getById(taskId);
      const taskData = response?.task || response?.data?.task || response;
      loadTaskData(taskData);
    } catch (error) {
      showError(error.message || t('tasks.messages.error.load'));
      if (!isModalMode) navigate('/tasks');
    } finally {
      setFetchLoading(false);
    }
  }, [taskId, isEditMode, taskProp, loadTaskData, isModalMode, navigate, t, showError]);

  const fetchRelatedData = useCallback(async () => {
    try {
      setFetchLoading(true);
      const [teamRes, eventsRes, clientsRes, partnersRes] = await Promise.all([
        teamService.getAll({ page: 1, limit: 100 }).catch(() => ({ data: [] })),
        eventService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
        clientService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
        partnerService.getAll({ limit: 100 }).catch(() => ({ data: [] })),
      ]);

      const eventsData = eventsRes?.events || eventsRes?.data?.events || [];
      
      setTeamMembers(teamRes?.team || teamRes?.data?.team || []);
      setEvents(eventsData);
      setFilteredEvents(eventsData);
      setClients(clientsRes?.clients || clientsRes?.data?.clients || []);
      setPartners(partnersRes?.partners || partnersRes?.data?.partners || []);
    } catch (error) {
      showError(t('tasks.messages.error.loadFormData'));
    } finally {
      setFetchLoading(false);
    }
  }, [t, showError]);

  useEffect(() => {
    if (taskProp) loadTaskData(taskProp);
    else fetchTask();
    fetchRelatedData();
  }, [taskProp, fetchTask, fetchRelatedData, loadTaskData]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleClientChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      relatedClient: value,
      relatedEvent: '' 
    }));
    if (value) fetchEventsByClient(value);
    else setFilteredEvents(events);
  };

  const fetchEventsByClient = async (clientId) => {
    if (!clientId) {
      setFilteredEvents(events);
      return;
    }
    const filtered = events.filter(e => e.client?._id === clientId || e.client === clientId);
    setFilteredEvents(filtered);
  };

  const handleEventChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, relatedEvent: value }));
    if (value) {
      const selectedEvent = events.find(event => event._id === value);
      if (selectedEvent?.client) {
        setFormData(prev => ({ ...prev, relatedClient: selectedEvent.client._id || selectedEvent.client }));
      }
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
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim().toLowerCase()] }));
      setTagInput('');
    }
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

  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = t('tasks.form.validation.titleRequired');
      if (!formData.category) newErrors.category = t('tasks.form.validation.categoryRequired');
    }
    if (step === 2) {
      if (!formData.dueDate) newErrors.dueDate = t('tasks.form.validation.dueDateRequired');
      if (formData.startDate && formData.dueDate && new Date(formData.startDate) > new Date(formData.dueDate)) {
        newErrors.startDate = t('tasks.form.validation.startDateBeforeDue');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllRequired = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = t('tasks.form.validation.titleRequired');
    if (!formData.dueDate) newErrors.dueDate = t('tasks.form.validation.dueDateRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation & Submit
  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    else showWarning(t('tasks.form.validation.fixErrors'));
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step) => {
    if (step < currentStep || validateStep(currentStep)) setCurrentStep(step);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAllRequired()) {
      showWarning(t('tasks.form.validation.fixAllErrors'));
      return;
    }

    try {
      setLoading(true);

      // ✅ FIX: Explicitly sanitize object IDs. 
      // If the value is an empty string "", convert it to null.
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: formData.status,
        category: formData.category,
        
        dueDate: new Date(formData.dueDate).toISOString(),
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        reminderDate: formData.reminderDate ? new Date(formData.reminderDate).toISOString() : undefined,
        
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        progress: formData.progress,
        tags: formData.tags,
        subtasks: formData.subtasks,
        watchers: formData.watchers,

        // ✅ SANITIZATION: Convert "" to null
        assignedTo: formData.assignedTo || null,
        relatedEvent: formData.relatedEvent || null,
        relatedClient: formData.relatedClient || null,
        relatedPartner: formData.relatedPartner || null,
      };

      if (isEditMode) {
        await taskService.update(taskId, submitData);
        showSuccess(t('tasks.messages.success.updated'));
      } else {
        await taskService.create(submitData);
        showSuccess(t('tasks.messages.success.created'));
      }

      if (isModalMode && onSuccess) onSuccess();
      else navigate('/tasks');
    } catch (error) {
      showError(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // --- Renders ---

  const renderStepIndicator = () => (
    <div className="mb-8 px-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const StepIcon = step.icon;

          return (
            <button
              key={step.number}
              type="button"
              onClick={() => handleStepClick(step.number)}
              disabled={!isCompleted && !isCurrent}
              className={`group flex flex-col items-center gap-2 bg-white dark:bg-[#1f2937] px-2 transition-all ${
                isCompleted || isCurrent ? "cursor-pointer" : "cursor-not-allowed opacity-60"
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isCompleted 
                  ? "bg-green-500 border-green-500 text-white" 
                  : isCurrent 
                    ? "bg-orange-600 border-orange-600 text-white ring-4 ring-orange-100 dark:ring-orange-900/30" 
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"
              }`}>
                {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${
                isCurrent ? "text-orange-600 dark:text-orange-400" : "text-gray-500 dark:text-gray-400"
              }`}>
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
              {t('tasks.form.steps.basicInfo')}
            </h3>
            <Input
              label={t('tasks.form.fields.title')}
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              placeholder={t('tasks.form.fields.titlePlaceholder')}
            />
            <Textarea
              label={t('tasks.form.fields.description')}
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder={t('tasks.form.fields.descriptionPlaceholder')}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label={t('tasks.form.fields.priority')} name="priority" value={formData.priority} onChange={handleChange} options={TASK_PRIORITIES} />
              <Select label={t('tasks.form.fields.status')} name="status" value={formData.status} onChange={handleChange} options={TASK_STATUSES} />
              <Select label={t('tasks.form.fields.category')} name="category" value={formData.category} onChange={handleChange} options={TASK_CATEGORIES} error={errors.category} required />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
              {t('tasks.form.steps.scheduling')}
            </h3>
            
            {/* 2 Columns Grid for dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DateInput
                label={t('tasks.form.fields.startDate')}
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
                className="w-full"
              />
              <DateInput
                label={t('tasks.form.fields.dueDate')}
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                error={errors.dueDate}
                required
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <DateInput
                label={t('tasks.form.fields.reminderDate')}
                name="reminderDate"
                value={formData.reminderDate}
                onChange={handleChange}
                className="w-full"
              />
               <Input
                type="number"
                label={t('tasks.form.fields.estimatedHours')}
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleChange}
                min="0"
                step="0.5"
                icon={Clock}
                className="w-full"
              />
            </div>

            {/* Progress Slider */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('tasks.form.fields.progress')}
                </label>
                <span className="text-sm font-bold text-orange-600">{formData.progress}%</span>
              </div>
              <input
                type="range"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
            <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">{t('tasks.form.steps.assignment')}</h3>
                <Select label={t('tasks.form.fields.assignedTo')} name="assignedTo" value={formData.assignedTo} onChange={handleChange} options={[{ value: '', label: t('tasks.form.fields.unassigned') }, ...teamMembers.map(m => ({ value: m._id, label: m.name }))]} />
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('tasks.form.fields.watchers')}</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {teamMembers.map(member => (
                            <label key={member._id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 cursor-pointer hover:border-orange-300 transition-colors">
                                <input type="checkbox" checked={formData.watchers.includes(member._id)} onChange={() => handleWatchersChange(member._id)} className="rounded text-orange-600 focus:ring-orange-500" />
                                <span className="text-sm truncate">{member.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Select label={t('tasks.form.fields.relatedClient')} name="relatedClient" value={formData.relatedClient} onChange={handleClientChange} options={[{ value: '', label: t('tasks.form.fields.noClient') }, ...clients.map(c => ({ value: c._id, label: c.name }))]} />
                    <Select label={t('tasks.form.fields.relatedEvent')} name="relatedEvent" value={formData.relatedEvent} onChange={handleEventChange} options={[{ value: '', label: t('tasks.form.fields.noEvent') }, ...filteredEvents.map(e => ({ value: e._id, label: e.title }))]} />
                    <Select label={t('tasks.form.fields.relatedPartner')} name="relatedPartner" value={formData.relatedPartner} onChange={handleChange} options={[{ value: '', label: t('tasks.form.fields.noPartner') }, ...partners.map(p => ({ value: p._id, label: p.name }))]} />
                </div>
            </div>
        ); 
      case 4:
         return (
             <div className="space-y-4 animate-fadeIn">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">{t('tasks.form.steps.details')}</h3>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tasks.form.fields.tags')}</label>
                    <div className="flex gap-2 mb-2">
                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} placeholder={t('tasks.form.fields.tagPlaceholder')} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-sm" />
                        <Button type="button" variant="outline" onClick={handleAddTag}>{t('tasks.form.buttons.add')}</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="pl-2 pr-1 py-1">{tag}<X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => setFormData(p => ({...p, tags: p.tags.filter(t => t !== tag)}))} /></Badge>
                        ))}
                    </div>
                 </div>

                 <div className="border-t pt-4 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('tasks.form.fields.subtasks')}</label>
                    <div className="flex gap-2 mb-3">
                        <Input value={newSubtask.title} onChange={(e) => setNewSubtask(prev => ({ ...prev, title: e.target.value }))} placeholder={t('tasks.form.fields.subtaskTitlePlaceholder')} className="flex-1" />
                        <Button type="button" variant="outline" icon={Plus} onClick={handleAddSubtask} />
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {formData.subtasks.map((subtask, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 group">
                                <span className="text-sm text-gray-700 dark:text-gray-300">{subtask.title}</span>
                                <button type="button" onClick={() => setFormData(p => ({...p, subtasks: p.subtasks.filter((_, i) => i !== index)}))} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>
         );
      default: return null;
    }
  };

  if (fetchLoading && isEditMode) return <div className="p-10 text-center">{t('common.loading')}</div>;

  return (
    <div className="bg-white dark:bg-[#1f2937] h-full flex flex-col">
      {!isModalMode && (
        <div className="mb-6 p-6 pb-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? t('tasks.form.editTitle') : t('tasks.form.createTitle')}
          </h1>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 pt-2">
        {renderStepIndicator()}
        
        <div className="flex-1 mt-2 mb-6">
          {renderStepContent()}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevious} disabled={loading}>
                <ChevronLeft className="w-4 h-4 mr-1" /> {t('tasks.form.buttons.previous')}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={isModalMode && onCancel ? onCancel : () => navigate('/tasks')} disabled={loading}>
              {t('common.cancel')}
            </Button>
            
            {/* Quick Update Button (Matches Screenshot "Update Now") */}
            {isEditMode && currentStep < totalSteps && (
               <Button type="button" variant="secondary" onClick={(e) => { e.preventDefault(); handleSubmit(e); }} loading={loading}>
                 <Save className="w-4 h-4 mr-2" /> {t('tasks.form.buttons.updateNow')}
               </Button>
            )}

            {currentStep < totalSteps ? (
              <Button type="button" variant="primary" onClick={handleNext} disabled={loading}>
                {t('tasks.form.buttons.next')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" variant="primary" loading={loading}>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? t('tasks.form.buttons.update') : t('tasks.form.buttons.create')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;