import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, ChevronLeft, Save, DollarSign, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../hooks/useToast";

// Context & Sub-components
import { EventFormProvider, useEventContext } from "./EventFormContext";
import FormHeader from "./FormHeader";
import Step1EventDetails from "./steps/Step1EventDetails";
import Step2ClientSelection from "./steps/Step2ClientSelection";
import Step3VenuePricing from "./steps/Step3VenuePricing";
import Step4Payment from "./steps/Step4Payment";
import Step5Review from "./steps/Step5Review";
import DraftRestoreModal from "./components/DraftRestoreModal";

// Services
import { eventService, paymentService, invoiceService } from "../../../api";

// ✅ Generic Components
import Button from "../../../components/common/Button";

const TOTAL_STEPS = 5;

const EventFormContent = ({ isModal, onClose, onSuccess, returnUrl }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Toast Hook
  const { showSuccess, showError, apiError, validationError, formSuccess } = useToast(); 

  const { 
    formData, setFormData, selectedClient, validateStep, setErrors, 
    loading, setLoading, calculations, meta 
  } = useEventContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState(null);

  // --- Draft Logic (PRESERVED) ---
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
      showSuccess(t('eventForm.messages.draftRestored'));
    }
    setDraftData(null);
    setShowDraftModal(false);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("eventFormDraft");
    setDraftData(null);
    setShowDraftModal(false);
  };

  // --- Navigation (PRESERVED) ---
  const nextStep = useCallback(() => {
    const validationErrors = validateStep(currentStep, formData, selectedClient);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    } else {
      validationError();
    }
  }, [currentStep, formData, selectedClient, validateStep, setErrors, validationError]);

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const jumpToStep = (step) => step < currentStep && setCurrentStep(step);

  // --- Submit Logic (PRESERVED) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateStep(currentStep, formData, selectedClient);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return validationError();

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
        formSuccess('Updated');
      } else {
        response = await eventService.create(submitData);
        formSuccess('Created');
        localStorage.removeItem("eventFormDraft");
      }

      const createdEventId = response.event?._id || response.data?._id || meta.eventId || response._id;
      const createdVenueId = response.event?.venueId || response.data?.venueId || submitData.venueId;

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
            venue: createdVenueId,
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
          showSuccess("Invoice generated automatically");
        } catch (invError) {
          console.error("Invoice Gen Error:", invError);
          showError("Event created, but Invoice generation failed.");
        }
      }

      if (onSuccess) onSuccess(response);
      if (onClose) onClose();
      else if (returnUrl) navigate(returnUrl);
      else navigate("/events");

    } catch (error) {
      console.error(error);
      apiError(error, t('eventForm.messages.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  // --- Step Renderer ---
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

      {/* ✅ Main Card Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden h-full flex flex-col border border-gray-100 dark:border-gray-700 transition-all duration-200">
        
        {/* Header */}
        <FormHeader 
          currentStep={currentStep} 
          totalSteps={TOTAL_STEPS} 
          isEditMode={meta.isEditMode}
          prefillClient={meta.prefillClient}
          prefillPartner={meta.prefillPartner}
          onStepClick={jumpToStep} 
        />

        {/* Scrollable Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/50 dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto w-full">
            {renderStep()}
          </div>
        </div>

        {/* Footer / Action Bar */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 z-10 relative shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          
          {/* Left: Previous Button */}
          <div className="w-full sm:w-auto flex justify-start order-2 sm:order-1">
            {currentStep > 1 ? (
              <Button 
                variant="outline" 
                icon={ChevronLeft} 
                onClick={prevStep}
                className="w-full sm:w-auto"
              >
                {t('eventForm.buttons.previous')}
              </Button>
            ) : (
              <div className="w-24 hidden sm:block" /> /* Spacer */
            )}
          </div>

          {/* Center: Price Display (Visible from Step 3) */}
          <div className="order-1 sm:order-2 w-full sm:w-auto flex justify-center">
            {currentStep >= 3 && calculations.totalPrice >= 0 && (
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 px-5 py-2 rounded-full border border-gray-200 dark:border-gray-600">
                <div className="flex flex-col items-end text-xs text-gray-500 dark:text-gray-400 border-r border-gray-300 dark:border-gray-500 pr-4 mr-1">
                  <span>Base: <span className="font-medium text-gray-700 dark:text-gray-200">{calculations.basePrice.toFixed(2)}</span></span>
                  <span>Partners: <span className="font-medium text-gray-700 dark:text-gray-200">{calculations.partnersTotal.toFixed(2)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                    <DollarSign size={16} strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider leading-tight">Total (TTC)</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                      {calculations.totalPrice.toFixed(2)} <span className="text-xs font-normal text-gray-500">TND</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Next/Save Button */}
          <div className="w-full sm:w-auto flex justify-end order-3">
            {currentStep < TOTAL_STEPS ? (
              <Button 
                variant="primary" 
                icon={ChevronRight} 
                iconPosition="right"
                onClick={nextStep}
                className="w-full sm:w-auto"
              >
                {t('eventForm.buttons.continue')}
              </Button>
            ) : (
              <Button 
                variant="success" // Changed to success for final action
                icon={Save} 
                loading={loading} 
                onClick={handleSubmit}
                className="w-full sm:w-auto shadow-lg shadow-green-500/20"
              >
                {meta.isEditMode ? t('eventForm.buttons.updateEvent') : t('eventForm.buttons.createEvent')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// --- Outer Wrapper (Preserved Logic) ---
const EventForm = ({ isOpen, onClose, eventId, onSuccess, initialDate, prefillClient }) => {
  const { id: urlEventId } = useParams();
  const location = useLocation();
  
  const isModal = location.pathname === "/events/new" ? true : isOpen !== undefined;
  const activeEventId = isModal ? eventId : urlEventId;
  const isEditMode = !!activeEventId;
  
  const activePrefillClient = prefillClient || location.state?.prefillClient;
  const activePrefillPartner = location.state?.prefillPartner;

  // Early return if modal is closed
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

  // ✅ Enhanced Modal Overlay
  if (isModal) {
    return (
      <div className="fixed inset-0 z-[60] overflow-hidden flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop with Blur */}
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
        
        {/* Modal Container */}
        <div className="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 shadow-2xl">
          
          {/* Close Button (Absolute) */}
          <button 
            onClick={onClose}
            className="absolute -top-3 -right-3 z-50 p-2 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-full shadow-md hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {content}
        </div>
      </div>
    );
  }

  // Standard Page Layout
  return <div className="container mx-auto px-4 py-8 max-w-6xl h-[calc(100vh-100px)]">{content}</div>;
};

export default EventForm;