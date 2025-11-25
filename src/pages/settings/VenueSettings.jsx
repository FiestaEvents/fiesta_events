import { useState, useEffect, useRef } from "react";
import { venueService, authService, venueSpacesService } from "../../api/index";
import { useToast } from "../../context/ToastContext.jsx";
import { useTranslation } from "react-i18next";
import Badge from "../../components/common/Badge";

import {
  Upload,
  Move,
  Save,
  User,
  Lock,
  Building2,
  CheckCircle2,
  Grid3x3,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Clock
} from "lucide-react";

// --- Constants ---
const DEFAULT_AMENITIES = [
  "WiFi", "Parking", "A/C & Heating", "Restrooms", "Bridal Suite",
  "Groom's Room", "Stage", "Dance Floor", "Sound System", "Lighting System",
  "Projector & Screen", "Microphones", "Kitchen Access", "Bar Area",
  "Outdoor Space", "Garden Area", "Patio", "Balcony", "Elevator",
  "Wheelchair Accessible", "Coat Check", "Valet Service", "Security",
  "Event Coordinator", "Setup & Cleanup", "Tables & Chairs", "Linens",
  "China & Glassware", "Catering Kitchen", "Liquor License", "DJ Booth",
  "Photo Booth Area", "Fireplace", "Waterfront View", "Mountain View",
  "City View", "Pool Access", "Beach Access", "Changing Rooms", "Storage Space"
];

// --- Reusable UI Components ---

