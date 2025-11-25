import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Save, ArrowRight, ArrowLeft, 
  Calendar, User, AlertCircle, Info, ChevronDown, ChevronUp
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../hooks/useToast";

// Context
import { useEventContext } from "./EventFormContext";

// Components
import FormHeader from "./FormHeader"; 
import Step1EventDetails from "./steps/Step1EventDetails";
import Step2ClientSelection from "./steps/Step2ClientSelection";
import Step3VenuePricing from "./steps/Step3VenuePricing";
import Step4Payment from "./steps/Step4Payment";
import Step5Review from "./steps/Step5Review";
import DraftRestoreModal from "./components/DraftRestoreModal";

// Generic UI
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";

// Services
import { eventService, paymentService, invoiceService } from "../../../api";

// --- SIDEBAR SUMMARY (DESKTOP) ---
const LiveSummary = ({ formData, clientData, calculations }) => {
  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }) : "-";
  
  return (
    // FIXED: Changed from top-64 to top-20 for better positioning
    <div className="sticky top-20 z-0 space-y-4 lg:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Event Summary
          </h3>
          <div className="mt-1 font-bold text-gray-900 dark:text-white truncate text-base lg:text-lg">
            {formData.title || <span className="text-gray-400 italic">New Event</span>}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Date</p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <Calendar size={14} className="text-orange-500 shrink-0" />
                <span className="truncate">{formatDate(formData.startDate)}</span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Guests</p>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                <User size={14} className="text-blue-500 shrink-0" />
                {formData.guestCount || "-"}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">Client</p>
            {clientData && clientData.name ? (
              <Badge variant="purple" className="w-full justify-center text-xs truncate">
                {clientData.name}
              </Badge>
            ) : (
              <div className="text-xs text-gray-400 italic text-center py-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-100 dark:border-gray-700">
                No Client Selected
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
             <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Estimated</span>
                <span className="text-xl lg:text-2xl font-bold text-orange-600 dark:text-orange-500">
                  {calculations.totalPrice.toFixed(2)} <span className="text-xs font-normal text-gray-500">TND</span>
                </span>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-3 lg:p-4 flex gap-2 lg:gap-3">
        <Info className="text-blue-600 dark:text-blue-400 shrink-0" size={18} />
        <div className="text-xs text-blue-800 dark:text-blue-200">
          <p className="font-bold mb-1">Auto-Save is Active</p>
          Changes are saved locally. You can refresh or leave the page without losing data.
        </div>
      </div>
    </div>
  );
};

// --- MOBILE COLLAPSIBLE SUMMARY ---
const MobileSummary = ({ formData, clientData, calculations }) => {
  const [isOpen, setIsOpen] = useState(false);
  const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }) : "-";

  return (
    <div className="lg:hidden mb-4 sm:mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 sm:p-4 flex items-center justify-between cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/50 transition-colors"
      >
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Estimated Total
          </span>
          <span className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-500">
            {calculations.totalPrice.toFixed(2)} TND
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <span className="hidden xs:inline">{isOpen ? 'Hide Details' : 'Show Details'}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isOpen && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
          <div className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
             <div>
              <p className="text-xs text-gray-400 uppercase">Event</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {formData.title || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Client</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {clientData?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(formData.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Guests</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formData.guestCount || "-"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN FORM LAYOUT ---
const SharedEventForm = ({ onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSuccess, showError, apiError, formSuccess } = useToast();

  const { 
    currentStep, totalSteps, goToNextStep, goToPrevStep, goToStep,
    formData, setFormData, errors,
    loading, setLoading, calculations, meta, 
    clients 
  } = useEventContext();

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState(null);

  const activeClientData = clients?.find(c => c._id === formData.clientId);

  const steps = [
    { id: 1, title: t('eventForm.steps.eventDetails'), component: Step1EventDetails },
    { id: 2, title: t('eventForm.steps.clientSelection'), component: Step2ClientSelection },
    { id: 3, title: t('eventForm.steps.venuePricing'), component: Step3VenuePricing },
    { id: 4, title: t('eventForm.steps.payment'), component: Step4Payment },
    { id: 5, title: t('eventForm.steps.review'), component: Step5Review },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  // --- LOGIC (Draft/Submit) ---
  useEffect(() => {
    if (!meta.isEditMode) {
      const draft = localStorage.getItem("eventFormDraft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (Date.now() - new Date(parsed.timestamp).getTime() < 86400000 && parsed.savedData) {
            setDraftData(parsed);
            setShowDraftModal(true);
          }
        } catch (e) { console.error(e); }
      }
    }
  }, [meta.isEditMode]);

  useEffect(() => {
    if (!meta.isEditMode && formData.title && currentStep > 1) {
      const timeout = setTimeout(() => {
        localStorage.setItem("eventFormDraft", JSON.stringify({
          savedData: formData,
          currentStep,
          timestamp: new Date().toISOString()
        }));
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [formData, currentStep, meta.isEditMode]);

  const handleRestoreDraft = () => {
    if (draftData?.savedData) {
      setFormData(prev => ({ ...prev, ...draftData.savedData }));
      goToStep(draftData.currentStep || 1);
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

  const handleSubmit = async () => {
    if (!goToNextStep() && currentStep !== totalSteps) return;
    
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
      else navigate("/events");

    } catch (error) {
      console.error(error);
      apiError(error, t('eventForm.messages.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showDraftModal && (
        <DraftRestoreModal draftData={draftData} onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
      )}

      {/* PAGE BACKGROUND */}
      <div className="min-h-screen bg-white dark:bg-gray-900 pb-16 sm:pb-20 lg:pb-24 transition-colors duration-200 relative z-0">
        
        {/* Header */}
        <FormHeader 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
          isEditMode={meta.isEditMode}
          prefillClient={meta.prefillClient}
          prefillPartner={meta.prefillPartner}
          onStepClick={goToStep} 
        />

        {/* MAIN CONTENT CONTAINER */}
        <div className="w-full max-w-full px-3 sm:px-4 md:px-6 lg:px-8 mt-4 sm:mt-6 md:mt-8">
          
          {/* Mobile Summary */}
          <MobileSummary 
            formData={formData} 
            clientData={activeClientData} 
            calculations={calculations} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            
            {/* Left Side: Form Content */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                
                {/* Header for Step */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 border-b border-gray-100 dark:border-gray-700">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {steps[currentStep - 1].title}
                  </h1>
                </div>

                {/* Form Body */}
                <div className="p-4 sm:p-6 md:p-8">
                   <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <CurrentStepComponent />
                   </div>
                </div>

                {/* Validation Error */}
                {Object.keys(errors).length > 0 && (
                  <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6">
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-800">
                      <AlertCircle size={16} className="shrink-0" />
                      <span className="font-medium text-xs sm:text-sm">{t('eventForm.messages.fixErrors')}</span>
                    </div>
                  </div>
                )}
                
                {/* Action Footer */}
                <div className="px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-b-xl flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
                  <Button
                    variant="ghost"
                    onClick={currentStep === 1 ? () => navigate('/events') : goToPrevStep}
                    className="w-full sm:w-auto text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white justify-center sm:justify-start"
                  >
                    {currentStep === 1 ? t('common.cancel') : t('eventForm.buttons.previous')}
                  </Button>

                  {currentStep < totalSteps ? (
                    <Button
                      variant="primary"
                      onClick={goToNextStep}
                      icon={ArrowRight}
                      iconPosition="right"
                      className="w-full sm:w-auto px-6 sm:px-8 justify-center"
                    >
                      {t('eventForm.buttons.next', 'Next Step')} 
                    </Button>
                  ) : (
                    <Button
                      variant="success"
                      onClick={handleSubmit}
                      icon={Save}
                      loading={loading}
                      className="w-full sm:w-auto px-6 sm:px-8 shadow-lg shadow-green-500/20 justify-center"
                    >
                      {meta.isEditMode ? t('eventForm.buttons.updateEvent') : t('eventForm.buttons.createEvent')}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side: Summary Sidebar (Desktop only) */}
            <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
               <LiveSummary 
                 formData={formData} 
                 clientData={activeClientData} 
                 calculations={calculations} 
               />
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default SharedEventForm;