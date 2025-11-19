// src/components/events/EventForm/components/ClientSelector.jsx
import React, { useState } from "react";
import { Search, Check, User, AlertCircle } from "lucide-react";
import Input from "../../../../components/common/Input";

const ClientSelector = ({ clients, selectedClient, onSelectClient, error, prefilledClient }) => {
  const [clientSearch, setClientSearch] = useState("");

  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.phone?.includes(clientSearch)
  );

  return (
    <div>
      {/* Prefilled Client Banner */}
      {prefilledClient && (
        <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold mb-1">
                <span>Client Pre-selected</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400">
                <strong>{prefilledClient.name}</strong>
              </p>
              <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                {prefilledClient.email} • {prefilledClient.phone}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Input */}
      <Input
        icon={Search}
        placeholder="Search clients by name, email, or phone..."
        value={clientSearch}
        onChange={(e) => setClientSearch(e.target.value)}
        className="mb-4"
      />

      {/* Client List */}
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div
              key={client._id}
              onClick={() => onSelectClient(client._id)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 transform ${
                selectedClient === client._id
                  ? "bg-orange-50 border-orange-400 shadow-md dark:bg-orange-900/20 dark:border-orange-500"
                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      selectedClient === client._id ? "bg-orange-500" : "bg-gray-400"
                    }`}
                  >
                    {client.name?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {client.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {client.email} • {client.phone}
                    </div>
                  </div>
                </div>
                {selectedClient === client._id && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-xs font-semibold">Selected</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <User className="w-16 h-16 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No clients found</p>
            <p className="text-sm mt-1">Try a different search or create a new client</p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ClientSelector;