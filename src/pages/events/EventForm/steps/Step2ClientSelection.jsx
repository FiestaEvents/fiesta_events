// src/components/events/EventForm/steps/Step2ClientSelection.jsx
import React, { useState } from "react";
import { UserPlus, Plus, X } from "lucide-react";
import ClientSelector from "../components/ClientSelector";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import { toast } from "react-hot-toast";

const Step2ClientSelection = ({
  formData,
  selectedClient,
  handleSelectClient,
  clients,
  errors,
  onCreateClient,
}) => {
  const [showClientForm, setShowClientForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast.error("Client name is required");
      return;
    }

    if (newClient.email && !/^\S+@\S+\.\S+$/.test(newClient.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (newClient.phone && newClient.phone.length !== 8) {
      toast.error("Phone number must be 8 digits");
      return;
    }

    try {
      setIsCreating(true);
      await onCreateClient(newClient);
      setNewClient({ name: "", email: "", phone: "" });
      setShowClientForm(false);
    } catch (error) {
      console.error("Error creating client:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-500" />
          Client Selection
        </h4>
        <Button
          type="button"
          variant="primary"
          size="sm"
          icon={showClientForm ? X : Plus}
          onClick={() => setShowClientForm(!showClientForm)}
        >
          {showClientForm ? "Cancel" : "New Client"}
        </Button>
      </div>

      {/* Create Client Form */}
      {showClientForm && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-900/20 border-2 border-gray-200 dark:border-gray-800 rounded-lg animate-in slide-in-from-top-2 duration-300">
          <h5 className="font-semibold text-gray-800 dark:text-gray-300 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create New Client
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <Input
              placeholder="Client Name *"
              value={newClient.name}
              onChange={(e) =>
                setNewClient((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <Input
              placeholder="Email"
              type="email"
              value={newClient.email}
              onChange={(e) =>
                setNewClient((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Input
              placeholder="Phone Number (8 digits)"
              type="tel"
              pattern="[0-9]{8}"
              maxLength={8}
              value={newClient.phone}
              onChange={(e) => {
                const numbersOnly = e.target.value.replace(/\D/g, "").slice(0, 8);
                setNewClient((prev) => ({ ...prev, phone: numbersOnly }));
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              icon={Plus}
              onClick={handleCreateClient}
              loading={isCreating}
            >
              Create & Select Client
            </Button>
          </div>
        </div>
      )}

      {/* Client Selector */}
      {!showClientForm && (
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