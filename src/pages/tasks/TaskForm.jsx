import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Save,
  ClipboardList,
  Calendar,
  CheckSquare,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  X,
} from "lucide-react";

// API & Services
import { taskService, teamService } from "../../api/index";

// Generic Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import DateInput from "../../components/common/DateInput";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";

// Context
import { useToast } from "../../hooks/useToast";

const TaskForm = ({ task: taskProp, onSuccess, onCancel }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError, showWarning } = useToast();

  const isEditMode = Boolean(id || taskProp?._id || taskProp?.id);
  const taskId = id || taskProp?._id || taskProp?.id;
  const isModalMode = Boolean(onSuccess && onCancel);

  // --- State ---
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    category: "other",
    dueDate: getTodayDate(),
    assignedTo: "",
    tags: [],
    subtasks: [],
    isArchived: false,
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");
  const [newSubtask, setNewSubtask] = useState({ title: "" });

  // --- Constants (Memoized for performance) ---
  const TASK_PRIORITIES = useMemo(
    () => [
      { value: "low", label: t("tasks.priority.low") },
      { value: "medium", label: t("tasks.priority.medium") },
      { value: "high", label: t("tasks.priority.high") },
      { value: "urgent", label: t("tasks.priority.urgent") },
    ],
    [t]
  );

  const TASK_STATUSES = useMemo(
    () => [
      { value: "pending", label: t("tasks.status.pending") },
      { value: "todo", label: t("tasks.status.todo") },
      { value: "in_progress", label: t("tasks.status.in_progress") },
      { value: "blocked", label: t("tasks.status.blocked") },
      { value: "completed", label: t("tasks.status.completed") },
      { value: "cancelled", label: t("tasks.status.cancelled") },
    ],
    [t]
  );

  const TASK_CATEGORIES = useMemo(
    () => [
      {
        value: "event_preparation",
        label: t("tasks.category.event_preparation"),
      },
      { value: "marketing", label: t("tasks.category.marketing") },
      { value: "maintenance", label: t("tasks.category.maintenance") },
      { value: "client_followup", label: t("tasks.category.client_followup") },
      {
        value: "partner_coordination",
        label: t("tasks.category.partner_coordination"),
      },
      { value: "administrative", label: t("tasks.category.administrative") },
      { value: "finance", label: t("tasks.category.finance") },
      { value: "setup", label: t("tasks.category.setup") },
      { value: "cleanup", label: t("tasks.category.cleanup") },
      { value: "other", label: t("tasks.category.other") },
    ],
    [t]
  );

  const steps = [
    { number: 1, title: t("tasks.form.steps.basicInfo"), icon: ClipboardList },
    { number: 2, title: t("tasks.form.steps.planning"), icon: Calendar },
    { number: 3, title: t("tasks.form.steps.checklist"), icon: CheckSquare },
  ];

  // --- Data Loading ---
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  const loadTaskData = useCallback((taskData) => {
    if (!taskData) return;
    setFormData({
      title: taskData.title || "",
      description: taskData.description || "",
      priority: taskData.priority || "medium",
      status: taskData.status || "todo",
      category: taskData.category || "other",
      dueDate: taskData.dueDate
        ? formatDateForInput(taskData.dueDate)
        : getTodayDate(),
      assignedTo: taskData.assignedTo?._id || taskData.assignedTo || "",
      tags: taskData.tags || [],
      subtasks: taskData.subtasks || [],
      isArchived: taskData.isArchived || false,
    });
  }, []);

  useEffect(() => {
    const initData = async () => {
      setFetchLoading(true);
      try {
        const teamRes = await teamService
          .getAll({ page: 1, limit: 100 })
          .catch(() => ({ data: [] }));
        setTeamMembers(teamRes?.team || teamRes?.data?.team || []);

        if (isEditMode && !taskProp) {
          const response = await taskService.getById(taskId);
          const taskData = response?.task || response?.data?.task || response;
          loadTaskData(taskData);
        } else if (taskProp) {
          loadTaskData(taskProp);
        }
      } catch (error) {
        showError(t("tasks.messages.error.load"));
        if (!isModalMode) navigate("/tasks");
      } finally {
        setFetchLoading(false);
      }
    };
    initData();
  }, [
    isEditMode,
    taskProp,
    taskId,
    loadTaskData,
    isModalMode,
    navigate,
    t,
    showError,
  ]);

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ✅ FIX: Prevent Default behavior clearly
  const handleAddTag = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // ✅ FIX: Prevent Default behavior clearly
  const handleAddSubtask = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (newSubtask.title.trim()) {
      setFormData((prev) => ({
        ...prev,
        subtasks: [
          ...prev.subtasks,
          { title: newSubtask.title.trim(), completed: false },
        ],
      }));
      setNewSubtask({ title: "" });
    }
  };

  const handleRemoveSubtask = (index) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  // --- Validation ---
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim())
        newErrors.title = t("tasks.form.validation.titleRequired");
      if (!formData.category)
        newErrors.category = t("tasks.form.validation.categoryRequired");
    }
    if (step === 2) {
      if (!formData.dueDate)
        newErrors.dueDate = t("tasks.form.validation.dueDateRequired");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllRequired = () => {
    const newErrors = {};
    if (!formData.title.trim())
      newErrors.title = t("tasks.form.validation.titleRequired");
    if (!formData.dueDate)
      newErrors.dueDate = t("tasks.form.validation.dueDateRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Navigation & Submission ---
  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      showWarning(t("tasks.form.validation.fixErrors"));
    }
  };

  const handlePrevious = (e) => {
    if (e) e.preventDefault();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step) => {
    if (step < currentStep || validateStep(currentStep)) setCurrentStep(step);
  };

  const submitData = async () => {
    try {
      setLoading(true);
      const submitPayload = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: new Date(formData.dueDate).toISOString(),
        assignedTo: formData.assignedTo || null, // Handle unassigned
      };

      if (isEditMode) {
        await taskService.update(taskId, submitPayload);
      } else {
        await taskService.create(submitPayload);
      }

      if (isModalMode && onSuccess) {
        onSuccess();
      } else {
        navigate("/tasks");
      }
    } catch (error) {
      showError(error.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      handleNext();
      return;
    }
    if (!validateAllRequired()) {
      showWarning(t("tasks.form.validation.fixAllErrors"));
      return;
    }
    await submitData();
  };

  const handleQuickUpdate = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1);
      showWarning(t("tasks.form.validation.fixErrors"));
      return;
    }
    await submitData();
  };

  // --- Render Steps ---
  const renderStepIndicator = () => (
    <div className="mb-8 px-4">
      <div className="flex items-center justify-between relative max-w-lg mx-auto">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const StepIcon = step.icon;
          return (
            <button
              key={step.number}
              type="button" // ✅ Critical: Prevents form submission on click
              onClick={() => handleStepClick(step.number)}
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
                className={`text-xs font-semibold whitespace-nowrap ${isCurrent ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
              >
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
          <div className="space-y-6 animate-fadeIn">
            <Input
              label={t("tasks.form.fields.title")}
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              placeholder={t("tasks.form.fields.titlePlaceholder")}
              className="w-full"
            />
            <Textarea
              label={t("tasks.form.fields.description")}
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder={t("tasks.form.fields.descriptionPlaceholder")}
              className="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label={t("tasks.form.fields.priority")}
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                options={TASK_PRIORITIES}
              />
              <Select
                label={t("tasks.form.fields.status")}
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={TASK_STATUSES}
              />
              <Select
                label={t("tasks.form.fields.category")}
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={TASK_CATEGORIES}
                error={errors.category}
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 gap-6">
              <DateInput
                label={t("tasks.form.fields.dueDate")}
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                error={errors.dueDate}
                required
                className="w-full"
              />
              <Select
                label={`${t("tasks.form.fields.assignedTo")} (${t("common.optional")})`}
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                options={[
                  { value: "", label: t("tasks.form.fields.unassigned") },
                  ...teamMembers.map((m) => ({ value: m._id, label: m.name })),
                ]}
                className="w-full"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* TAGS */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("tasks.form.fields.tags")}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Stop submitting form on Enter in tag input
                      handleAddTag(e);
                    }
                  }}
                  placeholder={t("tasks.form.fields.tagPlaceholder")}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-sm"
                />
                <Button
                  type="button" // ✅ Explicitly set type button to prevent submit
                  variant="outline"
                  onClick={handleAddTag}
                >
                  {t("tasks.form.buttons.add")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="pl-2 pr-1 py-1"
                  >
                    {tag}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* SUBTASKS */}
            <div className="border-t pt-4 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("tasks.form.fields.subtasks")}
              </label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newSubtask.title}
                  onChange={(e) => setNewSubtask({ title: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Stop submitting form on Enter in subtask input
                      handleAddSubtask(e);
                    }
                  }}
                  placeholder={t("tasks.form.fields.subtaskTitlePlaceholder")}
                  className="flex-1"
                />
                <Button
                  type="button" // ✅ Explicitly set type button to prevent submit
                  variant="outline"
                  icon={<Plus className="size-4" />}
                  onClick={handleAddSubtask}
                />
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {formData.subtasks.map((subtask, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 group"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {subtask.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(index)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {formData.subtasks.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-2 italic">
                    No subtasks added yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (fetchLoading && isEditMode) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <OrbitLoader />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1f2937] h-full flex flex-col p-4 sm:p-6 rounded-lg">
      {!isModalMode && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode
              ? t("tasks.form.editTitle")
              : t("tasks.form.createTitle")}
          </h1>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col max-w-4xl mx-auto w-full"
      >
        {renderStepIndicator()}

        <div className="flex-1 mt-4 mb-8">{renderStepContent()}</div>

        <div className="flex items-center justify-between pt-6 mt-auto">
          <Button
            type="button" // Prevent submit
            variant="outline"
            onClick={
              currentStep === 1
                ? isModalMode && onCancel
                  ? onCancel
                  : () => navigate("/tasks")
                : handlePrevious
            }
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            {currentStep === 1 ? (
              t("common.cancel")
            ) : (
              <span className="flex items-center">
                <ChevronLeft className="w-4 h-4 mr-1" />{" "}
                {t("tasks.form.buttons.previous")}
              </span>
            )}
          </Button>

          <div className="flex items-center gap-3">
            {isEditMode && currentStep < totalSteps && (
              <Button
                type="button"
                variant="outline"
                onClick={handleQuickUpdate}
                disabled={loading}
                className="text-orange-600 hover:bg-orange-50"
              >
                <Save className="w-4 h-4 mr-2" />{" "}
                {t("tasks.form.buttons.updateNow")}
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={loading}
                className="px-6"
              >
                <span className="flex items-center">
                  {t("tasks.form.buttons.next")}{" "}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="px-6"
              >
                <span className="flex items-center">
                  {isEditMode
                    ? t("tasks.form.buttons.update")
                    : t("tasks.form.buttons.create")}
                </span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
