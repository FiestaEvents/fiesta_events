import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, CheckCircle2, Grid3x3, Save, Plus, Trash2, Edit2,
  Clock, MapPin, Phone, Mail, X, Briefcase, Camera, Truck,
  Settings, DollarSign, BoxIcon,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { venueService, venueSpacesService } from "../../api/index";

import SettingsLayout from "../../components/shared/SettingsLayout";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import OrbitLoader from "../../components/common/LoadingSpinner";

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
        business:
          bizRes.data?.venue || bizRes.venue || bizRes.data?.business || {},
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
const StickyActionBar = ({ onSave, saving, t, darkMode }) => (
  <motion.div
    initial={{ y: 100 }}
    animate={{ y: 0 }}
    className={`fixed bottom-6 right-6 z-40 p-4 rounded-2xl shadow-xl flex items-center gap-4 border ${
      darkMode
        ? "bg-gray-800 border-gray-700 text-white shadow-black/50"
        : "bg-white border-orange-100 text-gray-900"
    }`}
  >
    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
      {t("settings.common.unsavedChanges")}
    </div>
    <Button
      onClick={onSave}
      loading={saving}
      icon={Save}
      className="shadow-lg shadow-orange-500/20"
      darkMode={darkMode}
    >
      {t("settings.common.saveChanges")}
    </Button>
  </motion.div>
);

// 1. General Tab
const GeneralTab = ({ business, onSave, saving, t, darkMode }) => {
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
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-24"
    >
      <Card className="p-6" darkMode={darkMode}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {t("settings.general.title")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("settings.general.subtitle")}
            </p>
          </div>
        </div>
        <div className="grid gap-5">
          <Input
            label={t("settings.fields.name")}
            {...register("name")}
            className="w-full"
            darkMode={darkMode}
          />
          <Textarea
            label={t("settings.fields.description")}
            {...register("description")}
            rows={3}
            className="w-full"
            darkMode={darkMode}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" darkMode={darkMode}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {t("settings.location.title")}
            </h3>
          </div>
          <div className="space-y-4">
            <Input
              label={t("settings.fields.address")}
              {...register("address.street")}
              darkMode={darkMode}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("settings.fields.city")}
                {...register("address.city")}
                darkMode={darkMode}
              />
              <Input
                label={t("settings.fields.zip")}
                {...register("address.zipCode")}
                darkMode={darkMode}
              />
            </div>
            <Input
              label={t("settings.fields.country")}
              {...register("address.country")}
              darkMode={darkMode}
            />
          </div>
        </Card>

        <Card className="p-6" darkMode={darkMode}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
              <Phone size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {t("settings.contact.title")}
            </h3>
          </div>
          <div className="space-y-4">
            <Input
              label={t("settings.fields.phone")}
              {...register("contact.phone")}
              icon={Phone}
              darkMode={darkMode}
            />
            <Input
              label={t("settings.fields.email")}
              {...register("contact.email")}
              icon={Mail}
              darkMode={darkMode}
            />
          </div>
        </Card>
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

