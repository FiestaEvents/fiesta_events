import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Save,
  DollarSign,
  Calendar,
  FileText,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

// ✅ API & Services
import { paymentService, eventService, clientService } from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// ✅ Utils & Hooks
import { useToast } from "../../hooks/useToast";

const PaymentForm = ({ payment, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();
  const { apiError, showError } = useToast();

  const isEditMode = !!payment || Boolean(id);
  const isModalMode = Boolean(onSuccess && onCancel);

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    method: "cash",
    status: "pending",
    reference: "",
    description: "",
    dueDate: "",
    paidDate: "",
    event: "",
    client: "",
    fees: { processingFee: "", platformFee: "", otherFees: "" },
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState({});

  // --- Helper: Load Payment Data ---
  const loadPaymentData = useCallback((data) => {
    if (!data) return;
    setFormData({
      type: data.type || "income",
      amount: data.amount?.toString() || "",
      method: data.method || "cash",
      status: data.status || "pending",
      reference: data.reference || "",
      description: data.description || "",
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split("T")[0] : "",
      paidDate: data.paidDate ? new Date(data.paidDate).toISOString().split("T")[0] : "",
      event: data.event?._id || data.event || "",
      client: data.client?._id || data.client || "",
      fees: {
        processingFee: data.fees?.processingFee?.toString() || "",
        platformFee: data.fees?.platformFee?.toString() || "",
        otherFees: data.fees?.otherFees?.toString() || "",
      },
    });
  }, []);

  // --- Effects ---

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingData(true);
        const [eventsRes, clientsRes] = await Promise.all([
          eventService.getAll(),
          clientService.getAll(),
        ]);

        const eventsList = eventsRes?.events || eventsRes?.data || [];
        const clientsList = clientsRes?.clients || clientsRes?.data || [];

        setEvents(eventsList);
        setFilteredEvents(eventsList);
        setClients(clientsList);
      } catch (error) {
        apiError(error, t('payments.notifications.loadOptionsError'));
      } finally {
        setLoadingData(false);
      }
    };
    fetchOptions();
  }, [apiError, t]);

  useEffect(() => {
    const initForm = async () => {
      if (isEditMode) {
        if (payment) {
          loadPaymentData(payment);
        } else if (id) {
          try {
            setLoadingData(true);
            const res = await paymentService.getById(id);
            loadPaymentData(res.payment || res);
          } catch (err) {
            apiError(err, t('payments.notifications.loadError'));
            if (!isModalMode) navigate("/payments");
          } finally {
            setLoadingData(false);
          }
        }
      }
    };
    initForm();
  }, [isEditMode, payment, id, loadPaymentData, apiError, t, navigate, isModalMode]);

  useEffect(() => {
    if (formData.client) {
      if (events.length > 0) {
        const clientEvents = events.filter(e => {
          const cId = e.clientId?._id || e.clientId || e.client?._id || e.client;
          return cId === formData.client;
        });
        setFilteredEvents(clientEvents);
      }
    } else {
      setFilteredEvents(events);
    }
  }, [formData.client, events]);

  // --- Handlers ---

  const handleChange = (name, value) => {
    if (name.startsWith("fees.")) {
      const field = name.split(".")[1];
      setFormData(p => ({ ...p, fees: { ...p.fees, [field]: value } }));
    } else {
      setFormData(p => ({ ...p, [name]: value }));
    }
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleClientChange = (e) => {
    handleChange("client", e.target.value);
    handleChange("event", "");
  };

  const handleEventChange = (e) => {
    const evtId = e.target.value;
    handleChange("event", evtId);
    if (evtId) {
      const evt = events.find(ev => ev._id === evtId);
      const cId = evt?.clientId?._id || evt?.clientId || evt?.client?._id || evt?.client;
      if (cId) handleChange("client", cId);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = t('payments.form.errors.amountRequired');
      if (!formData.method) newErrors.method = t('payments.form.errors.methodRequired');
      if (!formData.type) newErrors.type = t('payments.form.errors.typeRequired');
    }
    if (step === 3) {
      if (formData.paidDate && formData.dueDate && new Date(formData.paidDate) < new Date(formData.dueDate)) {
        newErrors.paidDate = t('payments.form.errors.paidDateBeforeDue');
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation Logic
  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validateStep(currentStep)) {
        setCurrentStep(p => Math.min(p + 1, totalSteps));
    } else {
        showError(t('payments.form.errors.fixErrors'));
    }
  };

  const handlePrevious = (e) => {
    if (e) e.preventDefault();
    setCurrentStep(p => Math.max(p - 1, 1));
  };
  
  const handleStepClick = (step) => {
      if (step < currentStep || validateStep(currentStep)) setCurrentStep(step);
  };

  // Submit Logic
  const submitData = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        fees: {
          processingFee: parseFloat(formData.fees.processingFee) || 0,
          platformFee: parseFloat(formData.fees.platformFee) || 0,
          otherFees: parseFloat(formData.fees.otherFees) || 0,
        }
      };

      // Remove empty optionals
      if (!payload.reference) delete payload.reference;
      if (!payload.description) delete payload.description;
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.paidDate) delete payload.paidDate;
      if (!payload.event) delete payload.event;
      if (!payload.client) delete payload.client;

      if (isEditMode) {
        await paymentService.update(payment?._id || id, payload);
      } else {
        await paymentService.create(payload);
      }

      // Parent handles success UI
      if (onSuccess) onSuccess();
      else navigate("/payments");

    } catch (error) {
      apiError(error, t('payments.notifications.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // If not on last step, treat as Next
    if (currentStep < totalSteps) {
      handleNext(e);
      return;
    }
    // If on last step, validate and submit
    if (!validateStep(4)) return showError(t('payments.form.errors.fixAllErrors'));
    await submitData();
  };

  const handleQuickUpdate = async (e) => {
    e.preventDefault();
    if (!validateStep(1)) {
      setCurrentStep(1); 
      return showError(t('payments.form.errors.fixErrors'));
    }
    await submitData();
  };

  // --- Step Config ---
  const steps = [
    { number: 1, title: t('payments.steps.basicInfo'), icon: DollarSign },
    { number: 2, title: t('payments.steps.relatedInfo'), icon: Users },
    { number: 3, title: t('payments.steps.dates'), icon: Calendar },
    { number: 4, title: t('payments.steps.feesReview'), icon: FileText },
  ];

  if (loadingData) return <div className="flex h-96 justify-center items-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="p-6 bg-white dark:bg-[#1f2937] rounded-lg shadow-sm">
      
      {!isModalMode && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? t('payments.form.editTitle') : t('payments.form.createTitle')}
          </h1>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex justify-between mb-8 px-4">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-100 dark:bg-gray-700 -z-10" />
        
        {steps.map((step, idx) => {
          const isActive = step.number === currentStep;
          const isDone = step.number < currentStep;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 cursor-pointer ${
                  isActive 
                    ? "bg-orange-600 border-orange-600 text-white shadow-lg scale-110" 
                    : isDone 
                      ? "bg-green-500 border-green-500 text-white" 
                      : "bg-white border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                }`}
                onClick={() => handleStepClick(step.number)}
              >
                {isDone ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-medium mt-2 ${isActive ? "text-orange-600" : "text-gray-500"}`}>
                {step.title}
              </span>
              {idx < steps.length - 1 && (
                <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-10 ${
                  isDone ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                }`} style={{ width: "calc(100% * 4)" }} />
              )} 
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="flex-1 mt-4 mb-8">
            {/* STEP 1: Basic Info */}
            {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
                <Select
                    label={t('payments.form.type')}
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    options={[
                        { value: "income", label: t('payments.types.income') },
                        { value: "expense", label: t('payments.types.expense') }
                    ]}
                    error={errors.type}
                    required
                    className="w-full"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label={t('payments.form.amount')}
                        type="number"
                        value={formData.amount}
                        onChange={(e) => handleChange("amount", e.target.value)}
                        error={errors.amount}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        icon={DollarSign}
                    />
                    <Select
                        label={t('payments.form.method')}
                        value={formData.method}
                        onChange={(e) => handleChange("method", e.target.value)}
                        error={errors.method}
                        required
                        options={[
                            { value: "cash", label: t('payments.methods.cash') },
                            { value: "card", label: t('payments.methods.card') },
                            { value: "bank_transfer", label: t('payments.methods.bank_transfer') },
                            { value: "check", label: t('payments.methods.check') },
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                        label={t('payments.form.status')}
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        options={[
                            { value: "pending", label: t('payments.statuses.pending') },
                            { value: "completed", label: t('payments.statuses.completed') },
                            { value: "failed", label: t('payments.statuses.failed') },
                        ]}
                    />
                    <Input
                        label={t('payments.form.reference')}
                        value={formData.reference}
                        onChange={(e) => handleChange("reference", e.target.value)}
                        placeholder="REF-001"
                    />
                </div>

                <Textarea
                    label={t('payments.form.description')}
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    rows={3}
                    className="w-full"
                />
            </div>
            )}

            {/* STEP 2: Related Info */}
            {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
                <Select
                    label={t('payments.form.client')}
                    value={formData.client}
                    onChange={handleClientChange}
                    options={[
                        { value: "", label: t('payments.form.selectClient') },
                        ...clients.map(c => ({ value: c._id, label: c.name }))
                    ]}
                    className="w-full"
                />

                <Select
                    label={t('payments.form.event')}
                    value={formData.event}
                    onChange={handleEventChange}
                    options={[
                        { value: "", label: t('payments.form.selectEvent') },
                        ...filteredEvents.map(e => ({ value: e._id, label: e.title }))
                    ]}
                    className="w-full"
                />
            </div>
            )}

            {/* STEP 3: Dates */}
            {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label={t('payments.form.dueDate')}
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleChange("dueDate", e.target.value)}
                    />
                    <Input
                        label={t('payments.form.paidDate')}
                        type="date"
                        value={formData.paidDate}
                        onChange={(e) => handleChange("paidDate", e.target.value)}
                        error={errors.paidDate}
                    />
                </div>
            </div>
            )}

            {/* STEP 4: Fees */}
            {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Input
                        label={t('payments.form.fees.processingFee')}
                        type="number"
                        value={formData.fees.processingFee}
                        onChange={(e) => handleChange("fees.processingFee", e.target.value)}
                        placeholder="0.00"
                    />
                    <Input
                        label={t('payments.form.fees.platformFee')}
                        type="number"
                        value={formData.fees.platformFee}
                        onChange={(e) => handleChange("fees.platformFee", e.target.value)}
                        placeholder="0.00"
                    />
                    <Input
                        label={t('payments.form.fees.otherFees')}
                        type="number"
                        value={formData.fees.otherFees}
                        onChange={(e) => handleChange("fees.otherFees", e.target.value)}
                        placeholder="0.00"
                    />
                </div>
            </div>
            )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between pt-6 border-t border-gray-100 dark:border-gray-700 mt-auto">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4 mr-2" /> {t('common.previous')}
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={onCancel || (() => navigate("/payments"))}>
              {t('common.cancel')}
            </Button>
          )}

          <div className="flex gap-3">
            {/* Quick Save Button */}
            {isEditMode && currentStep < totalSteps && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleQuickUpdate} 
                loading={loading}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <Save className="w-4 h-4 mr-2" /> {t('common.saveChanges')}
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button type="button" variant="primary" onClick={handleNext} className="px-6">
                <span className="flex items-center">{t('common.next')} <ChevronRight className="w-4 h-4 ml-2" /></span>
              </Button>
            ) : (
              <Button type="submit" variant="primary" loading={loading} icon={Save} className="px-6">
                {isEditMode ? t('payments.form.update') : t('payments.form.create')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;