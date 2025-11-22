import React, { createContext, useContext, useMemo } from "react";
import { useEventForm } from "../../../hooks/useEventForm"; 
import { useFormValidation } from "../../../hooks/useFormValidation";

const EventFormContext = createContext(null);

export const EventFormProvider = ({ 
  children, 
  eventId, 
  isEditMode, 
  initialDate, 
  prefillClient,
  prefillPartner 
}) => {
  const formLogic = useEventForm(eventId, isEditMode, null, initialDate);
  const { validateStep } = useFormValidation();

  const calculations = useMemo(() => {
    const { formData } = formLogic;
    
    // 1. Calculate Duration
    let eventHours = 1;
    if (formData.startDate) {
      const endDateStr = formData.endDate || formData.startDate;
      const start = new Date(`${formData.startDate}T${formData.startTime || "00:00"}`);
      const end = new Date(`${endDateStr}T${formData.endTime || "00:00"}`);
      const diffMs = end.getTime() - start.getTime();
      if (isFinite(diffMs) && diffMs > 0) {
        eventHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
      }
    }

    // 2. Base Costs
    const basePrice = parseFloat(formData.pricing?.basePrice) || 0;

    // 3. Partner Costs (Fixed vs Hourly Logic)
    const partnersDetails = (formData.partners || []).map((partner) => {
      let cost = 0;
      const rate = parseFloat(partner.rate) || 0;

      if (partner.priceType === "hourly") {
        // Hourly: Always recalculate based on duration
        const hours = parseFloat(partner.hours) || eventHours;
        cost = hours * rate;
      } else {
        // Fixed: Use the explicit cost if it exists (manual override), otherwise default to the base rate
        if (partner.cost !== undefined && partner.cost !== null && partner.cost !== "") {
           cost = parseFloat(partner.cost);
        } else {
           cost = rate;
        }
      }
      
      return { 
        ...partner, 
        calculatedCost: cost, 
        displayHours: partner.priceType === "hourly" ? (partner.hours || eventHours) : undefined 
      };
    });

    const partnersTotal = partnersDetails.reduce((sum, p) => sum + p.calculatedCost, 0);

    // 4. Discount
    let discountAmount = 0;
    const discountVal = parseFloat(formData.pricing?.discount) || 0;
    const subtotalBeforeDiscount = basePrice + partnersTotal;

    if (formData.pricing?.discountType === "percentage") {
      discountAmount = (subtotalBeforeDiscount) * (discountVal / 100);
    } else {
      discountAmount = discountVal;
    }

    const subtotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - discountAmount);

    // 5. Tax (Applied on the discounted amount)
    const taxRate = parseFloat(formData.pricing?.taxRate) || 0;
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;

    // 6. Final Total
    const totalPrice = subtotalAfterDiscount + taxAmount;

    return {
      eventHours,
      basePrice,
      partnersDetails,
      partnersTotal,
      subtotalBeforeDiscount,
      discountAmount,
      subtotalAfterDiscount,
      taxRate,
      taxAmount,
      totalPrice
    };
  }, [formLogic.formData]);

  const value = {
    ...formLogic, 
    validateStep,
    calculations, 
    meta: { isEditMode, eventId, prefillClient, prefillPartner }
  };

  return (
    <EventFormContext.Provider value={value}>
      {children}
    </EventFormContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventFormContext);
  if (!context) {
    throw new Error("useEventContext must be used within an EventFormProvider");
  }
  return context;
};