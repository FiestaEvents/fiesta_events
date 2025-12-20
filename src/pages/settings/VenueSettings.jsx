import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  Grid3x3,
  Save,
  Plus,
  Trash2,
  Edit2,
  Clock,
  MapPin,
  Phone,
  Mail,
  X,
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

// --- Animations ---
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
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

// --- Sticky Action Bar Component ---
const StickyActionBar = ({ onSave, saving, t, darkMode }) => (
  <motion.div
    initial={{ y: 100 }}
    animate={{ y: 0 }}
    className={`fixed bottom-6 right-6 z-40 p-4 rounded-2xl shadow-xl flex items-center gap-4 border ${
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
    }`}
  >
    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
      {t("venueSettings.common.unsavedChanges")}
    </div>
    <Button
      onClick={onSave}
      loading={saving}
      icon={Save}
      size="md"
      darkMode={darkMode}
      className="shadow-lg shadow-orange-500/20"
    >
      {t("venueSettings.common.saveChanges")}
    </Button>
  </motion.div>
);

// --- 1. Venue Info Tab ---
const VenueTab = ({ venue, onSave, saving, t, darkMode }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm();

  useEffect(() => {
    if (venue) {
      reset({
        name: venue.name || "",
        description: venue.description || "",
        "address.street": venue.address?.street || "",
        "address.city": venue.address?.city || "",
        "address.state": venue.address?.state || "",
        "address.zipCode": venue.address?.zipCode || "",
        "address.country": venue.address?.country || "",
        "contact.phone": venue.contact?.phone || "",
        "contact.email": venue.contact?.email || "",
      });
    }
  }, [venue, reset]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8 pb-24"
    >
      {/* Basic Info */}
      <div
        className={`p-8 rounded-3xl shadow-sm ${darkMode ? "bg-gray-800" : "bg-white"}`}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t("venueSettings.venue.basicInfo.title")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("venueSettings.venue.basicInfo.description")}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Input
            label={t("venueSettings.venue.fields.name")}
            {...register("name", { required: "Required" })}
            error={errors.name?.message}
            darkMode={darkMode}
            className="text-lg w-full"
          />
          <Textarea
            label={t("venueSettings.venue.fields.description")}
            {...register("description")}
            rows={4}
            darkMode={darkMode}
            className="text-md w-full"
          />
        </div>
      </div>

      {/* Location & Contact Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div
          className={`p-8 rounded-3xl shadow-sm h-full ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {t("venueSettings.venue.location.title")}
            </h3>
          </div>

          <div className="space-y-5">
            <Input
              label={t("venueSettings.venue.fields.street")}
              {...register("address.street")}
              darkMode={darkMode}
              className="text-md w-full"
            />
            <div className="grid grid-cols-2 gap-5">
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
            <div className="grid grid-cols-2 gap-5">
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
        </div>

        <div
          className={`p-8 rounded-3xl shadow-sm h-full ${darkMode ? "bg-gray-800" : "bg-white"}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600">
              <Phone size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {t("venueSettings.venue.contact.title")}
            </h3>
          </div>

          <div className="space-y-5">
            <Input
              label={t("venueSettings.venue.fields.phone")}
              {...register("contact.phone")}
              icon={Phone}
              darkMode={darkMode}
              className="text-md w-full"
            />
            <Input
              label={t("venueSettings.venue.fields.email")}
              {...register("contact.email")}
              type="email"
              icon={Mail}
              darkMode={darkMode}
              className="text-md w-full"
            />
          </div>
        </div>
      </div>

      {isDirty && (
        <StickyActionBar
          onSave={handleSubmit(onSave)}
          saving={saving}
          t={t}
          darkMode={darkMode}
        />
      )}
    </motion.div>
  );
};

// --- 2. Amenities & Hours Tab ---
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
  const [view, setView] = useState("amenities"); // 'amenities' | 'hours'
  const [newAmenity, setNewAmenity] = useState("");
  const availableToAdd = useMemo(
    () => DEFAULT_AMENITIES.filter((a) => !amenities.includes(a)),
    [amenities]
  );

  const handleToggleAmenity = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
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
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="pb-24"
    >
      {/* Toggle Switch */}
      <div className="flex justify-center mb-8">
        <div
          className={`p-1 rounded-xl inline-flex ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}
        >
          <button
            onClick={() => setView("amenities")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              view === "amenities"
                ? "bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t("venueSettings.tabs.amenities")}
          </button>
          <button
            onClick={() => setView("hours")}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              view === "hours"
                ? "bg-white text-orange-600 shadow-sm dark:bg-gray-700 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            {t("venueSettings.amenities.operatingHours.title")}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === "amenities" ? (
          <motion.div
            key="amenities"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`p-8 rounded-3xl shadow-sm ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            {/* Selected Amenities Section */}
            <div className="mb-10">
              <h3
                className={`text-lg font-bold mb-4 text-start ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                {t("venueSettings.amenities.selected")}
              </h3>
              <div className="flex flex-wrap gap-3">
                {amenities.map((a, idx) => (
                  <Badge
                    key={idx}
                    variant="purple"
                    size="lg"
                    className="pl-3 pr-2 py-1.5 flex gap-2 items-center"
                  >
                    {a}
                    <button
                      onClick={() => handleToggleAmenity(a)}
                      className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                      aria-label="Remove amenity"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
                {amenities.length === 0 && (
                  <p className="text-gray-400 text-sm italic">
                    No amenities selected yet.
                  </p>
                )}
              </div>
            </div>

            {/* Actions Container: Stacked for better mobile/RTL support */}
            <div className="space-y-8 pt-8 border-t border-gray-100 dark:border-gray-700">
              {/* Quick Add Section */}
              <div className="w-full">
                <h4
                  className={`text-sm font-bold mb-4 uppercase tracking-wider text-start ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t("venueSettings.amenities.quickAdd")}
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {availableToAdd.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => handleToggleAmenity(amenity)}
                      className={`px-4 py-2 text-sm border rounded-full transition-all flex items-center gap-1.5 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                      }`}
                    >
                      <Plus size={14} /> {amenity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Section */}
              <div className="w-full">
                <h4
                  className={`text-sm font-bold mb-4 uppercase tracking-wider text-start ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {t("venueSettings.amenities.addCustom")}
                </h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder={t(
                        "venueSettings.amenities.placeholders.custom"
                      )}
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      darkMode={darkMode}
                      className="text-md w-full"
                    />
                  </div>
                  <Button
                    onClick={handleAddCustom}
                    icon={Plus}
                    disabled={!newAmenity.trim()}
                    darkMode={darkMode}
                    className="w-full sm:w-auto"
                  >
                    {t("venueSettings.common.add")}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="hours"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`p-8 rounded-3xl shadow-sm ${darkMode ? "bg-gray-800" : "bg-white"}`}
          >
            <div className="space-y-1">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="group flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        operatingHours[day].closed
                          ? "bg-gray-100 text-gray-400 dark:bg-gray-700"
                          : "bg-green-100 text-green-600 dark:bg-green-900/20"
                      }`}
                    >
                      <Clock size={18} />
                    </div>
                    <span className="w-24 font-bold capitalize text-gray-700 dark:text-gray-200 text-start">
                      {day}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-4 ${operatingHours[day].closed ? "opacity-30 pointer-events-none" : ""}`}
                  >
                    <input
                      type="time"
                      value={operatingHours[day].open}
                      onChange={(e) =>
                        handleHoursChange(day, "open", e.target.value)
                      }
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={operatingHours[day].close}
                      onChange={(e) =>
                        handleHoursChange(day, "close", e.target.value)
                      }
                      className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        operatingHours[day].closed
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {operatingHours[day].closed ? "Closed" : "Open"}
                    </span>
                    <div className="relative inline-block w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={!operatingHours[day].closed}
                        onChange={(e) =>
                          handleHoursChange(day, "closed", !e.target.checked)
                        }
                      />
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          !operatingHours[day].closed
                            ? "translate-x-6 bg-green-500"
                            : "bg-gray-400"
                        }`}
                      ></span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <StickyActionBar
        onSave={() => onSave({})}
        saving={saving}
        t={t}
        darkMode={darkMode}
      />
    </motion.div>
  );
};

