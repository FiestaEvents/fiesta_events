import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Receipt, Calendar, User, Package, Check, Save } from "lucide-react";

import { eventSchema } from "../../../schemas/EventSchema";
import { useEventCalculations } from "../../../hooks/useEventCalculations";
import { eventService, paymentService, invoiceService } from "../../../api/index";
import { useToast } from "../../../hooks/useToast";

import Step1EventDetails from "./steps/Step1EventDetails";
import Step2ClientSelection from "./steps/Step2ClientSelection";
import Step3VenuePricing from "./steps/Step3VenuePricing"; 
import Step4Payment from "./steps/Step4Payment"; 
import Step5Review from "./steps/Step5Review";

const VenueEventForm = ({ defaultValues, isEditMode }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError, apiError } = useToast();

  const baseDefaults = {
      sameDayEvent: true, 
      title: "",
      guestCount: 1,
      startDate: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "17:00",
      partners: [],
      supplies: [],
      pricing: { taxRate: 19, basePrice: 0, discount: 0, discountType: 'fixed' },
      payment: { amount: 0, method: "cash", status: "pending", description: "" },
      createInvoice: false
  };

  const methods = useForm({
    resolver: zodResolver(eventSchema),
    mode: "onBlur", 
    defaultValues: { ...baseDefaults, ...defaultValues }
  });

  const calculations = useEventCalculations(methods.control);

  useEffect(() => {
    if (defaultValues) {
      methods.reset({ ...baseDefaults, ...defaultValues });
    }
  }, [defaultValues]);

  // --- SUBMIT HANDLER ---
  const onSubmit = async (data) => {
    if (isSubmitting) return;

    const payload = { ...data };
    if (payload.sameDayEvent) payload.endDate = payload.startDate;

    // Filter Payment
    const hasPayment = payload.payment && Number(payload.payment.amount) > 0;
    const paymentData = { ...payload.payment };
    if (!hasPayment) delete payload.payment;

    setIsSubmitting(true);
    try {
        console.log("🚀 Creating Event...");
        
        let eventRes;
        if (isEditMode) {
            if (!defaultValues?._id) throw new Error("Missing Event ID");
            eventRes = await eventService.update(defaultValues._id, payload);
            showSuccess(t("eventForm.messages.eventUpdated") || "Event updated");
        } else {
            eventRes = await eventService.create(payload);
            showSuccess(t("eventForm.messages.eventCreated") || "Event created");
        }

        const createdEvent = eventRes.event || eventRes.data || eventRes;
        const eventId = createdEvent._id || createdEvent.id;
        const clientId = payload.clientId; 

        // Payment
        if (hasPayment && !isEditMode) {
            await paymentService.create({
                type: "income",
                amount: Number(paymentData.amount),
                method: paymentData.method,
                status: paymentData.status,
                paymentDate: paymentData.paymentDate || new Date().toISOString(),
                dueDate: paymentData.dueDate || payload.startDate,
                reference: paymentData.reference,
                description: paymentData.description,
                eventId, clientId, invoiceId: null 
            });
        }

        // Invoice
        if (payload.createInvoice && !isEditMode) {
            const invoiceItems = [];
            // Base
            if(Number(calculations.basePrice) > 0) {
                invoiceItems.push({
                    description: `Venue Rental: ${payload.title}`,
                    quantity: 1,
                    rate: Number(calculations.basePrice),
                    amount: Number(calculations.basePrice)
                });
            }
            // Partners
            (payload.partners || []).forEach(p => {
               const rate = Number(p.rate) || 0;
               const cost = p.priceType === 'hourly' ? rate * (Number(p.hours)||1) : rate;
               if(cost > 0) invoiceItems.push({
                   description: `${p.service} - ${p.partnerName}`,
                   quantity: p.priceType === 'hourly' ? (Number(p.hours)||1) : 1,
                   rate: rate,
                   amount: cost
               });
            });
            // Supplies
            (payload.supplies || []).filter(s => s.pricingType === 'chargeable').forEach(s => {
               if(s.chargePerUnit > 0) invoiceItems.push({
                   description: `Supply: ${s.supplyName}`,
                   quantity: Number(s.quantityRequested),
                   rate: Number(s.chargePerUnit),
                   amount: (Number(s.quantityRequested) * Number(s.chargePerUnit))
               });
            });

            if(invoiceItems.length > 0) {
                await invoiceService.create({
                    invoiceType: "client",
                    client: clientId, event: eventId,
                    issueDate: new Date().toISOString(),
                    dueDate: payload.startDate,
                    status: "draft",
                    items: invoiceItems,
                    taxRate: payload.pricing.taxRate,
                    discount: payload.pricing.discount,
                    discountType: payload.pricing.discountType,
                    notes: `Auto-generated: ${payload.title}`
                });
            }
        }
        
        navigate("/events");
    } catch (err) {
        console.error("Submission Error:", err);
        const errorMsg = err.response?.data?.message || err.message;
        if (errorMsg && (errorMsg.includes("conflict") || errorMsg.includes("Time slot"))) {
           showError(t("eventForm.errors.collision"))
           methods.setError("startTime", { type: "manual", message: "Conflict" });
           setCurrentStep(1); 
           window.scrollTo(0,0);
        } else {
           apiError(err);
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const onError = (errors) => {
    console.error("Form Validation Failed:", errors);
    showError("Please check the form for errors.");
  };

  // ✅ FIXED NAVIGATION LOGIC
  const nextStep = async (e) => {
    // Prevent button from acting as submit
    e.preventDefault(); 
    
    let fields = [];
    switch (currentStep) {
        case 1: 
            fields = ["title", "type", "guestCount", "startDate", "startTime", "endTime"];
            if (!methods.getValues("sameDayEvent")) fields.push("endDate");
            break;
        case 2: fields = ["clientId"]; break;
        case 3: fields = ["venueSpaceId", "pricing.basePrice"]; break;
        // ✅ ADDED CASE 4: Validate payment fields if amount is entered
        case 4: 
            // Only strictly validate payment info if amount > 0, otherwise it's optional
            if (Number(methods.getValues("payment.amount")) > 0) {
                fields = ["payment.amount", "payment.method", "payment.status"];
            }
            break;
    }

    // Trigger validation for current step fields
    const isValid = await methods.trigger(fields);
    
    if (isValid) {
        setCurrentStep(c => c + 1);
        window.scrollTo(0,0);
    } else {
        console.log("Validation Failed on Step", currentStep);
    }
  };

  const prevStep = (e) => {
      e.preventDefault();
      setCurrentStep(c => c - 1);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onError)} className="flex h-[calc(100vh-64px)] overflow-hidden">
        
        {/* LEFT PANEL */}
        <div className="w-full lg:w-[65%] xl:w-[70%] bg-white dark:bg-gray-900 flex flex-col h-full border-r border-gray-200 dark:border-gray-800">
           <div className="p-6 border-b border-gray-100 dark:border-gray-800">
               <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-wider text-orange-600 uppercase">
                  {t("eventForm.header.stepIndicator", { current: currentStep, total: 5 })}
               </div>
               <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentStep === 1 && t("eventForm.steps.eventDetails")}
                  {currentStep === 2 && t("eventForm.steps.clientSelection")}
                  {currentStep === 3 && t("eventForm.steps.venuePricing")}
                  {currentStep === 4 && t("eventForm.steps.payment")}
                  {currentStep === 5 && t("eventForm.steps.review")}
               </h1>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
               <div className="max-w-3xl mx-auto">
                   {currentStep === 1 && <Step1EventDetails />}
                   {currentStep === 2 && <Step2ClientSelection />}
                   {currentStep === 3 && <Step3VenuePricing />}
                   {currentStep === 4 && <Step4Payment />}
                   {currentStep === 5 && <Step5Review />}
               </div>
           </div>

           {/* FOOTER */}
           <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between bg-white dark:bg-gray-900">
               <button 
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
               >
                 {t("common.back")}
               </button>
               
               {currentStep < 5 ? (
                   <button 
                     type="button"
                     onClick={nextStep}
                     className="px-6 py-2.5 rounded-lg text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 dark:bg-white dark:text-black transition-colors"
                   >
                     {t("common.next")}
                   </button>
               ) : (
                   <button 
                     type="submit" 
                     disabled={isSubmitting}
                     className="px-8 py-2.5 rounded-lg text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                   >
                     {isSubmitting ? t("eventForm.buttons.processing") : (isEditMode ? t("eventForm.buttons.updateEvent") : t("eventForm.buttons.createEvent"))}
                     {!isSubmitting && <Check size={18} />}
                   </button>
               )}
           </div>
        </div>

        {/* RIGHT PANEL (Preview) */}
        <div className="hidden lg:flex lg:w-[35%] xl:w-[30%] bg-gray-50 dark:bg-black flex-col p-8 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-800 p-6">
                <div className="pb-6 mb-6 border-b border-gray-100 dark:border-gray-800">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {methods.watch("title") || "New Event"}
                   </h3>
                   <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>{methods.watch("startDate") || "--"}</span>
                      <span>•</span>
                      <span>{calculations.durationHours} hrs</span>
                   </div>
                </div>
                <div className="space-y-4 text-sm mb-6">
                   <div className="flex justify-between">
                      <span className="text-gray-500">{t("eventForm.preview.venueFee")}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{(calculations.basePrice || 0).toFixed(3)}</span>
                   </div>
                   {calculations.partnersCost > 0 && <div className="flex justify-between text-blue-600 dark:text-blue-400"><span>{t("eventForm.preview.services")}</span><span>+{(calculations.partnersCost || 0).toFixed(3)}</span></div>}
                   {calculations.suppliesChargeToClient > 0 && <div className="flex justify-between text-green-600 dark:text-green-400"><span>{t("eventForm.preview.supplies")}</span><span>+{(calculations.suppliesChargeToClient || 0).toFixed(3)}</span></div>}
                   
                   <div className="border-t border-dashed border-gray-200 dark:border-gray-700"></div>
                   
                   {calculations.discountAmount > 0 && <div className="flex justify-between text-red-500"><span>{t("eventForm.preview.discount")}</span><span>-{(calculations.discountAmount || 0).toFixed(3)}</span></div>}
                   <div className="flex justify-between text-gray-500"><span>{t("eventForm.preview.tax")} ({methods.watch('pricing.taxRate')}%)</span><span>{(calculations.taxAmount || 0).toFixed(3)}</span></div>
                </div>
                <div className="bg-orange-600 dark:bg-gray-800 text-white rounded-xl p-4 text-center">
                    <p className="text-gray-50 text-xs mb-1 uppercase tracking-wider">{t("eventForm.preview.totalEstimated")}</p>
                    <p className="text-3xl font-bold">{(calculations.total || 0).toFixed(3)} <span className="text-sm font-normal opacity-70">TND</span></p>
                </div>
            </div>
        </div>

      </form>
    </FormProvider>
  );
};
export default VenueEventForm;