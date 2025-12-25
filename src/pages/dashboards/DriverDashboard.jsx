import React from "react";
import { MapPin, Truck, CheckSquare, Clock } from "lucide-react";

const DriverDashboard = () => {
  // Mock data for now, connect to eventService later
  const route = [
    { id: 1, time: "09:00", location: "Warehouse A", task: "Pickup Equipment", status: "completed" },
    { id: 2, time: "10:30", location: "Grand Plaza Hotel", task: "Drop-off", status: "pending" },
    { id: 3, time: "14:00", location: "Seaside Villa", task: "Pickup", status: "pending" },
  ];

  return (
    <div className="p-4 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Route</h1>
      
      {/* Vehicle Status */}
      <div className="bg-blue-600 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Truck size={24} />
            <div>
              <h2 className="font-bold text-lg">Ford Transit (192-TN-3455)</h2>
              <p className="text-blue-200 text-sm">Assigned Vehicle</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-400/20 text-green-100 rounded-full text-xs border border-green-400/30">
            Active
          </span>
        </div>
        <div className="flex justify-between text-sm text-blue-100">
          <span>Fuel: 75%</span>
          <span>Next Service: 1200km</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold mb-6 text-gray-900 dark:text-white">Today's Schedule</h3>
        <div className="space-y-0 relative border-l-2 border-gray-200 dark:border-gray-700 ml-3">
          {route.map((stop, index) => (
            <div key={stop.id} className="mb-8 ml-6 relative">
              {/* Dot */}
              <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                stop.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
              }`}></div>
              
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-400 block mb-1 flex items-center gap-1">
                    <Clock size={12} /> {stop.time}
                  </span>
                  <h4 className={`font-bold text-lg ${stop.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                    {stop.task}
                  </h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {stop.location}
                  </p>
                </div>
                {stop.status === 'pending' && (
                  <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                    <CheckSquare size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;