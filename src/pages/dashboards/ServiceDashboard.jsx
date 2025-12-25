import React, { useEffect, useState } from "react";
import { Camera, Calendar, DollarSign, FileText, Briefcase } from "lucide-react";
import { eventService } from "../../api/services/eventService";
import { invoiceService } from "../../api/services/invoiceService";
import StatCard from "../../components/dashboard/StatCard.jsx";
import OrbitLoader from "../../components/common/LoadingSpinner";

const ServiceDashboard = ({ type }) => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobsRes, invRes] = await Promise.all([
          eventService.getAll({ status: 'confirmed', upcoming: true }),
          invoiceService.getStats() // Assuming this returns unpaid count
        ]);
        setJobs(jobsRes.data?.events || []);
        setPendingInvoices(invRes.data?.stats?.unpaid || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><OrbitLoader /></div>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {type === 'visual' ? 'Creative Studio' : 'Service Dashboard'}
        </h1>
        <p className="text-gray-500">Track your upcoming gigs and payments</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Upcoming Gigs" value={jobs.length} icon={Briefcase} color="indigo" />
        <StatCard title="Pending Payments" value={pendingInvoices} icon={DollarSign} color="red" />
        <StatCard title="Active Contracts" value={5} icon={FileText} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Next Jobs</h3>
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job._id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200">{job.title}</h4>
                    <p className="text-sm text-gray-500">{new Date(job.startDate).toLocaleDateString()} • {job.clientName}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  Confirmed
                </span>
              </div>
            ))}
            {jobs.length === 0 && <p className="text-gray-500 text-center py-4">No upcoming jobs.</p>}
          </div>
        </div>

        {/* Quick Actions / Portfolio Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:bg-gray-50 transition">
              <Camera className="mb-2 text-gray-400" />
              <span className="text-sm font-medium">Upload to Portfolio</span>
            </button>
            <button className="p-4 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:bg-gray-50 transition">
              <FileText className="mb-2 text-gray-400" />
              <span className="text-sm font-medium">Create Quote</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;