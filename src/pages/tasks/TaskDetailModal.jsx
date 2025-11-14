import React, { useState } from "react";
import {
  X,
  Trash2,
  Edit,
  Archive,
  RotateCcw,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Tag,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Users,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import { taskService } from "../../api/index";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

const TaskDetailModal = ({ isOpen, onClose, task, onEdit, refreshData, showArchived = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  if (!isOpen || !task) return null;

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
      blocked: "red",
    };
    return colors[status] || "gray";
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const weekday = d.toLocaleString("en-GB", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleString("en-GB", { month: "long" });
    const year = d.getFullYear();
    return `${weekday}, ${day} ${month} ${year}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isOverdue = (date, status) => {
    return (
      new Date(date) < new Date() &&
      !["completed", "cancelled"].includes(status)
    );
  };

  // Task actions
  const handleArchive = async () => {
    if (!task._id) return;
    
    try {
      setIsProcessing(true);
      await taskService.archive(task._id);
      showSuccess("Task archived successfully");
      onClose();
      refreshData();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to archive task");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    if (!task._id) return;
    
    try {
      setIsProcessing(true);
      await taskService.unarchive(task._id);
      showSuccess("Task restored successfully");
      onClose();
      refreshData();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to restore task");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!task._id) return;
    
    try {
      setIsProcessing(true);
      await taskService.delete(task._id);
      showSuccess("Task deleted permanently");
      onClose();
      refreshData();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete task");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewFullDetails = () => {
    onClose();
    navigate(`/tasks/${task._id}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="border-0">
            <div className="px-6 pt-5 pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3
                    className="text-2xl font-bold leading-6 text-gray-900 dark:text-white"
                    id="modal-title"
                  >
                    {task.title || "Untitled Task"}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge color={getStatusColor(task.status)}>
                      {task.status ? task.status.replace("_", " ") : "Unknown"}
                    </Badge>
                    <Badge color={getPriorityColor(task.priority)}>
                      {task.priority || "Medium"}
                    </Badge>
                    {task.category && (
                      <Badge color="blue">
                        {task.category}
                      </Badge>
                    )}
                    {isOverdue(task.dueDate, task.status) && (
                      <Badge color="red">
                        Overdue
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded bg-white hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors ml-4 flex-shrink-0"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="mt-6 space-y-6">
                {/* Task Description */}
                {task.description && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-500" />
                      Description
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      {task.description}
                    </p>
                  </div>
                )}

                {/* Task Details Grid */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Task Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div className="space-y-3">
                      {/* Assigned To */}
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Assigned To</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {task.assignedTo?.name || "Unassigned"}
                          </div>
                        </div>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Due Date</div>
                          <div className={`font-medium ${isOverdue(task.dueDate, task.status) ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-white"}`}>
                            {task.dueDate ? formatDateLong(task.dueDate) : "Not set"}
                          </div>
                        </div>
                      </div>

                      {/* Start Date */}
                      {task.startDate && (
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">Start Date</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {formatDateLong(task.startDate)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                      {/* Progress */}
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{task.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full transition-all"
                              style={{ width: `${task.progress || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Estimated Hours */}
                      {(task.estimatedHours || task.actualHours) && (
                        <div className="flex items-center gap-3 text-sm">
                          <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">Time</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {task.actualHours ? `${task.actualHours}h` : ""}
                              {task.estimatedHours && (
                                <span className="text-gray-500">
                                  {task.actualHours ? " / " : ""}
                                  {task.estimatedHours}h estimated
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Created By */}
                      {task.createdBy && (
                        <div className="flex items-center gap-3 text-sm">
                          <Users className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <div>
                            <div className="text-gray-500 dark:text-gray-400">Created By</div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {task.createdBy.name || "Unknown"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Related Entities */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Related To
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {task.relatedEvent && (
                      <Badge color="purple" className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Event
                      </Badge>
                    )}
                    {task.relatedClient && (
                      <Badge color="blue" className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Client
                      </Badge>
                    )}
                    {task.relatedPartner && (
                      <Badge color="green" className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Partner
                      </Badge>
                    )}
                    {!task.relatedEvent && !task.relatedClient && !task.relatedPartner && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">No related entities</span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-orange-500" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, index) => (
                        <Badge key={index} color="gray" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blocked Reason */}
                {task.status === "blocked" && task.blockedReason && (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Blocked Reason
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                      {task.blockedReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between gap-3 rounded-b-xl">
              <div className="flex gap-2">
                {!showArchived ? (
                  <>
                    <Button
                      variant="danger"
                      icon={Archive}
                      onClick={handleArchive}
                      disabled={isProcessing}
                      size="sm"
                    >
                      {isProcessing ? "Archiving..." : "Archive"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      icon={RotateCcw}
                      onClick={handleRestore}
                      disabled={isProcessing}
                      size="sm"
                    >
                      {isProcessing ? "Restoring..." : "Restore"}
                    </Button>
                    <Button
                      variant="danger"
                      icon={Trash2}
                      onClick={handleDelete}
                      disabled={isProcessing}
                      size="sm"
                    >
                      {isProcessing ? "Deleting..." : "Delete"}
                    </Button>
                  </>
                )}
              </div>
              <div className="flex gap-3">
                {!showArchived && (
                  <Button
                    variant="outline"
                    icon={Edit}
                    onClick={() => onEdit(task)}
                    size="sm"
                  >
                    Edit
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleViewFullDetails}
                  className="gap-2 flex items-center justify-center bg-orange-500 hover:bg-orange-600 border-orange-500 hover:border-orange-600"
                  title="View Full Details"
                >
                  More Details
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;