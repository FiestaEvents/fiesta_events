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

// Add custom animations
const styles = `
  @keyframes fadeSlideIn {
    0% {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUpBounce {
    0% {
      transform: translateY(100%);
    }
    60% {
      transform: translateY(-10px);
    }
    80% {
      transform: translateY(5px);
    }
    100% {
      transform: translateY(0);
    }
  }

  .stagger-animation > * {
    animation: fadeIn 0.5s ease-out forwards;
    opacity: 0;
  }

  .stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
  .stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
  .stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
  .stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
  .stagger-animation > *:nth-child(5) { animation-delay: 0.5s; }
  .stagger-animation > *:nth-child(6) { animation-delay: 0.6s; }

  /* Hide scrollbar for Chrome, Safari and Opera */
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .hide-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Mock Auth and Toast contexts (replace with your actual imports)
const useAuth = () => ({
  register: async (data) => {
    console.log("Registering:", data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  },
});

const useToast = () => ({
  toast: (message, type) => console.log(`${type}: ${message}`),
});

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
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 hover:shadow-md ${
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
    {error && (
      <p className="text-sm text-red-600 mt-1 animate-in fade-in duration-200">
        {error}
      </p>
    )}
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
    "px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 hover:shadow-lg";
  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    outline: "border-2 border-orange-500 text-orange-500 hover:bg-orange-50",
  };

  return (
    <button
      className={`${baseClass} ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

// Progress Steps Component
const ProgressSteps = ({ currentStep, totalSteps }) => {
  const steps = [
    "Account",
    "Business Type",
    "Venue Details",
    "Spaces",
    "Address",
    "Review",
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  index < currentStep
                    ? "bg-green-500 text-white"
                    : index === currentStep
                      ? "bg-orange-500 text-white scale-110 shadow-lg"
                      : "bg-gray-200 text-gray-500"
                }`}
                style={{
                  animation:
                    index === currentStep ? "pulse 2s infinite" : "none",
                }}
              >
                {index < currentStep ? <Check size={20} /> : index + 1}
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-all duration-300 ${index === currentStep ? "text-orange-500 scale-105" : "text-gray-500"}`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 rounded transition-all duration-500 ${
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

// Step 1: Business Type Selection
const BusinessTypeStep = ({ data, onChange, onNext }) => {
  const [hoveredType, setHoveredType] = useState(null);

  return (
    <div className="space-y-6 flex justify-center items-center flex-col">
      <div className="w-full border">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-left">
          Choose Your Business Type
        </h3>
        <p className="text-gray-600">Select how you'll use Fiesta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => {
            onChange({ businessType: "venue" });
            setTimeout(onNext, 300);
          }}
          onMouseEnter={() => setHoveredType("venue")}
          onMouseLeave={() => setHoveredType(null)}
          className={`p-6 border-2 rounded-xl transition-all duration-300 transform ${
            data.businessType === "venue"
              ? "border-orange-500 bg-orange-50 scale-105 shadow-lg"
              : "border-gray-200 hover:border-orange-300 hover:scale-102 hover:shadow-md"
          }`}
        >
          <Building2
            className={`w-12 h-12 mb-4 transition-all duration-300 ${
              hoveredType === "venue"
                ? "text-orange-600 scale-110"
                : "text-orange-500"
            }`}
          />
          <h4 className="font-bold text-lg mb-2">Venue Owner</h4>
          <p className="text-sm text-gray-600">
            Manage your event venue, bookings, and staff
          </p>
        </button>

        <div className="relative p-6 border-2 border-gray-200 rounded-xl opacity-50 cursor-not-allowed">
          <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
            Coming Soon
          </div>
          <Users className="w-12 h-12 text-gray-400 mb-4" />
          <h4 className="font-bold text-lg mb-2">Service Business</h4>
          <p className="text-sm text-gray-600">
            Offer catering, photography, or other event services
          </p>
        </div>
      </div>
    </div>
  );
};

// Step 2: Venue Details
const VenueDetailsStep = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Tell Us About Your Venue
        </h3>
        <p className="text-gray-600">
          Provide basic information about your venue
        </p>
      </div>

      <div className="space-y-4 stagger-animation">
        <Input
          label="Venue Name *"
          name="venueName"
          value={data.venueName}
          onChange={(e) => onChange({ venueName: e.target.value })}
          error={errors.venueName}
          placeholder="e.g., Grand Palace Events"
          fullWidth
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={data.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
            rows={4}
            placeholder="Describe your venue and what makes it special..."
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
          )}
        </div>

        <Input
          label="Phone Number *"
          name="phone"
          value={data.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          error={errors.phone}
          placeholder="+216 XX XXX XXX"
          fullWidth
        />

        <Input
          label="Email *"
          type="email"
          name="venueEmail"
          value={data.venueEmail || data.email}
          onChange={(e) => onChange({ venueEmail: e.target.value })}
          error={errors.venueEmail}
          placeholder="venue@example.com"
          fullWidth
        />
      </div>
    </div>
  );
};

