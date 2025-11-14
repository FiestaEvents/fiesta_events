import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/NewTable";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Pagination from "../../components/common/Pagination";
import { reminderService } from "../../api/index";
import { BellIcon } from "../../components/icons/IconComponents";
import { Plus, Search, Filter, Eye, X, Edit, Trash2, Clock, BellOff, AlertTriangle } from "lucide-react";
import ReminderDetailModal from "./ReminderDetailModal";
import ReminderForm from "./ReminderForm";
import Badge from "../../components/common/Badge";
import { format, addHours, addDays, formatISO } from "date-fns";
import { useToast } from "../../context/ToastContext";

const RemindersList = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo, promise } = useToast();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [snoozingReminders, setSnoozingReminders] = useState(new Set());

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    reminderId: null,
    reminderName: "",
    onConfirm: null
  });

  // Snooze options modal state
  const [snoozeOptionsModal, setSnoozeOptionsModal] = useState({ 
    isOpen: false, 
    reminder: null 
  });

  // Search & filter state
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch reminders with toast notifications
  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        ...(search.trim() && { search: search.trim() }),
        ...(status !== "all" && { status }),
        ...(type !== "all" && { type }),
        ...(priority !== "all" && { priority }),
      };

      const response = await reminderService.getAll(params);

      let remindersData = [];
      let totalPages = 1;
      let totalCount = 0;

      if (response?.data?.data?.reminders) {
        remindersData = response.data.data.reminders || [];
        totalPages = response.data.data.totalPages || 1;
        totalCount = response.data.data.totalCount || remindersData.length;
      } else if (response?.data?.reminders) {
        remindersData = response.data.reminders || [];
        totalPages = response.data.totalPages || 1;
        totalCount = response.data.totalCount || remindersData.length;
      } else if (response?.reminders) {
        remindersData = response.reminders || [];
        totalPages = response.totalPages || 1;
        totalCount = response.totalCount || remindersData.length;
      } else if (Array.isArray(response?.data)) {
        remindersData = response.data;
      } else if (Array.isArray(response)) {
        remindersData = response;
      }

      setReminders(remindersData);
      setTotalPages(totalPages);
      setTotalCount(totalCount);
      setHasInitialLoad(true);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load reminders. Please try again.";
      setError(errorMessage);
      showError(errorMessage);
      setReminders([]);
      setHasInitialLoad(true);
    } finally {
      setLoading(false);
    }
  }, [search, status, type, priority, page, limit, showError]);

  // Show confirmation modal
  const showDeleteConfirmation = useCallback((reminderId, reminderName = "Reminder") => {
    setConfirmationModal({
      isOpen: true,
      reminderId,
      reminderName,
      onConfirm: () => handleDeleteConfirm(reminderId, reminderName)
    });
  }, []);

  // Close confirmation modal
  const closeConfirmationModal = useCallback(() => {
    setConfirmationModal({
      isOpen: false,
      reminderId: null,
      reminderName: "",
      onConfirm: null
    });
  }, []);

  // Handle confirmed deletion
  const handleDeleteConfirm = useCallback(async (reminderId, reminderName = "Reminder") => {
    if (!reminderId) {
      showError("Invalid reminder ID");
      return;
    }

    try {
      // Use the promise toast for loading state
      await promise(
        reminderService.delete(reminderId),
        {
          loading: `Deleting ${reminderName}...`,
          success: `${reminderName} deleted successfully`,
          error: `Failed to delete ${reminderName}`
        }
      );

      // Refresh the reminders list
      fetchReminders();
      
      // Close detail modal if the deleted reminder is currently selected
      if (selectedReminder?._id === reminderId) {
        setSelectedReminder(null);
        setIsDetailModalOpen(false);
      }
      
      // Close confirmation modal
      closeConfirmationModal();
    } catch (err) {
      // Error is already handled by the promise toast
      console.error("Delete reminder error:", err);
      closeConfirmationModal();
    }
  }, [fetchReminders, selectedReminder, promise, showError, closeConfirmationModal]);

  // Updated reminder deletion handler
  const handleDeleteReminder = useCallback((reminderId, reminderName = "Reminder") => {
    showDeleteConfirmation(reminderId, reminderName);
  }, [showDeleteConfirmation]);

  // Handle row click to open detail modal
  const handleRowClick = useCallback((reminder) => {
    setSelectedReminder(reminder);
    setIsDetailModalOpen(true);
  }, []);

  // Handle detail modal close
  const handleDetailModalClose = useCallback(() => {
    setSelectedReminder(null);
    setIsDetailModalOpen(false);
  }, []);

  // Handle snooze with options
  const handleSnoozeClick = useCallback((reminder) => {
    if (!reminder?._id) {
      showError("Invalid reminder data");
      return;
    }
    setSnoozeOptionsModal({ isOpen: true, reminder });
  }, [showError]);

  // Handle snooze action with specific duration
  const handleSnoozeAction = useCallback(async (duration, unit = 'hours') => {
    const { reminder } = snoozeOptionsModal;
    
    if (!reminder?._id) {
      showError("Invalid reminder data");
      return;
    }

    try {
      setSnoozingReminders(prev => new Set(prev).add(reminder._id));

      // Calculate snooze until date based on duration and unit
      const now = new Date();
      let snoozeUntil;
      
      switch (unit) {
        case 'hours':
          snoozeUntil = addHours(now, duration);
          break;
        case 'days':
          snoozeUntil = addDays(now, duration);
          break;
        default:
          snoozeUntil = addHours(now, duration);
      }

      // Format the date for the backend (ISO string)
      const snoozeData = {
        snoozeUntil: snoozeUntil.toISOString(),
        duration: duration,
        unit: unit
      };

      await promise(
        reminderService.snooze(reminder._id, snoozeData),
        {
          loading: `Snoozing reminder for ${duration} ${unit}...`,
          success: `Reminder snoozed for ${duration} ${unit}`,
          error: `Failed to snooze reminder`
        }
      );
      
      // Refresh the list
      await fetchReminders();
      setSnoozeOptionsModal({ isOpen: false, reminder: null });
    } catch (err) {
      console.error("Error snoozing reminder:", err);
      
      // Try alternative approach if the first one fails
      if (err.response?.data?.message?.includes("Invalid snooze date")) {
        try {
          // Try with just the date string without additional fields
          const snoozeUntil = addHours(new Date(), duration);
          const alternativeData = {
            snoozeUntil: snoozeUntil.toISOString()
          };
          
          await promise(
            reminderService.snooze(reminder._id, alternativeData),
            {
              loading: `Snoozing reminder for ${duration} ${unit}...`,
              success: `Reminder snoozed for ${duration} ${unit}`,
              error: `Failed to snooze reminder`
            }
          );
          await fetchReminders();
          setSnoozeOptionsModal({ isOpen: false, reminder: null });
          return;
        } catch (secondErr) {
          console.error("Alternative snooze also failed:", secondErr);
        }
      }
    } finally {
      setSnoozingReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(reminder._id);
        return newSet;
      });
    }
  }, [snoozeOptionsModal, fetchReminders, promise, showError]);

  // Handle unsnooze
  const handleUnsnooze = useCallback(async (reminder) => {
    if (!reminder?._id) {
      showError("Invalid reminder data");
      return;
    }

    try {
      setSnoozingReminders(prev => new Set(prev).add(reminder._id));
      
      // Update status back to active and clear snooze fields
      await promise(
        reminderService.update(reminder._id, { 
          status: "active",
          snoozeUntil: null
        }),
        {
          loading: "Activating reminder...",
          success: "Reminder activated successfully",
          error: "Failed to activate reminder"
        }
      );
      
      await fetchReminders();
    } catch (err) {
      console.error("Error unsnoozing reminder:", err);
    } finally {
      setSnoozingReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(reminder._id);
        return newSet;
      });
    }
  }, [fetchReminders, promise, showError]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleAddReminder = useCallback(() => {
    setSelectedReminder(null);
    setIsFormOpen(true);
  }, []);

  const handleEditReminder = useCallback((reminder) => {
    setSelectedReminder(reminder);
    setIsDetailModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewReminder = useCallback((reminder) => {
    if (reminder && reminder._id) {
      navigate(`/reminders/${reminder._id}`);
    } else {
      console.error('Invalid reminder data:', reminder);
      showError('Cannot view reminder: Invalid data');
    }
  }, [navigate, showError]);

  const handleFormSuccess = useCallback(() => {
    fetchReminders();
    setSelectedReminder(null);
    setIsFormOpen(false);
    showSuccess(
      selectedReminder 
        ? "Reminder updated successfully" 
        : "Reminder created successfully"
    );
  }, [fetchReminders, selectedReminder, showSuccess]);

  const handleFormClose = useCallback(() => {
    setSelectedReminder(null);
    setIsFormOpen(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setType("all");
    setPriority("all");
    setPage(1);
    showInfo("Filters cleared");
  }, [showInfo]);

  const handleRetry = useCallback(() => {
    fetchReminders();
    showInfo("Retrying to load reminders...");
  }, [fetchReminders, showInfo]);

  // Helper functions for badges
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "active":
        return "blue";
      case "snoozed":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case "event":
        return "blue";
      case "payment":
        return "yellow";
      case "task":
        return "purple";
      case "maintenance":
        return "orange";
      case "followup":
        return "green";
      default:
        return "gray";
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "yellow";
      case "low":
        return "gray";
      default:
        return "gray";
    }
  };

  const hasActiveFilters = search.trim() !== "" || status !== "all" || type !== "all" || priority !== "all";
  const showEmptyState =
    !loading &&
    !error &&
    reminders.length === 0 &&
    !hasActiveFilters &&
    hasInitialLoad;
  const showNoResults =
    !loading &&
    !error &&
    reminders.length === 0 &&
    hasActiveFilters &&
    hasInitialLoad;

  // Table columns configuration for the new Table component
  const columns = [
    {
      header: "Title",
      accessor: "title",
      sortable: true,
      width: "20%",
      render: (row) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.title || "Untitled Reminder"}
        </div>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      sortable: true,
      width: "18%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.description ? `${row.description.substring(0, 50)}${row.description.length > 50 ? '...' : ''}` : "No description"}
        </div>
      ),
    },
    {
      header: "Date & Time",
      accessor: "reminderDate",
      sortable: true,
      width: "15%",
      render: (row) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.reminderDate 
            ? `${format(new Date(row.reminderDate), "MMM dd, yyyy")} ${row.reminderTime || ""}`
            : "No date"
          }
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      sortable: true,
      width: "10%",
      render: (row) => (
        <Badge color={getTypeBadgeColor(row.type)}>
          {row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1) : "Other"}
        </Badge>
      ),
    },
    {
      header: "Priority",
      accessor: "priority",
      sortable: true,
      width: "10%",
      render: (row) => (
        <Badge color={getPriorityBadgeColor(row.priority)}>
          {row.priority ? row.priority.charAt(0).toUpperCase() + row.priority.slice(1) : "Medium"}
        </Badge>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      sortable: true,
      width: "10%",
      render: (row) => (
        <Badge color={getStatusBadgeColor(row.status)}>
          {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : "Active"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      width: "17%",
      className: "text-center",
      render: (row) => {
        const isSnoozing = snoozingReminders.has(row._id);
        const isSnoozed = row.status === "snoozed";
        
        return (
          <div className="flex justify-center gap-1">
            {/* Snooze/Unsnooze Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isSnoozed) {
                  handleUnsnooze(row);
                } else {
                  handleSnoozeClick(row);
                }
              }}
              disabled={isSnoozing}
              className={`p-2 rounded transition ${
                isSnoozed 
                  ? "bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              } ${isSnoozing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              title={isSnoozed ? "Unsnooze Reminder" : "Snooze Reminder"}
            >
              {isSnoozing ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : isSnoozed ? (
                <BellOff className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </button>

            {/* View Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick(row);
              }}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
              title="View Reminder"
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditReminder(row);
              }}
              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-2 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition"
              title="Edit Reminder"
            >
              <Edit className="h-4 w-4" />
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteReminder(row._id, row.title || "Reminder");
              }}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              title="Delete Reminder"
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
            Reminders
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage notifications, alerts, and follow-up reminders.{" "}
            {hasInitialLoad &&
              totalCount > 0 &&
              `Showing ${reminders.length} of ${totalCount} reminders`}
          </p>
        </div>
        <div className="flex gap-2">
          {totalCount > 0 && (
            <Button
              variant="primary"
              onClick={handleAddReminder}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Reminder
            </Button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">
                Error Loading Reminders
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
                placeholder="Search reminders by title or description..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <div className="sm:w-40">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                icon={Filter}
                value={status}
                onChange={(e) => {
                  setPage(1);
                  setStatus(e.target.value);
                }}
                options={[
                  { value: "all", label: "All Status" },
                  { value: "active", label: "Active" },
                  { value: "completed", label: "Completed" },
                  { value: "snoozed", label: "Snoozed" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
              />
            </div>
            <div className="sm:w-40">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                value={type}
                onChange={(e) => {
                  setPage(1);
                  setType(e.target.value);
                }}
                options={[
                  { value: "all", label: "All Types" },
                  { value: "event", label: "Event" },
                  { value: "payment", label: "Payment" },
                  { value: "task", label: "Task" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "followup", label: "Follow-up" },
                ]}
              />
            </div>
            <div className="sm:w-40">
              <Select
                className="dark:bg-[#1f2937] dark:text-white"
                value={priority}
                onChange={(e) => {
                  setPage(1);
                  setPriority(e.target.value);
                }}
                options={[
                  { value: "all", label: "All Priorities" },
                  { value: "urgent", label: "Urgent" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
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
              {status !== "all" && (
                <Badge color="purple">Status: {status}</Badge>
              )}
              {type !== "all" && (
                <Badge color="green">Type: {type}</Badge>
              )}
              {priority !== "all" && (
                <Badge color="orange">Priority: {priority}</Badge>
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
            Loading reminders...
          </p>
        </div>
      )}

      {/* Table Section */}
      {!loading && hasInitialLoad && reminders.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              data={reminders}
              loading={loading}
              onRowClick={handleRowClick}
              pagination={true}
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
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={limit}
                onPageSizeChange={(newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                }}
                totalItems={totalCount}
              />
            </div>
          )}
        </>
      )}

      {/* No Results from Search/Filter */}
      {showNoResults && (
        <div className="text-center py-12">
          <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No reminders found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No reminders match your current search or filter criteria.
          </p>
          <Button onClick={handleClearFilters} variant="outline">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Empty State - No reminders at all */}
      {showEmptyState && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <BellIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No reminders yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Get started by creating your first reminder.
          </p>
          <Button onClick={handleAddReminder} variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Create First Reminder
          </Button>
        </div>
      )}

      {/* Reminder Detail Modal */}
      <ReminderDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleDetailModalClose}
        reminder={selectedReminder}
        onEdit={handleEditReminder}
        refreshData={fetchReminders}
      />

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedReminder ? "Edit Reminder" : "Create New Reminder"}
          size="lg"
        >
          <ReminderForm
            reminder={selectedReminder}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </Modal>
      )}

      {/* Snooze Options Modal */}
      <Modal
        isOpen={snoozeOptionsModal.isOpen}
        onClose={() => setSnoozeOptionsModal({ isOpen: false, reminder: null })}
        title="Snooze Reminder"
        size="sm"
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            How long would you like to snooze this reminder?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSnoozeAction(1, 'hours')}
              className="justify-center"
            >
              1 Hour
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSnoozeAction(2, 'hours')}
              className="justify-center"
            >
              2 Hours
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSnoozeAction(4, 'hours')}
              className="justify-center"
            >
              4 Hours
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSnoozeAction(8, 'hours')}
              className="justify-center"
            >
              8 Hours
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSnoozeAction(1, 'days')}
              className="justify-center"
            >
              1 Day
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSnoozeAction(2, 'days')}
              className="justify-center"
            >
              2 Days
            </Button>
          </div>
        </div>
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
                Delete Reminder
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete <strong>"{confirmationModal.reminderName}"</strong>? 
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
                  Delete Reminder
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RemindersList;