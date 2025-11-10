import { useState, useEffect, useRef } from "react";
import { venueService, authService } from "../../api/index";
import { toast } from "react-hot-toast";
import {
  Upload,
  Image as ImageIcon,
  Eye,
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
} from "lucide-react";

// Reusable Components
const Input = ({ label, error, className = "", ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    <input
      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent 
        ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
        bg-white dark:bg-gray-800 text-gray-900 dark:text-white
        disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
        ${className}`}
      {...props}
    />
    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
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
    "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2";
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
  const [spaceImages, setSpaceImages] = useState({});

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
  const [operatingHours, setOperatingHours] = useState({});

  // Spaces state
  const [spaces, setSpaces] = useState([]);
  const [editingSpace, setEditingSpace] = useState(null);
  const [spaceForm, setSpaceForm] = useState({
    name: "",
    description: "",
    capacity: { min: "", max: "" },
    price: "",
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  // Fetch data - IMPROVED VERSION
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        console.log("🔄 Fetching venue and user data...");

        const [userData, venueData] = await Promise.all([
          authService.getMe(),
          venueService.getMe(),
        ]);

        console.log("✅ User data:", userData);
        console.log("✅ Venue data:", venueData);

        // Handle user data
        const userInfo = userData?.user || userData;
        if (userInfo) {
          setUser(userInfo);
          setUserForm({
            name: userInfo?.name || "",
            phone: userInfo?.phone || "",
            avatar: userInfo?.avatar || "",
          });
        }

        // Handle venue data - FIXED
        let venueInfo = null;
        
        // Your API service returns response.data?.data || response.data
        if (venueData?.data?.venue) {
          venueInfo = venueData.data.venue;
        } else if (venueData?.venue) {
          venueInfo = venueData.venue;
        } else if (venueData?.data) {
          venueInfo = venueData.data;
        } else {
          venueInfo = venueData;
        }

        console.log("🏢 Extracted venue info:", venueInfo);

        if (venueInfo) {
          setVenue(venueInfo);
          setVenueForm({
            name: venueInfo?.name || "",
            description: venueInfo?.description || "",
            address: venueInfo?.address || {
              street: "",
              city: "",
              state: "",
              zipCode: "",
              country: "",
            },
            contact: venueInfo?.contact || { phone: "", email: "" },
            capacity: venueInfo?.capacity || { min: "", max: "" },
            pricing: venueInfo?.pricing || { basePrice: "" },
          });

          setAmenities(venueInfo?.amenities || []);

          // Load venue images
          if (venueInfo?.images) {
            setVenueImages(
              venueInfo.images.map((img, index) => ({
                id: img.id || img._id || `venue-img-${index}`,
                url: img.url || img.path || img,
                alt: img.alt || `Venue image ${index + 1}`,
              }))
            );
          }

          // Load space images
          if (venueInfo?.spaces) {
            const spaceImagesMap = {};
            venueInfo.spaces.forEach((space) => {
              if (space.images) {
                spaceImagesMap[space._id] = space.images.map((img, index) => ({
                  id: img.id || img._id || `space-${space._id}-img-${index}`,
                  url: img.url || img.path || img,
                  alt: img.alt || `${space.name} image ${index + 1}`,
                }));
              }
            });
            setSpaceImages(spaceImagesMap);
            setSpaces(venueInfo.spaces);
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
          setOperatingHours(venueInfo?.operatingHours || defaultHours);
        } else {
          console.warn("⚠️ No venue data found, might be first time setup");
          // Initialize with empty venue for first-time setup
          setVenueForm({
            name: "",
            description: "",
            address: { street: "", city: "", state: "", zipCode: "", country: "" },
            contact: { phone: "", email: "" },
            capacity: { min: "", max: "" },
            pricing: { basePrice: "" },
          });
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

  const handleAddSpace = () => {
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

    if (!spaceForm.price) {
      toast.error("Price is required");
      return;
    }

    const newSpace = {
      _id: editingSpace?._id || Date.now().toString(),
      name: spaceForm.name.trim(),
      description: spaceForm.description.trim(),
      capacity: {
        min: Number(spaceForm.capacity.min),
        max: Number(spaceForm.capacity.max),
      },
      price: Number(spaceForm.price),
      isActive: spaceForm.isActive,
    };

    if (editingSpace) {
      setSpaces((prev) =>
        prev.map((s) => (s._id === editingSpace._id ? newSpace : s))
      );
      toast.success("Space updated successfully");
      setEditingSpace(null);
    } else {
      setSpaces((prev) => [...prev, newSpace]);
      toast.success("Space added successfully");
    }

    setSpaceForm({
      name: "",
      description: "",
      capacity: { min: "", max: "" },
      price: "",
      isActive: true,
    });
  };

  const handleEditSpace = (space) => {
    setEditingSpace(space);
    setSpaceForm({
      name: space.name,
      description: space.description || "",
      capacity: space.capacity,
      price: space.price,
      isActive: space.isActive,
    });

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteSpace = (spaceId) => {
    if (window.confirm("Are you sure you want to delete this space?")) {
      setSpaces((prev) => prev.filter((s) => s._id !== spaceId));
      toast.success("Space deleted successfully");
    }
  };

  const handleCancelEditSpace = () => {
    setEditingSpace(null);
    setSpaceForm({
      name: "",
      description: "",
      capacity: { min: "", max: "" },
      price: "",
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

  // FIXED: Save venue with complete data
  const handleSaveVenue = async () => {
    // Validation
    const newErrors = {};

    if (!venueForm.name.trim()) newErrors.name = "Venue name is required";
    if (!venueForm.description.trim()) newErrors.description = "Description is required";
    if (!venueForm.address.city.trim()) newErrors["address.city"] = "City is required";
    if (!venueForm.contact.phone.trim()) newErrors["contact.phone"] = "Phone is required";
    if (!venueForm.contact.email.trim()) {
      newErrors["contact.email"] = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(venueForm.contact.email)) {
      newErrors["contact.email"] = "Please provide a valid email";
    }

    if (!venueForm.capacity.min || Number(venueForm.capacity.min) < 1) {
      newErrors["capacity.min"] = "Minimum capacity must be at least 1";
    }

    if (!venueForm.capacity.max || Number(venueForm.capacity.max) < 1) {
      newErrors["capacity.max"] = "Maximum capacity must be at least 1";
    }

    if (venueForm.capacity.min && venueForm.capacity.max) {
      if (Number(venueForm.capacity.max) < Number(venueForm.capacity.min)) {
        newErrors["capacity.max"] = "Max capacity must be >= min capacity";
      }
    }

    if (!venueForm.pricing.basePrice || Number(venueForm.pricing.basePrice) < 0) {
      newErrors["pricing.basePrice"] = "Base price must be 0 or greater";
    }

    if (Object.keys(newErrors).length > 0) {
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
        contact: {
          phone: venueForm.contact.phone.trim(),
          email: venueForm.contact.email.trim(),
        },
        capacity: {
          min: Number(venueForm.capacity.min),
          max: Number(venueForm.capacity.max),
        },
        pricing: {
          basePrice: Number(venueForm.pricing.basePrice),
        },
        amenities: amenities,
        operatingHours: operatingHours,
        
        // Images and spaces
        images: venueImages
          .filter((img) => !img.uploading && !img.id.startsWith("temp-"))
          .map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
          })),
        spaces: spaces.map((space) => ({
          _id: space._id,
          name: space.name,
          description: space.description,
          capacity: space.capacity,
          price: space.price,
          isActive: space.isActive,
          images: (spaceImages[space._id] || [])
            .filter((img) => !img.uploading && !img.id.startsWith("temp-"))
            .map((img) => ({
              id: img.id,
              url: img.url,
              alt: img.alt,
            })),
        })),
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

  // FIXED: Handle venue image upload
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
        const response = await venueService.uploadImages(formData);
        console.log("✅ Venue image upload response:", response);

        const uploadedImage = response.images?.[0] || response.image || response;

        if (uploadedImage) {
          // Update with final URL from server
          setVenueImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? {
                    id: uploadedImage.id || uploadedImage._id || imageId,
                    url: uploadedImage.url || uploadedImage.path || tempUrl,
                    alt: uploadedImage.alt || file.name,
                    uploading: false,
                    progress: 100,
                  }
                : img
            )
          );
          toast.success("Image uploaded successfully");
        }
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

        const response = await venueService.uploadSpaceImages(
          spaceId,
          formData
        );
        const uploadedImage = response.images?.[0];

        if (uploadedImage) {
          setSpaceImages((prev) => ({
            ...prev,
            [spaceId]: (prev[spaceId] || []).map((img) =>
              img.id === imageId
                ? {
                    id: uploadedImage.id,
                    url: uploadedImage.url,
                    alt: uploadedImage.alt || file.name,
                    uploading: false,
                    progress: 100,
                  }
                : img
            ),
          }));
        }
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

  // Remove venue image with API call
  const handleRemoveVenueImage = async (imageId) => {
    try {
      // If it's a temporary image (starts with 'temp-'), just remove from state
      if (imageId.startsWith("temp-")) {
        setVenueImages((prev) => prev.filter((img) => img.id !== imageId));
        return;
      }

      // For uploaded images, call the API to delete
      await venueService.deleteImage(imageId);
      setVenueImages((prev) => prev.filter((img) => img.id !== imageId));
      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    }
  };

  // Remove space image with API call
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
      await venueService.deleteSpaceImage(spaceId, imageId);
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
                    className="bg-gray-50 dark:bg-gray-900"
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={userForm.phone}
                    onChange={handleUserChange}
                    placeholder="+1 (555) 123-4567"
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
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />

                  <Input
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password (min 6 characters)"
                    autoComplete="new-password"
                  />

                  <Input
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
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
                      placeholder="+1 (555) 000-0000"
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

                {/* Capacity & Pricing */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Capacity & Pricing
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="Minimum Capacity"
                      name="capacity.min"
                      type="number"
                      min="1"
                      value={venueForm.capacity.min}
                      onChange={handleVenueChange}
                      error={errors["capacity.min"]}
                      placeholder="50"
                    />
                    <Input
                      label="Maximum Capacity"
                      name="capacity.max"
                      type="number"
                      min="1"
                      value={venueForm.capacity.max}
                      onChange={handleVenueChange}
                      error={errors["capacity.max"]}
                      placeholder="500"
                    />
                    <Input
                      label="Base Price ($)"
                      name="pricing.basePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={venueForm.pricing.basePrice}
                      onChange={handleVenueChange}
                      error={errors["pricing.basePrice"]}
                      placeholder="5000.00"
                    />
                  </div>
                </div>

                {/* Venue Images Section - FIXED */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Venue Images
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Upload high-quality images of your venue. The first image will be used as the main photo.
                  </p>

                  <ImageUpload
                    onUpload={handleVenueImageUpload}
                    multiple={true}
                    className="mb-6"
                  />

                  <ImageGrid
                    images={venueImages}
                    onRemove={handleRemoveVenueImage}
                    onReorder={handleReorderVenueImages}
                    editable={true}
                  />

                  {venueImages.length === 0 && (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No images uploaded yet. Add some photos to showcase your venue.
                      </p>
                    </div>
                  )}
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
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Venue Amenities
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Add amenities that your venue offers
                  </p>

                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add amenity (e.g., WiFi, Parking, A/C)"
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddAmenity();
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      icon={Plus}
                      onClick={handleAddAmenity}
                    >
                      Add
                    </Button>
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
                      <p className="text-gray-500 dark:text-gray-400">
                        No amenities added yet. Add your first amenity above.
                      </p>
                    </div>
                  )}
                </div>

                {/* Operating Hours */}
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
                        label="Price ($)"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={spaceForm.price}
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

                    {/* Space Images */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                        Space Images
                      </h4>

                      <ImageUpload
                        onUpload={(files) =>
                          handleSpaceImageUpload(editingSpace?._id || "new-space", files)
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
                    </div>

                    <div className="flex gap-2 w-full justify-end">
                      <Button
                        onClick={handleAddSpace}
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
                                {space.capacity.min} - {space.capacity.max} guests
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 block mb-1">
                                Price
                              </span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                ${space.price.toLocaleString()}
                              </p>
                            </div>
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
    </div>
  );
};

export default VenueSettings;