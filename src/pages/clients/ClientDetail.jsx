import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  DollarSign,
  Tag,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Download,
  Plus,
} from "lucide-react";

// Mock API service - replace with actual import
const clientService = {
  getById: async (id) => {
    // Simulate API call
    return {
      _id: id,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 123-4567",
      company: "Johnson Events Inc.",
      status: "active",
      address: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
      },
      tags: ["VIP", "Corporate", "Returning"],
      notes:
        "Preferred client with excellent payment history. Prefers elegant, minimalist event setups. Usually books 3-4 events per year.",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-10-20T14:45:00Z",
    };
  },
  getEvents: async (id) => {
    return [
      {
        _id: "evt1",
        title: "Annual Corporate Gala 2024",
        type: "corporate",
        startDate: "2024-12-15T18:00:00Z",
        endDate: "2024-12-15T23:00:00Z",
        status: "confirmed",
        guestCount: 250,
        pricing: { totalAmount: 15000 },
        paymentSummary: {
          paidAmount: 10000,
          totalAmount: 15000,
          status: "partial",
        },
      },
      {
        _id: "evt2",
        title: "Product Launch Event",
        type: "corporate",
        startDate: "2024-11-20T19:00:00Z",
        endDate: "2024-11-20T22:00:00Z",
        status: "completed",
        guestCount: 150,
        pricing: { totalAmount: 8500 },
        paymentSummary: { paidAmount: 8500, totalAmount: 8500, status: "paid" },
      },
      {
        _id: "evt3",
        title: "Team Building Retreat",
        type: "corporate",
        startDate: "2024-09-10T09:00:00Z",
        endDate: "2024-09-10T17:00:00Z",
        status: "completed",
        guestCount: 80,
        pricing: { totalAmount: 5000 },
        paymentSummary: { paidAmount: 5000, totalAmount: 5000, status: "paid" },
      },
    ];
  },
};

