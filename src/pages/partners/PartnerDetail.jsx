// PartnerDetail.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckSquare,
  AlertCircle,
  Tag,
  Eye,
  TrendingUp,
  Archive,
  MessageSquare,
  DollarSign,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building,
  MoreVertical,
} from "lucide-react";
import { partnerService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import ProgressBar from "../../components/common/ProgressBar";

// Import tab components
import OverviewTab from "./components/OverviewTab";
import EventsTab from "./components/EventsTab";
import PerformanceTab from "./components/PerformanceTab";
import PartnerForm from "./PartnerForm";
import EventDetailModal from "../events/EventDetailModal";

const PartnerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showLoading, dismiss } = useToast();
  
  const [partner, setPartner] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchPartnerData();
    } else {
      setLoading(false);
      showError("Invalid partner ID");
      navigate("/partners");
    }
  }, [id]);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      
      // Fetch partner details
      const partnerResponse = await partnerService.getById(id);
      let fetchedPartner = null;
      
      // Handle API response structure
      if (partnerResponse?.data?.partner) {
        fetchedPartner = partnerResponse.data.partner;
      } else if (partnerResponse?.partner) {
        fetchedPartner = partnerResponse.partner;
      } else if (partnerResponse?.data) {
        fetchedPartner = partnerResponse.data;
      } else if (partnerResponse) {
        fetchedPartner = partnerResponse;
      }
      
      if (!fetchedPartner) {
        throw new Error("Partner not found in response");
      }
      
      setPartner(fetchedPartner);
      
      // Fetch partner events - using getAll events and filtering
      try {
        // Since getPartnerEvents doesn't exist, we'll fetch all events and filter
        // You might need to adjust this based on your actual API structure
        const eventsResponse = await fetch('/api/events'); // Adjust this endpoint
        const eventsData = await eventsResponse.json();
        
        // Filter events that include this partner
        const partnerEvents = eventsData.filter(event => 
          event.partners?.some(p => {
            const partnerId = p.partner?._id?.$oid || p.partner?._id || p.partner;
            return partnerId === id || partnerId === fetchedPartner?._id;
          })
        );
        
        setEvents(Array.isArray(partnerEvents) ? partnerEvents : []);
      } catch (eventsError) {
        console.error("Error fetching partner events:", eventsError);
        // If events API fails, set empty array and continue
        setEvents([]);
        showError("Failed to load partner events, but partner details loaded successfully");
      }
      
    } catch (error) {
      console.error("Error fetching partner:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to load partner details";
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Use useMemo for partner stats calculation
  const partnerStats = useMemo(() => {
    const totalEvents = events.length;
    const completedEvents = events.filter(
      (e) => e.status === "completed"
    ).length;
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
    const performanceScore = partner?.rating
      ? (partner.rating / 5) * 100
      : 0;

    return {
      totalEvents,
      completedEvents,
      upcomingEvents,
      totalRevenue,
      averageRevenue,
      completionRate,
      performanceScore,
    };
  }, [events, partner, id]);

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await partnerService.delete(id);
      showSuccess("Partner deleted successfully");
      navigate("/partners");
    } catch (error) {
      console.error("Delete error:", error);
      showError(error.response?.data?.message || "Failed to delete partner");
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    await fetchPartnerData();
    showSuccess("Partner updated successfully");
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEditEvent = (eventId) => {
    setShowEventModal(false);
    navigate(`/events/${eventId}/edit`, {
      state: { returnUrl: `/partners/${id}` }
    });
  };

  const handleNavigateToEvent = (eventId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    navigate(`/events/${eventId}`, {
      state: { fromPartner: id }
    });
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatShortDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // FIXED: Format address object to string
  const formatAddress = (address) => {
    if (!address) return '-';
    
    if (typeof address === 'string') return address;
    
    if (typeof address === 'object') {
      const parts = [
        address.street,
        address.city,
        address.state,
        address.zipCode,
        address.country
      ].filter(part => part && part.trim() !== '');
      
      return parts.join(', ');
    }
    
    return '-';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      inactive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: "Active",
      inactive: "Inactive",
      pending: "Pending"
    };
    return labels[status] || status || "Unknown";
  };

  const getCategoryColor = (category) => {
    const colors = {
      catering: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      decoration: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      photography: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      music: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
      security: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      cleaning: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      audio_visual: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      floral: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      entertainment: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      vendor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      supplier: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      sponsor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      contractor: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    };
    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const getEventStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "in-progress": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <EmptyState
          icon={AlertCircle}
          title="Partner Not Found"
          description="The partner you're looking for doesn't exist or has been removed."
          action={{
            label: "Back to Partners",
            onClick: () => navigate("/partners")
          }}
        />
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon, count }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count > 0 && (
        <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  // FIXED: DetailItem component with proper value handling
  const DetailItem = ({ label, value, icon: Icon, children }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        {children || (
          <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
            {value || '-'}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowLeft}
                onClick={() => navigate("/partners")}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Back to Partners
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-2xl">
                  {partner.name}
                </h1>
                <Badge className={getStatusColor(partner.status)}>
                  {getStatusLabel(partner.status)}
                </Badge>
                {partner.category && (
                  <Badge className={getCategoryColor(partner.category)}>
                    {partner.category.replace('_', ' ')}
                  </Badge>
                )}
                {partner.rating && (
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm dark:bg-yellow-900/30 dark:text-yellow-300">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{partner.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                icon={Edit}
                onClick={() => setShowEditModal(true)}
                size="sm"
              >
                Edit
              </Button>
              
              <div className="relative group">
                <Button
                  variant="outline"
                  icon={MoreVertical}
                  size="sm"
                  className="px-3"
                >
                  Actions
                </Button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Partner
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Partner
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto">
            <TabButton id="overview" label="Overview" icon={Eye} />
            <TabButton 
              id="events" 
              label="Events" 
              icon={Calendar} 
              count={partnerStats.totalEvents} 
            />
            <TabButton id="performance" label="Performance" icon={TrendingUp} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <OverviewTab
                partner={partner}
                partnerStats={partnerStats}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
              />
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <EventsTab
                events={events}
                partnerStats={partnerStats}
                loading={loading}
                onRefresh={fetchPartnerData}
                onViewEvent={handleViewEvent}
                onNavigateToEvent={handleNavigateToEvent}
                formatDate={formatDate}
                formatShortDate={formatShortDate}
                getEventStatusColor={getEventStatusColor}
                formatCurrency={formatCurrency}
                partnerId={id}
                partnerData={partner}
              />
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <PerformanceTab
                partner={partner}
                partnerStats={partnerStats}
                formatCurrency={formatCurrency}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Events</p>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                    {partnerStats.totalEvents}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Completion Rate</p>
                  <ProgressBar value={partnerStats.completionRate} size="sm" />
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                    {Math.round(partnerStats.completionRate)}%
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Revenue</p>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                    <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                    {formatCurrency(partnerStats.totalRevenue)}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-3">
                {partner.contactPerson && (
                  <DetailItem label="Contact Person" value={partner.contactPerson} icon={User} />
                )}
                {partner.email && (
                  <DetailItem label="Email" value={partner.email} icon={Mail} />
                )}
                {partner.phone && (
                  <DetailItem label="Phone" value={partner.phone} icon={Phone} />
                )}
                
                {/* FIXED: Address formatting */}
                {partner.address && (
                  <DetailItem label="Address" icon={MapPin}>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-words">
                      {formatAddress(partner.address)}
                    </p>
                  </DetailItem>
                )}
                
                {partner.website && (
                  <DetailItem label="Website" value={partner.website} icon={Globe} />
                )}
                {partner.company && (
                  <DetailItem label="Company" value={partner.company} icon={Building} />
                )}
              </div>
            </div>

            {/* Partner Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Partner Details
              </h3>
              <div className="space-y-3">
                <DetailItem 
                  label="Joined Date" 
                  value={formatShortDate(partner.createdAt)} 
                  icon={Calendar} 
                />
                <DetailItem 
                  label="Category" 
                  value={partner.category?.replace('_', ' ')} 
                  icon={Tag} 
                />
                <DetailItem 
                  label="Status" 
                  value={getStatusLabel(partner.status)} 
                  icon={CheckSquare} 
                />
                {partner.specialization && (
                  <DetailItem 
                    label="Specialization" 
                    value={partner.specialization} 
                    icon={Star} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Partner Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Partner"
        size="lg"
      >
        <PartnerForm
          partner={partner}
          onSuccess={handleEditSuccess}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Partner"
        size="sm"
      >
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Delete Partner?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete <strong>"{partner.name}"</strong>? This action cannot be undone and will remove all associated data.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleDelete}
              loading={actionLoading}
            >
              Delete Partner
            </Button>
          </div>
        </div>
      </Modal>

      {/* Event Detail Modal */}
      <EventDetailModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
        refreshData={fetchPartnerData}
      />
    </div>
  );
};

export default PartnerDetail;