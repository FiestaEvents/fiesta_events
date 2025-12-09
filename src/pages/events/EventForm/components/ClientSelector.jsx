import React, { useState, useEffect } from "react";
import { Search, Mail, Phone, Check } from "lucide-react";
import Input from "../../../../components/common/Input";

const ClientSelector = ({ clients, selectedClient, onSelectClient, error }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // 🔍 Debug logs
  useEffect(() => {
    console.log("📋 ClientSelector - Props:", {
      clients: clients?.length,
      selectedClient,
      selectedClientId: selectedClient?._id,
      hasOnSelectClient: !!onSelectClient,
    });
  }, [clients, selectedClient, onSelectClient]);

  // Filter clients based on search
  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.includes(query)
    );
  });

  // Check if client is selected
  const isSelected = (client) => {
    if (!selectedClient) {
      console.log("❌ No selectedClient");
      return false;
    }
    
    const selectedId = typeof selectedClient === "object" ? selectedClient._id : selectedClient;
    const isMatch = client._id === selectedId;
    
    console.log("🔍 Checking:", {
      clientId: client._id,
      clientName: client.name,
      selectedId,
      isMatch,
    });
    
    return isMatch;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          size={20}
        />
        <Input
          type="text"
          placeholder="Search clients by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-lg">
          <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => {
            const selected = isSelected(client);

            return (
              <button
                key={client._id}
                onClick={() => {
                  console.log("🖱️ Client clicked:", client.name, client._id);
                  onSelectClient(client);
                }}
                type="button"
                className={`
                  relative text-left p-4 rounded-xl transition-all duration-200
                  ${
                    selected
                      ? "bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500 dark:border-orange-400 shadow-md ring-2 ring-orange-200 dark:ring-orange-800"
                      : "bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-sm"
                  }
                `}
              >
                {/* Selected Indicator - Top Right Check */}
                {selected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 dark:bg-orange-400 rounded-full flex items-center justify-center shadow-lg z-10">
                    <Check size={16} className="text-white" strokeWidth={3} />
                  </div>
                )}

                {/* Client Avatar */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all
                      ${
                        selected
                          ? "bg-orange-500 dark:bg-orange-400 text-white ring-4 ring-orange-100 dark:ring-orange-900/50"
                          : "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                      }
                    `}
                  >
                    {client.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h3
                      className={`
                        font-bold truncate transition-colors
                        ${
                          selected
                            ? "text-orange-900 dark:text-orange-100"
                            : "text-gray-900 dark:text-white"
                        }
                      `}
                    >
                      {client.name}
                    </h3>
                    {client.company && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {client.company}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact Details */}
                <div className="space-y-1.5 text-sm">
                  {client.email && (
                    <div
                      className={`flex items-center gap-2 transition-colors ${
                        selected
                          ? "text-orange-700 dark:text-orange-300"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <Mail size={14} className="flex-shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div
                      className={`flex items-center gap-2 transition-colors ${
                        selected
                          ? "text-orange-700 dark:text-orange-300"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <Phone size={14} className="flex-shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                {/* Selected Label */}
                {selected && (
                  <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800/50">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-orange-600 dark:text-orange-400" />
                      <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">
                        Selected
                      </span>
                    </div>
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? "No clients found matching your search" : "No clients available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSelector;