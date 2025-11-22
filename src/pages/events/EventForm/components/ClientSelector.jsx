import React, { useState } from "react";
import { Search, Check, User, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/common/Input";

const ClientSelector = ({ clients, selectedClient, onSelectClient, error }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div>
      <Input
        icon={Search}
        placeholder={t('eventForm.components.clientSelector.searchPlaceholder') || "Search clients..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
        {filteredClients.length > 0 ? filteredClients.map(client => (
          <div
            key={client._id}
            onClick={() => onSelectClient(client._id)}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center justify-between
              ${selectedClient === client._id 
                ? "bg-orange-50 border-orange-500 dark:bg-orange-900/20 dark:border-orange-500" 
                : "bg-white border-gray-200 hover:border-orange-300 dark:bg-gray-700 dark:border-gray-600"}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold">
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{client.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{client.email}</p>
              </div>
            </div>
            {selectedClient === client._id && <Check className="text-orange-500" size={20} />}
          </div>
        )) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <User className="mx-auto mb-2 opacity-50" size={24} />
            {t('eventForm.components.clientSelector.noClients')}
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}
    </div>
  );
};

export default ClientSelector;