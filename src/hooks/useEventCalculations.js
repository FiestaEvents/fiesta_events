import { useWatch } from "react-hook-form";
import { useMemo } from "react";

export const useEventCalculations = (control) => {
  // 1. WATCH relevant fields
  const [
    startDate,
    startTime,
    endDate,
    endTime,
    sameDayEvent,
    partners,
    supplies,
    pricing,
  ] = useWatch({
    control,
    name: [
      "startDate",
      "startTime",
      "endDate",
      "endTime",
      "sameDayEvent",
      "partners",
      "supplies",
      "pricing",
    ],
  });

  return useMemo(() => {
    // --- A. DURATION ---
    let hours = 1;
    try {
      if (startDate && startTime && endTime) {
        const startD = new Date(`${startDate}T${startTime}`);
        // Logic for End Date based on sameDay flag
        const endDString = sameDayEvent ? startDate : endDate || startDate;
        const endD = new Date(`${endDString}T${endTime}`);
        const diffMs = endD - startD;
        if (diffMs > 0) hours = Math.ceil(diffMs / 3600000);
      }
    } catch (e) {
      console.error("Date calc error", e);
    }

    // --- B. PARTNERS ---
    // Cost added to the Client's Bill
    const partnersCost = (partners || []).reduce((acc, p) => {
      const duration = p.hours && Number(p.hours) > 0 ? Number(p.hours) : hours;
      const rate = Number(p.rate) || 0;
      const cost = p.priceType === "hourly" ? rate * duration : rate;
      return acc + cost;
    }, 0);

    // --- C. SUPPLIES ---
    // 1. Internal Cost (What venue pays)
    const suppliesCostToVenue = (supplies || []).reduce((acc, s) => {
      return (
        acc + (Number(s.costPerUnit) || 0) * (Number(s.quantityRequested) || 0)
      );
    }, 0);

    // 2. Client Charge (What client pays)
    const suppliesChargeToClient = (supplies || []).reduce((acc, s) => {
      if (s.pricingType !== "chargeable") return acc;
      return (
        acc +
        (Number(s.chargePerUnit) || 0) * (Number(s.quantityRequested) || 0)
      );
    }, 0);

    const suppliesMargin = suppliesChargeToClient - suppliesCostToVenue;

    // --- D. TOTALS ---
    const basePrice = Number(pricing?.basePrice) || 0;

    // Subtotal before tax/discount
    const subtotal = basePrice + partnersCost + suppliesChargeToClient;

    // Discount
    const discountType = pricing?.discountType || "fixed";
    const discountVal = Number(pricing?.discount) || 0;
    let discountAmount = 0;

    if (discountType === "percentage") {
      discountAmount = subtotal * (discountVal / 100);
    } else {
      discountAmount = discountVal;
    }

    const subAfterDiscount = Math.max(0, subtotal - discountAmount);

    // Tax
    const taxRate = Number(pricing?.taxRate) || 0;
    const taxAmount = subAfterDiscount * (taxRate / 100);

    const total = subAfterDiscount + taxAmount;

    return {
      // Core values
      durationHours: hours,
      basePrice,
      partnersCost,

      // Supply details
      suppliesCostToVenue,
      suppliesChargeToClient,
      suppliesMargin,

      // Totals
      subtotal,
      discountAmount,
      taxAmount,
      total,

      // --- ALIASES ---
      // These ensure backward compatibility with both EventFormWizard and Step5Review
      base: basePrice, // Wizard might use 'base'
      suppliesCost: suppliesChargeToClient, // Wizard uses 'suppliesCost'
      grandTotal: total,
    };
  }, [
    startDate,
    startTime,
    endDate,
    endTime,
    sameDayEvent,
    partners,
    supplies,
    pricing,
  ]);
};
