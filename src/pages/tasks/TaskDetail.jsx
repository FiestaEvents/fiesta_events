import React, { useState, useEffect } from "react";
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
  Link as LinkIcon,
  Flag,
  TrendingUp,
  Archive,
  MessageSquare,
  Paperclip,
  Download,
  Play,
  Pause,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { taskService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import ProgressBar from "../../components/common/ProgressBar";
import StatusBadge from "../../components/common/StatusBadge";
import PriorityBadge from "../../components/common/PriorityBadge";

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showLoading, dismiss } = useToast();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchTask();
    } else {
      setLoading(false);
      showError("Invalid task ID");
      navigate("/tasks");
    }
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      console.log('Fetching task with ID:', id);
      
      const response = await taskService.getById(id);
      console.log('Task API Response:', response);
      
      // Handle the API response structure based on your controller
      let fetchedTask = null;
      
      // Based on your controller's response structure: new ApiResponse({ task })
      if (response?.data?.task) {
        fetchedTask = response.data.task;
      } else if (response?.task) {
        fetchedTask = response.task;
      } else if (response?.data) {
        // If the task is directly in data
        fetchedTask = response.data;
      } else if (response) {
        // If the response itself is the task
        fetchedTask = response;
      }
      
      if (!fetchedTask) {
        throw new Error("Task not found in response");
      }
      
      console.log('Processed task data:', fetchedTask);
      setTask(fetchedTask);
      
    } catch (error) {
      console.error("Error fetching task:", error);
      console.error("Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Failed to load task details";
      
      showError(errorMessage);
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await taskService.delete(id);
      showSuccess("Task deleted successfully");
      navigate("/tasks");
    } catch (error) {
      console.error("Delete error:", error);
      showError(error.response?.data?.message || "Failed to delete task");
    } finally {
      setActionLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      await taskService.updateStatus(id, newStatus);
      showSuccess(`Status updated to ${newStatus.replace('_', ' ')}`);
      fetchTask();
    } catch (error) {
      console.error("Status change error:", error);
      showError(error.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      await taskService.complete(id);
      showSuccess("Task marked as completed");
      fetchTask();
    } catch (error) {
      console.error("Complete error:", error);
      showError(error.response?.data?.message || "Failed to complete task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setActionLoading(true);
      await taskService.archive(id);
      showSuccess("Task archived successfully");
      navigate("/tasks");
    } catch (error) {
      console.error("Archive error:", error);
      showError(error.response?.data?.message || "Failed to archive task");
    } finally {
      setActionLoading(false);
    }
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

  const formatDateTime = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isOverdue = (date, status) => {
    if (!date) return false;
    return new Date(date) < new Date() && !["completed", "cancelled"].includes(status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <EmptyState
          icon={AlertCircle}
          title="Task Not Found"
          description="The task you're looking for doesn't exist or has been removed."
          action={{
            label: "Back to Tasks",
            onClick: () => navigate("/tasks")
          }}
        />
      </div>
    );
  }

  // Calculate progress
  const completedSubtasks = task?.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task?.subtasks?.length || 0;
  const progress = task?.progress || (totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0);

  const TabButton = ({ id, label, icon: Icon }) => (
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
    </button>
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
                onClick={() => navigate("/tasks")}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Back to Tasks
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-2xl">
                  {task.title}
                </h1>
                <StatusBadge status={task.status} size="lg" />
                <PriorityBadge priority={task.priority} size="lg" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {task.status !== "completed" && (
                <Button
                  variant="success"
                  icon={CheckSquare}
                  onClick={handleComplete}
                  loading={actionLoading}
                  size="sm"
                >
                  Complete
                </Button>
              )}
              
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
                    onClick={() => navigate(`/tasks/${id}/edit`)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Task
                  </button>
                  <button
                    onClick={handleArchive}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Archive className="w-4 h-4" />
                    Archive Task
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Task
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto">
            <TabButton id="overview" label="Overview" icon={Eye} />
            <TabButton id="subtasks" label="Subtasks" icon={CheckSquare} />
            <TabButton id="comments" label="Comments" icon={MessageSquare} />
            <TabButton id="attachments" label="Attachments" icon={Paperclip} />
            <TabButton id="timeline" label="Timeline" icon={Clock} />
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
              <div className="space-y-6">
                {/* Progress & Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Progress</p>
                      <ProgressBar value={progress} size="lg" />
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                        {Math.round(progress)}%
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Subtasks</p>
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto">
                        <CheckSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                        {completedSubtasks}/{totalSubtasks}
                      </p>
                    </div>

                    {task.estimatedHours && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Estimated</p>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                          {task.estimatedHours}h
                        </p>
                      </div>
                    )}

                    {task.actualHours && (
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Actual</p>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                          <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                          {task.actualHours}h
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Description
                    </h3>
                    {task.description ? (
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {task.description}
                      </p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No description provided
                      </p>
                    )}
                  </div>
                </div>

                {/* Blocked Status */}
                {task.status === "blocked" && task.blockedReason && (
                  <div className="border-l-4 border-l-red-500">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                            Task Blocked
                          </h4>
                          <p className="text-red-700 dark:text-red-300">
                            {task.blockedReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subtasks Tab */}
            {activeTab === "subtasks" && (
              <div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Subtasks
                    </h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {completedSubtasks} of {totalSubtasks} completed
                    </span>
                  </div>

                  {totalSubtasks > 0 ? (
                    <>
                      <div className="mb-6">
                        <ProgressBar value={progress} />
                      </div>
                      <div className="space-y-3">
                        {task.subtasks.map((subtask, index) => (
                          <div
                            key={subtask._id || index}
                            className="flex items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className={`w-5 h-5 rounded border-2 mt-0.5 flex-shrink-0 ${
                              subtask.completed
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300 dark:border-gray-600"
                            }`}>
                              {subtask.completed && (
                                <CheckSquare className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div className="ml-4 flex-1">
                              <p className={`font-medium ${
                                subtask.completed
                                  ? "line-through text-gray-500 dark:text-gray-400"
                                  : "text-gray-900 dark:text-white"
                              }`}>
                                {subtask.title}
                              </p>
                              {subtask.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {subtask.description}
                                </p>
                              )}
                              {subtask.completedAt && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  Completed {formatShortDate(subtask.completedAt)}
                                  {subtask.completedBy && ` by ${subtask.completedBy.name || subtask.completedBy}`}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <EmptyState
                      icon={CheckSquare}
                      title="No subtasks"
                      description="Add subtasks to break down this task into smaller steps."
                      size="sm"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Comments ({task.comments?.length || 0})
                  </h3>
                  
                  {task.comments?.length > 0 ? (
                    <div className="space-y-4">
                      {task.comments.map((comment, index) => (
                        <div key={comment._id || index} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {comment.author?.name?.charAt(0) || "U"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {comment.author?.name || "Unknown User"}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDateTime(comment.createdAt)}
                              </span>
                              {comment.isEdited && (
                                <Badge variant="gray" size="sm">edited</Badge>
                              )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={MessageSquare}
                      title="No comments yet"
                      description="Be the first to comment on this task."
                      size="sm"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Attachments Tab */}
            {activeTab === "attachments" && (
              <div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Attachments ({task.attachments?.length || 0})
                  </h3>
                  
                  {task.attachments?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {task.attachments.map((attachment, index) => (
                        <div
                          key={attachment._id || index}
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex-shrink-0">
                            <Paperclip className="w-8 h-8 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {attachment.fileName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {attachment.fileSize && `${(attachment.fileSize / 1024).toFixed(1)} KB`}
                              {attachment.fileSize && " • "}
                              {formatShortDate(attachment.uploadDate)}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm" icon={Download}>
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Paperclip}
                      title="No attachments"
                      description="Upload files to keep them organized with this task."
                      size="sm"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Timeline Tab */}
            {activeTab === "timeline" && (
              <div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                    Timeline
                  </h3>
                  <div className="space-y-6">
                    <TimelineItem
                      date={task.createdAt}
                      title="Task Created"
                      description={`by ${task.createdBy?.name || "System"}`}
                      icon="create"
                    />
                    {task.assignedAt && (
                      <TimelineItem
                        date={task.assignedAt}
                        title="Task Assigned"
                        description={`to ${task.assignedTo?.name || "Unassigned"}`}
                        icon="assign"
                      />
                    )}
                    {task.completedAt && (
                      <TimelineItem
                        date={task.completedAt}
                        title="Task Completed"
                        description={`by ${task.completedBy?.name || "System"}`}
                        icon="complete"
                      />
                    )}
                    {task.cancelledAt && (
                      <TimelineItem
                        date={task.cancelledAt}
                        title="Task Cancelled"
                        description={task.cancellationReason || "No reason provided"}
                        icon="cancel"
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {task.status === "todo" && (
                    <Button
                      variant="primary"
                      className="w-full justify-center"
                      icon={Play}
                      onClick={() => handleStatusChange("in_progress")}
                      loading={actionLoading}
                    >
                      Start Working
                    </Button>
                  )}
                  {task.status === "in_progress" && (
                    <Button
                      variant="outline"
                      className="w-full justify-center"
                      icon={Pause}
                      onClick={() => handleStatusChange("todo")}
                      loading={actionLoading}
                    >
                      Pause Task
                    </Button>
                  )}
                  {task.status !== "completed" && (
                    <Button
                      variant="success"
                      className="w-full justify-center"
                      icon={CheckSquare}
                      onClick={handleComplete}
                      loading={actionLoading}
                    >
                      Mark Complete
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    icon={Archive}
                    onClick={handleArchive}
                    loading={actionLoading}
                  >
                    Archive Task
                  </Button>
                </div>
              </div>
            </div>

            {/* Task Details */}
            <div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Task Details
                </h3>
                <div className="space-y-4">
                  <DetailItem
                    label="Due Date"
                    value={formatShortDate(task.dueDate)}
                    icon={Calendar}
                    warning={isOverdue(task.dueDate, task.status)}
                  />
                  {task.startDate && (
                    <DetailItem
                      label="Start Date"
                      value={formatShortDate(task.startDate)}
                      icon={Calendar}
                    />
                  )}
                  {task.assignedTo && (
                    <DetailItem
                      label="Assigned To"
                      value={task.assignedTo.name}
                      icon={User}
                    />
                  )}
                  {task.category && (
                    <DetailItem
                      label="Category"
                      value={task.category.replace("_", " ")}
                      icon={Tag}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Related Items */}
            {(task.relatedEvent || task.relatedClient || task.relatedPartner) && (
              <div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Related Items
                  </h3>
                  <div className="space-y-3">
                    {task.relatedEvent && (
                      <RelatedItem
                        type="event"
                        item={task.relatedEvent}
                        onClick={() => task.relatedEvent._id && navigate(`/events/${task.relatedEvent._id}`)}
                      />
                    )}
                    {task.relatedClient && (
                      <RelatedItem
                        type="client"
                        item={task.relatedClient}
                        onClick={() => task.relatedClient._id && navigate(`/clients/${task.relatedClient._id}`)}
                      />
                    )}
                    {task.relatedPartner && (
                      <RelatedItem
                        type="partner"
                        item={task.relatedPartner}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
        size="sm"
      >
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Delete Task?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to delete <strong>"{task.title}"</strong>? This action cannot be undone.
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
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Helper Components
const TimelineItem = ({ date, title, description, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case "create": return <Calendar className="w-4 h-4" />;
      case "assign": return <User className="w-4 h-4" />;
      case "complete": return <CheckSquare className="w-4 h-4" />;
      case "cancel": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {date ? new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) : 'Unknown date'}
        </p>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, icon: Icon, warning = false }) => (
  <div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
      <Icon className="w-4 h-4" />
      {label}
    </p>
    <p className={`text-sm font-medium ${warning ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
      {value}
    </p>
  </div>
);

const RelatedItem = ({ type, item, onClick }) => {
  const getConfig = () => {
    switch (type) {
      case "event":
        return { color: "blue", label: "Event" };
      case "client":
        return { color: "green", label: "Client" };
      case "partner":
        return { color: "purple", label: "Partner" };
      default:
        return { color: "gray", label: "Related" };
    }
  };

  const config = getConfig();

  return (
    <div
      className={`p-3 border border-${config.color}-200 dark:border-${config.color}-800 rounded-lg cursor-pointer hover:bg-${config.color}-50 dark:hover:bg-${config.color}-900/20 transition-colors`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-1">
        <Badge variant={config.color} size="sm">
          {config.label}
        </Badge>
      </div>
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {item.title || item.name}
      </p>
    </div>
  );
};

export default TaskDetail;