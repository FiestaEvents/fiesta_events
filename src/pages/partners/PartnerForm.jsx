import React, { useState, useEffect } from "react";
import {
  Save,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Star,
  Briefcase,
  Tag,
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
} from "lucide-react";
import { useToast } from "../../hooks/useToast"; // Only used for showError now
import { useTranslation } from "react-i18next";
import OrbitLoader from "../../components/common/LoadingSpinner";
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
  const { showError } = useToast(); // Removed showSuccess

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

  // Options
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

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
      if (!formData.name.trim())
        newErrors.name = t("partnerForm.errors.required");
      if (!formData.email.trim())
        newErrors.email = t("partnerForm.errors.required");
      if (!formData.phone.trim())
        newErrors.phone = t("partnerForm.errors.required");
    }
    if (step === 2) {
      if (!formData.category)
        newErrors.category = t("partnerForm.errors.required");
      if (formData.priceType === "hourly" && !formData.hourlyRate)
        newErrors.hourlyRate = t("partnerForm.errors.required");
      if (formData.priceType === "fixed" && !formData.fixedRate)
        newErrors.fixedRate = t("partnerForm.errors.required");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation Logic
  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentStep < totalSteps) {
        handleNext();
      } else {
        handleSubmit(e);
      }
    }
  };

  // ✅ Submit - No Success Toast Here
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure critical steps are valid before saving
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);

    if (!step1Valid || !step2Valid) {
      if (!step1Valid) setCurrentStep(1);
      else if (!step2Valid) setCurrentStep(2);

      showError(
        t("partnerForm.errors.checkFields", "Please check required fields")
      );
      return;
    }

    try {
      setSaving(true);
      const submitData = {
        ...formData,
        priceType: formData.priceType,
        ...(formData.priceType === "hourly"
          ? {
              hourlyRate: parseFloat(formData.hourlyRate),
              fixedRate: undefined,
            }
          : {
              fixedRate: parseFloat(formData.fixedRate),
              hourlyRate: undefined,
            }),
        rating: parseFloat(formData.rating) || 0,
      };

      // Clean empty address
      if (!Object.values(submitData.address).some((v) => v))
        delete submitData.address;

      if (isEditMode) {
        await partnerService.update(partner._id, submitData);
      } else {
        await partnerService.create(submitData);
      }

      // ✅ Only trigger parent callback.
        // The parent (PartnersList) is responsible for the Success Toast.
      onSuccess?.();
    } catch (err) {
      // ❌ Keep error toast here, as the modal stays open if it fails
      showError(err.message || "Failed to save partner");
    } finally {
      setSaving(false);
    }
  };

  // --- Render Components ---

  const renderStepIndicator = () => (
    <div className="mb-8 px-4">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />

        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const StepIcon = step.icon;

          return (
            <button
              key={step.number}
              type="button"
              onClick={() =>
                (step.number < currentStep || validateStep(currentStep)) &&
                setCurrentStep(step.number)
              }
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <Input
              label={t("partnerForm.fields.name")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="e.g. John Doe or Acme Corp"
              icon={User}
              className="w-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("partnerForm.fields.email")}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="email@example.com"
                icon={Mail}
              />
              <Input
                label={t("partnerForm.fields.phone")}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 8),
                  }))
                }
                error={errors.phone}
                required
                placeholder="Phone number"
                icon={Phone}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("partnerForm.fields.company")}
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company Name (Optional)"
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
          <div className="space-y-6 animate-fadeIn">
            <Select
              label={t("partnerForm.fields.category")}
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              error={errors.category}
              required
              icon={Tag}
              className="w-full"
            />

            <Input
              label={t("partnerForm.fields.location")}
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Primary Service Area"
              icon={MapPin}
              className="w-full"
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("partnerForm.fields.pricingType")}
              </label>
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex gap-1">
                <button
                  type="button"
                  onClick={() => handlePriceTypeChange("hourly")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    formData.priceType === "hourly"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-orange-600 dark:text-orange-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  {t("partnerForm.options.hourly")}
                </button>
                <button
                  type="button"
                  onClick={() => handlePriceTypeChange("fixed")}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    formData.priceType === "fixed"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-orange-600 dark:text-orange-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  {t("partnerForm.options.fixed")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="0.00"
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
                  placeholder="0.00"
                  icon={DollarSign}
                />
              )}
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
                placeholder="0.0 - 5.0"
                icon={Star}
              />
            </div>

            <Textarea
              label={t("partnerForm.fields.specialties")}
              name="specialties"
              value={formData.specialties}
              onChange={handleChange}
              rows={3}
              placeholder="List specific skills or equipment..."
              maxLength={500}
              className="w-full"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <Input
              label={t("partnerForm.fields.street")}
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              placeholder="Street Address"
              className="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("partnerForm.fields.city")}
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="City"
              />
              <Input
                label={t("partnerForm.fields.state")}
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="State / Province"
              />
              <Input
                label={t("partnerForm.fields.zipCode")}
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                placeholder="Zip Code"
              />
              <Input
                label={t("partnerForm.fields.country")}
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 animate-fadeIn">
            <Textarea
              label={t("partnerForm.fields.notes")}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={8}
              placeholder="Add any internal notes about this partner here..."
              maxLength={1000}
              showCount
              className="w-full"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1f2937] h-full flex flex-col p-4 sm:p-6 rounded-lg">
      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="flex-1 flex flex-col max-w-4xl mx-auto w-full"
      >
        {renderStepIndicator()}

        <div className="flex-1 mt-4 mb-8">{renderStepContent()}</div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={
              currentStep === 1
                ? onCancel
                : () => setCurrentStep((prev) => prev - 1)
            }
            disabled={saving}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            {currentStep === 1 ? (
              t("partnerForm.actions.cancel")
            ) : (
              <span className="flex items-center">
                <ChevronLeft className="w-4 h-4 mr-1" />{" "}
                {t("partnerForm.actions.previous")}
              </span>
            )}
          </Button>

          <div className="flex items-center gap-3">
            {/* Quick Save in Edit Mode */}
            {isEditMode && currentStep < totalSteps && (
              <Button
                type="submit"
                variant="outline"
                disabled={saving}
                className="text-orange-600 hover:bg-orange-50"
              >
                <Save className="w-4 h-4 mr-2" />{" "}
                {t("partnerForm.actions.updateNow")}
              </Button>
            )}

            {currentStep < totalSteps ? (
              // Next: type="button" to prevent submit
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="px-6"
              >
                <span className="flex items-center">
                  {t("partnerForm.actions.next")}{" "}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </Button>
            ) : (
              // Submit: type="submit"
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                className="px-6"
              >
                <span className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode
                    ? t("partnerForm.actions.update")
                    : t("partnerForm.actions.create")}
                </span>
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PartnerForm;
