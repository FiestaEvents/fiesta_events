import React, { useEffect, useState, useRef } from "react";
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Users,
  HelpCircle,
  X,
  Globe,
  ChevronDown,
  Camera,
  Car,
  Utensils,
  Music,
  Briefcase,
  MapPin,
  DollarSign, // Added for cost icon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import OrbitLoader from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext";
import { useLanguage } from "../../context/LanguageContext";

// ==========================================
// 1. CONSTANTS & CONFIG
// ==========================================

const SERVICE_CATEGORIES = [
  { id: "photography", label: "Photography", icon: Camera },
  { id: "driver", label: "Driver / Transport", icon: Car },
  { id: "catering", label: "Catering", icon: Utensils },
  { id: "music", label: "DJ / Band", icon: Music },
  { id: "decoration", label: "Decoration", icon: Briefcase },
  { id: "security", label: "Security", icon: Users },
  { id: "other", label: "Other Service", icon: Briefcase },
];

const validationUtils = {
  validatePhone: (phone) => {
    if (!phone?.trim()) return "Phone number is required";
    if (!/^\d+$/.test(phone)) return "Phone number must contain only numbers";
    if (phone.length !== 8) return "Phone number must be exactly 8 digits";
    return null;
  },
  validateEmail: (email) => {
    if (!email?.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please provide a valid email";
    if (email.length > 100) return "Email must be less than 100 characters";
    return null;
  },
  validatePositiveNumber: (value, fieldName) => {
    if (!value && value !== 0) return `${fieldName} is required`;
    if (!/^\d+$/.test(value.toString())) return `${fieldName} must be a number`;
    if (parseFloat(value) < 0) return `${fieldName} cannot be negative`;
    return null;
  },
  validateCapacity: (min, max) => {
    const minError = validationUtils.validatePositiveNumber(
      min,
      "Min capacity"
    );
    if (minError) return minError;
    const maxError = validationUtils.validatePositiveNumber(
      max,
      "Max capacity"
    );
    if (maxError) return maxError;
    if (parseInt(min) > parseInt(max))
      return "Min capacity cannot be greater than max capacity";
    return null;
  },
};

// ==========================================
// 2. UI COMPONENTS
// ==========================================

const AuthLanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "ar", name: "العربية", flag: "🇹🇳" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang =
    languages.find((l) => l.code === currentLanguage) || languages[0];
  const isRTL = currentLanguage === "ar";

  return (
    <div
      className={`absolute top-4 ${isRTL ? "left-4" : "right-4"} z-50`}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-orange-100 hover:border-orange-300 rounded-full shadow-sm text-gray-700 transition-all duration-200 hover:shadow-md"
      >
        <Globe className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-medium">
          {currentLang.code.toUpperCase()}
        </span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-orange-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isRTL ? "left-0" : "right-0"}`}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2.5 text-start text-sm flex items-center justify-between hover:bg-orange-50 transition-colors ${
                currentLanguage === lang.code
                  ? "text-orange-600 font-semibold bg-orange-50/50"
                  : "text-gray-600"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span> {lang.name}
              </span>
              {currentLanguage === lang.code && (
                <Check className="w-3 h-3 text-orange-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Input = ({
  label,
  error,
  iconRight: IconRight,
  onIconClick,
  fullWidth,
  type = "text",
  dir = "auto",
  className = "",
  ...props
}) => (
  <div className={fullWidth ? "w-full" : ""}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        type={type}
        dir={dir}
        className={`w-full px-4 py-1.5 text-base border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 hover:shadow-md ${
          error ? "border-red-500" : "border-gray-300"
        } ${className}`}
        {...props}
      />
      {IconRight && (
        <button
          type="button"
          onClick={onIconClick}
          className={`absolute ${document.dir === "rtl" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200`}
        >
          <IconRight size={20} />
        </button>
      )}
    </div>
    {error && <p className="text-sm text-red-600 mt-1 text-start">{error}</p>}
  </div>
);

const Button = ({
  children,
  loading,
  variant = "primary",
  className = "",
  ...props
}) => {
  const baseClass =
    "px-6 py-3 text-base rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 hover:shadow-lg";
  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
  };

  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? <OrbitLoader size="sm" /> : children}
    </button>
  );
};

const PasswordRequirementsTooltip = ({ password, isOpen, onClose, t }) => {
  if (!isOpen) return null;
  const requirement = {
    label: t("auth.register.requirements.length"),
    met: password.length >= 8,
  };

  return (
    <div className="absolute z-10 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mt-2">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-gray-900">
          {t("auth.register.requirements.title")}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center ${requirement.met ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}
          >
            {requirement.met && <Check size={10} />}
          </div>
          <span
            className={`text-sm ${requirement.met ? "text-green-600 font-medium" : "text-gray-600"}`}
          >
            {requirement.label}
          </span>
        </div>
      </div>
    </div>
  );
};

const ProgressSteps = ({ currentStep, t }) => {
  const steps = [
    t("auth.register.steps.business"),
    t("auth.register.steps.venue"),
    t("auth.register.steps.spaces"), // "Service Config"
    t("auth.register.steps.address"),
    t("auth.register.steps.review"),
  ];

  return (
    <div className="mb-4">
      {/* 
         Added pointer-events-none to disable clicking on steps 
         as per request 
      */}
      <div className="flex items-center justify-between mb-1 pointer-events-none">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  index < currentStep
                    ? "bg-green-500 text-white"
                    : index === currentStep
                      ? "bg-orange-500 text-white scale-110 shadow"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < currentStep ? <Check size={12} /> : index + 1}
              </div>
              <span
                className={`text-xs mt-1 font-medium text-center px-1 hidden sm:block ${index === currentStep ? "text-orange-500 font-semibold" : "text-gray-500"}`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded transition-all duration-500 ${index < currentStep ? "bg-green-500" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. REGISTRATION SLIDER STEPS
// ==========================================

// Step 1: Category
const BusinessTypeStep = ({ data, onChange, onNext, t }) => {
  const [view, setView] = useState("main");

  const selectCategory = (category, type) => {
    onChange({ category, businessType: type });
    setTimeout(onNext, 300);
  };

  if (view === "services") {
    return (
      <div className="space-y-6 text-center animate-in fade-in slide-in-from-right-10 duration-300">
        <h3 className="text-xl font-bold text-gray-900">
          Select your Profession
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id, "service")}
              className={`p-4 border-2 rounded-xl flex flex-col items-center justify-center transition-all hover:border-orange-500 hover:shadow-md ${
                data.category === cat.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              <cat.icon className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setView("main")}
          className="text-gray-500 hover:text-orange-600 underline text-sm"
        >
          {t("auth.register.actions.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex justify-center items-center flex-col gap-6 md:gap-10">
      <div className="w-full flex justify-center items-center flex-col text-center">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          {t("auth.register.businessType.title")}
        </h3>
        <p className="text-gray-600">
          {t("auth.register.businessType.subtitle")}
        </p>
      </div>
      <div className="flex flex-col md:flex-row justify-around items-center gap-6 md:gap-10 w-full max-w-2xl">
        <button
          onClick={() => selectCategory("venue", "venue")}
          className={`p-4 md:p-6 border-2 rounded-xl flex flex-col items-center justify-center transition-all duration-300 transform w-full max-w-xs ${
            data.category === "venue"
              ? "border-orange-500 bg-orange-50 scale-105 shadow-lg"
              : "border-gray-200 hover:border-orange-300 hover:shadow-md"
          }`}
        >
          <Building2 className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 text-orange-500" />
          <h4 className="font-bold text-base md:text-lg mb-2 text-center">
            {t("auth.register.businessType.venueOwner")}
          </h4>
          <p className="text-xs md:text-sm text-gray-600 text-center">
            {t("auth.register.businessType.venueDesc")}
          </p>
        </button>

        <button
          onClick={() => setView("services")}
          className="p-4 md:p-6 border-2 rounded-xl flex flex-col items-center justify-center transition-all duration-300 transform w-full max-w-xs border-gray-200 hover:border-orange-300 hover:shadow-md"
        >
          <Briefcase className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 text-orange-500" />
          <h4 className="font-bold text-base md:text-lg mb-2 text-center">
            {t("auth.register.businessType.serviceBusiness")}
          </h4>
          <p className="text-xs md:text-sm text-gray-600 text-center">
            {t("auth.register.businessType.serviceDesc")}
          </p>
        </button>
      </div>
    </div>
  );
};

// Step 2: Details
const BusinessDetailsStep = ({ data, onChange, errors, t }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          {data.category === "venue"
            ? t("auth.register.venueDetails.title")
            : "Business Details"}
        </h3>
        <p className="text-gray-600">
          {t("auth.register.venueDetails.subtitle")}
        </p>
      </div>
      <div className="space-y-4">
        <Input
          required
          label={
            data.category === "venue"
              ? t("auth.register.venueDetails.name")
              : "Business / Brand Name"
          }
          value={data.businessName}
          onChange={(e) => onChange({ businessName: e.target.value })}
          error={errors.businessName}
          placeholder={
            data.category === "venue"
              ? "e.g., Grand Palace"
              : "e.g., Ahmed Photography"
          }
          fullWidth
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
            {t("auth.register.venueDetails.desc")}
          </label>
          <textarea
            value={data.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
            rows={4}
            placeholder={t("auth.register.venueDetails.descPlaceholder")}
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1 text-start">
              {errors.description}
            </p>
          )}
        </div>
        <Input
          required
          label={t("auth.register.venueDetails.phone")}
          value={data.phone}
          onChange={(e) =>
            onChange({ phone: e.target.value.replace(/\D/g, "").slice(0, 8) })
          }
          error={errors.phone}
          placeholder="12345678"
          fullWidth
        />
      </div>
    </div>
  );
};

