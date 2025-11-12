// PartnerDetail.jsx
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";

// Components
import PartnerHeader from "./components/PartnerHeader";
import PartnerInfo from "./components/PartnerInfo";
import OverviewTab from "./components/OverviewTab";
import EventsTab from "./components/EventsTab";
import PerformanceTab from "./components/PerformanceTab";
import Modal, { ConfirmModal } from "../../components/common/Modal";
import PartnerForm from "./PartnerForm";
import EventDetailModal from "../events/EventDetailModal";

// Hooks and Services
import { usePartnerDetail } from "../../hooks/usePartnerDetail";
import { partnerService } from "../../api/index";
import { formatCurrency } from "../../utils/formatCurrency";

const PartnerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Use custom hook for partner data
  const { partnerData, events, loading, error, refreshData } =
    usePartnerDetail(id);

  // UI state
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);

  // Utility functions
  const formatDate = useCallback((date) => {
    if (!date) return "-";
    try {
      const d = new Date(date);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return date;
    }
  }, []);

  const formatDateTime = useCallback((dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "short" });
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      active: "Active",
      inactive: "Inactive",
      pending: "Pending",
    };
    return labels[status] || status || "Unknown";
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      active:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-100",
      inactive:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700 dark:text-red-100",
      pending:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700 dark:text-orange-100",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
    );
  }, []);

  const getCategoryColor = useCallback((category) => {
    const colors = {
      catering:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700",
      decoration:
        "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:border-pink-700",
      photography:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:border-purple-700",
      music:
        "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:border-indigo-700",
      security:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700",
      cleaning:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700",
      audio_visual:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700",
      floral:
        "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:border-pink-700",
      entertainment:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700",
      vendor:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700",
      supplier:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700",
      sponsor:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:border-purple-700",
      contractor:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700",
    };
    return (
      colors[category] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
    );
  }, []);

  const getEventStatusColor = useCallback((status) => {
    const colors = {
      pending:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700",
      confirmed:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:border-blue-700",
      "in-progress":
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:border-orange-700",
      completed:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:border-green-700",
      cancelled:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:border-red-700",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:border-gray-700"
    );
  }, []);

  // Calculate statistics
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
        return partnerId === id || partnerId === partnerData?._id;
      });
      return sum + (partnerData?.cost || partnerData?.hourlyRate || 0);
    }, 0);

    const averageRevenue = totalEvents > 0 ? totalRevenue / totalEvents : 0;
    const completionRate =
      totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
    const performanceScore = partnerData?.rating
      ? (partnerData.rating / 5) * 100
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
  }, [events, partnerData, id]);

  // Event handlers
  const handleViewEvent = useCallback((event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  }, []);

  const handleEditEvent = useCallback(
    (eventId) => {
      setIsEventModalOpen(false);
      navigate(`/events/${eventId}/edit`, {
        state: {
          returnUrl: `/partners/${id}`,
        },
      });
    },
    [navigate, id]
  );

  const handleNavigateToEvent = useCallback(
    (eventId, e) => {
      if (e && e.stopPropagation) e.stopPropagation();
      navigate(`/events/${eventId}`, {
        state: { fromPartner: id },
      });
    },
    [navigate, id]
  );

  const handleEditPartner = useCallback(() => {
    if (!id) {
      toast.error("Cannot edit partner: Partner ID not found");
      return;
    }
    setIsEditModalOpen(true);
  }, [id]);

  const handleEditSuccess = useCallback(async () => {
    setIsEditModalOpen(false);
    await refreshData();
    toast.success("Partner updated successfully");
  }, [refreshData]);

  const handleDeletePartner = useCallback(async () => {
    if (!id) {
      toast.error("Cannot delete partner: Partner ID not found");
      return;
    }

    try {
      setDeleteLoading(true);
      await partnerService.delete(id);
      toast.success("Partner deleted successfully");
      setIsDeleteModalOpen(false);
      navigate("/partners");
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete partner";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  }, [id, navigate]);

  // Loading state
  if (loading && !partnerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading partner details...
          </p>
        </div>
      </div>
    );
  }

  // Error or not found
  if (error || !partnerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full dark:bg-gray-800">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {!partnerData ? "Partner Not Found" : "Error Loading Partner"}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {error?.message ||
                "The partner you're looking for doesn't exist."}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("/partners")}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg border hover:bg-gray-700 transition"
              >
                Back to Partners
              </button>
              {error && (
                <button
                  onClick={refreshData}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Partner Details - Fixed Position */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <PartnerHeader
                partner={partnerData}
                onBack={() => navigate("/partners")}
                onEdit={handleEditPartner}
                onDelete={() => setIsDeleteModalOpen(true)}
                getStatusColor={getStatusColor}
                getStatusLabel={getStatusLabel}
                getCategoryColor={getCategoryColor}
              />

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-800">
                <PartnerInfo
                  partner={partnerData}
                  formatDate={formatDate}
                  getCategoryColor={getCategoryColor}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-800">
              <div className="border-b border-gray-200 dark:border-orange-800">
                <nav className="flex -mb-px">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "events", label: "Event History" },
                    { id: "performance", label: "Performance" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-6 py-3 text-sm font-medium border-b-2 transition ${
                        activeTab === tab.id
                          ? "border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400"
                          : "border-transparent text-gray-600 hover:text-gray-900 hover:border-orange-300 dark:text-gray-400 dark:hover:text-white"
                      }`}
                    >
                      {tab.label}
                      {tab.id === "events" && partnerStats.totalEvents > 0 && (
                        <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-orange-100 text-orange-600 dark:bg-orange-600 dark:text-orange-300">
                          {partnerStats.totalEvents}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "overview" && (
                  <OverviewTab
                    partner={partnerData}
                    partnerStats={partnerStats}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                  />
                )}

                {activeTab === "events" && (
                  <EventsTab
                    events={events}
                    partnerStats={partnerStats}
                    loading={loading}
                    onRefresh={refreshData}
                    onViewEvent={handleViewEvent}
                    onNavigateToEvent={handleNavigateToEvent}
                    formatDate={formatDate}
                    formatDateTime={formatDateTime}
                    getEventStatusColor={getEventStatusColor}
                    formatCurrency={formatCurrency}
                    partnerId={id}
                    partnerData={partnerData}
                  />
                )}

                {activeTab === "performance" && (
                  <PerformanceTab
                    partner={partnerData}
                    partnerStats={partnerStats}
                    formatCurrency={formatCurrency}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Partner"
        size="lg"
      >
        <PartnerForm
          partner={partnerData}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePartner}
        title="Delete Partner"
        message={`Are you sure you want to delete "${partnerData?.name}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Partner"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      <EventDetailModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onEdit={handleEditEvent}
        refreshData={refreshData}
      />
    </div>
  );
};

export default PartnerDetail;
