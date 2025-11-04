import React, { useState, useEffect, useCallback } from "react";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Table from "../../components/common/Table";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import Pagination from "../../components/common/Pagination";
import { reminderService } from "../../api/index";
import {
  PlusIcon,
  RefreshCwIcon,
  BellIcon,
} from "../../components/icons/IconComponents";
import ReminderDetails from "./ReminderDetails";
import ReminderForm from "./ReminderForm";
import { format } from "date-fns";

const RemindersList = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filters and pagination
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [priority, setPriority] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch reminders function
  const fetchReminders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        search: search.trim() || undefined,
        status: status !== "all" ? status : undefined,
        type: type !== "all" ? type : undefined,
        priority: priority !== "all" ? priority : undefined,
        page: currentPage,
        limit,
      };

      const response = await reminderService.getAll(params);
      
      // FIXED: Simplified response handling based on handleResponse in API service
      // The handleResponse function returns response.data?.data || response.data
      const remindersData = response?.reminders || [];
      const paginationData = response?.pagination || {};

      setReminders(remindersData);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.total || remindersData.length);

    } catch (err) {
      console.error("Error fetching reminders:", err);
      setError(err.message || "Failed to load reminders. Please try again.");
      setReminders([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [search, status, type, priority, currentPage, limit]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Event handlers
  const handleAddReminder = useCallback(() => {
    setSelectedReminder(null);
    setIsFormOpen(true);
  }, []);

  const handleEditReminder = useCallback((reminder) => {
    setSelectedReminder(reminder);
    setIsModalOpen(false);
    setIsFormOpen(true);
  }, []);

  const handleViewReminder = useCallback((reminder) => {
    setSelectedReminder(reminder);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedReminder(null);
    setIsModalOpen(false);
    setIsFormOpen(false);
  }, []);

  const handleFormSuccess = useCallback(() => {
    fetchReminders();
    handleCloseModal();
  }, [fetchReminders, handleCloseModal]);

  const handleRefresh = useCallback(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Filter handlers
  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((e) => {
    setStatus(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleTypeChange = useCallback((e) => {
    setType(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePriorityChange = useCallback((e) => {
    setPriority(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setStatus("all");
    setType("all");
    setPriority("all");
    setCurrentPage(1);
  }, []);

  // FIXED: Helper function for status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "completed":
        return "success";
      case "active":
        return "info";
      case "snoozed":
        return "warning";
      case "cancelled":
        return "danger";
      default:
        return "gray";
    }
  };

  // FIXED: Helper function for type badge variant
  const getTypeBadgeVariant = (type) => {
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

  // FIXED: Helper function for priority badge variant
  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "urgent":
        return "danger";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "gray";
      default:
        return "gray";
    }
  };

  // Table columns configuration
  const tableColumns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'date', label: 'Date & Time', sortable: true },
    { key: 'type', label: 'Type' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const tableData = reminders.map((reminder) => ({
    id: reminder._id || reminder.id,
    title: reminder.title || "Untitled",
    // FIXED: Use reminderDate and reminderTime from model
    date: reminder.reminderDate 
      ? `${format(new Date(reminder.reminderDate), "PP")} ${reminder.reminderTime || ""}`
      : "No date",
    // FIXED: Use correct type values from model enum
    type: (
      <Badge variant={getTypeBadgeVariant(reminder.type)}>
        {reminder.type || "other"}
      </Badge>
    ),
    // FIXED: Added priority column
    priority: (
      <Badge variant={getPriorityBadgeVariant(reminder.priority)}>
        {reminder.priority || "medium"}
      </Badge>
    ),
    // FIXED: Use correct status values and variants
    status: (
      <Badge variant={getStatusBadgeVariant(reminder.status)}>
        {reminder.status || "active"}
      </Badge>
    ),
    actions: (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleViewReminder(reminder)}
        >
          View
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleEditReminder(reminder)}
        >
          Edit
        </Button>
      </div>
    )
  }));

  const hasActiveFilters = search || status !== "all" || type !== "all" || priority !== "all";

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reminders
          </h1>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
            Manage notifications, alerts, and follow-up reminders.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            icon={RefreshCwIcon}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            variant="primary" 
            icon={PlusIcon}
            onClick={handleAddReminder}
          >
            Add Reminder
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Search & Filters */}
      <Card>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search reminders..."
                value={search}
                onChange={handleSearchChange}
                icon={BellIcon}
              />
            </div>
            <div className="sm:w-40">
              <Select
                value={status}
                onChange={handleStatusChange}
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
                value={type}
                onChange={handleTypeChange}
                options={[
                  { value: "all", label: "All Types" },
                  { value: "event", label: "Event" },
                  { value: "payment", label: "Payment" },
                  { value: "task", label: "Task" },
                  { value: "maintenance", label: "Maintenance" },
                  { value: "followup", label: "Follow-up" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>
            <div className="sm:w-40">
              <Select
                value={priority}
                onChange={handlePriorityChange}
                options={[
                  { value: "all", label: "All Priorities" },
                  { value: "urgent", label: "Urgent" },
                  { value: "high", label: "High" },
                  { value: "medium", label: "Medium" },
                  { value: "low", label: "Low" },
                ]}
              />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <RefreshCwIcon className="mx-auto h-12 w-12 animate-spin" />
            <p className="mt-2">Loading reminders...</p>
          </div>
        ) : reminders.length > 0 ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {reminders.length} of {totalItems} reminders
              </p>
            </div>
            <Table
              columns={tableColumns}
              data={tableData}
              loading={loading}
            />
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center p-4 border-t border-gray-200 dark:border-gray-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={limit}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <BellIcon className="mx-auto h-12 w-12" />
            <p className="mt-2">
              {hasActiveFilters
                ? "No reminders found. Try adjusting your filters."
                : "No reminders found. Create your first reminder to get started."
              }
            </p>
            {hasActiveFilters && (
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="mt-4"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* View Modal */}
      {isModalOpen && selectedReminder && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Reminder Details"
          size="lg"
        >
          <ReminderDetails
            reminder={selectedReminder}
            onEdit={() => handleEditReminder(selectedReminder)}
            onClose={handleCloseModal}
          />
        </Modal>
      )}

      {/* Add/Edit Form */}
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleCloseModal}
          title={selectedReminder ? "Edit Reminder" : "Add Reminder"}
          size="lg"
        >
          <ReminderForm
            reminder={selectedReminder}
            onSuccess={handleFormSuccess}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}
    </div>
  );
};

export default RemindersList;