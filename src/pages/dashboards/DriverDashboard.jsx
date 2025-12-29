import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
  MapPin, Truck, CheckCircle, Clock, Navigation, 
  Phone, Calendar as CalendarIcon, MoreVertical 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

import { eventService } from "../../api/index";
import { useToast } from "../../context/ToastContext";
import OrbitLoader from "../../components/common/LoadingSpinner";
import Card from "../../components/common/Card";

const DriverDashboard = () => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState([]);
  const [stats, setStats] = useState({ completed: 0, pending: 0, totalDistance: 120 });

  // Mock Weekly Data for Chart (replace with real agg later)
  const weeklyData = [
    { day: 'M', hours: 6 },
    { day: 'T', hours: 8 },
    { day: 'W', hours: 5 },
    { day: 'T', hours: 9 },
    { day: 'F', hours: 7 },
    { day: 'S', hours: 4 },
    { day: 'S', hours: 0 },
  ];

  const fetchRoute = async () => {
    try {
      // Fetch events for TODAY
      const today = new Date();
      const startOfDay = new Date(today.setHours(0,0,0,0)).toISOString();
      const endOfDay = new Date(today.setHours(23,59,59,999)).toISOString();

      const res = await eventService.getAll({ 
        startDate: startOfDay, 
        endDate: endOfDay,
        sort: 'startDate' 
      });

      const events = res.data?.events || res.events || [];
      setRoute(events);
      
      // Calculate Stats
      const completed = events.filter(e => e.status === 'completed').length;
      setStats(prev => ({ ...prev, completed, pending: events.length - completed }));

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute();
  }, []);

  const handleMarkComplete = async (id) => {
    try {
      await eventService.update(id, { status: 'completed' });
      showSuccess("Job marked as completed");
      
      // Optimistic Update
      setRoute(prev => prev.map(stop => 
        stop._id === id ? { ...stop, status: 'completed' } : stop
      ));
    } catch (err) {
      showError("Failed to update status");
    }
  };

  const openMaps = (location) => {
    if (!location) return;
    const query = encodeURIComponent(location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><OrbitLoader /></div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
             {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric'})}
          </p>
        </div>
        <div className="text-right hidden sm:block">
           <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shift Status</p>
           <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">On Duty</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Route Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Vehicle Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
             <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                      <Truck size={32} className="text-white" />
                   </div>
                   <div>
                      <h2 className="font-bold text-xl">Ford Transit</h2>
                      <p className="text-blue-100 text-sm">License: 192-TN-3455</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xs text-blue-200 uppercase font-bold">Fuel Level</p>
                   <p className="text-2xl font-bold">75%</p>
                </div>
             </div>
             {/* Decorative Circle */}
             <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Timeline */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <MapPin className="text-orange-500" size={20}/> Today's Route
               </h3>
               <span className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">
                 {route.length} Stops
               </span>
            </div>

            <div className="space-y-0 relative border-l-2 border-dashed border-gray-200 dark:border-gray-700 ml-3.5 my-2">
              {route.length === 0 ? (
                 <div className="ml-8 py-4 text-gray-500 italic">No trips scheduled for today.</div>
              ) : (
                route.map((stop, index) => {
                  const isCompleted = stop.status === 'completed';
                  const isNext = !isCompleted && (index === 0 || route[index-1].status === 'completed');
                  const location = stop.notes?.split('|')[0]?.replace('Location:', '').trim() || stop.location || 'No Location';

                  return (
                    <div key={stop._id} className="mb-8 ml-8 relative group">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[39px] top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 transition-colors ${
                        isCompleted ? 'bg-green-500' : isNext ? 'bg-orange-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                      
                      <div className={`p-4 rounded-xl border transition-all ${
                         isNext 
                         ? 'bg-orange-50/50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800 shadow-sm' 
                         : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          
                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                               <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                  {new Date(stop.startDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </span>
                               {isCompleted && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Done</span>}
                            </div>
                            
                            <h4 className={`font-bold text-base ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                              {stop.title}
                            </h4>
                            
                            <p className="text-sm text-gray-500 mt-1">{stop.clientId?.name || "Client"}</p>
                            
                            <div className="flex items-center gap-1 mt-2 text-sm text-gray-600 dark:text-gray-300">
                               <MapPin size={14} className="text-gray-400"/>
                               <span className="truncate">{location}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                             {/* Call Button */}
                             {stop.clientId?.phone && (
                                <a href={`tel:${stop.clientId.phone}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Call Client">
                                   <Phone size={18} />
                                </a>
                             )}

                             {/* Navigate Button */}
                             <button 
                               onClick={() => openMaps(location)}
                               className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" 
                               title="Navigate"
                             >
                                <Navigation size={18} />
                             </button>

                             {/* Complete Button */}
                             {!isCompleted && (
                                <button 
                                  onClick={() => handleMarkComplete(stop._id)}
                                  className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle size={14} /> Complete
                                </button>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Stats & Charts */}
        <div className="space-y-6">
           
           {/* Weekly Activity Chart */}
           <Card className="p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-6">Weekly Hours</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1F2937', color: '#fff' }}
                    />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 1 ? '#F97316' : '#E5E7EB'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 text-center">
                 <p className="text-3xl font-bold text-gray-900 dark:text-white">39h</p>
                 <p className="text-xs text-gray-500 uppercase tracking-wide">Total this week</p>
              </div>
           </Card>

           {/* Quick Stats */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                 <div className="p-2 bg-green-50 text-green-600 rounded-lg w-fit mb-2"><CheckCircle size={18}/></div>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                 <p className="text-xs text-gray-500">Completed Jobs</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                 <div className="p-2 bg-orange-50 text-orange-600 rounded-lg w-fit mb-2"><Clock size={18}/></div>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                 <p className="text-xs text-gray-500">Remaining</p>
              </div>
           </div>

           {/* Maintenance Reminder */}
           <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-100 dark:border-yellow-800 flex gap-3 items-start">
              <div className="bg-white dark:bg-yellow-800 p-1.5 rounded-full text-yellow-600 shadow-sm mt-0.5">
                 <CalendarIcon size={14} />
              </div>
              <div>
                 <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-200">Vehicle Service Due</h4>
                 <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">Oil change required in 300km.</p>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;