// src/components/events/EventForm/index.jsx - With Complete Translations
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ChevronRight, ChevronLeft, Save } from "lucide-react";

// Components
import FormHeader from "./FormHeader";
import Step1EventDetails from "./steps/Step1EventDetails";
import Step2ClientSelection from "./steps/Step2ClientSelection";
import Step3VenuePricing from "./steps/Step3VenuePricing";
import Step4Payment from "./steps/Step4Payment";
import Step5Review from "./steps/Step5Review";
import PriceSummary from "./components/PriceSummary";
import Button from "../../../components/common/Button";
import DraftRestoreModal from "./components/DraftRestoreModal";

// Services
import {
  eventService,
  clientService,
  invoiceService,
  paymentService,
} from "../../../api";

// Hooks
import { useEventForm } from "../../../hooks/useEventForm";
import { useFormValidation } from "../../../hooks/useFormValidation";
import { useTranslation } from "react-i18next";

const TOTAL_STEPS = 5;

const EventForm = ({
  isOpen,
  onClose,
  eventId: modalEventId,
  onSuccess,
  initialDate,
  prefillClient: propPrefillClient,
}) => {
  const { id: urlEventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isModal = location.pathname === "/events/new" ? true : isOpen !== undefined;
  const eventId = isModal ? modalEventId : urlEventId;
  const isEditMode = !!eventId;

  const prefillClient = propPrefillClient || location.state?.prefillClient;
  const prefillPartner = location.state?.prefillPartner;
  const returnUrl = location.state?.returnUrl;
  const fromClient = location.state?.fromClient || !!propPrefillClient;
  const fromPartner = location.state?.fromPartner;

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [originalEventData, setOriginalEventData] = useState(null);

  // Custom hooks
  const {
    formData,
    setFormData,
    selectedClient,
    setSelectedClient,
    clients,
    setClients,
    partners,
    venueSpaces,
    existingEvents,
    loading,
    setLoading,
    fetchLoading,
    errors,
    setErrors,
    warnings,
    setWarnings,
    handleChange,
    handleSelectClient,
  } = useEventForm(eventId, isEditMode);

  const { validateStep } = useFormValidation();

  // Fetch and store original event data when editing
  useEffect(() => {
    if (isEditMode && eventId && !originalEventData) {
      const fetchEventData = async () => {
        try {
          const response = await eventService.getById(eventId);
          const event = response?.data || response?.event || response;
          setOriginalEventData(event);
          console.log("📦 Stored original event data:", event);
        } catch (error) {
          console.error("Error fetching original event:", error);
        }
      };
      fetchEventData();
    }
  }, [isEditMode, eventId, originalEventData]);

  // Draft management
  useEffect(() => {
    if (!isEditMode && !eventId) {
      const draft = localStorage.getItem("eventFormDraft");
      if (draft) {
        try {
          const { formData: savedData, currentStep: savedStep, timestamp } = JSON.parse(draft);
          const draftAge = Date.now() - new Date(timestamp).getTime();
          const oneDayMs = 24 * 60 * 60 * 1000;

          if (draftAge < oneDayMs) {
            setDraftData({ savedData, savedStep, timestamp });
            setShowDraftModal(true);
          }
        } catch (error) {
          console.error("Error loading draft:", error);
        }
      }
    }
  }, [isEditMode, eventId]);

  useEffect(() => {
    if (!isEditMode && formData.title && currentStep > 1) {
      const draftData = {
        formData,
        currentStep,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("eventFormDraft", JSON.stringify(draftData));
    }
  }, [formData, currentStep, isEditMode]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem("eventFormDraft");
    setDraftData(null);
    setShowDraftModal(false);
  }, []);

  const restoreDraft = useCallback(() => {
    if (draftData) {
      setFormData(draftData.savedData);
      setCurrentStep(draftData.savedStep);
      clearDraft();
      toast.success(t('eventForm.messages.draftRestored'));
    }
  }, [draftData, setFormData, clearDraft, t]);

  // Prefill effects
  useEffect(() => {
    if (!isEditMode && prefillClient && prefillClient._id) {
      setSelectedClient(prefillClient._id);
      setFormData((prev) => ({ ...prev, clientId: prefillClient._id }));
      toast.success(t('eventForm.messages.clientPreselected', { name: prefillClient.name }));
    }
  }, [prefillClient, isEditMode, setFormData, setSelectedClient, t]);

  useEffect(() => {
    if (!isEditMode && prefillPartner && prefillPartner._id && partners.length > 0) {
      const partner = partners.find((p) => p._id === prefillPartner._id);
      if (partner) {
        const newPartner = {
          partner: partner._id,
          partnerName: partner.name,
          service: partner.category || t('eventForm.step3.servicePartners'),
          category: partner.category,
          priceType: partner.priceType || "fixed",
          rate: partner.priceType === "fixed" ? partner.fixedRate : partner.hourlyRate,
          hours: partner.priceType === "hourly" ? 1 : 0,
          cost: partner.priceType === "fixed" ? (partner.fixedRate || 0) : (partner.hourlyRate || 0),
          status: "confirmed",
        };

        setFormData((prev) => ({
          ...prev,
          partners: [newPartner],
        }));
        toast.success(t('eventForm.messages.partnerPreselected', { name: partner.name }));
      }
    }
  }, [prefillPartner, partners, isEditMode, setFormData, t]);

  useEffect(() => {
    if (initialDate && !isEditMode) {
      const localDate = new Date(
        initialDate.getFullYear(),
        initialDate.getMonth(),
        initialDate.getDate()
      );

      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, "0");
      const day = String(localDate.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      setFormData((prev) => ({
        ...prev,
        startDate: dateString,
        endDate: dateString,
      }));
      toast.success(t('eventForm.messages.datePreselected', { date: dateString }));
    }
  }, [initialDate, isEditMode, setFormData, t]);

  // Auto-update venue base price
  useEffect(() => {
    if (!formData.venueSpaceId || !venueSpaces.length) return;

    const space = venueSpaces.find((s) => s._id === formData.venueSpaceId);
    if (!space || !space.basePrice) return;

    const numericBasePrice = Number(space.basePrice) || 0;

    setFormData((prev) => {
      if (prev.pricing.basePrice === numericBasePrice) return prev;
      return {
        ...prev,
        pricing: { ...prev.pricing, basePrice: numericBasePrice },
      };
    });
  }, [formData.venueSpaceId, venueSpaces, setFormData]);

  // Validation warnings
  useEffect(() => {
    if (!formData.venueSpaceId || !formData.guestCount || !venueSpaces.length) {
      setWarnings((prev) => {
        const newWarnings = { ...prev };
        delete newWarnings.guestCount;
        return newWarnings;
      });
      return;
    }

    const space = venueSpaces.find((s) => s._id === formData.venueSpaceId);
    if (!space?.capacity) {
      setWarnings((prev) => {
        const newWarnings = { ...prev };
        delete newWarnings.guestCount;
        return newWarnings;
      });
      return;
    }

    const capacityMin = space.capacity.min || 0;
    const capacityMax = space.capacity.max || 0;
    const guestCount = parseInt(formData.guestCount);

    if (isNaN(guestCount)) {
      setWarnings((prev) => {
        const newWarnings = { ...prev };
        delete newWarnings.guestCount;
        return newWarnings;
      });
      return;
    }

    setWarnings((prev) => {
      const newWarnings = { ...prev };

      if (capacityMax && guestCount > capacityMax) {
        newWarnings.guestCount = {
          type: "error",
          message: t('eventForm.step3.warnings.guestCountExceeds', { 
            count: guestCount, 
            max: capacityMax 
          }),
        };
      } else if (capacityMin && guestCount < capacityMin) {
        newWarnings.guestCount = {
          type: "warning",
          message: t('eventForm.step3.warnings.guestCountBelow', { 
            count: guestCount, 
            min: capacityMin 
          }),
        };
      } else {
        delete newWarnings.guestCount;
      }

      return newWarnings;
    });
  }, [formData.venueSpaceId, formData.guestCount, venueSpaces, setWarnings, t]);

  // Date conflict check
  useEffect(() => {
    if (
      !formData.venueSpaceId ||
      !formData.startDate ||
      !formData.startTime ||
      !existingEvents.length
    ) {
      setWarnings((prev) => {
        const newWarnings = { ...prev };
        delete newWarnings.dateConflict;
        return newWarnings;
      });
      return;
    }

    const conflictingEvents = existingEvents.filter((event) => {
      if (event._id === eventId) return false;

      const eventVenueSpaceId = event.venueSpaceId?._id || event.venueSpaceId;
      if (eventVenueSpaceId !== formData.venueSpaceId) return false;

      try {
        const eventStart = new Date(
          `${formData.startDate}T${formData.startTime || "00:00"}`
        );
        const eventEnd = new Date(
          `${formData.endDate || formData.startDate}T${formData.endTime || "23:59"}`
        );
        const existingStart = new Date(`${event.startDate}T${event.startTime || "00:00"}`);
        const existingEnd = new Date(`${event.endDate}T${event.endTime || "23:59"}`);

        return eventStart < existingEnd && eventEnd > existingStart;
      } catch (error) {
        return false;
      }
    });

    setWarnings((prev) => {
      const newWarnings = { ...prev };

      if (conflictingEvents.length > 0) {
        newWarnings.dateConflict = {
          type: "error",
          message: t('eventForm.step3.warnings.dateConflict', { count: conflictingEvents.length }),
          conflicts: conflictingEvents,
        };
      } else {
        delete newWarnings.dateConflict;
      }

      return newWarnings;
    });
  }, [
    formData.venueSpaceId,
    formData.startDate,
    formData.endDate,
    formData.startTime,
    formData.endTime,
    existingEvents,
    eventId,
    setWarnings,
    t,
  ]);

  // Price calculations
  const calculateEventHours = useCallback(() => {
    try {
      if (!formData.startDate || !formData.endDate) return 1;
      const startTime = formData.startTime || "00:00";
      const endTime = formData.endTime || "00:00";
      const start = new Date(`${formData.startDate}T${startTime}:00`);
      const end = new Date(`${formData.endDate}T${endTime}:00`);
      const diffMs = end.getTime() - start.getTime();
      if (!isFinite(diffMs) || diffMs <= 0) return 1;
      const hours = Math.ceil(diffMs / (1000 * 60 * 60));
      return Math.max(1, hours);
    } catch {
      return 1;
    }
  }, [formData.startDate, formData.endDate, formData.startTime, formData.endTime]);

  const { venuePrice, partnersTotal, totalPrice, partnersDetails } = useMemo(() => {
    const rawBasePrice = formData.pricing.basePrice;
    const basePrice =
      rawBasePrice === "" || rawBasePrice === null || rawBasePrice === undefined
        ? 0
        : parseFloat(rawBasePrice) || 0;

    const eventHours = calculateEventHours();

    const partnersWithCosts = formData.partners.map((partner) => {
      let cost = 0;
      
      if (partner.priceType === "hourly") {
        const hours = parseFloat(partner.hours) || eventHours;
        const rate = parseFloat(partner.rate) || 0;
        cost = hours * rate;
      } else {
        cost = parseFloat(partner.cost) || 0;
      }

      return {
        ...partner,
        calculatedCost: cost,
        displayHours: partner.priceType === "hourly" ? (partner.hours || eventHours) : undefined,
      };
    });

    const partnersCost = partnersWithCosts.reduce(
      (total, partner) => total + partner.calculatedCost,
      0
    );

    let discountAmount = 0;
    if (formData.pricing.discount) {
      const discountValue = parseFloat(formData.pricing.discount) || 0;
      if (formData.pricing.discountType === "percentage") {
        discountAmount = (basePrice + partnersCost) * (discountValue / 100);
      } else {
        discountAmount = discountValue;
      }
    }

    const total = Math.max(0, basePrice + partnersCost - discountAmount);

    return {
      venuePrice: basePrice,
      partnersTotal: partnersCost,
      totalPrice: total,
      partnersDetails: partnersWithCosts,
    };
  }, [
    formData.pricing.basePrice,
    formData.pricing.discount,
    formData.pricing.discountType,
    formData.partners,
    calculateEventHours,
  ]);

  // Handlers
  const handleCreateClient = useCallback(
    async (newClient) => {
      if (!newClient.name.trim()) {
        toast.error(t('eventForm.messages.clientNameRequired'));
        return;
      }

      if (newClient.email && !/^\S+@\S+\.\S+$/.test(newClient.email)) {
        toast.error(t('eventForm.messages.validEmailRequired'));
        return;
      }

      try {
        const response = await clientService.create(newClient);
        const createdClient = response?.client || response?.data || response;

        if (!createdClient?._id) {
          throw new Error("Invalid response from server");
        }

        setClients((prev) => [...prev, createdClient]);
        setSelectedClient(createdClient._id);
        setFormData((prev) => ({ ...prev, clientId: createdClient._id }));

        toast.success(t('eventForm.messages.clientCreated', { name: createdClient.name }));
      } catch (error) {
        console.error("Error creating client:", error);
        toast.error(error.response?.data?.message || t('eventForm.messages.clientCreationFailed'));
        throw error;
      }
    },
    [setClients, setSelectedClient, setFormData, t]
  );

  const handleAddPartner = useCallback(
    (partnerData) => {
      const fullPartner = partners.find((p) => p._id === partnerData.partner);
      
      if (!fullPartner) {
        toast.error(t('eventForm.messages.partnerNotFound'));
        return;
      }

      const newPartner = {
        partner: fullPartner._id,
        partnerName: fullPartner.name,
        service: partnerData.service || fullPartner.category,
        category: fullPartner.category,
        priceType: fullPartner.priceType || "fixed",
        rate: fullPartner.priceType === "fixed" 
          ? fullPartner.fixedRate 
          : fullPartner.hourlyRate,
        hours: fullPartner.priceType === "hourly" ? (partnerData.hours || 1) : 0,
        cost: fullPartner.priceType === "fixed" 
          ? (fullPartner.fixedRate || 0)
          : ((partnerData.hours || 1) * (fullPartner.hourlyRate || 0)),
        status: partnerData.status || "pending",
      };

      setFormData((prev) => ({
        ...prev,
        partners: [...prev.partners, newPartner],
      }));
      
      toast.success(t('eventForm.messages.partnerAdded', { name: fullPartner.name }));
    },
    [partners, setFormData, t]
  );

  const handleUpdatePartner = useCallback(
    (index, field, value) => {
      setFormData((prev) => {
        const updatedPartners = [...prev.partners];
        const partner = { ...updatedPartners[index] };

        partner[field] = value;

        if (field === "hours" && partner.priceType === "hourly") {
          const hours = parseFloat(value) || 0;
          partner.cost = (partner.rate || 0) * hours;
        }

        if (field === "cost" && partner.priceType === "fixed") {
          partner.cost = parseFloat(value) || 0;
        }

        updatedPartners[index] = partner;
        return { ...prev, partners: updatedPartners };
      });
    },
    [setFormData]
  );

  const handleRemovePartner = useCallback(
    (index) => {
      const partner = formData.partners[index];
      setFormData((prev) => ({
        ...prev,
        partners: prev.partners.filter((_, i) => i !== index),
      }));
      toast.success(t('eventForm.messages.partnerRemoved', { name: partner.partnerName }));
    },
    [formData.partners, setFormData, t]
  );

  // Navigation
  const nextStep = useCallback(() => {
    const validationErrors = validateStep(currentStep, formData, selectedClient);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    } else {
      toast.error(t('eventForm.messages.fixErrors'));
    }
  }, [currentStep, formData, selectedClient, validateStep, setErrors, t]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const jumpToStep = useCallback(
    (step) => {
      if (step < currentStep) {
        setCurrentStep(step);
      } else if (step === currentStep + 1) {
        nextStep();
      }
    },
    [currentStep, nextStep]
  );

  // Quick save handler
  const handleQuickSave = useCallback(
    async (e) => {
      e.preventDefault();

      if (!isEditMode) {
        toast.error(t('eventForm.messages.quickSaveEditOnly'));
        return;
      }

      const validationErrors = validateStep(currentStep, formData, selectedClient);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        toast.error(t('eventForm.messages.fixStepErrors'));
        return;
      }

      try {
        setLoading(true);

        const submitData = {
          ...formData,
          venueId: originalEventData?.venueId,
          guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
          pricing: {
            basePrice: venuePrice,
            discount: formData.pricing.discount
              ? parseFloat(formData.pricing.discount)
              : 0,
            discountType: formData.pricing.discountType,
            totalAmount: totalPrice,
          },
          partners: formData.partners.map((p) => ({
            partner: p.partner,
            service: p.service,
            cost: p.priceType === "hourly" 
              ? (p.hours || 0) * (p.rate || 0)
              : (p.cost || 0),
            hours: p.priceType === "hourly" ? p.hours : undefined,
            status: p.status,
          })),
        };

        delete submitData.payment;
        delete submitData.createInvoice;

        console.log("📤 Quick Save Submission:", submitData);

        const response = await eventService.update(eventId, submitData);
        toast.success(t('eventForm.messages.eventUpdated'));

        if (onSuccess) {
          onSuccess(response);
        }

        if (onClose) {
          onClose();
        } else if (returnUrl) {
          navigate(returnUrl);
        } else {
          navigate("/events");
        }
      } catch (error) {
        console.error("Error updating event:", error);
        toast.error(error.response?.data?.message || t('eventForm.messages.updateFailed'));
      } finally {
        setLoading(false);
      }
    },
    [
      isEditMode,
      currentStep,
      formData,
      selectedClient,
      venuePrice,
      totalPrice,
      eventId,
      originalEventData,
      validateStep,
      setErrors,
      setLoading,
      onSuccess,
      onClose,
      returnUrl,
      navigate,
      t,
    ]
  );

  // Main submit handler
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (currentStep < TOTAL_STEPS) {
        nextStep();
        return;
      }

      const validationErrors = validateStep(currentStep, formData, selectedClient);
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        toast.error(t('eventForm.messages.fixFormErrors'));
        return;
      }

      try {
        setLoading(true);

        const submitData = {
          ...formData,
          venueId: isEditMode ? originalEventData?.venueId : undefined,
          guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
          pricing: {
            basePrice: venuePrice,
            discount: formData.pricing.discount
              ? parseFloat(formData.pricing.discount)
              : 0,
            discountType: formData.pricing.discountType,
            totalAmount: totalPrice,
          },
          partners: formData.partners.map((p) => ({
            partner: p.partner,
            service: p.service,
            cost: p.priceType === "hourly" 
              ? (p.hours || 0) * (p.rate || 0)
              : (p.cost || 0),
            hours: p.priceType === "hourly" ? p.hours : undefined,
            status: p.status,
          })),
        };

        delete submitData.payment;
        delete submitData.createInvoice;

        console.log("📤 Full Submit:", submitData);

        let response;
        if (isEditMode) {
          response = await eventService.update(eventId, submitData);
          toast.success(t('eventForm.messages.eventUpdated'));
        } else {
          response = await eventService.create(submitData);
          toast.success(t('eventForm.messages.eventCreated'));
          clearDraft();
        }

        const createdEvent = response.event || response.data || response;
        const finalEventId = createdEvent._id || eventId;

        // Payment logic
        if (formData.payment.amount && parseFloat(formData.payment.amount) > 0) {
          try {
            const paymentData = {
              event: finalEventId,
              client: formData.clientId,
              amount: parseFloat(formData.payment.amount),
              method: formData.payment.paymentMethod,
              status: formData.payment.status,
              description: formData.payment.notes || "Initial event payment",
              paidDate: formData.payment.paymentDate,
              type: "income",
            };

            await paymentService.create(paymentData);
            toast.success(t('eventForm.messages.paymentRecorded'));
          } catch (paymentError) {
            console.error("Error creating payment:", paymentError);
            toast.error(t('eventForm.messages.paymentFailed'));
          }
        }

        if (onSuccess) {
          onSuccess(response);
        } else if (returnUrl) {
          navigate(returnUrl);
        } else {
          navigate("/events");
        }

        if (onClose) onClose();
      } catch (error) {
        console.error("Error saving event:", error);
        const errorMessage = error.response?.data?.message || 
          t(isEditMode ? 'eventForm.messages.updateFailed' : 'eventForm.messages.createFailed');
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [
      currentStep,
      formData,
      selectedClient,
      venuePrice,
      totalPrice,
      isEditMode,
      eventId,
      originalEventData,
      nextStep,
      validateStep,
      setErrors,
      setLoading,
      clearDraft,
      onSuccess,
      returnUrl,
      navigate,
      onClose,
      t,
    ]
  );

  const handleClose = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      type: "",
      venueSpaceId: "",
      clientId: "",
      sameDayEvent: true,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      guestCount: "",
      status: "pending",
      pricing: { basePrice: "", discount: "", discountType: "fixed" },
      partners: [],
      notes: "",
      payment: {
        amount: "",
        paymentMethod: "cash",
        paymentDate: new Date().toISOString().split("T")[0],
        status: "pending",
        notes: "",
      },
      createInvoice: false,
    });
    setErrors({});
    setWarnings({});
    setCurrentStep(1);
    setSelectedClient(null);

    if (isModal && onClose) {
      onClose();
    } else if (returnUrl) {
      navigate(returnUrl);
    } else {
      navigate("/events");
    }
  }, [isModal, onClose, returnUrl, navigate, setFormData, setErrors, setWarnings, setSelectedClient]);

  // Render step content
  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <Step1EventDetails
            formData={formData}
            handleChange={handleChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <Step2ClientSelection
            formData={formData}
            selectedClient={selectedClient}
            handleSelectClient={handleSelectClient}
            clients={clients}
            errors={errors}
            onCreateClient={handleCreateClient}
          />
        );
      case 3:
        return (
          <Step3VenuePricing
            formData={formData}
            handleChange={handleChange}
            venueSpaces={venueSpaces}
            partners={partners}
            errors={errors}
            warnings={warnings}
            onAddPartner={handleAddPartner}
            onUpdatePartner={handleUpdatePartner}
            onRemovePartner={handleRemovePartner}
            calculateEventHours={calculateEventHours}
          />
        );
      case 4:
        return (
          <Step4Payment
            formData={formData}
            handleChange={handleChange}
            errors={errors}
            totalPrice={totalPrice}
          />
        );
      case 5:
        return (
          <Step5Review
            formData={formData}
            handleChange={handleChange}
            clients={clients}
            venueSpaces={venueSpaces}
            partners={partners}
            totalPrice={totalPrice}
            venuePrice={venuePrice}
            partnersTotal={partnersTotal}
            partnersDetails={partnersDetails}
            isEditMode={isEditMode}
          />
        );
      default:
        return null;
    }
  }, [
    currentStep,
    formData,
    handleChange,
    errors,
    selectedClient,
    handleSelectClient,
    clients,
    venueSpaces,
    partners,
    warnings,
    totalPrice,
    venuePrice,
    partnersTotal,
    partnersDetails,
    isEditMode,
    handleCreateClient,
    handleAddPartner,
    handleUpdatePartner,
    handleRemovePartner,
    calculateEventHours,
  ]);

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('eventForm.messages.loading')}</p>
        </div>
      </div>
    );
  }

  const formContent = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <FormHeader
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        isEditMode={isEditMode}
        prefillClient={prefillClient}
        prefillPartner={prefillPartner}
        returnUrl={returnUrl}
        onStepClick={jumpToStep}
      />

      <div className="p-6 max-h-[60vh] overflow-y-auto hide-scrollbar">
        {renderStepContent()}
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              icon={ChevronLeft}
              onClick={prevStep}
            >
              {t('eventForm.buttons.previous')}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {currentStep >= 3 && (
            <div className="text-right px-4 py-2 bg-white dark:bg-gray-600 rounded-lg shadow">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {t('eventForm.totalAmount')}
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {totalPrice.toFixed(2)} {t('eventForm.currency')}
              </div>
            </div>
          )}
          
          {isEditMode && currentStep < TOTAL_STEPS && (
            <Button
              type="button"
              variant="outline"
              icon={Save}
              loading={loading}
              onClick={handleQuickSave}
            >
              {t('eventForm.buttons.saveChanges')}
            </Button>
          )}
          
          {currentStep < TOTAL_STEPS ? (
            <Button type="button" variant="primary" icon={ChevronRight} onClick={nextStep}>
              {t('eventForm.buttons.continue')}
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              loading={loading}
              onClick={handleSubmit}
            >
              {isEditMode
                ? t('eventForm.buttons.updateEvent')
                : fromClient
                ? t('eventForm.buttons.createForClient', { name: prefillClient?.name })
                : fromPartner
                ? t('eventForm.buttons.createWithPartner', { name: prefillPartner?.name })
                : t('eventForm.buttons.createEvent')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <>
        {showDraftModal && draftData && (
          <DraftRestoreModal
            draftData={draftData}
            onRestore={restoreDraft}
            onDiscard={clearDraft}
          />
        )}

        <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
              onClick={handleClose}
            ></div>
            <div className="relative inline-block align-middle w-full max-w-4xl">
              <div className="transform transition-all animate-in zoom-in-95 duration-300">
                {formContent}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {showDraftModal && draftData && (
        <DraftRestoreModal
          draftData={draftData}
          onRestore={restoreDraft}
          onDiscard={clearDraft}
        />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">{formContent}</div>
        </div>
      </div>

      <PriceSummary
        venuePrice={venuePrice}
        partners={partnersDetails.map((p) => ({
          partnerName: p.partnerName,
          service: p.service,
          category: p.category,
          cost: p.calculatedCost,
          priceType: p.priceType,
          hours: p.displayHours,
          rate: p.rate,
        }))}
        partnersTotal={partnersTotal}
        discount={parseFloat(formData.pricing.discount) || 0}
        discountType={formData.pricing.discountType}
        totalPrice={totalPrice}
        visible={currentStep >= 3 && formData.venueSpaceId}
      />
    </>
  );
};

export default EventForm;