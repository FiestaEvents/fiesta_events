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
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";

// Input Component
const Input = ({
  label,
  error,
  iconRight: IconRight,
  onIconClick,
  fullWidth,
  ...props
}) => (
  <div className={fullWidth ? "w-full" : ""}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        className={`w-full px-4 py-1.5 text-base border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 hover:shadow-md ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      {IconRight && (
        <button
          type="button"
          onClick={onIconClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <IconRight size={20} />
        </button>
      )}
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

// Button Component
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
      {loading ? (
        <span className="flex items-center gap-2">Loading...</span>
      ) : (
        children
      )}
    </button>
  );
};

// Progress Steps
const ProgressSteps = ({ currentStep }) => {
  const steps = [
    "Business Type",
    "Venue Details",
    "Spaces",
    "Address",
    "Review",
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
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
                className={`text-xs mt-1 font-medium text-center px-1 hidden sm:block ${
                  index === currentStep
                    ? "text-orange-500 font-semibold"
                    : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 rounded transition-all duration-500 ${
                  index < currentStep ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Step 1: Business Type
const BusinessTypeStep = ({ data, onChange, onNext }) => (
  <div className="space-y-6 flex justify-center items-center flex-col gap-6 md:gap-10">
    <div className="w-full flex justify-center items-center flex-col">
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">
        Choose Your Business Type
      </h3>
      <p className="text-gray-600 text-center">Select how you'll use Fiesta</p>
    </div>
    <div className="flex flex-col md:flex-row justify-around items-center gap-6 md:gap-10 w-full max-w-2xl">
      <button
        onClick={() => {
          onChange({ businessType: "venue" });
          setTimeout(onNext, 300);
        }}
        className={`p-4 md:p-6 border-2 rounded-xl flex flex-col items-center justify-center transition-all duration-300 transform w-full max-w-xs ${
          data.businessType === "venue"
            ? "border-orange-500 bg-orange-50 scale-105 shadow-lg"
            : "border-gray-200 hover:border-orange-300 hover:shadow-md"
        }`}
      >
        <Building2 className="w-10 h-10 md:w-12 md:h-12 mb-3 md:mb-4 text-orange-500" />
        <h4 className="font-bold text-base md:text-lg mb-2 text-center">
          Venue Owner
        </h4>
        <p className="text-xs md:text-sm text-gray-600 text-center">
          Manage your event venue, bookings, and staff
        </p>
      </button>
      <div className="relative p-4 md:p-6 border-2 flex flex-col items-center justify-center border-gray-200 rounded-xl opacity-50 cursor-not-allowed w-full max-w-xs">
        <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          Coming Soon
        </div>
        <Users className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mb-3 md:mb-4" />
        <h4 className="font-bold text-base md:text-lg mb-2 text-center">
          Service Business
        </h4>
        <p className="text-xs md:text-sm text-gray-600 text-center">
          Offer catering, photography, or other event services
        </p>
      </div>
    </div>
  </div>
);

// Step 2: Venue Details
const VenueDetailsStep = ({ data, onChange, errors }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
        Tell Us About Your Venue
      </h3>
      <p className="text-gray-600">
        Provide basic information about your venue
      </p>
    </div>
    <div className="space-y-4">
      <Input
        required="true"
        label="Venue Name"
        value={data.venueName}
        onChange={(e) => onChange({ venueName: e.target.value })}
        error={errors.venueName}
        placeholder="e.g., Grand Palace Events"
        fullWidth
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={data.description || ""}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
          rows={4}
          placeholder="Describe your venue..."
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description}</p>
        )}
      </div>
      <Input
        label="Phone Number"
        value={data.phone}
        onChange={(e) => onChange({ phone: e.target.value })}
        error={errors.phone}
        placeholder="+216 XX XXX XXX"
        fullWidth
      />
      <Input
        disabled={true}
        label="Email"
        type="email"
        value={data.venueEmail || data.email}
        onChange={(e) => onChange({ venueEmail: e.target.value })}
        error={errors.venueEmail}
        placeholder="venue@example.com"
        fullWidth
      />
    </div>
  </div>
);

// Step 3: Spaces
const SpacesStep = ({ data, onChange }) => {
  const initializeSpaces = () => {
    if (!data.spaces || data.spaces.length === 0) {
      return [
        {
          id: Date.now(),
          name: "",
          minCapacity: "",
          maxCapacity: "",
          basePrice: "",
        },
      ];
    }
    return data.spaces;
  };

  const [spaces, setSpaces] = useState(initializeSpaces());
  const MAX_SPACES = 3;
  const { toast } = useToast();

  useEffect(() => {
    if (spaces.length > 0 && (!data.spaces || data.spaces.length === 0)) {
      onChange({ spaces });
    }
  }, []);

  const addSpace = () => {
    if (spaces.length >= MAX_SPACES) {
      toast(`Maximum ${MAX_SPACES} spaces allowed`, "error");
      return;
    }
    const newSpace = {
      id: Date.now(),
      name: "",
      minCapacity: "",
      maxCapacity: "",
      basePrice: "",
    };
    const newSpaces = [...spaces, newSpace];
    setSpaces(newSpaces);
    onChange({ spaces: newSpaces });
  };

  const updateSpace = (id, field, value) => {
    const newSpaces = spaces.map((space) =>
      space.id === id ? { ...space, [field]: value } : space
    );
    setSpaces(newSpaces);
    onChange({ spaces: newSpaces });
  };

  const removeSpace = (id) => {
    if (spaces.length === 1) {
      toast("At least one space is required", "error");
      return;
    }
    const newSpaces = spaces.filter((space) => space.id !== id);
    setSpaces(newSpaces);
    onChange({ spaces: newSpaces });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Add Your Spaces
        </h3>
        <p className="text-gray-600">
          Define different areas or halls (max {MAX_SPACES})
        </p>
      </div>
      <div className="space-y-4">
        {spaces.map((space, index) => (
          <div
            key={space.id}
            data-space-id={space.id}
            className="p-4 border-2 border-gray-200 rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Space {index + 1}</h4>
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
                label="Space Name"
                value={space.name}
                onChange={(e) => updateSpace(space.id, "name", e.target.value)}
                placeholder="e.g., Main Hall"
                fullWidth
              />
              <Input
                label="Base Price (TND)"
                type="number"
                value={space.basePrice}
                onChange={(e) =>
                  updateSpace(space.id, "basePrice", e.target.value)
                }
                placeholder="5000"
                fullWidth
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Min Capacity"
                  type="number"
                  value={space.minCapacity}
                  onChange={(e) =>
                    updateSpace(space.id, "minCapacity", e.target.value)
                  }
                  placeholder="50"
                  fullWidth
                />
                <Input
                  label="Max Capacity"
                  type="number"
                  value={space.maxCapacity}
                  onChange={(e) =>
                    updateSpace(space.id, "maxCapacity", e.target.value)
                  }
                  placeholder="500"
                  fullWidth
                />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addSpace}
          disabled={spaces.length >= MAX_SPACES}
          className={`w-full py-3 border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-2 ${
            spaces.length >= MAX_SPACES
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-600 hover:border-orange-500 hover:text-orange-500"
          }`}
        >
          <Plus size={20} />
          {spaces.length >= MAX_SPACES
            ? `Maximum ${MAX_SPACES} Spaces Reached`
            : `Add Another Space (${spaces.length}/${MAX_SPACES})`}
        </button>
      </div>
    </div>
  );
};

// Step 4: Address
const AddressStep = ({ data, onChange, errors }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
        Venue Address
      </h3>
      <p className="text-gray-600">Where is your venue located?</p>
    </div>
    <div className="space-y-4">
      <Input
        label="Street Address"
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
          label="City"
          value={data.address?.city || ""}
          onChange={(e) =>
            onChange({ address: { ...data.address, city: e.target.value } })
          }
          error={errors.city}
          placeholder="Tunis"
          fullWidth
        />
        <Input
          label="State/Region"
          value={data.address?.state || ""}
          onChange={(e) =>
            onChange({ address: { ...data.address, state: e.target.value } })
          }
          error={errors.state}
          placeholder="Tunis Governorate"
          fullWidth
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="ZIP Code"
          value={data.address?.zipCode || ""}
          onChange={(e) =>
            onChange({ address: { ...data.address, zipCode: e.target.value } })
          }
          error={errors.zipCode}
          placeholder="1000"
          fullWidth
        />
        <Input
          label="Country"
          value={data.address?.country || "Tunisia"}
          onChange={(e) =>
            onChange({ address: { ...data.address, country: e.target.value } })
          }
          error={errors.country}
          placeholder="Tunisia"
          fullWidth
        />
      </div>
    </div>
  </div>
);

// Step 5: Review
const ReviewStep = ({ data }) => {
  console.log("data", data);
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          Review Your Information
        </h3>
        <p className="text-gray-600">
          Please verify all details before continuing
        </p>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-3">
            Account Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{data.name || "Not provided"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">
                {data.email || "Not provided"}
              </span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-3">
            Venue Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Venue Name:</span>
              <span className="font-medium">{data.venueName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{data.phone}</span>
            </div>
            {data.description && (
              <div className="pt-2">
                <span className="text-gray-600">Description:</span>
                <p className="font-medium mt-1">{data.description}</p>
              </div>
            )}
          </div>
        </div>
        {data.spaces && data.spaces.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">
              Spaces ({data.spaces.length})
            </h4>
            <div className="space-y-3">
              {data.spaces.map((space) => (
                <div key={space.id} className="p-3 bg-white rounded-lg">
                  <p className="font-medium text-gray-900">{space.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-600">
                    <div>
                      Capacity: {space.minCapacity}-{space.maxCapacity}
                    </div>
                    <div>Price: {space.basePrice} TND</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.address && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
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
};

// Main Registration Slider
const RegistrationSlider = ({ isOpen, onClose, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessType: "venue",
    spaces: [],
    address: { country: "Tunisia" },
    ...initialData,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...initialData }));
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      setIsSliderOpen(false);
      setShouldRender(true);
      const timer = setTimeout(() => setIsSliderOpen(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsSliderOpen(false);
      const timer = setTimeout(() => setShouldRender(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const updateData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
    setErrors({});
  };

  const validateStep = () => {
    const newErrors = {};
    switch (currentStep) {
      case 1:
        if (!formData.venueName?.trim())
          newErrors.venueName = "Venue name is required";

        if (!formData.phone?.trim())
          newErrors.phone = "Phone number is required";
        break;
      case 2:
        if (!formData.spaces || formData.spaces.length === 0) {
          toast("Please add at least one space", "error");
          return false;
        }
        const hasInvalidSpace = formData.spaces.some(
          (space) =>
            !space.name?.trim() ||
            !space.basePrice ||
            !space.minCapacity ||
            !space.maxCapacity
        );
        if (hasInvalidSpace) {
          toast("Please fill in all space details", "error");
          return false;
        }
        break;
      case 3:
        if (!formData.address?.street?.trim())
          newErrors.street = "Street address is required";
        if (!formData.address?.city?.trim())
          newErrors.city = "City is required";
        if (!formData.address?.state?.trim())
          newErrors.state = "State is required";
        if (!formData.address?.zipCode?.trim())
          newErrors.zipCode = "ZIP code is required";
        if (!formData.address?.country?.trim())
          newErrors.country = "Country is required";
        break;
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
      await register(formData);
      navigate("/dashboard");
      toast("Registration successful!", "success");
    } catch (err) {
      toast(err.message || "Registration failed", "error");
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
    />,
    <VenueDetailsStep data={formData} onChange={updateData} errors={errors} />,
    <SpacesStep data={formData} onChange={updateData} errors={errors} />,
    <AddressStep data={formData} onChange={updateData} errors={errors} />,
    <ReviewStep data={formData} />,
  ];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300"
      style={{
        backgroundColor: isSliderOpen
          ? "rgba(0, 0, 0, 0.5)"
          : "rgba(0, 0, 0, 0)",
        backdropFilter: isSliderOpen ? "blur(4px)" : "blur(0px)",
        pointerEvents: isSliderOpen ? "auto" : "none",
      }}
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
            Complete Your Registration
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Smaller stepper */}
        <div className="px-4 pt-3">
          <ProgressSteps currentStep={currentStep} />
        </div>

        {/* More focused content area */}
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

        {/* Compact footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between gap-3">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="flex items-center gap-2 px-4 py-2 text-sm"
            >
              <ChevronLeft size={16} />
              Back
            </Button>
            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                variant="primary"
                className="flex items-center gap-2 px-4 py-2 text-sm"
              >
                Continue
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={() => handleComplete()}
                loading={loading}
                variant="primary"
                className="px-4 py-2 text-sm"
              >
                Complete Registration
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Register Component
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
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleInitialSubmit = async () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Full name is required";
    if (!formData.email?.trim()) newErrors.email = "Email is required";
    if (!formData.password?.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword?.trim())
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);

    // If there are validation errors, don't proceed with email verification
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      console.log("formData.email", formData.email);
      const response = await verifyEmail(formData.email);
      console.log("response", response);
      setShowSlider(true);
    } catch (error) {
      console.log("error", error);
      // Create a NEW errors object for the email error
      setErrors({
        email: error.message || "Email verification failed",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-0 md:p-4">
        <div className="bg-white w-full h-full md:rounded-2xl md:shadow-lg md:max-w-md md:w-full md:h-auto flex flex-col justify-center">
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
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Create an account
              </h2>
              <p className="text-sm text-gray-500">
                Get started with your venue management
              </p>
            </div>
            <div className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                error={errors.name}
                fullWidth
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                error={errors.email}
                fullWidth
              />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                iconRight={showPassword ? EyeOff : Eye}
                onIconClick={() => setShowPassword(!showPassword)}
                placeholder="••••••••"
                error={errors.password}
                fullWidth
              />
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                iconRight={showConfirmPassword ? EyeOff : Eye}
                onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder="••••••••"
                error={errors.confirmPassword}
                fullWidth
              />
              <Button
                onClick={handleInitialSubmit}
                variant="primary"
                className="w-full py-3"
              >
                Continue
              </Button>
            </div>
            <div className="text-sm mt-6 text-center">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-orange-500 font-medium hover:underline"
              >
                Sign in
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
