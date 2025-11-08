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
  Check,
  ArrowLeft,
  CreditCard,
  Building,
  Search,
  AlertCircle,
  Users,
  Briefcase,
  Eye,
  Package,
  Mail,
  Phone,
  Edit2,
  Info,
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

const InvoiceFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(id);
  
  const [invoiceType, setInvoiceType] = useState(
    searchParams.get('type') || 'client'
  );

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

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

  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [events, setEvents] = useState([]);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditMode);
  const [errors, setErrors] = useState({});
  const [recipientSearch, setRecipientSearch] = useState("");

  const [calculations, setCalculations] = useState({
    subtotal: 0,
    tax: 0,
    discountAmount: 0,
    totalAmount: 0,
  });

  // FIXED: Dynamic category options based on invoice type
  const getCategoryOptions = () => {
    if (invoiceType === 'client') {
      return [
        { value: "venue_rental", label: "Venue Rental" },
        { value: "catering", label: "Catering" },
        { value: "decoration", label: "Decoration" },
        { value: "photography", label: "Photography" },
        { value: "music", label: "Music & Entertainment" },
        { value: "security", label: "Security" },
        { value: "cleaning", label: "Cleaning" },
        { value: "audio_visual", label: "Audio Visual" },
        { value: "floral", label: "Floral" },
        { value: "entertainment", label: "Entertainment" },
        { value: "transportation", label: "Transportation" },
        { value: "equipment", label: "Equipment" },
        { value: "other", label: "Other" },
      ];
    } else {
      // For partner invoices, get unique categories from partners
      const partnerCategories = [...new Set(partners
        .filter(partner => partner.category)
        .map(partner => partner.category)
      )].sort();
      
      const categoryOptions = partnerCategories.map(category => ({
        value: category.toLowerCase().replace(/\s+/g, '_'),
        label: category
      }));
      
      // Add "other" as fallback
      categoryOptions.push({ value: "other", label: "Other" });
      
      return categoryOptions;
    }
  };

  const categoryOptions = getCategoryOptions();

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

  const stepConfigs = {
    1: {
      title: "Recipient",
      icon: currentConfig.recipientIcon,
      description: `Select ${currentConfig.recipientLabel.toLowerCase()}`,
    },
    2: {
      title: "Event",
      icon: Calendar,
      description: "Link to an event (optional)",
    },
    3: {
      title: "Items",
      icon: Package,
      description: "Add services and items",
    },
    4: {
      title: "Details",
      icon: FileText,
      description: "Invoice details and terms",
    },
    5: {
      title: "Review",
      icon: Eye,
      description: "Final review",
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

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsResponse, partnersResponse, eventsResponse] = await Promise.all([
          clientService.getAll({ status: "active", limit: 100 }),
          partnerService.getAll({ status: "active", limit: 100 }),
          eventService.getAll({ limit: 100 }),
        ]);

        setClients(clientsResponse?.clients || clientsResponse?.data || []);
        setPartners(partnersResponse?.partners || partnersResponse?.data || []);
        setEvents(eventsResponse?.events || eventsResponse?.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      }
    };

    fetchData();
  }, []);

  // FIXED: Update category options when partners data changes
  useEffect(() => {
    // This will ensure category options are updated when partners are loaded
    if (invoiceType === 'partner' && partners.length > 0) {
      // Force re-render of items with updated categories
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item => ({
          ...item,
          category: item.category || getCategoryOptions()[0]?.value || "other"
        }))
      }));
    }
  }, [partners, invoiceType]);

  // Load invoice in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchInvoice = async () => {
        try {
          setLoadingData(true);
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
                category: item.category || (invoice.invoiceType === 'partner' ? "other" : "venue_rental"),
              })) : [{
                description: "",
                quantity: 1,
                rate: 0,
                amount: 0,
                category: invoice.invoiceType === 'partner' ? "other" : "venue_rental",
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
          setLoadingData(false);
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
    
    // Always recalculate amount when quantity or rate changes
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
    const defaultCategory = invoiceType === 'partner' 
      ? (getCategoryOptions()[0]?.value || "other")
      : "venue_rental";

    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          rate: 0,
          amount: 0,
          category: defaultCategory,
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
                // FIXED: Use partner's category or service type
                const partnerCategory = partner.service?.toLowerCase().replace(/\s+/g, '_') || 
                                      partner.partner?.category?.toLowerCase().replace(/\s+/g, '_') || 
                                      "other";
                
                eventItems.push({
                  description: `${partner.service || 'Service'} - ${event.title}`,
                  quantity: 1,
                  rate: Number(partner.cost),
                  amount: Number(partner.cost),
                  category: partnerCategory,
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

  const getSelectedRecipient = () => {
    const recipients = invoiceType === 'client' ? clients : partners;
    return recipients.find(r => r._id === selectedRecipient);
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

  // FIXED: Proper validation for each step
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

    // Step 2 is optional - no validation needed

    if (step === 3) {
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

    if (step === 4) {
      if (!formData.issueDate) newErrors.issueDate = "Issue date is required";
      if (!formData.dueDate) newErrors.dueDate = "Due date is required";
      if (formData.issueDate && formData.dueDate && new Date(formData.dueDate) < new Date(formData.issueDate)) {
        newErrors.dueDate = "Due date must be after issue date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fix the errors before continuing");
    }
  };

  const prevStep = () => {
    // FIXED: Proper previous step navigation
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: formData.currency || "TND",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

      if (isEditMode) {
        await invoiceService.update(id, invoiceData);
        toast.success(`${invoiceType === 'client' ? 'Invoice' : 'Bill'} updated successfully`);
      } else {
        await invoiceService.create(invoiceData);
        toast.success(`${invoiceType === 'client' ? 'Invoice' : 'Bill'} created successfully`);
      }

      navigate("/invoices");

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

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  const RecipientIcon = currentConfig.recipientIcon;
  const selectedRecipientDetails = getSelectedRecipient();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 bg-white p-6 rounded-md shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                invoiceType === 'client' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
              }`}>
                <RecipientIcon className={`w-8 h-8 ${
                  invoiceType === 'client' ? 'text-orange-600 dark:text-orange-400' : 'text-orange-600 dark:text-orange-400'
                }`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isEditMode ? currentConfig.editLabel : currentConfig.createLabel}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Step {currentStep} of {totalSteps}: {stepConfigs[currentStep].description}
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

          {/* Progress Bar */}
          <div className="relative">
            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                  invoiceType === 'client' ? 'bg-orange-500' : 'bg-orange-500'
                }`}
              />
            </div>
            <div className="flex justify-between mt-4">
              {[1, 2, 3, 4, 5].map((step) => {
                const config = stepConfigs[step];
                const isActive = step === currentStep;
                const isComplete = step < currentStep;
                const StepIcon = config.icon;

                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? invoiceType === 'client'
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-orange-500 border-orange-500 text-white'
                          : isComplete
                            ? 'bg-orange-500 border-orange-500 text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                      }`}
                    >
                      {isComplete ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isActive
                          ? invoiceType === 'client'
                            ? 'text-gray-600 dark:text-blue-400'
                            : 'text-gray-600 dark:text-purple-400'
                          : isComplete
                            ? 'text-gray-600 dark:text-green-400'
                            : 'text-gray-500'
                      }`}
                    >
                      {config.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Recipient Selection */}
          {currentStep === 1 && (
            <Card className="border-0 shadow-lg">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg ${
                    invoiceType === 'client' ? 'bg-orange-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    <RecipientIcon className={`w-6 h-6 ${
                      invoiceType === 'client' ? 'text-gray-600' : 'text-orange-600'
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
                              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                              : 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
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
          )}

          {/* Step 2: Event Selection */}
          {currentStep === 2 && (
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
                      Connect this {invoiceType === 'client' ? 'invoice' : 'bill'} to an event to auto-populate items
                    </p>
                  </div>
                </div>

                {selectedRecipientDetails && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected {currentConfig.recipientLabel}:</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedRecipientDetails.name}</p>
                  </div>
                )}

                <Select
                  label="Select Event"
                  value={formData.event}
                  onChange={(e) => {
                    handleChange("event", e.target.value);
                    handleEventSelect(e.target.value);
                  }}
                >
                  <option value="">No event selected - I'll add items manually</option>
                  {relatedEvents.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.title} - {formatDate(event.startDate)} ({event.type})
                    </option>
                  ))}
                </Select>

                {relatedEvents.length === 0 && selectedRecipient && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                          No events found
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                          No events found for this {currentConfig.recipientLabel.toLowerCase()}. You can skip this step and add items manually.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEvent && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-900 dark:text-green-300">
                          Event Loaded Successfully
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                          <strong>{selectedEvent.title}</strong> - {formatDate(selectedEvent.startDate)}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500 mt-2">
                          Items from this event have been added to the invoice. You can review and modify them in the next step.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Optional Step:</strong> You can skip event selection and proceed to add items manually in the next step.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Items & Pricing - FIXED: Dynamic categories */}
          {currentStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
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
                              <Select
                                label="Category"
                                value={item.category}
                                onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                                options={categoryOptions}
                              />
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                              <div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Amount: </span>
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

              {/* Price Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-6">
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

                      <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tax Rate (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={formData.taxRate}
                            onChange={(e) => handleChange("taxRate", e.target.value)}
                          />
                        </div>

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

          {/* Step 4: Details */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Calendar className="w-6 h-6 text-gray-600" />
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

          {/* Step 5: Review */}
          {currentStep === 5 && (
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
                      Please review all details before creating the {invoiceType === 'client' ? 'invoice' : 'bill'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {currentConfig.recipientLabel}
                      </h3>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {selectedRecipientDetails?.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedRecipientDetails?.email}
                      </p>
                    </div>

                    {selectedEvent && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Event
                        </h3>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {selectedEvent.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(selectedEvent.startDate)}
                        </p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Dates
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Issue: {formatDate(formData.issueDate)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Due: {formatDate(formData.dueDate)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Items ({formData.items.length})
                      </h3>
                      <div className="space-y-2">
                        {formData.items.map((item, index) => (
                          <div key={index} className="text-sm">
                            <p className="text-gray-900 dark:text-white font-medium">
                              {item.description}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              {item.quantity} × {formatCurrency(item.rate)} = {formatCurrency(item.amount)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
                        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-gray-900 dark:text-white">Total:</span>
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
          )}

          {/* Footer Navigation - FIXED: Previous button now works properly */}
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
                    >
                      Previous
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  {currentStep >= 3 && (
                    <div className="text-right px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                      <div className="text-xl font-bold text-orange-600">
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
                      Next: {stepConfigs[currentStep + 1]?.title}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="primary"
                      icon={Save}
                      loading={loading}
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
    </div>
  );
};

export default InvoiceFormPage;