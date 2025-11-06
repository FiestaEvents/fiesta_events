import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { partnerService, eventService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
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
      if (partnerResponse?.data?.data) {
        partnerData = partnerResponse.data.data;
      } else if (partnerResponse?.data) {
        partnerData = partnerResponse.data;
      } else if (partnerResponse) {
        partnerData = partnerResponse;
      }

      if (!partnerData || !partnerData._id) {
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

        // Filter events that include this partner
        const partnerEvents = eventsData.filter((event) =>
          event.partners?.some((p) => p.partner === id)
        );

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
      audio_visual: "yellow",
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
      inactive: "gray",
      pending: "yellow",
      suspended: "red",
    };
    return colors[status] || "gray";
  };

  const getEventStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      confirmed: "blue",
      "in-progress": "purple",
      completed: "green",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("tn-TN", {
      style: "currency",
      currency: "TND",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("tn-TN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate statistics
  const totalEvents = events.length;
  const completedEvents = events.filter((e) => e.status === "completed").length;
  const upcomingEvents = events.filter((e) =>
    ["confirmed", "pending", "in-progress"].includes(e.status)
  ).length;

  const totalRevenue = events.reduce((sum, event) => {
    const partnerData = event.partners?.find((p) => p.partner === id);
    return sum + (partnerData?.cost || 0);
  }, 0);

  const averageRevenue = totalEvents > 0 ? totalRevenue / totalEvents : 0;
  const completionRate =
    totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

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
        <LoadingSpinner size="lg" />
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/partners")}
            icon={ArrowLeft}
          >
            Back to Partners
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {partner.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Partner ID: {partner._id?.slice(-8).toUpperCase() || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Edit}
            onClick={() => navigate(`/partners/${id}/edit`)}
          >
            Edit Partner
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Status
              </p>
              <div className="mt-2">
                <Badge color={getStatusColor(partner.status)}>
                  {partner.status?.charAt(0).toUpperCase() +
                    partner.status?.slice(1) || "Unknown"}
                </Badge>
              </div>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Jobs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {totalEvents}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rating
              </p>
              <div className="flex items-center mt-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
                  {partner.rating?.toFixed(1) || "0.0"}
                </p>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Hourly Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {partner.hourlyRate
                  ? formatCurrency(partner.hourlyRate)
                  : "N/A"}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Card>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
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
                        ? "border-purple-600 text-purple-600 dark:text-purple-400"
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
                          ? "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {partner.email && (
                      <div className="flex items-start">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Email
                          </p>
                          <a
                            href={`mailto:${partner.email}`}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                          >
                            {partner.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {partner.phone && (
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Phone
                          </p>
                          <a
                            href={`tel:${partner.phone}`}
                            className="text-gray-900 dark:text-white"
                          >
                            {partner.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {partner.company && (
                      <div className="flex items-start">
                        <Building className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Company
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {partner.company}
                          </p>
                        </div>
                      </div>
                    )}

                    {partner.location && (
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="ml-3">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Location
                          </p>
                          <p className="text-gray-900 dark:text-white">
                            {partner.location}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                {partner.address && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Address
                    </h3>
                    <div className="text-gray-600 dark:text-gray-400">
                      {partner.address.street && (
                        <p>{partner.address.street}</p>
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
                )}

                {/* Notes */}
                {partner.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Notes
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {partner.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Services/Specialties */}
                {partner.services && partner.services.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Services
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {partner.services.map((service, index) => (
                        <Badge key={index} color="blue">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Partner Details */}
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Partner Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Category
                        </p>
                        <div className="mt-1">
                          <Badge
                            color={getCategoryColor(
                              partner.type || partner.category
                            )}
                            className="capitalize"
                          >
                            {(partner.type || partner.category)?.replace(
                              "_",
                              " "
                            ) || "Other"}
                          </Badge>
                        </div>
                      </div>

                      {partner.specialties && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Specialties
                          </p>
                          <p className="text-gray-900 dark:text-white mt-1">
                            {partner.specialties}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Member Since
                        </p>
                        <p className="text-gray-900 dark:text-white mt-1">
                          {formatDate(partner.createdAt)}
                        </p>
                      </div>

                      {partner.updatedAt && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Last Updated
                          </p>
                          <p className="text-gray-900 dark:text-white mt-1">
                            {formatDate(partner.updatedAt)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total Events
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {totalEvents}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Completed
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {completedEvents}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Upcoming
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {upcomingEvents}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Total Revenue
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalRevenue)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Event History ({totalEvents} events)
              </h3>

              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => {
                    const partnerData = event.partners?.find(
                      (p) => p.partner === id
                    );
                    return (
                      <div
                        key={event._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                      >
                        <div className="flex-1 mb-3 sm:mb-0">
                          <Link
                            to={`/events/${event._id}`}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium block"
                          >
                            {event.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(event.startDate)}
                            </div>
                            <Badge color={getEventStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                            {event.type && (
                              <Badge color="gray">{event.type}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Partner Cost
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(partnerData?.cost)}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Jobs Completed
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {totalEvents}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Average Rating
                      </span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {partner.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Completion Rate
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        On-Time Delivery
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {partner.onTimeRate ? `${partner.onTimeRate}%` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Financial Summary */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Financial Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Hourly Rate
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {partner.hourlyRate
                          ? formatCurrency(partner.hourlyRate)
                          : "Not set"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Revenue Generated
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(totalRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Average per Event
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(averageRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Performance Score
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {partner.rating
                          ? `${(partner.rating * 20).toFixed(0)}%`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>

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
