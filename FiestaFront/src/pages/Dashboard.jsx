import React, { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import { dashboardService } from '../api/index';
import { formatCurrency } from '../utils/formatCurrency';
import { FileText } from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    revenue: 0,
    activeClients: 0,
    pendingPayments: 0,
    upcomingEvents: [],
    recentPayments: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Single dashboard call that returns everything
        const response = await dashboardService.getStats();
        
        console.log("📊 Dashboard API Response:", response);

        // Extract the nested data
        const dashboardData = response?.data || response || {};
        
        console.log("📊 Extracted Dashboard Data:", dashboardData);

        // Map the data to match your component's expected structure
        setStats({
          totalEvents: dashboardData.summary?.eventsThisMonth || 0,
          revenue: dashboardData.summary?.revenueThisMonth || 0,
          activeClients: 0, // Not provided in your API
          pendingPayments: dashboardData.upcomingEvents?.filter(e => e.payment?.status === 'pending').length || 0,
          
          upcomingEvents: (dashboardData.upcomingEvents || []).map(event => ({
            id: event._id,
            title: event.title,
            date: event.startDate,
            location: event.clientId?.name || 'N/A', // Using client name as location
            guestCount: event.guestCount,
            status: event.status === 'pending' ? 'Pending' : event.status === 'confirmed' ? 'Confirmed' : event.status,
          })),

          recentPayments: (dashboardData.recentPayments || []).map(payment => ({
            id: payment._id,
            clientName: payment.description || payment.category || 'Payment',
            date: payment.date || payment.createdAt,
            amount: payment.amount,
          })),
        });
      } catch (err) {
        console.error('❌ Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-screen text-gray-600 dark:text-gray-300">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Dashboard
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Overview of key metrics and upcoming events
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Events This Month</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue This Month</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(stats.revenue)}
          </div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Upcoming</div>
          <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{stats.upcomingEvents.length}</div>
        </Card>
        <Card>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</div>
          <div className="mt-2 text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pendingPayments}
          </div>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stats.upcomingEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No upcoming events.
                    </td>
                  </tr>
                ) : (
                  stats.upcomingEvents.map(event => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white font-medium">
                        {event.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">
                        {event.guestCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            event.status?.toLowerCase() === 'confirmed'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : event.status?.toLowerCase() === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Payments */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Payments</h2>
          <ul className="space-y-4">
            {stats.recentPayments.length === 0 ? (
              <li className="text-gray-500 dark:text-gray-400 text-center py-6">No recent payments.</li>
            ) : (
              stats.recentPayments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{payment.clientName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(payment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(payment.amount)}
                  </p>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;