const ClientDetailsPage = ({ clientId = "client123" }) => {
  const [client, setClient] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const [clientData, eventsData] = await Promise.all([
        clientService.getById(clientId),
        clientService.getEvents(clientId),
      ]);
      setClient(clientData);
      setEvents(eventsData);
    } catch (err) {
      setError(err.message || "Failed to load client data");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
      confirmed: "Confirmed",
      completed: "Completed",
      cancelled: "Cancelled",
      paid: "Paid",
      partial: "Partial",
      overdue: "Overdue",
    };
    return labels[status] || "Unknown";
  };

  const getStatusColor = (status) => {
    const colors = {
      active:
        "bg-green-100 text-green-800 border-green-200 dark:bg-[#1f2937] dark:border-green-700 dark:text-white rounded-full dark:bg-green-900",
      inactive:
        "bg-gray-100 text-gray-800 border-gray-200 dark:bg-[#1f2937] dark:border-gray-700 dark:text-white rounded-full dark:bg-red-900",
      pending:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-[#1f2937] dark:border-yellow-700 dark:text-white rounded-full dark:bg-yellow-900",
      confirmed:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-[#1f2937] dark:border-blue-700 dark:text-white dark:bg-green-900 rounded-full",
      completed:
        "bg-green-100 text-green-800 border-green-200 dark:bg-[#1f2937] dark:border-green-700 dark:text-white rounded-full dark:bg-blue-900",
      cancelled:
        "bg-red-100 text-red-800 border-red-200 dark:bg-[#1f2937] dark:border-red-700 dark:text-white rounded-full dark:bg-red-900",
      paid: "bg-green-100 text-green-800 border-green-200 dark:bg-[#1f2937] dark:border-green-700 dark:text-white rounded-full dark:bg-green-900",
      partial:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-[#1f2937] dark:border-orange-700 dark:text-white rounded-full dark:bg-orange-900",
      overdue:
        "bg-red-100 text-red-800 border-red-200 dark:bg-[#1f2937] dark:border-red-700 dark:text-white rounded-full dark:bg-red-900",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-[#1f2937] dark:border-gray-700 dark:text-white rounded-full dark:bg-gray-900"
    );
  };

  const calculateStats = () => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (e) => new Date(e.startDate) > new Date()
    ).length;
    const totalRevenue = events.reduce(
      (sum, e) => sum + (e.pricing?.totalAmount || 0),
      0
    );
    const totalPaid = events.reduce(
      (sum, e) => sum + (e.paymentSummary?.paidAmount || 0),
      0
    );
    const pendingAmount = totalRevenue - totalPaid;

    return {
      totalEvents,
      upcomingEvents,
      totalRevenue,
      totalPaid,
      pendingAmount,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center">
            Error Loading Client
          </h3>
          <p className="mt-2 text-sm text-gray-600 text-center">{error}</p>
          <button
            onClick={fetchClientData}
            className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!client) return null;

  const stats = calculateStats();

  return (
    <div className="min-h-screen">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8 dark:bg-[#1f2937] dark:border-gray-700 dark:text-white">
              {/* Action Buttons */}
              <div className="flex justify-between gap-2 mb-4">
                <div>
                  <button
                    variant="ghost"
                    onClick={() => navigate("/clients")}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition dark:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Clients
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition dark:text-white dark:bg-[#1f2937] dark:border dark:border-gray-700 dark:hover:bg-blue-900"
                    title="Edit Client"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-white dark:bg-[#1f2937] dark:border dark:border-gray-700 dark:hover:bg-red-900"
                    title="Delete Client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Client Header */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {client.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <h1 className="text-xl font-bold text-gray-900 mt-4 dark:text-white">
                  {client.name}
                </h1>
                {client.company && (
                  <p className="text-gray-600 flex items-center justify-center gap-2 mt-1 dark:text-white">
                    <Building2 className="w-4 h-4" />
                    {client.company}
                  </p>
                )}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border mt-3 ${getStatusColor(client.status)}`}
                >
                  {getStatusLabel(client.status)}
                </span>
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide dark:text-white">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700 dark:text-white">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a
                      href={`mailto:${client.email}`}
                      className="hover:text-orange-600 transition text-sm break-all"
                    >
                      {client.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700 dark:text-white">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a
                      href={`tel:${client.phone}`}
                      className="hover:text-orange-600 transition text-sm"
                    >
                      {client.phone}
                    </a>
                  </div>
                  {client.address && (
                    <div className="flex items-start gap-3 text-gray-700 dark:text-white">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <div>{client.address.street}</div>
                        <div>
                          {client.address.city}, {client.address.state}{" "}
                          {client.address.zipCode}
                        </div>
                        <div>{client.address.country}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {client.tags && client.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide dark:text-white">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1 dark:text-white dark:bg-[#1f2937] dark:border dark:border-gray-700"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {client.notes && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide dark:text-white">
                    Notes
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-[#1f2937] dark:border-gray-700 dark:text-white">
                    <p className="text-gray-700 text-sm leading-relaxed dark:text-white">
                      {client.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700 dark:text-white">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-white">
                      Client Since:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(client.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-white">
                      Last Updated:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(client.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-[#1f2937] dark:border-gray-700 dark:text-white">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                  {["events", "payments", "activity"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition dark:text-white dark:bg-[#1f2937] dark:border-gray-700 dark:hover:bg-blue-900 ${
                        activeTab === tab
                          ? "border-blue-600 text-blue-600 dark:border-white dark:text-white"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-white dark:bg-[#1f2937] dark:border-gray-700 dark:hover:bg-blue-900"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "events" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Event History
                      </h3>
                      <button className="px-4 py-2 flex items-center gap-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">
                        <Plus className="h-4 w-4" />
                        Create New Event
                      </button>
                    </div>

                    {events.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">
                          No events found for this client
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {events.map((event) => (
                          <div
                            key={event._id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition dark:border-gray-700 dark:bg-[#1f2937] dark:text-white"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {event.title}
                                  </h4>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)} dark:text-white`}
                                  >
                                    {getStatusLabel(event.status)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-white">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(event.startDate)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {event.guestCount} guests
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    {formatCurrency(event.pricing.totalAmount)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span
                                      className={`inline-block px-3 py-0.5 rounded-full text-sm  border ${getStatusColor(
                                        event.paymentSummary.status
                                      )} dark:text-white`}
                                    >
                                      {getStatusLabel(
                                        event.paymentSummary.status
                                      )}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button className="ml-4 text-orange-600 hover:text-orange-700">
                                <ExternalLink className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "payments" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Payment Overview
                      </h3>
                      <button className="px-4 py-2 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition dark:bg-green-900  dark:hover:bg-green-800">
                        <Plus className="h-4 w-4" />
                        Record Payment
                      </button>
                    </div>

                    {/* Payment Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-[#1f2937] dark:text-white dark:bg-green-900">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center dark:bg-green-900 dark:border dark:border-white">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-900 dark:text-white">
                              {formatCurrency(stats.totalRevenue)}
                            </div>
                            <div className="text-sm text-green-700 dark:text-white">
                              Total Revenue
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-900">
                              {formatCurrency(stats.totalPaid)}
                            </div>
                            <div className="text-sm text-orange-700">
                              Total Paid
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-900">
                              {formatCurrency(stats.pendingAmount)}
                            </div>
                            <div className="text-sm text-orange-700">
                              Outstanding
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-md font-semibold text-gray-900 mb-4">
                      Payment History
                    </h4>
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div
                          key={event._id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {event.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {formatDate(event.startDate)}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.paymentSummary.status)}`}
                            >
                              {event.paymentSummary.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">
                                Total Amount:
                              </span>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(
                                  event.paymentSummary.totalAmount
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Paid:</span>
                              <div className="font-semibold text-green-600">
                                {formatCurrency(
                                  event.paymentSummary.paidAmount
                                )}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Balance:</span>
                              <div className="font-semibold text-orange-600">
                                {formatCurrency(
                                  event.paymentSummary.totalAmount -
                                    event.paymentSummary.paidAmount
                                )}
                              </div>
                            </div>
                          </div>
                          {event.paymentSummary.status === "paid" && (
                            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              Fully Paid
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "activity" && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">
                            Event Completed
                          </p>
                          <p className="text-sm text-gray-600">
                            Product Launch Event was marked as completed
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            2 weeks ago
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">
                            Payment Received
                          </p>
                          <p className="text-sm text-gray-600">
                            Payment of $5,000 received for Annual Corporate Gala
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            3 weeks ago
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">
                            Event Booked
                          </p>
                          <p className="text-sm text-gray-600">
                            Annual Corporate Gala 2024 was confirmed
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            1 month ago
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsPage;
