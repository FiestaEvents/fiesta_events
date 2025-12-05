import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { venueService, authService, venueSpacesService } from "../../api/index";
import { useToast } from "../../context/ToastContext.jsx";
import { useTranslation } from "react-i18next";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";
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
  Clock,
  Camera,
  MapPin,
  Phone,
  Mail,
  Users,
  DollarSign,
  X,
} from "lucide-react";

// ============================================================
// CONSTANTS
// ============================================================
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

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DEFAULT_HOURS = {
  monday: { open: "09:00", close: "22:00", closed: false },
  tuesday: { open: "09:00", close: "22:00", closed: false },
  wednesday: { open: "09:00", close: "22:00", closed: false },
  thursday: { open: "09:00", close: "22:00", closed: false },
  friday: { open: "09:00", close: "22:00", closed: false },
  saturday: { open: "09:00", close: "22:00", closed: false },
  sunday: { open: "09:00", close: "22:00", closed: true },
};

const INITIAL_USER_FORM = { name: "", phone: "", avatar: "" };
const INITIAL_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
const INITIAL_VENUE_FORM = {
  name: "",
  description: "",
  address: { street: "", city: "", state: "", zipCode: "", country: "" },
  contact: { phone: "", email: "" },
  capacity: { min: "", max: "" },
  pricing: { basePrice: "" },
};
const INITIAL_SPACE_FORM = {
  name: "",
  description: "",
  capacity: { min: "", max: "" },
  basePrice: "",
  isActive: true,
};

// ============================================================
// CUSTOM HOOK
// ============================================================
const useVenueSettingsData = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    user: null,
    venue: null,
    spaces: [],
    venueImages: [],
    spaceImages: {},
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [userRes, venueRes] = await Promise.all([
        authService.getMe().catch(() => null),
        venueService.getMe().catch(() => null),
      ]);

      const userData =
        userRes?.data?.user || userRes?.user || userRes?.data || userRes;
      const venueData =
        venueRes?.data?.venue || venueRes?.venue || venueRes?.data || venueRes;

      let spacesData = [];
      let spaceImagesMap = {};

      try {
        const spacesRes = await venueSpacesService.getAll();
        const spacesList =
          spacesRes?.data?.spaces ||
          spacesRes?.spaces ||
          spacesRes?.data ||
          spacesRes ||
          [];
        spacesData = Array.isArray(spacesList) ? spacesList : [];

        spacesData.forEach((space) => {
          if (space.images?.length > 0) {
            spaceImagesMap[space._id] = space.images.map((img, idx) => ({
              id: img.id || img._id || `space-${space._id}-img-${idx}`,
              url: img.url || img.path || img,
              alt: img.alt || `${space.name} image ${idx + 1}`,
            }));
          }
        });
      } catch (e) {
        console.warn("Spaces not available:", e.message);
      }

      const venueImages =
        venueData?.images?.map((img, i) => ({
          id: img.id || img._id || `venue-img-${i}`,
          url: img.url || img.path || img,
          alt: img.alt || `Venue image ${i + 1}`,
        })) || [];

      setData({
        user: userData,
        venue: venueData,
        spaces: spacesData,
        venueImages,
        spaceImages: spaceImagesMap,
      });
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage = err.message || t("venueSettings.errors.loadFailed");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refetch: fetchData, setData };
};

