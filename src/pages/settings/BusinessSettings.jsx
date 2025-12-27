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
  Briefcase,
  Camera,
  Truck,
  Settings,
  DollarSign,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { venueService, venueSpacesService } from "../../api/index";

import SettingsLayout from "../../components/shared/SettingsLayout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";
import { useTheme } from "../../context/ThemeContext";
// --- Constants & Config ---
const DEFAULT_AMENITIES = [
  "WiFi",
  "Parking",
  "A/C",
  "Restrooms",
  "Kitchen",
  "Security",
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
  acc[day] = { open: "09:00", close: "18:00", closed: day === "sunday" };
  return acc;
}, {});

// --- Animations ---
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// --- Custom Hook ---
const useBusinessData = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ business: null, spaces: [] });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bizRes, spacesRes] = await Promise.all([
        venueService.getMe(),
        venueSpacesService.getAll().catch(() => ({ spaces: [] })),
      ]);

      setData({
        business: bizRes.data?.venue || bizRes.venue || {},
        spaces: spacesRes.data?.spaces || spacesRes.spaces || [],
      });
    } catch (err) {
      toast.error(t("settings.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return { ...data, loading, refetch: fetchData };
};

// --- Sub-Components ---

const StickyActionBar = ({ onSave, saving, t }) => (
  <motion.div
    initial={{ y: 100 }}
    animate={{ y: 0 }}
    className="fixed bottom-6 right-6 z-40 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center gap-4 border border-orange-100 dark:border-gray-700"
  >
    <div className="text-sm text-gray-500 dark:text-gray-400">
      {t("settings.common.unsavedChanges")}
    </div>
    <Button
      onClick={onSave}
      loading={saving}
      icon={Save}
      className="shadow-lg shadow-orange-500/20"
    >
      {t("settings.common.saveChanges")}
    </Button>
  </motion.div>
);

// 1. General Info Tab (Shared)
const GeneralTab = ({ business, onSave, saving, t }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm();

  useEffect(() => {
    if (business) {
      reset({
        name: business.name,
        description: business.description,
        "address.street": business.address?.street,
        "address.city": business.address?.city,
        "address.state": business.address?.state,
        "address.zipCode": business.address?.zipCode,
        "address.country": business.address?.country,
        "contact.phone": business.contact?.phone,
        "contact.email": business.contact?.email,
      });
    }
  }, [business, reset]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6 pb-24"
    >
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t("settings.general.title")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("settings.general.subtitle")}
            </p>
          </div>
        </div>
        <div className="grid gap-5">
          <Input
            label={t("settings.fields.name")}
            {...register("name")}
            className="w-full"
          />
          <Textarea
            label={t("settings.fields.description")}
            {...register("description")}
            rows={3}
            className="w-full"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold dark:text-white">
              {t("settings.location.title")}
            </h3>
          </div>
          <div className="space-y-4">
            <Input
              label={t("settings.fields.address")}
              {...register("address.street")}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("settings.fields.city")}
                {...register("address.city")}
              />
              <Input
                label={t("settings.fields.zip")}
                {...register("address.zipCode")}
              />
            </div>
            <Input
              label={t("settings.fields.country")}
              {...register("address.country")}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Phone size={20} />
            </div>
            <h3 className="font-bold dark:text-white">
              {t("settings.contact.title")}
            </h3>
          </div>
          <div className="space-y-4">
            <Input
              label={t("settings.fields.phone")}
              {...register("contact.phone")}
              icon={Phone}
              className="w-full"
            />
            <Input
              label={t("settings.fields.email")}
              {...register("contact.email")}
              icon={Mail}
              className="w-full"
            />
          </div>
        </Card>
      </div>

      {isDirty && (
        <StickyActionBar onSave={handleSubmit(onSave)} saving={saving} t={t} />
      )}
    </motion.div>
  );
};

