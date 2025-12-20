import { useState, useEffect } from "react";
import { reminderService } from "../api";

export const useReminderDetail = (id) => {
  const [reminderData, setReminderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReminderData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch reminder details
      const reminderResponse = await reminderService.getById(id);

      let reminderData = null;
      if (reminderResponse?.data?.reminder) {
        reminderData = reminderResponse.data.reminder;
      } else if (reminderResponse?.reminder) {
        reminderData = reminderResponse.reminder;
      } else if (reminderResponse?.data?.data) {
        reminderData = reminderResponse.data.data;
      } else if (reminderResponse?.data) {
        reminderData = reminderResponse.data;
      } else if (reminderResponse) {
        reminderData = reminderResponse;
      }

      // Handle MongoDB $oid format
      if (reminderData?._id?.$oid) {
        reminderData._id = reminderData._id.$oid;
      }

      // Handle related items with $oid format
      if (reminderData?.relatedEvent?._id?.$oid) {
        reminderData.relatedEvent._id = reminderData.relatedEvent._id.$oid;
      }
      if (reminderData?.relatedClient?._id?.$oid) {
        reminderData.relatedClient._id = reminderData.relatedClient._id.$oid;
      }
      if (reminderData?.relatedTask?._id?.$oid) {
        reminderData.relatedTask._id = reminderData.relatedTask._id.$oid;
      }
      if (reminderData?.relatedPayment?._id?.$oid) {
        reminderData.relatedPayment._id = reminderData.relatedPayment._id.$oid;
      }

      // Handle assigned users with $oid format
      if (reminderData?.assignedTo && Array.isArray(reminderData.assignedTo)) {
        reminderData.assignedTo = reminderData.assignedTo.map(user => ({
          ...user,
          _id: user._id?.$oid || user._id
        }));
      }

      // Handle createdBy with $oid format
      if (reminderData?.createdBy?._id?.$oid) {
        reminderData.createdBy._id = reminderData.createdBy._id.$oid;
      }

      // Handle completedBy with $oid format
      if (reminderData?.completedBy?._id?.$oid) {
        reminderData.completedBy._id = reminderData.completedBy._id.$oid;
      }

      if (!reminderData || !reminderData._id) {
        throw new Error("Reminder not found");
      }

      setReminderData(reminderData);

    } catch (err) {
      console.error("Error fetching reminder:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load reminder details";
      setError(new Error(errorMessage));
      setReminderData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReminderData();
    }
  }, [id]);

  return {
    reminderData,
    loading,
    error,
    refreshData: fetchReminderData,
  };
};