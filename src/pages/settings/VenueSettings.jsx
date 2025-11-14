import { useState, useEffect, useRef } from "react";
import { venueService, authService, venueSpacesService } from "../../api/index";
import { useToast } from "../../context/ToastContext.jsx";
import {
  Upload,
  Image as ImageIcon,
  Move,
  Save,
  User,
  Lock,
  Building2,
  Clock,
  Grid3x3,
  Plus,
  X,
  Trash2,
  Edit2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const DEFAULT_AMENITIES = [
  "WiFi",
  "Parking",
  "A/C & Heating",
  "Restrooms",
  "Bridal Suite",
  "Groom's Room",
  "Stage",
  "Dance Floor",
  "Sound System",
  "Lighting System",
  "Projector & Screen",
  "Microphones",
  "Kitchen Access",
  "Bar Area",
  "Outdoor Space",
  "Garden Area",
  "Patio",
  "Balcony",
  "Elevator",
  "Wheelchair Accessible",
  "Coat Check",
  "Valet Service",
  "Security",
  "Event Coordinator",
  "Setup & Cleanup",
  "Tables & Chairs",
  "Linens",
  "China & Glassware",
  "Catering Kitchen",
  "Liquor License",
  "DJ Booth",
  "Photo Booth Area",
  "Fireplace",
  "Waterfront View",
  "Mountain View",
  "City View",
  "Pool Access",
  "Beach Access",
  "Changing Rooms",
  "Storage Space",
];

// Reusable Components
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
      <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-white ">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        className={`w-full px-4 py-1.5 text-base border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 hover:shadow-md dark:text-white dark:bg-gray-800 ${
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
const Textarea = ({ label, error, className = "", ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    <textarea
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent
        ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
        bg-white dark:bg-gray-800 text-gray-900 dark:text-white
        ${className}`}
      {...props}
    />
    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);

const Button = ({
  children,
  variant = "primary",
  icon: Icon,
  loading,
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-4 py-1.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
  const variants = {
    primary:
      "bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500",
    outline:
      "border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 focus:ring-orange-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost:
      "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-5 h-5" />
      ) : null}
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default", onRemove }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    purple:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
      <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {description}
    </p>
    {action}
  </div>
);

const ErrorAlert = ({ message }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">
          Error
        </h3>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{message}</p>
      </div>
    </div>
  </div>
);

// Image Upload Components
const ImageUpload = ({ onUpload, multiple = true, className = "" }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (files.length > 0) {
      onUpload(files);
    }
    e.target.value = ""; // Reset input
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
        ${
          dragOver
            ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple={multiple}
        accept="image/*"
        className="hidden"
      />

      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
        <Upload className="w-6 h-6 text-gray-500 dark:text-gray-400" />
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Drop images here or click to upload
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          PNG, JPG, WEBP up to 10MB each
        </p>
        {multiple && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select multiple images
          </p>
        )}
      </div>
    </div>
  );
};

const ImageGrid = ({ images, onRemove, onReorder, editable = true }) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <div
          key={image.id || image.url}
          className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-square"
        >
          <img
            src={image.url}
            alt={image.alt || `Image ${index + 1}`}
            className="w-full h-full object-cover"
          />

          {editable && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onRemove(image.id || image.url)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  title="Remove image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {onReorder && index > 0 && (
                  <button
                    type="button"
                    onClick={() => onReorder(index, index - 1)}
                    className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                    title="Move left"
                  >
                    <Move className="w-4 h-4" />
                  </button>
                )}

                {onReorder && index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => onReorder(index, index + 1)}
                    className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                    title="Move right"
                  >
                    <Move className="w-4 h-4 rotate-180" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {image.uploading && (
            <div className="absolute bottom-0 left-0 right-0 bg-gray-200 dark:bg-gray-700 h-1">
              <div
                className="bg-orange-600 h-1 transition-all duration-300"
                style={{ width: `${image.progress || 0}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const ProgressOverlay = ({ progress }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Uploading Images
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Please wait while we upload your images...
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {Math.round(progress)}% complete
        </p>
      </div>
    </div>
  </div>
);

// Main Component
const VenueSettings = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [venueImages, setVenueImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [currentPassword, setCurrentPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [spaceImages, setSpaceImages] = useState({});
  const toast = useToast();

  // User state
  const [user, setUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    phone: "",
    avatar: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Venue state
  const [venue, setVenue] = useState(null);
  const [venueForm, setVenueForm] = useState({
    name: "",
    description: "",
    address: { street: "", city: "", state: "", zipCode: "", country: "" },
    contact: { phone: "", email: "" },
    capacity: { min: "", max: "" },
    pricing: { basePrice: "" },
  });

  // Amenities & Hours state
  const [amenities, setAmenities] = useState([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [availableAmenities, setAvailableAmenities] =
    useState(DEFAULT_AMENITIES);
  const [operatingHours, setOperatingHours] = useState({});

  // Spaces state
  const [spaces, setSpaces] = useState([]);
  const [editingSpace, setEditingSpace] = useState(null);
  const [spaceForm, setSpaceForm] = useState({
    name: "",
    description: "",
    capacity: { min: "", max: "" },
    basePrice: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // Add these new handler functions
  const handleAddDefaultAmenity = (amenity) => {
    if (!amenities.includes(amenity)) {
      setAmenities((prev) => [...prev, amenity]);
      toast.success(`Added ${amenity}`);
    } else {
      toast.info(`${amenity} is already added`);
    }
  };

  const handleAddCustomAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities((prev) => [...prev, newAmenity.trim()]);
      setNewAmenity("");
      toast.success("Custom amenity added");
    } else if (amenities.includes(newAmenity.trim())) {
      toast.error("This amenity already exists");
    }
  };

  // Fetch data - IMPROVED VERSION
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        console.log("🔄 Fetching venue and user data...");

        const [userResponse, venueResponse] = await Promise.all([
          authService.getMe(),
          venueService.getMe(),
        ]);

        console.log("✅ User response:", userResponse);
        console.log("✅ Venue response:", venueResponse);

        // Handle user data - FIXED: Properly extract user data from API response
        let userData = null;
        if (userResponse?.data?.user) {
          userData = userResponse.data.user;
        } else if (userResponse?.user) {
          userData = userResponse.user;
        } else if (userResponse?.data) {
          userData = userResponse.data;
        } else {
          userData = userResponse;
        }

        if (userData) {
          setUser(userData);
          setUserForm({
            name: userData?.name || "",
            phone: userData?.phone || "",
            avatar: userData?.avatar || "",
          });
        }

        // Handle venue data - FIXED: Properly extract venue data from API response
        let venueData = null;
        if (venueResponse?.data?.venue) {
          venueData = venueResponse.data.venue;
        } else if (venueResponse?.venue) {
          venueData = venueResponse.venue;
        } else if (venueResponse?.data) {
          venueData = venueResponse.data;
        } else {
          venueData = venueResponse;
        }

        console.log("🏢 Extracted venue data:", venueData);

        if (venueData) {
          setVenue(venueData);
          setVenueForm({
            name: venueData?.name || "",
            description: venueData?.description || "",
            address: venueData?.address || {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            contact: venueData?.contact || { phone: "", email: "" },
            capacity: venueData?.capacity || { min: "", max: "" },
            pricing: venueData?.pricing || { basePrice: "" },
          });

          setAmenities(venueData?.amenities || []);

          // Load venue images
          if (venueData?.images) {
            setVenueImages(
              venueData.images.map((img, index) => ({
                id: img.id || img._id || `venue-img-${index}`,
                url: img.url || img.path || img,
                alt: img.alt || `Venue image ${index + 1}`,
              }))
            );
          }

          // Initialize operating hours
          const defaultHours = {
            monday: { open: "09:00", close: "17:00", closed: false },
            tuesday: { open: "09:00", close: "17:00", closed: false },
            wednesday: { open: "09:00", close: "17:00", closed: false },
            thursday: { open: "09:00", close: "17:00", closed: false },
            friday: { open: "09:00", close: "17:00", closed: false },
            saturday: { open: "09:00", close: "17:00", closed: false },
            sunday: { open: "09:00", close: "17:00", closed: true },
          };
          setOperatingHours(venueData?.operatingHours || defaultHours);
        } else {
          console.warn("⚠️ No venue data found, might be first time setup");
        }

        // Fetch spaces separately using the venue spaces API
        try {
          console.log("🔄 Fetching venue spaces...");
          const spacesResponse = await venueService.getSpaces();
          console.log("✅ Spaces response:", spacesResponse);

          let spacesData = [];
          if (spacesResponse?.data?.spaces) {
            spacesData = spacesResponse.data.spaces;
          } else if (spacesResponse?.spaces) {
            spacesData = spacesResponse.spaces;
          } else if (spacesResponse?.data) {
            spacesData = spacesResponse.data;
          } else {
            spacesData = spacesResponse || [];
          }

          console.log("spacesData", spacesData);
          setSpaces(spacesData);

          // Load space images
          const spaceImagesMap = {};
          spacesData.forEach((space) => {
            if (space.images && space.images.length > 0) {
              spaceImagesMap[space._id] = space.images.map((img, index) => ({
                id: img.id || img._id || `space-${space._id}-img-${index}`,
                url: img.url || img.path || img,
                alt: img.alt || `${space.name} image ${index + 1}`,
              }));
            }
          });
          setSpaceImages(spaceImagesMap);
        } catch (spacesError) {
          console.warn("⚠️ Could not fetch spaces:", spacesError);
          setSpaces([]);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
        const errorMessage = error.message || "Failed to load settings";
        setFetchError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tab definitions
  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "venue", label: "Venue Details", icon: Building2 },
    { id: "amenities", label: "Amenities & Hours", icon: Clock },
    { id: "spaces", label: "Venue Spaces", icon: Grid3x3 },
  ];

  // Handlers
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVenueChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setVenueForm((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setVenueForm((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities((prev) => [...prev, newAmenity.trim()]);
      setNewAmenity("");
    } else if (amenities.includes(newAmenity.trim())) {
      toast.error("This amenity already exists");
    }
  };

  const handleRemoveAmenity = (index) => {
    setAmenities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSpaceChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setSpaceForm((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setSpaceForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleAddSpace = async () => {
    if (!spaceForm.name.trim()) {
      toast.error("Space name is required");
      return;
    }

    if (!spaceForm.capacity.min || !spaceForm.capacity.max) {
      toast.error("Capacity range is required");
      return;
    }

    if (Number(spaceForm.capacity.max) < Number(spaceForm.capacity.min)) {
      toast.error(
        "Maximum capacity must be greater than or equal to minimum capacity"
      );
      return;
    }

    if (!spaceForm.basePrice) {
      toast.error("Price is required");
      return;
    }

    setSaving(true);
    try {
      const spaceData = {
        name: spaceForm.name.trim(),
        description: spaceForm.description.trim(),
        capacity: {
          min: Number(spaceForm.capacity.min),
          max: Number(spaceForm.capacity.max),
        },
        basePrice: Number(spaceForm.basePrice),
        amenities: [],
        isActive: spaceForm.isActive,
      };

      let response;
      if (editingSpace) {
        // Update existing space
        response = await venueSpacesService.update(editingSpace._id, spaceData);
        toast.success("Space updated successfully");
      } else {
        // Create new space
        response = await venueSpacesService.create(spaceData);
        toast.success("Space created successfully");
      }

      // Refresh spaces list
      const spacesResponse = await venueSpacesService.getAll();
      let spacesData = [];
      if (spacesResponse?.data?.spaces) {
        spacesData = spacesResponse.data.spaces;
      } else if (spacesResponse?.spaces) {
        spacesData = spacesResponse.spaces;
      } else {
        spacesData = spacesResponse || [];
      }
      setSpaces(spacesData);

      // Reset form
      setSpaceForm({
        name: "",
        description: "",
        capacity: { min: "", max: "" },
        basePrice: "",
        isActive: true,
      });
      setEditingSpace(null);
    } catch (error) {
      console.error("Error saving space:", error);
      toast.error(error.message || "Failed to save space");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSpace = (space) => {
    setEditingSpace(space);
    setSpaceForm({
      name: space.name,
      description: space.description || "",
      capacity: space.capacity,
      basePrice: space.basePrice,
      isActive: space.isActive,
    });

    // Scroll to form
    window.scrollTo({ top: 500, behavior: "smooth" });
  };

  const handleDeleteSpace = async (spaceId) => {
    if (window.confirm("Are you sure you want to delete this space?")) {
      try {
        await venueService.deleteVenueSpace(spaceId);
        setSpaces((prev) => prev.filter((s) => s._id !== spaceId));
        toast.success("Space deleted successfully");
      } catch (error) {
        console.error("Error deleting space:", error);
        toast.error(error.message || "Failed to delete space");
      }
    }
  };

  const handleCancelEditSpace = () => {
    setEditingSpace(null);
    setSpaceForm({
      name: "",
      description: "",
      capacity: { min: "", max: "" },
      basePrice: "",
      isActive: true,
    });
  };

  const handleSavePersonal = async () => {
    if (!userForm.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      await authService.updateProfile(userForm);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  // FIXED: Save venue with proper API integration
  const handleSaveVenue = async () => {
    // Validation
    const newErrors = {};

    if (!venueForm.name.trim()) newErrors.name = "Venue name is required";
    if (!venueForm.description.trim())
      newErrors.description = "Description is required";
    if (!venueForm.address.city.trim())
      newErrors["address.city"] = "City is required";
    if (!venueForm.contact.phone.trim())
      newErrors["contact.phone"] = "Phone is required";
    if (!venueForm.contact.email.trim()) {
      newErrors["contact.email"] = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(venueForm.contact.email)) {
      newErrors["contact.email"] = "Please provide a valid email";
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("newErrors", newErrors);
      setErrors(newErrors);
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);
    try {
      console.log("💾 Saving venue data...", venueForm);

      const submitData = {
        // Basic venue info
        name: venueForm.name.trim(),
        description: venueForm.description.trim(),
        address: {
          street: venueForm.address.street.trim(),
          city: venueForm.address.city.trim(),
          state: venueForm.address.state.trim(),
          zipCode: venueForm.address.zipCode.trim(),
          country: venueForm.address.country.trim(),
        },
        amenities,
        operatingHours,
        contact: {
          phone: venueForm.contact.phone.trim(),
          email: venueForm.contact.email.trim(),
        },
      };

      console.log("🚀 Sending venue data to API:", submitData);

      const response = await venueService.update(submitData);
      console.log("✅ Venue update response:", response);

      // Handle different response structures
      let updatedVenue = null;
      if (response?.data?.venue) {
        updatedVenue = response.data.venue;
      } else if (response?.venue) {
        updatedVenue = response.venue;
      } else if (response?.data) {
        updatedVenue = response.data;
      } else {
        updatedVenue = response;
      }

      if (updatedVenue) {
        setVenue(updatedVenue);
        toast.success("Venue settings updated successfully!");
        setErrors({});
      } else {
        throw new Error("No venue data in response");
      }
    } catch (error) {
      console.error("❌ Error updating venue:", error);

      // Enhanced error handling
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error("Please fix the validation errors");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update venue settings");
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle venue image upload
  const handleVenueImageUpload = async (files) => {
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageId = `temp-${Date.now()}-${i}`;

      // Create temporary preview
      const tempUrl = URL.createObjectURL(file);
      const tempImage = {
        id: imageId,
        url: tempUrl,
        file: file,
        uploading: true,
        progress: 0,
        alt: file.name,
      };

      // Add to venue images immediately
      setVenueImages((prev) => [...prev, tempImage]);

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setVenueImages((prev) =>
            prev.map((img) => (img.id === imageId ? { ...img, progress } : img))
          );
        }

        // Upload to server using venue service
        const formData = new FormData();
        formData.append("images", file);

        console.log("📤 Uploading venue image...");
        // Note: You'll need to implement this method in your venueService
        // const response = await venueService.uploadVenueImages(formData);
        // console.log("✅ Venue image upload response:", response);

        // For now, we'll simulate a successful upload
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update with final URL from server (in real implementation, use response data)
        setVenueImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  id: `uploaded-${Date.now()}`,
                  url: tempUrl, // In real app, use URL from server response
                  alt: file.name,
                  uploading: false,
                  progress: 100,
                }
              : img
          )
        );
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("❌ Error uploading image:", error);
        toast.error(`Failed to upload ${file.name}`);
        // Remove failed upload
        setVenueImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    }

    setUploading(false);
  };

  // Handle space image upload
  const handleSpaceImageUpload = async (files, spaceId) => {
    if (!spaceId || spaceId === "new-space") {
      toast.error("Please save the space first before uploading images");
      return;
    }

    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageId = `temp-${Date.now()}-${i}`;

      const tempUrl = URL.createObjectURL(file);
      const tempImage = {
        id: imageId,
        url: tempUrl,
        file: file,
        uploading: true,
        progress: 0,
        alt: file.name,
      };

      // Add to current space images immediately for preview
      setSpaceImages((prev) => ({
        ...prev,
        [spaceId]: [...(prev[spaceId] || []), tempImage],
      }));

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setSpaceImages((prev) => ({
            ...prev,
            [spaceId]: (prev[spaceId] || []).map((img) =>
              img.id === imageId ? { ...img, progress } : img
            ),
          }));
        }

        // Upload to server using venue service
        const formData = new FormData();
        formData.append("images", file);

        // Note: You'll need to implement this method in your venueService
        // const response = await venueService.uploadSpaceImages(spaceId, formData);

        // For now, simulate successful upload
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSpaceImages((prev) => ({
          ...prev,
          [spaceId]: (prev[spaceId] || []).map((img) =>
            img.id === imageId
              ? {
                  id: `uploaded-${Date.now()}`,
                  url: tempUrl, // In real app, use URL from server response
                  alt: file.name,
                  uploading: false,
                  progress: 100,
                }
              : img
          ),
        }));
        toast.success("Space image uploaded successfully");
      } catch (error) {
        console.error("Error uploading space image:", error);
        toast.error(`Failed to upload ${file.name}`);
        setSpaceImages((prev) => ({
          ...prev,
          [spaceId]: (prev[spaceId] || []).filter((img) => img.id !== imageId),
        }));
      }
    }

    setUploading(false);
  };

  // Remove venue image
  const handleRemoveVenueImage = async (imageId) => {
    try {
      // If it's a temporary image (starts with 'temp-'), just remove from state
      if (imageId.startsWith("temp-")) {
        setVenueImages((prev) => prev.filter((img) => img.id !== imageId));
        return;
      }

      // For uploaded images, call the API to delete
      // await venueService.deleteVenueImage(imageId);
      setVenueImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  // Remove space image
  const handleRemoveSpaceImage = async (spaceId, imageId) => {
    try {
      // If it's a temporary image, just remove from state
      if (imageId.startsWith("temp-")) {
        setSpaceImages((prev) => ({
          ...prev,
          [spaceId]: (prev[spaceId] || []).filter((img) => img.id !== imageId),
        }));
        return;
      }

      // For uploaded images, call the API to delete
      // await venueService.deleteSpaceImage(spaceId, imageId);
      setSpaceImages((prev) => ({
        ...prev,
        [spaceId]: (prev[spaceId] || []).filter((img) => img.id !== imageId),
      }));
      toast.success("Space image removed successfully");
    } catch (error) {
      console.error("Error removing space image:", error);
      toast.error("Failed to remove space image");
    }
  };

  // Reorder venue images
  const handleReorderVenueImages = (fromIndex, toIndex) => {
    setVenueImages((prev) => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  // Reorder space images
  const handleReorderSpaceImages = (spaceId, fromIndex, toIndex) => {
    setSpaceImages((prev) => {
      const spaceImages = prev[spaceId] || [];
      const newImages = [...spaceImages];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return { ...prev, [spaceId]: newImages };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <ErrorAlert message={fetchError} />
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <div className="min-h-screen bg-white rounded-lg dark:bg-gray-900">
      <div className="mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your profile, venue details, and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-1 p-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-colors whitespace-nowrap
                      ${
                        activeTab === tab.id
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Personal Information
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Update your personal details and profile picture
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={userForm.name}
                    onChange={handleUserChange}
                    placeholder="John Doe"
                  />

                  <Input
                    label="Email Address (Read-only)"
                    value={user?.email || ""}
                    disabled
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    value={userForm.phone}
                    onChange={handleUserChange}
                    placeholder="12345678"
                  />

                  <Input
                    label="Avatar URL"
                    name="avatar"
                    type="url"
                    value={userForm.avatar}
                    onChange={handleUserChange}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                {userForm.avatar && (
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <img
                      src={userForm.avatar}
                      alt="Avatar preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80";
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Profile Picture
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Preview of your avatar
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full flex justify-end">
                  <Button
                    onClick={handleSavePersonal}
                    loading={saving}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="w-full">
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Change Password
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Ensure your account is using a strong password
                    </p>
                  </div>

                  <Input
                    label="Current Password"
                    name="currentPassword"
                    type={currentPassword ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    iconRight={currentPassword ? EyeOff : Eye}
                    onIconClick={() => setCurrentPassword(!currentPassword)}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />

                  <Input
                    label="New Password"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    iconRight={showPassword ? EyeOff : Eye}
                    onIconClick={() => setShowPassword(!showPassword)}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password (min 6 characters)"
                    autoComplete="new-password"
                  />

                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    iconRight={showConfirmPassword ? EyeOff : Eye}
                    onIconClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      Password Requirements:
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
                      <li>At least 6 characters long</li>
                      <li>Mix of letters, numbers, and symbols recommended</li>
                      <li>Avoid common passwords</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 w-full flex justify-end">
                  <Button
                    onClick={handleChangePassword}
                    loading={saving}
                    icon={Lock}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            )}

            {/* Venue Details Tab */}
            {activeTab === "venue" && (
              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Basic Information
                  </h2>
                  <div className="space-y-6">
                    <Input
                      label="Venue Name"
                      name="name"
                      value={venueForm.name}
                      onChange={handleVenueChange}
                      error={errors.name}
                      placeholder="Grand Ballroom Venue"
                    />

                    <Textarea
                      label="Description"
                      name="description"
                      value={venueForm.description}
                      onChange={handleVenueChange}
                      error={errors.description}
                      rows={4}
                      placeholder="Describe your venue..."
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input
                        label="Street Address"
                        name="address.street"
                        value={venueForm.address.street}
                        onChange={handleVenueChange}
                        error={errors["address.street"]}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <Input
                      label="City"
                      name="address.city"
                      value={venueForm.address.city}
                      onChange={handleVenueChange}
                      error={errors["address.city"]}
                      placeholder="New York"
                    />
                    <Input
                      label="State/Province"
                      name="address.state"
                      value={venueForm.address.state}
                      onChange={handleVenueChange}
                      error={errors["address.state"]}
                      placeholder="NY"
                    />
                    <Input
                      label="ZIP/Postal Code"
                      name="address.zipCode"
                      value={venueForm.address.zipCode}
                      onChange={handleVenueChange}
                      error={errors["address.zipCode"]}
                      placeholder="10001"
                    />
                    <Input
                      label="Country"
                      name="address.country"
                      value={venueForm.address.country}
                      onChange={handleVenueChange}
                      error={errors["address.country"]}
                      placeholder="United States"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Phone"
                      name="contact.phone"
                      type="tel"
                      value={venueForm.contact.phone}
                      onChange={handleVenueChange}
                      error={errors["contact.phone"]}
                      placeholder="12345678"
                    />
                    <Input
                      label="Email"
                      name="contact.email"
                      type="email"
                      value={venueForm.contact.email}
                      onChange={handleVenueChange}
                      error={errors["contact.email"]}
                      placeholder="venue@example.com"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full flex justify-end">
                  <Button
                    onClick={handleSaveVenue}
                    loading={saving}
                    icon={Save}
                  >
                    Save Venue Details
                  </Button>
                </div>
              </div>
            )}

            {/* Amenities & Hours Tab */}
            {activeTab === "amenities" && (
              <div className="space-y-8">
                {/* Amenities */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      Venue Amenities
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Add amenities that your venue offers. Select from common
                      options or add custom ones.
                    </p>
                  </div>

                  {/* Quick Add Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Quick Add Common Amenities
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to add frequently used amenities for wedding and
                      event venues
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {availableAmenities
                        .filter((amenity) => !amenities.includes(amenity))
                        .slice(0, 12) // Show first 12 available amenities
                        .map((amenity) => (
                          <button
                            key={amenity}
                            onClick={() => handleAddDefaultAmenity(amenity)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                            title={`Add ${amenity}`}
                          >
                            <Plus className="w-3 h-3" />
                            {amenity}
                          </button>
                        ))}
                    </div>

                    {/* Show more amenities dropdown */}
                    {availableAmenities.filter(
                      (amenity) => !amenities.includes(amenity)
                    ).length > 12 && (
                      <div className="relative">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddDefaultAmenity(e.target.value);
                              e.target.value = ""; // Reset select
                            }
                          }}
                          className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">More amenities...</option>
                          {availableAmenities
                            .filter((amenity) => !amenities.includes(amenity))
                            .slice(12)
                            .map((amenity) => (
                              <option key={amenity} value={amenity}>
                                {amenity}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Custom Amenity Input */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Add Custom Amenity
                    </h3>
                    <div className="flex gap-2 justify-between">
                      <Input
                        fullWidth={true}
                        placeholder="Enter custom amenity (e.g., Vintage Furniture, Fire Pit, etc.)"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCustomAmenity();
                          }
                        }}
                      />
                      <Button
                        className="shrink-0"
                        variant="outline"
                        icon={Plus}
                        onClick={handleAddCustomAmenity}
                        disabled={!newAmenity.trim()}
                      >
                        Add Custom
                      </Button>
                    </div>
                  </div>

                  {/* Selected Amenities */}
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Selected Amenities ({amenities.length})
                      </h3>
                      {amenities.length > 0 && (
                        <Button
                          variant="ghost"
                          icon={Trash2}
                          onClick={() => {
                            if (window.confirm("Remove all amenities?")) {
                              setAmenities([]);
                              toast.success("All amenities removed");
                            }
                          }}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>

                    {amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((amenity, index) => (
                          <Badge
                            key={index}
                            variant="purple"
                            onRemove={() => handleRemoveAmenity(index)}
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                          <Plus className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">
                          No amenities added yet. Select from common options
                          above or add custom ones.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operating Hours section remains the same */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Operating Hours
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Set your venue's weekly schedule
                  </p>

                  <div className="space-y-4">
                    {daysOfWeek.map((day) => (
                      <div
                        key={day}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="w-32">
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {day}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 flex-1">
                          <input
                            type="time"
                            value={operatingHours[day]?.open || "09:00"}
                            onChange={(e) =>
                              handleOperatingHoursChange(
                                day,
                                "open",
                                e.target.value
                              )
                            }
                            disabled={operatingHours[day]?.closed}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className="text-gray-500 dark:text-gray-400">
                            to
                          </span>
                          <input
                            type="time"
                            value={operatingHours[day]?.close || "17:00"}
                            onChange={(e) =>
                              handleOperatingHoursChange(
                                day,
                                "close",
                                e.target.value
                              )
                            }
                            disabled={operatingHours[day]?.closed}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={operatingHours[day]?.closed || false}
                            onChange={(e) =>
                              handleOperatingHoursChange(
                                day,
                                "closed",
                                e.target.checked
                              )
                            }
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300 dark:border-gray-600"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Closed
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full flex justify-end">
                  <Button
                    onClick={handleSaveVenue}
                    loading={saving}
                    icon={Save}
                  >
                    Save Amenities & Hours
                  </Button>
                </div>
              </div>
            )}

            {/* Venue Spaces Tab */}
            {activeTab === "spaces" && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Venue Spaces
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Manage different spaces within your venue
                  </p>
                </div>

                {/* Existing Spaces */}
                {spaces.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Existing Spaces ({spaces.length})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {spaces.map((space) => (
                        <div
                          key={space._id}
                          className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {space.name}
                              </h4>
                              {space.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {space.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditSpace(space)}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit space"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSpace(space._id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete space"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">
                                Capacity
                              </span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {space.capacity.min} - {space.capacity.max}{" "}
                                guests
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">
                                Price
                              </span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                ${space.basePrice?.toLocaleString() || "0"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${space.isActive ? "bg-green-500" : "bg-red-500"}`}
                            />
                            <span
                              className={`text-xs font-medium ${space.isActive ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                            >
                              {space.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    icon={Grid3x3}
                    title="No Spaces Yet"
                    description="Add different spaces within your venue to offer more booking options to your clients."
                  />
                )}

                {/* Add/Edit Space Form */}
                <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {editingSpace ? "Edit Space" : "Add New Space"}
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Space Name"
                        name="name"
                        value={spaceForm.name}
                        onChange={handleSpaceChange}
                        placeholder="Main Hall"
                      />
                      <Input
                        label="Base Price ($)"
                        name="basePrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={spaceForm.basePrice}
                        onChange={handleSpaceChange}
                        placeholder="5000.00"
                      />
                    </div>

                    <Textarea
                      label="Description"
                      name="description"
                      value={spaceForm.description}
                      onChange={handleSpaceChange}
                      rows={3}
                      placeholder="Describe this space..."
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Min Capacity"
                        name="capacity.min"
                        type="number"
                        min="1"
                        value={spaceForm.capacity.min}
                        onChange={handleSpaceChange}
                        placeholder="30"
                      />
                      <Input
                        label="Max Capacity"
                        name="capacity.max"
                        type="number"
                        min="1"
                        value={spaceForm.capacity.max}
                        onChange={handleSpaceChange}
                        placeholder="150"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={spaceForm.isActive}
                        onChange={handleSpaceChange}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300 dark:border-gray-600"
                      />
                      <label
                        htmlFor="isActive"
                        className="text-sm text-gray-700 dark:text-gray-300"
                      >
                        Active (available for bookings)
                      </label>
                    </div>

                    {/* Space Images */}
                    {/* <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                        Space Images
                      </h4>

                      <ImageUpload
                        onUpload={(files) =>
                          handleSpaceImageUpload(
                            editingSpace?._id || "new-space",
                            files
                          )
                        }
                        multiple={true}
                        className="mb-4"
                      />

                      <ImageGrid
                        images={spaceImages[editingSpace?._id] || []}
                        onRemove={(imageId) =>
                          handleRemoveSpaceImage(editingSpace?._id, imageId)
                        }
                        onReorder={(from, to) =>
                          handleReorderSpaceImages(editingSpace?._id, from, to)
                        }
                        editable={true}
                      />
                    </div> */}

                    <div className="flex gap-2 w-full justify-end">
                      <Button
                        onClick={handleAddSpace}
                        loading={saving}
                        icon={editingSpace ? Save : Plus}
                      >
                        {editingSpace ? "Update Space" : "Add Space"}
                      </Button>
                      {editingSpace && (
                        <Button
                          variant="outline"
                          onClick={handleCancelEditSpace}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 w-full flex justify-end">
                  <Button
                    onClick={handleSaveVenue}
                    loading={saving}
                    icon={Save}
                  >
                    Save All Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Progress Overlay */}
      {uploading && <ProgressOverlay progress={50} />}
    </div>
  );
};

export default VenueSettings;
