import { useCallback } from "react";

export const useFormValidation = () => {
  const validateStep = useCallback((step, formData, selectedClient) => {
    const newErrors = {};

    // Step 1: Details
    if (step === 1) {
      if (!formData.title?.trim()) newErrors.title = "Title is required";
      if (!formData.type) newErrors.type = "Event type is required";
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.sameDayEvent && !formData.endDate)
        newErrors.endDate = "End date is required";

      // Logical Date Check
      if (
        formData.startDate &&
        formData.endDate &&
        new Date(formData.startDate) > new Date(formData.endDate)
      ) {
        newErrors.endDate = "End date cannot be before start date";
      }
    }

    // Step 2: Client
    if (step === 2) {
      if (!formData.clientId) newErrors.clientId = "Please select a client";
    }

    // Step 3: Venue & Pricing
    if (step === 3) {
      if (!formData.venueSpaceId)
        newErrors.venueSpaceId = "Please select a venue space";

      const basePrice = parseFloat(formData.pricing?.basePrice);
      if (isNaN(basePrice) || basePrice < 0)
        newErrors["pricing.basePrice"] = "Invalid base price";
    }

    // Step 4: Payment (Optional but strictly validated if entered)
    if (step === 4) {
      const payment = formData.payment || {};
      if (payment.amount && parseFloat(payment.amount) > 0) {
        if (!payment.paymentDate)
          newErrors["payment.paymentDate"] = "Date is required";
        if (!payment.paymentMethod)
          newErrors["payment.paymentMethod"] = "Method is required";
      }
    }

    return newErrors;
  }, []);

  return { validateStep };
};
