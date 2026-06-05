import React, { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { UserPlus, User, Loader2 } from "lucide-react";
import { clientService } from "../../../../api/index";
import ClientSelector from "../components/ClientSelector";
import Button from "../../../../components/common/Button"; 

const Step2ClientSelection = () => {
  const { t } = useTranslation();

  // 1. Get Form Methods
  const {
    setValue,
    control,
    register,
    formState: { errors },
  } = useFormContext();

  // 2. Watch current value
  const selectedClientId = useWatch({ control, name: "clientId" });

  // 3. Local State for Logic
  const [clients, setClients] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Local state for "Quick Create" form
  const [newClientData, setNewClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // 4. Fetch Clients on Mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await clientService.getAll();
        setClients(res.data?.clients || res.clients || []);
      } catch (err) {
        console.error("Error loading clients", err);
      }
    };
    loadClients();
  }, []);

  // 5. Handlers
  const handleClientSelect = (client) => {
    setValue("clientId", client._id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setShowCreateForm(false);
  };

  const handleCreateClient = async (e) => {
    // 🛑 STOP SUBMIT PROPAGATION
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (!newClientData.name) return;

    try {
      setCreateLoading(true);
      const res = await clientService.create(newClientData);
      const created = res.data?.client || res.client || res.data;

      setClients((prev) => [...prev, created]);
      handleClientSelect(created);

      setShowCreateForm(false);
      setNewClientData({ name: "", email: "", phone: "" });
    } catch (err) {
      console.error("Create client failed", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleNewClientChange = (field, value) => {
    setNewClientData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
        </div>
        
        {/* NATIVE TOGGLE BUTTON */}
        <button
          type="button" 
          onClick={(e) => { e.preventDefault(); setShowCreateForm(!showCreateForm); }}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded border transition-colors ${
             showCreateForm 
                ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600" 
                : "bg-orange-600 text-white border-orange-600 hover:bg-orange-700"
          }`}
        >
          {showCreateForm ? (
              <>
                <User className="w-4 h-4" /> 
                {t("eventForm.step2.selectExisting")}
              </>
          ) : (
              <>
                <UserPlus className="w-4 h-4" /> 
                {t("eventForm.step2.newClient")}
              </>
          )}
        </button>
      </div>

      {/* Logic: Show Create Form OR Search List */}
      {showCreateForm ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white mb-2">
            {t("eventForm.step2.createForm.title")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("eventForm.step2.createForm.fullName")}
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={newClientData.name}
                onChange={(e) => handleNewClientChange("name", e.target.value)}
                placeholder={t("eventForm.step2.createForm.placeholders.name")}
                // Block enter key submission
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("eventForm.step2.createForm.phone")}
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={newClientData.phone}
                onChange={(e) => handleNewClientChange("phone", e.target.value)}
                placeholder={t("eventForm.step2.createForm.placeholders.phone")}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("eventForm.step2.createForm.email")}
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={newClientData.email}
                onChange={(e) => handleNewClientChange("email", e.target.value)}
                placeholder={t("eventForm.step2.createForm.placeholders.email")}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
            <button
              type="button"
              onClick={handleCreateClient}
              disabled={createLoading}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UserPlus className="w-4 h-4" />}
              {t("eventForm.step2.createButton")}
            </button>
          </div>
        </div>
      ) : (
        <ClientSelector
          clients={clients}
          selectedClient={selectedClientId}
          onSelectClient={handleClientSelect}
          error={errors.clientId?.message}
        />
      )}

      {/* Hidden input to ensure RHF tracks validation */}
      <input type="hidden" {...register("clientId")} />
    </div>
  );
};

export default Step2ClientSelection;