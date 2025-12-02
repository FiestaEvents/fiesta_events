import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
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
  // 1. Core Form Logic
  const formLogic = useEventForm(eventId, isEditMode, null, initialDate);
  const { validateStep } = useFormValidation();
  
  // 2. Stepper State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // 3. Navigation & Validation Logic
  const validateCurrentStep = useCallback(() => {
    const errors = validateStep(currentStep, formLogic.formData, formLogic.selectedClient);
    formLogic.setErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, formLogic.formData, formLogic.selectedClient, validateStep, formLogic.setErrors]);

  const goToNextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    }
    return false;
  }, [validateCurrentStep, totalSteps]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step) => {
    // Only allow jumping forward if strictly strictly validating, 
    // but for UX, we usually allow jumping back.
    if (step < currentStep) {
      setCurrentStep(step);
    } else {
      // If jumping forward, validate current first
      if (validateCurrentStep()) {
        setCurrentStep(step);
      }
    }
  }, [currentStep, validateCurrentStep]);

  // 4. Calculations
  const calculations = useMemo(() => {
    const { formData } = formLogic;
    
    // Duration
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

    // Base Costs
    const basePrice = parseFloat(formData.pricing?.basePrice) || 0;

    // Partner Costs
    const partnersDetails = (formData.partners || []).map((partner) => {
      let cost = 0;
      const rate = parseFloat(partner.rate) || 0;
      if (partner.priceType === "hourly") {
        const hours = parseFloat(partner.hours) || eventHours;
        cost = hours * rate;
      } else {
        cost = (partner.cost !== undefined && partner.cost !== null) ? parseFloat(partner.cost) : rate;
      }
      return { 
        ...partner, 
        calculatedCost: cost, 
        displayHours: partner.priceType === "hourly" ? (partner.hours || eventHours) : undefined 
      };
    });

    const partnersTotal = partnersDetails.reduce((sum, p) => sum + p.calculatedCost, 0);

    // Discount
    let discountAmount = 0;
    const discountVal = parseFloat(formData.pricing?.discount) || 0;
    const subtotalBeforeDiscount = basePrice + partnersTotal;

    if (formData.pricing?.discountType === "percentage") {
      discountAmount = (subtotalBeforeDiscount) * (discountVal / 100);
    } else {
      discountAmount = discountVal;
    }

    const subtotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - discountAmount);

    // Tax
    const taxRate = parseFloat(formData.pricing?.taxRate) || 0;
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;

    // Final Total
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
    currentStep,
    totalSteps,
    goToNextStep,
    goToPrevStep,
    goToStep,
    validateCurrentStep,
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
  if (!context) throw new Error("useEventContext must be used within an EventFormProvider");
  return context;
};