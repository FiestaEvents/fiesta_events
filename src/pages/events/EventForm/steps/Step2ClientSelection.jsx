import React, { useState } from "react";
import { UserPlus, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext";
import ClientSelector from "../components/ClientSelector";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import { clientService } from "../../../../api";
import { useToast } from "../../../../hooks/useToast"; // ✅ Custom Toast

const Step2ClientSelection = () => {
  const { t } = useTranslation();
  const { formData, selectedClient, handleSelectClient, clients, setClients, errors, setFormData, setSelectedClient } = useEventContext();
  const { showSuccess, showError, validationError } = useToast(); // ✅ Hook usage
  
  const [showClientForm, setShowClientForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return validationError('Client Name');
    try {
      setIsCreating(true);
      const response = await clientService.create(newClient);
      const createdClient = response.client || response.data;
      setClients(prev => [...prev, createdClient]);
      setSelectedClient(createdClient._id);
      setFormData(prev => ({ ...prev, clientId: createdClient._id }));
      setShowClientForm(false);
      showSuccess(t('eventForm.messages.clientCreated', { name: createdClient.name }));
    } catch (error) {
      console.error(error);
      showError(t('eventForm.messages.clientCreationFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-500" /> {t('eventForm.step2.clientSelection')}
        </h4>
        <Button type="button" variant="primary" size="sm" icon={showClientForm ? X : Plus} onClick={() => setShowClientForm(!showClientForm)}>
          {showClientForm ? t('eventForm.step2.cancel') : t('eventForm.step2.newClient')}
        </Button>
      </div>

      {showClientForm ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <Input placeholder={t('eventForm.step2.clientNamePlaceholder')} value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
            <Input placeholder={t('eventForm.step2.emailPlaceholder')} type="email" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
            <Input placeholder={t('eventForm.step2.phonePlaceholder')} type="tel" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="primary" icon={Plus} onClick={handleCreateClient} loading={isCreating}>
              {t('eventForm.step2.createAndSelect')}
            </Button>
          </div>
        </div>
      ) : (
        <ClientSelector clients={clients} selectedClient={selectedClient} onSelectClient={handleSelectClient} error={errors.clientId} />
      )}
    </div>
  );
};

export default Step2ClientSelection;