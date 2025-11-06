import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
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
} from "lucide-react";
import { taskService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await taskService.getById(id);
      
      let fetchedTask = null;
      if (response?.task) {
        fetchedTask = response.task;
      } else if (response?.data?.task) {
        fetchedTask = response.data.task;
      } else if (response?.data) {
        fetchedTask = response.data;
      } else {
        fetchedTask = response;
      }
      
      setTask(fetchedTask);
    } catch (error) {
      console.error("Error fetching task:", error);
      toast.error("Failed to load task");
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await taskService.delete(id);
      toast.success("Task deleted successfully");
      navigate("/tasks");
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      await taskService.updateStatus(id, newStatus);
      toast.success("Status updated successfully");
      fetchTask();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      await taskService.complete(id);
      toast.success("Task marked as completed");
      fetchTask();
    } catch (error) {
      toast.error("Failed to complete task");
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async () => {
    try {
      setActionLoading(true);
      await taskService.archive(id);
      toast.success("Task archived successfully");
      navigate("/tasks");
    } catch (error) {
      toast.error("Failed to archive task");
    } finally {
      setActionLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = { low: "gray", medium: "blue", high: "orange", urgent: "red" };
    return colors[priority] || "gray";
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      todo: "blue",
      in_progress: "purple",
      completed: "green",
      cancelled: "gray",
      blocked: "red",
    };
    return colors[status] || "gray";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatShortDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (date, status) => {
    return new Date(date) < new Date() && !["completed", "cancelled"].includes(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="Task Not Found"
          description="This task doesn't exist or has been deleted"
          action={{ label: "Back to Tasks", onClick: () => navigate("/tasks") }}
        />
      </div>
    );
  }

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress = task.progress || (totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate("/tasks")}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{task.title}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Created {formatShortDate(task.createdAt)} • Updated {formatShortDate(task.updatedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {task.status !== "completed" && (
            <Button
              variant="success"
              icon={CheckSquare}
              onClick={handleComplete}
              loading={actionLoading}
            >
              Complete
            </Button>
          )}
          <Button
            variant="outline"
            icon={Archive}
            onClick={handleArchive}
            loading={actionLoading}
          >
            Archive
          </Button>
          <Button
            variant="outline"
            icon={Edit}
            onClick={() => navigate(`/tasks/${id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Status & Priority Badges */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={getStatusColor(task.status)} size="lg">
          {task.status.replace("_", " ")}
        </Badge>
        <Badge variant={getPriorityColor(task.priority)} size="lg">
          <Flag className="w-4 h-4 mr-1" />
          {task.priority} priority
        </Badge>
        <Badge variant="purple" size="lg">
          <TrendingUp className="w-4 h-4 mr-1" />
          {Math.round(progress)}% complete
        </Badge>
        {isOverdue(task.dueDate, task.status) && (
          <Badge variant="red" size="lg">
            <AlertCircle className="w-4 h-4 mr-1" />
            Overdue
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Due Date</p>
              <p className={`text-sm font-medium mt-2 ${isOverdue(task.dueDate, task.status) ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                {formatShortDate(task.dueDate)}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {Math.round(progress)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
        </Card>

        {task.estimatedHours && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {task.estimatedHours}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </Card>
        )}

        {task.actualHours && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Actual</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {task.actualHours}h
                </p>
              </div>
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
          </Card>
        )}

        {task.subtasks && task.subtasks.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subtasks</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {completedSubtasks}/{totalSubtasks}
                </p>
              </div>
              <CheckSquare className="w-8 h-8 text-gray-400" />
            </div>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h3>
              {task.description ? (
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">No description provided</p>
              )}
            </div>
          </Card>

          {/* Blocked Status */}
          {task.status === "blocked" && task.blockedReason && (
            <Card className="border-red-200 dark:border-red-800">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                      Task Blocked
                    </h3>
                    <p className="text-red-700 dark:text-red-300">{task.blockedReason}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5" />
                    Subtasks
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {completedSubtasks} of {totalSubtasks} completed
                  </span>
                </div>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {task.subtasks.map((subtask, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        readOnly
                        className="w-5 h-5 text-purple-600 rounded mt-0.5"
                      />
                      <div className="ml-3 flex-1">
                        <p className={`font-medium ${subtask.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>
                          {subtask.title}
                        </p>
                        {subtask.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {subtask.description}
                          </p>
                        )}
                        {subtask.completedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Completed {formatShortDate(subtask.completedAt)}
                            {subtask.completedBy && ` by ${subtask.completedBy.name}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Comments */}
          {task.comments && task.comments.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments ({task.comments.length})
                </h3>
                <div className="space-y-4">
                  {task.comments.map((comment, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comment.author?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatShortDate(comment.createdAt)}
                          </span>
                          {comment.isEdited && (
                            <Badge variant="gray" size="sm">edited</Badge>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Attachments ({task.attachments.length})
                </h3>
                <div className="space-y-2">
                  {task.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{attachment.fileName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {attachment.fileSize && `${(attachment.fileSize / 1024).toFixed(2)} KB • `}
                            Uploaded {formatShortDate(attachment.uploadDate)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Details
              </h3>
              <div className="space-y-4">
                {task.assignedTo && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assigned To</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {task.assignedTo.name}
                      </span>
                    </div>
                  </div>
                )}

                {task.assignedBy && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assigned By</p>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {task.assignedBy.name}
                      </span>
                    </div>
                  </div>
                )}

                {task.watchers && task.watchers.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Watchers</p>
                    <div className="flex flex-wrap gap-2">
                      {task.watchers.map((watcher, index) => (
                        <Badge key={index} variant="blue" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          {watcher.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {task.category && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</p>
                    <Badge variant="purple">
                      {task.category.replace("_", " ")}
                    </Badge>
                  </div>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <Badge key={index} variant="gray" size="sm">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {task.startDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Start Date</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatShortDate(task.startDate)}
                    </p>
                  </div>
                )}

                {task.reminderDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Reminder Date</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatShortDate(task.reminderDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Related Entities */}
          {(task.relatedEvent || task.relatedClient || task.relatedPartner) && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Related
                </h3>
                <div className="space-y-3">
                  {task.relatedEvent && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Event</p>
                      <p 
                        className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
                        onClick={() => navigate(`/events/${task.relatedEvent._id}`)}
                      >
                        {task.relatedEvent.title}
                      </p>
                    </div>
                  )}

                  {task.relatedClient && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Client</p>
                      <p 
                        className="text-sm text-green-600 dark:text-green-400 cursor-pointer hover:underline"
                        onClick={() => navigate(`/clients/${task.relatedClient._id}`)}
                      >
                        {task.relatedClient.name}
                      </p>
                    </div>
                  )}

                  {task.relatedPartner && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Partner</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        {task.relatedPartner.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Timeline
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {formatDate(task.createdAt)}
                  </p>
                  {task.createdBy && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      by {task.createdBy.name}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {formatDate(task.updatedAt)}
                  </p>
                </div>

                {task.assignedAt && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Assigned</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {formatDate(task.assignedAt)}
                    </p>
                  </div>
                )}

                {task.completedAt && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {formatDate(task.completedAt)}
                    </p>
                    {task.completedBy && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {task.completedBy.name}
                      </p>
                    )}
                  </div>
                )}

                {task.cancelledAt && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cancelled</p>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {formatDate(task.cancelledAt)}
                    </p>
                    {task.cancelledBy && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {task.cancelledBy.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {task.status !== "completed" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    icon={CheckSquare}
                    onClick={handleComplete}
                    loading={actionLoading}
                  >
                    Mark as Complete
                  </Button>
                )}
                {task.status !== "in_progress" && task.status !== "completed" && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleStatusChange("in_progress")}
                    loading={actionLoading}
                  >
                    Start Working
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={Archive}
                  onClick={handleArchive}
                  loading={actionLoading}
                >
                  Archive Task
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete <strong>{task.title}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetail;