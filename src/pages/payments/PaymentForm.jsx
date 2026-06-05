import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Save,
  Banknote,
  Calendar,
  FileText,
  Users,
  ChevronRight,
  ChevronLeft,
  Check,
  Hash,
  Receipt,
} from "lucide-react";

//  API & Services
import {
  paymentService,
  eventService,
  clientService,
  invoiceService,
} from "../../api/index";

//  Generic Components
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import OrbitLoader from "../../components/common/LoadingSpinner";

//  Utils & Hooks
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
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    type: "income",
    amount: "",
    method: "cash",
    status: "completed", // Default to completed for quick entry
    reference: "",
    description: "",
    dueDate: "",
    paidDate: new Date().toISOString().split("T")[0], // Default to today
    eventId: "",
    clientId: "",
    invoiceId: "", //  New field
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Options Data
  const [events, setEvents] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Filtered Options
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);

  const [errors, setErrors] = useState({});

  // --- Helper: Generate Reference ---
  const generateReference = () => {
    return `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
  };

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
      dueDate: data.dueDate
        ? new Date(data.dueDate).toISOString().split("T")[0]
        : "",
      paidDate: data.paidDate
        ? new Date(data.paidDate).toISOString().split("T")[0]
        : "",
      eventId: data.event?._id || data.eventId || "",
      clientId: data.client?._id || data.clientId || "",
      invoiceId: data.invoice?._id || data.invoiceId || "",
    });
  }, []);

  // --- Effects ---
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoadingData(true);
        const [eventsRes, clientsRes, invoicesRes] = await Promise.all([
          eventService.getAll(),
          clientService.getAll(),
          invoiceService.getAll({ status: "sent,overdue" }), // Fetch unpaid invoices ideally
        ]);

        const eventsList = eventsRes?.events || eventsRes?.data || [];
        const clientsList = clientsRes?.clients || clientsRes?.data || [];
        const invoicesList = invoicesRes?.invoices || invoicesRes?.data || [];

        setEvents(eventsList);
        setClients(clientsList);
        setInvoices(invoicesList);

        setFilteredEvents(eventsList);
        setFilteredInvoices(invoicesList);
      } catch (error) {
        apiError(error, t("payments.notifications.loadOptionsError"));
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
            apiError(err, t("payments.notifications.loadError"));
            if (!isModalMode) navigate("/payments");
          } finally {
            setLoadingData(false);
          }
        }
      } else {
        //  Auto-generate reference for new payments
        setFormData((prev) => ({ ...prev, reference: generateReference() }));
      }
    };
    initForm();
  }, [
    isEditMode,
    payment,
    id,
    loadPaymentData,
    apiError,
    t,
    navigate,
    isModalMode,
  ]);

  // Filter Logic based on Client Selection
  useEffect(() => {
    if (formData.clientId) {
      // Filter Events
      const clientEvents = events.filter((e) => {
        const cId = e.clientId?._id || e.clientId || e.client?._id || e.client;
        return cId === formData.clientId;
      });
      setFilteredEvents(clientEvents);

      // Filter Invoices
      const clientInvoices = invoices.filter((inv) => {
        const cId = inv.client?._id || inv.client;
        return cId === formData.clientId;
      });
      setFilteredInvoices(clientInvoices);
    } else {
      setFilteredEvents(events);
      setFilteredInvoices(invoices);
    }
  }, [formData.clientId, events, invoices]);

  // --- Handlers ---
  const handleChange = (name, value) => {
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  //  Smart Handler: When Invoice is selected
  const handleInvoiceChange = (invoiceId) => {
    handleChange("invoiceId", invoiceId);

    if (invoiceId) {
      const inv = invoices.find((i) => (i._id || i.id) === invoiceId);
      if (inv) {
        // Auto-fill related fields
        const cId = inv.client?._id || inv.client;
        const eId = inv.event?._id || inv.event;

        // Auto-fill Client
        if (cId) handleChange("clientId", cId);
        // Auto-fill Event
        if (eId) handleChange("eventId", eId);
        // Auto-fill Amount (if empty)
        if (!formData.amount)
          handleChange("amount", inv.totalAmount || inv.amount);
        // Auto-fill Description
        if (!formData.description)
          handleChange("description", `Payment for ${inv.invoiceNumber}`);
      }
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.amount || parseFloat(formData.amount) <= 0)
        newErrors.amount = t("payments.form.errors.amountRequired");
      if (!formData.method)
        newErrors.method = t("payments.form.errors.methodRequired");
      if (!formData.type)
        newErrors.type = t("payments.form.errors.typeRequired");
    }
    if (step === 2) {
      // Ensure at least one link exists
      if (!formData.clientId && !formData.eventId && !formData.invoiceId) {
        newErrors.client = t("payments.form.errors.clientOrEventRequired");
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (validateStep(currentStep))
      setCurrentStep((p) => Math.min(p + 1, totalSteps));
    else showError(t("payments.form.errors.fixErrors"));
  };

  const handlePrevious = (e) => {
    if (e) e.preventDefault();
    setCurrentStep((p) => Math.max(p - 1, 1));
  };

  const submitData = async () => {
    try {
      setLoading(true);

      const payload = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
      };

      if (formData.reference) payload.reference = formData.reference;
      if (formData.description) payload.description = formData.description;
      if (formData.dueDate) payload.dueDate = formData.dueDate;
      if (formData.paidDate) payload.paidDate = formData.paidDate;

      if (formData.clientId) payload.clientId = formData.clientId;
      if (formData.eventId) payload.eventId = formData.eventId;
      if (formData.invoiceId) payload.invoiceId = formData.invoiceId;

      if (isEditMode) {
        await paymentService.update(payment?._id || id, payload);
      } else {
        await paymentService.create(payload);
      }

      if (onSuccess) onSuccess();
      else navigate("/payments");
    } catch (error) {
      apiError(error, t("payments.notifications.saveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      handleNext(e);
      return;
    }
    await submitData();
  };

  // --- Step Config ---
  const steps = [
    { number: 1, title: t("payments.steps.basicInfo"), icon: Banknote },
    { number: 2, title: t("payments.steps.relatedInfo"), icon: Users },
    { number: 3, title: t("payments.steps.dates"), icon: Calendar },
  ];

  if (loadingData)
    return (
      <div className="flex h-96 justify-center items-center">
        <OrbitLoader />
      </div>
    );

  return (
    <div className="p-0 bg-white dark:bg-gray-900 rounded-lg">
      {!isModalMode && (
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          {isEditMode
            ? t("payments.form.editTitle")
            : t("payments.form.createTitle")}
        </h1>
      )}

      {/* Step Indicator */}
      <div className="flex justify-between mb-8 px-12  py-4 relative">
        <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isDone = step.number < currentStep;
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 ${isActive ? "bg-orange-600 border-orange-600 text-white scale-110" : isDone ? "bg-green-500 border-green-500 text-white" : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400"}`}
            >
              {isDone ? <Check size={16} /> : <Icon size={16} />}
            </div>
          );
        })}
      </div>

      {/* Step Title */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          {steps[currentStep - 1].title}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-4 min-h-[320px]">
        {/* STEP 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
              <Select
                label={t("payments.form.type")}
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                options={[
                  { value: "income", label: t("payments.types.income") },
                  { value: "expense", label: t("payments.types.expense") },
                ]}
                required
              />

              {/*  Updated: TND Label + Banknote Icon */}
              <Input
                label={`${t("payments.form.amount")} (TND)`}
                type="number"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                error={errors.amount}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                icon={Banknote}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label={t("payments.form.method")}
                value={formData.method}
                onChange={(e) => handleChange("method", e.target.value)}
                options={[
                  { value: "cash", label: t("payments.methods.cash") },
                  { value: "card", label: t("payments.methods.card") },
                  {
                    value: "bank_transfer",
                    label: t("payments.methods.bank_transfer"),
                  },
                  { value: "check", label: t("payments.methods.check") },
                ]}
              />
              <Select
                label={t("payments.form.status")}
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                options={[
                  { value: "pending", label: t("payments.statuses.pending") },
                  {
                    value: "completed",
                    label: t("payments.statuses.completed"),
                  },
                  { value: "failed", label: t("payments.statuses.failed") },
                ]}
              />
            </div>

            {/*  Updated: Reference with Icon */}
            <Input
              label={t("payments.form.reference")}
              value={formData.reference}
              onChange={(e) => handleChange("reference", e.target.value)}
              placeholder="PAY-XXXXXX"
              icon={Hash}
            />
          </div>
        )}

        {/* STEP 2: Related Info */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            {/*  Updated: Invoice Select */}
            <div className="mb-4">
              <Select
                label={
                  t("payments.form.linkInvoice") || "Link Invoice (Optional)"
                }
                value={formData.invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                options={[
                  { value: "", label: t("common.none") },
                  ...filteredInvoices.map((inv) => ({
                    value: inv._id,
                    label: `${inv.invoiceNumber} - ${inv.totalAmount} TND`,
                  })),
                ]}
                icon={Receipt}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t("payments.form.client")}
                value={formData.clientId}
                onChange={(e) => handleChange("clientId", e.target.value)}
                options={[
                  { value: "", label: t("payments.form.selectClient") },
                  ...clients.map((c) => ({ value: c._id, label: c.name })),
                ]}
                error={errors.client}
              />
              <Select
                label={t("payments.form.event")}
                value={formData.eventId}
                onChange={(e) => handleChange("eventId", e.target.value)}
                options={[
                  { value: "", label: t("payments.form.selectEvent") },
                  ...filteredEvents.map((e) => ({
                    value: e._id,
                    label: e.title,
                  })),
                ]}
              />
            </div>

            <Textarea
              label={t("payments.form.description")}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              placeholder={t("payments.form.descPlaceholder")}
            />
          </div>
        )}

        {/* STEP 3: Dates */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("payments.form.paidDate")}
                type="date"
                value={formData.paidDate}
                onChange={(e) => handleChange("paidDate", e.target.value)}
              />
              <Input
                label={t("payments.form.dueDate")}
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold mb-2 dark:text-white">
                Summary
              </h4>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Amount:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formData.amount ? `${formData.amount} TND` : "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-400">
                  Method:
                </span>
                <span className="capitalize text-gray-900 dark:text-white">
                  {formData.method}
                </span>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Footer Navigation */}
      <div className="flex justify-between pt-6 mt-4 border-t border-gray-100 dark:border-gray-700">
        {currentStep === 1 ? (
          <Button
            variant="outline"
            onClick={onCancel || (() => navigate("/payments"))}
          >
            {t("common.cancel")}
          </Button>
        ) : (
          <Button variant="outline" onClick={handlePrevious} icon={ChevronLeft}>
            {t("common.previous")}
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={loading}
          icon={currentStep === totalSteps ? Save : ChevronRight}
        >
          {currentStep === totalSteps
            ? isEditMode
              ? t("payments.form.update")
              : t("payments.form.create")
            : t("common.next")}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
