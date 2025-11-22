import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft, Save, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../hooks/useToast"; // ✅ Custom Toast

import { EventFormProvider, useEventContext } from "./EventFormContext";
import FormHeader from "./FormHeader";
import Step1EventDetails from "./steps/Step1EventDetails";
import Step2ClientSelection from "./steps/Step2ClientSelection";
import Step3VenuePricing from "./steps/Step3VenuePricing";
import Step4Payment from "./steps/Step4Payment";
import Step5Review from "./steps/Step5Review";
import Button from "../../../components/common/Button";
import DraftRestoreModal from "./components/DraftRestoreModal";
import { eventService, paymentService, invoiceService } from "../../../api";

const TOTAL_STEPS = 5;

const EventFormContent = ({ isModal, onClose, onSuccess, returnUrl }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // ✅ Destructure Toast methods
  const { showSuccess, showError, apiError, validationError, formSuccess } = useToast(); 

  const { 
    formData, setFormData, selectedClient, validateStep, setErrors, 
    loading, setLoading, calculations, meta 
  } = useEventContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState(null);

  // --- Draft Logic ---
  useEffect(() => {
    if (!meta.isEditMode) {
      const draft = localStorage.getItem("eventFormDraft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          const age = Date.now() - new Date(parsed.timestamp).getTime();
          if (age < 24 * 60 * 60 * 1000 && parsed.savedData) {
            setDraftData(parsed);
            setShowDraftModal(true);
          }
        } catch (e) { console.error(e); }
      }
    }
  }, [meta.isEditMode]);

  useEffect(() => {
    if (!meta.isEditMode && formData.title && currentStep > 1) {
      localStorage.setItem("eventFormDraft", JSON.stringify({
        savedData: formData,
        currentStep, 
        timestamp: new Date().toISOString()
      }));
    }
  }, [formData, currentStep, meta.isEditMode]);

  const handleRestoreDraft = () => {
    if (draftData && draftData.savedData) {
      setFormData(prev => ({
        ...prev,
        ...draftData.savedData,
        pricing: { ...prev.pricing, ...(draftData.savedData.pricing || {}) },
        partners: draftData.savedData.partners || []
      }));
      setCurrentStep(draftData.currentStep || 1);
      showSuccess(t('eventForm.messages.draftRestored')); // ✅ Toast
    }
    setDraftData(null);
    setShowDraftModal(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("eventFormDraft");
    setDraftData(null);
    setShowDraftModal(false);
  };

  // --- Navigation ---
  const nextStep = useCallback(() => {
    const validationErrors = validateStep(currentStep, formData, selectedClient);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    } else {
      validationError(); // ✅ Toast
    }
  }, [currentStep, formData, selectedClient, validateStep, setErrors, validationError]);

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const jumpToStep = (step) => step < currentStep && setCurrentStep(step);

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateStep(currentStep, formData, selectedClient);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return validationError(); // ✅ Toast

    try {
      setLoading(true);

      const finalEndDate = formData.sameDayEvent ? formData.startDate : formData.endDate;

      const submitData = {
        ...formData,
        endDate: finalEndDate,
        guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
        pricing: {
          basePrice: calculations.basePrice,
          discount: parseFloat(formData.pricing.discount) || 0,
          discountType: formData.pricing.discountType,
          taxRate: calculations.taxRate,
          totalAmount: calculations.totalPrice,
        },
        partners: calculations.partnersDetails.map((p) => ({
          partner: p.partner,
          service: p.service,
          cost: p.calculatedCost,
          hours: p.priceType === "hourly" ? p.displayHours : undefined,
          status: p.status,
        }))
      };

      delete submitData.payment; 
      delete submitData.createInvoice;

      let response;
      if (meta.isEditMode) {
        response = await eventService.update(meta.eventId, submitData);
        formSuccess('Updated'); // ✅ Toast
      } else {
        response = await eventService.create(submitData);
        formSuccess('Created'); // ✅ Toast
        localStorage.removeItem("eventFormDraft");
      }

      // ✅ SAFE EXTRACTION of ID
      const createdEventId = response.event?._id || response.data?._id || meta.eventId || response._id;
      const createdVenueId = response.event?.venueId || response.data?.venueId || submitData.venueId; // Ensure we get venue ID

      // 1. Handle Payment
      if (formData.payment.amount && parseFloat(formData.payment.amount) > 0) {
        await paymentService.create({
          event: createdEventId,
          client: formData.clientId,
          amount: parseFloat(formData.payment.amount),
          method: formData.payment.paymentMethod,
          status: formData.payment.status,
          description: formData.payment.notes || "Initial payment",
          paidDate: formData.payment.paymentDate,
          type: "income",
        });
      }

      // 2. Handle Invoice Generation
      if (formData.createInvoice && !meta.isEditMode) {
        try {
          const items = [
            {
              description: `Venue Rental: ${submitData.title}`,
              quantity: 1,
              rate: calculations.basePrice,
              amount: calculations.basePrice,
              category: "venue_rental"
            },
            ...calculations.partnersDetails.map(p => ({
              description: `${p.partnerName} - ${p.service}`,
              quantity: 1,
              rate: p.calculatedCost,
              amount: p.calculatedCost,
              category: "service"
            }))
          ];

          await invoiceService.create({
            venue: createdVenueId, // Required field
            client: formData.clientId,
            event: createdEventId,
            invoiceType: "client",
            status: "draft",
            issueDate: new Date().toISOString(),
            dueDate: finalEndDate,
            items: items,
            taxRate: calculations.taxRate,
            discount: submitData.pricing.discount,
            discountType: submitData.pricing.discountType,
            notes: formData.notes
          });
          showSuccess("Invoice generated automatically"); // ✅ Toast
        } catch (invError) {
          console.error("Invoice Gen Error:", invError);
          showError("Event created, but Invoice generation failed."); // ✅ Toast
        }
      }

      if (onSuccess) onSuccess(response);
      if (onClose) onClose();
      else if (returnUrl) navigate(returnUrl);
      else navigate("/events");

    } catch (error) {
      console.error(error);
      apiError(error, t('eventForm.messages.saveFailed')); // ✅ Toast
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1EventDetails />;
      case 2: return <Step2ClientSelection />;
      case 3: return <Step3VenuePricing />;
      case 4: return <Step4Payment />;
      case 5: return <Step5Review />;
      default: return null;
    }
  };

  return (
    <>
      {showDraftModal && (
        <DraftRestoreModal draftData={draftData} onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden h-full flex flex-col">
        <FormHeader 
          currentStep={currentStep} 
          totalSteps={TOTAL_STEPS} 
          isEditMode={meta.isEditMode}
          prefillClient={meta.prefillClient}
          prefillPartner={meta.prefillPartner}
          onStepClick={jumpToStep} 
        />

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {renderStep()}
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t flex justify-between items-center shrink-0">
          <div className="flex items-center">
            {currentStep > 1 && (
              <Button variant="outline" icon={ChevronLeft} onClick={prevStep}>
                {t('eventForm.buttons.previous')}
              </Button>
            )}
          </div>

          {currentStep >= 3 && calculations.totalPrice >= 0 && (
            <div className="hidden md:flex items-center gap-6 bg-white dark:bg-gray-600 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-500 shadow-sm">
              <div className="flex flex-col items-end text-xs text-gray-500 dark:text-gray-300 border-r border-gray-200 dark:border-gray-500 pr-4 mr-2">
                <span>Base: <strong>{calculations.basePrice.toFixed(2)}</strong></span>
                <span>Partners: <strong>{calculations.partnersTotal.toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-green-100 text-green-700 rounded-full">
                  <DollarSign size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total (TTC)</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                    {calculations.totalPrice.toFixed(2)} TND
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {currentStep < TOTAL_STEPS ? (
              <Button variant="primary" icon={ChevronRight} onClick={nextStep}>
                {t('eventForm.buttons.continue')}
              </Button>
            ) : (
              <Button variant="primary" icon={Save} loading={loading} onClick={handleSubmit}>
                {meta.isEditMode ? t('eventForm.buttons.updateEvent') : t('eventForm.buttons.createEvent')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Outer Wrapper remains unchanged...
const EventForm = ({ isOpen, onClose, eventId, onSuccess, initialDate, prefillClient }) => {
  const { id: urlEventId } = useParams();
  const location = useLocation();
  
  const isModal = location.pathname === "/events/new" ? true : isOpen !== undefined;
  const activeEventId = isModal ? eventId : urlEventId;
  const isEditMode = !!activeEventId;
  
  const activePrefillClient = prefillClient || location.state?.prefillClient;
  const activePrefillPartner = location.state?.prefillPartner;

  if (isModal && !isOpen && location.pathname !== "/events/new") return null;

  const content = (
    <EventFormProvider
      eventId={activeEventId}
      isEditMode={isEditMode}
      initialDate={initialDate}
      prefillClient={activePrefillClient}
      prefillPartner={activePrefillPartner}
    >
      <EventFormContent isModal={isModal} onClose={onClose} onSuccess={onSuccess} returnUrl={location.state?.returnUrl} />
    </EventFormProvider>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden backdrop-blur-sm flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/50" onClick={onClose}></div>
        <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
          {content}
        </div>
      </div>
    );
  }

  return <div className="container mx-auto px-4 py-8 max-w-5xl">{content}</div>;
};

export default EventForm;