// 2. Service Config Tab
const ServiceConfigTab = ({ business, onSave, saving, t, darkMode }) => {
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
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-24"
    >
      <Card className="p-6" darkMode={darkMode}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
            <Settings size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold dark:text-white">
              {t("settings.service.title")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
              className={`w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
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
            darkMode={darkMode}
          />
          <Input
            label={t("settings.service.travelFee")}
            type="number"
            {...register("serviceDetails.travelFee")}
            icon={DollarSign}
            darkMode={darkMode}
          />
        </div>
      </Card>
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

// 3. Dynamic Resources Tab (Spaces / Fleet / Equipment)
const SpacesTab = ({ spaces, refetch, t, darkMode, labels }) => {
  const [editingSpace, setEditingSpace] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  // Labels Default (Venue)
  const L = {
    itemName: t("settings.spaces.fields.name"),
    capLabel: t("settings.spaces.guests"),
    addBtn: t("settings.spaces.addNew"),
    editTitle: t("settings.spaces.edit"),
    createTitle: t("settings.spaces.create"),
    ...labels,
  };

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

  const onDelete = async (id) => {
    if (!window.confirm(L.deleteMsg || t("settings.spaces.confirmDelete")))
      return;
    try {
      await venueSpacesService.delete(id);
      toast.success("Deleted");
      refetch();
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-24"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space) => (
          <Card
            key={space._id}
            className={`p-6 relative group hover:border-orange-200 transition-all ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
            darkMode={darkMode}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-600">
                <Grid3x3 size={20} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(space)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-blue-500"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDelete(space._id)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg dark:text-white">{space.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10">
              {space.description}
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <Badge variant="neutral">
                {space.capacity.min}-{space.capacity.max} {L.capLabel}
              </Badge>
              <span className="font-bold text-orange-600 dark:text-orange-400">
                {space.basePrice} TND
              </span>
            </div>
          </Card>
        ))}

        <button
          onClick={() => onEdit({})}
          className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center min-h-[250px] transition-all group ${
            darkMode 
              ? "border-gray-700 hover:border-orange-500 hover:bg-gray-800" 
              : "border-gray-300 hover:border-orange-500 hover:bg-orange-50/50"
          }`}
        >
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="text-orange-600 dark:text-orange-400" />
          </div>
          <span className="font-bold text-gray-600 dark:text-gray-400 group-hover:text-orange-700 dark:group-hover:text-orange-400">
            {L.addBtn}
          </span>
        </button>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingSpace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <div
              className={`rounded-2xl shadow-2xl w-full max-w-lg p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}
            >
              <h3 className="text-xl font-bold mb-4 dark:text-white">
                {editingSpace._id ? L.editTitle : L.createTitle}
              </h3>
              <div className="space-y-4">
                <Input
                  label={L.itemName}
                  {...register("name", { required: true })}
                  darkMode={darkMode}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Min"
                    type="number"
                    {...register("capacity.min")}
                    darkMode={darkMode}
                  />
                  <Input
                    label="Max"
                    type="number"
                    {...register("capacity.max")}
                    darkMode={darkMode}
                  />
                </div>
                <Input
                  label={L.priceLabel || "Price"}
                  type="number"
                  {...register("basePrice")}
                  darkMode={darkMode}
                />
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditingSpace(null)}
                    darkMode={darkMode}
                  >
                    {t("settings.common.cancel")}
                  </Button>
                  <Button onClick={handleSubmit(onSaveSpace)} loading={saving} darkMode={darkMode}>
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
  
  // FIX: Using the Context definition you provided
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const { business, spaces, loading, refetch } = useBusinessData();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const category = user?.business?.category || "venue";
  const isVenue = category === "venue";
  const isDriver = category === "driver" || category === "transport";

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
    } else if (isDriver) {
      baseTabs.push(
        { id: "spaces", label: t("settings.tabs.fleet", "Fleet"), icon: Truck },
        { id: "service", label: t("settings.tabs.service"), icon: Settings }
      );
    } else {
      baseTabs.push({
        id: "service",
        label: t("settings.tabs.service"),
        icon: Settings,
      });
      if (["music", "security", "decoration"].includes(category)) {
        baseTabs.push({
          id: "spaces",
          label: t("settings.tabs.equipment", "Equipment"),
          icon: BoxIcon,
        });
      }
    }
    return baseTabs;
  }, [category, t, isVenue, isDriver]);

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
      <div
        className={`h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
      >
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
            darkMode={isDarkMode}
          />
        )}

        {(isVenue ||
          isDriver ||
          ["music", "security", "decoration"].includes(category)) &&
          activeTab === "spaces" && (
            <SpacesTab
              key="spaces"
              spaces={spaces}
              refetch={refetch}
              t={t}
              darkMode={isDarkMode}
              labels={
                isDriver
                  ? {
                      itemName: "Vehicle Name",
                      capLabel: "Seats",
                      addBtn: "Add Vehicle",
                      editTitle: "Edit Vehicle",
                      createTitle: "Add Vehicle",
                    }
                  : !isVenue
                    ? {
                        itemName: "Item Name",
                        capLabel: "Quantity",
                        addBtn: "Add Item",
                        editTitle: "Edit Item",
                        createTitle: "Add Item",
                      }
                    : null
              }
            />
          )}

        {!isVenue && activeTab === "service" && (
          <ServiceConfigTab
            key="service"
            business={business}
            onSave={handleSave}
            saving={saving}
            t={t}
            darkMode={isDarkMode}
          />
        )}
      </AnimatePresence>
    </SettingsLayout>
  );
};

export default BusinessSettings;