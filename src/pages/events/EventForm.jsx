import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Users,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  UserPlus,
  Building,
  Tag,
  FileText,
  Search,
  Check,
  User,
  CreditCard,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  eventService,
  clientService,
  partnerService,
  paymentService,
} from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

const EventForm = ({
  isOpen,
  onClose,
  eventId: modalEventId,
  onSuccess,
  initialDate,
}) => {
  const { id: urlEventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine mode and event ID
  const isModal = isOpen !== undefined;
  const eventId = isModal ? modalEventId : urlEventId;
  const isEditMode = !!eventId;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    clientId: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    guestCount: "",
    status: "pending",
    pricing: { basePrice: "", discount: "" },
    partners: [],
    notes: "",
    payment: {
      amount: "",
      paymentMethod: "cash",
      paymentDate: new Date().toISOString().split("T")[0],
      status: "pending",
      notes: "",
    },
  });

  // UI state
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [newPartner, setNewPartner] = useState({ partner: "", cost: "" });
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [prefilledClientData, setPrefilledClientData] = useState(null);

  // Options
  const eventTypeOptions = [
    { value: "", label: "Select Event Type" },
    { value: "wedding", label: "Wedding" },
    { value: "birthday", label: "Birthday" },
    { value: "corporate", label: "Corporate" },
    { value: "conference", label: "Conference" },
    { value: "party", label: "Party" },
    { value: "other", label: "Other" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const paymentMethodOptions = [
    { value: "cash", label: "Cash" },
    { value: "credit_card", label: "Credit Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "check", label: "Check" },
    { value: "mobile_payment", label: "Mobile Payment" },
  ];

  const paymentStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "failed", label: "Failed" },
  ];

  // Calculations
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(formData.pricing.basePrice) || 0;
    const discount = parseFloat(formData.pricing.discount) || 0;
    const partnersCost = formData.partners.reduce(
      (total, partner) => total + (parseFloat(partner.cost) || 0),
      0
    );
    return Math.max(0, basePrice + partnersCost - discount);
  };

  const totalPrice = calculateTotalPrice();

  // Filter clients
  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.phone?.includes(clientSearch)
  );

  // Data fetching
  const fetchDropdownData = async () => {
    try {
      const [clientsRes, partnersRes] = await Promise.all([
        clientService.getAll({ limit: 100 }),
        partnerService.getAll({ limit: 100 }),
      ]);

      const extractArrayData = (
        response,
        possibleKeys = ["clients", "partners", "data"]
      ) => {
        if (!response) return [];
        if (Array.isArray(response)) return response;
        for (const key of possibleKeys) {
          if (response[key] && Array.isArray(response[key]))
            return response[key];
          if (response?.data?.[key] && Array.isArray(response.data[key]))
            return response.data[key];
        }
        if (Array.isArray(response.data)) return response.data;
        for (const key in response) {
          if (Array.isArray(response[key])) return response[key];
        }
        return [];
      };

      const clientsList = extractArrayData(clientsRes, ["clients", "data"]);
      const partnersList = extractArrayData(partnersRes, ["partners", "data"]);

      setClients(clientsList);
      setPartners(partnersList);

      // ✅ FIXED: Apply prefill after clients are loaded
      const prefillClient = location.state?.prefillClient;
      if (prefillClient && prefillClient._id && !isEditMode) {
        setPrefilledClientData(prefillClient);
        setSelectedClient(prefillClient._id);
        setFormData((prev) => ({ ...prev, clientId: prefillClient._id }));

        // Clear error if exists
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.clientId;
          return newErrors;
        });

        toast.success(`Client "${prefillClient.name}" pre-selected`);
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
      toast.error("Failed to load clients and partners");
      setClients([]);
      setPartners([]);
    }
  };

  // Effects
  useEffect(() => {
    if (isModal ? isOpen : true) {
      fetchDropdownData();
    }
  }, [isModal ? isOpen : true]);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!isEditMode || !eventId) return;

      try {
        setFetchLoading(true);
        const response = await eventService.getById(eventId);
        const event = response.event || response.data || response;

        if (!event) {
          throw new Error("Event not found");
        }

        // ✅ FIXED: Better data extraction
        const clientIdValue = event.clientId?._id || event.clientId || "";
        const clientName = event.clientId?.name || "";

        setFormData({
          title: event.title || "",
          description: event.description || "",
          type: event.type || "",
          clientId: clientIdValue,
          startDate: event.startDate
            ? new Date(event.startDate).toISOString().split("T")[0]
            : "",
          endDate: event.endDate
            ? new Date(event.endDate).toISOString().split("T")[0]
            : "",
          startTime: event.startTime || "",
          endTime: event.endTime || "",
          guestCount: event.guestCount || "",
          status: event.status || "pending",
          pricing: {
            basePrice: event.pricing?.basePrice || "",
            discount: event.pricing?.discount || "",
          },
          partners:
            event.partners?.map((p) => ({
              partner: p.partner?._id || p.partner,
              partnerName:
                p.partner?.name || p.partnerName || "Unknown Partner",
              service: p.service || "General Service",
              cost: p.cost || 0,
              status: p.status || "pending",
            })) || [],
          notes: event.notes || "",
          payment: {
            amount: "",
            paymentMethod: "cash",
            paymentDate: new Date().toISOString().split("T")[0],
            status: "pending",
            notes: "",
          },
        });

        if (clientIdValue) {
          setSelectedClient(clientIdValue);
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.clientId;
            return newErrors;
          });
        }

        toast.success("Event loaded successfully");
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error(error.message || "Failed to load event data");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, isEditMode]);

  useEffect(() => {
    if (initialDate && !isEditMode) {
      const dateString = initialDate.toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        startDate: dateString,
        endDate: dateString,
      }));
    }
  }, [initialDate, isEditMode]);

  // Event handlers
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("pricing.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        pricing: { ...prev.pricing, [field]: value },
      }));
    } else if (name.startsWith("payment.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        payment: { ...prev.payment, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddPartner = () => {
    if (!newPartner.partner) {
      toast.error("Please select a partner first");
      return;
    }

    const selectedPartner = partners.find((p) => p._id === newPartner.partner);
    if (!selectedPartner) {
      toast.error("Partner not found");
      return;
    }

    const isAlreadyAdded = formData.partners.some(
      (p) => p.partner === newPartner.partner
    );
    if (isAlreadyAdded) {
      toast.error(`${selectedPartner.name} is already added to this event`);
      return;
    }

    const partnerCost = selectedPartner.hourlyRate || 0;
    setFormData((prev) => ({
      ...prev,
      partners: [
        ...prev.partners,
        {
          partner: newPartner.partner,
          partnerName: selectedPartner.name,
          service: selectedPartner.category || "General Service",
          cost: partnerCost,
          status: "pending",
        },
      ],
    }));

    setNewPartner({ partner: "", cost: "" });
    toast.success(`${selectedPartner.name} added to event`);
  };

  const handleRemovePartner = (index) => {
    const partnerToRemove = formData.partners[index];
    setFormData((prev) => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index),
    }));
    toast.success(`${partnerToRemove.partnerName || "Partner"} removed`);
  };

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast.error("Client name is required");
      return;
    }

    try {
      setIsCreatingClient(true);
      const response = await clientService.create(newClient);

      let createdClient =
        response?.client ||
        response?.data?.client ||
        response?.data ||
        response;

      if (!createdClient || !createdClient._id) {
        console.error("Invalid client response:", response);
        throw new Error("Invalid client response structure");
      }

      setClients((prev) => [...prev, createdClient]);
      setSelectedClient(createdClient._id);
      setFormData((prev) => ({ ...prev, clientId: createdClient._id }));

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.clientId;
        return newErrors;
      });

      setNewClient({ name: "", email: "", phone: "" });
      toast.success(`Client "${createdClient.name}" created and selected!`);
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error(error.response?.data?.message || "Failed to create client");
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleSelectClient = (clientId) => {
    setSelectedClient(clientId);
    setFormData((prev) => ({ ...prev, clientId }));
    setPrefilledClientData(null); // Clear prefill indicator

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.clientId;
      return newErrors;
    });
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Event title is required";
      if (!formData.type) newErrors.type = "Event type is required";
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.endDate) newErrors.endDate = "End date is required";
      if (
        formData.startDate &&
        formData.endDate &&
        new Date(formData.endDate) < new Date(formData.startDate)
      ) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (step === 2) {
      if (!formData.clientId && !selectedClient) {
        newErrors.clientId = "Please select or create a client";
      }
    }

    if (step === 3) {
      if (
        !formData.pricing.basePrice ||
        parseFloat(formData.pricing.basePrice) < 0
      ) {
        newErrors["pricing.basePrice"] = "Valid base price is required";
      }
    }

    if (step === 4) {
      if (
        formData.payment.amount &&
        parseFloat(formData.payment.amount) > totalPrice
      ) {
        newErrors["payment.amount"] =
          "Payment amount cannot exceed total price";
      }
      if (formData.payment.amount && parseFloat(formData.payment.amount) < 0) {
        newErrors["payment.amount"] = "Payment amount cannot be negative";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Please fix the form errors before continuing");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FIXED: Only validate current step, not all steps
    if (!validateStep(currentStep)) {
      toast.error("Please fix the form errors");
      return;
    }

    // If not on the last step, continue to next step
    if (currentStep < totalSteps) {
      nextStep();
      return;
    }

    // Only submit when on the last step
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        guestCount: formData.guestCount
          ? parseInt(formData.guestCount)
          : undefined,
        pricing: {
          basePrice: parseFloat(formData.pricing.basePrice) || 0,
          discount: formData.pricing.discount
            ? parseFloat(formData.pricing.discount)
            : 0,
          totalAmount: totalPrice,
        },
      };

      // Remove payment data from event submission
      delete submitData.payment;

      let response;
      if (isEditMode) {
        response = await eventService.update(eventId, submitData);
        toast.success("Event updated successfully");
      } else {
        response = await eventService.create(submitData);
        toast.success("Event created successfully");
      }

      // Create payment if payment data is provided
      if (formData.payment.amount && parseFloat(formData.payment.amount) > 0) {
        try {
          const event = response.event || response.data || response;
          const paymentData = {
            event: event._id || eventId,
            client: formData.clientId,
            amount: parseFloat(formData.payment.amount),
            method: formData.payment.paymentMethod,
            status: formData.payment.status,
            description: formData.payment.notes || "Initial event payment",
            paidDate: formData.payment.paymentDate,
            type: "income",
          };

          await paymentService.create(paymentData);
          toast.success("Payment recorded successfully");
        } catch (paymentError) {
          console.error("Error creating payment:", paymentError);
          toast.error("Event saved but failed to record payment");
        }
      }

      // Handle return URL from location state
      const returnUrl = location.state?.returnUrl;

      if (onSuccess) {
        onSuccess(response);
      } else if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate("/events");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} event`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      type: "",
      clientId: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      guestCount: "",
      status: "pending",
      pricing: { basePrice: "", discount: "" },
      partners: [],
      notes: "",
      payment: {
        amount: "",
        paymentMethod: "cash",
        paymentDate: new Date().toISOString().split("T")[0],
        status: "pending",
        notes: "",
      },
    });
    setErrors({});
    setCurrentStep(1);
    setSelectedClient(null);
    setPrefilledClientData(null);
    setNewClient({ name: "", email: "", phone: "" });
    setNewPartner({ partner: "", cost: "" });
    setClientSearch("");

    if (isModal && onClose) {
      onClose();
    } else {
      const returnUrl = location.state?.returnUrl;
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate("/events");
      }
    }
  };

  // Don't render if modal is closed
  if (isModal && !isOpen) return null;

  // Loading state
  if (fetchLoading) {
    const LoadingSpinner = (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading event data...
          </p>
        </div>
      </div>
    );

    if (isModal) {
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg p-8">
              {LoadingSpinner}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        {LoadingSpinner}
      </div>
    );
  }

  const stepConfigs = {
    1: {
      title: "Event Details",
      icon: Calendar,
      description: "Set up the core details of your event",
      color: "blue",
    },
    2: {
      title: "Client Selection",
      icon: UserPlus,
      description: "Select existing client or create a new one",
      color: "green",
    },
    3: {
      title: "Pricing & Partners",
      icon: DollarSign,
      description: "Configure pricing and add service partners",
      color: "purple",
    },
    4: {
      title: "Payment",
      icon: CreditCard,
      description: "Record initial payment (optional)",
      color: "indigo",
    },
    5: {
      title: "Review & Notes",
      icon: FileText,
      description: "Final review and additional notes",
      color: "orange",
    },
  };

  const currentStepConfig = stepConfigs[currentStep];

  // Form content (shared between modal and page)
  const formContent = (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-600 px-6 py-6 border-b-2 border-orange-200 dark:border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <currentStepConfig.icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? "Edit Event" : "Create New Event"}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                {currentStepConfig.description}
              </p>
            </div>
          </div>
          {isModal ? (
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={handleClose}
              className="hover:bg-red-50 hover:text-red-600"
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={ArrowLeft}
              onClick={handleClose}
            >
              Back
            </Button>
          )}
        </div>

        {/* Enhanced Progress Steps */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => {
              const config = stepConfigs[step];
              const isActive = step === currentStep;
              const isComplete = step < currentStep;

              return (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg scale-110"
                          : isComplete
                            ? "bg-gradient-to-br from-green-500 to-green-600 border-green-500 text-white shadow-md"
                            : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400"
                      }`}
                    >
                      {isComplete ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="font-bold">{step}</span>
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

      {/* Form Content */}
      <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
        {/* Step 1: Event Details */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Updated gradients to match your color system */}
              <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Event Details
                    </h4>
                  </div>
                  <div className="space-y-4 w-full">
                    <Input
                      label="Event Title "
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={errors.title}
                      required
                      className="w-full"
                    />

                    <Select
                      label="Event Type "
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      options={eventTypeOptions}
                      error={errors.type}
                      required
                    />

                    <Select
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      options={statusOptions}
                    />
                  </div>
                </div>
              </Card>

              <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Date & Time
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Start Date *"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        error={errors.startDate}
                        required
                      />
                      <Input
                        label="End Date *"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        error={errors.endDate}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Start Time"
                        name="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={handleChange}
                      />
                      <Input
                        label="End Time"
                        name="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Additional Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Input
                    label="Guest Count"
                    name="guestCount"
                    type="number"
                    min="1"
                    value={formData.guestCount}
                    onChange={handleChange}
                    icon={Users}
                  />
                  <Textarea
                    label="Event Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Event description..."
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Client Selection */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
              <div className="p-5">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" />
                  Create New Client
                </h4>
                <div className="space-y-4">
                  <Input
                    label="Client Name "
                    value={newClient.name}
                    onChange={(e) =>
                      setNewClient((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) =>
                      setNewClient((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                  <Input
                    label="Phone"
                    value={newClient.phone}
                    onChange={(e) =>
                      setNewClient((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                  <Button
                    type="button"
                    variant="primary"
                    icon={Plus}
                    onClick={handleCreateClient}
                    loading={isCreatingClient}
                    className="w-full"
                  >
                    Create Client
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
              <div className="p-5">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-500" />
                  Select Existing Client
                </h4>

                {/* ✅ Enhanced Prefill Indicator */}
                {prefilledClientData && (
                  <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg dark:bg-green-900 dark:border-green-700 animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-300 font-semibold mb-1">
                          <span>Client Pre-selected</span>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-400">
                          <strong>{prefilledClientData.name}</strong>
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                          {prefilledClientData.email} •{" "}
                          {prefilledClientData.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Input
                  icon={Search}
                  placeholder="Search clients..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="mb-4"
                />

                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <div
                        key={client._id}
                        onClick={() => handleSelectClient(client._id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                          selectedClient === client._id
                            ? "bg-orange-50 border-orange-400 shadow-md dark:bg-orange-900 dark:border-orange-500"
                            : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-600 dark:border-gray-600 dark:hover:bg-gray-500"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                selectedClient === client._id
                                  ? "bg-orange-500"
                                  : "bg-gray-400"
                              }`}
                            >
                              {client.name?.charAt(0).toUpperCase() || "C"}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {client.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {client.email} • {client.phone}
                              </div>
                            </div>
                          </div>
                          {selectedClient === client._id && (
                            <div className="flex items-center gap-2">
                              <Check className="w-5 h-5 text-green-500" />
                              <span className="text-xs text-green-600 font-semibold">
                                Selected
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <User className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No clients found</p>
                      <p className="text-sm mt-1">
                        Try a different search or create a new client
                      </p>
                    </div>
                  )}
                </div>
                {errors.clientId && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 dark:bg-red-900/20 dark:border-red-800">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {errors.clientId}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Pricing & Partners */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Base Pricing
                    </h4>
                  </div>
                  <div className="space-y-4">
                    <Input
                      label="Base Price "
                      name="pricing.basePrice"
                      type="number"
                      step="0.01"
                      value={formData.pricing.basePrice}
                      onChange={handleChange}
                      error={errors["pricing.basePrice"]}
                      required
                      prefix="$"
                    />
                    <Input
                      label="Discount"
                      name="pricing.discount"
                      type="number"
                      step="0.01"
                      value={formData.pricing.discount}
                      onChange={handleChange}
                      prefix="$"
                    />
                  </div>
                </div>
              </Card>

              <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Service Partners
                    </h4>
                  </div>
                  <div className="space-y-3">
                    <Select
                      placeholder="Select Partner"
                      value={newPartner.partner}
                      onChange={(e) => {
                        const partnerId = e.target.value;
                        const selectedPartner = partners.find(
                          (p) => p._id === partnerId
                        );
                        if (selectedPartner) {
                          setNewPartner({
                            partner: partnerId,
                            cost: selectedPartner.hourlyRate || 0,
                          });
                        }
                      }}
                      options={[
                        { value: "", label: "Select Partner" },
                        ...partners.map((p) => ({
                          value: p._id,
                          label: `${p.name} - $${p.hourlyRate || 0}/hr`,
                        })),
                      ]}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      icon={Plus}
                      onClick={handleAddPartner}
                      className="w-full"
                      disabled={!newPartner.partner}
                    >
                      Add Partner
                    </Button>

                    {formData.partners.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Added Partners ({formData.partners.length})
                        </p>
                        {formData.partners.map((partner, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {partner.partnerName?.charAt(0).toUpperCase() ||
                                  "P"}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {partner.partnerName}
                                </div>
                                <div className="text-sm text-orange-600 font-semibold">
                                  ${partner.cost}
                                </div>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => handleRemovePartner(idx)}
                              className="hover:bg-red-50 hover:text-red-600"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            <Card className="border-l-4 border-l-orange-500 shadow-lg bg-orange-50 dark:bg-gray-700">
              <div className="p-6">
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                  Price Summary
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-600 rounded-lg shadow text-center transform hover:scale-105 transition-transform">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Base Price
                    </div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      $
                      {(parseFloat(formData.pricing.basePrice) || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-600 rounded-lg shadow text-center transform hover:scale-105 transition-transform">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Partners
                    </div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      $
                      {formData.partners
                        .reduce((t, p) => t + (parseFloat(p.cost) || 0), 0)
                        .toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-600 rounded-lg shadow text-center transform hover:scale-105 transition-transform">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Discount
                    </div>
                    <div className="font-bold text-lg text-red-600">
                      -$
                      {(parseFloat(formData.pricing.discount) || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg text-center transform hover:scale-110 transition-transform">
                    <div className="text-xs text-orange-100 mb-1 font-semibold">
                      Total Price
                    </div>
                    <div className="font-bold text-2xl text-white">
                      ${totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Payment Information */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Record Initial Payment (Optional)
                  </h4>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input
                      label="Payment Amount"
                      name="payment.amount"
                      type="number"
                      step="0.01"
                      value={formData.payment.amount}
                      onChange={handleChange}
                      error={errors["payment.amount"]}
                      prefix="$"
                      placeholder="0.00"
                    />

                    <Select
                      label="Payment Method"
                      name="payment.paymentMethod"
                      value={formData.payment.paymentMethod}
                      onChange={handleChange}
                      options={paymentMethodOptions}
                    />

                    <Input
                      label="Payment Date"
                      name="payment.paymentDate"
                      type="date"
                      value={formData.payment.paymentDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-4">
                    <Select
                      label="Payment Status"
                      name="payment.status"
                      value={formData.payment.status}
                      onChange={handleChange}
                      options={paymentStatusOptions}
                    />

                    <Textarea
                      label="Payment Notes"
                      name="payment.notes"
                      value={formData.payment.notes}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Any notes about this payment..."
                    />

                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg dark:bg-blue-900/30 dark:border-blue-700">
                      <div className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
                        <div className="flex justify-between items-center">
                          <strong>Total Event Price:</strong>
                          <span className="text-lg font-bold">
                            ${totalPrice.toFixed(2)}
                          </span>
                        </div>
                        {formData.payment.amount &&
                          parseFloat(formData.payment.amount) > 0 && (
                            <>
                              <div className="flex justify-between items-center border-t pt-2 border-blue-300 dark:border-blue-700">
                                <strong>Initial Payment:</strong>
                                <span className="text-lg font-bold text-green-600">
                                  $
                                  {parseFloat(formData.payment.amount).toFixed(
                                    2
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between items-center border-t pt-2 border-blue-300 dark:border-blue-700">
                                <strong>Remaining Balance:</strong>
                                <span className="text-lg font-bold text-orange-600">
                                  $
                                  {(
                                    totalPrice -
                                    parseFloat(formData.payment.amount || 0)
                                  ).toFixed(2)}
                                </span>
                              </div>
                            </>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
              <AlertCircle className="w-5 h-5" />
              <p>
                This step is optional. You can record payments later from the
                payments section.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Review & Notes */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                <div className="p-5">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Event Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">
                        Title:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.title || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">
                        Type:
                      </span>
                      <Badge className="capitalize">
                        {formData.type || "N/A"}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">
                        Status:
                      </span>
                      <Badge
                        variant={
                          formData.status === "confirmed"
                            ? "success"
                            : "warning"
                        }
                        className="capitalize"
                      >
                        {formData.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between py-2 border-b dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">
                        Date:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.startDate || "N/A"}{" "}
                        {formData.startDate !== formData.endDate &&
                          `to ${formData.endDate}`}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">
                        Client:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {clients.find((c) => c._id === formData.clientId)
                          ?.name || "N/A"}
                      </span>
                    </div>
                    {formData.guestCount && (
                      <div className="flex justify-between py-2 border-t dark:border-gray-600">
                        <span className="text-gray-600 dark:text-gray-400">
                          Guests:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formData.guestCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                <div className="p-5">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Financial Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Base Price:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        $
                        {(parseFloat(formData.pricing.basePrice) || 0).toFixed(
                          2
                        )}
                      </span>
                    </div>
                    {formData.partners.length > 0 && (
                      <div className="border-t pt-2 dark:border-gray-600">
                        <p className="text-gray-600 dark:text-gray-400 mb-1 font-medium">
                          Partners:
                        </p>
                        {formData.partners.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between py-1 text-xs text-gray-600 dark:text-gray-400 pl-4"
                          >
                            <span>• {p.partnerName}:</span>
                            <span>${p.cost?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {formData.pricing.discount &&
                      parseFloat(formData.pricing.discount) > 0 && (
                        <div className="flex justify-between py-2 border-t dark:border-gray-600">
                          <span className="text-gray-600 dark:text-gray-400">
                            Discount:
                          </span>
                          <span className="font-medium text-red-600">
                            -${parseFloat(formData.pricing.discount).toFixed(2)}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between pt-3 border-t-2 border-orange-200 dark:border-orange-700 font-bold text-lg">
                      <span className="text-gray-900 dark:text-white">
                        Total:
                      </span>
                      <span className="text-orange-600">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                    {formData.payment.amount &&
                      parseFloat(formData.payment.amount) > 0 && (
                        <>
                          <div className="flex justify-between py-2 border-t dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">
                              Initial Payment:
                            </span>
                            <span className="font-medium text-green-600">
                              ${parseFloat(formData.payment.amount).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-t-2 border-gray-300 dark:border-gray-600 font-bold">
                            <span className="text-gray-900 dark:text-white">
                              Remaining:
                            </span>
                            <span className="text-orange-600">
                              $
                              {(
                                totalPrice -
                                parseFloat(formData.payment.amount || 0)
                              ).toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              </Card>
            </div>

            <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
              <div className="p-5">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Additional Notes
                </h4>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Add any additional notes about this event..."
                  maxLength={1000}
                  showCount
                />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t-2 border-gray-200 dark:border-gray-600">
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
            {currentStep >= 3 && (
              <div className="text-right px-4 py-2 bg-white dark:bg-gray-600 rounded-lg shadow">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Total Amount
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  ${totalPrice.toFixed(2)}
                </div>
              </div>
            )}
            {currentStep < totalSteps ? (
              <Button
                type="submit"
                variant="primary"
                icon={ChevronRight}
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
                {isEditMode ? "Update Event" : "Create Event"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  );

  // Return modal or page layout
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20">
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
            onClick={handleClose}
          ></div>
          <div className="relative inline-block align-middle w-full max-w-6xl">
            <div className="transform transition-all animate-in zoom-in-95 duration-300">
              {formContent}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page layout
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">{formContent}</div>
      </div>
    </div>
  );
};

export default EventForm;
