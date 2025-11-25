import React, { useState } from "react";
import { UserPlus, Plus, X, User, Mail, Phone, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext";
import { clientService } from "../../../../api";
import { useToast } from "../../../../hooks/useToast"; 

// ✅ Generic Components
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import ClientSelector from "../components/ClientSelector";

const Step2ClientSelection = () => {
  const { t } = useTranslation();
  const { 
    formData, 
    selectedClient, 
    handleSelectClient, 
    clients, 
    setClients, 
    errors, 
    setFormData, 
    setSelectedClient 
  } = useEventContext();
  
  const { showSuccess, showError, validationError } = useToast();
  
  const [showClientForm, setShowClientForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return validationError(t('eventForm.step2.validation.nameRequired'));
    
    try {
      setIsCreating(true);
      const response = await clientService.create(newClient);
      const createdClient = response.client || response.data;
      
      setClients(prev => [...prev, createdClient]);
      setSelectedClient(createdClient._id);
      setFormData(prev => ({ ...prev, clientId: createdClient._id }));
      
      setShowClientForm(false);
      setNewClient({ name: "", email: "", phone: "" });
      
      showSuccess(t('eventForm.messages.clientCreated', { name: createdClient.name }));
    } catch (error) {
      console.error(error);
      showError(t('eventForm.messages.clientCreationFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        
        {/* --- Header Section - FIXED: Better mobile layout --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 border-b border-gray-100 dark:border-gray-700 pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {t('eventForm.step2.clientSelection')}
              </h4>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                {t('eventForm.step2.subtitle', 'Select an existing client or add a new one')}
              </p>
            </div>
          </div>

          <Button 
            type="button" 
            variant={showClientForm ? "ghost" : "primary"} 
            size="sm" 
            icon={showClientForm ? X : Plus} 
            onClick={() => setShowClientForm(!showClientForm)}
            className="w-full sm:w-auto justify-center text-xs sm:text-sm"
          >
            {showClientForm ? t('common.cancel') : t('eventForm.step2.newClient')}
          </Button>
        </div>

        {/* --- Main Content --- */}
        {showClientForm ? (
          /* New Client Form - FIXED: Better mobile grid */
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 sm:p-6 rounded-xl border border-gray-200 dark:border-gray-600 animate-in slide-in-from-top-2 duration-300">
            <h5 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
              {t('eventForm.step2.newClient')}
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Input 
                label={t('eventForm.step2.clientNamePlaceholder')}
                placeholder={t('eventForm.step2.clientNamePlaceholder')} 
                value={newClient.name} 
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} 
                icon={User}
                required
                className="bg-white dark:bg-gray-800"
              />
              <Input 
                label={t('eventForm.step2.emailPlaceholder')}
                placeholder={t('eventForm.step2.emailPlaceholder')} 
                type="email" 
                value={newClient.email} 
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} 
                icon={Mail}
                className="bg-white dark:bg-gray-800"
              />
              <Input 
                label={t('eventForm.step2.phonePlaceholder')}
                placeholder={t('eventForm.step2.phonePlaceholder')} 
                type="tel" 
                value={newClient.phone} 
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} 
                icon={Phone}
                className="bg-white dark:bg-gray-800"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-600">
              <Button 
                type="button" 
                variant="success"
                icon={Plus} 
                onClick={handleCreateClient} 
                loading={isCreating}
                className="w-full sm:w-auto justify-center text-xs sm:text-sm"
              >
                {t('eventForm.step2.createAndSelect')}
              </Button>
            </div>
          </div>
        ) : (
          /* Existing Client Selector */
          <div className="min-h-[180px] sm:min-h-[200px]">
            <ClientSelector 
              clients={clients} 
              selectedClient={selectedClient} 
              onSelectClient={handleSelectClient} 
              error={errors.clientId} 
            />
            
            {!selectedClient && !errors.clientId && clients.length === 0 && (
              <div className="text-center py-8 sm:py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700 mt-3 sm:mt-4">
                <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-20" />
                <p className="text-xs sm:text-sm">{t('eventForm.step2.noClientsFound')}</p>
                <Button variant="link" onClick={() => setShowClientForm(true)} className="mt-2 text-xs sm:text-sm">
                  {t('eventForm.step2.createNewOne')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Step2ClientSelection;