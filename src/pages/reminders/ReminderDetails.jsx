import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reminderService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import { ConfirmModal } from "../../components/common/Modal";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
  Calendar,
  User,
  Repeat,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";

const ReminderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reminder, setReminder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (id) {
      fetchReminder();
    }
  }, [id]);

  const fetchReminder = async () => {
    try {
      setIsLoading(true);
      const response = await reminderService.getById(id);
      
      // Handle different response structures
      const reminderData = response?.reminder || response?.data?.reminder || response?.data || response;
      
      if (!reminderData) {
        throw new Error("Reminder not found");
      }
      
      setReminder(reminderData);
    } catch (error) {
      console.error("Error fetching reminder:", error);
      toast.error(error.message || "Failed to load reminder");
      navigate("/reminders");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await reminderService.delete(id);
      toast.success("Reminder deleted successfully");
      navigate("/reminders");
    } catch (error) {
      toast.error("Failed to delete reminder");
    }
  };

  const handleComplete = async () => {
    try {
      // If complete method doesn't exist in service, use update
      if (reminderService.complete) {
        await reminderService.complete(id);
      } else {
        await reminderService.update(id, { status: "completed" });
      }
      toast.success("Reminder marked as completed");
      fetchReminder();
    } catch (error) {
      toast.error("Failed to complete reminder");
    }
  };

  const handleSnooze = async () => {
    try {
      await reminderService.snooze(id, { hours: 1 });
      toast.success("Reminder snoozed for 1 hour");
      fetchReminder();
    } catch (error) {
      toast.error("Failed to snooze reminder");
    }
  };

  const handleCancel = async () => {
    try {
      // If cancel method doesn't exist in service, use update
      if (reminderService.cancel) {
        await reminderService.cancel(id);
      } else {
        await reminderService.update(id, { status: "cancelled" });
      }
      toast.success("Reminder cancelled");
      fetchReminder();
    } catch (error) {
      toast.error("Failed to cancel reminder");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "blue",
      completed: "green",
      snoozed: "yellow",
      cancelled: "gray",
    };
    return colors[status] || "gray";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "gray",
      medium: "blue",
      high: "orange",
      urgent: "red",
    };
    return colors[priority] || "gray";
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("tn-TN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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

  const getNotificationIcon = (method) => {
    const icons = {
      email: Mail,
      sms: MessageSquare,
      push: Bell,
      in_app: Bell,
    };
    return icons[method] || Bell;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!reminder) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Reminder Not Found</h3>
        <p className="text-gray-500 mb-4">The reminder you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/reminders")}>
          Back to Reminders
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: "details", label: "Details", icon: FileText },
    { id: "recurrence", label: "Recurrence", icon: Repeat },
    { id: "history", label: "History", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate("/reminders")}
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {reminder.title}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge color={getStatusColor(reminder.status)}>
                {reminder.status}
              </Badge>
              <Badge color={getPriorityColor(reminder.priority)}>
                {reminder.priority} priority
              </Badge>
              <span className="text-sm text-gray-500 capitalize">
                {reminder.type?.replace("_", " ") || 'reminder'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {reminder.status === "active" && (
            <>
              <Button variant="outline" icon={Clock} onClick={handleSnooze}>
                Snooze
              </Button>
              <Button
                variant="success"
                icon={CheckCircle}
                onClick={handleComplete}
              >
                Complete
              </Button>
            </>
          )}
          {reminder.status === "active" && (
            <Button variant="outline" icon={XCircle} onClick={handleCancel}>
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            icon={Edit}
            onClick={() => navigate(`/reminders/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Reminder Information
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <p className="text-gray-900 mt-1">{reminder.title}</p>
                  </div>

                  {reminder.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                        {reminder.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </label>
                      <p className="text-gray-900 mt-1">
                        {formatDate(reminder.reminderDate || reminder.dueDate)}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time
                      </label>
                      <p className="text-gray-900 mt-1">
                        {formatTime(reminder.reminderTime)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <p className="text-gray-900 mt-1 capitalize">
                        {reminder.type?.replace("_", " ") || 'general'}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <p className="text-gray-900 mt-1 capitalize">
                        {reminder.priority}
                      </p>
                    </div>
                  </div>

                  {reminder.notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <p className="text-gray-600 mt-1 whitespace-pre-wrap">
                        {reminder.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notification Methods */}
            <div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Notification Methods
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {reminder.notificationMethods?.map((method, index) => {
                    const Icon = getNotificationIcon(method);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg"
                      >
                        <Icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900 capitalize">
                          {method.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {(!reminder.notificationMethods ||
                  reminder.notificationMethods.length === 0) && (
                  <p className="text-gray-500 text-sm">
                    No notification methods configured
                  </p>
                )}
              </div>
            </div>

            {/* Related Items */}
            {(reminder.relatedEvent ||
              reminder.relatedClient ||
              reminder.relatedTask ||
              reminder.relatedPayment) && (
              <div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Related Items
                  </h3>

                  <div className="space-y-3">
                    {reminder.relatedEvent && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {reminder.relatedEvent.title}
                            </p>
                            <p className="text-xs text-gray-500">Event</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={LinkIcon}
                          onClick={() =>
                            navigate(`/events/${reminder.relatedEvent._id}`)
                          }
                        />
                      </div>
                    )}

                    {reminder.relatedClient && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {reminder.relatedClient.name}
                            </p>
                            <p className="text-xs text-gray-500">Client</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={LinkIcon}
                          onClick={() =>
                            navigate(`/clients/${reminder.relatedClient._id}`)
                          }
                        />
                      </div>
                    )}

                    {reminder.relatedTask && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {reminder.relatedTask.title}
                            </p>
                            <p className="text-xs text-gray-500">Task</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={LinkIcon}
                          onClick={() =>
                            navigate(`/tasks/${reminder.relatedTask._id}`)
                          }
                        />
                      </div>
                    )}

                    {reminder.relatedPayment && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Payment #{reminder.relatedPayment._id?.slice(-6)}
                            </p>
                            <p className="text-xs text-gray-500">Payment</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={LinkIcon}
                          onClick={() =>
                            navigate(`/payments/${reminder.relatedPayment._id}`)
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div>
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Status
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Current Status
                    </span>
                    <Badge color={getStatusColor(reminder.status)}>
                      {reminder.status}
                    </Badge>
                  </div>

                  {reminder.status === "snoozed" && reminder.snoozeUntil && (
                    <div>
                      <span className="text-sm text-gray-600">
                        Snoozed Until
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDateTime(reminder.snoozeUntil)}
                      </p>
                    </div>
                  )}

                  {reminder.completedAt && (
                    <div>
                      <span className="text-sm text-gray-600">
                        Completed At
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDateTime(reminder.completedAt)}
                      </p>
                    </div>
                  )}

                  {reminder.completedBy && (
                    <div>
                      <span className="text-sm text-gray-600">
                        Completed By
                      </span>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {reminder.completedBy.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assigned Users */}
            {reminder.assignedTo && reminder.assignedTo.length > 0 && (
              <div>
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Assigned To
                  </h3>

                  <div className="space-y-3">
                    {reminder.assignedTo.map((user) => (
                      <div key={user._id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div>
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Metadata
                </h3>

                <div className="space-y-3 text-sm">
                  {reminder.createdBy && (
                    <div>
                      <span className="text-gray-600">Created By</span>
                      <p className="text-gray-900 font-medium mt-1">
                        {reminder.createdBy.name}
                      </p>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-600">Created At</span>
                    <p className="text-gray-900 font-medium mt-1">
                      {formatDateTime(reminder.createdAt)}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-600">Last Updated</span>
                    <p className="text-gray-900 font-medium mt-1">
                      {formatDateTime(reminder.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "recurrence" && (
        <div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recurrence Settings
            </h3>

            {reminder.isRecurring ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Frequency
                    </label>
                    <p className="text-gray-900 mt-1 capitalize">
                      {reminder.recurrence?.frequency}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Interval
                    </label>
                    <p className="text-gray-900 mt-1">
                      Every {reminder.recurrence?.interval}{" "}
                      {reminder.recurrence?.frequency}
                    </p>
                  </div>
                </div>

                {reminder.recurrence?.endDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <p className="text-gray-900 mt-1">
                      {formatDate(reminder.recurrence.endDate)}
                    </p>
                  </div>
                )}

                {reminder.recurrence?.daysOfWeek &&
                  reminder.recurrence.daysOfWeek.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Days of Week
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {reminder.recurrence.daysOfWeek.map((day) => (
                          <Badge key={day} color="blue">
                            {
                              ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                                day
                              ]
                            }
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                {reminder.recurrence?.dayOfMonth && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Day of Month
                    </label>
                    <p className="text-gray-900 mt-1">
                      Day {reminder.recurrence.dayOfMonth}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Repeat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  This is a one-time reminder (not recurring)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activity History
            </h3>

            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                Activity history will be implemented in the next phase
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default ReminderDetails;