// ============================================================
// UI COMPONENTS
// ============================================================
const Card = ({ children, className = "", title, description, actions }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 ${className}`}>
    {(title || description || actions) && (
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Input = ({
  label,
  error,
  iconRight: IconRight,
  onIconClick,
  fullWidth,
  className = "",
  ...props
}) => (
  <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      <input
        className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-white text-gray-900 
        placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
        transition-all duration-200
        ${error ? "border-red-300 focus:ring-red-200 focus:border-red-500" : "border-gray-200 hover:border-gray-300"}`}
        {...props}
      />
      {IconRight && (
        <button
          type="button"
          onClick={onIconClick}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IconRight size={18} />
        </button>
      )}
    </div>
    {error && (
      <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

const Textarea = ({ label, error, className = "", ...props }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-gray-700">{label}</label>
    )}
    <textarea
      className={`w-full px-4 py-3 text-sm rounded-xl border bg-white text-gray-900
      placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500
      transition-all duration-200 resize-none
      ${error ? "border-red-300" : "border-gray-200 hover:border-gray-300"} ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

const Button = ({
  children,
  variant = "primary",
  icon: Icon,
  loading,
  size = "md",
  type = "button",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
  };

  const variants = {
    primary:
      "bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500 shadow-sm shadow-orange-500/25",
    secondary: "bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-500",
    outline:
      "border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-500 bg-white",
    danger:
      "bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-sm shadow-red-500/25",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  return (
    <button
      type={type}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && <Icon size={size === "sm" ? 14 : 18} />
      )}
      {children}
    </button>
  );
};

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
    <div className="p-4 bg-orange-50 rounded-2xl mb-4">
      <Icon className="w-8 h-8 text-orange-500" />
    </div>
    <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
    <p className="text-gray-500 text-center max-w-sm mb-6 text-sm">
      {description}
    </p>
    {action}
  </div>
);

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group inline-flex items-center gap-2.5 px-5 py-3.5 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200
      ${
        active
          ? "border-orange-500 text-orange-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
  >
    <Icon
      size={18}
      className={
        active ? "text-orange-500" : "text-gray-400 group-hover:text-gray-500"
      }
    />
    {label}
  </button>
);

// ============================================================
// TAB COMPONENTS
// ============================================================

// --- Personal Tab ---
const PersonalTab = ({ user, userForm, setUserForm, onSave, saving, t }) => {
  const handleChange = (e) =>
    setUserForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-gray-100 mx-auto">
              <img
                src={
                  userForm.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=F18237&color=fff&size=128`
                }
                alt={t("venueSettings.personal.profilePicture")}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=U&background=F18237&color=fff&size=128`;
                }}
              />
            </div>
            {/* Visual button only, actual change happens via input below */}
            <div className="absolute bottom-0 right-0 p-2 bg-orange-500 text-white rounded-xl shadow-lg">
              <Camera size={16} />
            </div>
          </div>
          <h3 className="font-bold text-gray-900 text-xl">{user?.name}</h3>
          <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
          <Badge variant="purple" size="md" className="mx-auto">
            {t("venueSettings.personal.venueOwner")}
          </Badge>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-gray-400" />
              <span className="text-gray-600 truncate">{user?.email}</span>
            </div>
            {userForm.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-600">{userForm.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <Card
          title={t("venueSettings.personal.title")}
          description={t("venueSettings.personal.description")}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label={t("venueSettings.personal.fields.fullName")}
                name="name"
                value={userForm.name}
                onChange={handleChange}
                placeholder={t("venueSettings.personal.placeholders.fullName")}
              />
              <Input
                label={t("venueSettings.personal.fields.phone")}
                name="phone"
                value={userForm.phone}
                onChange={handleChange}
                placeholder={t("venueSettings.personal.placeholders.phone")}
              />
            </div>
            <Input
              label={t("venueSettings.personal.fields.email")}
              value={user?.email}
              disabled
              className="opacity-60"
            />
            
            {/* Avatar Input Section */}
            <div>
              <Input
                label={t("venueSettings.personal.fields.avatar")}
                name="avatar"
                value={userForm.avatar}
                onChange={handleChange}
                placeholder={t("venueSettings.personal.placeholders.avatar")}
              />
              {/* Recommendation Link */}
              <p className="mt-2 text-xs text-gray-500">
                Need an avatar? Try{" "}
                <a
                  href="https://avatar-placeholder.iran.liara.run/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 underline"
                >
                  avatar-placeholder.iran.liara.run
                </a>
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
            <Button onClick={onSave} loading={saving} icon={Save}>
              {t("venueSettings.common.saveChanges")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Security Tab ---
const SecurityTab = ({ passwordForm, setPasswordForm, onSave, saving, t }) => {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const handleChange = (e) =>
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const toggleShow = (field) =>
    setShowPassword((p) => ({ ...p, [field]: !p[field] }));

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: "", color: "" };
    if (password.length < 6)
      return {
        level: 1,
        text: t("venueSettings.security.strength.tooShort"),
        color: "bg-red-500",
      };
    if (password.length < 8)
      return {
        level: 2,
        text: t("venueSettings.security.strength.weak"),
        color: "bg-orange-500",
      };
    if (
      password.length < 12 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    )
      return {
        level: 3,
        text: t("venueSettings.security.strength.good"),
        color: "bg-yellow-500",
      };
    if (
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    )
      return {
        level: 4,
        text: t("venueSettings.security.strength.strong"),
        color: "bg-green-500",
      };
    return {
      level: 2,
      text: t("venueSettings.security.strength.fair"),
      color: "bg-yellow-500",
    };
  };

  const strength = getPasswordStrength(passwordForm.newPassword);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Lock size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("venueSettings.security.title")}
              </h3>
              <p className="text-sm text-gray-500">
                {t("venueSettings.security.description")}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <Input
            label={t("venueSettings.security.fields.currentPassword")}
            name="currentPassword"
            type={showPassword.current ? "text" : "password"}
            value={passwordForm.currentPassword}
            iconRight={showPassword.current ? EyeOff : Eye}
            onIconClick={() => toggleShow("current")}
            onChange={handleChange}
            placeholder={t(
              "venueSettings.security.placeholders.currentPassword"
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Input
                label={t("venueSettings.security.fields.newPassword")}
                name="newPassword"
                type={showPassword.new ? "text" : "password"}
                value={passwordForm.newPassword}
                iconRight={showPassword.new ? EyeOff : Eye}
                onIconClick={() => toggleShow("new")}
                onChange={handleChange}
                placeholder={t(
                  "venueSettings.security.placeholders.newPassword"
                )}
              />
              {passwordForm.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength.level ? strength.color : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">{strength.text}</p>
                </div>
              )}
            </div>
            <Input
              label={t("venueSettings.security.fields.confirmPassword")}
              name="confirmPassword"
              type={showPassword.confirm ? "text" : "password"}
              value={passwordForm.confirmPassword}
              iconRight={showPassword.confirm ? EyeOff : Eye}
              onIconClick={() => toggleShow("confirm")}
              onChange={handleChange}
              placeholder={t(
                "venueSettings.security.placeholders.confirmPassword"
              )}
              error={
                passwordForm.confirmPassword &&
                passwordForm.newPassword !== passwordForm.confirmPassword
                  ? t("venueSettings.validation.passwordMismatch")
                  : ""
              }
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="font-medium text-blue-900 text-sm mb-2">
              {t("venueSettings.security.requirements.title")}
            </p>
            <ul className="space-y-1.5 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <CheckCircle2
                  size={14}
                  className={
                    passwordForm.newPassword?.length >= 6
                      ? "text-green-600"
                      : "text-blue-400"
                  }
                />
                {t("venueSettings.security.requirements.minLength")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  size={14}
                  className={
                    /[A-Z]/.test(passwordForm.newPassword)
                      ? "text-green-600"
                      : "text-blue-400"
                  }
                />
                {t("venueSettings.security.requirements.uppercase")}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2
                  size={14}
                  className={
                    /[0-9]/.test(passwordForm.newPassword)
                      ? "text-green-600"
                      : "text-blue-400"
                  }
                />
                {t("venueSettings.security.requirements.number")}
              </li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <Button onClick={onSave} loading={saving} icon={Lock}>
            {t("venueSettings.security.updatePassword")}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Venue Tab ---
const VenueTab = ({ venueForm, setVenueForm, errors, onSave, saving, t }) => {
  const handleChange = (e) => {
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
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-xl">
              <Building2 size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("venueSettings.venue.basicInfo.title")}
              </h3>
              <p className="text-sm text-gray-500">
                {t("venueSettings.venue.basicInfo.description")}
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <Input
            label={t("venueSettings.venue.fields.name")}
            name="name"
            value={venueForm.name}
            onChange={handleChange}
            error={errors.name}
            placeholder={t("venueSettings.venue.placeholders.name")}
          />
          <Textarea
            label={t("venueSettings.venue.fields.description")}
            name="description"
            value={venueForm.description}
            onChange={handleChange}
            error={errors.description}
            rows={4}
            placeholder={t("venueSettings.venue.placeholders.description")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <MapPin size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("venueSettings.venue.location.title")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("venueSettings.venue.location.description")}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Input
              label={t("venueSettings.venue.fields.street")}
              name="address.street"
              value={venueForm.address.street}
              onChange={handleChange}
              placeholder={t("venueSettings.venue.placeholders.street")}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("venueSettings.venue.fields.city")}
                name="address.city"
                value={venueForm.address.city}
                onChange={handleChange}
                error={errors["address.city"]}
                placeholder={t("venueSettings.venue.placeholders.city")}
              />
              <Input
                label={t("venueSettings.venue.fields.state")}
                name="address.state"
                value={venueForm.address.state}
                onChange={handleChange}
                placeholder={t("venueSettings.venue.placeholders.state")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("venueSettings.venue.fields.zipCode")}
                name="address.zipCode"
                value={venueForm.address.zipCode}
                onChange={handleChange}
                placeholder={t("venueSettings.venue.placeholders.zipCode")}
              />
              <Input
                label={t("venueSettings.venue.fields.country")}
                name="address.country"
                value={venueForm.address.country}
                onChange={handleChange}
                placeholder={t("venueSettings.venue.placeholders.country")}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <Phone size={20} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("venueSettings.venue.contact.title")}
                </h3>
                <p className="text-sm text-gray-500">
                  {t("venueSettings.venue.contact.description")}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Input
              label={t("venueSettings.venue.fields.phone")}
              name="contact.phone"
              value={venueForm.contact.phone}
              onChange={handleChange}
              error={errors["contact.phone"]}
              placeholder={t("venueSettings.venue.placeholders.phone")}
            />
            <Input
              label={t("venueSettings.venue.fields.email")}
              name="contact.email"
              type="email"
              value={venueForm.contact.email}
              onChange={handleChange}
              error={errors["contact.email"]}
              placeholder={t("venueSettings.venue.placeholders.email")}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave} loading={saving} icon={Save} size="lg">
          {t("venueSettings.common.saveChanges")}
        </Button>
      </div>
    </div>
  );
};

// --- Amenities Tab ---
const AmenitiesTab = ({
  amenities,
  setAmenities,
  operatingHours,
  setOperatingHours,
  onSave,
  saving,
  t,
  toast,
}) => {
  const [newAmenity, setNewAmenity] = useState("");
  const [activeSection, setActiveSection] = useState("amenities");
  const [saveState, setSaveState] = useState("idle");

  const availableToAdd = useMemo(
    () => DEFAULT_AMENITIES.filter((a) => !amenities.includes(a)),
    [amenities]
  );

  const autoSave = async (newAmenities) => {
    setSaveState("saving");
    try {
      await venueService.update({ amenities: newAmenities, operatingHours });
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (err) {
      setSaveState("idle");
      toast.error(err.message || t("venueSettings.errors.saveFailed"));
      throw err;
    }
  };

  const handleAddAmenity = async (amenity) => {
    if (!amenities.includes(amenity)) {
      const newAmenities = [...amenities, amenity];
      setAmenities(newAmenities);

      try {
        await autoSave(newAmenities);
      } catch (err) {
        setAmenities(amenities);
      }
    }
  };

  const handleRemoveAmenity = async (index) => {
    const oldAmenities = amenities;
    const newAmenities = amenities.filter((_, i) => i !== index);
    setAmenities(newAmenities);

    try {
      await autoSave(newAmenities);
    } catch (err) {
      setAmenities(oldAmenities);
    }
  };

  const handleClearAll = async () => {
    const oldAmenities = amenities;
    setAmenities([]);

    try {
      await autoSave([]);
    } catch (err) {
      setAmenities(oldAmenities);
    }
  };

  const handleAddCustom = async (e) => {
    e?.preventDefault?.();
    const trimmed = newAmenity.trim();
    if (trimmed && !amenities.includes(trimmed)) {
      const newAmenities = [...amenities, trimmed];
      setAmenities(newAmenities);
      setNewAmenity("");

      try {
        await autoSave(newAmenities);
      } catch (err) {
        setAmenities(amenities);
        setNewAmenity(trimmed);
      }
    }
  };

  const handleHoursChange = (day, field, value) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const setAllDaysOpen = () => {
    const newHours = {};
    DAYS_OF_WEEK.forEach((day) => {
      newHours[day] = { open: "09:00", close: "22:00", closed: false };
    });
    setOperatingHours(newHours);
  };

  const setWeekdaysOnly = () => {
    const newHours = { ...operatingHours };
    DAYS_OF_WEEK.slice(0, 5).forEach((day) => {
      newHours[day] = { ...newHours[day], closed: false };
    });
    DAYS_OF_WEEK.slice(5).forEach((day) => {
      newHours[day] = { ...newHours[day], closed: true };
    });
    setOperatingHours(newHours);
  };

  const setWeekendsOnly = () => {
    const newHours = { ...operatingHours };
    DAYS_OF_WEEK.slice(5).forEach((day) => {
      newHours[day] = { ...newHours[day], closed: false };
    });
    DAYS_OF_WEEK.slice(0, 5).forEach((day) => {
      newHours[day] = { ...newHours[day], closed: true };
    });
    setOperatingHours(newHours);
  };

  const openDaysCount = useMemo(
    () => DAYS_OF_WEEK.filter((day) => !operatingHours[day]?.closed).length,
    [operatingHours]
  );

  return (
    <div className="space-y-6">
      {/* Subtle Save Indicator */}
      <div className="fixed top-20 right-6 z-50">
        {saveState === "saving" && (
          <div className="bg-white border border-gray-200 shadow-lg px-3 py-2 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-600">
              {t("venueSettings.common.saving")}
            </span>
          </div>
        )}
        {saveState === "saved" && (
          <div className="bg-white border border-green-200 shadow-lg px-3 py-2 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-sm text-gray-600">
              {t("venueSettings.common.saved")}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-1.5 inline-flex gap-1">
        <button
          type="button"
          onClick={() => setActiveSection("amenities")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeSection === "amenities"
              ? "bg-orange-500 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <CheckCircle2 size={16} />
          {t("venueSettings.amenities.title")}
          {amenities.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                activeSection === "amenities" ? "bg-white/20" : "bg-gray-200"
              }`}
            >
              {amenities.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveSection("hours")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeSection === "hours"
              ? "bg-orange-500 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Clock size={16} />
          {t("venueSettings.amenities.operatingHours.title")}
          <span
            className={`px-2 py-0.5 rounded-full text-xs ${
              activeSection === "hours" ? "bg-white/20" : "bg-gray-200"
            }`}
          >
            {openDaysCount}/7
          </span>
        </button>
      </div>

      {activeSection === "amenities" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("venueSettings.amenities.subtitle")}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {t("venueSettings.amenities.description")}
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  {t("venueSettings.amenities.selected")} ({amenities.length})
                </h4>
                {amenities.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <Trash2 size={14} /> {t("venueSettings.common.clearAll")}
                  </button>
                )}
              </div>
              <div className="min-h-[60px] flex flex-wrap gap-2">
                {amenities.length > 0 ? (
                  amenities.map((a, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-100"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(idx)}
                        className="hover:text-orange-900 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))
                ) : (
                  <div className="w-full flex items-center justify-center text-gray-400 py-4 border-2 border-dashed border-gray-200 rounded-xl">
                    <span className="text-sm">
                      {t("venueSettings.amenities.clickToAdd")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {t("venueSettings.amenities.quickAdd")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableToAdd.map((amenity) => (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => handleAddAmenity(amenity)}
                    className="px-3 py-1.5 text-sm border border-gray-200 rounded-full hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all flex items-center gap-1.5 bg-white text-gray-600"
                  >
                    <Plus size={14} /> {amenity}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                {t("venueSettings.amenities.addCustom")}
              </h4>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder={t(
                      "venueSettings.amenities.placeholders.custom"
                    )}
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustom();
                      }
                    }}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddCustom}
                  variant="outline"
                  icon={Plus}
                  disabled={!newAmenity.trim()}
                >
                  {t("venueSettings.common.add")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === "hours" && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("venueSettings.amenities.operatingHours.title")}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {t("venueSettings.amenities.operatingHours.description")}
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                type="button"
                onClick={setAllDaysOpen}
                className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                {t("venueSettings.amenities.operatingHours.allDays")}
              </button>
              <button
                type="button"
                onClick={setWeekdaysOnly}
                className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {t("venueSettings.amenities.operatingHours.weekdays")}
              </button>
              <button
                type="button"
                onClick={setWeekendsOnly}
                className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                {t("venueSettings.amenities.operatingHours.weekends")}
              </button>
            </div>

            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const isClosed = operatingHours[day]?.closed;
                return (
                  <div
                    key={day}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      isClosed
                        ? "bg-gray-50 border-gray-100"
                        : "bg-white border-gray-200 hover:border-orange-200"
                    }`}
                  >
                    <div className="w-24">
                      <span
                        className={`text-sm font-semibold capitalize ${isClosed ? "text-gray-400" : "text-gray-900"}`}
                      >
                        {t(
                          `venueSettings.amenities.operatingHours.days.${day}`
                        )}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 flex-1 ${isClosed ? "opacity-40" : ""}`}
                    >
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                        <Clock size={14} className="text-gray-400" />
                        <input
                          type="time"
                          value={operatingHours[day]?.open || "09:00"}
                          onChange={(e) =>
                            handleHoursChange(day, "open", e.target.value)
                          }
                          disabled={isClosed}
                          className="bg-transparent text-sm text-gray-900 focus:outline-none disabled:cursor-not-allowed w-20"
                        />
                      </div>
                      <span className="text-gray-400 text-sm">→</span>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5">
                        <input
                          type="time"
                          value={operatingHours[day]?.close || "22:00"}
                          onChange={(e) =>
                            handleHoursChange(day, "close", e.target.value)
                          }
                          disabled={isClosed}
                          className="bg-transparent text-sm text-gray-900 focus:outline-none disabled:cursor-not-allowed w-20"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleHoursChange(day, "closed", !isClosed)
                      }
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                        isClosed
                          ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {isClosed
                        ? t("venueSettings.common.closed")
                        : t("venueSettings.common.open")}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onSave}
          loading={saving}
          icon={Save}
          size="lg"
        >
          {t("venueSettings.common.saveChanges")}
        </Button>
      </div>
    </div>
  );
};

// --- Spaces Tab ---
const SpacesTab = ({
  spaces,
  setSpaces,
  onDeleteSpace,
  refetch,
  saving,
  setSaving,
  t,
  toast,
}) => {
  const [editingSpace, setEditingSpace] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [spaceForm, setSpaceForm] = useState(INITIAL_SPACE_FORM);
  const formRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [p, c] = name.split(".");
      setSpaceForm((prev) => ({ ...prev, [p]: { ...prev[p], [c]: value } }));
    } else {
      setSpaceForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleAddNew = () => {
    setEditingSpace(null);
    setSpaceForm(INITIAL_SPACE_FORM);
    setShowForm(true);
    setTimeout(
      () =>
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100
    );
  };

  const handleEdit = (space) => {
    setEditingSpace(space);
    setSpaceForm({
      name: space.name,
      description: space.description || "",
      capacity: space.capacity,
      basePrice: space.basePrice,
      isActive: space.isActive,
    });
    setShowForm(true);
    setTimeout(
      () =>
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      100
    );
  };

  const handleCancel = () => {
    setEditingSpace(null);
    setSpaceForm(INITIAL_SPACE_FORM);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!spaceForm.name.trim()) {
      toast.error(t("venueSettings.validation.required"));
      return;
    }
    if (!spaceForm.capacity.min || !spaceForm.capacity.max) {
      toast.error(t("venueSettings.spaces.validation.capacity"));
      return;
    }
    if (!spaceForm.basePrice) {
      toast.error(t("venueSettings.spaces.validation.price"));
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: spaceForm.name.trim(),
        description: spaceForm.description.trim(),
        capacity: {
          min: Number(spaceForm.capacity.min),
          max: Number(spaceForm.capacity.max),
        },
        basePrice: Number(spaceForm.basePrice),
        isActive: spaceForm.isActive,
      };

      if (editingSpace) {
        await venueSpacesService.update(editingSpace._id, data);
        toast.success(t("venueSettings.spaces.updated"));
      } else {
        await venueSpacesService.create(data);
        toast.success(t("venueSettings.spaces.created"));
      }

      refetch();
      handleCancel();
    } catch (err) {
      toast.error(err.message || t("venueSettings.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((space) => (
          <div
            key={space._id}
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-200 transition-all relative group"
          >
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => handleEdit(space)}
                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteSpace(space._id)}
                className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <h3 className="font-bold text-lg text-gray-900 mb-1 pr-20">
              {space.name}
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <Badge
                variant={space.isActive ? "success" : "danger"}
                size="sm"
                dot
              >
                {space.isActive
                  ? t("venueSettings.common.active")
                  : t("venueSettings.common.inactive")}
              </Badge>
            </div>

            <div className="flex justify-between text-sm border-t border-gray-100 pt-4">
              <div>
                <span className="text-xs text-gray-400 uppercase block">
                  {t("venueSettings.spaces.capacity")}
                </span>
                <span className="font-medium text-gray-900">
                  {space.capacity.min} - {space.capacity.max}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 uppercase block">
                  {t("venueSettings.spaces.basePrice")}
                </span>
                <span className="font-bold text-orange-600">
                  {space.basePrice?.toLocaleString()} TND
                </span>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddNew}
          className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-400 hover:bg-orange-50 transition-all min-h-[180px] bg-white"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <Plus size={24} />
          </div>
          <span className="font-medium">
            {t("venueSettings.spaces.addNew")}
          </span>
          <span className="text-sm mt-1">
            {t("venueSettings.spaces.addDescription")}
          </span>
        </button>
      </div>

      {spaces.length === 0 && !showForm && (
        <EmptyState
          icon={Grid3x3}
          title={t("venueSettings.spaces.emptyTitle")}
          description={t("venueSettings.spaces.emptyDescription")}
          action={
            <Button onClick={handleAddNew} icon={Plus}>
              {t("venueSettings.spaces.addFirst")}
            </Button>
          }
        />
      )}

      {showForm && (
        <div
          ref={formRef}
          className="animate-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${editingSpace ? "bg-blue-50" : "bg-orange-50"}`}
                >
                  {editingSpace ? (
                    <Edit2 size={20} className="text-blue-500" />
                  ) : (
                    <Plus size={20} className="text-orange-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingSpace
                      ? `${t("venueSettings.spaces.edit")}: ${editingSpace.name}`
                      : t("venueSettings.spaces.addNew")}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {editingSpace
                      ? t("venueSettings.spaces.editDescription")
                      : t("venueSettings.spaces.addDescription")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label={t("venueSettings.spaces.fields.name")}
                  name="name"
                  value={spaceForm.name}
                  onChange={handleChange}
                  placeholder={t("venueSettings.spaces.placeholders.name")}
                />
                <Input
                  label={t("venueSettings.spaces.fields.basePrice")}
                  name="basePrice"
                  type="number"
                  value={spaceForm.basePrice}
                  onChange={handleChange}
                  placeholder={t("venueSettings.spaces.placeholders.basePrice")}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Input
                  label={t("venueSettings.spaces.fields.minCapacity")}
                  name="capacity.min"
                  type="number"
                  value={spaceForm.capacity.min}
                  onChange={handleChange}
                  placeholder="50"
                />
                <Input
                  label={t("venueSettings.spaces.fields.maxCapacity")}
                  name="capacity.max"
                  type="number"
                  value={spaceForm.capacity.max}
                  onChange={handleChange}
                  placeholder="300"
                />
              </div>

              <Textarea
                label={t("venueSettings.spaces.fields.description")}
                name="description"
                value={spaceForm.description}
                onChange={handleChange}
                rows={3}
                placeholder={t("venueSettings.spaces.placeholders.description")}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={spaceForm.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300"
                  />
                  <div>
                    <span className="block text-sm font-medium text-gray-900">
                      {t("venueSettings.spaces.availableForBooking")}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {t("venueSettings.spaces.availableDescription")}
                    </span>
                  </div>
                </label>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleCancel}>
                    {t("venueSettings.common.cancel")}
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={saving}
                    icon={editingSpace ? Save : Plus}
                  >
                    {editingSpace
                      ? t("venueSettings.common.saveChanges")
                      : t("venueSettings.spaces.create")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const VenueSettings = () => {
  const { t } = useTranslation();
  const toast = useToast();

  const { user, venue, spaces, venueImages, loading, error, refetch, setData } =
    useVenueSettingsData();

  const [activeTab, setActiveTab] = useState("personal");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [userForm, setUserForm] = useState(INITIAL_USER_FORM);
  const [passwordForm, setPasswordForm] = useState(INITIAL_PASSWORD_FORM);
  const [venueForm, setVenueForm] = useState(INITIAL_VENUE_FORM);
  const [amenities, setAmenities] = useState([]);
  const [operatingHours, setOperatingHours] = useState(DEFAULT_HOURS);

  useEffect(() => {
    if (user) {
      setUserForm({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
    // ... venue form effect logic
    if (venue) {
        setVenueForm({
          name: venue.name || "",
          description: venue.description || "",
          address: venue.address || { street: "", city: "", state: "", zipCode: "", country: "" },
          contact: venue.contact || { phone: "", email: "" },
          capacity: venue.capacity || { min: "", max: "" },
          pricing: venue.pricing || { basePrice: "" },
        });
        setAmenities(venue.amenities || []);
        setOperatingHours(venue.operatingHours || DEFAULT_HOURS);
      }
  }, [user, venue]);

  const handleSavePersonal = async () => {
    if (!userForm.name.trim()) {
      toast.error(t("venueSettings.validation.required"));
      return;
    }
    setSaving(true);
    try {
      await authService.updateProfile(userForm);
      toast.success(t("venueSettings.notifications.profileUpdated"));
      
      // 1. Notify TopBar immediately via custom event (soft update)
      window.dispatchEvent(new Event("profileUpdated"));

      // 2. Trigger hard refresh after a delay to ensure data consistency everywhere
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (err) {
      toast.error(err.message || t("venueSettings.errors.saveFailed"));
      setSaving(false); // Only stop loading if error, otherwise wait for reload
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error(t("venueSettings.validation.required"));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(t("venueSettings.validation.minLength"));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("venueSettings.validation.passwordMismatch"));
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      toast.success(t("venueSettings.notifications.passwordChanged"));
      setPasswordForm(INITIAL_PASSWORD_FORM);
    } catch (err) {
      toast.error(err.message || t("venueSettings.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveVenue = async () => {
    const newErrors = {};
    if (!venueForm.name.trim())
      newErrors.name = t("venueSettings.validation.required");
    if (!venueForm.description.trim())
      newErrors.description = t("venueSettings.validation.required");
    if (!venueForm.address.city.trim())
      newErrors["address.city"] = t("venueSettings.validation.required");
    if (!venueForm.contact.phone.trim())
      newErrors["contact.phone"] = t("venueSettings.validation.required");
    if (!venueForm.contact.email.trim()) {
      newErrors["contact.email"] = t("venueSettings.validation.required");
    } else if (!/^\S+@\S+\.\S+$/.test(venueForm.contact.email)) {
      newErrors["contact.email"] = t("venueSettings.validation.emailInvalid");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t("venueSettings.validation.fixErrors"));
      return;
    }

    setSaving(true);
    try {
      await venueService.update({
        ...venueForm,
        amenities,
        operatingHours,
      });
      toast.success(t("venueSettings.notifications.venueUpdated"));
      setErrors({});
    } catch (err) {
      toast.error(err.message || t("venueSettings.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    if (window.confirm(t("venueSettings.spaces.confirmDelete"))) {
      try {
        await venueService.deleteVenueSpace(spaceId);
        setData((prev) => ({
          ...prev,
          spaces: prev.spaces.filter((s) => s._id !== spaceId),
        }));
        toast.success(t("venueSettings.spaces.deleted"));
      } catch (err) {
        toast.error(err.message || t("venueSettings.errors.deleteFailed"));
      }
    }
  };

  const tabs = [
    { id: "personal", label: t("venueSettings.tabs.personal"), icon: User },
    { id: "security", label: t("venueSettings.tabs.security"), icon: Lock },
    { id: "venue", label: t("venueSettings.tabs.venue"), icon: Building2 },
    {
      id: "amenities",
      label: t("venueSettings.tabs.amenities"),
      icon: CheckCircle2,
    },
    { id: "spaces", label: t("venueSettings.tabs.spaces"), icon: Grid3x3 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <OrbitLoader />
          <p className="text-gray-600">{t("venueSettings.common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white p-6">
        <Card className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {t("venueSettings.errors.loadFailed")}
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={refetch} icon={Save}>
            {t("venueSettings.common.tryAgain")}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("venueSettings.title")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {t("venueSettings.subtitle")}
            </p>
          </div>

          <div className="flex space-x-1 overflow-x-auto scrollbar-hide -mb-px">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "personal" && (
          <PersonalTab
            user={user}
            userForm={userForm}
            setUserForm={setUserForm}
            onSave={handleSavePersonal}
            saving={saving}
            t={t}
          />
        )}

        {activeTab === "security" && (
          <SecurityTab
            passwordForm={passwordForm}
            setPasswordForm={setPasswordForm}
            onSave={handleChangePassword}
            saving={saving}
            t={t}
          />
        )}

        {activeTab === "venue" && (
          <VenueTab
            venueForm={venueForm}
            setVenueForm={setVenueForm}
            errors={errors}
            onSave={handleSaveVenue}
            saving={saving}
            t={t}
          />
        )}

        {activeTab === "amenities" && (
          <AmenitiesTab
            amenities={amenities}
            setAmenities={setAmenities}
            operatingHours={operatingHours}
            setOperatingHours={setOperatingHours}
            onSave={handleSaveVenue}
            saving={saving}
            t={t}
            toast={toast}
          />
        )}

        {activeTab === "spaces" && (
          <SpacesTab
            spaces={spaces}
            setSpaces={(newSpaces) =>
              setData((prev) => ({ ...prev, spaces: newSpaces }))
            }
            onDeleteSpace={handleDeleteSpace}
            refetch={refetch}
            saving={saving}
            setSaving={setSaving}
            t={t}
            toast={toast}
          />
        )}
      </div>
    </div>
  );
};

export default VenueSettings;
