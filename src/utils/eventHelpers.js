// src/utils/eventHelpers.js

/**
 * Calculate duration between two dates/times
 */
export const calculateEventDuration = (startDate, endDate, startTime, endTime) => {
  try {
    if (!startDate || !endDate) return { hours: 1, days: 1 };
    
    const start = new Date(`${startDate}T${startTime || "00:00"}:00`);
    const end = new Date(`${endDate}T${endTime || "00:00"}:00`);
    
    const diffMs = end.getTime() - start.getTime();
    if (!isFinite(diffMs) || diffMs <= 0) return { hours: 1, days: 1 };
    
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return {
      hours: Math.max(1, hours),
      days: Math.max(1, days),
    };
  } catch (error) {
    return { hours: 1, days: 1 };
  }
};

/**
 * Format date for display
 */
export const formatEventDate = (startDate, endDate, sameDayEvent) => {
  if (!startDate) return "N/A";
  
  const start = new Date(startDate);
  const startStr = start.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  
  if (sameDayEvent || startDate === endDate) {
    return startStr;
  }
  
  const end = new Date(endDate);
  const endStr = end.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  
  return `${startStr} - ${endStr}`;
};

/**
 * Calculate partner cost for event duration
 */
export const calculatePartnerCost = (partner, eventHours) => {
  const rate = partner.hourlyRate || partner.rate || 0;
  return Math.max(0, rate * eventHours);
};

/**
 * Calculate total price with discount
 */
export const calculateTotalPrice = (basePrice, partnersCost, discount, discountType) => {
  const subtotal = basePrice + partnersCost;
  
  let discountAmount = 0;
  if (discount && parseFloat(discount) > 0) {
    const discountValue = parseFloat(discount);
    if (discountType === "percentage") {
      discountAmount = (subtotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }
  }
  
  return Math.max(0, subtotal - discountAmount);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

/**
 * Validate phone format (Tunisia - 8 digits)
 */
export const isValidPhone = (phone) => {
  return /^[0-9]{8}$/.test(phone);
};

/**
 * Check if event dates conflict
 */
export const checkDateConflict = (event1, event2) => {
  try {
    const e1Start = new Date(`${event1.startDate}T${event1.startTime || "00:00"}`);
    const e1End = new Date(`${event1.endDate}T${event1.endTime || "23:59"}`);
    const e2Start = new Date(`${event2.startDate}T${event2.startTime || "00:00"}`);
    const e2End = new Date(`${event2.endDate}T${event2.endTime || "23:59"}`);
    
    return e1Start < e2End && e1End > e2Start;
  } catch (error) {
    return false;
  }
};

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = (venuePrefix, type, count) => {
  const typePrefix = type === "client" ? "C" : "P";
  const year = new Date().getFullYear().toString().slice(-2);
  const number = (count + 1).toString().padStart(4, "0");
  
  return `${venuePrefix}-${typePrefix}-${year}-${number}`;
};