import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
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

// Services
import { eventService, paymentService, invoiceService } from "../../../api";

// --- MAIN FORM LAYOUT ---
const SharedEventForm = ({ onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { apiError } = useToast();

  const {
    currentStep,
    totalSteps,
    goToNextStep,
    goToPrevStep,
    goToStep,
    formData,
    setFormData,
    errors,
    validateCurrentStep,
    loading,
    setLoading,
    calculations,
    meta,
  } = useEventContext();

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState(null);

  // Focus management
  const containerRef = useRef(null);

  const steps = [
    {
      id: 1,
      title: t("eventForm.steps.eventDetails"),
      component: Step1EventDetails,
    },
    {
      id: 2,
      title: t("eventForm.steps.clientSelection"),
      component: Step2ClientSelection,
    },
    {
      id: 3,
      title: t("eventForm.steps.venuePricing"),
      component: Step3VenuePricing,
    },
    { id: 4, title: t("eventForm.steps.payment"), component: Step4Payment },
    { id: 5, title: t("eventForm.steps.review"), component: Step5Review },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  // --- LOGIC (Draft/Submit) ---
  useEffect(() => {
    if (!meta.isEditMode) {
      const draft = localStorage.getItem("eventFormDraft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (
            Date.now() - new Date(parsed.timestamp).getTime() < 86400000 &&
            parsed.savedData
          ) {
            setDraftData(parsed);
            setShowDraftModal(true);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [meta.isEditMode]);

  useEffect(() => {
    if (!meta.isEditMode && formData.title && currentStep > 1) {
      const timeout = setTimeout(() => {
        localStorage.setItem(
          "eventFormDraft",
          JSON.stringify({
            savedData: formData,
            currentStep,
            timestamp: new Date().toISOString(),
          })
        );
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [formData, currentStep, meta.isEditMode]);

  // Smart Enter Key Logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "TEXTAREA") return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (currentStep < totalSteps) {
          goToNextStep();
        } else {
          handleSubmit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, totalSteps, goToNextStep]); // eslint-disable-line

  const handleRestoreDraft = () => {
    if (draftData?.savedData) {
      setFormData((prev) => ({ ...prev, ...draftData.savedData }));
      goToStep(draftData.currentStep || 1);
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
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);
      const finalEndDate = formData.sameDayEvent
        ? formData.startDate
        : formData.endDate;

      const submitData = {
        ...formData,
        endDate: finalEndDate,
        guestCount: formData.guestCount
          ? parseInt(formData.guestCount)
          : undefined,
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
        })),
      };

      delete submitData.payment;
      delete submitData.createInvoice;

      let response;
      if (meta.isEditMode) {
        response = await eventService.update(meta.eventId, submitData);
      } else {
        response = await eventService.create(submitData);
        localStorage.removeItem("eventFormDraft");
      }

      const createdEventId =
        response.event?._id ||
        response.data?._id ||
        meta.eventId ||
        response._id;
      const createdVenueId =
        response.event?.venueId || response.data?.venueId || submitData.venueId;

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
              category: "venue_rental",
            },
            ...calculations.partnersDetails.map((p) => ({
              description: `${p.partnerName} - ${p.service}`,
              quantity: 1,
              rate: p.calculatedCost,
              amount: p.calculatedCost,
              category: "service",
            })),
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
            notes: formData.notes,
          });
        } catch (invError) {
          console.error("Invoice Gen Error:", invError);
        }
      }

      if (onSuccess) onSuccess(response);
    } catch (error) {
      console.error(error);
      apiError(error, t("eventForm.messages.saveFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSave = async () => {
    if (!meta.isEditMode) return;
    await handleSubmit();
  };

  return (
    // Root container: Flex column ensures footer pushes down. min-h-screen covers full height.
    <div
      className="min-h-screen flex flex-col bg-white dark:bg-gray-900 relative"
      ref={containerRef}
    >
      {showDraftModal && (
        <DraftRestoreModal
          draftData={draftData}
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      {/* Header (Sticky Top handled internally by FormHeader) */}
      <FormHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        isEditMode={meta.isEditMode}
        onStepClick={goToStep}
      />

      {/* MAIN CONTENT: Grows to fill space (flex-1) */}
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12">
        {/* Validation Banner */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 animate-in slide-in-from-top-2">
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500" size={20} />
                <div>
                  <h3 className="font-bold text-red-800 dark:text-red-200 text-sm">
                    Action Required
                  </h3>
                  <p className="text-red-600 dark:text-red-300 text-xs mt-0.5">
                    Please fix the errors below to proceed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CurrentStepComponent />
        </div>
      </div>

      {/* FOOTER: Sticky Bottom
          - sticky bottom-0: Sticks to viewport bottom when scrolling
          - w-full: Background spans full width
          - Inner div (max-w-5xl mx-auto): Aligns content perfectly with the form above
      */}
      <div className="sticky bottom-0 z-40 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-row items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={
              currentStep === 1 ? () => navigate("/events") : goToPrevStep
            }
            icon={ArrowLeft}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400"
          >
            {currentStep === 1 ? t("common.cancel") : t("common.back")}
          </Button>

          <div className="flex items-center gap-3">
            {meta.isEditMode && currentStep < totalSteps && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleQuickSave}
                icon={Save}
                loading={loading}
                className="hidden sm:flex"
              >
                Quick Save
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                type="button"
                variant="primary"
                onClick={goToNextStep}
                icon={ArrowRight}
                iconPosition="right"
                className="px-8 shadow-lg shadow-orange-500/20"
              >
                {t("common.next")}
              </Button>
            ) : (
              <Button
                type="button"
                variant="success"
                onClick={handleSubmit}
                icon={CheckCircle}
                loading={loading}
                className="px-8 shadow-lg shadow-green-500/20"
              >
                {meta.isEditMode
                  ? t("eventForm.buttons.updateEvent")
                  : t("eventForm.buttons.createEvent")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedEventForm;
