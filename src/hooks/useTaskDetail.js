import { useState, useEffect } from "react";
import { taskService } from "../api";

export const useTaskDetail = (id) => {
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTaskData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch task details
      const taskResponse = await taskService.getById(id);

      let taskData = null;
      if (taskResponse?.data?.task) {
        taskData = taskResponse.data.task;
      } else if (taskResponse?.task) {
        taskData = taskResponse.task;
      } else if (taskResponse?.data?.data) {
        taskData = taskResponse.data.data;
      } else if (taskResponse?.data) {
        taskData = taskResponse.data;
      } else if (taskResponse) {
        taskData = taskResponse;
      }

      // Handle MongoDB $oid format
      if (taskData?._id?.$oid) {
        taskData._id = taskData._id.$oid;
      }

      // Handle assignedTo with $oid format
      if (taskData?.assignedTo?._id?.$oid) {
        taskData.assignedTo._id = taskData.assignedTo._id.$oid;
      }

      // Handle createdBy with $oid format
      if (taskData?.createdBy?._id?.$oid) {
        taskData.createdBy._id = taskData.createdBy._id.$oid;
      }

      // Handle completedBy with $oid format
      if (taskData?.completedBy?._id?.$oid) {
        taskData.completedBy._id = taskData.completedBy._id.$oid;
      }

      // Handle subtasks with $oid format
      if (taskData?.subtasks && Array.isArray(taskData.subtasks)) {
        taskData.subtasks = taskData.subtasks.map(subtask => ({
          ...subtask,
          _id: subtask._id?.$oid || subtask._id
        }));
      }

      // Handle comments with $oid format
      if (taskData?.comments && Array.isArray(taskData.comments)) {
        taskData.comments = taskData.comments.map(comment => ({
          ...comment,
          _id: comment._id?.$oid || comment._id,
          author: comment.author ? {
            ...comment.author,
            _id: comment.author._id?.$oid || comment.author._id
          } : comment.author
        }));
      }

      // Handle attachments with $oid format
      if (taskData?.attachments && Array.isArray(taskData.attachments)) {
        taskData.attachments = taskData.attachments.map(attachment => ({
          ...attachment,
          _id: attachment._id?.$oid || attachment._id
        }));
      }

      if (!taskData || !taskData._id) {
        throw new Error("Task not found");
      }

      setTaskData(taskData);

    } catch (err) {
      console.error("Error fetching task:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load task details";
      setError(new Error(errorMessage));
      setTaskData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTaskData();
    }
  }, [id]);

  return {
    taskData,
    loading,
    error,
    refreshData: fetchTaskData,
  };
};