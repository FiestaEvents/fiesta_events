import React, { useState, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { UserPlus, User } from "lucide-react";
import { clientService } from "../../../../api/index";
import ClientSelector from "../components/ClientSelector";
import Button from "../../../../components/common/Button";
import { FormInput } from "../../../../components/forms/FormInput"; // Use RHF Input for creation

const Step2ClientSelection = () => {
  const { t } = useTranslation();
  // 1. Get Form Methods
  const { setValue, control, register, formState: { errors } } = useFormContext();
  
  // 2. Watch current value
  const selectedClientId = useWatch({ control, name: "clientId" });

  // 3. Local State for Logic
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  
  // Local state for "Quick Create" form (independent of main event form)
  const [newClientData, setNewClientData] = useState({ name: "", email: "", phone: "" });

  // 4. Fetch Clients on Mount
  useEffect(() => {
    const loadClients = async () => {
      try {
        const res = await clientService.getAll();
        setClients(res.data?.clients || res.clients || []);
      } catch (err) {
        console.error("Error loading clients", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadClients();
  }, []);

  // 5. Handlers
  const handleClientSelect = (client) => {
    // RHF: Set the value in the form
    setValue("clientId", client._id, { shouldValidate: true, shouldDirty: true });
    // Optional: Hide create form if open
    setShowCreateForm(false);
  };

  const handleCreateClient = async () => {
    if (!newClientData.name) return; // Add simple validation

    try {
      setCreateLoading(true);
      const res = await clientService.create(newClientData);
      const created = res.data?.client || res.client || res.data;

      // Add to list and select immediately
      setClients(prev => [...prev, created]);
      handleClientSelect(created);
      
      // Reset
      setShowCreateForm(false);
      setNewClientData({ name: "", email: "", phone: "" });
    } catch (err) {
      console.error("Create client failed", err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleNewClientChange = (field, value) => {
    setNewClientData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Client Selection
          </h2>
          <p className="text-sm text-gray-500">
            Who is this event for? Select existing or create new.
          </p>
        </div>
        <Button
           type="button"
           onClick={() => setShowCreateForm(!showCreateForm)}
           variant={showCreateForm ? "secondary" : "primary"}
           icon={showCreateForm ? <User className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
           size="sm"
        >
           {showCreateForm ? "Select Existing" : "New Client"}
        </Button>
      </div>

      {/* Logic: Show Create Form OR Search List */}
      {showCreateForm ? (
         <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Create New Client</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* 
                 NOTE: These inputs are NOT using RHF register() because 
                 this is a "mini-form" inside the step, not part of the main Event data.
               */}
               <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input 
                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                     value={newClientData.name}
                     onChange={(e) => handleNewClientChange('name', e.target.value)}
                     placeholder="e.g. John Doe"
                  />
               </div>
               <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input 
                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                     value={newClientData.phone}
                     onChange={(e) => handleNewClientChange('phone', e.target.value)}
                     placeholder="20 000 000"
                  />
               </div>
               <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                     value={newClientData.email}
                     onChange={(e) => handleNewClientChange('email', e.target.value)}
                     placeholder="john@example.com"
                  />
               </div>
            </div>
            <div className="flex justify-end pt-2">
                <Button 
                   onClick={handleCreateClient} 
                   loading={createLoading}
                   icon={<UserPlus className="w-4 h-4" />}
                >
                   Create & Select
                </Button>
            </div>
         </div>
      ) : (
        <ClientSelector 
           clients={clients} 
           selectedClient={selectedClientId} // Passing just ID is easier
           onSelectClient={handleClientSelect}
           error={errors.clientId?.message}
        />
      )}
      
      {/* Hidden input to ensure RHF tracks validation if we strictly rely on generic input logic */}
      <input type="hidden" {...register("clientId")} />
    </div>
  );
};

export default Step2ClientSelection;