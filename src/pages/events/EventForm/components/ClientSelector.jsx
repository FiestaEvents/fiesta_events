import React, { useState } from "react";
import { Search, Check, User } from "lucide-react";
import Input from "../../../../components/common/Input";

const ClientSelector = ({ clients, selectedClient, onSelectClient, error }) => {
  const [search, setSearch] = useState("");
  
  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Input 
        icon={Search} 
        placeholder="Search clients..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        className="mb-4"
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
        {filtered.map(client => {
          const isSelected = selectedClient === client._id;
          return (
            <div 
              key={client._id}
              onClick={() => onSelectClient(client._id)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                ${isSelected 
                  ? "bg-orange-50 border-orange-500 ring-1 ring-orange-500" 
                  : "bg-white border-gray-200 hover:border-orange-300"
                }
              `}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                {client.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{client.name}</p>
                <p className="text-xs text-gray-500 truncate">{client.email}</p>
              </div>
              {isSelected && <div className="bg-orange-500 text-white rounded-full p-0.5"><Check size={12}/></div>}
            </div>
          )
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};

export default ClientSelector;