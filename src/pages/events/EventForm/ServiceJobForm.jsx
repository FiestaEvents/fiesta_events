import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save, Calendar, MapPin, User, DollarSign, FileText, Check } from "lucide-react";

import { eventService, clientService } from "../../../api/index";
import { useToast } from "../../../hooks/useToast";

import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";

const ServiceJobForm = ({ defaultValues, isEditMode, category }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const isDriver = category === 'driver' || category === 'transport';

  // React Hook Form Setup
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: "",
      clientId: "",
      startDate: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endDate: new Date().toISOString().split('T')[0],
      endTime: "17:00",
      location: "", 
      status: "confirmed",
      basePrice: 0,
      description: "",
      ...defaultValues
    }
  });

  // Extract location from notes if editing (since backend stores it in notes for generic schema)
  useEffect(() => {
    if (isEditMode && defaultValues?.notes) {
      if (defaultValues.notes.startsWith("Location:")) {
        const parts = defaultValues.notes.split('|');
        setValue("location", parts[0].replace("Location:", "").trim());
        setValue("description", parts[1]?.trim() || "");
      } else {
        setValue("description", defaultValues.notes);
      }
    }
    // Pricing mapping
    if (isEditMode && defaultValues?.pricing) {
        setValue("basePrice", defaultValues.pricing.basePrice);
    }
  }, [defaultValues, isEditMode, setValue]);

  // Load Clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await clientService.getAll({ limit: 100 });
        setClients(res.clients || []);
      } catch (err) { console.error(err); }
    };
    fetchClients();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // 1. Prepare Payload
      const finalNotes = data.location 
        ? `Location: ${data.location} | ${data.description}`
        : data.description;

      const payload = {
        ...data,
        notes: finalNotes,
        pricing: {
          basePrice: Number(data.basePrice),
          totalPriceBeforeTax: Number(data.basePrice),
          totalPriceAfterTax: Number(data.basePrice),
          taxRate: 0, 
          discount: 0
        },
        // Clean up UI-only fields
        location: undefined,
        basePrice: undefined
      };

      // 2. Send API Request
      if (isEditMode) {
        await eventService.update(defaultValues._id, payload);
        showSuccess("Job updated successfully");
      } else {
        await eventService.create(payload);
        showSuccess("Job created successfully");
      }
      navigate("/events");
    } catch (error) {
      showError(error.message || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white rounded-lg max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? t("events.editJob") : t("events.newJob")}
          </h1>
          <p className="text-sm text-gray-500">
            {isDriver ? "Schedule a transport booking" : "Create a new creative project"}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/events')} type="button">
            {t("common.cancel")}
          </Button>
          <Button loading={loading} icon={Save} type="submit">
            {t("common.save")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={18} /> {t("events.details", "Job Details")}
            </h3>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("events.title", "Title")} <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title", { required: "Title is required" })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder={isDriver ? "Airport Transfer" : "Wedding Photography"}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("events.client", "Client")} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("clientId", { required: "Client is required" })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                >
                  <option value="">Select Client...</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("events.type", "Type")}
                </label>
                <select
                  {...register("type")}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                >
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="photoshoot">Photoshoot</option>
                  <option value="delivery">Delivery/Transport</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Location / Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  {...register("location")}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                  placeholder="e.g. Hotel Laico, Tunis"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes / Instructions
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
                placeholder="Details about the job..."
              />
            </div>
          </Card>
        </div>

        {/* Sidebar: Schedule & Price */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} /> Schedule
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Start</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" {...register("startDate")} className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                  <input type="time" {...register("startTime")} className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">End</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" {...register("endDate")} className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                  <input type="time" {...register("endTime")} className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <DollarSign size={18} /> Financials
            </h3>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Price (TND)</label>
              <input
                type="number"
                {...register("basePrice", { required: "Price is required", min: 0 })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                {...register("status")}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </Card>
        </div>

      </div>
    </form>
  );
};

export default ServiceJobForm;