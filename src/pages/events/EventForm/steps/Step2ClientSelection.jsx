//src/pages/events/EventForm/steps/Step2ClientSelection.jsx
import React from "react";
import { Plus, X, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clientService } from "../../../../api";
import { useToast } from "../../../../hooks/useToast";
import { useEventContext } from "../EventFormContext";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";

const Step2ClientSelection = () => {
  const { t } = useTranslation();
  const {
    selectedClient,
    handleSelectClient,
    clients,
    setClients,
    errors,
  } = useEventContext();

  const { showSuccess, showError, validationError } = useToast();

  const [showClientForm, setShowClientForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return validationError(t("eventForm.step2.nameRequired"));
    if (!newClient.email.trim()) return validationError(t("eventForm.step2.emailRequired"));
    if (!newClient.phone.trim()) return validationError(t("eventForm.step2.phoneRequired"));

    try {
      setIsCreating(true);
      const response = await clientService.create(newClient);
      const createdClient = response.client || response.data;

      setClients(prev => [...prev, createdClient]);
      handleSelectClient(createdClient);
      
      setShowClientForm(false);
      setNewClient({ name: "", email: "", phone: "" });
      showSuccess(t("eventForm.step2.clientCreated", { name: createdClient.name }));
    } catch (error) {
      console.error("Create client error:", error);
      showError(t("eventForm.step2.createError"));
    } finally {
      setIsCreating(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("eventForm.step2.clientSelection")}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("eventForm.step2.clientSelectionDescription")}
          </p>
        </div>
        <Button
          type="button"
          variant={showClientForm ? "outline" : "primary"}
          icon={showClientForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          size="sm"
          onClick={() => setShowClientForm(!showClientForm)}
          className="shrink-0"
        >
          {showClientForm ? t("common.cancel") : t("eventForm.step2.newClient")}
        </Button>
      </div>

      {/* Create Client Form */}
      {showClientForm ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
          <h4 className="font-bold text-gray-900 dark:text-white mb-4">
            {t("eventForm.step2.newClientDetails")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input
              label={t("eventForm.step2.clientName")}
              value={newClient.name}
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
              placeholder={t("eventForm.step2.clientNamePlaceholder")}
              required
              className="w-full"
            />
            <Input
              label={t("eventForm.step2.clientEmail")}
              type="email"
              value={newClient.email}
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
              placeholder={t("eventForm.step2.emailPlaceholder")}
              required
              className="w-full"
            />
            <Input
              label={t("eventForm.step2.clientPhone")}
              type="tel"
              value={newClient.phone}
              onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
              placeholder={t("eventForm.step2.phonePlaceholder")}
              required
              className="w-full"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleCreateClient}
              loading={isCreating}
              icon={<Plus className="w-4 h-4" />}
            >
              {t("eventForm.step2.createClient")}
            </Button>
          </div>
        </div>
      ) : (
        /* Client Selector */
        <div className="space-y-4">
          {/* Search */}
          <Input
            icon={Search}
            placeholder={t("eventForm.step2.searchClients")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          {/* Client Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
            {filteredClients.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {t("eventForm.step2.noClients")}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {t("eventForm.step2.noClientsDescription")}
                </p>
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedClient?._id === client._id;
                return (
                  <button
                    key={client._id}
                    type="button"
                    onClick={() => handleSelectClient(client)}
                    className={`
                      flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all
                      ${isSelected
                        ? "bg-orange-50 border-orange-500 dark:bg-orange-900/20 dark:border-orange-500 ring-2 ring-orange-200 dark:ring-orange-800"
                        : "bg-white border-gray-200 hover:border-orange-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:border-orange-600"
                      }
                    `}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isSelected ? "text-orange-900 dark:text-orange-100" : "text-gray-900 dark:text-white"}`}>
                        {client.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {client.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {client.phone}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="shrink-0">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Error Message */}
          {errors.clientId && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.clientId}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Step2ClientSelection;