import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { partnerService, eventService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import formatCurrency from "../../utils/formatCurrency";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Building,
  Star,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FileText,
  AlertCircle,
  ExternalLink,
  Award,
  Target,
  BarChart3,
} from "lucide-react";
import { toast } from "react-hot-toast";

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // State for partner and events data
  const [partner, setPartner] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch partner details and events
  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Fetching partner details for ID:", id);

      // Fetch partner details
      const partnerResponse = await partnerService.getById(id);
      console.log("📋 Partner API response:", partnerResponse);

      let partnerData = null;

      // Handle different response structures
      if (partnerResponse?.data?.partner) {
        partnerData = partnerResponse.data.partner;
      } else if (partnerResponse?.partner) {
        partnerData = partnerResponse.partner;
      } else if (partnerResponse?.data?.data) {
        partnerData = partnerResponse.data.data;
      } else if (partnerResponse?.data) {
        partnerData = partnerResponse.data;
      } else if (partnerResponse) {
        partnerData = partnerResponse;
      }

      console.log("✅ Extracted partner data:", partnerData);

      // Handle MongoDB $oid format
      if (partnerData?._id?.$oid) {
        partnerData._id = partnerData._id.$oid;
      }

      if (!partnerData || !partnerData._id) {
        console.error("❌ Partner data structure invalid:", partnerData);
        throw new Error("Partner not found");
      }

      setPartner(partnerData);

      // Fetch partner events
      try {
        const eventsResponse = await eventService.getAll({
          limit: 100,
          page: 1,
        });
        console.log("📅 Events API response:", eventsResponse);

        let eventsData = [];

        if (eventsResponse?.data?.data?.events) {
          eventsData = eventsResponse.data.data.events;
        } else if (eventsResponse?.data?.events) {
          eventsData = eventsResponse.data.events;
        } else if (eventsResponse?.events) {
          eventsData = eventsResponse.events;
        } else if (Array.isArray(eventsResponse?.data)) {
          eventsData = eventsResponse.data;
        } else if (Array.isArray(eventsResponse)) {
          eventsData = eventsResponse;
        }

        console.log("📊 All events loaded:", eventsData.length);

        // Filter events that include this partner - IMPROVED FILTERING
        const partnerEvents = eventsData.filter((event) => {
          if (!event.partners || !Array.isArray(event.partners)) return false;

          return event.partners.some((p) => {
            // Handle different partner reference formats
            const partnerId =
              p.partner?._id?.$oid ||
              p.partner?._id ||
              p.partner ||
              p.partnerId?._id?.$oid ||
              p.partnerId?._id ||
              p.partnerId;

            return partnerId === id || partnerId === partnerData._id;
          });
        });

        console.log("🎯 Partner events found:", partnerEvents.length);
        console.log("🔍 Sample partner event:", partnerEvents[0]);

        setEvents(partnerEvents);
      } catch (eventsError) {
        console.error("❌ Error fetching events:", eventsError);
        // Don't fail the whole page if events fail to load
        setEvents([]);
      }
    } catch (err) {
      console.error("❌ Error fetching partner:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load partner details";
      setError(errorMessage);
      setPartner(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPartnerData();
    }
  }, [id]);

  // Delete partner function
  const handleDelete = async () => {
    try {
      setDeleting(true);
      console.log("🗑️ Deleting partner:", id);

      await partnerService.delete(id);

      toast.success("Partner deleted successfully");
      navigate("/partners");
    } catch (err) {
      console.error("❌ Error deleting partner:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete partner";
      toast.error(errorMessage);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Utility functions
  const getCategoryColor = (category) => {
    const colors = {
      catering: "blue",
      decoration: "pink",
      photography: "purple",
      music: "indigo",
      security: "red",
      cleaning: "green",
      audio_visual: "orange",
      floral: "pink",
      entertainment: "orange",
      vendor: "blue",
      supplier: "green",
      sponsor: "purple",
      contractor: "orange",
      other: "gray",
    };
    return colors[category] || "gray";
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "green",
      inactive: "red",
    };
    return colors[status] || "green";
  };

  const getEventStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      confirmed: "blue",
      "in-progress": "orange",
      completed: "green",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  // Calculate statistics
  const totalEvents = events.length;
  const completedEvents = events.filter((e) => e.status === "completed").length;
  const upcomingEvents = events.filter((e) =>
    ["confirmed", "pending", "in-progress"].includes(e.status)
  ).length;

  const totalRevenue = events.reduce((sum, event) => {
    const partnerData = event.partners?.find((p) => {
      const partnerId = p.partner?._id?.$oid || p.partner?._id || p.partner;
      return partnerId === id || partnerId === partner?._id;
    });
    return sum + (partnerData?.cost || partnerData?.hourlyRate || 0);
  }, 0);

  const averageRevenue = totalEvents > 0 ? totalRevenue / totalEvents : 0;
  const completionRate =
    totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

  // Performance metrics
  const performanceScore = partner?.rating ? (partner.rating / 5) * 100 : 0;
  const responseRate = partner?.responseRate || "N/A";

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: Briefcase },
    {
      id: "events",
      label: "Event History",
      icon: Calendar,
      count: totalEvents,
    },
    { id: "performance", label: "Performance", icon: TrendingUp },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading partner details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !partner) {
    return (
      <div className="p-6">
        <EmptyState
          icon={XCircle}
          title="Partner Not Found"
          description={
            error ||
            "The partner you're looking for doesn't exist or has been removed."
          }
          action={{
            label: "Back to Partners",
            onClick: () => navigate("/partners"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/partners")}
                icon={ArrowLeft}
                className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
              >
                Back to Partners
              </Button>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {partner.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {partner.company} •{" "}
                  {partner.category?.replace("_", " ").toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                icon={Edit}
                onClick={() => navigate(`/partners/${id}/edit`)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-orange-600 hover:text-orange-600"
              >
                Edit Partner
              </Button>
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => setShowDeleteModal(true)}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Partner Status
                  </p>
                  <Badge
                    color={getStatusColor(partner.status)}
                    className="text-sm font-semibold"
                  >
                    {partner.status?.charAt(0).toUpperCase() +
                      partner.status?.slice(1)}
                  </Badge>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-800 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Events
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalEvents}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-gray-400" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Performance Rating
                  </p>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-orange-400 fill-current" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {partner.rating?.toFixed(1) || "0.0"}
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      /5.0
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                  <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Hourly Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partner.hourlyRate
                      ? formatCurrency(partner.hourlyRate)
                      : "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Partner Quick Info */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-orange-600" />
                  Partner Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Category
                    </p>
                    <Badge
                      color={getCategoryColor(partner.type || partner.category)}
                      className="capitalize"
                    >
                      {(partner.type || partner.category)?.replace("_", " ") ||
                        "Other"}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Member Since
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(partner.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Last Updated
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(partner.updatedAt)}
                    </p>
                  </div>

                  {partner.specialties && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Specialties
                      </p>
                      <p className="text-gray-900 dark:text-white text-sm">
                        {partner.specialties}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-orange-600" />
                  Contact Info
                </h3>
                <div className="space-y-3">
                  {partner.email && (
                    <div className="flex items-start">
                      <Mail className="w-4 h-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <a
                        href={`mailto:${partner.email}`}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm"
                      >
                        {partner.email}
                      </a>
                    </div>
                  )}

                  {partner.phone && (
                    <div className="flex items-start">
                      <Phone className="w-4 h-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <a
                        href={`tel:${partner.phone}`}
                        className="text-gray-900 dark:text-white text-sm"
                      >
                        {partner.phone}
                      </a>
                    </div>
                  )}

                  {partner.location && (
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-900 dark:text-white text-sm">
                        {partner.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                          ${
                            activeTab === tab.id
                              ? "border-orange-600 text-orange-600 dark:text-orange-400"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 mr-2" />
                        {tab.label}
                        {tab.count !== undefined && (
                          <span
                            className={`
                              ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                              ${
                                activeTab === tab.id
                                  ? "bg-orange-100 text-orange-600 dark:bg-orange-600 dark:text-orange-300"
                                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                              }
                            `}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Company & Services */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {partner.company && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Company Information
                          </h4>
                          <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <Building className="w-5 h-5 text-gray-400 mr-2" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {partner.company}
                              </span>
                            </div>
                            {partner.specialties && (
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {partner.specialties}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Services */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Services & Expertise
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {partner.services && partner.services.length > 0 ? (
                            partner.services.map((service, index) => (
                              <Badge
                                key={index}
                                color="orange"
                                className="text-sm"
                              >
                                {service}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              No specific services listed
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {partner.notes && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Additional Notes
                        </h4>
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {partner.notes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {partner.address && (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Address
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <div className="flex items-start">
                            <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="text-gray-600 dark:text-gray-400">
                              {partner.address.street && (
                                <p className="font-medium">
                                  {partner.address.street}
                                </p>
                              )}
                              <p>
                                {[
                                  partner.address.city,
                                  partner.address.state,
                                  partner.address.zipCode,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                              {partner.address.country && (
                                <p>{partner.address.country}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "events" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Event History
                      </h3>
                      <Badge color="orange" className="text-sm">
                        {totalEvents} Total Events
                      </Badge>
                    </div>

                    {events.length > 0 ? (
                      <div className="space-y-4">
                        {events.map((event) => {
                          const partnerData = event.partners?.find((p) => {
                            const partnerId =
                              p.partner?._id?.$oid ||
                              p.partner?._id ||
                              p.partner;
                            return (
                              partnerId === id || partnerId === partner._id
                            );
                          });
                          const cost =
                            partnerData?.cost || partnerData?.hourlyRate || 0;

                          return (
                            <div
                              key={event._id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200"
                            >
                              <div className="flex-1 mb-3 sm:mb-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <Link
                                      to={`/events/${event._id}`}
                                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                                    >
                                      {event.title}
                                    </Link>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDateTime(event.startDate)}
                                      </div>
                                      <Badge
                                        color={getEventStatusColor(
                                          event.status
                                        )}
                                      >
                                        {event.status}
                                      </Badge>
                                      {event.type && (
                                        <Badge color="gray">{event.type}</Badge>
                                      )}
                                    </div>
                                  </div>
                                  <ExternalLink className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Partner Revenue
                                </p>
                                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                  {formatCurrency(cost)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Calendar}
                        title="No Events Found"
                        description="This partner hasn't been assigned to any events yet."
                        size="sm"
                      />
                    )}
                  </div>
                )}

                {activeTab === "performance" && (
                  <div className="space-y-6">
                    {/* Performance Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-orange-600" />
                            Performance Score
                          </h4>
                          <div className="text-center">
                            <div className="inline-flex items-baseline">
                              <span className="text-4xl font-bold text-orange-600 dark:text-orange-400">
                                {performanceScore.toFixed(0)}%
                              </span>
                              <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
                                /100%
                              </span>
                            </div>
                            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${performanceScore}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                            Event Statistics
                          </h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">
                                Completed Events
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {completedEvents}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">
                                Upcoming Events
                              </span>
                              <span className="font-semibold text-orange-600 dark:text-orange-400">
                                {upcomingEvents}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 dark:text-gray-400">
                                Completion Rate
                              </span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {completionRate.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* Financial Summary */}
                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <div className="p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
                          Financial Summary
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Total Revenue
                            </p>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {formatCurrency(totalRevenue)}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Average per Event
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(averageRevenue)}
                            </p>
                          </div>
                          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Hourly Rate
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {partner.hourlyRate
                                ? formatCurrency(partner.hourlyRate)
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Partner"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete{" "}
            <strong className="text-gray-900 dark:text-white">
              {partner.name}
            </strong>
            ? This action cannot be undone.
          </p>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">
                This partner will be removed from all associated events and
                cannot be recovered.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              {deleting ? "Deleting..." : "Delete Partner"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnerDetail;
