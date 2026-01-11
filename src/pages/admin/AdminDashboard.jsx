import React, { useEffect, useState } from "react";
import { Users, Building2, TrendingUp, AlertTriangle } from "lucide-react";
import { adminService } from "../../api/services/adminService"; 
import OrbitLoader from "../../components/common/LoadingSpinner";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
    <div className={`p-4 rounded-full ${color} bg-opacity-10`}>
      <Icon className={`w-8 h-8 ${color.replace("bg-", "text-")}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalBusinesses: 12,
        totalUsers: 45,
        activeSubscriptions: 8,
        pendingIssues: 2
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <OrbitLoader />;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Businesses" value={stats.totalBusinesses} icon={Building2} color="bg-blue-500" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-purple-500" />
        <StatCard title="Active Subs" value={stats.activeSubscriptions} icon={TrendingUp} color="bg-green-500" />
        <StatCard title="System Alerts" value={stats.pendingIssues} icon={AlertTriangle} color="bg-red-500" />
      </div>

      {/* Add Charts here later */}
    </div>
  );
};

export default AdminDashboard;