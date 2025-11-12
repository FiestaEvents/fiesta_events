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
  Download,
  Send,
  Printer,
  Edit,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { 
  invoiceService, 
  clientService, 
  partnerService, 
  eventService 
} from "../../api/index";
import formatCurrency from "../../utils/formatCurrency";

// ============================================
// PRICE SUMMARY COMPONENT
// ============================================
const PriceSummary = ({
  subtotal,
  tax,
  discountAmount,
  totalAmount,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Price Summary
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Tax:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(tax)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Discount:</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                -{formatCurrency(discountAmount)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t-2 border-orange-200 dark:border-orange-800">
            <span className="text-lg font-bold text-gray-900 dark:text-white">Total:</span>
            <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// STEP INDICATOR COMPONENT
// ============================================
const StepIndicator = ({ currentStep, totalSteps, stepConfigs, onStepClick }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4].map((step) => {
        const config = stepConfigs[step];
        const isActive = step === currentStep;
        const isComplete = step < currentStep;
        const StepIcon = config.icon;

        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStepClick(step)}
                disabled={step > currentStep}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg scale-110"
                    : isComplete
                    ? "bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-md cursor-pointer hover:scale-105"
                    : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"
                }`}
              >
                {isComplete ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <StepIcon className="w-6 h-6" />
                )}
                {isActive && (
                  <span className="absolute -inset-1 bg-orange-400 rounded-full animate-ping opacity-20"></span>
                )}
              </button>
              <span
                className={`text-sm font-medium mt-3 text-center transition-colors ${
                  isActive
                    ? "text-orange-600 dark:text-orange-400 font-semibold"
                    : isComplete
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {config.title}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-center">
                {config.description}
              </span>
            </div>
            {step < totalSteps && (
              <div
                className={`flex-1 h-1 mx-4 rounded-full transition-all duration-300 ${
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
  // FORM STATE
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
  const [recipientSearch, setRecipientSearch] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

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
      description: "Add services and items",
      color: "purple",
    },
    3: {
      title: "Details",
      icon: FileText,
      description: "Invoice details",
      color: "green",
    },
    4: {
      title: "Review",
      icon: Eye,
      description: "Final review",
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
  // ACTION HANDLERS
  // ============================================
  const handleDownloadInvoice = async (invoice) => {
    if (!invoice || !invoice._id) {
      toast.error("Invalid invoice data");
      return;
    }
    
    try {
      const loadingToast = toast.loading("Generating PDF...");
      const blob = await invoiceService.download(invoice._id);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber || "document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss(loadingToast);
      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error(error.message || "Failed to download invoice");
    }
  };

  const handleSendInvoice = async (invoice) => {
    if (!invoice || !invoice._id) {
      toast.error("Invalid invoice data");
      return;
    }
    
    try {
      const loadingToast = toast.loading("Sending invoice...");
      await invoiceService.send(invoice._id, {
        message: "Please find your invoice attached. Payment is due by the date specified.",
      });
      toast.dismiss(loadingToast);
      toast.success("Invoice sent successfully");
      setIsDetailModalOpen(false);
      navigate("/invoices");
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error(error.message || "Failed to send invoice");
    }
  };

  const handlePrintInvoice = async (invoice) => {
    if (!invoice || !invoice._id) {
      toast.error("Invalid invoice data");
      return;
    }
    
    try {
      const loadingToast = toast.loading("Preparing for print...");
      const blob = await invoiceService.download(invoice._id);
      const url = window.URL.createObjectURL(blob);
      
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = function() {
          toast.dismiss(loadingToast);
          printWindow.print();
        };
      } else {
        toast.dismiss(loadingToast);
        toast.error("Please allow pop-ups to print the invoice");
      }
    } catch (error) {
      console.error("Error printing invoice:", error);
      toast.error(error.message || "Failed to print invoice");
    }
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedInvoice(null);
    navigate("/invoices");
  };

  const handleEditInvoice = (invoice) => {
    if (!invoice || !invoice._id) {
      toast.error("Invalid invoice data");
      return;
    }
    navigate(`/invoices/${invoice._id}/edit`);
  };

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
    
    const quantity = Number(updatedItems[index].quantity) || 0;
    const rate = Number(updatedItems[index].rate) || 0;
    updatedItems[index].amount = quantity * rate;
    
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

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
        
        try {
          const updatedInvoiceResponse = await invoiceService.getById(id);
          createdInvoice = updatedInvoiceResponse?.invoice || updatedInvoiceResponse?.data?.invoice || updatedInvoiceResponse?.data;
        } catch (fetchError) {
          console.error("Error fetching updated invoice:", fetchError);
          createdInvoice = { ...invoiceData, _id: id };
        }
      } else {
        response = await invoiceService.create(invoiceData);
        toast.success(`${invoiceType === 'client' ? 'Invoice' : 'Bill'} created successfully`);
        clearDraft();
        
        createdInvoice = response?.invoice || response?.data?.invoice || response?.data;
      }

      if (createdInvoice) {
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

        setSelectedInvoice(normalizedInvoice);
        setIsDetailModalOpen(true);
      } else {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <RecipientIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? currentConfig.editLabel : currentConfig.createLabel}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {stepConfigs[currentStep].description}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              icon={ArrowLeft}
              onClick={handleCancel}
            >
              Back to Invoices
            </Button>
          </div>

          {/* Step Indicator */}
          <StepIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            stepConfigs={stepConfigs}
            onStepClick={jumpToStep}
          />

          {/* Draft Banner */}
          {hasDraft && !isEditMode && window.__invoiceFormDraft && (
            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-300">
                      Unsaved draft available
                    </p>
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                      From {new Date(window.__invoiceFormDraft.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
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
                  >
                    Restore
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
                  >
                    Discard
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Recipient Selection */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
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
                  </div>

                  <div className="p-6">
                    <Input
                      icon={Search}
                      placeholder={`Search ${currentConfig.recipientLabel.toLowerCase()}s...`}
                      value={recipientSearch}
                      onChange={(e) => setRecipientSearch(e.target.value)}
                      className="mb-6"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
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
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
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
                      <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-800 dark:text-red-400">
                            {errors.client || errors.partner}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Selection */}
                {selectedRecipient && (
                  <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
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
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="lg:col-span-1">
                <PriceSummary
                  subtotal={calculations.subtotal}
                  tax={calculations.tax}
                  discountAmount={calculations.discountAmount}
                  totalAmount={calculations.totalAmount}
                />
              </div>
            </div>
          )}

          {/* Step 2: Items & Pricing */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
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
                  </div>

<div className="p-4 space-y-4">
  {formData.items.map((item, index) => (
    <div
      key={index}
      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm"
    >
      <div className="space-y-4">
        {/* Description Input */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <Input
            value={item.description}
            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
            placeholder="Enter service description"
            error={errors[`items[${index}].description`]}
            className="w-full"
          />
          {errors[`items[${index}].description`] && (
            <p className="text-red-500 text-xs mt-1">Description is required</p>
          )}
        </div>

        {/* Quantity, Rate, Amount Row */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity
            </label>
            <Input
              type="number"
              min="1"
              step="1"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              error={errors[`items[${index}].quantity`]}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rate
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={item.rate}
              onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
              error={errors[`items[${index}].rate`]}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <Input
              type="number"
              value={item.amount}
              disabled
              className="w-full bg-gray-50 dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Item Total and Remove Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Item Total:</span>
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
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <PriceSummary
                  subtotal={calculations.subtotal}
                  tax={calculations.tax}
                  discountAmount={calculations.discountAmount}
                  totalAmount={calculations.totalAmount}
                />

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
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
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Invoice Dates
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Set issue and due dates
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <CreditCard className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Payment Settings
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Configure payment method and currency
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <FileText className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Additional Information
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Add notes and terms
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
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
                </div>
              </div>

              <div className="lg:col-span-1">
                <PriceSummary
                  subtotal={calculations.subtotal}
                  tax={calculations.tax}
                  discountAmount={calculations.discountAmount}
                  totalAmount={calculations.totalAmount}
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
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
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            {currentConfig.recipientLabel} Information
                          </h3>
                          {selectedRecipientDetails && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
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
                              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
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
                </div>
              </div>

              <div className="lg:col-span-1">
                <PriceSummary
                  subtotal={calculations.subtotal}
                  tax={calculations.tax}
                  discountAmount={calculations.discountAmount}
                  totalAmount={calculations.totalAmount}
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-gray-700">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  icon={ChevronLeft}
                  onClick={prevStep}
                >
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {currentStep >= 2 && (
                <div className="text-right px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Total Amount
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
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
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  icon={Save}
                  loading={loading}
                  className="min-w-[200px]"
                >
                  {isEditMode 
                    ? `Update ${invoiceType === 'client' ? 'Invoice' : 'Bill'}` 
                    : `Create ${invoiceType === 'client' ? 'Invoice' : 'Bill'}`}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {isDetailModalOpen && selectedInvoice && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
          title="Invoice Created Successfully!"
          size="lg"
        >
          <div className="p-6 space-y-6">
            {/* Success Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isEditMode ? 'Invoice Updated!' : 'Invoice Created!'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditMode 
                  ? 'Your invoice has been updated successfully.' 
                  : 'Your invoice has been created successfully.'}
              </p>
            </div>

            {/* Invoice Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    #{selectedInvoice.invoiceNumber}
                  </span>
                </div>
                <Badge 
                  color={
                    selectedInvoice.status === "paid" ? "green" :
                    selectedInvoice.status === "sent" ? "blue" : "orange"
                  }
                >
                  {selectedInvoice.status?.charAt(0).toUpperCase() + selectedInvoice.status?.slice(1) || 'Draft'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Recipient:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedInvoice.recipientName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <p className="font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(selectedInvoice.dueDate)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Type:</span>
                  <div className="flex items-center gap-1">
                    {selectedInvoice.invoiceType === 'client' ? (
                      <><Users className="w-4 h-4" /><span>Client Invoice</span></>
                    ) : (
                      <><Briefcase className="w-4 h-4" /><span>Partner Bill</span></>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
              <Button
                variant="outline"
                icon={Eye}
                onClick={() => {
                  handleCloseModal();
                  navigate(`/invoices`);
                }}
                className="flex-col h-auto py-3"
              >
                <span className="text-xs">View All</span>
                <span className="font-semibold">Invoices</span>
              </Button>

              <Button
                variant="outline"
                icon={Download}
                onClick={() => handleDownloadInvoice(selectedInvoice)}
                className="flex-col h-auto py-3"
              >
                <span className="text-xs">Download</span>
                <span className="font-semibold">PDF</span>
              </Button>

              <Button
                variant="outline"
                icon={Printer}
                onClick={() => handlePrintInvoice(selectedInvoice)}
                className="flex-col h-auto py-3"
              >
                <span className="text-xs">Print</span>
                <span className="font-semibold">Invoice</span>
              </Button>

              {selectedInvoice.status === 'draft' && (
                <Button
                  variant="primary"
                  icon={Send}
                  onClick={() => handleSendInvoice(selectedInvoice)}
                  className="flex-col h-auto py-3"
                >
                  <span className="text-xs">Send to</span>
                  <span className="font-semibold">{selectedInvoice.recipientName}</span>
                </Button>
              )}
            </div>

            {/* Additional Actions */}
            <div className="flex justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handleCloseModal}
              >
                Close
              </Button>
              <Button
                variant="outline"
                icon={Edit}
                onClick={() => {
                  handleEditInvoice(selectedInvoice);
                  handleCloseModal();
                }}
              >
                Edit Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceFormPage;