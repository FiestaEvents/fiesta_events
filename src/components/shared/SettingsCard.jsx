import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  Building2,
  CheckCircle2,
  Grid3x3,
  Save,
  Clock,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { venueService, venueSpacesService } from "../../api/index";
import SettingsLayout from "../../components/shared/SettingsLayout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";

// --- Constants ---
const DEFAULT_AMENITIES = [
  "WiFi",
  "Parking",
  "A/C & Heating",
  "Restrooms",
  "Bridal Suite",
  "Sound System",
  "Lighting System",
  "Projector & Screen",
  "Kitchen Access",
  "Outdoor Space",
  "Security",
  "Tables & Chairs",
  "Linens",
  "Catering Kitchen",
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

const DEFAULT_HOURS = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = { open: "09:00", close: "22:00", closed: day === "sunday" };
  return acc;
}, {});

const INITIAL_SPACE_FORM = {
  name: "",
  description: "",
  capacity: { min: "", max: "" },
  basePrice: "",
  isActive: true,
};

// --- Custom Hook ---
const useVenueData = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ venue: null, spaces: [] });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [venueRes, spacesRes] = await Promise.all([
        venueService.getMe(),
        venueSpacesService.getAll().catch(() => ({ spaces: [] })),
      ]);

      setData({
        venue: venueRes.data?.venue || venueRes.venue || venueRes.data || {},
        spaces: spacesRes.data?.spaces || spacesRes.spaces || [],
      });
    } catch (err) {
      console.error(err);
      setError(err.message || t("venueSettings.errors.loadFailed"));
      toast.error(t("venueSettings.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refetch: fetchData, setData };
};

// --- Sub-Components ---

const VenueTab = ({ venue, onSave, saving, t, darkMode }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: venue?.name || "",
      description: venue?.description || "",
      "address.street": venue?.address?.street || "",
      "address.city": venue?.address?.city || "",
      "address.state": venue?.address?.state || "",
      "address.zipCode": venue?.address?.zipCode || "",
      "address.country": venue?.address?.country || "",
      "contact.phone": venue?.contact?.phone || "",
      "contact.email": venue?.contact?.email || "",
    },
  });

  return (
    <div className="space-y-6">
      <Card
        title={t("venueSettings.venue.basicInfo.title")}
        description={t("venueSettings.venue.basicInfo.description")}
        darkMode={darkMode}
      >
        <div className="p-6 space-y-5">
          <Input
            label={t("venueSettings.venue.fields.name")}
            {...register("name", { required: "Required" })}
            error={errors.name?.message}
            darkMode={darkMode}
          />
          <Textarea
            label={t("venueSettings.venue.fields.description")}
            {...register("description")}
            rows={4}
            darkMode={darkMode}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title={t("venueSettings.venue.location.title")}
          darkMode={darkMode}
        >
          <div className="p-6 space-y-4">
            <Input
              label={t("venueSettings.venue.fields.street")}
              {...register("address.street")}
              darkMode={darkMode}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("venueSettings.venue.fields.city")}
                {...register("address.city")}
                darkMode={darkMode}
              />
              <Input
                label={t("venueSettings.venue.fields.state")}
                {...register("address.state")}
                darkMode={darkMode}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("venueSettings.venue.fields.zipCode")}
                {...register("address.zipCode")}
                darkMode={darkMode}
              />
              <Input
                label={t("venueSettings.venue.fields.country")}
                {...register("address.country")}
                darkMode={darkMode}
              />
            </div>
          </div>
        </Card>

        <Card
          title={t("venueSettings.venue.contact.title")}
          darkMode={darkMode}
        >
          <div className="p-6 space-y-4">
            <Input
              label={t("venueSettings.venue.fields.phone")}
              {...register("contact.phone")}
              darkMode={darkMode}
            />
            <Input
              label={t("venueSettings.venue.fields.email")}
              {...register("contact.email")}
              type="email"
              darkMode={darkMode}
            />
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit(onSave)}
          loading={saving}
          icon={Save}
          size="lg"
          darkMode={darkMode}
        >
          {t("venueSettings.common.saveChanges")}
        </Button>
      </div>
    </div>
  );
};

const AmenitiesTab = ({
  amenities,
  setAmenities,
  operatingHours,
  setOperatingHours,
  onSave,
  saving,
  t,
  darkMode,
}) => {
  const [newAmenity, setNewAmenity] = useState("");
  const availableToAdd = useMemo(
    () => DEFAULT_AMENITIES.filter((a) => !amenities.includes(a)),
    [amenities]
  );

  const handleToggleAmenity = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleAddCustom = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const handleHoursChange = (day, field, value) => {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  return (
    <div className="space-y-6">
      <Card title={t("venueSettings.amenities.subtitle")} darkMode={darkMode}>
        <div className="p-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            {amenities.map((a, idx) => (
              <Badge
                key={idx}
                variant="neutral"
                size="lg"
                className="flex gap-2"
              >
                {a}
                <button onClick={() => handleToggleAmenity(a)}>
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-semibold mb-3 dark:text-gray-300">
              {t("venueSettings.amenities.quickAdd")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableToAdd.map((amenity) => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleToggleAmenity(amenity)}
                  className="px-3 py-1.5 text-sm border rounded-full hover:bg-orange-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-300 flex items-center gap-1"
                >
                  <Plus size={14} /> {amenity}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <div className="flex-1">
              <Input
                placeholder={t("venueSettings.amenities.placeholders.custom")}
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                darkMode={darkMode}
              />
            </div>
            <Button
              onClick={handleAddCustom}
              variant="outline"
              icon={Plus}
              disabled={!newAmenity.trim()}
              darkMode={darkMode}
            >
              {t("venueSettings.common.add")}
            </Button>
          </div>
        </div>
      </Card>

      <Card
        title={t("venueSettings.amenities.operatingHours.title")}
        darkMode={darkMode}
      >
        <div className="p-6 space-y-2">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="flex items-center gap-4 py-2 border-b last:border-0 border-gray-100 dark:border-gray-700"
            >
              <div className="w-24 font-medium capitalize dark:text-gray-300">
                {t(`venueSettings.amenities.operatingHours.days.${day}`)}
              </div>
              <div
                className={`flex items-center gap-2 ${operatingHours[day].closed ? "opacity-50" : ""}`}
              >
                <input
                  type="time"
                  value={operatingHours[day].open}
                  onChange={(e) =>
                    handleHoursChange(day, "open", e.target.value)
                  }
                  disabled={operatingHours[day].closed}
                  className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <span>-</span>
                <input
                  type="time"
                  value={operatingHours[day].close}
                  onChange={(e) =>
                    handleHoursChange(day, "close", e.target.value)
                  }
                  disabled={operatingHours[day].closed}
                  className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer ml-auto">
                <input
                  type="checkbox"
                  checked={operatingHours[day].closed}
                  onChange={(e) =>
                    handleHoursChange(day, "closed", e.target.checked)
                  }
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t("venueSettings.common.closed")}
                </span>
              </label>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onSave}
          loading={saving}
          icon={Save}
          size="lg"
          darkMode={darkMode}
        >
          {t("venueSettings.common.saveChanges")}
        </Button>
      </div>
    </div>
  );
};

