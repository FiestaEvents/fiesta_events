import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Plus,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { clientService, eventService } from "../../api/index";
import { useApiDetail, useApi } from "../../hooks/useApi";
import { toast } from "react-hot-toast";
import Modal, { ConfirmModal } from "../../components/common/Modal";
import ClientForm from "./ClientForm";
import EventDetailModal from "../events/EventDetailModal.jsx";

const ClientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Initialize client from location state if available
  const [initialClient, setInitialClient] = useState(
    location.state?.client || null
  );

  // Use useApiDetail for client data - always fetch, don't rely on initialClient
  const {
    item: fetchedClientRaw,
    loading: clientLoading,
    error: clientError,
    refetch: refetchClient,
  } = useApiDetail(clientService.getById, id, {
    manual: false, // Always auto-fetch on mount
  });

  // Extract client from nested structure if needed
  // API returns: { success, data: { client: {...} } } or { client: {...} }
  const fetchedClient = useMemo(() => {
    if (!fetchedClientRaw) return null;
    // If the response has a nested client property, extract it
    if (fetchedClientRaw.client) {
      return fetchedClientRaw.client;
    }
    // Otherwise return as-is
    return fetchedClientRaw;
  }, [fetchedClientRaw]);

  // Use fetched client (always most up-to-date), fallback to initial client during first load
  const client = fetchedClient || initialClient;

  // Tab state
  const [activeTab, setActiveTab] = useState("events");

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Event modal states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Memoize the events fetch function
  const fetchEvents = useCallback(
    () => eventService.getAll({ clientId: id, limit: 100 }),
    [id]
  );

  // Track last fetched client/tab to prevent duplicate fetches
  const lastFetchedRef = React.useRef({ clientId: null, tab: null });

  // Use useApi for events
  const {
    data: eventsData,
    loading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents,
  } = useApi(fetchEvents, {
    manual: true,
  });

  // Store refetch in ref to avoid dependency issues
  const refetchEventsRef = React.useRef(refetchEvents);
  refetchEventsRef.current = refetchEvents;

  // FIXED: Fetch events when events tab becomes active (removed eventsLoading from deps)
  useEffect(() => {
    // Only fetch events if we have a client ID and client data is loaded (or we have initial client)
    if (
      id &&
      client && // Wait for client to load
      activeTab === "events" &&
      !eventsLoading &&
      (lastFetchedRef.current.clientId !== id ||
        lastFetchedRef.current.tab !== activeTab)
    ) {
      console.log("Fetching events for client:", id);
      lastFetchedRef.current = { clientId: id, tab: activeTab };
      refetchEventsRef.current();
    }
  }, [id, activeTab, client]); // Added client as dependency

  // Debug logging for client fetch status
  useEffect(() => {
    console.log("Client fetch status:", {
      id,
      clientLoading,
      hasClient: !!client,
      hasFetchedClient: !!fetchedClient,
      hasFetchedClientRaw: !!fetchedClientRaw,
      hasInitialClient: !!initialClient,
      clientError,
    });
  }, [
    id,
    clientLoading,
    client,
    fetchedClient,
    fetchedClientRaw,
    initialClient,
    clientError,
  ]); // ✅ eventsLoading removed!

  // Extract events from response structure
  const events = useMemo(() => {
    // If we have eventsData from the API call, use that
    if (eventsData) {
      // Handle nested data structure: { success, data: { events: [...] } }
      if (Array.isArray(eventsData?.data?.events)) {
        return eventsData.data.events;
      }
      // Handle direct events array: { events: [...] }
      if (Array.isArray(eventsData?.events)) {
        return eventsData.events;
      }
      // Handle data as array: { data: [...] }
      if (Array.isArray(eventsData?.data)) {
        return eventsData.data;
      }
      // Handle direct array
      if (Array.isArray(eventsData)) {
        return eventsData;
      }
    }
    // Fallback to recentEvents from client data
    if (client?.recentEvents && Array.isArray(client.recentEvents)) {
      return client.recentEvents;
    }
    return [];
  }, [eventsData, client?.recentEvents]);

  // Combined loading state - show loading only when actively loading and no data
  const loading = clientLoading && !client;

  const error = clientError || (activeTab === "events" && eventsError);

  // Refresh events function
  const refreshEvents = useCallback(() => {
    lastFetchedRef.current = { clientId: null, tab: null };
    refetchEventsRef.current();
  }, []);

  // Handle viewing event in modal
  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Handle editing event from modal
  const handleEditEvent = (eventId) => {
    setIsEventModalOpen(false);
    navigate(`/events/${eventId}/edit`, {
      state: {
        returnUrl: `/clients/${id}`,
        onEventUpdated: refreshEvents,
      },
    });
  };

  // Handle navigating to event detail page
  const handleNavigateToEvent = (eventId) => {
    navigate(`/events/${eventId}`, {
      state: { fromClient: id },
    });
  };

  const handleEditClient = () => {
    if (!id) {
      console.error("Client ID is undefined");
      toast.error("Cannot edit client: Client ID not found");
      return;
    }
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = async () => {
    setIsEditModalOpen(false);
    await refetchClient();
    toast.success("Client updated successfully");
  };

  const handleDeleteClient = async () => {
    if (!id) {
      toast.error("Cannot delete client: Client ID not found");
      return;
    }

    try {
      setDeleteLoading(true);
      await clientService.delete(id);
      toast.success("Client deleted successfully");
      setIsDeleteModalOpen(false);
      navigate("/clients");
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to delete client";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateEvent = () => {
    if (!id) {
      toast.error("Cannot create event: Client ID not found");
      return;
    }

    navigate("/events/new", {
      state: {
        prefillClient: {
          _id: id,
          name: client?.name,
          email: client?.email,
          phone: client?.phone,
        },
        returnUrl: `/clients/${id}`,
        onEventCreated: refreshEvents,
      },
    });
  };

  const handleRecordPayment = (eventId) => {
    if (!eventId) {
      toast.error("Please select an event first");
      return;
    }

    if (!id) {
      toast.error("Cannot record payment: Client ID not found");
      return;
    }

    navigate(`/payments/new`, {
      state: {
        prefillEvent: {
          _id: eventId,
          clientId: id,
          clientName: client?.name,
        },
      },
    });
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
    return labels[status] || status || "Unknown";
  };

  const getStatusColor = (status) => {
    const colors = {
      active:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-white",
      inactive:
        "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-white",
      pending:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700 dark:text-white",
      confirmed:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700 dark:text-white",
      completed:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-white",
      cancelled:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-white",
      paid: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-white",
      partial:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-white",
      overdue:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-white",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
    );
  };

  const calculateStats = () => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter(
      (e) => new Date(e.startDate) > new Date() && e.status !== "cancelled"
    ).length;
    const totalRevenue = events.reduce(
      (sum, e) => sum + (e.pricing?.totalAmount || 0),
      0
    );
    // Use paymentSummary.paidAmount if available, otherwise default to 0
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading client details...
          </p>
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
                onClick={refetchClient}
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
      <div className="px-4 py-8">
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
                    disabled={!id}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition dark:text-red-400 dark:hover:bg-red-900"
                    title="Delete Client"
                    disabled={!id}
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
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Event History ({events.length})
                        </h3>
                        {eventsLoading && !events.length && (
                          <p className="text-sm text-gray-500 mt-1">
                            Loading events...
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={refreshEvents}
                          disabled={eventsLoading}
                          className="px-3 py-2 flex items-center gap-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                          title="Refresh Events"
                        >
                          <RefreshCw
                            className={`h-4 w-4 ${eventsLoading ? "animate-spin" : ""}`}
                          />
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
                            onClick={() => handleViewEvent(event)}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer dark:border-gray-600 dark:hover:shadow-lg"
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
                                  {event.guestCount && (
                                    <div className="flex items-center gap-2">
                                      <User className="w-4 h-4" />
                                      {event.guestCount} guests
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    {formatCurrency(
                                      event.pricing?.totalAmount || 0
                                    )}
                                  </div>
                                  {event.paymentSummary && (
                                    <div className="flex items-center gap-2">
                                      <CreditCard className="w-4 h-4" />
                                      <span
                                        className={`inline-block px-3 py-0.5 rounded-full text-sm border ${getStatusColor(
                                          event.paymentSummary?.status ||
                                            "pending"
                                        )}`}
                                      >
                                        {getStatusLabel(
                                          event.paymentSummary?.status ||
                                            "pending"
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNavigateToEvent(event._id);
                                }}
                                className="ml-2 p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition dark:text-orange-400 dark:hover:bg-orange-900"
                                title="View Full Event Page"
                              >
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
                      <button
                        onClick={() => {
                          if (events.length === 0) {
                            toast.error("No events available for payment");
                          } else if (events.length === 1) {
                            handleRecordPayment(events[0]._id);
                          } else {
                            toast.error(
                              "Please select a specific event to record payment"
                            );
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
                      {events.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-600 dark:text-gray-400">
                            No payment history found for this client
                          </p>
                        </div>
                      ) : (
                        events.map((event) => (
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
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                    event.paymentSummary?.status || "pending"
                                  )}`}
                                >
                                  {getStatusLabel(
                                    event.paymentSummary?.status || "pending"
                                  )}
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
                                  {formatCurrency(
                                    event.paymentSummary?.totalAmount ||
                                      event.pricing?.totalAmount ||
                                      0
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">
                                  Paid:
                                </span>
                                <div className="font-semibold text-green-600 dark:text-green-400">
                                  {formatCurrency(
                                    event.paymentSummary?.paidAmount || 0
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600 dark:text-gray-400">
                                  Balance:
                                </span>
                                <div className="font-semibold text-orange-600 dark:text-orange-400">
                                  {formatCurrency(
                                    (event.paymentSummary?.totalAmount ||
                                      event.pricing?.totalAmount ||
                                      0) -
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
                        ))
                      )}
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

      {/* Edit Client Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Client"
        size="lg"
      >
        <ClientForm
          client={client}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteClient}
        title="Delete Client"
        message={`Are you sure you want to delete "${client?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Client"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
        refreshData={refreshEvents}
      />
    </div>
  );
};

export default ClientDetail;
