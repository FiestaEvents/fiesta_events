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
  Eye,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { clientService } from '../../api/index';
import { toast } from 'react-hot-toast';

const ClientDetail = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const location = useLocation();
  
  const [client, setClient] = useState(location.state?.client || null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(!location.state?.client);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    // If client data wasn't passed via state, fetch it from API
    if (!client && clientId) {
      fetchClientData();
    }
  }, [clientId, client]);

  // Add this separate useEffect for events
  useEffect(() => {
    if (clientId && activeTab === "events") {
      fetchClientEvents();
    }
  }, [clientId, activeTab]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const clientData = await clientService.getById(clientId);
      setClient(clientData?.data || clientData);
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to load client data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await clientService.getEvents(clientId);
      setEvents(eventsData?.data || eventsData || []);
    } catch (err) {
      console.error("Failed to load client events:", err);
      toast.error("Failed to load client events");
    } finally {
      setLoading(false);
    }
  };

  // Add this function to manually refresh events
  const refreshEvents = () => {
    fetchClientEvents();
  };

  const handleEditClient = () => {
    // Add validation to ensure clientId is available
    if (!clientId) {
      console.error("Client ID is undefined");
      toast.error("Cannot edit client: Client ID not found");
      return;
    }

    console.log("Editing client with ID:", clientId); // Debug log
    
    navigate(`/clients/${clientId}/edit/`, {
      state: { 
        client: client || { _id: clientId }, // Ensure we have at least the ID
        modal: true 
      }
    });
  };

  const handleDeleteClient = async () => {
    if (!clientId) {
      toast.error("Cannot delete client: Client ID not found");
      return;
    }

    if (window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      try {
        await clientService.delete(clientId);
        toast.success("Client deleted successfully");
        navigate("/clients");
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to delete client";
        toast.error(errorMessage);
      }
    }
  };

  const handleCreateEvent = () => {
    if (!clientId) {
      toast.error("Cannot create event: Client ID not found");
      return;
    }

    navigate("/events/new", { 
      state: { 
        prefillClient: {
          _id: clientId,
          name: client?.name,
          email: client?.email,
          phone: client?.phone
        },
        returnUrl: `/clients/${clientId}`,
        onEventCreated: refreshEvents
      }
    });
  };

  const handleRecordPayment = (eventId) => {
    if (!eventId) {
      toast.error("Please select an event first");
      return;
    }
    
    if (!clientId) {
      toast.error("Cannot record payment: Client ID not found");
      return;
    }

    navigate(`/payments/new`, { 
      state: { 
        prefillEvent: {
          _id: eventId,
          clientId: clientId,
          clientName: client?.name
        }
      }
    });
  };

  const handleViewEvent = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("tn-TN", {
      style: "currency",
      currency: "TND",
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
    return labels[status] || status || "Unknown";
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-white",
      inactive: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-white",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700 dark:text-white",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-white",
      completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-white",
      cancelled: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-white",
      paid: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-white",
      partial: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-white",
      overdue: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-white",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-white";
  };

  const calculateStats = () => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (e) => new Date(e.startDate) > new Date() && e.status !== 'cancelled'
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

  // Add debug logging to see what's happening
  useEffect(() => {
    console.log("ClientDetail mounted with clientId:", clientId);
    console.log("Current client:", client);
  }, [clientId, client]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full dark:bg-red-900">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 text-center dark:text-white">
            {!client ? "Client Not Found" : "Error Loading Client"}
          </h3>
          <p className="mt-2 text-sm text-gray-600 text-center dark:text-gray-400">
            {error || "The client you're looking for doesn't exist."}
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate("/clients")}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Back to Clients
            </button>
            {error && (
              <button
                onClick={fetchClientData}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Client Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8 dark:bg-gray-800 dark:border-gray-700">
              {/* Action Buttons */}
              <div className="flex justify-between gap-2 mb-4">
                <div>
                  <button
                    onClick={() => navigate("/clients")}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition dark:text-gray-400 dark:hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Clients
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleEditClient}
                    className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition dark:text-gray-400 dark:hover:bg-blue-900 dark:hover:text-white"
                    title="Edit Client"
                    disabled={!clientId} // Disable if no clientId
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteClient}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-400 dark:hover:bg-red-900"
                    title="Delete Client"
                    disabled={!clientId} // Disable if no clientId
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Client Header */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  {client.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "?"}
                </div>
                <h1 className="text-xl font-bold text-gray-900 mt-4 dark:text-white">
                  {client.name || "Unnamed Client"}
                </h1>
                {client.company && (
                  <p className="text-gray-600 flex items-center justify-center gap-2 mt-1 dark:text-gray-400">
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
                  {client.email && (
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={`mailto:${client.email}`}
                        className="hover:text-orange-600 transition text-sm break-all dark:hover:text-orange-400"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={`tel:${client.phone}`}
                        className="hover:text-orange-600 transition text-sm dark:hover:text-orange-400"
                      >
                        {client.phone}
                      </a>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
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
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1 dark:bg-blue-900 dark:text-blue-200"
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
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                    <p className="text-gray-700 text-sm leading-relaxed dark:text-gray-300">
                      {client.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Account Info */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Client Since:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(client.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
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
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                  {["events", "payments", "activity"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition ${
                        activeTab === tab
                          ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 dark:text-gray-400 dark:hover:text-white"
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
                        Event History ({events.length})
                      </h3>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={refreshEvents}
                          className="px-3 py-2 flex items-center gap-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                          title="Refresh Events"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={handleCreateEvent}
                          className="px-4 py-2 flex items-center gap-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                        >
                          <Plus className="h-4 w-4" />
                          Create New Event
                        </button>
                      </div>
                    </div>

                    {events.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">
                          No events found for this client
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {events.map((event) => (
                          <div
                            key={event._id}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition dark:border-gray-600 dark:hover:shadow-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {event.title}
                                  </h4>
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}
                                  >
                                    {getStatusLabel(event.status)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
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
                                    {formatCurrency(event.pricing?.totalAmount || 0)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span
                                      className={`inline-block px-3 py-0.5 rounded-full text-sm border ${getStatusColor(
                                        event.paymentSummary?.status || 'pending'
                                      )}`}
                                    >
                                      {getStatusLabel(event.paymentSummary?.status || 'pending')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleRecordPayment(event._id)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
                                >
                                  Record Payment
                                </button>
                                <button 
                                  onClick={() => handleViewEvent(event._id)}
                                  className="ml-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                                >
                                  <ExternalLink className="w-5 h-5" />
                                </button>
                              </div>
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
                      <button 
                        onClick={() => {
                          if (events.length === 0) {
                            toast.error("No events available for payment");
                          } else if (events.length === 1) {
                            handleRecordPayment(events[0]._id);
                          } else {
                            toast.error("Please select a specific event to record payment");
                          }
                        }}
                        className="px-4 py-2 flex items-center gap-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition dark:bg-green-700 dark:hover:bg-green-600"
                      >
                        <Plus className="h-4 w-4" />
                        Record Payment
                      </button>
                    </div>

                    {/* Payment Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900 dark:border-green-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center dark:bg-green-700">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-green-900 dark:text-white">
                              {formatCurrency(stats.totalRevenue)}
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-300">
                              Total Revenue
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900 dark:border-blue-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center dark:bg-blue-700">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-blue-900 dark:text-white">
                              {formatCurrency(stats.totalPaid)}
                            </div>
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                              Total Paid
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-900 dark:border-orange-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center dark:bg-orange-700">
                            <Clock className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-orange-900 dark:text-white">
                              {formatCurrency(stats.pendingAmount)}
                            </div>
                            <div className="text-sm text-orange-700 dark:text-orange-300">
                              Outstanding
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-md font-semibold text-gray-900 mb-4 dark:text-white">
                      Payment History
                    </h4>
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div
                          key={event._id}
                          className="border border-gray-200 rounded-lg p-4 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {event.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(event.startDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.paymentSummary?.status || 'pending')}`}
                              >
                                {getStatusLabel(event.paymentSummary?.status || 'pending')}
                              </span>
                              <button 
                                onClick={() => handleRecordPayment(event._id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition ml-2"
                              >
                                Add Payment
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Total Amount:
                              </span>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(event.paymentSummary?.totalAmount || 0)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                              <div className="font-semibold text-green-600 dark:text-green-400">
                                {formatCurrency(event.paymentSummary?.paidAmount || 0)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Balance:</span>
                              <div className="font-semibold text-orange-600 dark:text-orange-400">
                                {formatCurrency(
                                  (event.paymentSummary?.totalAmount || 0) - 
                                  (event.paymentSummary?.paidAmount || 0)
                                )}
                              </div>
                            </div>
                          </div>
                          {event.paymentSummary?.status === "paid" && (
                            <div className="mt-3 flex items-center gap-2 text-green-600 text-sm dark:text-green-400">
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 dark:text-white">
                      Recent Activity
                    </h3>
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Activity tracking coming soon
                      </p>
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

export default ClientDetail;