const SpacesTab = ({ spaces, refetch, t, darkMode }) => {
  const [editingSpace, setEditingSpace] = useState(null);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: INITIAL_SPACE_FORM });

  const onEdit = (space) => {
    setEditingSpace(space);
    reset({
      name: space.name,
      description: space.description,
      "capacity.min": space.capacity.min,
      "capacity.max": space.capacity.max,
      basePrice: space.basePrice,
      isActive: space.isActive,
    });
  };

  const onCancel = () => {
    setEditingSpace(null);
    reset(INITIAL_SPACE_FORM);
  };

  const onSaveSpace = async (data) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        capacity: {
          min: Number(data.capacity.min),
          max: Number(data.capacity.max),
        },
        basePrice: Number(data.basePrice),
      };

      if (editingSpace?._id) {
        await venueSpacesService.update(editingSpace._id, payload);
        toast.success(t("venueSettings.spaces.updated"));
      } else {
        await venueSpacesService.create(payload);
        toast.success(t("venueSettings.spaces.created"));
      }
      refetch();
      onCancel();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm(t("venueSettings.spaces.confirmDelete"))) return;
    try {
      await venueSpacesService.delete(id);
      toast.success(t("venueSettings.spaces.deleted"));
      refetch();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((space) => (
          <div
            key={space._id}
            className="border rounded-xl p-5 relative group bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-orange-400 transition-all"
          >
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEdit(space)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(space._id)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <h3 className="font-bold text-lg dark:text-white">{space.name}</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("venueSettings.spaces.capacity")}: {space.capacity.min} -{" "}
              {space.capacity.max}
            </div>
            <div className="text-sm font-bold text-orange-600 mt-1">
              {space.basePrice} TND
            </div>
          </div>
        ))}

        <button
          onClick={() => onEdit({})}
          className="border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center min-h-[150px] hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800 dark:border-gray-700 transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-2">
            <Plus className="text-orange-600" />
          </div>
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {t("venueSettings.spaces.addNew")}
          </span>
        </button>
      </div>

      {editingSpace !== null && (
        <Card
          title={
            editingSpace._id
              ? t("venueSettings.spaces.edit")
              : t("venueSettings.spaces.create")
          }
          darkMode={darkMode}
        >
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("venueSettings.spaces.fields.name")}
                {...register("name", { required: true })}
                darkMode={darkMode}
              />
              <Input
                label={t("venueSettings.spaces.fields.basePrice")}
                type="number"
                {...register("basePrice", { required: true })}
                darkMode={darkMode}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Capacity"
                type="number"
                {...register("capacity.min", { required: true })}
                darkMode={darkMode}
              />
              <Input
                label="Max Capacity"
                type="number"
                {...register("capacity.max", { required: true })}
                darkMode={darkMode}
              />
            </div>
            <Textarea
              label={t("venueSettings.spaces.fields.description")}
              {...register("description")}
              darkMode={darkMode}
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={onCancel} darkMode={darkMode}>
                {t("venueSettings.common.cancel")}
              </Button>
              <Button
                onClick={handleSubmit(onSaveSpace)}
                loading={saving}
                darkMode={darkMode}
              >
                {t("venueSettings.common.saveChanges")}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// --- Main Component ---

const VenueSettings = ({ darkMode = false }) => {
  const { t } = useTranslation();
  const { venue, spaces, loading, error, refetch } = useVenueData();
  const [activeTab, setActiveTab] = useState("venue");
  const [saving, setSaving] = useState(false);

  // Shared state for Tabs 1 & 2
  const [amenities, setAmenities] = useState([]);
  const [operatingHours, setOperatingHours] = useState(DEFAULT_HOURS);

  useEffect(() => {
    if (venue) {
      setAmenities(venue.amenities || []);
      setOperatingHours(venue.operatingHours || DEFAULT_HOURS);
    }
  }, [venue]);

  const handleGlobalSave = async (data = {}) => {
    setSaving(true);
    try {
      const payload = { ...data, amenities, operatingHours };
      await venueService.update(payload);
      toast.success(t("venueSettings.notifications.venueUpdated"));
      refetch();
    } catch (err) {
      toast.error(err.message || t("venueSettings.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <OrbitLoader />
      </div>
    );
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const tabs = [
    { id: "venue", label: t("venueSettings.tabs.venue"), icon: Building2 },
    {
      id: "amenities",
      label: t("venueSettings.tabs.amenities"),
      icon: CheckCircle2,
    },
    { id: "spaces", label: t("venueSettings.tabs.spaces"), icon: Grid3x3 },
  ];

  return (
    <SettingsLayout
      title={t("venueSettings.title")}
      subtitle={t("venueSettings.subtitle")}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={darkMode}
    >
      {activeTab === "venue" && (
        <VenueTab
          venue={venue}
          onSave={handleGlobalSave}
          saving={saving}
          t={t}
          darkMode={darkMode}
        />
      )}
      {activeTab === "amenities" && (
        <AmenitiesTab
          amenities={amenities}
          setAmenities={setAmenities}
          operatingHours={operatingHours}
          setOperatingHours={setOperatingHours}
          onSave={() => handleGlobalSave({})}
          saving={saving}
          t={t}
          darkMode={darkMode}
        />
      )}
      {activeTab === "spaces" && (
        <SpacesTab
          spaces={spaces}
          refetch={refetch}
          t={t}
          darkMode={darkMode}
        />
      )}
    </SettingsLayout>
  );
};

export default VenueSettings;
