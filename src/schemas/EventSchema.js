import { z } from "zod";

// --- HELPERS ---
const requiredString = z.string().min(1, { message: "Required" });

// Helper to safely handle dates that might be empty strings from HTML inputs
const optionalDate = z.string().optional().refine((val) => {
  // If it's undefined or empty string, it's valid (will be handled by logic)
  if (!val) return true;
  // If provided, must be a real date
  return !isNaN(Date.parse(val));
}, { message: "Invalid date format" });

// --- SUB-SCHEMAS ---

// 1. Partners
const partnerItemSchema = z.object({
  partner: z.string().min(1, "Partner is required"),
  partnerName: z.string().optional(),
  service: requiredString,
  priceType: z.enum(["hourly", "fixed"]),
  // Convert string inputs to numbers
  rate: z.coerce.number().min(0, "Rate must be positive"),
  hours: z.coerce.number().min(0).optional(),
  // Default cost to 0 so hidden inputs don't fail validation
  cost: z.coerce.number().default(0), 
});

// 2. Supplies
const supplyItemSchema = z.object({
  supply: z.string().min(1),
  supplyName: z.string().optional(),
  quantityRequested: z.coerce.number().min(1, "Qty must be at least 1"),
  currentStock: z.number().optional(),
  pricingType: z.enum(["included", "chargeable", "optional"]),
  costPerUnit: z.number().optional(),
  chargePerUnit: z.coerce.number().min(0).optional(),
  supplyUnit: z.string().optional(),
});

// 3. Payment
const paymentSchema = z.object({
  // Allow 0 here so the form doesn't block "next" if user hasn't typed anything.
  // We remove the payment object in onSubmit if amount <= 0
  amount: z.coerce.number().min(0).optional(),
  method: z.enum(["cash", "credit_card", "bank_transfer", "check", "online"]).default("cash"),
  status: z.enum(["pending", "completed", "failed", "refunded"]).default("pending"),
  paymentDate: optionalDate,
  dueDate: optionalDate,
  reference: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
});

// --- MAIN SCHEMA ---
export const eventSchema = z.object({
  // Core Info
  title: requiredString.max(200),
  type: requiredString,
  status: z.enum(["pending", "confirmed", "in-progress", "completed", "cancelled"]).default("pending"),

  // Relations
  clientId: requiredString.describe("Select a client"),
  venueSpaceId: requiredString.describe("Select a space"),

  // Schedule (Tunisia Default: Single Day)
  sameDayEvent: z.boolean().default(true),
  startDate: z.string().min(1, "Start Date is required").refine((val) => !isNaN(Date.parse(val)), "Invalid Start Date"),
  
  // Times
  startTime: requiredString.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time (HH:MM)"),
  endTime: requiredString.regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time (HH:MM)"),
  
  // Optional End Date (Validation logic below handles single-day cases)
  endDate: optionalDate,

  guestCount: z.coerce.number().int().min(1).default(1),

  // Collections
  partners: z.array(partnerItemSchema).default([]),
  supplies: z.array(supplyItemSchema).default([]),

  // Pricing
  pricing: z.object({
    basePrice: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).default(0),
    discountType: z.enum(["fixed", "percentage"]).default("fixed"),
    taxRate: z.coerce.number().min(0).default(19),
  }),

  // Optional Payment Logic
  payment: paymentSchema.optional(),

  // Extras
  notes: z.string().max(2000).optional(),
  createInvoice: z.boolean().default(false),
})
.superRefine((data, ctx) => {
  // 1. DETERMINE EFFECTIVE DATES
  const startDate = data.startDate;
  // If single day, endDate implies startDate logic
  const effectiveEndDate = data.sameDayEvent ? data.startDate : data.endDate;

  // 2. CHECK MULTI-DAY REQUIREMENTS
  if (!data.sameDayEvent) {
    if (!data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End Date is required for multi-day events",
        path: ["endDate"],
      });
      return; // Stop further checks if missing
    }
    // Date comparison (Strings ISO format sort lexically mostly, but parsing safe)
    if (new Date(data.endDate) < new Date(data.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End Date cannot be before Start Date",
        path: ["endDate"],
      });
    }
  }

  // 3. CHECK TIME LOGIC
  // Only check if dates exist
  if (startDate && effectiveEndDate && data.startTime && data.endTime) {
    const startObj = new Date(`${startDate}T${data.startTime}`);
    const endObj = new Date(`${effectiveEndDate}T${data.endTime}`);

    // If parsing worked
    if (!isNaN(startObj.getTime()) && !isNaN(endObj.getTime())) {
      if (endObj <= startObj) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End time must be after start time",
          path: ["endTime"],
        });
      }
    }
  }
});