// 2. Service Config Tab (For Service Providers)
const ServiceConfigTab = ({ business, onSave, saving, t }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm();

  useEffect(() => {
    if (business?.serviceDetails) {
      reset({
        "serviceDetails.pricingModel":
          business.serviceDetails.pricingModel || "fixed",
        "serviceDetails.serviceRadiusKM":
          business.serviceDetails.serviceRadiusKM || 50,
        "serviceDetails.travelFee": business.serviceDetails.travelFee || 0,
      });
    }
  }, [business, reset]);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6 pb-24"
    >
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold dark:text-white">
              {t("settings.service.title")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("settings.service.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-gray-300">
              {t("settings.service.pricingModel")}
            </label>
            <select
              {...register("serviceDetails.pricingModel")}
              className="w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="fixed">
                {t("settings.service.models.fixed")}
              </option>
              <option value="hourly">
                {t("settings.service.models.hourly")}
              </option>
              <option value="package">
                {t("settings.service.models.package")}
              </option>
            </select>
          </div>

          <Input
            label={t("settings.service.radius")}
            type="number"
            {...register("serviceDetails.serviceRadiusKM")}
            icon={MapPin}
          />

          <Input
            label={t("settings.service.travelFee")}
            type="number"
            {...register("serviceDetails.travelFee")}
            icon={DollarSign}
          />
        </div>
      </Card>

      {isDirty && (
        <StickyActionBar onSave={handleSubmit(onSave)} saving={saving} t={t} />
      )}
    </motion.div>
  );
};

// 3. Spaces Tab (For Venues)
const SpacesTab = ({ spaces, refetch, t }) => {
  const [editingSpace, setEditingSpace] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onEdit = (space) => {
    setEditingSpace(space);
    reset({
      name: space.name || "",
      description: space.description || "",
      "capacity.min": space.capacity?.min || "",
      "capacity.max": space.capacity?.max || "",
      basePrice: space.basePrice || "",
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
      if (editingSpace._id) {
        await venueSpacesService.update(editingSpace._id, payload);
        toast.success(t("settings.spaces.updated"));
      } else {
        await venueSpacesService.create(payload);
        toast.success(t("settings.spaces.created"));
      }
      refetch();
      setEditingSpace(null);
    } catch (e) {
      toast.error(t("settings.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6 pb-24"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <Card
            key={space._id}
            className="p-6 relative group hover:border-orange-200 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <Grid3x3 size={20} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(space)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-blue-500"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg dark:text-white">{space.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 h-10">
              {space.description}
            </p>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <Badge variant="neutral">
                {space.capacity.min}-{space.capacity.max}{" "}
                {t("settings.spaces.guests")}
              </Badge>
              <span className="font-bold text-orange-600">
                {space.basePrice} TND
              </span>
            </div>
          </Card>
        ))}

        <button
          onClick={() => onEdit({})}
          className="p-6 rounded-2xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50/50 flex flex-col items-center justify-center min-h-[250px] transition-all group"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="text-orange-600" />
          </div>
          <span className="font-bold text-gray-600 group-hover:text-orange-700">
            {t("settings.spaces.addNew")}
          </span>
        </button>
      </div>

      {/* Inline Edit Modal Area */}
      <AnimatePresence>
        {editingSpace && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6">
              <h3 className="text-xl font-bold mb-4 dark:text-white">
                {editingSpace._id
                  ? t("settings.spaces.edit")
                  : t("settings.spaces.create")}
              </h3>
              <div className="space-y-4">
                <Input
                  label={t("settings.spaces.fields.name")}
                  {...register("name")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={t("settings.spaces.fields.minCap")}
                    type="number"
                    {...register("capacity.min")}
                  />
                  <Input
                    label={t("settings.spaces.fields.maxCap")}
                    type="number"
                    {...register("capacity.max")}
                  />
                </div>
                <Input
                  label={t("settings.spaces.fields.basePrice")}
                  type="number"
                  {...register("basePrice")}
                />
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditingSpace(null)}
                  >
                    {t("settings.common.cancel")}
                  </Button>
                  <Button onClick={handleSubmit(onSaveSpace)} loading={saving}>
                    {t("settings.common.save")}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
const BusinessSettings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { business, spaces, loading, refetch } = useBusinessData();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const { isDarkMode } = useTheme();
  const category = user?.business?.category || "venue";
  const isVenue = category === "venue";

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: "general", label: t("settings.tabs.general"), icon: Building2 },
    ];

    if (isVenue) {
      baseTabs.push(
        { id: "spaces", label: t("settings.tabs.spaces"), icon: Grid3x3 },
        {
          id: "amenities",
          label: t("settings.tabs.amenities"),
          icon: CheckCircle2,
        }
      );
    } else {
      baseTabs.push(
        { id: "service", label: t("settings.tabs.service"), icon: Settings }
        // Use window.location or navigate to switch to Portfolio page if needed
        // Here just a placeholder or link if portfolio is settings-managed
      );
    }
    return baseTabs;
  }, [category, t, isVenue]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data };
      await venueService.update(payload);
      toast.success(t("settings.notifications.updated"));
      refetch();
    } catch (error) {
      toast.error(t("settings.errors.saveFailed"));
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

  return (
    <SettingsLayout
      title={t("settings.title")}
      subtitle={t("settings.subtitle", { type: category })}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={isDarkMode}
    >
      <AnimatePresence mode="wait">
        {activeTab === "general" && (
          <GeneralTab
            key="general"
            business={business}
            onSave={handleSave}
            saving={saving}
            t={t}
          />
        )}

        {isVenue && activeTab === "spaces" && (
          <SpacesTab key="spaces" spaces={spaces} refetch={refetch} t={t} />
        )}

        {!isVenue && activeTab === "service" && (
          <ServiceConfigTab
            key="service"
            business={business}
            onSave={handleSave}
            saving={saving}
            t={t}
          />
        )}
      </AnimatePresence>
    </SettingsLayout>
  );
};

export default BusinessSettings;
