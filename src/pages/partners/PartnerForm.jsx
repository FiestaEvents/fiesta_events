import React, { useState, useEffect } from "react";
import {
  Save, X, Building2, User, Mail, Phone, MapPin, DollarSign, Star, Briefcase, Tag, FileText, ChevronRight, ChevronLeft, Check, Clock
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";

// ✅ API & Services
import { partnerService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";

const PartnerForm = ({ partner, onSuccess, onCancel }) => {
  const isEditMode = !!partner;
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  // Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // State management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    company: "",
    status: "active",
    location: "",
    specialties: "",
    priceType: "hourly",
    hourlyRate: "",
    fixedRate: "",
    rating: "0",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Load partner data for edit mode
  useEffect(() => {
    if (isEditMode && partner) {
      const hasHourlyRate = partner.hourlyRate && partner.hourlyRate > 0;
      const hasFixedRate = partner.fixedRate && partner.fixedRate > 0;

      let priceType = "hourly";
      if (hasFixedRate && !hasHourlyRate) {
        priceType = "fixed";
      } else if (hasHourlyRate && !hasFixedRate) {
        priceType = "hourly";
      }

      setFormData({
        name: partner.name || "",
        email: partner.email || "",
        phone: partner.phone || "",
        category: partner.category || "",
        company: partner.company || "",
        status: partner.status || "active",
        location: partner.location || "",
        specialties: partner.specialties || "",
        priceType: priceType,
        hourlyRate: partner.hourlyRate || "",
        fixedRate: partner.fixedRate || "",
        rating: partner.rating || "0",
        address: {
          street: partner.address?.street || "",
          city: partner.address?.city || "",
          state: partner.address?.state || "",
          zipCode: partner.address?.zipCode || "",
          country: partner.address?.country || "",
        },
        notes: partner.notes || "",
      });
    }
  }, [isEditMode, partner]);

  // Step configuration
  const steps = [
    { number: 1, title: t("partnerForm.steps.basicInfo"), icon: User },
    { number: 2, title: t("partnerForm.steps.professional"), icon: Briefcase },
    { number: 3, title: t("partnerForm.steps.address"), icon: MapPin },
    { number: 4, title: t("partnerForm.steps.notes"), icon: FileText },
  ];

  // Category options
  const categoryOptions = [
    { value: "", label: t("partnerForm.options.selectCategory") },
    { value: "driver", label: "Driver" },
    { value: "bakery", label: "Bakery" },
    { value: "catering", label: "Catering" },
    { value: "decoration", label: "Decoration" },
    { value: "photography", label: "Photography" },
    { value: "music", label: "Music" },
    { value: "security", label: "Security" },
    { value: "cleaning", label: "Cleaning" },
    { value: "audio_visual", label: "Audio/Visual" },
    { value: "floral", label: "Floral" },
    { value: "entertainment", label: "Entertainment" },
    { value: "hairstyling", label: "Hair Styling" },
    { value: "other", label: "Other" },
  ];

  const statusOptions = [
    { value: "active", label: t("partners.actions.filters.active") },
    { value: "inactive", label: t("partners.actions.filters.inactive") },
  ];

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePriceTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      priceType: value,
      ...(value === "hourly" ? { fixedRate: "" } : { hourlyRate: "" }),
    }));
    setErrors((prev) => ({ ...prev, hourlyRate: "", fixedRate: "" }));
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = t("partnerForm.errors.required", { field: t("partnerForm.fields.name") });
      if (!formData.email.trim()) newErrors.email = t("partnerForm.errors.required", { field: t("partnerForm.fields.email") });
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = t("partnerForm.errors.invalidEmail");
      if (!formData.phone.trim()) newErrors.phone = t("partnerForm.errors.required", { field: t("partnerForm.fields.phone") });
    }

    if (step === 2) {
      if (!formData.category) newErrors.category = t("partnerForm.errors.required", { field: t("partnerForm.fields.category") });

      if (formData.priceType === "hourly") {
        if (!formData.hourlyRate) newErrors.hourlyRate = t("partnerForm.errors.required", { field: t("partnerForm.fields.hourlyRate") });
      } else {
        if (!formData.fixedRate) newErrors.fixedRate = t("partnerForm.errors.required", { field: t("partnerForm.fields.fixedAmount") });
      }

      if (formData.rating && (isNaN(formData.rating) || formData.rating < 0 || formData.rating > 5)) {
        newErrors.rating = t("partnerForm.errors.invalidRating");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllRequired = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = t("partnerForm.errors.required", { field: t("partnerForm.fields.name") });
    if (!formData.email.trim()) newErrors.email = t("partnerForm.errors.required", { field: t("partnerForm.fields.email") });
    if (!formData.phone.trim()) newErrors.phone = t("partnerForm.errors.required", { field: t("partnerForm.fields.phone") });
    if (!formData.category) newErrors.category = t("partnerForm.errors.required", { field: t("partnerForm.fields.category") });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step) => {
    if (step < currentStep || validateStep(currentStep)) setCurrentStep(step);
  };

  const handleQuickUpdate = async (e) => {
    e.preventDefault();
    if (!validateAllRequired()) {
      showError("Please fix validation errors.");
      return;
    }
    await handleSubmit(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditMode && currentStep < totalSteps) {
      if (!validateStep(currentStep)) return;
      handleNext(e);
      return;
    }

    if (!validateAllRequired()) return;

    try {
      setSaving(true);
      const submitData = {
        ...formData,
        priceType: formData.priceType,
        ...(formData.priceType === "hourly"
          ? { hourlyRate: parseFloat(formData.hourlyRate), fixedRate: undefined }
          : { fixedRate: parseFloat(formData.fixedRate), hourlyRate: undefined }),
        rating: parseFloat(formData.rating) || 0,
      };

      // Remove empty address
      if (!Object.values(submitData.address).some(v => v)) delete submitData.address;

      if (isEditMode) {
        await partnerService.update(partner._id, submitData);
        showSuccess(t("partners.notifications.updated"));
      } else {
        await partnerService.create(submitData);
        showSuccess(t("partners.notifications.added"));
      }
      onSuccess?.();
    } catch (err) {
      showError(err.message || "Failed to save partner");
    } finally {
      setSaving(false);
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
              {t("partnerForm.steps.basicInfo")}
            </h3>
            <Input
              label={t("partnerForm.fields.name")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder={t("partnerForm.placeholders.name")}
              icon={User}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("partnerForm.fields.email")}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder={t("partnerForm.placeholders.email")}
                icon={Mail}
              />
              <Input
                label={t("partnerForm.fields.phone")}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(p => ({...p, phone: e.target.value.replace(/\D/g, '').slice(0, 8)}))}
                error={errors.phone}
                required
                placeholder={t("partnerForm.placeholders.phone")}
                icon={Phone}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("partnerForm.fields.company")}
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder={t("partnerForm.placeholders.company")}
                icon={Building2}
              />
              <Select
                label={t("partnerForm.fields.status")}
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
              {t("partnerForm.steps.professional")}
            </h3>
            <Select
              label={t("partnerForm.fields.category")}
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              error={errors.category}
              required
              icon={Tag}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("partnerForm.fields.location")}
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={t("partnerForm.placeholders.location")}
                icon={MapPin}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("partnerForm.fields.pricingType")} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handlePriceTypeChange("hourly")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-2 rounded-lg transition-all ${
                      formData.priceType === "hourly"
                        ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:border-orange-400 dark:text-orange-300"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("partnerForm.options.hourly")}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handlePriceTypeChange("fixed")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 border-2 rounded-lg transition-all ${
                      formData.priceType === "fixed"
                        ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:border-orange-400 dark:text-orange-300"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">{t("partnerForm.options.fixed")}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {formData.priceType === "hourly" ? (
                <Input
                  label={t("partnerForm.fields.hourlyRate")}
                  name="hourlyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  error={errors.hourlyRate}
                  required
                  placeholder={t("partnerForm.placeholders.hourlyRate")}
                  icon={Clock}
                />
              ) : (
                <Input
                  label={t("partnerForm.fields.fixedAmount")}
                  name="fixedRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.fixedRate}
                  onChange={handleChange}
                  error={errors.fixedRate}
                  required
                  placeholder={t("partnerForm.placeholders.fixedAmount")}
                  icon={DollarSign}
                />
              )}
            </div>

            <Input
              label={t("partnerForm.fields.rating")}
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={formData.rating}
              onChange={handleChange}
              error={errors.rating}
              placeholder={t("partnerForm.placeholders.rating")}
              icon={Star}
            />

            <Textarea
              label={t("partnerForm.fields.specialties")}
              name="specialties"
              value={formData.specialties}
              onChange={handleChange}
              rows={3}
              placeholder={t("partnerForm.placeholders.specialties")}
              maxLength={500}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
              {t("partnerForm.steps.address")}
            </h3>
            <Input
              label={t("partnerForm.fields.street")}
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              placeholder={t("partnerForm.placeholders.street")}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label={t("partnerForm.fields.city")} name="address.city" value={formData.address.city} onChange={handleChange} placeholder={t("partnerForm.placeholders.city")} />
              <Input label={t("partnerForm.fields.state")} name="address.state" value={formData.address.state} onChange={handleChange} placeholder={t("partnerForm.placeholders.state")} />
              <Input label={t("partnerForm.fields.zipCode")} name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} placeholder={t("partnerForm.placeholders.zipCode")} />
              <Input label={t("partnerForm.fields.country")} name="address.country" value={formData.address.country} onChange={handleChange} placeholder={t("partnerForm.placeholders.country")} />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
              {t("partnerForm.steps.notes")}
            </h3>
            <Textarea
              label={t("partnerForm.fields.notes")}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={6}
              placeholder={t("partnerForm.placeholders.notes")}
              maxLength={1000}
              showCount
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1f2937] h-full flex flex-col">
      <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && currentStep < totalSteps && handleNext(e)} className="flex-1 flex flex-col p-6 pt-2">
        
        {renderStepIndicator()}

        <div className="flex-1 mt-2 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handlePrevious} disabled={saving}>
                <ChevronLeft className="w-4 h-4 mr-1" /> {t("partnerForm.actions.previous")}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={saving}>
              {t("partnerForm.actions.cancel")}
            </Button>

            {isEditMode && currentStep < totalSteps && (
              <Button type="button" variant="secondary" onClick={handleQuickUpdate} disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> {t("partnerForm.actions.updateNow")}
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button type="button" variant="primary" onClick={handleNext} disabled={saving}>
                {t("partnerForm.actions.next")} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button type="submit" variant="primary" loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? t("partnerForm.actions.update") : t("partnerForm.actions.create")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PartnerForm;