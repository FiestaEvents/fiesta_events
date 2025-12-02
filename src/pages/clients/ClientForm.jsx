import React, { useState, useEffect } from "react";
import {
  Save, User, Mail, Phone, MapPin, Building2, FileText, ChevronRight, ChevronLeft, Check, AlertCircle
} from "lucide-react";
import { useToast } from "../../hooks/useToast";
import { useTranslation } from "react-i18next";

// ✅ API & Services
import { clientService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";

const ClientForm = ({ client, onSuccess, onCancel }) => {
  const isEditMode = !!client;
  const { t } = useTranslation();
  const { showError } = useToast(); // Only using showError, parent handles success

  // Multi-step state (3 Steps: Basic -> Address -> Notes)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // State management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "active",
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

  // Load client data for edit mode
  useEffect(() => {
    if (isEditMode && client) {
      setFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        company: client.company || "",
        status: client.status || "active",
        address: {
          street: client.address?.street || "",
          city: client.address?.city || "",
          state: client.address?.state || "",
          zipCode: client.address?.zipCode || "",
          country: client.address?.country || "",
        },
        notes: client.notes || "",
      });
    }
  }, [isEditMode, client]);

  // Step configuration
  const steps = [
    { number: 1, title: t("clientForm.steps.basicInfo"), icon: User },
    { number: 2, title: t("clientForm.steps.address"), icon: MapPin },
    { number: 3, title: t("clientForm.steps.notes"), icon: FileText },
  ];

  const statusOptions = [
    { value: "active", label: t("clients.status.active") },
    { value: "inactive", label: t("clients.status.inactive") },
  ];

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle Phone Number Input (Numbers only)
    if (name === "phone") {
        const numbersOnly = value.replace(/\D/g, "").slice(0, 8);
        setFormData((prev) => ({ ...prev, phone: numbersOnly }));
        if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
        return;
    }

    // Handle Address Nested State
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear errors on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Validation
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = t("clientForm.errors.nameRequired");
      if (!formData.email.trim()) newErrors.email = t("clientForm.errors.emailRequired");
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = t("clientForm.errors.emailInvalid");
      
      if (!formData.phone.trim()) newErrors.phone = t("clientForm.errors.phoneRequired");
      else if (formData.phone.length < 8) newErrors.phone = t("clientForm.errors.phoneInvalid");
    }
    // Step 2 & 3 are optional, no validation needed
    
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
    if (e.key === 'Enter') {
      e.preventDefault(); 
      if (currentStep < totalSteps) {
        handleNext();
      } else {
        handleSubmit(e);
      }
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Critical validation only on Step 1
    if (!validateStep(1)) {
        setCurrentStep(1);
        showError(t("clientForm.errors.checkFields", "Please check required fields"));
        return;
    }

    try {
      setSaving(true);
      const submitData = {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      // Clean empty address
      if (!Object.values(submitData.address).some(v => v)) delete submitData.address;

      if (isEditMode) {
        await clientService.update(client._id, submitData);
      } else {
        await clientService.create(submitData);
      }
      
      // ✅ Parent handles success UI (Toast & Close)
      onSuccess?.(); 

    } catch (err) {
      showError(err.message || t("clientForm.errors.saving"));
    } finally {
      setSaving(false);
    }
  };

  // --- Render Components ---

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
              type="button"
              onClick={() => (step.number < currentStep || validateStep(currentStep)) && setCurrentStep(step.number)}
              disabled={!isCompleted && !isCurrent}
              className={`group flex flex-col items-center gap-2 bg-white dark:bg-[#1f2937] px-2 transition-all ${
                isCompleted || isCurrent ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                isCompleted 
                  ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400" 
                  : isCurrent 
                    ? "bg-orange-500 text-white shadow-orange-200 dark:shadow-none" 
                    : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
              }`}>
                {isCompleted ? <Check className="w-6 h-6" /> : <StepIcon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${
                isCurrent ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
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
          <div className="space-y-6 animate-fadeIn">

            
            <Input
              label={t("clientForm.fields.name")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder={t("clientForm.placeholders.name")}
              icon={User}
              className="w-full"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("clientForm.fields.email")}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder={t("clientForm.placeholders.email")}
                icon={Mail}
              />
              <Input
                label={t("clientForm.fields.phone")}
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
                placeholder={t("clientForm.placeholders.phone")}
                icon={Phone}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label={t("clientForm.fields.company")}
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder={t("clientForm.placeholders.company")}
                icon={Building2}
              />
              <Select
                label={t("clientForm.fields.status")}
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
             <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("clientForm.sections.address")}</h3>
            </div>
            
            <Input
              label={t("clientForm.fields.street")}
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              placeholder={t("clientForm.placeholders.street")}
              icon={MapPin}
              className="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label={t("clientForm.fields.city")} name="address.city" value={formData.address.city} onChange={handleChange} placeholder={t("clientForm.placeholders.city")} />
              <Input label={t("clientForm.fields.state")} name="address.state" value={formData.address.state} onChange={handleChange} placeholder={t("clientForm.placeholders.state")} />
              <Input label={t("clientForm.fields.zipCode")} name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} placeholder={t("clientForm.placeholders.zipCode")} />
              <Input label={t("clientForm.fields.country")} name="address.country" value={formData.address.country} onChange={handleChange} placeholder={t("clientForm.placeholders.country")} />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("clientForm.sections.additional")}</h3>
            </div>
            <Textarea
              label={t("clientForm.fields.notes")}
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={8}
              placeholder={t("clientForm.placeholders.notes")}
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

        <div className="flex-1 mt-4 mb-8">
          {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-6 mt-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={currentStep === 1 ? onCancel : () => setCurrentStep(prev => prev - 1)}
            disabled={saving}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
             {currentStep === 1 ? t("clientForm.buttons.cancel") : (
                <span className="flex items-center"><ChevronLeft className="w-4 h-4 mr-1" /> {t("clientForm.buttons.previous")}</span>
             )}
          </Button>

          <div className="flex items-center gap-3">
             {/* Quick Save in Edit Mode */}
            {isEditMode && currentStep < totalSteps && (
              <Button type="submit" variant="ghost" disabled={saving} className="text-orange-600 hover:bg-orange-50">
                <Save className="w-4 h-4 mr-2" /> {t("clientForm.buttons.update")}
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
                    <span className="flex items-center">{t("clientForm.buttons.next")} <ChevronRight className="w-4 h-4 ml-1" /></span>
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
                        {isEditMode ? t("clientForm.buttons.update") : t("clientForm.buttons.create")}
                    </span>
                </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;