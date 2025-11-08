import React, { useState, useEffect } from "react";
import { partnerService } from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import {
  Save,
  X,
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
} from "lucide-react";
import { toast } from "react-hot-toast";

const PartnerForm = ({ partner, onSuccess, onCancel }) => {
  const isEditMode = !!partner;

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
    hourlyRate: "",
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
      setFormData({
        name: partner.name || "",
        email: partner.email || "",
        phone: partner.phone || "",
        category: partner.category || "",
        company: partner.company || "",
        status: partner.status || "active",
        location: partner.location || "",
        specialties: partner.specialties || "",
        hourlyRate: partner.hourlyRate || "",
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
    {
      number: 1,
      title: "Basic Info",
      icon: User,
      color: "orange",
    },
    {
      number: 2,
      title: "Professional",
      icon: Briefcase,
      color: "orange",
    },
    {
      number: 3,
      title: "Address",
      icon: MapPin,
      color: "orange",
    },
    {
      number: 4,
      title: "Notes",
      icon: FileText,
      color: "orange",
    },
  ];

  // Category options matching schema
  const categoryOptions = [
    { value: "", label: "Select Category" },
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
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
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

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Partner name is required";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Please provide a valid email";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      }
    }

    if (step === 2) {
      if (!formData.category) {
        newErrors.category = "Category is required";
      }
      if (
        formData.hourlyRate &&
        (isNaN(formData.hourlyRate) || formData.hourlyRate < 0)
      ) {
        newErrors.hourlyRate = "Hourly rate must be a positive number";
      }
      if (
        formData.rating &&
        (isNaN(formData.rating) || formData.rating < 0 || formData.rating > 5)
      ) {
        newErrors.rating = "Rating must be between 0 and 5";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate all required fields (for quick update button)
  const validateAllRequired = () => {
    const newErrors = {};

    // Step 1 validations
    if (!formData.name.trim()) {
      newErrors.name = "Partner name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please provide a valid email";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    // Step 2 validations
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (
      formData.hourlyRate &&
      (isNaN(formData.hourlyRate) || formData.hourlyRate < 0)
    ) {
      newErrors.hourlyRate = "Hourly rate must be a positive number";
    }
    if (
      formData.rating &&
      (isNaN(formData.rating) || formData.rating < 0 || formData.rating > 5)
    ) {
      newErrors.rating = "Rating must be between 0 and 5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fix the errors before proceeding");
    }
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleStepClick = (step, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Allow navigation to previous steps or if current step is valid
    if (step < currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
    }
  };

  // Prevent Enter key from submitting form except on last step
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && currentStep < totalSteps) {
      e.preventDefault();
      handleNext(e);
    }
  };

  // Quick update handler - validates all required fields and submits
  const handleQuickUpdate = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateAllRequired()) {
      toast.error("Please fix all required fields before updating");
      // Jump to first step with errors
      if (errors.name || errors.email || errors.phone) {
        setCurrentStep(1);
      } else if (errors.category || errors.hourlyRate || errors.rating) {
        setCurrentStep(2);
      }
      return;
    }

    await handleSubmit(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // For create mode on non-final steps, validate current step only
    if (!isEditMode && currentStep < totalSteps) {
      if (!validateStep(currentStep)) {
        toast.error("Please fix the errors in the form");
        return;
      }
      handleNext(e);
      return;
    }

    // For final step or edit mode, validate all
    if (!validateAllRequired()) {
      toast.error("Please fix all required fields");
      return;
    }

    try {
      setSaving(true);

      // Prepare data for submission
      const submitData = {
        ...formData,
        hourlyRate: formData.hourlyRate
          ? parseFloat(formData.hourlyRate)
          : undefined,
        rating: formData.rating ? parseFloat(formData.rating) : 0,
      };

      // Clean up empty address
      const hasAddress = Object.values(submitData.address).some((val) => val);
      if (!hasAddress) {
        delete submitData.address;
      }

      if (isEditMode) {
        await partnerService.update(partner._id, submitData);
        toast.success("Partner updated successfully");
      } else {
        await partnerService.create(submitData);
        toast.success("Partner created successfully");
      }

      onSuccess?.();
    } catch (err) {
      console.error("Error saving partner:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        `Failed to ${isEditMode ? "update" : "create"} partner`;
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const StepIcon = step.icon;

          return (
            <React.Fragment key={step.number}>
              <button
                type="button"
                onClick={(e) => handleStepClick(step.number, e)}
                className={`flex flex-col items-center gap-2 transition-all ${
                  isCompleted || isCurrent
                    ? "cursor-pointer"
                    : "cursor-not-allowed opacity-50"
                }`}
                disabled={!isCompleted && !isCurrent}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? "bg-orange-600 text-white"
                      : isCurrent
                        ? `bg-${step.color}-600 text-white ring-4 ring-${step.color}-200 dark:ring-${step.color}-900`
                        : "bg-orange-200 dark:bg-orange-700 text-orange-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCompleted || isCurrent
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Step {step.number} of {totalSteps}
                  </div>
                </div>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-200 dark:bg-gray-700 mx-2 mb-8">
                  <div
                    className={`h-full transition-all duration-300 ${
                      step.number < currentStep
                        ? "bg-orange-600"
                        : "bg-transparent"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <Input
              className="w-full"
              label="Partner Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="Enter partner name"
              icon={User}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                placeholder="partner@example.com"
                icon={Mail}
                className="w-full"
              />

              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
                placeholder="+1 (555) 000-0000"
                icon={Phone}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Company Name"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company name (optional)"
                icon={Building2}
                className="w-full"
              />

              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                className="w-full"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categoryOptions}
              error={errors.category}
              required
              icon={Tag}
              className="w-full"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                icon={MapPin}
                className="w-full"
              />

              <Input
                label="Hourly Rate"
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.hourlyRate}
                onChange={handleChange}
                error={errors.hourlyRate}
                placeholder="0.00"
                icon={DollarSign}
                className="w-full"
              />
            </div>

            <div className="relative">
              <Input
                label="Rating (0-5)"
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={handleChange}
                error={errors.rating}
                placeholder="0.0"
                icon={Star}
                className="w-full"
              />
              <div className="absolute top-9 right-3 flex items-center gap-1 pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(formData.rating)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <Textarea
              label="Specialties"
              name="specialties"
              value={formData.specialties}
              onChange={handleChange}
              rows={3}
              placeholder="List partner's specialties and expertise..."
              maxLength={500}
              className="w-full dark:bg-gray-800"
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Input
              label="Street Address"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              placeholder="123 Main Street"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="City"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                placeholder="New York"
              />

              <Input
                label="State/Province"
                name="address.state"
                value={formData.address.state}
                onChange={handleChange}
                placeholder="NY"
              />

              <Input
                label="ZIP/Postal Code"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
                placeholder="10001"
              />

              <Input
                label="Country"
                name="address.country"
                value={formData.address.country}
                onChange={handleChange}
                placeholder="United States"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Textarea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={6}
              placeholder="Add any additional notes about this partner..."
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
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar"
    >
      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      <div className="">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <div className="flex items-center sticky bottom-0 bg-white justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={saving}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          {/* Quick Update button - only show in edit mode and not on last step */}
          {isEditMode && currentStep < totalSteps && (
            <Button
              type="button"
              variant="outline"
              onClick={handleQuickUpdate}
              loading={saving}
              disabled={saving}
              //dark mode
              className="bg-orange-500 text-white dark:bg-orange-600 dark:hover:bg-orange-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Update Now
            </Button>
          )}

          {currentStep < totalSteps ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNext}
              disabled={saving}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isEditMode ? "Update Partner" : "Create Partner"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default PartnerForm;