const Input = ({ label, error, iconRight: IconRight, onIconClick, fullWidth, className = "", ...props }) => (
  <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        className={`w-full px-4 py-2.5 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500
        transition-all duration-200 shadow-sm
        ${error ? "border-red-500 focus:ring-red-200 focus:border-red-500" : "border-gray-300 dark:border-gray-700"}`}
        {...props}
      />
      {IconRight && (
        <button
          type="button"
          onClick={onIconClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <IconRight size={18} />
        </button>
      )}
    </div>
    {error && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {error}</p>}
  </div>
);

const Textarea = ({ label, error, className = "", ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
    )}
    <textarea
      className={`w-full px-4 py-3 text-sm rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-white
      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500
      transition-all duration-200 shadow-sm
      ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"}
      ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

const Button = ({ children, variant = "primary", icon: Icon, loading, className = "", ...props }) => {
  const baseStyles = "px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]";
  
  const variants = {
    primary: "bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500 shadow-orange-500/20",
    outline: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:ring-gray-500 bg-white dark:bg-transparent",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-red-500/20",
    ghost: "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-gray-900 shadow-none",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={loading} {...props}>
      {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : Icon ? <Icon size={18} /> : null}
      {children}
    </button>
  );
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
    <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
      <Icon className="w-8 h-8 text-orange-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-6 text-sm">{description}</p>
    {action}
  </div>
);

const ErrorAlert = ({ message }) => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Error</h3>
        <p className="text-sm text-red-700 dark:text-red-300 mt-1">{message}</p>
      </div>
    </div>
  </div>
);

// --- Image Components ---

const ImageUpload = ({ onUpload, multiple = true, className = "" }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e, status) => {
    e.preventDefault();
    setDragOver(status);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
    if (files.length > 0) onUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"));
    if (files.length > 0) onUpload(files);
    e.target.value = "";
  };

  return (
    <div
      className={`relative group border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
        ${dragOver ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10" : "border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"} 
        ${className}`}
      onDragOver={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
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
      
      <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Upload size={24} />
      </div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Click or drag images here</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP up to 10MB each</p>
    </div>
  );
};

const ImageGrid = ({ images, onRemove, onReorder, editable = true }) => {
  if (images.length === 0) return null;
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
      {images.map((image, index) => (
        <div key={image.id || index} className="group relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
          <img src={image.url} alt={image.alt || `Image ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          {editable && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
              <button 
                onClick={() => onRemove(image.id || image.url)} 
                className="p-2 bg-white/90 text-red-600 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg"
                title="Remove image"
              >
                <Trash2 size={16} />
              </button>
              {onReorder && index > 0 && (
                <button 
                  onClick={() => onReorder(index, index - 1)} 
                  className="p-2 bg-white/90 text-gray-700 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg"
                  title="Move left"
                >
                  <Move size={16} />
                </button>
              )}
              {onReorder && index < images.length - 1 && (
                <button 
                  onClick={() => onReorder(index, index + 1)} 
                  className="p-2 bg-white/90 text-gray-700 rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg"
                  title="Move right"
                >
                  <Move size={16} className="rotate-180" />
                </button>
              )}
            </div>
          )}
          {image.uploading && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-200">
              <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${image.progress || 0}%` }} />
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Uploading Images</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Please wait while we upload your images...</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-orange-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{Math.round(progress)}% complete</p>
      </div>
    </div>
  </div>
);

// --- Main Component ---

const VenueSettings = () => {
  const { t } = useTranslation();
  const toast = useToast();
  
  // State
  const [activeTab, setActiveTab] = useState("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // Data State
  const [user, setUser] = useState(null);
  const [venue, setVenue] = useState(null);
  const [venueImages, setVenueImages] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [spaceImages, setSpaceImages] = useState({});
  const [amenities, setAmenities] = useState([]);
  const [operatingHours, setOperatingHours] = useState({});
  
  // Forms
  const [userForm, setUserForm] = useState({ name: "", phone: "", avatar: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [venueForm, setVenueForm] = useState({ 
    name: "", description: "", 
    address: { street: "", city: "", state: "", zipCode: "", country: "" }, 
    contact: { phone: "", email: "" }, 
    capacity: { min: "", max: "" },
    pricing: { basePrice: "" } 
  });
  
  // Space Management
  const [editingSpace, setEditingSpace] = useState(null);
  const [spaceForm, setSpaceForm] = useState({ 
    name: "", description: "", capacity: { min: "", max: "" }, 
    basePrice: "", isActive: true 
  });
  
  // UI State
  const [newAmenity, setNewAmenity] = useState("");
  const [availableAmenities] = useState(DEFAULT_AMENITIES);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        const [userRes, venueRes] = await Promise.all([
          authService.getMe(),
          venueService.getMe(),
        ]);

        // Handle user data
        const userData = userRes.data?.user || userRes.user || userRes.data || userRes;
        if (userData) {
          setUser(userData);
          setUserForm({ name: userData.name || "", phone: userData.phone || "", avatar: userData.avatar || "" });
        }

        // Handle venue data
        const venueData = venueRes.data?.venue || venueRes.venue || venueRes.data || venueRes;
        if (venueData) {
          setVenue(venueData);
          setVenueForm({
            name: venueData.name || "",
            description: venueData.description || "",
            address: venueData.address || { street: "", city: "", state: "", zipCode: "", country: "" },
            contact: venueData.contact || { phone: "", email: "" },
            capacity: venueData.capacity || { min: "", max: "" },
            pricing: venueData.pricing || { basePrice: "" },
          });
          setAmenities(venueData.amenities || []);
          
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
          setOperatingHours(venueData.operatingHours || defaultHours);
          
          if (venueData.images) {
            setVenueImages(venueData.images.map((img, i) => ({ 
              id: img.id || img._id || `venue-img-${i}`, 
              url: img.url || img.path || img,
              alt: img.alt || `Venue image ${i + 1}`
            })));
          }
        }

        // Fetch spaces
        try {
          const spacesRes = await venueService.getSpaces();
          const spacesList = spacesRes.data?.spaces || spacesRes.spaces || spacesRes.data || spacesRes || [];
          setSpaces(Array.isArray(spacesList) ? spacesList : []);
          
          // Load space images
          const spaceImagesMap = {};
          spacesList.forEach((space) => {
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
          console.warn("Could not fetch spaces:", spacesError);
          setSpaces([]);
        }
        
      } catch (error) {
        console.error("Fetch error:", error);
        const errorMessage = error.message || t('venueSettings.notifications.error.loadFailed');
        setFetchError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t, toast]);

  // --- Handlers ---
  
  const handleUserChange = (e) => setUserForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handlePasswordChange = (e) => setPasswordForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const handleVenueChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [p, c] = name.split(".");
      setVenueForm(prev => ({ ...prev, [p]: { ...prev[p], [c]: value } }));
    } else {
      setVenueForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSpaceChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [p, c] = name.split(".");
      setSpaceForm(prev => ({ ...prev, [p]: { ...prev[p], [c]: value } }));
    } else {
      setSpaceForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setOperatingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  // Amenities Logic
  const handleAddAmenity = (amenity) => {
    if (!amenities.includes(amenity)) {
      setAmenities(prev => [...prev, amenity]);
      toast.success(t('venueSettings.notifications.success.amenityAdded'));
    } else {
      toast.info(t('venueSettings.notifications.error.amenityExists'));
    }
  };

  const handleAddCustomAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities(prev => [...prev, newAmenity.trim()]);
      setNewAmenity("");
      toast.success(t('venueSettings.notifications.success.customAmenityAdded'));
    } else if (amenities.includes(newAmenity.trim())) {
      toast.error(t('venueSettings.notifications.error.amenityExists'));
    }
  };

  const handleRemoveAmenity = (index) => {
    setAmenities(prev => prev.filter((_, i) => i !== index));
    toast.success(t('venueSettings.notifications.success.amenityRemoved'));
  };

  // Save Logic
  const handleSavePersonal = async () => {
    if (!userForm.name.trim()) {
      toast.error(t('venueSettings.validation.required'));
      return;
    }

    setSaving(true);
    try {
      await authService.updateProfile(userForm);
      toast.success(t('venueSettings.notifications.success.profileUpdated'));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || t('venueSettings.notifications.error.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error(t('venueSettings.validation.required'));
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error(t('venueSettings.validation.minLength', { min: 6 }));
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t('venueSettings.validation.passwordsMatch'));
      return;
    }

    setSaving(true);
    try {
      await authService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success(t('venueSettings.notifications.success.passwordChanged'));
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.message || t('venueSettings.notifications.error.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVenue = async () => {
    // Validation
    const newErrors = {};
    if (!venueForm.name.trim()) newErrors.name = t('venueSettings.validation.required');
    if (!venueForm.description.trim()) newErrors.description = t('venueSettings.validation.required');
    if (!venueForm.address.city.trim()) newErrors["address.city"] = t('venueSettings.validation.required');
    if (!venueForm.contact.phone.trim()) newErrors["contact.phone"] = t('venueSettings.validation.required');
    if (!venueForm.contact.email.trim()) {
      newErrors["contact.email"] = t('venueSettings.validation.required');
    } else if (!/^\S+@\S+\.\S+$/.test(venueForm.contact.email)) {
      newErrors["contact.email"] = t('venueSettings.validation.email');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('venueSettings.notifications.error.generic'));
      return;
    }

    setSaving(true);
    try {
      const submitData = {
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
        amenities,
        operatingHours,
      };

      const response = await venueService.update(submitData);
      const updatedVenue = response.data?.venue || response.venue || response.data || response;
      
      if (updatedVenue) {
        setVenue(updatedVenue);
        toast.success(t('venueSettings.notifications.success.venueUpdated'));
        setErrors({});
      }
    } catch (error) {
      console.error("Error updating venue:", error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
        toast.error(t('venueSettings.notifications.error.generic'));
      } else {
        toast.error(error.message || t('venueSettings.notifications.error.saveFailed'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSpace = async () => {
    if (!spaceForm.name.trim()) {
      toast.error(t('venueSettings.notifications.error.spaceNameRequired'));
      return;
    }
    if (!spaceForm.capacity.min || !spaceForm.capacity.max) {
      toast.error(t('venueSettings.notifications.error.capacityRequired'));
      return;
    }
    if (Number(spaceForm.capacity.max) < Number(spaceForm.capacity.min)) {
      toast.error(t('venueSettings.validation.capacityRange'));
      return;
    }
    if (!spaceForm.basePrice) {
      toast.error(t('venueSettings.notifications.error.priceRequired'));
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

      if (editingSpace) {
        await venueSpacesService.update(editingSpace._id, spaceData);
        toast.success(t('venueSettings.notifications.success.spaceUpdated'));
      } else {
        await venueSpacesService.create(spaceData);
        toast.success(t('venueSettings.notifications.success.spaceCreated'));
      }

      // Refresh spaces
      const res = await venueSpacesService.getAll();
      const spacesList = res.data?.spaces || res.spaces || res.data || res || [];
      setSpaces(Array.isArray(spacesList) ? spacesList : []);
      
      setEditingSpace(null);
      setSpaceForm({ name: "", description: "", capacity: { min: "", max: "" }, basePrice: "", isActive: true });
    } catch (error) {
      console.error("Error saving space:", error);
      toast.error(error.message || t('venueSettings.notifications.error.saveFailed'));
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteSpace = async (spaceId) => {
    if (window.confirm(t('venueSettings.notifications.confirm.deleteSpace'))) {
      try {
        await venueService.deleteVenueSpace(spaceId);
        setSpaces(prev => prev.filter(s => s._id !== spaceId));
        toast.success(t('venueSettings.notifications.success.spaceDeleted'));
      } catch (error) {
        console.error("Error deleting space:", error);
        toast.error(error.message || t('venueSettings.notifications.error.deleteFailed'));
      }
    }
  };

  const handleCancelEditSpace = () => {
    setEditingSpace(null);
    setSpaceForm({ name: "", description: "", capacity: { min: "", max: "" }, basePrice: "", isActive: true });
  };

  // Image Handlers
  const handleVenueImageUpload = async (files) => {
    setUploading(true);
    setUploadProgress(0);

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

      setVenueImages(prev => [...prev, tempImage]);

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setVenueImages(prev => prev.map(img => 
            img.id === imageId ? { ...img, progress } : img
          ));
          setUploadProgress(((i + progress / 100) / files.length) * 100);
        }

        // In production, upload to server here
        // const formData = new FormData();
        // formData.append("images", file);
        // const response = await venueService.uploadVenueImages(formData);

        setVenueImages(prev => prev.map(img =>
          img.id === imageId ? {
            id: `uploaded-${Date.now()}`,
            url: tempUrl,
            alt: file.name,
            uploading: false,
            progress: 100,
          } : img
        ));
        
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(t('venueSettings.notifications.error.uploadFailed'));
        setVenueImages(prev => prev.filter(img => img.id !== imageId));
      }
    }

    setUploading(false);
    setUploadProgress(0);
    toast.success(t('venueSettings.notifications.success.imageUploaded'));
  };

  const handleRemoveVenueImage = async (imageId) => {
    try {
      if (imageId.startsWith("temp-") || imageId.startsWith("uploaded-")) {
        setVenueImages(prev => prev.filter(img => img.id !== imageId));
        return;
      }
      // In production: await venueService.deleteVenueImage(imageId);
      setVenueImages(prev => prev.filter(img => img.id !== imageId));
      toast.success(t('venueSettings.notifications.success.imageRemoved'));
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error(t('venueSettings.notifications.error.deleteFailed'));
    }
  };

  const handleReorderVenueImages = (fromIndex, toIndex) => {
    setVenueImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages;
    });
  };

  const handleSpaceImageUpload = async (files, spaceId) => {
    if (!spaceId || spaceId === "new-space") {
      toast.error(t('venueSettings.notifications.error.saveSpaceFirst'));
      return;
    }

    setUploading(true);
    // Similar implementation as venue images
    toast.success(t('venueSettings.notifications.success.imageUploaded'));
    setUploading(false);
  };

  const tabs = [
    { id: "personal", label: t('venueSettings.tabs.personal'), icon: User },
    { id: "security", label: t('venueSettings.tabs.security'), icon: Lock },
    { id: "venue", label: t('venueSettings.tabs.venue'), icon: Building2 },
    { id: "amenities", label: t('venueSettings.tabs.amenities'), icon: CheckCircle2 },
    { id: "spaces", label: t('venueSettings.tabs.spaces'), icon: Grid3x3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('venueSettings.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full bg-white dark:bg-gray-900 p-6">
        <div className="max-w-2xl mx-auto">
          <ErrorAlert message={fetchError} />
          <Button onClick={() => window.location.reload()} variant="outline">
            {t('venueSettings.common.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header Background */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-16 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('venueSettings.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('venueSettings.subtitle')}</p>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex space-x-1 overflow-x-auto pb-[-1px] scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200
                    ${isActive 
                      ? "border-orange-500 text-orange-600 dark:text-orange-400" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200"}
                  `}
                >
                  <Icon size={16} className={isActive ? "text-orange-500" : "text-gray-400 group-hover:text-gray-500"} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* === Personal Tab === */}
        {activeTab === "personal" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 mx-auto">
                    <img 
                      src={userForm.avatar || "https://via.placeholder.com/150"} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                    />
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
                <div className="flex justify-center">
                  <Badge variant="purple">Venue Owner</Badge>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="md:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Profile Details</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input label={t('venueSettings.personal.fields.fullName')} name="name" value={userForm.name} onChange={handleUserChange} />
                    <Input label={t('venueSettings.personal.fields.phone')} name="phone" value={userForm.phone} onChange={handleUserChange} />
                  </div>
                  <Input label={t('venueSettings.personal.fields.email')} value={user?.email} disabled className="opacity-75 cursor-not-allowed" />
                  <Input label="Avatar URL" name="avatar" value={userForm.avatar} onChange={handleUserChange} placeholder="https://..." />
                </div>
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                  <Button onClick={handleSavePersonal} loading={saving} icon={Save}>{t('venueSettings.personal.save')}</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === Security Tab === */}
        {activeTab === "security" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Lock className="text-orange-500" size={20}/>
                  {t('venueSettings.security.title')}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{t('venueSettings.security.description')}</p>
              </div>
              <div className="p-6 space-y-6">
                <Input 
                  label={t('venueSettings.security.fields.currentPassword')}
                  name="currentPassword"
                  type={showPassword.current ? "text" : "password"} 
                  value={passwordForm.currentPassword}
                  iconRight={showPassword.current ? EyeOff : Eye}
                  onIconClick={() => setShowPassword(p => ({...p, current: !p.current}))}
                  onChange={handlePasswordChange}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input 
                    label={t('venueSettings.security.fields.newPassword')}
                    name="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    iconRight={showPassword.new ? EyeOff : Eye}
                    onIconClick={() => setShowPassword(p => ({...p, new: !p.new}))}
                    onChange={handlePasswordChange}
                  />
                  <Input 
                    label={t('venueSettings.security.fields.confirmPassword')}
                    name="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    iconRight={showPassword.confirm ? EyeOff : Eye}
                    onIconClick={() => setShowPassword(p => ({...p, confirm: !p.confirm}))}
                    onChange={handlePasswordChange}
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-300 p-4 rounded-lg text-sm leading-relaxed">
                  <p className="font-semibold mb-1">Password Requirements:</p>
                  <ul className="list-disc list-inside opacity-80">
                    <li>At least 6 characters long</li>
                    <li>Include uppercase and lowercase letters</li>
                    <li>New password must match confirm password</li>
                  </ul>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
                <Button onClick={handleChangePassword} loading={saving} icon={Lock}>Update Password</Button>
              </div>
            </div>
          </div>
        )}

        {/* === Venue Info Tab === */}
        {activeTab === "venue" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Basic Information</h2>
              <div className="space-y-6">
                <Input 
                  label="Venue Name" 
                  name="name" 
                  value={venueForm.name} 
                  onChange={handleVenueChange}
                  error={errors.name}
                  placeholder="e.g. The Grand Ballroom" 
                />
                <Textarea 
                  label="Description" 
                  name="description" 
                  value={venueForm.description} 
                  onChange={handleVenueChange}
                  error={errors.description}
                  rows={4} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Location</h2>
                <div className="space-y-4">
                  <Input 
                    label="Street Address" 
                    name="address.street" 
                    value={venueForm.address.street} 
                    onChange={handleVenueChange} 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="City" 
                      name="address.city" 
                      value={venueForm.address.city} 
                      onChange={handleVenueChange}
                      error={errors["address.city"]}
                    />
                    <Input 
                      label="State" 
                      name="address.state" 
                      value={venueForm.address.state} 
                      onChange={handleVenueChange} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Zip Code" 
                      name="address.zipCode" 
                      value={venueForm.address.zipCode} 
                      onChange={handleVenueChange} 
                    />
                    <Input 
                      label="Country" 
                      name="address.country" 
                      value={venueForm.address.country} 
                      onChange={handleVenueChange} 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <Input 
                    label="Contact Phone" 
                    name="contact.phone" 
                    value={venueForm.contact.phone} 
                    onChange={handleVenueChange}
                    error={errors["contact.phone"]}
                  />
                  <Input 
                    label="Contact Email" 
                    name="contact.email" 
                    value={venueForm.contact.email} 
                    onChange={handleVenueChange}
                    error={errors["contact.email"]}
                  />
                </div>
              </div>
            </div>

            {/* Venue Images */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Venue Gallery</h2>
              <ImageUpload onUpload={handleVenueImageUpload} />
              <ImageGrid 
                images={venueImages} 
                onRemove={handleRemoveVenueImage}
                onReorder={handleReorderVenueImages}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveVenue} loading={saving} icon={Save} className="w-full sm:w-auto px-8 py-3 shadow-lg">
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* === Amenities Tab === */}
        {activeTab === "amenities" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Amenities & Features</h2>
                <p className="text-gray-500 text-sm mt-1">Select all features available at your venue.</p>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Selected Amenities */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Active Amenities ({amenities.length})
                    </h3>
                    {amenities.length > 0 && (
                      <Button
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => {
                          if (window.confirm("Clear all amenities?")) {
                            setAmenities([]);
                            toast.success("All amenities cleared");
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[100px]">
                    {amenities.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((amenity, idx) => (
                          <Badge 
                            key={idx} 
                            variant="purple" 
                            size="md" 
                            onRemove={() => handleRemoveAmenity(idx)}
                            className="pl-3 pr-2 py-1.5"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                        <CheckCircle2 size={32} className="mb-2 opacity-30"/>
                        <span className="text-sm">No amenities selected yet.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Add */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Add</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableAmenities.filter(a => !amenities.includes(a)).slice(0, 20).map(amenity => (
                      <button 
                        key={amenity}
                        onClick={() => handleAddAmenity(amenity)}
                        className="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-full hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-gray-700 dark:hover:text-white transition-colors flex items-center gap-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                      >
                        <Plus size={14} /> {amenity}
                      </button>
                    ))}
                  </div>
                  {availableAmenities.filter(a => !amenities.includes(a)).length > 20 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddAmenity(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="mt-3 w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">More amenities...</option>
                      {availableAmenities.filter(a => !amenities.includes(a)).slice(20).map(amenity => (
                        <option key={amenity} value={amenity}>{amenity}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Custom Amenity */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Custom Amenity</h3>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. Helicopter Pad" 
                      value={newAmenity} 
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomAmenity();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddCustomAmenity} 
                      variant="outline" 
                      icon={Plus}
                      disabled={!newAmenity.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Operating Hours</h2>
                <p className="text-gray-500 text-sm mt-1">Set your venue's availability schedule.</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="w-32">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {t(`venueSettings.amenities.operatingHours.days.${day}`)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="time"
                          value={operatingHours[day]?.open || "09:00"}
                          onChange={(e) => handleOperatingHoursChange(day, "open", e.target.value)}
                          disabled={operatingHours[day]?.closed}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        />
                        <span className="text-gray-500 dark:text-gray-400 text-sm">to</span>
                        <input
                          type="time"
                          value={operatingHours[day]?.close || "17:00"}
                          onChange={(e) => handleOperatingHoursChange(day, "close", e.target.value)}
                          disabled={operatingHours[day]?.closed}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={operatingHours[day]?.closed || false}
                          onChange={(e) => handleOperatingHoursChange(day, "closed", e.target.checked)}
                          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Closed</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveVenue} loading={saving} icon={Save} className="px-8 py-3 shadow-lg">
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* === Spaces Tab === */}
        {activeTab === "spaces" && (
          <div className="space-y-8 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm overflow-hidden">


            {/* Existing Spaces List */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                Existing Spaces 
                {spaces.length > 0 && (
                  <Badge variant="secondary" rounded="full">{spaces.length}</Badge>
                )}
              </h3>
              
              {spaces.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {spaces.map(space => (
                    <div 
                      key={space._id} 
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow group relative"
                    >
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-gray-900 dark:text-white text-lg">{space.name}</h4>
                       <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditSpace(space)} 
                          className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
                          title="Edit space"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSpace(space._id)}
                          className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
                          title="Delete space"
                        >
                          <Trash2 size={16} />
                        </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          variant={space.isActive ? 'success' : 'danger'} 
                          dot 
                          size="sm"
                        >
                          {space.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                        {space.description || "No description provided."}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 uppercase font-semibold">Capacity</span>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {space.capacity.min} - {space.capacity.max} Guests
                          </span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-xs text-gray-400 uppercase font-semibold">Starting at</span>
                          <span className="text-lg font-bold text-orange-600">
                            {space.basePrice?.toLocaleString() || "0"} TND
                          </span>
                        </div>
                      </div>

                      {/* Space Images */}
                      {spaceImages[space._id] && spaceImages[space._id].length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                          <ImageGrid 
                            images={spaceImages[space._id]} 
                            onRemove={(imgId) => {/* handle remove */}}
                            editable={false}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon={Grid3x3} 
                  title="No Spaces Added" 
                  description="Start by adding your first venue space (e.g., Main Hall, Garden) using the form above." 
                />
              )}
            </div>

            {/* Add/Edit Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-orange-50/30 dark:bg-orange-900/10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editingSpace ? "Edit Space" : "Add New Space"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingSpace ? "Update the details below" : "Create a new bookable space"}
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Space Name" 
                    name="name" 
                    value={spaceForm.name} 
                    onChange={handleSpaceChange} 
                    placeholder="e.g. Grand Hall" 
                  />
                  <Input 
                    label="Base Price (TND)" 
                    name="basePrice" 
                    type="number" 
                    step="0.01"
                    value={spaceForm.basePrice} 
                    onChange={handleSpaceChange} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Min Capacity" 
                    name="capacity.min" 
                    type="number" 
                    value={spaceForm.capacity.min} 
                    onChange={handleSpaceChange} 
                  />
                  <Input 
                    label="Max Capacity" 
                    name="capacity.max" 
                    type="number" 
                    value={spaceForm.capacity.max} 
                    onChange={handleSpaceChange} 
                  />
                </div>
                <Textarea 
                  label="Description" 
                  name="description" 
                  value={spaceForm.description} 
                  onChange={handleSpaceChange} 
                  rows={2} 
                />
                
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <input 
                      type="checkbox" 
                      name="isActive" 
                      checked={spaceForm.isActive} 
                      onChange={handleSpaceChange} 
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" 
                    />
                    <div>
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">Available for Booking</span>
                      <span className="block text-xs text-gray-500">Uncheck to hide this space from clients</span>
                    </div>
                  </label>
                  <div className="flex gap-3">
                    {editingSpace && (
                      <Button 
                        variant="ghost" 
                        onClick={handleCancelEditSpace}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      onClick={handleSaveSpace} 
                      loading={saving} 
                      icon={editingSpace ? Save : Plus}
                    >
                      {editingSpace ? "Update Space" : "Create Space"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Upload Progress Overlay */}
      {uploading && <ProgressOverlay progress={uploadProgress} />}
    </div>
  );
};

export default VenueSettings;