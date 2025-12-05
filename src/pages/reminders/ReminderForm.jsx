import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  AlertCircle,
} from "lucide-react";

// ✅ API & Services
import {
  reminderService,
  eventService,
  clientService,
  taskService,
  paymentService,
} from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import OrbitLoader from "../../components/common/LoadingSpinner"; 
import DateInput from "../../components/common/DateInput";

// ✅ Hooks
import { useToast } from "../../hooks/useToast";

// Constants
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

const RECURRENCE_FREQUENCIES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

const NOTIFICATION_METHODS = {
  EMAIL: "email",
  SMS: "sms",
  PUSH: "push",
  IN_APP: "in_app",
};

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const ReminderForm = ({ reminder: reminderProp, onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // ✅ Removed showSuccess (Parent handles it)
  const { apiError, showError } = useToast();

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
  // const [payments, setPayments] = useState([]); // Kept if you plan to use it later

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: REMINDER_TYPES.TASK,
    priority: REMINDER_PRIORITIES.MEDIUM,
    reminderDate: "",
    reminderTime: "",
    isRecurring: false,
    recurrence: {
      frequency: RECURRENCE_FREQUENCIES.DAILY,
      interval: 1,
      endDate: "",
      daysOfWeek: [],
      dayOfMonth: "",
    },
    notificationMethods: [NOTIFICATION_METHODS.IN_APP],
    relatedEvent: "",
    relatedClient: "",
    relatedTask: "",
    relatedPayment: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Load data helper
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
      isRecurring: data.isRecurring || false,
      recurrence: {
        frequency: data.recurrence?.frequency || RECURRENCE_FREQUENCIES.DAILY,
        interval: data.recurrence?.interval || 1,
        endDate: data.recurrence?.endDate
          ? new Date(data.recurrence.endDate).toISOString().split("T")[0]
          : "",
        daysOfWeek: data.recurrence?.daysOfWeek || [],
        dayOfMonth: data.recurrence?.dayOfMonth?.toString() || "",
      },
      notificationMethods: data.notificationMethods || [
        NOTIFICATION_METHODS.IN_APP,
      ],
      relatedEvent: data.relatedEvent?._id || data.relatedEvent || "",
      relatedClient: data.relatedClient?._id || data.relatedClient || "",
      relatedTask: data.relatedTask?._id || data.relatedTask || "",
      relatedPayment: data.relatedPayment?._id || data.relatedPayment || "",
      notes: data.notes || "",
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
    if (name.startsWith("recurrence.")) {
      const field = name.split(".")[1];
      setFormData((p) => ({
        ...p,
        recurrence: { ...p.recurrence, [field]: value },
      }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleNotificationToggle = (method) => {
    setFormData((p) => {
      const methods = p.notificationMethods.includes(method)
        ? p.notificationMethods.filter((m) => m !== method)
        : [...p.notificationMethods, method];
      return { ...p, notificationMethods: methods };
    });
  };

  const handleDayToggle = (day) => {
    setFormData((p) => {
      const days = p.recurrence.daysOfWeek.includes(day)
        ? p.recurrence.daysOfWeek.filter((d) => d !== day)
        : [...p.recurrence.daysOfWeek, day];
      return { ...p, recurrence: { ...p.recurrence, daysOfWeek: days } };
    });
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim())
        newErrors.title = t("reminders.validation.titleRequired");
      if (!formData.reminderDate)
        newErrors.reminderDate = t("reminders.validation.dateRequired");
      if (!formData.reminderTime)
        newErrors.reminderTime = t("reminders.validation.timeRequired");
    }
    if (step === 3 && formData.notificationMethods.length === 0) {
      newErrors.notificationMethods = t(
        "reminders.validation.notificationMethodsRequired"
      );
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation Logic
  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep((p) => Math.min(p + 1, totalSteps));
    } else {
      showError(t("reminders.validation.fixErrors"));
    }
  };

  const handlePrevious = (e) => {
    if (e) e.preventDefault();
    setCurrentStep((p) => Math.max(p - 1, 1));
  };

  const handleStepClick = (step) => {
    if (step < currentStep || validateStep(currentStep)) setCurrentStep(step);
  };

  // Submit Logic
  const submitData = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        recurrence: formData.isRecurring
          ? {
              ...formData.recurrence,
              interval: parseInt(formData.recurrence.interval),
              endDate: formData.recurrence.endDate || undefined,
            }
          : undefined,
      };

      if (!payload.relatedEvent) delete payload.relatedEvent;
      if (!payload.relatedClient) delete payload.relatedClient;
      if (!payload.relatedTask) delete payload.relatedTask;
      if (!payload.relatedPayment) delete payload.relatedPayment;

      if (isEditMode) {
        await reminderService.update(reminderId, payload);
      } else {
        await reminderService.create(payload);
      }

      // ✅ Parent handles success UI
      if (onSuccess) onSuccess();
      else navigate("/reminders");
    } catch (error) {
      apiError(error, t("reminders.notifications.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate final step before submitting
    if (!validateStep(4))
      return showError(t("reminders.validation.fixAllErrors"));
    await submitData();
  };

  const handleQuickUpdate = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1);
      return showError(t("reminders.validation.fixErrors"));
    }
    await submitData();
  };

  // --- Render Components ---

  const renderStepIndicator = () => (
    <div className="mb-8 px-4">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />

        {[
          { icon: Bell, title: t("reminders.form.basicInfo") },
          { icon: Link2, title: t("reminders.form.relatedItems") },
          { icon: BellRing, title: t("reminders.form.notifications") },
          { icon: Repeat, title: t("reminders.form.recurrence") },
        ].map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          const StepIcon = step.icon;

          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => handleStepClick(stepNum)}
              disabled={!isCompleted && !isCurrent}
              className={`group flex flex-col items-center gap-2 bg-white dark:bg-[#1f2937] px-2 transition-all ${
                isCompleted || isCurrent ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isCompleted
                    ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : isCurrent
                      ? "bg-orange-500 text-white shadow-orange-200 dark:shadow-none"
                      : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <StepIcon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  isCurrent
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (isLoading)
    return (
      <div className="flex justify-center py-12 text-gray-500">
        <OrbitLoader /> 
        {t("common.loading")}
      </div>
    );

  return (
    <div className="bg-white dark:bg-[#1f2937] h-full flex flex-col p-4 sm:p-6 rounded-lg">
      {!isModalMode && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode
              ? t("reminders.form.editTitle")
              : t("reminders.form.createTitle")}
          </h1>
        </div>
      )}

      {renderStepIndicator()}

      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col max-w-4xl mx-auto w-full"
      >
        <div className="flex-1 mt-4 mb-8">
          {/* STEP 1: BASIC INFO */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <Input
                label={t("reminders.form.fields.title")}
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                error={errors.title}
                required
                className="w-full"
              />
              <Textarea
                label={t("reminders.form.fields.description")}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full"
              />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t("reminders.form.fields.date")}
                  type="date"
                  value={formData.reminderDate}
                  onChange={(e) => handleChange("reminderDate", e.target.value)}
                  error={errors.reminderDate}
                  required
                />
                <Input
                  label={t("reminders.form.fields.time")}
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
            <div className="space-y-6 animate-fadeIn">
              <Select
                label={t("reminders.form.fields.relatedEvent")}
                value={formData.relatedEvent}
                onChange={(e) => handleChange("relatedEvent", e.target.value)}
                options={[
                  { value: "", label: "None" },
                  ...events.map((e) => ({ value: e._id, label: e.title })),
                ]}
                className="w-full"
              />
              <Select
                label={t("reminders.form.fields.relatedClient")}
                value={formData.relatedClient}
                onChange={(e) => handleChange("relatedClient", e.target.value)}
                options={[
                  { value: "", label: "None" },
                  ...clients.map((c) => ({ value: c._id, label: c.name })),
                ]}
                className="w-full"
              />
              <Select
                label={t("reminders.form.fields.relatedTask")}
                value={formData.relatedTask}
                onChange={(e) => handleChange("relatedTask", e.target.value)}
                options={[
                  { value: "", label: "None" },
                  ...tasks.map((t) => ({ value: t._id, label: t.title })),
                ]}
                className="w-full"
              />
            </div>
          )}

          {/* STEP 3: NOTIFICATIONS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  {t("reminders.form.fields.notificationMethods")} *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.values(NOTIFICATION_METHODS).map((method) => (
                    <label
                      key={method}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${formData.notificationMethods.includes(method) ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800" : "bg-white dark:bg-gray-800 dark:border-gray-700"}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.notificationMethods.includes(method)}
                        onChange={() => handleNotificationToggle(method)}
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium capitalize">
                        {method.replace("_", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              {errors.notificationMethods && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.notificationMethods}
                </p>
              )}
            </div>
          )}

          {/* STEP 4: RECURRENCE */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRecurring}
                    onChange={(e) =>
                      handleChange("isRecurring", e.target.checked)
                    }
                    className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t("reminders.form.enableRecurrence")}
                  </span>
                </label>

                {formData.isRecurring && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label={t("reminders.form.fields.frequency")}
                        value={formData.recurrence.frequency}
                        onChange={(e) =>
                          handleChange("recurrence.frequency", e.target.value)
                        }
                        options={Object.values(RECURRENCE_FREQUENCIES).map(
                          (v) => ({
                            value: v,
                            label: t(`reminders.recurrence.${v}`),
                          })
                        )}
                      />
                      <Input
                        label={t("reminders.form.fields.interval")}
                        type="number"
                        min="1"
                        value={formData.recurrence.interval}
                        onChange={(e) =>
                          handleChange("recurrence.interval", e.target.value)
                        }
                      />
                    </div>

                    {formData.recurrence.frequency ===
                      RECURRENCE_FREQUENCIES.WEEKLY && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {t("reminders.form.fields.daysOfWeek")}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map((day) => (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => handleDayToggle(day.value)}
                              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                formData.recurrence.daysOfWeek.includes(
                                  day.value
                                )
                                  ? "bg-orange-500 text-white border-orange-500"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {t(
                                `reminders.weekdays.${day.label.toLowerCase()}`
                              ).substring(0, 3)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Textarea
                label={t("reminders.form.fields.notes")}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={4}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={
              currentStep === 1
                ? onCancel || (() => navigate("/reminders"))
                : handlePrevious
            }
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            {currentStep === 1 ? (
              t("reminders.form.buttons.cancel")
            ) : (
              <span className="flex items-center">
                <ChevronLeft className="w-4 h-4 mr-1" />{" "}
                {t("reminders.form.buttons.previous")}
              </span>
            )}
          </Button>

          <div className="flex items-center gap-3">
            {/* Quick Update */}
            {isEditMode && currentStep < totalSteps && (
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickUpdate}
                loading={isSaving}
                className="text-orange-600 hover:bg-orange-50"
              >
                <Save className="w-4 h-4 mr-2" />{" "}
                {t("reminders.form.buttons.updateNow")}
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="px-6"
              >
                <span className="flex items-center">
                  {t("reminders.form.buttons.next")}{" "}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={isSaving}
                className="px-6"
              >
                <span className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode
                    ? t("reminders.form.buttons.update")
                    : t("reminders.form.buttons.create")}
                </span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReminderForm;
