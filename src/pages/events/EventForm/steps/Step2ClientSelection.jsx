import { Plus, XIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { clientService } from "../../../../api";
import { useToast } from "../../../../hooks/useToast";
import { useEventContext } from "../EventFormContext";

// Generic Components
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import ClientSelector from "../components/ClientSelector";

const Step2ClientSelection = () => {
  const { t } = useTranslation();
  const {
    selectedClient,
    handleSelectClient,
    clients,
    setClients,
    errors,
    setFormData,
    setSelectedClient,
  } = useEventContext();

  const { showSuccess, showError, validationError } = useToast();

  const [showClientForm, setShowClientForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return validationError("Name is required");
    try {
      setIsCreating(true);
      const response = await clientService.create(newClient);
      const createdClient = response.client || response.data;
      setClients((prev) => [...prev, createdClient]);
      setSelectedClient(createdClient._id);
      setFormData((prev) => ({ ...prev, clientId: createdClient._id }));
      setShowClientForm(false);
      setNewClient({ name: "", email: "", phone: "" });
      showSuccess(`Client ${createdClient.name} created`);
    } catch (error) {
      showError("Failed to create client");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {t("eventForm.step2.clientSelection")}
          </h3>
          <p className="text-sm text-gray-500">
            {t("eventForm.step2.clientSelectionDescription")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          icon={
            // Change icon based on form visibility
            showClientForm ? (
              <XIcon className="size-4" />
            ) : (
              <Plus className="size-4" />
            )
          }
          size="sm"
          onClick={() => setShowClientForm(!showClientForm)}
        >
          {showClientForm
            ? t("eventForm.step2.cancel")
            : t("eventForm.step2.newClient")}
        </Button>
      </div>

      {showClientForm ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-in fade-in">
          <h4 className="font-bold mb-4">
            {t("eventForm.step2.newClientDetails")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              className="w-full"
              label={t("eventForm.step2.clientName")}
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
            />
            <Input
              className="w-full"
              label={t("eventForm.step2.clientEmail")}
              value={newClient.email}
              onChange={(e) =>
                setNewClient({ ...newClient, email: e.target.value })
              }
            />
            <Input
              className="w-full"
              label={t("eventForm.step2.clientPhone")}
              value={newClient.phone}
              onChange={(e) =>
                setNewClient({ ...newClient, phone: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleCreateClient}
              loading={isCreating}
              icon={<Plus className="size-4" />}
            >
              {t("eventForm.step2.createClient")}
            </Button>
          </div>
        </div>
      ) : (
        <ClientSelector
          clients={clients}
          selectedClient={selectedClient}
          onSelectClient={handleSelectClient}
          error={errors.clientId}
        />
      )}
    </div>
  );
};

export default Step2ClientSelection;
