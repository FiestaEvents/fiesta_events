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
  Building,
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
  X,
  User,
  MapPin,
  Clock,
  Percent,
  FileCheck,
  History,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { 
  invoiceService, 
  clientService, 
  partnerService, 
  eventService 
} from "../../api/index";
import formatCurrency from "../../utils/formatCurrency";

// ============================================
// TOGGLE COMPONENT
// ============================================
const Toggle = ({ enabled, onChange, label, disabled = false }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? "bg-orange-500" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
    {label && (
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
    )}
  </div>
);

// ============================================
// STICKY PRICE SUMMARY COMPONENT
// ============================================
const StickyPriceSummary = ({
  subtotal,
  tax,
  discountAmount,
  totalAmount,
  visible,
}) => {
  if (!visible) return null;
  
  return (
    <div className="fixed top-8 left-10 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-orange-200 dark:border-orange-700 p-4 min-w-[280px]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <DollarSign className="w-5 h-5 text-orange-500" />
          <h4 className="font-bold text-gray-900 dark:text-white">
            Price Summary
          </h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tax:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(tax)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span className="font-semibold">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t-2 border-orange-200 dark:border-orange-700 flex justify-between">
            <span className="font-bold text-gray-900 dark:text-white">
              Total:
            </span>
            <span className="font-bold text-2xl text-orange-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN INVOICE FORM COMPONENT
// ============================================
const InvoiceFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id);
  
  const [invoiceType, setInvoiceType] = useState(
    searchParams.get('type') || 'client'
  );

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  // ============================================
  // FORM STATE - ENHANCED
  // ============================================
  const [formData, setFormData] = useState({
    invoiceType: invoiceType,
    client: "",
    partner: "",
    event: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    items: [
      {
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0,
        category: "venue_rental",
      },
    ],
    taxRate: 19,
    discount: 0,
    discountType: "fixed",
    notes: "",
    terms: invoiceType === "client" 
      ? "Payment is due within 30 days of the invoice date. Late payments may incur additional fees."
      : "Payment will be processed within 15 days of receipt. Please include invoice number in payment reference.",
    currency: "TND",
    paymentMethod: "bank_transfer",
    status: "draft",
  });

  // ============================================
  // UI STATE
  // ============================================
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [events, setEvents] = useState([]);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});
  const [recipientSearch, setRecipientSearch] = useState("");
  const [hasDraft, setHasDraft] = useState(false);

  // ============================================
  // CALCULATIONS
  // ============================================
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    tax: 0,
    discountAmount: 0,
    totalAmount: 0,
  });

  // ============================================
  // CONFIGURATION
  // ============================================
  const config = {
    client: {
      recipientLabel: "Client",
      recipientIcon: Users,
      recipientColor: "orange",
      billToLabel: "Bill To",
      eventLabel: "Client Event",
      createLabel: "Create Client Invoice",
      editLabel: "Edit Client Invoice",
      defaultTerms: "Payment is due within 30 days of the invoice date. Late payments may incur additional fees.",
    },
    partner: {
      recipientLabel: "Partner",
      recipientIcon: Briefcase,
      recipientColor: "orange",
      billToLabel: "Pay To",
      eventLabel: "Related Event",
      createLabel: "Create Partner Bill",
      editLabel: "Edit Partner Bill",
      defaultTerms: "Payment will be processed within 15 days of receipt. Please include invoice number in payment reference.",
    },
  };

  const currentConfig = config[invoiceType];
  const RecipientIcon = currentConfig.recipientIcon;

  const stepConfigs = {
    1: {
      title: "Recipient",
      icon: RecipientIcon,
      description: `Select ${currentConfig.recipientLabel.toLowerCase()}`,
      color: "blue",
    },
    2: {
      title: "Items & Pricing",
      icon: Package,
      description: "Add services and items with pricing",
      color: "purple",
    },
    3: {
      title: "Details",
      icon: FileText,
      description: "Invoice details and terms",
      color: "green",
    },
    4: {
      title: "Review",
      icon: Eye,
      description: "Final review and confirmation",
      color: "orange",
    },
  };

  const currencyOptions = [
    { value: "TND", label: "TND - Tunisian Dinar" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "USD", label: "USD - US Dollar" },
  ];

  const paymentMethodOptions = [
    { value: "cash", label: "Cash" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "credit_card", label: "Credit Card" },
    { value: "check", label: "Check" },
    { value: "mobile_payment", label: "Mobile Payment" },
  ];

  // ============================================
  // AUTO-SAVE DRAFT FUNCTIONALITY
  // ============================================
  useEffect(() => {
    if (!isEditMode && formData.client && currentStep > 1) {
      const draftData = {
        formData,
        currentStep,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("invoiceFormDraft", JSON.stringify(draftData));
    }
  }, [formData, currentStep, isEditMode]);

  // Load draft on mount
  useEffect(() => {
    if (!isEditMode && !id) {
      const draft = localStorage.getItem("invoiceFormDraft");
      if (draft) {
        try {
          const { formData: savedData, currentStep: savedStep, timestamp } = JSON.parse(draft);
          const draftAge = Date.now() - new Date(timestamp).getTime();
          const oneDayMs = 24 * 60 * 60 * 1000;
          if (draftAge < oneDayMs) {
            setHasDraft(true);
            window.__invoiceFormDraft = { savedData, savedStep, timestamp };
          }
        } catch (error) {
          console.error("Error loading draft:", error);
        }
      }
    }
  }, []);

  const clearDraft = () => {
    localStorage.removeItem("invoiceFormDraft");
    setHasDraft(false);
  };

  // ============================================
  // DATA FETCHING
  // ============================================
  const fetchDropdownData = async () => {
    try {
      const [clientsRes, partnersRes, eventsRes] = await Promise.allSettled([
        clientService.getAll({ status: "active", limit: 100 }),
        partnerService.getAll({ status: "active", limit: 100 }),
        eventService.getAll({ limit: 100 }),
      ]);

      const extractArrayData = (response, serviceName) => {
        if (response.status === "rejected") {
          console.warn(`Failed to fetch ${serviceName}:`, response.reason);
          return [];
        }

        const data = response.value;
        if (!data) return [];

        if (Array.isArray(data)) return data;
        if (data.data && Array.isArray(data.data)) return data.data;
        if (data.clients && Array.isArray(data.clients)) return data.clients;
        if (data.partners && Array.isArray(data.partners)) return data.partners;
        if (data.events && Array.isArray(data.events)) return data.events;

        return [];
      };

      const clientsList = extractArrayData(clientsRes, "clients");
      const partnersList = extractArrayData(partnersRes, "partners");
      const eventsList = extractArrayData(eventsRes, "events");

      setClients(clientsList);
      setPartners(partnersList);
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load data");
      setClients([]);
      setPartners([]);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  // Load invoice in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchInvoice = async () => {
        try {
          setFetchLoading(true);
          const response = await invoiceService.getById(id);
          const invoice = response?.invoice || response?.data?.invoice || response?.data;

          if (invoice) {
            setInvoiceType(invoice.invoiceType || 'client');
            
            setFormData({
              invoiceType: invoice.invoiceType || 'client',
              client: invoice.client?._id || invoice.client || "",
              partner: invoice.partner?._id || invoice.partner || "",
              event: invoice.event?._id || invoice.event || "",
              issueDate: invoice.issueDate
                ? new Date(invoice.issueDate).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
              dueDate: invoice.dueDate
                ? new Date(invoice.dueDate).toISOString().split("T")[0]
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              items: invoice.items?.length > 0 ? invoice.items.map(item => ({
                description: item.description || "",
                quantity: Number(item.quantity) || 1,
                rate: Number(item.rate) || 0,
                amount: Number(item.amount) || 0,
                category: item.category || "venue_rental",
              })) : [{
                description: "",
                quantity: 1,
                rate: 0,
                amount: 0,
                category: "venue_rental",
              }],
              taxRate: Number(invoice.taxRate) || 19,
              discount: Number(invoice.discount) || 0,
              discountType: invoice.discountType || "fixed",
              notes: invoice.notes || "",
              terms: invoice.terms || config[invoice.invoiceType || 'client'].defaultTerms,
              currency: invoice.currency || "TND",
              paymentMethod: invoice.paymentMethod || "bank_transfer",
              status: invoice.status || "draft",
            });

            if (invoice.invoiceType === 'client' && invoice.client?._id) {
              setSelectedRecipient(invoice.client._id);
            } else if (invoice.invoiceType === 'partner' && invoice.partner?._id) {
              setSelectedRecipient(invoice.partner._id);
            }
          }
        } catch (error) {
          console.error("Error fetching invoice:", error);
          toast.error("Failed to load invoice");
          navigate("/invoices");
        } finally {
          setFetchLoading(false);
        }
      };

      fetchInvoice();
    }
  }, [id, isEditMode, navigate]);

  // Filter events when recipient changes
  useEffect(() => {
    const recipientId = invoiceType === 'client' ? formData.client : formData.partner;
    
    if (recipientId && events.length > 0) {
      const filtered = events.filter((event) => {
        if (invoiceType === 'client') {
          const eventClientId = event.clientId?._id || event.clientId || event.client?._id || event.client;
          return eventClientId === recipientId;
        } else {
          return event.partners?.some(p => 
            (p.partner?._id || p.partner) === recipientId
          );
        }
      });
      setRelatedEvents(filtered);
    } else {
      setRelatedEvents([]);
    }
  }, [formData.client, formData.partner, events, invoiceType]);

  // Calculate totals
  useEffect(() => {
    let subtotal = 0;

    formData.items.forEach((item) => {
      const amount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
      subtotal += amount;
    });

    const tax = (subtotal * (Number(formData.taxRate) || 0)) / 100;
    let discountAmount = Number(formData.discount) || 0;
    if (formData.discountType === "percentage") {
      discountAmount = (subtotal * discountAmount) / 100;
    }

    const totalAmount = Math.max(0, subtotal + tax - discountAmount);

    setCalculations({
      subtotal,
      tax,
      discountAmount,
      totalAmount,
    });
  }, [formData.items, formData.taxRate, formData.discount, formData.discountType]);

  // ============================================
  // EVENT HANDLERS
  // ============================================
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    
    // Recalculate amount when quantity or rate changes
    const quantity = Number(updatedItems[index].quantity) || 0;
    const rate = Number(updatedItems[index].rate) || 0;
    updatedItems[index].amount = quantity * rate;
    
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    // Clear item-specific errors
    if (errors[`items[${index}].${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`items[${index}].${field}`];
        return newErrors;
      });
    }
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          rate: 0,
          amount: 0,
          category: "venue_rental",
        },
      ],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    } else {
      toast.error("At least one item is required");
    }
  };

  const handleSelectRecipient = (recipientId) => {
    setSelectedRecipient(recipientId);
    
    if (invoiceType === 'client') {
      setFormData(prev => ({ ...prev, client: recipientId, partner: "", event: "" }));
    } else {
      setFormData(prev => ({ ...prev, partner: recipientId, client: "", event: "" }));
    }

    setSelectedEvent(null);

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.client;
      delete newErrors.partner;
      return newErrors;
    });
  };

  const handleEventSelect = async (eventId) => {
    if (!eventId) {
      setSelectedEvent(null);
      return;
    }

    try {
      const response = await eventService.getById(eventId);
      const event = response?.event || response?.data || response;
      setSelectedEvent(event);

      const eventItems = [];

      if (invoiceType === 'client') {
        if (event.pricing?.basePrice > 0) {
          eventItems.push({
            description: `Venue Rental - ${event.title}`,
            quantity: 1,
            rate: Number(event.pricing.basePrice),
            amount: Number(event.pricing.basePrice),
            category: "venue_rental",
          });
        }

        if (event.pricing?.additionalServices?.length > 0) {
          event.pricing.additionalServices.forEach(service => {
            if (service.price > 0) {
              eventItems.push({
                description: service.name,
                quantity: 1,
                rate: Number(service.price),
                amount: Number(service.price),
                category: "other",
              });
            }
          });
        }
      } else {
        const partnerId = formData.partner;
        if (event.partners?.length > 0) {
          event.partners
            .filter(p => (p.partner?._id || p.partner) === partnerId)
            .forEach(partner => {
              if (partner.cost > 0) {
                eventItems.push({
                  description: `${partner.service || 'Service'} - ${event.title}`,
                  quantity: 1,
                  rate: Number(partner.cost),
                  amount: Number(partner.cost),
                  category: "other",
                });
              }
            });
        }
      }

      if (eventItems.length > 0) {
        setFormData(prev => ({
          ...prev,
          items: eventItems,
        }));
        toast.success(`Loaded ${eventItems.length} item(s) from event`);
      } else {
        toast.info("No items found for this event");
      }
    } catch (error) {
      console.error("Error loading event:", error);
      toast.error("Failed to load event details");
    }
  };

  // ============================================
  // VALIDATION
  // ============================================
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (invoiceType === 'client' && !formData.client) {
        newErrors.client = "Please select a client";
      }
      if (invoiceType === 'partner' && !formData.partner) {
        newErrors.partner = "Please select a partner";
      }
    }

    if (step === 2) {
      if (formData.items.length === 0) {
        newErrors.items = "At least one item is required";
      } else {
        formData.items.forEach((item, index) => {
          if (!item.description?.trim()) {
            newErrors[`items[${index}].description`] = "Description is required";
          }
          if (Number(item.quantity) <= 0) {
            newErrors[`items[${index}].quantity`] = "Quantity must be greater than 0";
          }
          if (Number(item.rate) < 0) {
            newErrors[`items[${index}].rate`] = "Rate cannot be negative";
          }
        });
      }
    }

    if (step === 3) {
      if (!formData.issueDate) newErrors.issueDate = "Issue date is required";
      if (!formData.dueDate) newErrors.dueDate = "Due date is required";
      if (formData.issueDate && formData.dueDate && new Date(formData.dueDate) < new Date(formData.issueDate)) {
        newErrors.dueDate = "Due date must be after issue date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // NAVIGATION
  // ============================================
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fix the errors before continuing");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const jumpToStep = (step) => {
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step === currentStep + 1) {
      nextStep();
    }
  };

  // ============================================
  // FORM SUBMISSION
  // ============================================
const handleSubmit = async (e) => {
  e.preventDefault();

  if (currentStep < totalSteps) {
    nextStep();
    return;
  }

  if (!validateStep(4)) {
    toast.error("Please fix all errors before submitting");
    return;
  }

  try {
    setLoading(true);
    const invoiceData = {
      invoiceType: invoiceType,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      items: formData.items.map(item => ({
        description: item.description.trim(),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount),
        category: item.category,
      })),
      taxRate: Number(formData.taxRate),
      discount: Number(formData.discount),
      discountType: formData.discountType,
      notes: formData.notes.trim(),
      terms: formData.terms.trim(),
      currency: formData.currency,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
    };

    if (invoiceType === 'client') {
      invoiceData.client = formData.client;
    } else {
      invoiceData.partner = formData.partner;
    }

    if (formData.event) {
      invoiceData.event = formData.event;
    }

    let response;
    let createdInvoice;

    if (isEditMode) {
      response = await invoiceService.update(id, invoiceData);
      toast.success(`${invoiceType === 'client' ? 'Invoice' : 'Bill'} updated successfully`);
      
      // For edit mode, fetch the updated invoice to show in modal
      try {
        const updatedInvoiceResponse = await invoiceService.getById(id);
        createdInvoice = updatedInvoiceResponse?.invoice || updatedInvoiceResponse?.data?.invoice || updatedInvoiceResponse?.data;
      } catch (fetchError) {
        console.error("Error fetching updated invoice:", fetchError);
        // If we can't fetch the updated invoice, use the form data
        createdInvoice = { ...invoiceData, _id: id };
      }
    } else {
      response = await invoiceService.create(invoiceData);
      toast.success(`${invoiceType === 'client' ? 'Invoice' : 'Bill'} created successfully`);
      clearDraft();
      
      // Extract the created invoice from response
      createdInvoice = response?.invoice || response?.data?.invoice || response?.data;
    }

    // Show success modal with the created/updated invoice
    if (createdInvoice) {
      // Normalize the invoice data for the modal
      const normalizedInvoice = {
        _id: createdInvoice._id || id,
        invoiceNumber: createdInvoice.invoiceNumber || `INV-${(createdInvoice._id || '').substring(0, 8)}`,
        invoiceType: createdInvoice.invoiceType || invoiceType,
        recipientName: invoiceType === 'client' 
          ? (createdInvoice.client?.name || selectedRecipientDetails?.name || 'Client')
          : (createdInvoice.partner?.name || selectedRecipientDetails?.name || 'Partner'),
        recipientEmail: invoiceType === 'client'
          ? (createdInvoice.client?.email || selectedRecipientDetails?.email)
          : (createdInvoice.partner?.email || selectedRecipientDetails?.email),
        recipientCompany: invoiceType === 'client'
          ? (createdInvoice.client?.company || selectedRecipientDetails?.company)
          : (createdInvoice.partner?.company || selectedRecipientDetails?.company),
        totalAmount: createdInvoice.totalAmount || calculations.totalAmount,
        subtotal: createdInvoice.subtotal || calculations.subtotal,
        tax: createdInvoice.tax || calculations.tax,
        taxRate: createdInvoice.taxRate || formData.taxRate,
        discount: createdInvoice.discount || formData.discount,
        discountType: createdInvoice.discountType || formData.discountType,
        status: createdInvoice.status || formData.status,
        issueDate: createdInvoice.issueDate || formData.issueDate,
        dueDate: createdInvoice.dueDate || formData.dueDate,
        items: createdInvoice.items || formData.items,
        notes: createdInvoice.notes || formData.notes,
        terms: createdInvoice.terms || formData.terms,
        currency: createdInvoice.currency || formData.currency,
        paymentMethod: createdInvoice.paymentMethod || formData.paymentMethod,
        event: createdInvoice.event || formData.event,
        createdAt: createdInvoice.createdAt || new Date().toISOString(),
        updatedAt: createdInvoice.updatedAt || new Date().toISOString()
      };

      // Set the invoice for modal view and open modal
      setSelectedInvoice(normalizedInvoice);
      setIsDetailModalOpen(true);

      // Optional: Add a small delay before showing modal for better UX
      setTimeout(() => {
        // You can add any additional actions here after modal opens
      }, 100);
    } else {
      // Fallback: navigate to invoices list if we can't show the modal
      navigate("/invoices");
    }

  } catch (error) {
    console.error("Error saving invoice:", error);
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to save invoice";
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    navigate("/invoices");
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  const getSelectedRecipient = () => {
    const recipients = invoiceType === 'client' ? clients : partners;
    return recipients.find(r => r._id === selectedRecipient);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('en-GB', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const recipients = invoiceType === 'client' ? clients : partners;
  const filteredRecipients = recipients.filter((recipient) => {
    const searchLower = recipientSearch.toLowerCase();
    return (
      recipient.name?.toLowerCase().includes(searchLower) ||
      recipient.email?.toLowerCase().includes(searchLower) ||
      recipient.phone?.includes(recipientSearch) ||
      recipient.company?.toLowerCase().includes(searchLower)
    );
  });

  const selectedRecipientDetails = getSelectedRecipient();

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  const currentStepConfig = stepConfigs[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-800/50 px-6 py-6 border-b-2 border-orange-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                  <RecipientIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? currentConfig.editLabel : currentConfig.createLabel}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    {currentStepConfig.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                icon={ArrowLeft}
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>

            {/* Draft indicator */}
            {hasDraft && !isEditMode && window.__invoiceFormDraft && (
              <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-lg shadow-lg animate-in slide-in-from-top-3 duration-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                      <History className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Draft Found!
                      </h3>
                      <Badge variant="warning" className="text-xs">
                        Unsaved Changes
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      You have an unsaved draft from{" "}
                      <strong className="text-orange-600 dark:text-orange-400">
                        {new Date(window.__invoiceFormDraft.timestamp).toLocaleString()}
                      </strong>
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      icon={Check}
                      onClick={() => {
                        const { savedData, savedStep } = window.__invoiceFormDraft;
                        setFormData(savedData);
                        setCurrentStep(savedStep);
                        setHasDraft(false);
                        delete window.__invoiceFormDraft;
                        toast.success("Draft restored successfully!");
                      }}
                      className="whitespace-nowrap"
                    >
                      Restore Draft
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Trash2}
                      onClick={() => {
                        localStorage.removeItem("invoiceFormDraft");
                        setHasDraft(false);
                        delete window.__invoiceFormDraft;
                        toast.success("Draft discarded");
                      }}
                      className="whitespace-nowrap hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Progress Steps */}
            <div className="mt-6">
              <div className="flex items-center justify-center">
                {[1, 2, 3, 4].map((step) => {
                  const config = stepConfigs[step];
                  const isActive = step === currentStep;
                  const isComplete = step < currentStep;
                  const isClickable = step <= currentStep;
                  const StepIcon = config.icon;

                  return (
                    <div key={step} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          onClick={() => isClickable && jumpToStep(step)}
                          className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                            isActive
                              ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg scale-110"
                              : isComplete
                                ? "bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-md cursor-pointer hover:scale-105"
                                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"
                          }`}
                        >
                          {isComplete ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                          {isActive && (
                            <span className="absolute -inset-1 bg-orange-400 rounded-full animate-ping opacity-20"></span>
                          )}
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium text-center transition-colors ${
                            isActive
                              ? "text-orange-600 dark:text-orange-400"
                              : isComplete
                                ? "text-green-600 dark:text-green-400"
                                : "text-gray-500"
                          }`}
                        >
                          {config.title}
                        </span>
                      </div>
                      {step < totalSteps && (
                        <div
                          className={`flex-1 h-1 mx-2 rounded-full transition-all duration-300 ${
                            isComplete
                              ? "bg-gradient-to-r from-green-500 to-green-600"
                              : "bg-gray-200 dark:bg-gray-600"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Recipient Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${
                      invoiceType === 'client' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      <RecipientIcon className={`w-6 h-6 ${
                        invoiceType === 'client' ? 'text-blue-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Select {currentConfig.recipientLabel}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Choose who this {invoiceType === 'client' ? 'invoice' : 'bill'} is for
                      </p>
                    </div>
                  </div>

                  <Input
                    icon={Search}
                    placeholder={`Search ${currentConfig.recipientLabel.toLowerCase()}s...`}
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="mb-4"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {filteredRecipients.length > 0 ? (
                      filteredRecipients.map((recipient) => (
                        <button
                          key={recipient._id}
                          type="button"
                          onClick={() => handleSelectRecipient(recipient._id)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedRecipient === recipient._id
                              ? invoiceType === 'client'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
                                selectedRecipient === recipient._id
                                  ? invoiceType === 'client'
                                    ? 'bg-blue-500'
                                    : 'bg-purple-500'
                                  : 'bg-gray-400'
                              }`}
                            >
                              {recipient.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-white truncate">
                                {recipient.name}
                              </div>
                              {recipient.company && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {recipient.company}
                                </div>
                              )}
                              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                <div className="flex items-center gap-1 truncate">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{recipient.email}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 flex-shrink-0" />
                                  <span>{recipient.phone}</span>
                                </div>
                              </div>
                            </div>
                            {selectedRecipient === recipient._id && (
                              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <RecipientIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-medium">
                          No {currentConfig.recipientLabel.toLowerCase()}s found
                        </p>
                      </div>
                    )}
                  </div>

                  {(errors.client || errors.partner) && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-400">
                        {errors.client || errors.partner}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Event Selection */}
              {selectedRecipient && (
                <Card className="border-0 shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Calendar className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Link to Event (Optional)
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Connect to an event to auto-populate items
                        </p>
                      </div>
                    </div>

                    <Select
                      label="Select Event"
                      value={formData.event}
                      onChange={(e) => {
                        handleChange("event", e.target.value);
                        handleEventSelect(e.target.value);
                      }}
                    >
                      <option value="">No event selected - Add items manually</option>
                      {relatedEvents.map((event) => (
                        <option key={event._id} value={event._id}>
                          {event.title} - {formatDate(event.startDate)} ({event.type})
                        </option>
                      ))}
                    </Select>

                    {relatedEvents.length === 0 && selectedRecipient && (
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                              No events found
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                              No events found for this {currentConfig.recipientLabel.toLowerCase()}. You can add items manually in the next step.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 2: Items & Pricing */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-5 duration-300">
              {/* Items List */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-lg">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                          <Package className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Invoice Items
                          </h2>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Add services and items with pricing
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        icon={Plus}
                        onClick={handleAddItem}
                        size="sm"
                      >
                        Add Item
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.items.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                        >
                          <div className="space-y-4">
                            <Input
                              label="Description"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              placeholder="Enter service description"
                              error={errors[`items[${index}].description`]}
                            />

                            <div className="grid grid-cols-3 gap-3">
                              <Input
                                label="Quantity"
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                error={errors[`items[${index}].quantity`]}
                              />
                              <Input
                                label="Rate"
                                type="number"
                                min="0"
                                step="0.001"
                                value={item.rate}
                                onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                error={errors[`items[${index}].rate`]}
                              />
                              <Input
                                label="Amount"
                                type="number"
                                value={item.amount}
                                disabled
                                className="bg-gray-50"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Total: </span>
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(item.amount)}
                                </span>
                              </div>
                              {formData.items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="danger"
                                  icon={Trash2}
                                  onClick={() => handleRemoveItem(index)}
                                  size="sm"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {errors.items && (
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-800 dark:text-red-400">{errors.items}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Price Summary & Settings */}
              <div className="lg:col-span-1">
                <div className="sticky space-y-6">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Price Summary
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(calculations.subtotal)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Tax ({formData.taxRate}%):
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(calculations.tax)}
                          </span>
                        </div>

                        {calculations.discountAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              -{formatCurrency(calculations.discountAmount)}
                            </span>
                          </div>
                        )}

                        <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                          <div className="flex justify-between">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {formatCurrency(calculations.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tax & Discount
                      </h3>
                      <div className="space-y-4">
                        <Input
                          label="Tax Rate (%)"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={formData.taxRate}
                          onChange={(e) => handleChange("taxRate", e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Discount
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.discount}
                              onChange={(e) => handleChange("discount", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Type
                            </label>
                            <Select
                              value={formData.discountType}
                              onChange={(e) => handleChange("discountType", e.target.value)}
                              options={[
                                { value: 'fixed', label: 'Fixed' },
                                { value: 'percentage', label: '%' },
                              ]}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-5 duration-300">
              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Invoice Dates
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Issue Date"
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => handleChange("issueDate", e.target.value)}
                      error={errors.issueDate}
                    />
                    <Input
                      label="Due Date"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleChange("dueDate", e.target.value)}
                      error={errors.dueDate}
                      min={formData.issueDate}
                    />
                  </div>
                </div>
              </Card>

              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Payment Settings
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Select
                      label="Currency"
                      value={formData.currency}
                      onChange={(e) => handleChange("currency", e.target.value)}
                      options={currencyOptions}
                    />
                    <Select
                      label="Payment Method"
                      value={formData.paymentMethod}
                      onChange={(e) => handleChange("paymentMethod", e.target.value)}
                      options={paymentMethodOptions}
                    />
                    <Select
                      label="Status"
                      value={formData.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      options={[
                        { value: 'draft', label: 'Draft' },
                        { value: 'sent', label: 'Sent' },
                        { value: 'paid', label: 'Paid' },
                      ]}
                    />
                  </div>
                </div>
              </Card>

              <Card className="border-0 shadow-lg lg:col-span-2">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Additional Information
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Textarea
                      label="Notes"
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      rows={3}
                      placeholder="Add any additional notes..."
                    />
                    <Textarea
                      label="Terms & Conditions"
                      value={formData.terms}
                      onChange={(e) => handleChange("terms", e.target.value)}
                      rows={4}
                      placeholder="Payment terms and conditions..."
                    />
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Eye className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Review & Confirm
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please review all details before {isEditMode ? 'updating' : 'creating'} the {invoiceType === 'client' ? 'invoice' : 'bill'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          {currentConfig.recipientLabel} Information
                        </h3>
                        {selectedRecipientDetails && (
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                {selectedRecipientDetails.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {selectedRecipientDetails.name}
                                </div>
                                {selectedRecipientDetails.company && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedRecipientDetails.company}
                                  </div>
                                )}
                                <div className="text-sm text-gray-500 mt-2 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {selectedRecipientDetails.email}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {selectedRecipientDetails.phone}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedEvent && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Event Information
                          </h3>
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="font-semibold text-green-900 dark:text-green-300">
                              {selectedEvent.title}
                            </div>
                            <div className="text-sm text-green-700 dark:text-green-400 mt-1">
                              {formatDate(selectedEvent.startDate)} - {selectedEvent.type}
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Invoice Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Issue Date:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatDate(formData.issueDate)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formatDate(formData.dueDate)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Currency:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {formData.currency}
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <Badge
                              color={
                                formData.status === "paid" ? "green" :
                                formData.status === "sent" ? "blue" : "orange"
                              }
                            >
                              {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Items Summary ({formData.items.length})
                        </h3>
                        <div className="space-y-3">
                          {formData.items.map((item, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {item.description}
                                  </div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {item.quantity} × {formatCurrency(item.rate)}
                                  </div>
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {formatCurrency(item.amount)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <h4 className="font-semibold text-orange-900 dark:text-orange-300 mb-3">
                          Final Amount
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {formatCurrency(calculations.subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {formatCurrency(calculations.tax)}
                            </span>
                          </div>
                          {calculations.discountAmount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                              <span className="text-red-600 dark:text-red-400 font-medium">
                                -{formatCurrency(calculations.discountAmount)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-lg font-bold pt-2 border-t border-orange-200 dark:border-orange-700">
                            <span className="text-orange-900 dark:text-orange-300">Total:</span>
                            <span className="text-orange-600 dark:text-orange-400">
                              {formatCurrency(calculations.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Footer Navigation */}
          <Card className="border-0 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      icon={ChevronLeft}
                      onClick={prevStep}
                      className="hover:scale-105 transition-transform"
                    >
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {currentStep >= 2 && (
                    <div className="text-right px-4 py-2 bg-white dark:bg-gray-600 rounded-lg shadow">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Total Amount
                      </div>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(calculations.totalAmount)}
                      </div>
                    </div>
                  )}
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      variant="primary"
                      icon={ChevronRight}
                      onClick={nextStep}
                      className="hover:scale-105 transition-transform"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      icon={Save}
                      loading={loading}
                      className="hover:scale-105 transition-transform"
                    >
                      {isEditMode 
                        ? `Update ${invoiceType === 'client' ? 'Invoice' : 'Bill'}` 
                        : `Create ${invoiceType === 'client' ? 'Invoice' : 'Bill'}`}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </form>
      </div>

      {/* Sticky Price Summary */}
      <StickyPriceSummary
        subtotal={calculations.subtotal}
        tax={calculations.tax}
        discountAmount={calculations.discountAmount}
        totalAmount={calculations.totalAmount}
        visible={currentStep >= 2}
      />
    </div>
  );
};

export default InvoiceFormPage;