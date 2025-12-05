import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save, X, Calendar, Clock, AlertCircle } from "lucide-react";

// ✅ API & Services
import {
  reminderService,
  eventService,
  clientService,
  taskService,
} from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import OrbitLoader from "../../components/common/LoadingSpinner";

// ✅ Hooks
import { useToast } from "../../hooks/useToast";

const REMINDER_TYPES = {
  EVENT: "event",
  PAYMENT: "payment",
  TASK: "task",
  MAINTENANCE: "maintenance",
  FOLLOWUP: "followup",
  OTHER: "other",
};

const REMINDER_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

const ReminderForm = ({ reminder: reminderProp, onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { apiError, showError } = useToast();

  const isEditMode = Boolean(id || reminderProp?._id);
  const reminderId = id || reminderProp?._id;
  const isModalMode = Boolean(onSuccess && onCancel);

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dropdown Data
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: REMINDER_TYPES.TASK,
    priority: REMINDER_PRIORITIES.MEDIUM,
    reminderDate: new Date().toISOString().split("T")[0],
    reminderTime: "09:00",
    relatedEvent: "",
    relatedClient: "",
    relatedTask: "",
  });

  const [errors, setErrors] = useState({});

  // Load Data Helper
  const loadReminderData = useCallback((data) => {
    if (!data) return;
    setFormData({
      title: data.title || "",
      description: data.description || "",
      type: data.type || REMINDER_TYPES.TASK,
      priority: data.priority || REMINDER_PRIORITIES.MEDIUM,
      reminderDate: data.reminderDate
        ? new Date(data.reminderDate).toISOString().split("T")[0]
        : "",
      reminderTime: data.reminderTime || "",
      relatedEvent: data.relatedEvent?._id || data.relatedEvent || "",
      relatedClient: data.relatedClient?._id || data.relatedClient || "",
      relatedTask: data.relatedTask?._id || data.relatedTask || "",
    });
  }, []);

  // Fetch Initial Data
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const [eventsRes, clientsRes, tasksRes] = await Promise.all([
          eventService.getAll(),
          clientService.getAll(),
          taskService.getAll(),
        ]);

        setEvents(eventsRes?.events || eventsRes?.data || []);
        setClients(clientsRes?.clients || clientsRes?.data || []);
        setTasks(tasksRes?.tasks || tasksRes?.data || []);

        if (isEditMode && !reminderProp) {
          const res = await reminderService.getById(reminderId);
          loadReminderData(res.reminder || res);
        } else if (reminderProp) {
          loadReminderData(reminderProp);
        }
      } catch (err) {
        apiError(err, t("reminders.notifications.loadError"));
        if (!isModalMode) navigate("/reminders");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [
    isEditMode,
    reminderId,
    reminderProp,
    isModalMode,
    navigate,
    loadReminderData,
    apiError,
    t,
  ]);

  // Handlers
  const handleChange = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim())
      newErrors.title = t("reminders.validation.titleRequired");
    if (!formData.reminderDate)
      newErrors.reminderDate = t("reminders.validation.dateRequired");
    if (!formData.reminderTime)
      newErrors.reminderTime = t("reminders.validation.timeRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return showError(t("reminders.validation.fixErrors"));

    setIsSaving(true);
    try {
      const payload = { ...formData };

      // Clean empty relations to avoid backend validation errors
      if (!payload.relatedEvent) delete payload.relatedEvent;
      if (!payload.relatedClient) delete payload.relatedClient;
      if (!payload.relatedTask) delete payload.relatedTask;

      if (isEditMode) {
        await reminderService.update(reminderId, payload);
      } else {
        await reminderService.create(payload);
      }

      if (onSuccess) onSuccess();
      else navigate("/reminders");
    } catch (error) {
      apiError(error, t("reminders.notifications.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <OrbitLoader />
      </div>
    );

  return (
    <div className="bg-white dark:bg-[#1f2937] p-6 rounded-lg max-w-2xl mx-auto w-full">
      {!isModalMode && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode
              ? t("reminders.form.editTitle")
              : t("reminders.form.createTitle")}
          </h1>
          <button
            onClick={() => navigate("/reminders")}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <Input
          label={t("reminders.form.fields.title")}
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={errors.title}
          placeholder={t("reminders.form.placeholders.title")}
          required
          autoFocus
        />

        {/* Date & Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <Input
            label={t("reminders.form.fields.date")}
            type="date"
            icon={Calendar}
            value={formData.reminderDate}
            onChange={(e) => handleChange("reminderDate", e.target.value)}
            error={errors.reminderDate}
            required
          />
          <Input
            label={t("reminders.form.fields.time")}
            type="time"
            icon={Clock}
            value={formData.reminderTime}
            onChange={(e) => handleChange("reminderTime", e.target.value)}
            error={errors.reminderTime}
            required
          />
        </div>

        {/* Type & Priority Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label={t("reminders.form.fields.type")}
            value={formData.type}
            onChange={(e) => handleChange("type", e.target.value)}
            options={Object.values(REMINDER_TYPES).map((v) => ({
              value: v,
              label: t(`reminders.type.${v}`),
            }))}
          />
          <Select
            label={t("reminders.form.fields.priority")}
            value={formData.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            options={Object.values(REMINDER_PRIORITIES).map((v) => ({
              value: v,
              label: t(`reminders.priority.${v}`),
            }))}
          />
        </div>

        {/* Description */}
        <Textarea
          label={t("reminders.form.fields.description")}
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
          placeholder={t("reminders.form.placeholders.description")}
        />

        {/* Optional Links */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <AlertCircle size={14} />
            {t("reminders.form.sections.links")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label={t("reminders.form.fields.relatedEvent")}
              value={formData.relatedEvent}
              onChange={(e) => handleChange("relatedEvent", e.target.value)}
              options={[
                { value: "", label: t("common.none") },
                ...events.map((e) => ({ value: e._id, label: e.title })),
              ]}
            />
            <Select
              label={t("reminders.form.fields.relatedClient")}
              value={formData.relatedClient}
              onChange={(e) => handleChange("relatedClient", e.target.value)}
              options={[
                { value: "", label: t("common.none") },
                ...clients.map((c) => ({ value: c._id, label: c.name })),
              ]}
            />
            <Select
              label={t("reminders.form.fields.relatedTask")}
              value={formData.relatedTask}
              onChange={(e) => handleChange("relatedTask", e.target.value)}
              options={[
                { value: "", label: t("common.none") },
                ...tasks.map((t) => ({ value: t._id, label: t.title })),
              ]}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => navigate("/reminders"))}
          >
            {t("reminders.form.buttons.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSaving}
            icon={Save}
          >
            {isEditMode
              ? t("reminders.form.buttons.update")
              : t("reminders.form.buttons.create")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;