// Step 3: Spaces Management
const SpacesStep = ({ data, onChange, errors }) => {
  const [spaces, setSpaces] = useState(data.spaces || []);
  const [newSpaceAdded, setNewSpaceAdded] = useState(null);

  const addSpace = () => {
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
    setNewSpaceAdded(newSpace.id);
    setTimeout(() => setNewSpaceAdded(null), 500);
  };

  const updateSpace = (id, field, value) => {
    const newSpaces = spaces.map((space) =>
      space.id === id ? { ...space, [field]: value } : space
    );
    setSpaces(newSpaces);
    onChange({ spaces: newSpaces });
  };

  const removeSpace = (id) => {
    // Add fade-out animation before removing
    const element = document.querySelector(`[data-space-id="${id}"]`);
    if (element) {
      element.style.transition = "all 0.3s ease-out";
      element.style.opacity = "0";
      element.style.transform = "translateX(-20px)";
      setTimeout(() => {
        const newSpaces = spaces.filter((space) => space.id !== id);
        setSpaces(newSpaces);
        onChange({ spaces: newSpaces });
      }, 300);
    } else {
      const newSpaces = spaces.filter((space) => space.id !== id);
      setSpaces(newSpaces);
      onChange({ spaces: newSpaces });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Add Your Spaces
        </h3>
        <p className="text-gray-600">
          Define different areas or halls in your venue
        </p>
      </div>

      <div className="space-y-4">
        {spaces.map((space, index) => (
          <div
            key={space.id}
            data-space-id={space.id}
            className={`p-4 border-2 border-gray-200 rounded-xl transition-all duration-500 ease-out ${
              newSpaceAdded === space.id ? "animate-in slide-in-from-top" : ""
            }`}
            style={{
              opacity: newSpaceAdded === space.id ? 0 : 1,
              animation:
                newSpaceAdded === space.id
                  ? "fadeSlideIn 0.5s ease-out forwards"
                  : "none",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Space {index + 1}</h4>
              {spaces.length > 1 && (
                <button
                  onClick={() => removeSpace(space.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Space Name *"
                value={space.name}
                onChange={(e) => updateSpace(space.id, "name", e.target.value)}
                placeholder="e.g., Main Hall, Garden Area"
                fullWidth
              />

              <Input
                label="Base Price (TND) *"
                type="number"
                value={space.basePrice}
                onChange={(e) =>
                  updateSpace(space.id, "basePrice", e.target.value)
                }
                placeholder="5000"
                fullWidth
              />

              <Input
                label="Min Capacity *"
                type="number"
                value={space.minCapacity}
                onChange={(e) =>
                  updateSpace(space.id, "minCapacity", e.target.value)
                }
                placeholder="50"
                fullWidth
              />

              <Input
                label="Max Capacity *"
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
        ))}

        <button
          onClick={addSpace}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Add Another Space
        </button>

        {spaces.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Click "Add Another Space" to start adding your venue spaces
          </p>
        )}
      </div>
    </div>
  );
};

// Step 4: Address
const AddressStep = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Venue Address</h3>
        <p className="text-gray-600">Where is your venue located?</p>
      </div>

      <div className="space-y-4 stagger-animation">
        <Input
          label="Street Address *"
          name="street"
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
            label="City *"
            name="city"
            value={data.address?.city || ""}
            onChange={(e) =>
              onChange({ address: { ...data.address, city: e.target.value } })
            }
            error={errors.city}
            placeholder="Tunis"
            fullWidth
          />

          <Input
            label="State/Region *"
            name="state"
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
            label="ZIP/Postal Code *"
            name="zipCode"
            value={data.address?.zipCode || ""}
            onChange={(e) =>
              onChange({
                address: { ...data.address, zipCode: e.target.value },
              })
            }
            error={errors.zipCode}
            placeholder="1000"
            fullWidth
          />

          <Input
            label="Country *"
            name="country"
            value={data.address?.country || "Tunisia"}
            onChange={(e) =>
              onChange({
                address: { ...data.address, country: e.target.value },
              })
            }
            error={errors.country}
            placeholder="Tunisia"
            fullWidth
          />
        </div>
      </div>
    </div>
  );
};

// Step 5: Review
const ReviewStep = ({ data }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Review Your Information
        </h3>
        <p className="text-gray-600">
          Please verify all details before continuing
        </p>
      </div>

      <div className="space-y-4 stagger-animation">
        {/* Account Info */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-3">
            Account Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{data.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{data.email}</span>
            </div>
          </div>
        </div>

        {/* Venue Info */}
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

        {/* Spaces */}
        {data.spaces && data.spaces.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-semibold text-gray-900 mb-3">
              Spaces ({data.spaces.length})
            </h4>
            <div className="space-y-3">
              {data.spaces.map((space, index) => (
                <div key={space.id} className="p-3 bg-white rounded-lg">
                  <p className="font-medium text-gray-900">{space.name}</p>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
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

        {/* Address */}
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

// Main Registration Slider Component
const RegistrationSlider = ({ isOpen, onClose, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [formData, setFormData] = useState({
    ...initialData,
    businessType: "venue",
    spaces: [],
    address: {},
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  // Handle mounting/unmounting with animation
  useEffect(() => {
    if (isOpen) {
      // Reset isSliderOpen to false first
      setIsSliderOpen(false);
      setShouldRender(true);
      // Small delay to allow DOM to render before starting transition
      const timer = setTimeout(() => {
        setIsSliderOpen(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsSliderOpen(false);
      // Delay unmounting to allow exit animation
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
      case 2: // Venue Details
        if (!formData.venueName?.trim())
          newErrors.venueName = "Venue name is required";
        if (!formData.description?.trim())
          newErrors.description = "Description is required";
        if (!formData.phone?.trim())
          newErrors.phone = "Phone number is required";
        break;

      case 3: // Spaces
        if (!formData.spaces || formData.spaces.length === 0) {
          toast("Please add at least one space", "error");
          return false;
        }
        break;

      case 4: // Address
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
        setCurrentStep((prev) => Math.min(prev + 1, 5));
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentStep === 1)
      return (setIsSliderOpen(false), setTimeout(onClose, 300));
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep((prev) => Math.max(prev - 1, 1));
      setIsAnimating(false);
    }, 300);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await register(formData);
      toast("Registration successful!", "success");
      // Navigate to dashboard would happen here
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
      className="fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: isSliderOpen
          ? "rgba(0, 0, 0, 0.5)"
          : "rgba(0, 0, 0, 0)",
        backdropFilter: isSliderOpen ? "blur(4px)" : "blur(0px)",
        pointerEvents: isSliderOpen ? "auto" : "none",
        transition:
          "background-color 0.3s ease-in-out, backdrop-filter 0.3s ease-in-out",
      }}
    >
      <div
        className="w-full h-full bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{
          transform: isSliderOpen ? "translateY(0)" : "translateY(100%)",
          opacity: isSliderOpen ? "1" : "0",
          transition:
            "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-in-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Complete Your Registration
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-6">
          <ProgressSteps currentStep={currentStep} totalSteps={5} />
        </div>

        {/* Content */}
        <div className="overflow-y-auto hide-scrollbar flex flex-1 justify-center items-center">
          <div
            className="transition-all duration-300 ease-in-out w-[80%] "
            style={{
              opacity: isAnimating ? 0 : 1,
              transform: isAnimating ? "translateX(20px)" : "translateX(0)",
            }}
          >
            {steps[currentStep - 1]}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            <Button
              onClick={handleBack}
              variant="secondary"
              className="flex items-center justify-between gap-5"
            >
              <ChevronLeft size={20} />
              Back
            </Button>

            {currentStep < 5 ? (
              <div className="w-full justify-end flex">
                <Button
                  onClick={handleNext}
                  variant="primary"
                  className="flex items-center justify-between gap-5"
                >
                  Continue
                  <ChevronRight size={20} />
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleComplete}
                loading={loading}
                variant="primary"
                className="flex-1"
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

// Enhanced Register Component
const Register = () => {
  const [showSlider, setShowSlider] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    venueName: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleInitialSubmit = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    }
    if (!formData.password?.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword?.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setShowSlider(true);
    }
  };

  return (
    <div className="size-full flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 py-5 shadow-md max-w-2xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-center items-center h-32 -mt-4 -mb-8 relative overflow-visible">
          <img src="fiesta logo-01.png" alt="fiesta logo" className="w-1/2" />
        </div>

        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          Create an account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Get started with your venue management
        </p>

        <div className="space-y-4 stagger-animation">
          <Input
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            error={errors.name}
            fullWidth
          />

          <Input
            label="Email *"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            error={errors.email}
            fullWidth
          />

          <Input
            label="Password *"
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
            label="Confirm Password *"
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
            className="w-full transform hover:scale-105 transition-transform"
          >
            Continue
          </Button>
        </div>

        <div className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-orange-500 font-medium hover:underline"
          >
            Sign in
          </a>
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
