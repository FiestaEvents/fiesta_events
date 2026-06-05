// hooks/useEventDetail.js
import { useState, useEffect, useCallback } from "react";
import { eventService, paymentService } from "../api/index";

export const useEventDetail = (eventId) => {
  const [eventData, setEventData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEventData = useCallback(async () => {
    if (!eventId) {
      setError(new Error("No event ID provided"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch event details
      const eventResponse = await eventService.getById(eventId);
      const event = eventResponse.event || eventResponse.data || eventResponse;

      if (!event) {
        throw new Error("Event not found");
      }

      setEventData(event);

      // Fetch payments for this event
      try {
        const paymentsResponse = await paymentService.getAll({ 
          event: eventId,
          limit: 100 
        });
        const paymentsList = paymentsResponse.payments || paymentsResponse.data || [];
        setPayments(paymentsList);
      } catch (paymentError) {
        console.error("Error fetching payments:", paymentError);
        setPayments([]);
      }

    } catch (err) {
      console.error("Error fetching event details:", err);
      setError(err);
      setEventData(null);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const refreshData = useCallback(() => {
    return fetchEventData();
  }, [fetchEventData]);

  return {
    eventData,
    payments,
    loading,
    error,
    refreshData,
  };
};