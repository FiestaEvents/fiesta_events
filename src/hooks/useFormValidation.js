// src/components/events/EventForm/hooks/useFormValidation.js
import { useCallback } from "react";

export const useFormValidation = () => {
  const validateStep = useCallback((step, formData, selectedClient) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Event title is required";
      }
      if (!formData.type) {
        newErrors.type = "Event type is required";
      }
      if (!formData.startDate) {
        newErrors.startDate = "Start date is required";
      }
      if (!formData.sameDayEvent && !formData.endDate) {
        newErrors.endDate = "End date is required";
      }
      if (formData.startTime && formData.endTime && formData.sameDayEvent) {
        if (formData.startTime >= formData.endTime) {
          newErrors.endTime = "End time must be after start time";
        }
      }
    }

    if (step === 2) {
      if (!formData.clientId && !selectedClient) {
        newErrors.clientId = "Please select a client";
      }
    }

    if (step === 3) {
      if (!formData.venueSpaceId) {
        newErrors.venueSpaceId = "Please select a venue space";
      }

      const basePriceValue = parseFloat(formData.pricing.basePrice);
      if (isNaN(basePriceValue) || basePriceValue < 0) {
        newErrors["pricing.basePrice"] = "Valid base price is required";
      }
    }

    if (step === 4) {
      if (formData.payment?.amount) {
        const paymentAmount = parseFloat(formData.payment.amount);
        // We'd need totalPrice passed in to validate this properly
        if (paymentAmount < 0) {
          newErrors["payment.amount"] = "Payment amount cannot be negative";
        }
      }
    }

    return newErrors;
  }, []);

  return { validateStep };
};