// src/pages/invoices/InvoiceFormPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Calendar,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  CreditCard,
  Search,
  Check,
  Users,
  Briefcase,
  Eye,
  Package,
  Mail,
  Phone,
  AlertCircle,
  Info,
} from "lucide-react";
import { useTranslation } from "react-i18next";

// ✅ Services
import {
  invoiceService,
  clientService,
  partnerService,
  eventService
} from "../../api/index";

// ✅ Generic Components
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DateInput from "../../components/common/DateInput"; // ✅ Added DateInput

// ✅ Hooks & Utils
import { useToast } from "../../hooks/useToast";
import formatCurrency from "../../utils/formatCurrency";

// ============================================
// HELPER: Price Summary
// ============================================
const PriceSummary = ({ subtotal, tax, discountAmount, totalAmount }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('invoices.priceSummary')}
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">{t('invoices.subtotal')}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">{t('invoices.tax')}:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">{t('invoices.discount')}:</span>
            <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t-2 border-orange-200 dark:border-orange-800">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{t('invoices.total')}:</span>
          <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

// ============================================
// HELPER: Step Indicator
// ============================================
const StepIndicator = ({ currentStep, totalSteps, stepConfigs, onStepClick }) => {
  return (
    <div className="flex items-center justify-between mb-8 px-2">
      {[1, 2, 3, 4].map((step) => {
        const config = stepConfigs[step];
        const isActive = step === currentStep;
        const isComplete = step < currentStep;
        const StepIcon = config.icon;

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center relative z-10">
              <button
                onClick={() => onStepClick(step)}
                disabled={step > currentStep}
                className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg scale-110"
                    : isComplete
                    ? "bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-md cursor-pointer hover:scale-105"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"
                }`}
              >
                {isComplete ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> : <StepIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                {isActive && <span className="absolute -inset-1 bg-orange-400 rounded-full animate-ping opacity-20"></span>}
              </button>
              <span className={`hidden sm:block text-sm font-medium mt-3 text-center transition-colors ${
                isActive ? "text-orange-600 dark:text-orange-400 font-semibold" 
                : isComplete ? "text-green-600 dark:text-green-400" 
                : "text-gray-500 dark:text-gray-400"
              }`}>
                {config.title}
              </span>
            </div>
            {step < totalSteps && (
              <div className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-all duration-300 -mt-6 sm:mt-[-2rem] ${
                isComplete ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gray-200 dark:bg-gray-600"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const InvoiceFormPage = ({
  mode: propMode,
  invoiceType: propInvoiceType,
  invoice: propInvoice,
  onSubmit: propOnSubmit,
  onCancel: propOnCancel
}) => {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { showSuccess, apiError, showInfo } = useToast();

  // Mode Logic
  const isModalMode = propMode !== undefined;
  const id = isModalMode ? propInvoice?._id : routeId;
  const isEditMode = isModalMode ? propMode === "edit" : Boolean(routeId);

  const [invoiceType, setInvoiceType] = useState(
    isModalMode ? propInvoiceType : (searchParams.get('type') || 'client')
  );

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // Form State
  const [formData, setFormData] = useState({
    invoiceType: invoiceType,
    client: "",
    partner: "",
    event: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    items: [{ description: "", quantity: 1, rate: 0, amount: 0, category: "venue_rental" }],
    taxRate: 19,
    discount: 0,
    discountType: "fixed",
    notes: "",
    terms: "", 
    currency: "TND",
    paymentMethod: "bank_transfer",
    status: "draft",
  });

  // UI State
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [events, setEvents] = useState([]);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const [recipientSearch, setRecipientSearch] = useState("");
  const [calculations, setCalculations] = useState({ subtotal: 0, tax: 0, discountAmount: 0, totalAmount: 0 });

  // Config
  const config = {
    client: {
      recipientLabel: t('invoices.recipient.client'),
      recipientIcon: Users,
      defaultTerms: "Payment is due within 30 days. Late payments may incur fees.",
      createLabel: t('invoices.createClientInvoice'),
      editLabel: t('invoices.editClientInvoice'),
    },
    partner: {
      recipientLabel: t('invoices.recipient.partner'),
      recipientIcon: Briefcase,
      defaultTerms: "Payment processed within 15 days of receipt.",
      createLabel: t('invoices.createPartnerBill'),
      editLabel: t('invoices.editPartnerBill'),
    },
  };

  const currentConfig = config[invoiceType];
  const RecipientIcon = currentConfig.recipientIcon;

  // Initialize default terms
  useEffect(() => {
    if (!isEditMode) {
      setFormData(prev => ({ ...prev, terms: currentConfig.defaultTerms }));
    }
  }, [invoiceType, isEditMode, currentConfig.defaultTerms]);

  const stepConfigs = {
    1: { title: t('invoices.steps.recipient'), icon: RecipientIcon },
    2: { title: t('invoices.steps.itemsPricing'), icon: Package },
    3: { title: t('invoices.steps.details'), icon: FileText },
    4: { title: t('invoices.steps.review'), icon: Eye },
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Fetch Data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [clientsRes, partnersRes, eventsRes] = await Promise.allSettled([
          clientService.getAll({ status: "active", limit: 100 }),
          partnerService.getAll({ status: "active", limit: 100 }),
          eventService.getAll({ limit: 100 }),
        ]);

        const cList = clientsRes.status === 'fulfilled' ? (clientsRes.value?.clients || []) : [];
        const pList = partnersRes.status === 'fulfilled' ? (partnersRes.value?.partners || []) : [];
        const eList = eventsRes.status === 'fulfilled' ? (eventsRes.value?.events || []) : [];

        setClients(cList);
        setPartners(pList);
        setEvents(eList);
      } catch (error) {
        apiError(error, "Failed to load dropdown data");
      }
    };
    fetchDropdownData();
  }, [apiError]);

  // Fetch Invoice for Edit
  useEffect(() => {
    if (isEditMode) {
      const fetchInvoice = async () => {
        try {
          setFetchLoading(true);
          const invoiceId = isModalMode ? (propInvoice?._id || id) : id;
          if (!invoiceId) return;

          const response = await invoiceService.getById(invoiceId);
          const invoice = response?.invoice || response;

          if (invoice) {
            setInvoiceType(invoice.invoiceType || 'client');
            setFormData({
              ...invoice,
              client: invoice.client?._id || invoice.client || "",
              partner: invoice.partner?._id || invoice.partner || "",
              event: invoice.event?._id || invoice.event || "",
              issueDate: invoice.issueDate?.split("T")[0],
              dueDate: invoice.dueDate?.split("T")[0],
              items: invoice.items || [],
            });

            if (invoice.invoiceType === 'client' && invoice.client?._id) setSelectedRecipient(invoice.client._id);
            else if (invoice.invoiceType === 'partner' && invoice.partner?._id) setSelectedRecipient(invoice.partner._id);
          }
        } catch (error) {
          apiError(error, "Failed to load invoice");
          if (!isModalMode) navigate("/invoices");
        } finally {
          setFetchLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [isEditMode, id, propInvoice, isModalMode, navigate, apiError]);

  // Filter Events based on Recipient
  useEffect(() => {
    const recipientId = invoiceType === 'client' ? formData.client : formData.partner;
    if (recipientId && events.length > 0) {
      const filtered = events.filter((event) => {
        if (invoiceType === 'client') {
          const cId = event.clientId?._id || event.clientId || event.client?._id || event.client;
          return cId === recipientId;
        } else {
          return event.partners?.some(p => (p.partner?._id || p.partner) === recipientId);
        }
      });
      setRelatedEvents(filtered);
    } else {
      setRelatedEvents([]);
    }
  }, [formData.client, formData.partner, events, invoiceType]);

  // Calculations
  useEffect(() => {
    let subtotal = 0;
    formData.items.forEach(item => {
      subtotal += (Number(item.quantity) || 0) * (Number(item.rate) || 0);
    });

    const tax = (subtotal * (Number(formData.taxRate) || 0)) / 100;
    let discountAmount = Number(formData.discount) || 0;
    if (formData.discountType === "percentage") {
      discountAmount = (subtotal * discountAmount) / 100;
    }

    setCalculations({
      subtotal,
      tax,
      discountAmount,
      totalAmount: Math.max(0, subtotal + tax - discountAmount)
    });
  }, [formData.items, formData.taxRate, formData.discount, formData.discountType]);

  // Handlers
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    const qty = parseFloat(updatedItems[index].quantity) || 0;
    const rate = parseFloat(updatedItems[index].rate) || 0;
    updatedItems[index].amount = qty * rate;

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleEventSelect = async (eventId) => {
    if (!eventId) { setSelectedEvent(null); return; }
    try {
      const response = await eventService.getById(eventId);
      const event = response?.event || response;
      setSelectedEvent(event);
      showSuccess("Event linked successfully");
    } catch (error) {
      apiError(error, "Failed to load event details");
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (invoiceType === 'client' && !formData.client) newErrors.client = t('invoices.validation.selectClient');
      if (invoiceType === 'partner' && !formData.partner) newErrors.partner = t('invoices.validation.selectPartner');
    }
    if (step === 2 && formData.items.length === 0) newErrors.items = t('invoices.items.atLeastOne');
    if (step === 3) {
      if (!formData.issueDate) newErrors.issueDate = t('invoices.dates.issueDateRequired');
      if (!formData.dueDate) newErrors.dueDate = t('invoices.dates.dueDateRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentStep < totalSteps) {
      if (validateStep(currentStep)) setCurrentStep(prev => prev + 1);
      else apiError(null, t('invoices.validation.fixErrors'));
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        items: formData.items.map(i => ({
          ...i,
          quantity: Number(i.quantity),
          rate: Number(i.rate),
          amount: Number(i.quantity) * Number(i.rate)
        })),
        subtotal: calculations.subtotal,
        totalAmount: calculations.totalAmount,
        taxAmount: calculations.tax
      };

      if (invoiceType === 'client') delete payload.partner;
      else delete payload.client;

      if (isModalMode && propOnSubmit) {
        await propOnSubmit(payload);
      } else {
        if (isEditMode) await invoiceService.update(id, payload);
        else await invoiceService.create(payload);
        
        showSuccess(isEditMode ? "Invoice updated" : "Invoice created");
        navigate("/invoices");
      }
    } catch (error) {
      apiError(error, "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const recipients = invoiceType === 'client' ? clients : partners;
  const filteredRecipients = recipients.filter(r => 
    r.name?.toLowerCase().includes(recipientSearch.toLowerCase())
  );
  const selectedRecipientDetails = recipients.find(r => r._id === selectedRecipient);

  if (fetchLoading) return <div className="flex justify-center py-12"><LoadingSpinner /></div>;

  return (
    <div className={isModalMode ? "" : "min-h-screen bg-white dark:bg-gray-900 p-6"}>
      {!isModalMode && (
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={isModalMode ? propOnCancel : () => navigate("/invoices")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? currentConfig.editLabel : currentConfig.createLabel}
              </h1>
            </div>
          </div>
        </div>
      )}

      <StepIndicator 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
        stepConfigs={stepConfigs} 
        onStepClick={(step) => setCurrentStep(step)} 
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* STEP 1: RECIPIENT */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4">{t('invoices.recipient.selectRecipient', { recipient: currentConfig.recipientLabel })}</h2>
                
                {/* Manual Search Input */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search..." 
                    value={recipientSearch} 
                    onChange={(e) => setRecipientSearch(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                  {filteredRecipients.map(r => (
                    <div 
                      key={r._id}
                      onClick={() => {
                        setSelectedRecipient(r._id);
                        handleChange(invoiceType === 'client' ? 'client' : 'partner', r._id);
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
                        selectedRecipient === r._id 
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20" 
                          : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.email}</div>
                      </div>
                      {selectedRecipient === r._id && <Check className="ml-auto text-orange-600 w-5 h-5" />}
                    </div>
                  ))}
                </div>
                {(errors.client || errors.partner) && <p className="text-red-500 mt-2 text-sm">{errors.client || errors.partner}</p>}
              </div>

              {selectedRecipient && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold mb-4">{t('invoices.events.linkEvent')}</h2>
                  <Select
                    label={t('invoices.events.selectEvent')}
                    value={formData.event}
                    onChange={(e) => { handleChange("event", e.target.value); handleEventSelect(e.target.value); }}
                    options={[
                      { value: "", label: t('invoices.events.noEvent') },
                      ...relatedEvents.map(evt => ({
                        value: evt._id,
                        label: `${evt.title} - ${formatDateDisplay(evt.startDate)}`
                      }))
                    ]}
                  />
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <PriceSummary {...calculations} />
            </div>
          </div>
        )}

        {/* STEP 2: ITEMS */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">{t('invoices.items.title')}</h2>
                <Button variant="outline" size="sm" icon={Plus} onClick={() => setFormData(p => ({...p, items: [...p.items, { description: "", quantity: 1, rate: 0, amount: 0, category: "venue_rental" }] }))}>
                  {t('invoices.items.addItem')}
                </Button>
              </div>
              
              {formData.items.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-7">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={item.description} 
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)} 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qty</label>
                      <input 
                        type="number" 
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={item.quantity} 
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rate</label>
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={item.rate} 
                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)} 
                      />
                    </div>
                    <div className="col-span-1 flex justify-center pb-1">
                      <Button variant="ghost" size="sm" icon={Trash2} onClick={() => {
                        const newItems = formData.items.filter((_, i) => i !== idx);
                        setFormData(p => ({...p, items: newItems}));
                      }} className="text-red-500" />
                    </div>
                  </div>
                </div>
              ))}
              {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}
            </div>
            
            <div className="lg:col-span-1 space-y-6">
              <PriceSummary {...calculations} />
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold mb-4">{t('invoices.taxAndDiscount.title')}</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Rate (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    step="0.1"
                    value={formData.taxRate} 
                    onChange={(e) => handleChange("taxRate", e.target.value)} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount</label>
                    <input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      value={formData.discount} 
                      onChange={(e) => handleChange("discount", e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <Select 
                    label="Type" 
                    value={formData.discountType} 
                    onChange={(e) => handleChange("discountType", e.target.value)}
                    options={[
                      { value: 'fixed', label: 'Fixed' },
                      { value: 'percentage', label: '%' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DETAILS */}
        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4">{t('invoices.dates.title')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {/* ✅ Using DateInput Component Here to force DD/MM/YYYY Display */}
                  <DateInput 
                    label={t('invoices.dates.issueDate')} 
                    value={formData.issueDate} 
                    onChange={(e) => handleChange("issueDate", e.target.value)} 
                    error={errors.issueDate} 
                    required
                  />
                  <DateInput 
                    label={t('invoices.dates.dueDate')} 
                    value={formData.dueDate} 
                    onChange={(e) => handleChange("dueDate", e.target.value)} 
                    error={errors.dueDate} 
                    min={formData.issueDate}
                    required
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4">{t('invoices.payment.title')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Select 
                    label="Currency" 
                    value={formData.currency} 
                    onChange={(e) => handleChange("currency", e.target.value)}
                    options={[{ value: "TND", label: "TND" }, { value: "EUR", label: "EUR" }, { value: "USD", label: "USD" }]}
                  />
                  <Select 
                    label="Status" 
                    value={formData.status} 
                    onChange={(e) => handleChange("status", e.target.value)}
                    options={[{ value: "draft", label: "Draft" }, { value: "sent", label: "Sent" }, { value: "paid", label: "Paid" }]}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Notes & Terms</h2>
                <Textarea label="Notes" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} className="mb-4" />
                <Textarea label="Terms" value={formData.terms} onChange={(e) => handleChange("terms", e.target.value)} />
              </div>
            </div>
            <div className="lg:col-span-1">
              <PriceSummary {...calculations} />
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW */}
        {currentStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 space-y-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-xl font-bold">Invoice Review</h3>
                  <p className="text-gray-500">Issue: {formatDateDisplay(formData.issueDate)}</p>
                  <p className="text-gray-500">Due: {formatDateDisplay(formData.dueDate)}</p>
                </div>
                <div className="text-right">
                  <h4 className="font-semibold">{selectedRecipientDetails?.name}</h4>
                  <p className="text-sm text-gray-500">{selectedRecipientDetails?.email}</p>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(item.rate)}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lg:col-span-1">
              <PriceSummary {...calculations} />
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={() => setCurrentStep(p => p - 1)} icon={ChevronLeft}>Back</Button>
          ) : <div></div>}
          
          {currentStep < totalSteps ? (
            <Button type="submit" variant="primary" icon={ChevronRight}>Next</Button>
          ) : (
            <Button type="submit" variant="primary" icon={Save} loading={loading}>
              {isEditMode ? "Update Invoice" : "Create Invoice"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default InvoiceFormPage;