// --- 3. Spaces Tab ---
const SpacesTab = ({ spaces, refetch, t, darkMode }) => {
  const [editingSpace, setEditingSpace] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: INITIAL_SPACE_FORM,
  });

  const onEdit = (space) => {
    setEditingSpace(space);
    reset({
      name: space.name || "",
      description: space.description || "",
      "capacity.min": space.capacity?.min || "",
      "capacity.max": space.capacity?.max || "",
      basePrice: space.basePrice || "",
      isActive: space.isActive,
    });
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
      setEditingSpace(null);
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
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-8 pb-24"
    >
      {/* Grid of Spaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <motion.div
            key={space._id}
            whileHover={{ y: -5 }}
            className={`p-6 rounded-3xl shadow-sm relative group overflow-hidden ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            {/* Top Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-bl-full -mr-8 -mt-8 rtl:-ml-8 rtl:mr-0 rtl:rounded-br-full rtl:rounded-bl-none rtl:left-0 rtl:right-auto" />

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div
                  className={`p-3 rounded-2xl ${darkMode ? "bg-gray-700" : "bg-orange-50 text-orange-600"}`}
                >
                  <Grid3x3 size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(space)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-blue-500 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(space._id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {space.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                {space.description || "No description provided."}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <Badge variant="neutral">
                  {space.capacity.min} - {space.capacity.max} Guests
                </Badge>
                <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
                  {space.basePrice} TND
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add New Card */}
        <button
          onClick={() => onEdit({})}
          className={`p-6 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center min-h-[280px] transition-all group ${
            darkMode
              ? "border-gray-700 hover:border-orange-500 hover:bg-gray-800"
              : "border-gray-200 hover:border-orange-400 hover:bg-orange-50/50"
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-gray-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus size={32} className="text-orange-500" />
          </div>
          <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
            {t("venueSettings.spaces.addNew")}
          </span>
        </button>
      </div>

      {/* Edit/Create Modal (Inline) */}
      <AnimatePresence>
        {editingSpace !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`p-8 rounded-3xl shadow-xl border ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-orange-100"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold dark:text-white">
                {editingSpace._id
                  ? t("venueSettings.spaces.edit")
                  : t("venueSettings.spaces.create")}
              </h3>
              <button
                onClick={() => setEditingSpace(null)}
                className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
              >
                <X size={20} className="dark:text-gray-400" />
              </button>
            </div>

            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label={t("venueSettings.spaces.fields.name")}
                  {...register("name", { required: true })}
                  darkMode={darkMode}
                  className="text-md w-full"
                />
                <Input
                  label={t("venueSettings.spaces.fields.basePrice")}
                  type="number"
                  {...register("basePrice", { required: true })}
                  darkMode={darkMode}
                  className="text-md w-full"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Min Capacity"
                  type="number"
                  {...register("capacity.min", { required: true })}
                  darkMode={darkMode}
                  className="text-md w-full"
                />
                <Input
                  label="Max Capacity"
                  type="number"
                  {...register("capacity.max", { required: true })}
                  darkMode={darkMode}
                  className="text-md w-full"
                />
              </div>
              <Textarea
                label={t("venueSettings.spaces.fields.description")}
                {...register("description")}
                darkMode={darkMode}
                className="text-md w-full"
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingSpace(null)}
                  darkMode={darkMode}
                  className="text-md w-full"
                >
                  {t("venueSettings.common.cancel")}
                </Button>
                <Button
                  onClick={handleSubmit(onSaveSpace)}
                  loading={saving}
                  darkMode={darkMode}
                  className="text-md w-full"
                >
                  {t("venueSettings.common.saveChanges")}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Main Container ---
const VenueSettings = ({ darkMode = false }) => {
  const { t } = useTranslation();
  const { venue, spaces, loading, error, refetch } = useVenueData();
  const [activeTab, setActiveTab] = useState("venue");
  const [saving, setSaving] = useState(false);
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
      <AnimatePresence mode="wait">
        {activeTab === "venue" && (
          <VenueTab
            key="venue"
            venue={venue}
            onSave={handleGlobalSave}
            saving={saving}
            t={t}
            darkMode={darkMode}
          />
        )}
        {activeTab === "amenities" && (
          <AmenitiesTab
            key="amenities"
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
            key="spaces"
            spaces={spaces}
            refetch={refetch}
            t={t}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>
    </SettingsLayout>
  );
};

export default VenueSettings;
