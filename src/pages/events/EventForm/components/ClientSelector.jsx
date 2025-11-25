import React, { useState } from "react";
import { Search, Check, User, AlertCircle, Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Generic Components
import Input from "../../../../components/common/Input";

const ClientSelector = ({ clients, selectedClient, onSelectClient, error }) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search Input */}
      <Input
        icon={Search}
        placeholder={t('eventForm.components.clientSelector.searchPlaceholder', 'Search by name, email, or phone...')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-white dark:bg-gray-800"
      />

      {/* Client Grid - FIXED: Better mobile grid and scrolling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-[280px] sm:max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
        {filteredClients.length > 0 ? (
          filteredClients.map(client => {
            const isSelected = selectedClient === client._id;
            
            return (
              <div
                key={client._id}
                onClick={() => onSelectClient(client._id)}
                className={`
                  relative p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-2 sm:gap-3 group
                  ${isSelected 
                    ? "bg-orange-50 dark:bg-orange-900/20 border-orange-500 ring-1 ring-orange-500 z-10" 
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md"
                  }
                `}
              >
                {/* Avatar - FIXED: Smaller on mobile */}
                <div className={`
                  w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors
                  ${isSelected 
                    ? "bg-orange-500 text-white" 
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 group-hover:text-orange-600"
                  }
                `}>
                  {client.name.charAt(0).toUpperCase()}
                </div>

                {/* Info - FIXED: Better overflow handling on mobile */}
                <div className="flex-1 min-w-0">
                  <p className={`text-xs sm:text-sm font-semibold truncate ${isSelected ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-200"}`}>
                    {client.name}
                  </p>
                  
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    {client.email && (
                      <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                        <Mail className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                        <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span className="truncate">{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Checkmark Indicator */}
                {isSelected && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-orange-500 text-white rounded-full p-0.5 shadow-sm animate-in zoom-in duration-200">
                    <Check size={10} className="sm:w-3 sm:h-3" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Empty State - FIXED: Better mobile sizing */
          <div className="col-span-1 sm:col-span-2 flex flex-col items-center justify-center py-8 sm:py-10 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 sm:mb-3 text-gray-400 dark:text-gray-500">
              <User className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium text-center">
              {search ? t('eventForm.components.clientSelector.noResults', 'No clients found matching your search.') : t('eventForm.components.clientSelector.noClients', 'No clients available.')}
            </p>
          </div>
        )}
      </div>

      {/* Error Message - FIXED: Better mobile sizing */}
      {error && (
        <div className="flex items-center gap-2 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2.5 sm:p-3 rounded-lg border border-red-100 dark:border-red-800/50 animate-in slide-in-from-top-1">
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ClientSelector;