import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Mail, Phone, Check, Building } from "lucide-react";

const ClientSelector = ({ clients, selectedClient, onSelectClient, error }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  const getSelectedId = (val) => {
     if (!val) return null;
     return typeof val === "object" ? val._id : val;
  };
  const activeId = getSelectedId(selectedClient);

  // Filter
  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.includes(query)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          size={18}
        />
        <input
          type="text"
          placeholder={t("eventForm.components.clientSelector.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 py-2.5 text-sm focus:border-orange-500 outline-none transition-colors"
        />
      </div>

      {/* Validation Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-300 text-sm p-3 rounded-lg border border-red-100 dark:border-red-900/50 flex items-center gap-2 animate-in slide-in-from-top-1">
          <span className="font-bold">
            {t("eventForm.components.clientSelector.validation.required")}
          </span> 
          {t("eventForm.components.clientSelector.validation.message")}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => {
            const isSelected = client._id === activeId;

            return (
              <div
                key={client._id}
                onClick={() => onSelectClient(client)}
                className={`
                  cursor-pointer relative p-4 rounded-xl border text-left transition-all duration-200 group
                  ${isSelected
                    ? "bg-orange-50 border-orange-500 dark:bg-orange-900/20 dark:border-orange-500"
                    : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                  }
                `}
              >
                {/* Checkmark */}
                {isSelected && (
                   <div className="absolute top-3 right-3 text-orange-600 dark:text-orange-400">
                      <Check className="w-5 h-5" />
                   </div>
                )}

                <div className="flex items-center gap-3">
                   {/* Avatar / Initials */}
                   <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                      ${isSelected ? "bg-orange-200 text-orange-800" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}
                   `}>
                      {client.name.charAt(0).toUpperCase()}
                   </div>

                   <div className="min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate pr-6">{client.name}</h4>
                      {client.company && (
                         <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Building size={12} />
                            <span className="truncate">{client.company}</span>
                         </div>
                      )}
                   </div>
                </div>
                
                <div className="mt-3 space-y-1">
                   {client.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                         <Mail size={12}/> {client.email}
                      </div>
                   )}
                   {client.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                         <Phone size={12}/> {client.phone}
                      </div>
                   )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center">
            <p className="text-gray-400 text-sm">
                {t("eventForm.components.clientSelector.noResults", { query: searchQuery })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSelector;