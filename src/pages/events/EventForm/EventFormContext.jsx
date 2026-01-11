//src/pages/events/EventForm/EventFormContext.jsx
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useEventForm } from "../../../hooks/useEventForm";
import { useFormValidation } from "../../../hooks/useFormValidation";

const EventFormContext = createContext(null);

// =============================================================================
// 🧮 FINANCIAL CALCULATION ENGINE
// =============================================================================
const calculateEventFinancials = (formData) => {
  // 1. Calculate Event Duration (Hours)
  let eventHours = 1;
  if (formData.startDate) {
    const endDateStr = formData.endDate || formData.startDate;
    const start = new Date(
      `${formData.startDate}T${formData.startTime || "00:00"}`
    );
    const end = new Date(`${endDateStr}T${formData.endTime || "00:00"}`);
    const diffMs = end - start;
    if (isFinite(diffMs) && diffMs > 0) {
      eventHours = Math.max(1, Math.ceil(diffMs / 3600000));
    }
  }

  // 2. Base Price
  const basePrice = parseFloat(formData.pricing?.basePrice) || 0;

  // 3. Calculate Partners Cost
  const partnersList = formData.partners || [];
  const partnersDetails = partnersList.map((partner) => {
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
      displayHours:
        partner.priceType === "hourly"
          ? partner.hours || eventHours
          : undefined,
    };
  });

  const partnersTotal = partnersDetails.reduce(
    (sum, p) => sum + p.calculatedCost,
    0
  );

  // 4. Calculate Supplies (Cost vs Charge)
  const suppliesList = formData.supplies || [];

  // A. Cost to Venue (Internal)
  const suppliesTotalCost = suppliesList.reduce((sum, item) => {
    const qty = parseFloat(item.quantityRequested) || 0;
    const cost = parseFloat(item.costPerUnit) || 0;
    return sum + qty * cost;
  }, 0);

  // B. Charge to Client (External)
  const suppliesTotalCharge = suppliesList.reduce((sum, item) => {
    // Only add to total if explicitly chargeable
    if (item.pricingType === "chargeable") {
      const qty = parseFloat(item.quantityRequested) || 0;
      const charge = parseFloat(item.chargePerUnit) || 0;
      return sum + qty * charge;
    }
    // 'included' items are free for the client (0)
    return sum;
  }, 0);

  const suppliesMargin = suppliesTotalCharge - suppliesTotalCost;

  // 5. Calculate Subtotal
  //  FIX: Always add suppliesTotalCharge.
  // If items are "included", suppliesTotalCharge is 0.
  // If items are "chargeable", suppliesTotalCharge is X, which should be added.
  const subtotalBeforeDiscount =
    basePrice + partnersTotal + suppliesTotalCharge;

  // 6. Discount
  let discountAmount = 0;
  const discountVal = parseFloat(formData.pricing?.discount) || 0;

  if (formData.pricing?.discountType === "percentage") {
    discountAmount = subtotalBeforeDiscount * (discountVal / 100);
  } else {
    discountAmount = discountVal;
  }

  const subtotalAfterDiscount = Math.max(
    0,
    subtotalBeforeDiscount - discountAmount
  );

  // 7. Tax
  const taxRate = parseFloat(formData.pricing?.taxRate) || 0;
  const taxAmount = (subtotalAfterDiscount * taxRate) / 100;

  // 8. Grand Total
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
};

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export const EventFormProvider = ({
  children,
  eventId,
  isEditMode,
  initialDate,
  prefillClient,
  prefillPartner,
}) => {
  const formLogic = useEventForm(
    eventId,
    isEditMode,
    prefillClient,
    prefillPartner,
    initialDate
  );
  const { validateStep } = useFormValidation();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const validateCurrentStep = useCallback(() => {
    const errors = validateStep(
      currentStep,
      formLogic.formData,
      formLogic.selectedClient
    );
    formLogic.setErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, formLogic, validateStep]);

  const goToNextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }
    return false;
  }, [validateCurrentStep, totalSteps]);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToStep = useCallback(
    (step) => {
      if (step < currentStep || validateCurrentStep()) {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentStep, validateCurrentStep]
  );

  // --- Memoized Calculations ---
  const calculations = useMemo(() => {
    return calculateEventFinancials(formLogic.formData);
  }, [
    formLogic.formData.startDate,
    formLogic.formData.endDate,
    formLogic.formData.startTime,
    formLogic.formData.endTime,
    formLogic.formData.pricing,
    formLogic.formData.partners,
    formLogic.formData.supplies, // Re-calculates when supplies array changes
    formLogic.formData.supplySummary,
  ]);

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

  return (
    <EventFormContext.Provider value={value}>
      {children}
    </EventFormContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventFormContext);
  if (!context)
    throw new Error("useEventContext must be used within EventFormProvider");
  return context;
};
