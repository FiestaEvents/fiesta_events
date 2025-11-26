// src/pages/invoices/InvoiceFormPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, Settings, Save, Plus, Trash2, Users, Package, FileText, Eye,
  Search, History, X, Check, ChevronRight, ChevronLeft, Mail, Phone, Building2,
  MapPin, Calendar, Clock, DollarSign, Briefcase, CalendarDays, Tag, Percent,
  CreditCard, AlertCircle, Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";

// Services
import { invoiceService, clientService, partnerService, eventService } from "../../api/index";

// Components
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import DateInput from "../../components/common/DateInput";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Badge, { StatusBadge } from "../../components/common/Badge";

// Hooks & Utils
import { useToast } from "../../hooks/useToast";
import formatCurrency from "../../utils/formatCurrency";
import formatDate from "../../utils/formatDate";

// Sub-components
import LiveInvoicePreview from "./LiveInvoicePreview";

// ============================================
// DRAFT NOTIFICATION
// ============================================
const DraftNotification = ({ draftData, onRestore, onDiscard }) => {
  if (!draftData) return null;
  const formattedDate = formatDate(draftData.timestamp);

  return (
    <div className="mb-6 p-3 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700/50 transition-all">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-full text-amber-600 dark:text-amber-400 shrink-0">
          <History size={16} />
        </div>
        <div className="flex-1 text-sm">
          <span className="font-bold text-gray-900 dark:text-white">Unsaved Draft</span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">from {formattedDate}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={onRestore} 
            className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
          >
            Restore
          </button>
          <button 
            onClick={onDiscard} 
            className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// RECIPIENT DETAILS CARD
// ============================================
const RecipientDetailsCard = ({ recipient, type, onClear }) => {
  if (!recipient) return null;

  const getAddress = () => {
    if (!recipient.address) return null;
    const parts = [recipient.address.street, recipient.address.city, recipient.address.state, recipient.address.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  return (
    <div className="group p-5 rounded-xl border border-orange-200 dark:border-orange-800/50 bg-gradient-to-br from-orange-50 to-white dark:from-gray-800 dark:to-gray-800/50 relative overflow-hidden shadow-sm">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100 dark:bg-orange-900/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-md ring-2 ring-white dark:ring-gray-700">
          {recipient.name?.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900 dark:text-white truncate text-lg">{recipient.name}</h4>
            <Badge variant={type === 'client' ? 'primary' : 'purple'} size="xs">
              {type === 'client' ? 'Client' : 'Partner'}
            </Badge>
          </div>
          
          {recipient.company && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mb-3 font-medium">
              <Building2 size={14} className="text-gray-400" />
              <span>{recipient.company}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail size={14} className="text-orange-500 shrink-0" />
              <span className="truncate">{recipient.email}</span>
            </div>
            {recipient.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Phone size={14} className="text-orange-500 shrink-0" />
                <span>{recipient.phone}</span>
              </div>
            )}
            {getAddress() && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={14} className="text-orange-500 shrink-0" />
                <span className="truncate">{getAddress()}</span>
              </div>
            )}
          </div>
        </div>

        {onClear && (
          <button onClick={onClear} className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 shadow-sm transition-all">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// EVENT DETAILS CARD
// ============================================
const EventDetailsCard = ({ event, onClear, showPricingBreakdown = false, invoiceType = "client" }) => {
  if (!event) return null;

  const eventTypeColors = {
    wedding: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    corporate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
  };

  // ... (getImportSummary logic remains same) ...
  const getImportSummary = () => {
    let itemCount = 0;
    let totalValue = 0;
    if (invoiceType === "client") {
      if (event.pricing?.basePrice > 0) { itemCount++; totalValue += event.pricing.basePrice; }
      if (event.pricing?.additionalServices?.length > 0) {
        itemCount += event.pricing.additionalServices.length;
        totalValue += event.pricing.additionalServices.reduce((sum, s) => sum + (s.price || 0), 0);
      }
    }
    return { itemCount, totalValue };
  };
  const importSummary = getImportSummary();

  return (
    <div className="p-5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">
              <CalendarDays size={16} />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white truncate text-base">{event.title}</h4>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border capitalize ${eventTypeColors[event.type] || eventTypeColors.other}`}>
              {event.type}
            </span>
            <StatusBadge status={event.status} size="xs" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar size={14} className="text-gray-400" />
              <span>{new Date(event.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock size={14} className="text-gray-400" />
              <span>{event.startTime || "--:--"} - {event.endTime || "--:--"}</span>
            </div>
            {event.guestCount && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users size={14} className="text-gray-400" />
                <span>{event.guestCount} guests</span>
              </div>
            )}
          </div>

          {showPricingBreakdown && invoiceType === "client" && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Package size={14} className="text-green-500" />
                <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                  Imported Items
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {event.pricing?.basePrice > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Venue Rental</span>
                    <span className="font-mono">{formatCurrency(event.pricing.basePrice)}</span>
                  </div>
                )}
                {event.pricing?.additionalServices?.map((service, idx) => (
                  <div key={idx} className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>{service.name}</span>
                    <span className="font-mono">{formatCurrency(service.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {onClear && (
          <button onClick={onClear} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// STEP INDICATOR
// ============================================
const StepIndicator = ({ currentStep, onStepClick, invoiceType }) => {
  const RecipientIcon = invoiceType === 'client' ? Users : Briefcase;
  const steps = [
    { id: 1, label: "Recipient", icon: RecipientIcon },
    { id: 2, label: "Items", icon: Package },
    { id: 3, label: "Details", icon: FileText },
    { id: 4, label: "Review", icon: Eye },
  ];

  return (
    <div className="flex items-center gap-2 mb-8 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {steps.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const Icon = step.icon;
        
        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => step.id <= currentStep && onStepClick(step.id)}
              disabled={step.id > currentStep}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                isActive 
                  ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800" 
                  : isCompleted 
                  ? "text-orange-600 dark:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" 
                  : "text-gray-400 dark:text-gray-600 cursor-not-allowed"
              }`}
            >
              {isCompleted ? <Check size={16} className="text-orange-500" /> : <Icon size={16} />}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <ChevronRight size={14} className={`shrink-0 ${isCompleted ? 'text-orange-400' : 'text-gray-300 dark:text-gray-600'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================
// PRICE SUMMARY SIDEBAR
// ============================================
const PriceSummary = ({ calculations, currency }) => (
  <div className="bg-white dark:bg-black rounded-xl p-6 text-gray-600 shadow-lg">
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 bg-white rounded-lg">
        <DollarSign size={18} className="text-orange-400" />
      </div>
      <span className="font-bold text-base">Summary</span>
    </div>

    <div className="space-y-3 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span className="font-mono text-gray-900">{formatCurrency(calculations.subtotal, currency)}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Tax</span>
        <span className="font-mono text-gray-900">{formatCurrency(calculations.tax, currency)}</span>
      </div>
      {calculations.discountAmount > 0 && (
        <div className="flex justify-between text-red-300">
          <span>Discount</span>
          <span className="font-mono">-{formatCurrency(calculations.discountAmount, currency)}</span>
        </div>
      )}
      
      <div className="pt-4 mt-2 border-t border-gray-700 flex justify-between items-end">
        <span className="font-bold text-base text-gray-900">Total</span>
        <span className="text-2xl font-black text-orange-400 font-mono tracking-tight">
          {formatCurrency(calculations.totalAmount, currency)}
        </span>
      </div>
    </div>
  </div>
);

// ============================================
// LINE ITEM ROW
// ============================================
const LineItemRow = ({ item, index, onChange, onRemove, canRemove }) => {
  return (
    <div className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-all shadow-sm hover:shadow-md">
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1 w-full space-y-3">
          <input
            type="text"
            placeholder="Item description..."
            value={item.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            className="w-full bg-transparent text-base font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none border-b border-transparent focus:border-orange-500 pb-1 transition-colors"
          />
          
          <div className="flex items-center gap-3">
            <select
              value={item.category || "venue_rental"}
              onChange={(e) => onChange(index, "category", e.target.value)}
              className="text-xs bg-gray-100 dark:bg-gray-900 border-0 rounded-lg px-2 py-1.5 text-gray-600 dark:text-gray-300 focus:ring-1 focus:ring-orange-500"
            >
              <option value="venue_rental">Venue Rental</option>
              <option value="catering">Catering</option>
              <option value="decoration">Decoration</option>
              <option value="photography">Photography</option>
              <option value="music">Music/DJ</option>
              <option value="equipment">Equipment</option>
              <option value="service_fee">Service Fee</option>
              <option value="other">Other</option>
            </select>
            
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">Qty</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onChange(index, "quantity", e.target.value)}
                className="w-16 text-center text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md py-1 focus:ring-1 focus:ring-orange-500 dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-400">Rate</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.rate}
                onChange={(e) => onChange(index, "rate", e.target.value)}
                className="w-24 text-right text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md py-1 focus:ring-1 focus:ring-orange-500 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:h-full w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
          <span className="text-lg font-bold text-gray-900 dark:text-white font-mono">
            {formatCurrency(item.amount || 0)}
          </span>
          {canRemove && (
            <button
              onClick={() => onRemove(index)}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-1"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const InvoiceFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { showSuccess, apiError, showInfo } = useToast();

  const isEditMode = Boolean(id);
  const initialType = searchParams.get("type") || "client";

  // State
  const [invoiceType, setInvoiceType] = useState(initialType);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Data
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [events, setEvents] = useState([]);
  const [settings, setSettings] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [draftData, setDraftData] = useState(null);
  const [errors, setErrors] = useState({});

  // Form
  const [formData, setFormData] = useState({
    invoiceType: initialType,
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

  const [calculations, setCalculations] = useState({ subtotal: 0, tax: 0, discountAmount: 0, totalAmount: 0 });

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        const [stRes, cRes, pRes, eRes] = await Promise.all([
          invoiceService.getSettings(),
          clientService.getAll({ limit: 100, status: "active" }),
          partnerService.getAll({ limit: 100, status: "active" }),
          eventService.getAll({ limit: 100 }),
        ]);

        setSettings(stRes.data || stRes || {});
        setClients(cRes.clients || cRes.data?.clients || []);
        setPartners(pRes.partners || pRes.data?.partners || []);
        setEvents(eRes.events || eRes.data?.events || []);

        if (!isEditMode) {
          const bankDetails = stRes.data?.paymentTerms?.bankDetails || stRes?.paymentTerms?.bankDetails;
          if (bankDetails) setFormData((p) => ({ ...p, terms: bankDetails }));

          const savedDraft = localStorage.getItem("invoiceDraft");
          if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            if (parsed.items) setDraftData(parsed);
          }
        }

        if (isEditMode) {
          const invRes = await invoiceService.getById(id);
          const inv = invRes.invoice || invRes.data?.invoice;
          if (inv) {
            setInvoiceType(inv.invoiceType);
            setFormData({
              ...inv,
              client: inv.client?._id || inv.client || "",
              partner: inv.partner?._id || inv.partner || "",
              event: inv.event?._id || inv.event || "",
              issueDate: inv.issueDate?.split("T")[0],
              dueDate: inv.dueDate?.split("T")[0],
              items: inv.items || [],
            });
            if (inv.event?._id) setSelectedEvent(inv.event);
          }
        }
      } catch (err) {
        apiError(err, "Failed to load data");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [isEditMode, id]);

  // Auto-save draft
  useEffect(() => {
    if (!isEditMode && !fetchLoading) {
      const hasContent = formData.client || formData.partner || formData.items[0]?.description;
      if (hasContent) {
        const draftObj = { ...formData, invoiceType, timestamp: new Date().toISOString() };
        localStorage.setItem("invoiceDraft", JSON.stringify(draftObj));
      }
    }
  }, [formData, invoiceType, isEditMode, fetchLoading]);

  // Calculations
  useEffect(() => {
    let sub = 0;
    formData.items.forEach((i) => (sub += (Number(i.quantity) || 0) * (Number(i.rate) || 0)));
    let disc = Number(formData.discount) || 0;
    if (formData.discountType === "percentage") disc = (sub * disc) / 100;
    const tax = ((sub - disc) * (Number(formData.taxRate) || 0)) / 100;

    setCalculations({
      subtotal: sub,
      discountAmount: disc,
      tax: tax,
      totalAmount: Math.max(0, sub - disc + tax),
    });
  }, [formData.items, formData.taxRate, formData.discount, formData.discountType]);

  // Filtered data
  const recipients = invoiceType === "client" ? clients : partners;
  const filteredRecipients = recipients.filter((r) =>
    r.name.toLowerCase().includes(recipientSearch.toLowerCase())
  );
  const activeRecipient = recipients.find(
    (r) => r._id === (invoiceType === "client" ? formData.client : formData.partner)
  );

  const filteredEvents = useMemo(() => {
    const recipientId = invoiceType === "client" ? formData.client : formData.partner;
    if (!recipientId) return events;
    return events.filter((evt) => {
      if (invoiceType === "client") {
        const cId = evt.clientId?._id || evt.clientId;
        return cId === recipientId;
      }
      return evt.partners?.some((p) => (p.partner?._id || p.partner) === recipientId);
    });
  }, [events, invoiceType, formData.client, formData.partner]);

  // Handlers
  const handleRestoreDraft = () => {
    if (draftData) {
      setFormData(draftData);
      setInvoiceType(draftData.invoiceType || "client");
      showSuccess("Draft restored");
    }
    setDraftData(null);
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("invoiceDraft");
    setDraftData(null);
  };

  const handleTypeSwitch = (newType) => {
    if (newType === invoiceType) return;
    setInvoiceType(newType);
    const updates = {
      invoiceType: newType,
      client: newType === "client" ? "" : formData.client,
      partner: newType === "partner" ? "" : formData.partner,
      event: "",
      items: [{ description: "", quantity: 1, rate: 0, amount: 0, category: "venue_rental" }],
    };
    setFormData((p) => ({ ...p, ...updates }));
    setSelectedEvent(null);
    setCurrentStep(1);
  };

  const handleRecipientSelect = (recipientId) => {
    const field = invoiceType === "client" ? "client" : "partner";
    setFormData((p) => ({ ...p, [field]: recipientId, event: "" }));
    setSelectedEvent(null);
    setRecipientSearch("");
  };

  // Auto-gen items logic (kept same as provided)
  const generateItemsFromEvent = (event, type) => {
    const items = [];
    if (type === "client") {
      if (event.pricing?.basePrice > 0) {
        items.push({ description: `Venue Rental - ${event.title}`, quantity: 1, rate: event.pricing.basePrice, amount: event.pricing.basePrice, category: "venue_rental" });
      }
      if (event.pricing?.additionalServices?.length > 0) {
        event.pricing.additionalServices.forEach((service) => {
          items.push({ description: service.name || "Service", quantity: 1, rate: service.price || 0, amount: service.price || 0, category: "service_fee" });
        });
      }
    } else if (type === "partner") {
      const partnerId = formData.partner;
      const partnerService = event.partners?.find((p) => (p.partner?._id || p.partner) === partnerId);
      if (partnerService) {
        const cost = partnerService.hours && partnerService.cost ? partnerService.hours * partnerService.cost : partnerService.cost || 0;
        items.push({ description: `${partnerService.service || "Service"} - ${event.title}`, quantity: partnerService.hours || 1, rate: partnerService.cost || 0, amount: cost, category: "other" });
      }
    }
    if (items.length === 0) items.push({ description: "", quantity: 1, rate: 0, amount: 0, category: "venue_rental" });
    return items;
  };

  const handleEventSelect = async (eventId) => {
    setFormData((p) => ({ ...p, event: eventId }));
    if (!eventId) { setSelectedEvent(null); return; }
    try {
      const res = await eventService.getById(eventId);
      const evt = res.event || res.data?.event || res;
      setSelectedEvent(evt);
      const generatedItems = generateItemsFromEvent(evt, invoiceType);
      
      const updates = {};
      if (evt.pricing?.taxRate !== undefined) updates.taxRate = evt.pricing.taxRate;
      if (invoiceType === "client" && evt.pricing?.discount > 0) {
        updates.discount = evt.pricing.discount;
        updates.discountType = evt.pricing.discountType || "fixed";
      }

      if (generatedItems.length > 0 && generatedItems[0].description) {
        updates.items = generatedItems;
      }
      setFormData((p) => ({ ...p, ...updates }));
    } catch (err) { apiError(err, "Failed to load event"); }
  };

  const handleItemChange = (idx, field, val) => {
    const items = [...formData.items];
    items[idx] = { ...items[idx], [field]: val };
    items[idx].amount = (Number(items[idx].quantity) || 0) * (Number(items[idx].rate) || 0);
    setFormData((p) => ({ ...p, items }));
  };

  const handleAddItem = () => {
    setFormData((p) => ({ ...p, items: [...p.items, { description: "", quantity: 1, rate: 0, amount: 0, category: "venue_rental" }] }));
  };

  const handleRemoveItem = (idx) => {
    setFormData((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (invoiceType === "client" && !formData.client) errs.recipient = "Select a client";
      if (invoiceType === "partner" && !formData.partner) errs.recipient = "Select a partner";
    }
    if (step === 2 && formData.items.length === 0) errs.items = "Add items";
    if (step === 3) {
      if (!formData.issueDate) errs.issueDate = "Required";
      if (!formData.dueDate) errs.dueDate = "Required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep((p) => Math.min(p + 1, 4)); };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    try {
      setLoading(true);
      const payload = { ...formData, ...calculations, items: formData.items };
      if (invoiceType === "client") delete payload.partner; else delete payload.client;
      if (isEditMode) await invoiceService.update(id, payload); else await invoiceService.create(payload);
      localStorage.removeItem("invoiceDraft");
      showSuccess(isEditMode ? "Invoice updated" : "Invoice created");
      navigate("/invoices");
    } catch (e) { apiError(e, "Operation failed"); } finally { setLoading(false); }
  };

  if (fetchLoading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"><LoadingSpinner /></div>;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden font-sans text-slate-800 dark:text-slate-100">
      
      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl z-10 max-w-2xl">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/invoices")}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{isEditMode ? "Edit Invoice" : "New Invoice"}</h1>
              <div className="flex gap-2 mt-1.5">
                <button onClick={() => handleTypeSwitch("client")} className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${invoiceType==='client' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                  Client Invoice
                </button>
                <button onClick={() => handleTypeSwitch("partner")} className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${invoiceType==='partner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                  Partner Bill
                </button>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={Settings} onClick={() => navigate("/invoices/settings")}>Design</Button>
        </div>

        {/* SCROLLABLE FORM */}
        <div className="flex-1 overflow-y-auto p-6">
          <DraftNotification draftData={draftData} onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
          <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} invoiceType={invoiceType} />

          {/* STEP 1: RECIPIENT */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {activeRecipient ? (
                <RecipientDetailsCard recipient={activeRecipient} type={invoiceType} onClear={() => handleRecipientSelect("")} />
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder={`Search ${invoiceType === "client" ? "clients" : "partners"}...`}
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    {filteredRecipients.map((r) => (
                      <button
                        key={r._id}
                        onClick={() => handleRecipientSelect(r._id)}
                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/10 flex items-center gap-3 text-left transition-all group"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:bg-orange-200 dark:group-hover:bg-orange-800 group-hover:text-orange-800 dark:group-hover:text-white transition-colors">
                          {r.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white truncate">{r.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{r.email}</div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-500" />
                      </button>
                    ))}
                    {filteredRecipients.length === 0 && (
                      <div className="text-center py-8 text-gray-400 dark:text-gray-500">No results found</div>
                    )}
                  </div>
                </div>
              )}

              {activeRecipient && (
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700 space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <CalendarDays size={16} className="text-orange-500" /> Link Event (Optional)
                  </h4>
                  {selectedEvent ? (
                    <EventDetailsCard event={selectedEvent} onClear={() => handleEventSelect("")} showPricingBreakdown={true} invoiceType={invoiceType} />
                  ) : (
                    <Select
                      value={formData.event}
                      onChange={(e) => handleEventSelect(e.target.value)}
                      options={[
                        { value: "", label: "Select an event to import items..." },
                        ...filteredEvents.map((e) => ({ value: e._id, label: e.title })),
                      ]}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ITEMS */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Line Items</h3>
                <Button size="sm" variant="outline" icon={Plus} onClick={handleAddItem}>Add Item</Button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, idx) => (
                  <LineItemRow key={idx} item={item} index={idx} onChange={handleItemChange} onRemove={handleRemoveItem} canRemove={formData.items.length > 1} />
                ))}
              </div>
              <PriceSummary calculations={calculations} currency={formData.currency} />
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 gap-5">
                <DateInput label="Issue Date" value={formData.issueDate} onChange={(e) => setFormData((p) => ({ ...p, issueDate: e.target.value }))} required />
                <DateInput label="Due Date" value={formData.dueDate} onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))} required min={formData.issueDate} />
              </div>

              <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Percent size={14} /> Tax & Discount
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Rate (%)</label>
                    <input type="number" value={formData.taxRate} onChange={(e) => setFormData((p) => ({ ...p, taxRate: e.target.value }))} className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount</label>
                    <input type="number" value={formData.discount} onChange={(e) => setFormData((p) => ({ ...p, discount: e.target.value }))} className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select value={formData.discountType} onChange={(e) => setFormData((p) => ({ ...p, discountType: e.target.value }))} className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none">
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <Select label="Currency" value={formData.currency} onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))} options={[{ value: "TND", label: "TND" }, { value: "EUR", label: "EUR" }, { value: "USD", label: "USD" }]} />
                <Select label="Status" value={formData.status} onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))} options={[{ value: "draft", label: "Draft" }, { value: "sent", label: "Sent" }, { value: "paid", label: "Paid" }, { value: "overdue", label: "Overdue" }]} />
              </div>

              <Textarea label="Notes / Terms" value={formData.terms} onChange={(e) => setFormData((p) => ({ ...p, terms: e.target.value }))} rows={4} placeholder="Payment instructions, thank you note..." />
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-green-900/30 text-orange-600 dark:text-orange-400 mb-4">
                  <Sparkles size={32} color="orange" />
                </div>
                <h2 className="text-2xl font-bold text-orange-600 dark:text-white mb-2">Ready to Finalize</h2>
                <p className="text-gray-500 dark:text-gray-400">Review the details on the right before saving.</p>
              </div>
              
              <PriceSummary calculations={calculations} currency={formData.currency} />
              {activeRecipient && <RecipientDetailsCard recipient={activeRecipient} type={invoiceType} />}
            </div>
          )}
        </div>

        {/* FOOTER NAV */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between shrink-0">
          {currentStep > 1 ? (
            <Button variant="outline" onClick={() => setCurrentStep((p) => p - 1)}>Back</Button>
          ) : <div></div>}

          {currentStep < 4 ? (
            <Button variant="primary" onClick={handleNext} icon={ChevronRight} iconPosition="right">Next Step</Button>
          ) : (
            <Button variant="success" onClick={handleSubmit} loading={loading} icon={Save}>{isEditMode ? "Update Invoice" : "Create Invoice"}</Button>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: PREVIEW */}
      <div className="hidden lg:flex flex-1 flex-col bg-gray-900 border-l border-gray-700 overflow-hidden">
        <div className="h-16 border-b border-gray-800 bg-gray-900 flex items-center justify-between px-6 shrink-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Preview</span>
          <div className="flex items-center gap-2 text-gray-500 text-xs"><Eye size={14} /> Real-time Update</div>
        </div>
        <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-gray-800/50">
          <div className="origin-top transform scale-[0.65] xl:scale-[0.75] shadow-2xl transition-all duration-300">
            <LiveInvoicePreview
              settings={settings}
              data={formData}
              calculations={calculations}
              recipient={activeRecipient}
              companyName="My Venue"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default InvoiceFormPage;