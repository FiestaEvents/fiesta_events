import React, { useState } from "react";
import { UserPlus, Search, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext";
import { clientService } from "../../../../api";
import { useToast } from "../../../../hooks/useToast"; 

// Generic Components
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import ClientSelector from "../components/ClientSelector";

const Step2ClientSelection = () => {
  const { t } = useTranslation();
  const { 
    selectedClient, handleSelectClient, clients, setClients, 
    errors, setFormData, setSelectedClient 
  } = useEventContext();
  
  const { showSuccess, showError, validationError } = useToast();
  
  const [showClientForm, setShowClientForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return validationError("Name is required");
    try {
      setIsCreating(true);
      const response = await clientService.create(newClient);
      const createdClient = response.client || response.data;
      setClients(prev => [...prev, createdClient]);
      setSelectedClient(createdClient._id);
      setFormData(prev => ({ ...prev, clientId: createdClient._id }));
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
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Select Client</h3>
          <p className="text-sm text-gray-500">Who is this event for?</p>
        </div>
        <Button 
          type="button" 
          variant="outline"
          size="sm"
          onClick={() => setShowClientForm(!showClientForm)}
        >
          {showClientForm ? "Cancel" : "New Client"}
        </Button>
      </div>

      {showClientForm ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-in fade-in">
          <h4 className="font-bold mb-4">Add New Client</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input 
              label="Name" 
              value={newClient.name} 
              onChange={e => setNewClient({...newClient, name: e.target.value})} 
            />
            <Input 
              label="Email" 
              value={newClient.email} 
              onChange={e => setNewClient({...newClient, email: e.target.value})} 
            />
            <Input 
              label="Phone" 
              value={newClient.phone} 
              onChange={e => setNewClient({...newClient, phone: e.target.value})} 
            />
          </div>
          <div className="flex justify-end">
             <Button type="button" onClick={handleCreateClient} loading={isCreating} icon={Plus}>
                Create Client
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