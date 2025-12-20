
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
  prefillPartner,
}) => {
  const formLogic = useEventForm(eventId, isEditMode, prefillClient, prefillPartner, initialDate);
  const { validateStep } = useFormValidation();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const validateCurrentStep = useCallback(() => {
    const errors = validateStep(currentStep, formLogic.formData, formLogic.selectedClient);
    formLogic.setErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, formLogic, validateStep]);

  const goToNextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }
    return false;
  }, [validateCurrentStep, totalSteps]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToStep = useCallback((step) => {
    if (step < currentStep || validateCurrentStep()) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, validateCurrentStep]);

  // ============================================
  // CALCULATIONS
  // ============================================
  const calculations = useMemo(() => {
    const { formData } = formLogic;

    // Event duration
    let eventHours = 1;
    if (formData.startDate) {
      const endDateStr = formData.endDate || formData.startDate;
      const start = new Date(`${formData.startDate}T${formData.startTime || "00:00"}`);
      const end = new Date(`${endDateStr}T${formData.endTime || "00:00"}`);
      const diffMs = end - start;
      if (isFinite(diffMs) && diffMs > 0) {
        eventHours = Math.max(1, Math.ceil(diffMs / 3600000));
      }
    }

    const basePrice = parseFloat(formData.pricing?.basePrice) || 0;

    // Partner costs
    const partnersDetails = (formData.partners || []).map(partner => {
      let cost = 0;
      const rate = parseFloat(partner.rate) || 0;
      
      if (partner.priceType === "hourly") {
        const hours = parseFloat(partner.hours) || eventHours;
        cost = hours * rate;
      } else {
        cost = partner.cost !== undefined ? parseFloat(partner.cost) : rate;
      }
      
      return {
        ...partner,
        calculatedCost: cost,
        displayHours: partner.priceType === "hourly" ? (partner.hours || eventHours) : undefined,
      };
    });

    const partnersTotal = partnersDetails.reduce((sum, p) => sum + p.calculatedCost, 0);

    // Supply costs
    const supplies = formData.supplies || [];
    const suppliesTotalCost = supplies.reduce((sum, item) => {
      const qty = parseFloat(item.quantityRequested) || 0;
      const cost = parseFloat(item.costPerUnit) || 0;
      return sum + (qty * cost);
    }, 0);

    const suppliesTotalCharge = supplies.reduce((sum, item) => {
      if (item.pricingType === "chargeable") {
        const qty = parseFloat(item.quantityRequested) || 0;
        const charge = parseFloat(item.chargePerUnit) || 0;
        return sum + (qty * charge);
      }
      return sum;
    }, 0);

    const suppliesMargin = suppliesTotalCharge - suppliesTotalCost;

    // Subtotal
    const includeSuppliesInTotal = formData.supplySummary?.includeInBasePrice !== false;
    const subtotalBeforeDiscount = basePrice + partnersTotal + (includeSuppliesInTotal ? 0 : suppliesTotalCharge);

    // Discount
    let discountAmount = 0;
    const discountVal = parseFloat(formData.pricing?.discount) || 0;
    
    if (formData.pricing?.discountType === "percentage") {
      discountAmount = subtotalBeforeDiscount * (discountVal / 100);
    } else {
      discountAmount = discountVal;
    }

    const subtotalAfterDiscount = Math.max(0, subtotalBeforeDiscount - discountAmount);

    // Tax
    const taxRate = parseFloat(formData.pricing?.taxRate) || 0;
    const taxAmount = (subtotalAfterDiscount * taxRate) / 100;

    // Total
    const totalPrice = subtotalAfterDiscount + taxAmount;

    return {
      eventHours,
      basePrice,
      partnersDetails,
      partnersTotal,
      suppliesTotalCost,
      suppliesTotalCharge,
      suppliesMargin,
      subtotalBeforeDiscount,
      discountAmount,
      subtotalAfterDiscount,
      taxRate,
      taxAmount,
      totalPrice,
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
    meta: {
      isEditMode,
      eventId,
      prefillClient,
      prefillPartner,
    },
  };

  return <EventFormContext.Provider value={value}>{children}</EventFormContext.Provider>;
};

export const useEventContext = () => {
  const context = useContext(EventFormContext);
  if (!context) throw new Error("useEventContext must be used within EventFormProvider");
  return context;
};