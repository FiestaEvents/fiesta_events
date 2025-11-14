import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import { partnerService } from "../../api/index";
import {
  Plus,
  Search,
  Filter,
  Eye,
  X,
  Edit,
  Trash2,
  Users,
  Star,
  AlertTriangle,
} from "lucide-react";
import PartnerForm from "./PartnerForm";
import PartnerDetailModal from "./PartnerDetailModal";
import { useToast } from "../../context/ToastContext";

const PartnersList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    partnerId: null,
    partnerName: "",
    onConfirm: null
  });

  // Search & filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Category options from schema
  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "driver", label: "Driver" },
    { value: "bakery", label: "Bakery" },
    { value: "catering", label: "Catering" },
    { value: "decoration", label: "Decoration" },
    { value: "photography", label: "Photography" },
    { value: "music", label: "Music" },
    { value: "security", label: "Security" },
    { value: "cleaning", label: "Cleaning" },
    { value: "audio_visual", label: "Audio/Visual" },
    { value: "floral", label: "Floral" },
    { value: "entertainment", label: "Entertainment" },
    { value: "hairstyling", label: "Hair Styling" },
    { value: "other", label: "Other" },
  ];

  // Fetch partners with comprehensive validation
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(category !== "all" && { category }),
      };

      const response = await partnerService.getAll(params);

      let partnersData = [];
      let totalPages = 1;
      let totalCount = 0;

      // Handle response structure
      if (response?.partners && Array.isArray(response.partners)) {
        // Validate and filter partners
        partnersData = response.partners.filter((partner, index) => {
          // Check for null/undefined
          if (!partner) {
            console.warn(`⚠️ Partner at index ${index} is ${partner}`);
            return false;
          }

          // Check for required fields
          if (!partner._id) {
            console.warn(`⚠️ Partner at index ${index} missing _id:`, partner);
            return false;
          }

          // Check if it's a valid object
          if (typeof partner !== "object") {
            console.warn(
              `⚠️ Partner at index ${index} is not an object:`,
              typeof partner
            );
            return false;
          }

          return true;
        });

        totalPages = response.pagination?.pages || 1;
        totalCount = response.pagination?.total || partnersData.length;

        console.log("✅ Processed partners response:", {
          received: response.partners.length,
          valid: partnersData.length,
          filtered: response.partners.length - partnersData.length,
          totalPages,
          totalCount,
        });
      } else if (Array.isArray(response)) {
        // Fallback for direct array response
        partnersData = response.filter(
          (partner) =>
            partner != null && typeof partner === "object" && partner._id
        );
        totalCount = partnersData.length;

        console.log("✅ Processed array response:", {
          received: response.length,
          valid: partnersData.length,
        });
      } else {
        console.error("❌ Unexpected response structure:", response);
        throw new Error("Invalid response format from server");
      }

      // Final validation
      if (partnersData.length > 0) {
        console.log("✅ Sample partner:", partnersData[0]);

        // Check for any remaining undefined values (shouldn't happen after filtering)
        const hasUndefined = partnersData.some((p) => !p);
        if (hasUndefined) {
          console.error("❌ Still have undefined partners after filtering!");
          partnersData = partnersData.filter((p) => p != null);
        }
      }

      setPartners(partnersData);
      setTotalPages(totalPages);
      setTotalCount(totalCount);
      setHasInitialLoad(true);
    } catch (err) {
      console.error("❌ Error fetching partners:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load partners. Please try again.";
      setError(errorMessage);
      showError(errorMessage);
      setPartners([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, category, page, limit, showError]);

  // Show confirmation modal
  const showDeleteConfirmation = useCallback((partnerId, partnerName = "Partner") => {
    setConfirmationModal({
      isOpen: true,
      partnerId,
      partnerName,
      onConfirm: () => handleDeleteConfirm(partnerId, partnerName)
    });
  }, []);

  // Close confirmation modal
  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({
      isOpen: false,
      partnerId: null,
      partnerName: "",
      onConfirm: null
    });
  }, []);

  // Handle confirmed deletion
  const handleDeleteConfirm = useCallback(async (partnerId, partnerName = "Partner") => {
    if (!partnerId) {
      showError("Invalid partner ID");
      return;
    }

    try {
      // Use the promise toast for loading state
      await promise(
        partnerService.delete(partnerId),
        {
          loading: `Deleting ${partnerName}...`,
          success: `${partnerName} deleted successfully`,
          error: `Failed to delete ${partnerName}`
        }
      );

      // Refresh the partners list
      fetchPartners();
      
      // Close detail modal if the deleted partner is currently selected
      if (selectedPartner?._id === partnerId) {
        setSelectedPartner(null);
        setIsDetailModalOpen(false);
      }

      // Close confirmation modal
      closeConfirmationModal();
    } catch (err) {
      // Error is already handled by the promise toast
      console.error("Delete partner error:", err);
      closeConfirmationModal();
    }
  }, [fetchPartners, selectedPartner, promise, showError, closeConfirmationModal]);

  // Updated partner deletion handler
  const handleDeletePartner = useCallback((partnerId, partnerName = "Partner") => {
    showDeleteConfirmation(partnerId, partnerName);
  }, [showDeleteConfirmation]);

  // Handle row click to open detail modal
  const handleRowClick = useCallback((partner) => {
    setSelectedPartner(partner);
    setIsDetailModalOpen(true);
  }, []);

  // Handle detail modal close
  const handleDetailModalClose = useCallback(() => {
    setSelectedPartner(null);
    setIsDetailModalOpen(false);
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleAddPartner = useCallback(() => {
    setSelectedPartner(null);
    setIsFormOpen(true);
  }, []);

  const handleEditPartner = useCallback((partner) => {
    setSelectedPartner(partner);
    setIsDetailModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewPartner = useCallback(
    (partner) => {
      navigate(`/partners/${partner._id}`, { state: { partner } });
    },
    [navigate]
  );

  const handleFormSuccess = useCallback(() => {
    fetchPartners();
    setSelectedPartner(null);
    setIsFormOpen(false);
    showSuccess(
      selectedPartner 
        ? "Partner updated successfully" 
        : "Partner added successfully"
    );
  }, [fetchPartners, selectedPartner, showSuccess]);

  const handleFormClose = useCallback(() => {
    setSelectedPartner(null);
    setIsFormOpen(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setCategory("all");
    setPage(1);
    showInfo("Filters cleared");
  }, [showInfo]);

  const handleRetry = useCallback(() => {
    fetchPartners();
    showInfo("Retrying to load partners...");
  }, [fetchPartners, showInfo]);

  const hasActiveFilters =
    search.trim() !== "" || status !== "all" || category !== "all";
  const showEmptyState =
    !loading &&
    !error &&
    partners.length === 0 &&
    !hasActiveFilters &&
    hasInitialLoad;
  const showNoResults =
    !loading &&
    !error &&
    partners.length === 0 &&
    hasActiveFilters &&
    hasInitialLoad;

  // Helper function to format category labels
  const formatCategory = (cat) => {
    return categoryOptions.find((opt) => opt.value === cat)?.label || cat;
  };

  // Table columns configuration
  const columns = [
    {
      header: "Partner Name",
      accessor: "name",
      sortable: true,
      width: "20%",
      render: (row) => {
        console.log("🔍 Rendering Partner Name - row:", row);
        if (!row) {
          console.error("❌ Row is undefined in Partner Name column!");
          return <div>-</div>;
        }
        return (
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {row.name || "Unnamed"}
            </div>
            {row.company && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {row.company}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: "Contact",
      accessor: "email",
      sortable: true,
      width: "20%",
      render: (row) => {
        if (!row) return <div>-</div>;
        return (
          <div className="text-sm">
            <div className="text-gray-900 dark:text-white">
              {row.email || "-"}
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {row.phone || "-"}
            </div>
          </div>
        );
      },
    },
    {
      header: "Category",
      accessor: "category",
      sortable: true,
      width: "15%",
      render: (row) => {
        if (!row) return <div>-</div>;
        return <Badge color="blue">{formatCategory(row.category)}</Badge>;
      },
    },
    {
      header: "Rating",
      accessor: "rating",
      sortable: true,
      width: "12%",
      render: (row) => {
        if (!row) return <div>-</div>;
        return (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {row.rating?.toFixed(1) || "0.0"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({row.totalJobs || 0})
            </span>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "12%",
      render: (row) => {
        if (!row) return <div>-</div>;
        return (
          <Badge color={row.status === "active" ? "green" : "red"}>
            {row.status === "active" ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      header: "Hourly Rate",
      accessor: "hourlyRate",
      sortable: true,
      width: "12%",
      render: (row) => {
        if (!row) return <div>-</div>;
        return (
          <div className="text-sm text-gray-900 dark:text-white">
            {row.hourlyRate ? `$${row.hourlyRate}/hr` : "-"}
          </div>
        );
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      width: "9%",
      className: "text-center",
      render: (row) => {
        if (!row) return <div>-</div>;
        return (
          <div className="flex justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(row);
              }}
              className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 p-1 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
              title="View Partner"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditPartner(row);
              }}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              title="Edit Partner"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeletePartner(row._id, row.name || "Partner");
              }}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              title="Delete Partner"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Partners
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your service partners and vendors.{" "}
            {hasInitialLoad &&
              totalCount > 0 &&
              `Showing ${partners.length} of ${totalCount} partners`}
          </p>
        </div>
        {totalCount > 0 && (
          <Button
            variant="primary"
            onClick={handleAddPartner}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Partner
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                Error Loading Partners
              </p>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
            <Button onClick={handleRetry} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      {hasInitialLoad && !showEmptyState && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Search}
                placeholder="Search partners by name, email, or company..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <div className="sm:w-48">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Filter}
                value={category}
                onChange={(e) => {
                  setPage(1);
                  setCategory(e.target.value);
                }}
                options={categoryOptions}
              />
            </div>
            <div className="sm:w-40">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Active filters:</span>
              {search.trim() && (
                <Badge color="blue">Search: "{search.trim()}"</Badge>
              )}
              {category !== "all" && (
                <Badge color="purple">
                  Category: {formatCategory(category)}
                </Badge>
              )}
              {status !== "all" && (
                <Badge color="green">Status: {status}</Badge>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && !hasInitialLoad && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Loading partners...
          </p>
        </div>
      )}

      {/* Table Section */}
      {!loading && hasInitialLoad && partners.length > 0 && (
        <Table
          columns={columns}
          data={partners}
          loading={loading}
          emptyMessage="No partners found"
          onRowClick={handleRowClick}
          striped
          hoverable
          pagination={totalPages > 1}
          currentPage={page}
          totalPages={totalPages}
          pageSize={limit}
          totalItems={totalCount}
          onPageChange={setPage}
          onPageSizeChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      )}

      {/* No Results from Search/Filter */}
      {showNoResults && (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No partners found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No partners match your current search or filter criteria.
          </p>
          <Button onClick={handleClearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Empty State - No partners at all */}
      {showEmptyState && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No partners yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by adding your first service partner.
          </p>
          <Button onClick={handleAddPartner} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add First Partner
          </Button>
        </div>
      )}

      {/* Partner Detail Modal */}
      <PartnerDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        partner={selectedPartner}
        onEdit={handleEditPartner}
        refreshData={fetchPartners}
      />

      {/* Add/Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={handleFormClose}
        title={selectedPartner ? "Edit Partner" : "Add New Partner"}
        size="lg"
      >
        <PartnerForm
          partner={selectedPartner}
          onSuccess={handleFormSuccess}
          onCancel={handleFormClose}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        title="Confirm Deletion"
        size="md"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Partner
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <strong>"{confirmationModal.partnerName}"</strong>? 
                This action cannot be undone and all associated data will be permanently removed.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeConfirmationModal}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmationModal.onConfirm}
                  className="px-4 py-2 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Partner
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PartnersList;