import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Save,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Users,
  UserPlus,
  Loader2,
  Check,
  User,
} from "lucide-react";

// API & Services
import { eventService, clientService } from "../../../api/index";
import { useToast } from "../../../hooks/useToast";

// Components
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import ClientSelector from "./components/ClientSelector"; // Ensure this component handles dark mode props or classes internally

const ServiceJobForm = ({ defaultValues, isEditMode, category }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingClients, setFetchingClients] = useState(true);

  // Client Creation State
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [createClientLoading, setCreateClientLoading] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const isDriver = category === "driver" || category === "transport";

  // React Hook Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      clientId: "",
      guestCount: "",
      startDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endDate: new Date().toISOString().split("T")[0],
      endTime: "17:00",
      location: "",
      status: "confirmed",
      basePrice: 0,
      description: "",
      ...defaultValues,
    },
  });

  const selectedClientId = useWatch({ control, name: "clientId" });

  // 1. Initialize Form Data
  useEffect(() => {
    if (isEditMode && defaultValues) {
      if (defaultValues.notes) {
        if (defaultValues.notes.startsWith("Location:")) {
          const parts = defaultValues.notes.split("|");
          setValue("location", parts[0].replace("Location:", "").trim());
          setValue("description", parts[1]?.trim() || "");
        } else {
          setValue("description", defaultValues.notes);
        }
      }

      if (defaultValues.pricing?.basePrice)
        setValue("basePrice", defaultValues.pricing.basePrice);
      if (defaultValues.guestCount)
        setValue("guestCount", defaultValues.guestCount);

      if (defaultValues.clientId) {
        const cId =
          typeof defaultValues.clientId === "object"
            ? defaultValues.clientId._id
            : defaultValues.clientId;
        setValue("clientId", cId);
      }
    }
  }, [defaultValues, isEditMode, setValue]);

  // 2. Fetch Clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await clientService.getAll({ limit: 100 });
        const clientList = res.clients || [];
        setClients(clientList);

        if (defaultValues?.clientId) {
          const cId =
            typeof defaultValues.clientId === "object"
              ? defaultValues.clientId._id
              : defaultValues.clientId;
          if (clientList.find((c) => c._id === cId)) {
            setValue("clientId", cId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingClients(false);
      }
    };
    fetchClients();
  }, [defaultValues, setValue]);

  // Client Handlers
  const handleClientSelect = (client) => {
    setValue("clientId", client._id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setShowCreateClient(false);
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    if (!newClientData.name) return;

    try {
      setCreateClientLoading(true);
      const res = await clientService.create(newClientData);
      const created = res.data?.client || res.client || res.data;

      setClients((prev) => [...prev, created]);
      handleClientSelect(created);

      setNewClientData({ name: "", email: "", phone: "" });
      showSuccess(
        t("eventForm.messages.clientCreated", { name: created.name })
      );
    } catch (err) {
      console.error(err);
      showError(t("eventForm.messages.clientCreationFailed"));
    } finally {
      setCreateClientLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const finalNotes = data.location
        ? `Location: ${data.location} | ${data.description}`
        : data.description;

      const payload = {
        ...data,
        notes: finalNotes,
        guestCount: data.guestCount ? parseInt(data.guestCount, 10) : undefined,
        pricing: {
          basePrice: Number(data.basePrice),
          totalPriceBeforeTax: Number(data.basePrice),
          totalPriceAfterTax: Number(data.basePrice),
          taxRate: 0,
          discount: 0,
        },
        location: undefined,
        basePrice: undefined,
      };

      if (isEditMode) {
        await eventService.update(defaultValues._id, payload);
        showSuccess(t("eventForm.messages.eventUpdated"));
      } else {
        await eventService.create(payload);
        showSuccess(t("eventForm.messages.eventCreated"));
      }
      navigate("/events");
    } catch (error) {
      showError(error.message || t("eventForm.messages.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 bg-white dark:bg-gray-900 rounded-lg max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-orange-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditMode
              ? t("eventForm.header.editEvent")
              : t("eventForm.header.createNewEvent")}
          </h1>
          <p className="text-orange-600 dark:text-orange-400 font-medium mt-1">
            {category === "venue"
              ? t("eventForm.header.venueEvent")
              : t("eventForm.header.creativeProject")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/events")}
            type="button"
            className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("common.cancel")}
          </Button>
          <Button
            loading={loading}
            icon={Save}
            type="submit"
            variant="primary"
            className="shadow-lg shadow-orange-500/20"
          >
            {t("common.save")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 shadow-sm border border-orange-50 dark:border-gray-800 hover:border-orange-200 dark:hover:border-gray-700 transition-colors bg-white dark:bg-gray-800">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <FileText
                  size={20}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
              {t("eventForm.step1.eventDetails")}
            </h3>

            {/* Title */}
            <div className="space-y-2 mb-6">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("eventForm.step1.eventTitle")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title", { required: true })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder-gray-400 dark:placeholder-gray-500"
                placeholder={t("eventForm.step1.placeholders.title")}
              />
              {errors.title && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  Title is required
                </p>
              )}
            </div>

            {/* --- CLIENT SELECTOR SECTION --- */}
            <div className="mb-6 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("eventForm.step5.fields.client")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCreateClient(!showCreateClient)}
                  className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1 transition-colors"
                >
                  {showCreateClient ? (
                    t("eventForm.step2.selectExisting")
                  ) : (
                    <>
                      <UserPlus size={14} /> {t("eventForm.step2.newClient")}
                    </>
                  )}
                </button>
              </div>

              {showCreateClient ? (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 animate-in slide-in-from-top-2">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    {t("eventForm.step2.createForm.title")}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder={t(
                        "eventForm.step2.createForm.placeholders.name"
                      )}
                      value={newClientData.name}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          name: e.target.value,
                        })
                      }
                    />
                    <input
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder={t(
                        "eventForm.step2.createForm.placeholders.phone"
                      )}
                      value={newClientData.phone}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          phone: e.target.value,
                        })
                      }
                    />
                    <input
                      className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-orange-500 md:col-span-2 placeholder-gray-400 dark:placeholder-gray-500"
                      placeholder={t(
                        "eventForm.step2.createForm.placeholders.email"
                      )}
                      value={newClientData.email}
                      onChange={(e) =>
                        setNewClientData({
                          ...newClientData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleCreateClient}
                      disabled={createClientLoading || !newClientData.name}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2 transition-all shadow-md shadow-orange-500/20"
                    >
                      {createClientLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      {t("eventForm.step2.createButton")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <ClientSelector
                    clients={clients}
                    selectedClient={selectedClientId}
                    onSelectClient={handleClientSelect}
                    error={errors.clientId?.message}
                    // Pass dark mode awareness if needed, or rely on CSS classes within component
                  />
                  {/* Hidden input for RHF Validation */}
                  <input
                    type="hidden"
                    {...register("clientId", { required: true })}
                  />
                </>
              )}
            </div>
            {/* --- END CLIENT SELECTOR --- */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("eventForm.step1.eventType")}
                </label>
                <div className="relative">
                  <select
                    {...register("type")}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="wedding">
                      {t("eventForm.step1.eventTypes.wedding")}
                    </option>
                    <option value="corporate">
                      {t("eventForm.step1.eventTypes.corporate")}
                    </option>
                    <option value="birthday">
                      {t("eventForm.step1.eventTypes.birthday")}
                    </option>
                    <option value="conference">
                      {t("eventForm.step1.eventTypes.conference")}
                    </option>
                    <option value="party">
                      {t("eventForm.step1.eventTypes.party")}
                    </option>
                    <option value="social">
                      {t("eventForm.step1.eventTypes.social")}
                    </option>
                    <option value="other">
                      {t("eventForm.step1.eventTypes.other")}
                    </option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    {...register("location")}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder="e.g. Hotel Laico"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Guest Count */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("eventForm.step1.guestCount")}{" "}
                  <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">
                    (Optional)
                  </span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-3.5 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    {...register("guestCount", { min: 0 })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none placeholder-gray-400 dark:placeholder-gray-500"
                    placeholder={t("eventForm.step1.placeholders.guests")}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("eventForm.step1.notesLabel")}
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none resize-none placeholder-gray-400 dark:placeholder-gray-500"
                placeholder={t("eventForm.step1.placeholders.notes")}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar: Schedule & Price */}
        <div className="space-y-6">
          <Card className="p-6 shadow-sm border border-orange-50 dark:border-gray-800 hover:border-orange-200 dark:hover:border-gray-700 transition-colors bg-white dark:bg-gray-800">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Calendar
                  size={20}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              {t("eventForm.step3.Schedule")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                  {t("eventForm.step1.startDate")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    {...register("startDate")}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm focus:border-orange-500 outline-none"
                  />
                  <input
                    type="time"
                    {...register("startTime")}
                    className="w-28 p-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">
                  {t("eventForm.step1.endDate")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    {...register("endDate")}
                    className="w-full p-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm focus:border-orange-500 outline-none"
                  />
                  <input
                    type="time"
                    {...register("endTime")}
                    className="w-28 p-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg text-sm focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-sm border border-orange-50 dark:border-gray-800 hover:border-orange-200 dark:hover:border-gray-700 transition-colors bg-white dark:bg-gray-800">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <DollarSign
                  size={20}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              {t("eventForm.step3.pricing")}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  {t("eventForm.step5.financials.total")} (TND)
                </label>
                <input
                  type="number"
                  {...register("basePrice", { required: true, min: 0 })}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none font-mono text-lg placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Status
                </label>
                <div className="relative">
                  <select
                    {...register("status")}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none appearance-none cursor-pointer"
                  >
                    <option value="pending">
                      {t("eventList.filters.pending")}
                    </option>
                    <option value="confirmed">
                      {t("eventList.filters.confirmed")}
                    </option>
                    <option value="completed">
                      {t("eventList.filters.completed")}
                    </option>
                    <option value="cancelled">
                      {t("eventList.filters.cancelled")}
                    </option>
                  </select>
                  <div className="absolute right-4 top-4 pointer-events-none text-gray-500">
                    <Check size={16} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
};

export default ServiceJobForm;