// Step 3 (Polymorphic): Spaces OR Service Config
const SpecificsStep = ({ data, onChange, errors, t }) => {
  const { toast } = useToast();

  // --- VENUE LOGIC (Spaces) ---
  if (data.category === "venue") {
    const spaces = data.spaces || [];

    const addSpace = () => {
      if (spaces.length >= 3) {
        toast(t("auth.register.spaces.maxReached"), "error");
        return;
      }
      onChange({
        spaces: [
          ...spaces,
          {
            id: Date.now(),
            name: "",
            minCapacity: "",
            maxCapacity: "",
            basePrice: "",
          },
        ],
      });
    };

    const updateSpace = (id, field, value) => {
      const val = ["minCapacity", "maxCapacity", "basePrice"].includes(field)
        ? value.replace(/\D/g, "")
        : value;
      onChange({
        spaces: spaces.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
      });
    };

    const removeSpace = (id) => {
      if (spaces.length === 1) {
        toast("At least one space is required", "error");
        return;
      }
      onChange({ spaces: spaces.filter((s) => s.id !== id) });
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {t("auth.register.spaces.title")}
          </h3>
          <p className="text-gray-600">
            {t("auth.register.spaces.subtitle", { max: 3 })}
          </p>
        </div>
        <div className="space-y-4">
          {spaces.map((space, index) => (
            <div
              key={space.id}
              className="p-4 border-2 border-gray-200 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">
                  {t("auth.register.spaces.spaceName")} {index + 1}
                </h4>
                {spaces.length > 1 && (
                  <button
                    onClick={() => removeSpace(space.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  required
                  label={t("auth.register.spaces.spaceName")}
                  value={space.name}
                  onChange={(e) =>
                    updateSpace(space.id, "name", e.target.value)
                  }
                  error={errors[`space-${space.id}-name`]}
                  placeholder="e.g., Main Hall"
                  fullWidth
                />
                <Input
                  required
                  label={t("auth.register.spaces.basePrice")}
                  type="number"
                  value={space.basePrice}
                  onChange={(e) =>
                    updateSpace(space.id, "basePrice", e.target.value)
                  }
                  error={errors[`space-${space.id}-basePrice`]}
                  placeholder="5000"
                  min="0"
                  fullWidth
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    required
                    label={t("auth.register.spaces.minCap")}
                    type="number"
                    value={space.minCapacity}
                    onChange={(e) =>
                      updateSpace(space.id, "minCapacity", e.target.value)
                    }
                    error={errors[`space-${space.id}-minCapacity`]}
                    placeholder="50"
                    min="0"
                    fullWidth
                  />
                  <Input
                    required
                    label={t("auth.register.spaces.maxCap")}
                    type="number"
                    value={space.maxCapacity}
                    onChange={(e) =>
                      updateSpace(space.id, "maxCapacity", e.target.value)
                    }
                    error={errors[`space-${space.id}-maxCapacity`]}
                    placeholder="500"
                    min="0"
                    fullWidth
                  />
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addSpace}
            disabled={spaces.length >= 3}
            className={`w-full py-3 border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-2 ${
              spaces.length >= 3
                ? "border-gray-200 text-gray-400 cursor-not-allowed"
                : "border-gray-300 text-gray-600 hover:border-orange-500 hover:text-orange-500"
            }`}
          >
            <Plus size={20} />
            {spaces.length >= 3
              ? t("auth.register.spaces.maxReached")
              : t("auth.register.spaces.add")}
          </button>
        </div>
      </div>
    );
  }

  // --- SERVICE PROVIDER LOGIC ---
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Service Configuration
        </h3>
        <p className="text-gray-600">How do you operate and charge?</p>
      </div>

      <div className="p-4 border-2 border-gray-200 rounded-xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
            Pricing Model
          </label>
          <div className="grid grid-cols-2 gap-4">
            {["fixed", "hourly"].map((type) => (
              <button
                key={type}
                onClick={() => onChange({ pricingModel: type })}
                className={`p-3 border rounded-lg capitalize transition-all ${
                  data.pricingModel === type
                    ? "border-orange-500 bg-orange-50 text-orange-700 font-bold"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {type} Rate
              </button>
            ))}
          </div>
        </div>

        {/* 
           REPLACED SERVICE RADIUS WITH COST INPUT 
           Moved service radius to AddressStep
        */}
        <Input
          type="number"
          label={`Starting Cost (${data.pricingModel === "hourly" ? "/hr" : "Fixed"})`}
          value={data.basePrice}
          onChange={(e) => onChange({ basePrice: e.target.value })}
          placeholder="e.g. 500"
          error={errors.basePrice}
          iconRight={DollarSign}
          fullWidth
        />

        <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-700 items-start">
          <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>
            This helps clients estimate the cost of your services. You can
            create complex packages later.
          </p>
        </div>
      </div>
    </div>
  );
};

// Step 4: Address
const AddressStep = ({ data, onChange, errors, t }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
        {t("auth.register.address.title")}
      </h3>
      <p className="text-gray-600">{t("auth.register.address.subtitle")}</p>
    </div>
    <div className="space-y-4">
      <Input
        required
        label={t("auth.register.address.fullAddress")}
        value={data.address?.street || ""}
        onChange={(e) =>
          onChange({ address: { ...data.address, street: e.target.value } })
        }
        error={errors.street}
        placeholder="123 Main Street"
        fullWidth
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          required
          label={t("auth.register.address.city")}
          value={data.address?.city || ""}
          onChange={(e) =>
            onChange({ address: { ...data.address, city: e.target.value } })
          }
          error={errors.city}
          placeholder="Tunis"
          fullWidth
        />
        <Input
          label={t("auth.register.address.state")}
          value={data.address?.state || ""}
          onChange={(e) =>
            onChange({ address: { ...data.address, state: e.target.value } })
          }
          error={errors.state}
          placeholder="Tunis"
          fullWidth
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label={t("auth.register.address.zip")}
          value={data.address?.zipCode || ""}
          onChange={(e) =>
            onChange({ address: { ...data.address, zipCode: e.target.value } })
          }
          error={errors.zipCode}
          placeholder="1000"
          fullWidth
        />
        <Input
          label={t("auth.register.address.country")}
          value={data.address?.country || "Tunisia"}
          onChange={(e) =>
            onChange({ address: { ...data.address, country: e.target.value } })
          }
          error={errors.country}
          placeholder="Tunisia"
          fullWidth
        />
      </div>

      {/* 
         MOVED SERVICE RADIUS HERE 
         Only visible for non-venue categories
      */}
      {data.category !== "venue" && (
        <div className="pt-2 border-t mt-2">
          <Input
            type="number"
            label="Service Radius (KM)"
            value={data.serviceRadius}
            onChange={(e) => onChange({ serviceRadius: e.target.value })}
            placeholder="e.g. 50"
            error={errors.serviceRadius}
            iconRight={MapPin}
            fullWidth
          />
          <p className="text-xs text-gray-500 mt-1">
            How far from this address are you willing to travel?
          </p>
        </div>
      )}
    </div>
  </div>
);

// Step 5: Review
const ReviewStep = ({ data, t }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
        {t("auth.register.review.title")}
      </h3>
      <p className="text-gray-600">{t("auth.register.review.subtitle")}</p>
    </div>
    <div className="space-y-4">
      <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-3">
          {t("auth.register.review.accountInfo")}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">
              {t("auth.register.fullName")}:
            </span>
            <span className="font-medium">{data.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t("auth.register.email")}:</span>
            <span className="font-medium">{data.email}</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-3">
          {t("auth.register.review.venueInfo")}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Business Name:</span>
            <span className="font-medium">{data.businessName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium capitalize">{data.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{data.phone}</span>
          </div>
        </div>
      </div>

      {data.category === "venue" && data.spaces && (
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-3">
            {t("auth.register.spaces.title")} ({data.spaces.length})
          </h4>
          <div className="space-y-3">
            {data.spaces.map((space) => (
              <div key={space.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{space.name}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                  <div>
                    Cap: {space.minCapacity}-{space.maxCapacity}
                  </div>
                  <div>Price: {space.basePrice} TND</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show Service Config for Non-Venues */}
      {data.category !== "venue" && (
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-3">Configuration</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Pricing Model:</span>
              <span className="font-medium capitalize">
                {data.pricingModel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Base Cost:</span>
              <span className="font-medium">{data.basePrice} TND</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Radius:</span>
              <span className="font-medium">{data.serviceRadius} KM</span>
            </div>
          </div>
        </div>
      )}

      {data.address && (
        <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-3">
            {t("auth.register.address.title")}
          </h4>
          <div className="text-sm">
            <p className="font-medium">{data.address.street}</p>
            <p className="text-gray-600">
              {data.address.city}, {data.address.state} {data.address.zipCode}
            </p>
            <p className="text-gray-600">{data.address.country}</p>
          </div>
        </div>
      )}
    </div>
  </div>
);

// ==========================================
// 4. MAIN SLIDER
// ==========================================

const RegistrationSlider = ({ isOpen, onClose, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    businessType: "venue",
    category: "venue",
    spaces: [
      {
        id: Date.now(),
        name: "",
        minCapacity: "",
        maxCapacity: "",
        basePrice: "",
      },
    ],
    serviceRadius: 50,
    basePrice: "", // Used for service providers cost rating
    pricingModel: "fixed",
    address: { country: "Tunisia" },
    ...initialData,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...initialData }));
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      setIsSliderOpen(false);
      setShouldRender(true);
      setTimeout(() => setIsSliderOpen(true), 50);
    } else {
      setIsSliderOpen(false);
      setTimeout(() => setShouldRender(false), 500);
    }
  }, [isOpen]);

  const updateData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    setErrors({});
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1) {
      // Details
      if (!formData.businessName?.trim())
        newErrors.businessName = "Name is required";
      const phErr = validationUtils.validatePhone(formData.phone);
      if (phErr) newErrors.phone = phErr;
    }
    if (currentStep === 2) {
      // Specifics
      if (formData.category === "venue") {
        formData.spaces.forEach((s) => {
          if (!s.name) newErrors[`space-${s.id}-name`] = "Required";
          if (!s.minCapacity)
            newErrors[`space-${s.id}-minCapacity`] = "Required";
          if (!s.maxCapacity)
            newErrors[`space-${s.id}-maxCapacity`] = "Required";
          if (!s.basePrice) newErrors[`space-${s.id}-basePrice`] = "Required";
        });
      } else {
        // Service Validation: Check Base Price
        if (!formData.basePrice) newErrors.basePrice = "Required";
      }
    }
    if (currentStep === 3) {
      // Address
      if (!formData.address?.street) newErrors.street = "Required";
      if (!formData.address?.city) newErrors.city = "Required";
      // Service Validation: Check Radius if not venue
      if (formData.category !== "venue" && !formData.serviceRadius) {
        newErrors.serviceRadius = "Required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => Math.min(prev + 1, 4));
        setIsAnimating(false);
      }, 300);
    } else {
      toast("Please fix errors", "error");
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      setIsSliderOpen(false);
      setTimeout(onClose, 300);
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
      setIsAnimating(false);
    }, 300);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Backend expects 'spaces' only if venue
      await register(formData);
      navigate("/dashboard");
      toast(t("auth.login.success"), "success");
    } catch (err) {
      toast(err.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!shouldRender) return null;

  const steps = [
    <BusinessTypeStep
      data={formData}
      onChange={updateData}
      onNext={handleNext}
      t={t}
    />,
    <BusinessDetailsStep
      data={formData}
      onChange={updateData}
      errors={errors}
      t={t}
    />,
    <SpecificsStep
      data={formData}
      onChange={updateData}
      errors={errors}
      t={t}
    />,
    <AddressStep data={formData} onChange={updateData} errors={errors} t={t} />,
    <ReviewStep data={formData} t={t} />,
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
      style={{
        backgroundColor: isSliderOpen
          ? "rgba(0, 0, 0, 0.5)"
          : "rgba(0, 0, 0, 0)",
        backdropFilter: isSliderOpen ? "blur(4px)" : "blur(0px)",
        pointerEvents: isSliderOpen ? "auto" : "none",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className="w-full h-full bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{
          transform: isSliderOpen ? "translateY(0)" : "translateY(100%)",
          opacity: isSliderOpen ? "1" : "0",
          transition:
            "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s",
        }}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-gray-900">
            {t("auth.register.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-4 pt-3">
          <ProgressSteps currentStep={currentStep} t={t} />
        </div>

        <div className="overflow-y-auto hide-scrollbar flex flex-1 justify-center items-start">
          <div
            className="transition-all duration-300 w-full max-w-2xl px-4 py-4"
            style={{
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? "translateX(20px)" : "translateX(0)",
            }}
          >
            <div className="bg-white rounded-lg">{steps[currentStep]}</div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between gap-3">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="flex items-center gap-2 px-4 py-2 text-sm"
            >
              {isRTL ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}{" "}
              {t("auth.register.actions.back")}
            </Button>
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                variant="primary"
                className="flex items-center gap-2 px-4 py-2 text-sm"
              >
                {t("auth.register.actions.continue")}{" "}
                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                loading={loading}
                variant="primary"
                className="px-4 py-2 text-sm"
              >
                {t("auth.register.actions.complete")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN REGISTER FORM
// ==========================================

const Register = () => {
  const { verifyEmail } = useAuth();
  const [showSlider, setShowSlider] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    if (name === "password")
      setPasswordStrength(calculatePasswordStrength(value));
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 2;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 0.5;
    if (/[A-Z]/.test(password)) strength += 0.5;
    if (/[0-9]/.test(password)) strength += 0.5;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 0.5;
    return Math.min(5, strength);
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 2) return "bg-red-500";
    if (strength < 3.5) return "bg-yellow-500";
    return "bg-green-500";
  };

  const handleInitialSubmit = async () => {
    const newErrors = {};
    if (!formData.name?.trim())
      newErrors.name = t("auth.register.errors.nameRequired");
    if (!formData.email)
      newErrors.email = t("auth.register.errors.emailRequired");
    if (!formData.password || formData.password.length < 8)
      newErrors.password = "Min 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t("auth.register.errors.confirmMatch");

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast("Please fix all errors", "error");
      return;
    }

    setLoading(true);
    try {
      await verifyEmail(formData.email);
      setShowSlider(true);
    } catch (error) {
      setErrors({
        email: error.response?.data?.message || "Verification failed",
      });
      toast("Email verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <AuthLanguageSwitcher />

      <div className="flex-1 flex items-center justify-center p-0 md:p-4 relative z-10">
        <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
            style={{ animationDelay: "700ms" }}
          ></div>
        </div>

        <div className="bg-white w-full h-full md:rounded-2xl md:shadow-lg md:max-w-md md:w-full md:h-auto flex flex-col justify-center relative z-20">
          <div className="px-6 py-8 md:px-8 md:py-4 space-y-4">
            <div className="flex justify-center">
              <div className="w-full flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                <img
                  src="fiesta logo-01.png"
                  alt="Fiesta Logo"
                  className="object-cover w-[40%]"
                />
              </div>
            </div>

            <div className="text-start">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {t("auth.register.title")}
              </h2>
              <p className="text-sm text-gray-500">
                {t("auth.register.subtitle")}
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label={t("auth.register.fullName")}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                error={errors.name}
                fullWidth
              />
              <Input
                label={t("auth.register.email")}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                error={errors.email}
                fullWidth
                dir="ltr"
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("auth.register.password")}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPasswordTooltip(!showPasswordTooltip)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <HelpCircle size={16} />
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    error={errors.password}
                    className={`w-full ${isRTL ? "pl-10" : "pr-10"}`}
                    fullWidth
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? "left-3" : "right-3"} top-[10px] text-gray-400 hover:text-gray-600 transition-colors`}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                <PasswordRequirementsTooltip
                  password={formData.password}
                  isOpen={showPasswordTooltip}
                  onClose={() => setShowPasswordTooltip(false)}
                  t={t}
                />
              </div>

              <div className="relative">
                <Input
                  label={t("auth.register.confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  className={`w-full ${isRTL ? "pl-10" : "pr-10"}`}
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute ${isRTL ? "left-3" : "right-3"} top-[34px] text-gray-400 hover:text-gray-600 transition-colors`}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              <Button
                onClick={handleInitialSubmit}
                loading={loading}
                variant="primary"
                className="w-full py-3"
              >
                {t("auth.register.actions.continue")}
              </Button>
            </div>

            <div className="text-sm mt-6 text-center">
              {t("auth.register.haveAccount")}{" "}
              <a
                href="/login"
                className="text-orange-500 font-medium hover:underline"
              >
                {t("auth.register.signIn")}
              </a>
            </div>
          </div>
        </div>
      </div>

      <RegistrationSlider
        isOpen={showSlider}
        onClose={() => setShowSlider(false)}
        initialData={formData}
      />
    </div>
  );
};

export default Register;
