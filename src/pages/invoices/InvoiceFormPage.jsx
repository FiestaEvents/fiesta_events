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
    <div className="mb-4 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800/30">
      <div className="flex items-center gap-3">
        <History size={16} className="text-amber-600 shrink-0" />
        <div className="flex-1 text-sm">
          <span className="font-medium text-gray-900 dark:text-white">Draft found</span>
          <span className="text-gray-500 ml-1">from {formattedDate}</span>
        </div>
        <button onClick={onRestore} className="text-xs font-bold text-amber-700 hover:text-amber-900 px-2 py-1 bg-amber-100 rounded">
          Restore
        </button>
        <button onClick={onDiscard} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
      </div>
    </div>
  );
};

// ============================================
// RECIPIENT DETAILS CARD (Restored Feature)
// ============================================
const RecipientDetailsCard = ({ recipient, type, onClear }) => {
  if (!recipient) return null;

  const getAddress = () => {
    if (!recipient.address) return null;
    const parts = [recipient.address.street, recipient.address.city, recipient.address.state, recipient.address.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  return (
    <div className="p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-gray-800 dark:border-orange-800/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-bl-full opacity-50" />
      
      <div className="flex items-start gap-4 relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {recipient.name?.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-gray-900 dark:text-white truncate">{recipient.name}</h4>
            <Badge variant={type === 'client' ? 'primary' : 'purple'} size="xs">
              {type === 'client' ? 'Client' : 'Partner'}
            </Badge>
          </div>
          
          {recipient.company && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Building2 size={12} className="text-gray-400" />
              <span>{recipient.company}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1.5 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail size={12} className="text-orange-500" />
              <span className="truncate">{recipient.email}</span>
            </div>
            {recipient.phone && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Phone size={12} className="text-orange-500" />
                <span>{recipient.phone}</span>
              </div>
            )}
            {getAddress() && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin size={12} className="text-orange-500" />
                <span className="truncate">{getAddress()}</span>
              </div>
            )}
          </div>
        </div>

        {onClear && (
          <button onClick={onClear} className="p-1.5 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30 text-gray-400 hover:text-orange-600 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// EVENT DETAILS CARD (Restored Feature)
// ============================================
const EventDetailsCard = ({ event, onClear, showPricingBreakdown = false, invoiceType = "client" }) => {
  if (!event) return null;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const eventTypeColors = {
    wedding: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    birthday: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    corporate: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    conference: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    party: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    other: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
  };

  // Count importable items
  const getImportSummary = () => {
    let itemCount = 0;
    let totalValue = 0;

    if (invoiceType === "client") {
      if (event.pricing?.basePrice > 0) {
        itemCount++;
        totalValue += event.pricing.basePrice;
      }
      if (event.pricing?.additionalServices?.length > 0) {
        itemCount += event.pricing.additionalServices.length;
        totalValue += event.pricing.additionalServices.reduce((sum, s) => sum + (s.price || 0), 0);
      }
    }

    return { itemCount, totalValue };
  };

  const importSummary = getImportSummary();

  return (
    <div className="p-4 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800 dark:border-blue-800/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={16} className="text-blue-600" />
            <h4 className="font-bold text-gray-900 dark:text-white truncate">{event.title}</h4>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${eventTypeColors[event.type] || eventTypeColors.other}`}>
              {event.type}
            </span>
            <StatusBadge status={event.status} size="xs" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <Calendar size={12} className="text-blue-500" />
              <span>{formatDate(event.startDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <Clock size={12} className="text-blue-500" />
              <span>{event.startTime || "TBD"} - {event.endTime || "TBD"}</span>
            </div>
            {event.guestCount && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Users size={12} className="text-blue-500" />
                <span>{event.guestCount} guests</span>
              </div>
            )}
            {event.pricing?.totalAmount > 0 && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <DollarSign size={12} className="text-blue-500" />
                <span>{formatCurrency(event.pricing.totalAmount)}</span>
              </div>
            )}
          </div>

          {/* Pricing Breakdown for Import */}
          {showPricingBreakdown && invoiceType === "client" && (
            <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center gap-2 mb-2">
                <Package size={12} className="text-green-500" />
                <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase">
                  Imported to Invoice
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                {event.pricing?.basePrice > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Venue Rental</span>
                    <span className="font-medium">{formatCurrency(event.pricing.basePrice)}</span>
                  </div>
                )}
                {event.pricing?.additionalServices?.map((service, idx) => (
                  <div key={idx} className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>{service.name}</span>
                    <span className="font-medium">{formatCurrency(service.price)}</span>
                  </div>
                ))}
                {event.pricing?.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount ({event.pricing.discountType === "percentage" ? `${event.pricing.discount}%` : "Fixed"})</span>
                    <span className="font-medium">-{formatCurrency(event.pricing.discount)}</span>
                  </div>
                )}
                {event.pricing?.taxRate > 0 && (
                  <div className="flex justify-between text-gray-500 dark:text-gray-500">
                    <span>Tax Rate</span>
                    <span className="font-medium">{event.pricing.taxRate}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Import indicator badge */}
          {importSummary.itemCount > 0 && !showPricingBreakdown && (
            <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  <Check size={10} />
                  <span className="font-medium">{importSummary.itemCount} items imported</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{formatCurrency(importSummary.totalValue)}</span>
              </div>
            </div>
          )}
        </div>

        {onClear && (
          <button onClick={onClear} className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// STEP INDICATOR (Enhanced)
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
    <div className="flex items-center gap-1 mb-6 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-xl">
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
                  ? "bg-white dark:bg-gray-700 text-orange-600 dark:text-orange-400 shadow-sm ring-1 ring-orange-200 dark:ring-orange-800" 
                  : isCompleted 
                  ? "text-green-600 dark:text-green-400 hover:bg-white/50 dark:hover:bg-gray-700/50 cursor-pointer" 
                  : "text-gray-400 cursor-not-allowed"
              }`}
            >
              {isCompleted ? <Check size={14} className="text-green-500" /> : <Icon size={14} />}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <ChevronRight size={14} className={`shrink-0 ${isCompleted ? 'text-green-400' : 'text-gray-300'}`} />
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
  <div className="bg-white rounded-xl p-5 text-white">
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 bg-orange-500/20 rounded-lg">
        <DollarSign size={16} className="text-orange-400" />
      </div>
      <span className="font-bold text-sm text-gray-800">Summary</span>
    </div>

    <div className="space-y-3 text-sm">
      <div className="flex justify-between text-gray-800">
        <span>Subtotal</span>
        <span className="text-gray-800">{formatCurrency(calculations.subtotal, currency)}</span>
      </div>
      <div className="flex justify-between text-gray-800">
        <span>Tax</span>
        <span className="text-gray-800">{formatCurrency(calculations.tax, currency)}</span>
      </div>
      {calculations.discountAmount > 0 && (
        <div className="flex justify-between text-red-800">
          <span>Discount</span>
          <span>-{formatCurrency(calculations.discountAmount, currency)}</span>
        </div>
      )}
      <div className="pt-3 border-t border-gray-700 flex justify-between items-center">
        <span className="font-bold">Total</span>
        <span className="text-2xl font-black text-orange-400">{formatCurrency(calculations.totalAmount, currency)}</span>
      </div>
    </div>
  </div>
);

// ============================================
// LINE ITEM ROW
// ============================================
const LineItemRow = ({ item, index, onChange, onRemove, canRemove }) => {
  const categories = [
    { value: "venue_rental", label: "Venue Rental" },
    { value: "catering", label: "Catering" },
    { value: "decoration", label: "Decoration" },
    { value: "photography", label: "Photography" },
    { value: "music", label: "Music/DJ" },
    { value: "equipment", label: "Equipment" },
    { value: "service_fee", label: "Service Fee" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
      <div className="flex gap-3">
        <div className="flex-1 space-y-3">
          <input
            type="text"
            placeholder="Item description..."
            value={item.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none border-b border-transparent focus:border-orange-300 pb-1"
          />
          
          <div className="flex items-center gap-4">
            <select
              value={item.category || "venue_rental"}
              onChange={(e) => onChange(index, "category", e.target.value)}
              className="text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-2 py-1.5 text-gray-600 dark:text-gray-300 focus:ring-1 focus:ring-orange-500"
            >
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Qty:</span>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onChange(index, "quantity", e.target.value)}
                className="w-14 text-center text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg py-1 focus:ring-1 focus:ring-orange-500"
              />
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400">Rate:</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.rate}
                onChange={(e) => onChange(index, "rate", e.target.value)}
                className="w-24 text-right text-sm bg-gray-100 dark:bg-gray-700 border-0 rounded-lg py-1 focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between">
          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
            {formatCurrency(item.amount || 0)}
          </span>
          {canRemove && (
            <button
              onClick={() => onRemove(index)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
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
    
    // Reset recipient and event when switching types
    const updates = {
      invoiceType: newType,
      client: newType === "client" ? "" : formData.client,
      partner: newType === "partner" ? "" : formData.partner,
      event: "",
      items: [{ description: "", quantity: 1, rate: 0, amount: 0, category: "venue_rental" }],
    };
    
    setFormData((p) => ({ ...p, ...updates }));
    setSelectedEvent(null);
    setCurrentStep(1); // Go back to step 1
  };

  const handleRecipientSelect = (recipientId) => {
    const field = invoiceType === "client" ? "client" : "partner";
    setFormData((p) => ({ ...p, [field]: recipientId, event: "" }));
    setSelectedEvent(null);
    setRecipientSearch("");
  };

  // Convert event data to invoice line items
  const generateItemsFromEvent = (event, type) => {
    const items = [];

    if (type === "client") {
      // Add base price as venue rental
      if (event.pricing?.basePrice > 0) {
        items.push({
          description: `Venue Rental - ${event.title}`,
          quantity: 1,
          rate: event.pricing.basePrice,
          amount: event.pricing.basePrice,
          category: "venue_rental",
        });
      }

      // Add additional services
      if (event.pricing?.additionalServices?.length > 0) {
        event.pricing.additionalServices.forEach((service) => {
          items.push({
            description: service.name || "Additional Service",
            quantity: 1,
            rate: service.price || 0,
            amount: service.price || 0,
            category: "service_fee",
          });
        });
      }
    } else if (type === "partner") {
      // For partner bills, find the partner's service in the event
      const partnerId = formData.partner;
      const partnerService = event.partners?.find(
        (p) => (p.partner?._id || p.partner) === partnerId
      );

      if (partnerService) {
        const serviceCost = partnerService.hours && partnerService.cost
          ? partnerService.hours * partnerService.cost
          : partnerService.cost || 0;

        items.push({
          description: `${partnerService.service || "Service"} - ${event.title}`,
          quantity: partnerService.hours || 1,
          rate: partnerService.cost || 0,
          amount: serviceCost,
          category: mapPartnerCategory(partnerService.service),
        });
      }
    }

    // Ensure at least one empty item if nothing was generated
    if (items.length === 0) {
      items.push({ description: "", quantity: 1, rate: 0, amount: 0, category: "venue_rental" });
    }

    return items;
  };

  // Map partner service to item category
  const mapPartnerCategory = (service) => {
    const serviceMap = {
      catering: "catering",
      photography: "photography",
      "dj": "music",
      "music": "music",
      decoration: "decoration",
      floral: "decoration",
      security: "service_fee",
      cleaning: "service_fee",
      audio_visual: "equipment",
    };
    return serviceMap[service?.toLowerCase()] || "other";
  };

  const handleEventSelect = async (eventId) => {
    setFormData((p) => ({ ...p, event: eventId }));
    if (!eventId) {
      setSelectedEvent(null);
      return;
    }
    try {
      const res = await eventService.getById(eventId);
      const evt = res.event || res.data?.event || res;
      setSelectedEvent(evt);

      // Auto-populate items from event
      const generatedItems = generateItemsFromEvent(evt, invoiceType);
      
      // Check if there are existing items with content
      const hasExistingItems = formData.items.some(item => item.description || item.rate > 0);
      
      // Also pull tax rate and discount from event if available
      const updates = {};

      if (evt.pricing?.taxRate !== undefined) {
        updates.taxRate = evt.pricing.taxRate;
      }

      // For client invoices, optionally carry over discount
      if (invoiceType === "client" && evt.pricing?.discount > 0) {
        updates.discount = evt.pricing.discount;
        updates.discountType = evt.pricing.discountType || "fixed";
      }

      // If there are existing items, ask user if they want to replace or append
      if (hasExistingItems && generatedItems.length > 0 && generatedItems[0].description) {
        const shouldReplace = window.confirm(
          `This event has ${generatedItems.length} item(s) worth ${formatCurrency(
            generatedItems.reduce((sum, i) => sum + i.amount, 0)
          )}.\n\nReplace existing items?\n\n• OK = Replace items\n• Cancel = Keep existing items`
        );
        
        if (shouldReplace) {
          updates.items = generatedItems;
        }
      } else {
        // No existing items or no new items to add
        if (generatedItems.length > 0 && generatedItems[0].description) {
          updates.items = generatedItems;
        }
      }

      setFormData((p) => ({ ...p, ...updates }));
      
      if (updates.items) {
        showSuccess(`Imported ${updates.items.length} item(s) from event`);
      } else {
        showInfo("Event linked (no pricing data to import)");
      }
    } catch (err) {
      apiError(err, "Failed to load event");
    }
  };

  const handleItemChange = (idx, field, val) => {
    const items = [...formData.items];
    items[idx] = { ...items[idx], [field]: val };
    items[idx].amount = (Number(items[idx].quantity) || 0) * (Number(items[idx].rate) || 0);
    setFormData((p) => ({ ...p, items }));
  };

  const handleAddItem = () => {
    setFormData((p) => ({
      ...p,
      items: [...p.items, { description: "", quantity: 1, rate: 0, amount: 0, category: "venue_rental" }],
    }));
  };

  const handleRemoveItem = (idx) => {
    setFormData((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (invoiceType === "client" && !formData.client) errs.recipient = "Please select a client";
      if (invoiceType === "partner" && !formData.partner) errs.recipient = "Please select a partner";
    }
    if (step === 2 && formData.items.length === 0) errs.items = "Add at least one item";
    if (step === 3) {
      if (!formData.issueDate) errs.issueDate = "Issue date required";
      if (!formData.dueDate) errs.dueDate = "Due date required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep((p) => Math.min(p + 1, 4));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        ...calculations,
        items: formData.items.map((i) => ({
          ...i,
          amount: (Number(i.quantity) || 0) * (Number(i.rate) || 0),
        })),
      };

      if (invoiceType === "client") delete payload.partner;
      else delete payload.client;

      if (isEditMode) await invoiceService.update(id, payload);
      else await invoiceService.create(payload);

      localStorage.removeItem("invoiceDraft");
      showSuccess(isEditMode ? "Invoice updated" : "Invoice created");
      navigate("/invoices");
    } catch (e) {
      apiError(e, "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* LEFT: Form Panel */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-xl z-10 max-w-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/invoices")}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                {isEditMode ? "Edit Invoice" : "New Invoice"}
              </h1>
              <div className="flex gap-2 mt-1">
                <button onClick={() => handleTypeSwitch("client")}>
                  <Badge variant={invoiceType === "client" ? "primary" : "secondary"} size="xs" dot={invoiceType === "client"}>
                    Client Invoice
                  </Badge>
                </button>
                <button onClick={() => handleTypeSwitch("partner")}>
                  <Badge variant={invoiceType === "partner" ? "purple" : "secondary"} size="xs" dot={invoiceType === "partner"}>
                    Partner Bill
                  </Badge>
                </button>
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" icon={Settings} onClick={() => navigate("/invoices/settings")}>
            Design
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <DraftNotification draftData={draftData} onRestore={handleRestoreDraft} onDiscard={handleDiscardDraft} />
          <StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} invoiceType={invoiceType} />

          {/* STEP 1: RECIPIENT */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {activeRecipient ? (
                <RecipientDetailsCard
                  recipient={activeRecipient}
                  type={invoiceType}
                  onClear={() => handleRecipientSelect("")}
                />
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder={`Search ${invoiceType === "client" ? "clients" : "partners"}...`}
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {filteredRecipients.map((r) => (
                      <button
                        key={r._id}
                        onClick={() => handleRecipientSelect(r._id)}
                        className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/10 flex items-center gap-3 text-left transition-all"
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                          {r.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.name}</div>
                          <div className="text-xs text-gray-500 truncate">{r.email}</div>
                        </div>
                      </button>
                    ))}
                    {filteredRecipients.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No {invoiceType}s found</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {errors.recipient && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.recipient}</span>
                </div>
              )}

              {activeRecipient && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <CalendarDays size={14} />
                    Link to Event (Optional)
                  </h4>

                  {selectedEvent ? (
                    <EventDetailsCard 
                      event={selectedEvent} 
                      onClear={() => handleEventSelect("")} 
                      showPricingBreakdown={true}
                      invoiceType={invoiceType}
                    />
                  ) : (
                    <Select
                      value={formData.event}
                      onChange={(e) => handleEventSelect(e.target.value)}
                      options={[
                        { value: "", label: "Select an event..." },
                        ...filteredEvents.map((e) => ({
                          value: e._id,
                          label: `${e.title} - ${new Date(e.startDate).toLocaleDateString("en-GB")}`,
                        })),
                      ]}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ITEMS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Line Items</h3>
                <Button size="xs" variant="outline" icon={Plus} onClick={handleAddItem}>
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, idx) => (
                  <LineItemRow
                    key={idx}
                    item={item}
                    index={idx}
                    onChange={handleItemChange}
                    onRemove={handleRemoveItem}
                    canRemove={formData.items.length > 1}
                  />
                ))}
              </div>

              {errors.items && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle size={14} />
                  <span>{errors.items}</span>
                </div>
              )}

              <PriceSummary calculations={calculations} currency={formData.currency} />
            </div>
          )}

          {/* STEP 3: DETAILS */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 gap-4">
                <DateInput
                  label="Issue Date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData((p) => ({ ...p, issueDate: e.target.value }))}
                  error={errors.issueDate}
                  required
                />
                <DateInput
                  label="Due Date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))}
                  error={errors.dueDate}
                  min={formData.issueDate}
                  required
                />
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl">
                <h4 className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Percent size={12} />
                  Tax & Discount
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) => setFormData((p) => ({ ...p, taxRate: e.target.value }))}
                      className="w-full p-2 rounded-lg border border-orange-200 dark:border-orange-800 text-sm focus:ring-1 focus:ring-orange-500 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Discount</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData((p) => ({ ...p, discount: e.target.value }))}
                      className="w-full p-2 rounded-lg border border-orange-200 dark:border-orange-800 text-sm focus:ring-1 focus:ring-orange-500 dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData((p) => ({ ...p, discountType: e.target.value }))}
                      className="w-full p-2 rounded-lg border border-orange-200 dark:border-orange-800 text-sm focus:ring-1 focus:ring-orange-500 dark:bg-gray-800"
                    >
                      <option value="fixed">Fixed ($)</option>
                      <option value="percentage">Percent (%)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Currency"
                  value={formData.currency}
                  onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
                  options={[
                    { value: "TND", label: "TND - Tunisian Dinar" },
                    { value: "EUR", label: "EUR - Euro" },
                    { value: "USD", label: "USD - US Dollar" },
                  ]}
                />
                <Select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "sent", label: "Sent" },
                    { value: "paid", label: "Paid" },
                    { value: "partial", label: "Partial" },
                    { value: "overdue", label: "Overdue" },
                  ]}
                />
              </div>

              <Textarea
                label="Payment Terms / Notes"
                value={formData.terms}
                onChange={(e) => setFormData((p) => ({ ...p, terms: e.target.value }))}
                rows={3}
                placeholder="Bank details, payment instructions..."
              />
            </div>
          )}

          {/* STEP 4: REVIEW */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white mb-4">
                  <Sparkles size={28} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to Save!</h2>
                <p className="text-gray-500 text-sm">Review the preview on the right, then click save.</p>
              </div>

              {activeRecipient && <RecipientDetailsCard recipient={activeRecipient} type={invoiceType} />}
              {selectedEvent && <EventDetailsCard event={selectedEvent} invoiceType={invoiceType} />}

              <PriceSummary calculations={calculations} currency={formData.currency} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between shrink-0">
          {currentStep > 1 ? (
            <Button variant="muted" onClick={() => setCurrentStep((p) => p - 1)} icon={ChevronLeft}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <Button variant="primary" onClick={handleNext} icon={ChevronRight} iconPosition="right">
              Next
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} loading={loading} icon={Save}>
              {isEditMode ? "Update Invoice" : "Create Invoice"}
            </Button>
          )}
        </div>
      </div>

      {/* RIGHT: Preview Panel */}
      <div className="hidden lg:flex flex-1 h-screen bg-gray-900/95 flex-col">
        <div className="h-14 flex items-center justify-between px-6 border-b border-gray-700 bg-gray-900 shrink-0">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Preview</span>
          <div className="text-gray-500 text-xs flex items-center gap-2">
            <Eye size={12} />
            Real-time
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
          <div className="origin-top transform scale-[0.7] xl:scale-[0.8]">
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