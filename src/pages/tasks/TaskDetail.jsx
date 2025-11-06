import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApiDetail, useApiMutation } from "../../hooks/useApi";
import { taskService } from "../../api/index";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  CheckSquare,
  XCircle,
  AlertCircle,
  FileText,
  Paperclip,
  MessageSquare,
} from "lucide-react";
import { toast } from "react-hot-toast";

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newComment, setNewComment] = useState("");

  const {
    item: task,
    loading,
    error,
    refetch,
  } = useApiDetail(taskService.getById, id);
  const deleteMutation = useApiMutation(taskService.delete);
  const updateMutation = useApiMutation(taskService.update);

  const handleDelete = async () => {
    try {
      await deleteMutation.mutate(id);
      toast.success("Task deleted successfully");
      navigate("/tasks");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleToggleSubtask = async (subtaskIndex) => {
    if (!task) return;

    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].completed =
      !updatedSubtasks[subtaskIndex].completed;
    if (updatedSubtasks[subtaskIndex].completed) {
      updatedSubtasks[subtaskIndex].completedAt = new Date();
      updatedSubtasks[subtaskIndex].completedBy = user._id;
    } else {
      updatedSubtasks[subtaskIndex].completedAt = null;
      updatedSubtasks[subtaskIndex].completedBy = null;
    }

    try {
      await updateMutation.mutate(id, { subtasks: updatedSubtasks });
      refetch();
    } catch (error) {
      toast.error("Failed to update subtask");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj = {
      text: newComment,
      author: user._id,
      createdAt: new Date(),
    };

    try {
      await updateMutation.mutate(id, {
        comments: [...(task.comments || []), newCommentObj],
      });
      setNewComment("");
      toast.success("Comment added");
      refetch();
    } catch (error) {
      toast.error("Failed to add comment");
    }
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

  const getStatusColor = (status) => {
    const colors = {
      pending: "yellow",
      todo: "blue",
      in_progress: "purple",
      completed: "green",
      cancelled: "gray",
    };
    return colors[status] || "gray";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <EmptyState
          icon={XCircle}
          title="Task Not Found"
          description="The task you're looking for doesn't exist or has been removed."
          action={{
            label: "Back to Tasks",
            onClick: () => navigate("/tasks"),
          }}
        />
      </div>
    );
  }

  const completedSubtasks =
    task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tasks")}
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Task ID: {task._id?.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={Edit}
            onClick={() => navigate(`/tasks/${id}/edit`)}
          >
            Edit Task
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

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge color={getStatusColor(task.status)} className="mt-2">
                {task.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Priority</p>
              <Badge color={getPriorityColor(task.priority)} className="mt-2">
                {task.priority}
              </Badge>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="text-sm font-medium text-gray-900 mt-2">
                {formatDate(task.dueDate)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(progress)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Description
              </h3>
              {task.description ? (
                <p className="text-gray-600 whitespace-pre-wrap">
                  {task.description}
                </p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          </Card>

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Subtasks
                  </h3>
                  <span className="text-sm text-gray-600">
                    {completedSubtasks} of {totalSubtasks} completed
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {task.subtasks.map((subtask, index) => (
                    <div
                      key={index}
                      className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(index)}
                        className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                      />
                      <div className="ml-3 flex-1">
                        <p
                          className={`text-sm ${subtask.completed ? "line-through text-gray-500" : "text-gray-900"}`}
                        >
                          {subtask.title}
                        </p>
                        {subtask.completed && subtask.completedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Completed on {formatDate(subtask.completedAt)}
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
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comments
              </h3>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <Button type="submit" variant="primary">
                    Post
                  </Button>
                </div>
              </form>

              {/* Comments List */}
              {task.comments && task.comments.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">
                            {comment.author?.name || "Unknown"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 text-sm py-4">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </Card>

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Attachments
                </h3>
                <div className="space-y-2">
                  {task.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <Paperclip className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {attachment.fileName}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Details
              </h3>
              <div className="space-y-4">
                {task.assignedTo && (
                  <div>
                    <p className="text-sm text-gray-600">Assigned To</p>
                    <div className="flex items-center mt-1">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {task.assignedTo.name}
                      </span>
                    </div>
                  </div>
                )}

                {task.category && (
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <Badge color="blue" className="mt-1">
                      {task.category.replace("_", " ")}
                    </Badge>
                  </div>
                )}

                {task.estimatedHours && (
                  <div>
                    <p className="text-sm text-gray-600">Estimated Hours</p>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {task.estimatedHours}h
                      </span>
                    </div>
                  </div>
                )}

                {task.actualHours && (
                  <div>
                    <p className="text-sm text-gray-600">Actual Hours</p>
                    <div className="flex items-center mt-1">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {task.actualHours}h
                      </span>
                    </div>
                  </div>
                )}

                {task.relatedEvent && (
                  <div>
                    <p className="text-sm text-gray-600">Related Event</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/events/${task.relatedEvent._id}`)
                      }
                      className="mt-1"
                    >
                      View Event
                    </Button>
                  </div>
                )}

                {task.relatedClient && (
                  <div>
                    <p className="text-sm text-gray-600">Related Client</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/clients/${task.relatedClient._id}`)
                      }
                      className="mt-1"
                    >
                      View Client
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(task.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(task.updatedAt)}
                  </p>
                </div>

                {task.completedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(task.completedAt)}
                    </p>
                  </div>
                )}

                {task.createdBy && (
                  <div>
                    <p className="text-sm text-gray-600">Created By</p>
                    <p className="text-sm text-gray-900 mt-1">
                      {task.createdBy.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{task.title}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteMutation.loading}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetail;
