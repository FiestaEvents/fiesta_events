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
  FileText,
  Search,
  Check,
  User,
  CreditCard,
  ArrowLeft,
  AlertCircle,
  Percent,
  MapPin,
  Info,
  AlertTriangle,
  History,
  FileCheck,
  TrendingUp,
  TrendingDown,
  XIcon,
} from "lucide-react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  eventService,
  clientService,
  partnerService,
  venueService,
  invoiceService,
} from "../../api/index";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
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
  venuePrice,
  partnersTotal,
  discount,
  discountType,
  totalPrice,
  visible,
}) => {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-orange-200 dark:border-orange-700 p-4 min-w-[280px]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
          <DollarSign className="w-5 h-5 text-orange-500" />
          <h4 className="font-bold text-gray-900 dark:text-white">
            Price Summary
          </h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Venue:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${venuePrice.toFixed(2)}
            </span>
          </div>

          {partnersTotal > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Partners:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${partnersTotal.toFixed(2)}
              </span>
            </div>
          )}

          {discount > 0 && (
            <div className="flex justify-between text-red-600">
              <span>Discount:</span>
              <span className="font-semibold">
                -
                {discountType === "percentage"
                  ? `${discount}%`
                  : `$${discount.toFixed(2)}`}
              </span>
            </div>
          )}

          <div className="pt-2 border-t-2 border-orange-200 dark:border-orange-700 flex justify-between">
            <span className="font-bold text-gray-900 dark:text-white">
              Total:
            </span>
            <span className="font-bold text-2xl text-orange-600">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Price comparison indicator */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Info className="w-4 h-4" />
            <span>Real-time calculation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
// ============================================
// MAIN EVENT FORM COMPONENT
// ============================================
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
  const isModal = isOpen !== undefined;
  const eventId = isModal ? modalEventId : urlEventId;
  const isEditMode = !!eventId;
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  // ============================================
  // FORM STATE - ENHANCED
  // ============================================
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    venueId: "",
    clientId: "",
    sameDayEvent: true,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    guestCount: "",
    status: "pending",
    pricing: {
      basePrice: "",
      discount: "",
      discountType: "fixed",
    },
    partners: [],
    notes: "",
    payment: {
      amount: "",
      paymentMethod: "cash",
      paymentDate: new Date().toISOString().split("T")[0],
      status: "pending",
      notes: "",
    },
    createInvoice: false, // NEW: Auto-generate invoice
  });
  // ============================================
  // UI STATE
  // ============================================
  const [venues, setVenues] = useState([]);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [existingEvents, setExistingEvents] = useState([]); // NEW: For availability check
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({}); // NEW: Non-blocking warnings
  const [selectedPartner, setSelectedPartner] = useState("");
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [prefilledClientData, setPrefilledClientData] = useState(null);
  const [hasDraft, setHasDraft] = useState(false); // NEW: Draft detection
  // ============================================
  // AUTO-SAVE DRAFT FUNCTIONALITY
  // ============================================
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
  // Load draft on mount
  useEffect(() => {
    if (!isEditMode && !eventId) {
      const draft = localStorage.getItem("eventFormDraft");
      if (draft) {
        try {
          const {
            formData: savedData,
            currentStep: savedStep,
            timestamp,
          } = JSON.parse(draft);
          const draftAge = Date.now() - new Date(timestamp).getTime();
          const oneDayMs = 24 * 60 * 60 * 1000;
          if (draftAge < oneDayMs) {
            setHasDraft(true);
            // Store the draft data for the restore function
            window.__eventFormDraft = { savedData, savedStep, timestamp };
          }
        } catch (error) {
          console.error("Error loading draft:", error);
        }
      }
    }
  }, []);
  // Clear draft on successful submission
  const clearDraft = () => {
    localStorage.removeItem("eventFormDraft");
    setHasDraft(false);
  };
  // ============================================
  // SYNC EFFECTS
  // ============================================
  // Sync endDate with startDate when same day event
  useEffect(() => {
    if (formData.sameDayEvent && formData.startDate) {
      setFormData((prev) => ({ ...prev, endDate: prev.startDate }));
    }
  }, [formData.sameDayEvent, formData.startDate]);
  // Update base price when venue changes
  useEffect(() => {
    if (formData.venueId) {
      const venue = venues.find((v) => v._id === formData.venueId);
      if (venue?.pricing?.basePrice) {
        setFormData((prev) => ({
          ...prev,
          pricing: { ...prev.pricing, basePrice: venue.pricing.basePrice },
        }));
      }
    }
  }, [formData.venueId, venues]);
  // ============================================
  // VALIDATION CHECKS
  // ============================================
  // Check venue capacity
  useEffect(() => {
    if (formData.venueId && formData.guestCount) {
      const venue = venues.find((v) => v._id === formData.venueId);
      if (venue) {
        const guestCount = parseInt(formData.guestCount);
        const newWarnings = { ...warnings };
        if (guestCount > venue.capacity.max) {
          newWarnings.guestCount = {
            type: "error",
            message: `Guest count exceeds venue capacity (max: ${venue.capacity.max})`,
          };
        } else if (guestCount < venue.capacity.min) {
          newWarnings.guestCount = {
            type: "warning",
            message: `Guest count below venue minimum (min: ${venue.capacity.min})`,
          };
        } else {
          delete newWarnings.guestCount;
        }

        setWarnings(newWarnings);
      }
    }
  }, [formData.venueId, formData.guestCount, venues]);
  // Check client-venue relationship
  useEffect(() => {
    if (formData.clientId && formData.venueId) {
      const client = clients.find((c) => c._id === formData.clientId);
      const newWarnings = { ...warnings };
      if (client && client.venueId && client.venueId !== formData.venueId) {
        newWarnings.clientVenue = {
          type: "warning",
          message: `This client is registered for a different venue. Continue anyway?`,
        };
      } else {
        delete newWarnings.clientVenue;
      }

      setWarnings(newWarnings);
    }
  }, [formData.clientId, formData.venueId, clients]);
  // Check venue availability (date/time conflicts)
  useEffect(() => {
    if (formData.venueId && formData.startDate && formData.startTime) {
      const conflictingEvents = existingEvents.filter((event) => {
        if (event._id === eventId) return false; // Ignore current event in edit mode
        if (event.venueId !== formData.venueId) return false;
        const eventStart = new Date(
          `${formData.startDate}T${formData.startTime || "00:00"}`
        );
        const eventEnd = new Date(
          `${formData.endDate || formData.startDate}T${formData.endTime || "23:59"}`
        );
        const existingStart = new Date(
          `${event.startDate}T${event.startTime || "00:00"}`
        );
        const existingEnd = new Date(
          `${event.endDate}T${event.endTime || "23:59"}`
        );

        // Check for overlap
        return eventStart < existingEnd && eventEnd > existingStart;
      });

      const newWarnings = { ...warnings };
      if (conflictingEvents.length > 0) {
        newWarnings.dateConflict = {
          type: "error",
          message: `Venue has ${conflictingEvents.length} conflicting event(s) at this time`,
          conflicts: conflictingEvents,
        };
      } else {
        delete newWarnings.dateConflict;
      }

      setWarnings(newWarnings);
    }
  }, [
    formData.venueId,
    formData.startDate,
    formData.endDate,
    formData.startTime,
    formData.endTime,
    existingEvents,
  ]);
  // ============================================
  // CALCULATION HELPERS
  // ============================================
  const calculateEventHours = () => {
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
    } catch (_) {
      return 1;
    }
  };
  const getPartnerCostForHours = (partner, hours) => {
    const rate = partner.hourlyRate || 0;
    return Math.max(0, rate * hours);
  };
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(formData.pricing.basePrice) || 0;
    const hours = calculateEventHours();
    const partnersCost = formData.partners.reduce((total, partner) => {
      return total + getPartnerCostForHours(partner, hours);
    }, 0);
    let discountAmount = 0;
    if (formData.pricing.discount) {
      const discountValue = parseFloat(formData.pricing.discount) || 0;
      if (formData.pricing.discountType === "percentage") {
        discountAmount = (basePrice + partnersCost) * (discountValue / 100);
      } else {
        discountAmount = discountValue;
      }
    }

    return Math.max(0, basePrice + partnersCost - discountAmount);
  };
  const totalPrice = calculateTotalPrice();
  const venuePrice = parseFloat(formData.pricing.basePrice) || 0;
  const partnersTotal = formData.partners.reduce(
    (t, p) => t + getPartnerCostForHours(p, calculateEventHours()),
    0
  );
  // ============================================
  // OPTIONS
  // ============================================
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
    { value: "refunded", label: "Refunded" },
  ];
  // ============================================
  // FILTERED DATA
  // ============================================
  const filteredClients = clients.filter(
    (client) =>
      client.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.email?.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.phone?.includes(clientSearch)
  );
  // ============================================
  // DATA FETCHING
  // ============================================
const fetchDropdownData = async () => {
  try {
    // Use Promise.allSettled to handle potential failures gracefully
    const [clientsRes, partnersRes, venuesRes, eventsRes] = await Promise.allSettled([
      clientService.getAll ? clientService.getAll({ limit: 100 }) : clientService.getClients ? clientService.getClients({ limit: 100 }) : Promise.resolve({ data: [] }),
      partnerService.getAll ? partnerService.getAll({ limit: 100 }) : partnerService.getPartners ? partnerService.getPartners({ limit: 100 }) : Promise.resolve({ data: [] }),
      venueService.getAll ? venueService.getAll({ limit: 100 }) : venueService.getVenues ? venueService.getVenues({ limit: 100 }) : Promise.resolve({ data: [] }),
      eventService.getAll ? eventService.getAll({ limit: 100 }) : eventService.getEvents ? eventService.getEvents({ limit: 100 }) : Promise.resolve({ data: [] }),
    ]);

    // Helper function to extract data from different response formats
    const extractArrayData = (response, serviceName) => {
      if (response.status === 'rejected') {
        console.warn(`Failed to fetch ${serviceName}:`, response.reason);
        return [];
      }
      
      const data = response.value;
      if (!data) return [];
      
      // Handle different response structures
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.clients && Array.isArray(data.clients)) return data.clients;
      if (data.partners && Array.isArray(data.partners)) return data.partners;
      if (data.venues && Array.isArray(data.venues)) return data.venues;
      if (data.events && Array.isArray(data.events)) return data.events;
      
      // If no array found, return empty array
      return [];
    };

    const clientsList = extractArrayData(clientsRes, 'clients');
    const partnersList = extractArrayData(partnersRes, 'partners');
    const venuesList = extractArrayData(venuesRes, 'venues');
    const eventsList = extractArrayData(eventsRes, 'events');

    console.log('Fetched data:', {
      clients: clientsList.length,
      partners: partnersList.length,
      venues: venuesList.length,
      events: eventsList.length
    });

    setClients(clientsList);
    setPartners(partnersList);
    setVenues(venuesList);
    setExistingEvents(eventsList);

    // Handle prefilled client
    const prefillClient = location.state?.prefillClient;
    if (prefillClient && prefillClient._id && !isEditMode) {
      setPrefilledClientData(prefillClient);
      setSelectedClient(prefillClient._id);
      setFormData((prev) => ({ ...prev, clientId: prefillClient._id }));
      toast.success(`Client "${prefillClient.name}" pre-selected`);
    }
  } catch (error) {
    console.error("Error fetching dropdown data:", error);
    toast.error("Failed to load data");
    // Set empty arrays to prevent further errors
    setClients([]);
    setPartners([]);
    setVenues([]);
    setExistingEvents([]);
  }
};
  useEffect(() => {
    if (isModal ? isOpen : true) {
      fetchDropdownData();
    }
  }, [isModal ? isOpen : true]);
  // Fetch event data in edit mode
  useEffect(() => {
    const fetchEvent = async () => {
      if (!isEditMode || !eventId) return;
      try {
        setFetchLoading(true);
        const response = await eventService.getById(eventId);
        const event = response.event || response.data || response;

        if (!event) throw new Error("Event not found");

        const clientIdValue = event.clientId?._id || event.clientId || "";

        setFormData({
          title: event.title || "",
          description: event.description || "",
          type: event.type || "",
          venueId: event.venueId?._id || event.venueId || "",
          clientId: clientIdValue,
          sameDayEvent: event.startDate === event.endDate,
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
            discountType: event.pricing?.discountType || "fixed",
          },
          partners:
            event.partners?.map((p) => ({
              partner: p.partner?._id || p.partner,
              partnerName:
                p.partner?.name || p.partnerName || "Unknown Partner",
              service: p.service || "General Service",
              hourlyRate: p.hourlyRate || p.cost || 0,
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
          createInvoice: false,
        });

        if (clientIdValue) {
          setSelectedClient(clientIdValue);
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
  // ============================================
  // EVENT HANDLERS
  // ============================================
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
    if (!selectedPartner) {
      toast.error("Please select a partner first");
      return;
    }
    const partner = partners.find((p) => p._id === selectedPartner);
    if (!partner) return;

    const isAlreadyAdded = formData.partners.some(
      (p) => p.partner === selectedPartner
    );
    if (isAlreadyAdded) {
      toast.error(`${partner.name} is already added`);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      partners: [
        ...prev.partners,
        {
          partner: selectedPartner,
          partnerName: partner.name,
          service: partner.category || "General Service",
          hourlyRate: partner.hourlyRate || 0,
          status: "confirmed",
        },
      ],
    }));

    setSelectedPartner("");
    toast.success(`${partner.name} added`);
  };
  const handleRemovePartner = (index) => {
    const partner = formData.partners[index];
    setFormData((prev) => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index),
    }));
    toast.success(`${partner.partnerName} removed`);
  };
  const handleCreateClient = async () => {
    if (!newClient.name.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (newClient.email && !/^\S+@\S+\.\S+$/.test(newClient.email)) {
      toast.error("Please enter a valid email");
      return;
    }

    const duplicate = clients.find(
      (c) =>
        c.email?.toLowerCase() === newClient.email?.toLowerCase() ||
        c.phone === newClient.phone
    );

    if (duplicate) {
      toast.error("Client with this email or phone already exists");
      return;
    }

    try {
      setIsCreatingClient(true);
      const response = await clientService.create({
        ...newClient,
        venueId: formData.venueId,
      });

      let createdClient =
        response?.client ||
        response?.data?.client ||
        response?.data ||
        response;

      if (!createdClient || !createdClient._id) {
        throw new Error("Invalid client response structure");
      }

      setClients((prev) => [...prev, createdClient]);
      setSelectedClient(createdClient._id);
      setFormData((prev) => ({ ...prev, clientId: createdClient._id }));
      setNewClient({ name: "", email: "", phone: "" });
      setShowClientForm(false);

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.clientId;
        return newErrors;
      });

      toast.success(`Client "${createdClient.name}" created successfully!`);
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
    setPrefilledClientData(null);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.clientId;
      return newErrors;
    });
  };
  // ============================================
  // VALIDATION
  // ============================================
  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = "Event title is required";
      if (!formData.type) newErrors.type = "Event type is required";
      if (!formData.startDate) newErrors.startDate = "Start date is required";
      if (!formData.sameDayEvent && !formData.endDate) {
        newErrors.endDate = "End date is required";
      }
      if (formData.startTime && formData.endTime && formData.sameDayEvent) {
        if (formData.startTime >= formData.endTime) {
          newErrors.endTime = "End time must be after start time";
        }
      }
    }

    if (step === 2) {
      if (!formData.clientId && !selectedClient) {
        newErrors.clientId = "Please select a client";
      }
    }

    if (step === 3) {
      if (!formData.venueId) {
        newErrors.venueId = "Please select a venue";
      }
      if (
        !formData.pricing.basePrice ||
        parseFloat(formData.pricing.basePrice) < 0
      ) {
        newErrors["pricing.basePrice"] = "Valid base price is required";
      }

      // Check for blocking warnings
      if (warnings.guestCount?.type === "error") {
        newErrors.guestCount = warnings.guestCount.message;
      }
      if (warnings.dateConflict?.type === "error") {
        newErrors.dateConflict = warnings.dateConflict.message;
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
  // NEW: Enhanced step navigation - click on completed steps
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
    if (!validateStep(currentStep)) {
      toast.error("Please fix the form errors");
      return;
    }

    if (currentStep < totalSteps) {
      nextStep();
      return;
    }

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
          discountType: formData.pricing.discountType,
          totalAmount: totalPrice,
        },
      };

      delete submitData.payment;
      delete submitData.createInvoice;
      delete submitData.sameDayEvent;

      let response;
      if (isEditMode) {
        response = await eventService.update(eventId, submitData);
        toast.success("Event updated successfully");
      } else {
        response = await eventService.create(submitData);
        toast.success("Event created successfully");
        clearDraft(); // Clear draft after successful creation
      }

      const createdEvent = response.event || response.data || response;

      // Create payment if provided
      if (formData.payment.amount && parseFloat(formData.payment.amount) > 0) {
        try {
          const paymentData = {
            event: createdEvent._id || eventId,
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

      // NEW: Auto-generate invoice if requested
      if (formData.createInvoice && !isEditMode) {
        try {
          const client = clients.find((c) => c._id === formData.clientId);
          const venue = venues.find((v) => v._id === formData.venueId);

          const invoiceData = {
            venue: formData.venueId,
            client: formData.clientId,
            clientName: client?.name || "",
            clientEmail: client?.email || "",
            clientPhone: client?.phone || "",
            event: createdEvent._id,
            issueDate: new Date(),
            dueDate: new Date(formData.startDate),
            items: [
              {
                description: `${venue?.name || "Venue"} Rental - ${formData.title}`,
                quantity: 1,
                rate: venuePrice,
                amount: venuePrice,
                category: "venue_rental",
              },
              ...formData.partners.map((p) => ({
                description: `${p.partnerName} - ${p.service}`,
                quantity: calculateEventHours(),
                rate: p.hourlyRate,
                amount: getPartnerCostForHours(p, calculateEventHours()),
                category: "service",
              })),
            ],
            subtotal: venuePrice + partnersTotal,
            discount:
              formData.pricing.discountType === "percentage"
                ? ((venuePrice + partnersTotal) *
                    (parseFloat(formData.pricing.discount) || 0)) /
                  100
                : parseFloat(formData.pricing.discount) || 0,
            discountType: formData.pricing.discountType,
            totalAmount: totalPrice,
            status: "draft",
            notes: formData.notes,
          };

          await invoiceService.create(invoiceData);
          toast.success("Invoice created successfully");
        } catch (invoiceError) {
          console.error("Error creating invoice:", invoiceError);
          toast.error("Event saved but failed to create invoice");
        }
      }

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
      venueId: "",
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
    setPrefilledClientData(null);
    setNewClient({ name: "", email: "", phone: "" });
    setSelectedPartner("");
    setClientSearch("");
    setShowClientForm(false);
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
  // ============================================
  // LOADING STATE
  // ============================================
  if (!isModal && !isOpen) return null;
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
  // ============================================
  // STEP CONFIGURATIONS
  // ============================================
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
      title: "Venue & Pricing",
      icon: Building,
      description: "Select venue and configure pricing",
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
  // ============================================
  // FORM CONTENT
  // ============================================
  const formContent = (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-700 dark:to-gray-800/50 px-6 py-6 border-b-2 border-orange-200 dark:border-gray-600">
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
        {/* Draft indicator - IMPROVED: Banner instead of just indicator */}
        {hasDraft && !isEditMode && window.__eventFormDraft && (
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
                    {new Date(
                      window.__eventFormDraft.timestamp
                    ).toLocaleString()}
                  </strong>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your progress has been automatically saved. Restore it to
                  continue where you left off.
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={Check}
                  onClick={() => {
                    const { savedData, savedStep } = window.__eventFormDraft;
                    setFormData(savedData);
                    setCurrentStep(savedStep);
                    setHasDraft(false);
                    delete window.__eventFormDraft;
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
                    localStorage.removeItem("eventFormDraft");
                    setHasDraft(false);
                    delete window.__eventFormDraft;
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
        <div className="mt-6 pl-20">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4, 5].map((step) => {
              const config = stepConfigs[step];
              const isActive = step === currentStep;
              const isComplete = step < currentStep;
              const isClickable = step <= currentStep; // Can click on current or completed steps

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
              <Card className="bg-white dark:bg-gray-800/50">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Event Details
                    </h4>
                  </div>
                  <div className="space-y-4 w-full">
                    <Input
                      label="Event Title *"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={errors.title}
                      required
                      className="w-full"
                    />

                    <Select
                      label="Event Type *"
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

              <Card className="bg-white dark:bg-gray-800/50">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Date & Time
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {/* Same Day Event Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Same Day Event
                      </span>
                      <Toggle
                        enabled={formData.sameDayEvent}
                        onChange={(val) =>
                          setFormData((prev) => ({
                            ...prev,
                            sameDayEvent: val,
                          }))
                        }
                      />
                    </div>

                    {/* Conditional Date Fields */}
                    {formData.sameDayEvent ? (
                      <Input
                        label="Event Date *"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        error={errors.startDate}
                        required
                        className="w-full"
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Start Date *"
                          name="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={handleChange}
                          error={errors.startDate}
                          required
                          className="w-full"
                        />
                        <Input
                          label="End Date *"
                          name="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={handleChange}
                          error={errors.endDate}
                          required
                          className="w-full"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Start Time"
                        name="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={handleChange}
                        className="w-full"
                      />
                      <Input
                        label="End Time"
                        name="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={handleChange}
                        error={errors.endTime}
                        className="w-full"
                      />
                    </div>
                    <Input
                      label="Guest Count"
                      name="guestCount"
                      type="number"
                      min="1"
                      value={formData.guestCount}
                      onChange={handleChange}
                      icon={Users}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            </div>
            <div className="p-5">
              <Textarea
                label="Event Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Event description..."
                className="w-full dark:bg-gray-800/50 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Step 2: Client Selection */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <Card className="border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-blue-500" />
                    Client Selection
                  </h4>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={showClientForm ? X : Plus}
                    onClick={() => setShowClientForm(!showClientForm)}
                  >
                    {showClientForm ? (
                      <XIcon className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {showClientForm ? "Cancel" : "New Client"}
                  </Button>
                </div>

                {/* Client-Venue Warning */}
                {warnings.clientVenue && (
                  <div className="mb-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg dark:bg-yellow-900/20 dark:border-yellow-800 flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                        {warnings.clientVenue.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Slide-in Client Creation Form */}
                {showClientForm && (
                  <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg animate-in slide-in-from-top-2 duration-300">
                    <h5 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Create New Client
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <Input
                        placeholder="Client Name *"
                        value={newClient.name}
                        onChange={(e) =>
                          setNewClient((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                      <Input
                        placeholder="Email"
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
                        placeholder="Phone"
                        value={newClient.phone}
                        onChange={(e) =>
                          setNewClient((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      icon={Check}
                      onClick={handleCreateClient}
                      loading={isCreatingClient}
                      className="w-full"
                    >
                      Create & Select Client
                    </Button>
                  </div>
                )}

                {/* Prefilled Client Info */}
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

                {/* Search & Select Existing Client */}
                <Input
                  icon={Search}
                  placeholder="Search clients by name, email, or phone..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="mb-4 w-full"
                />

                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <div
                        key={client._id}
                        onClick={() => handleSelectClient(client._id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 transform ${
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

        {/* Step 3: Venue & Pricing */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            {/* Venue Selection */}
            <Card className="p-5 border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Venue Selection *
                </h4>
              </div>

              {/* Date Conflict Warning */}
              {warnings.dateConflict && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                      {warnings.dateConflict.message}
                    </p>
                    {warnings.dateConflict.conflicts &&
                      warnings.dateConflict.conflicts.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {warnings.dateConflict.conflicts.map((event, idx) => (
                            <p
                              key={idx}
                              className="text-xs text-red-700 dark:text-red-400"
                            >
                              • {event.title} (
                              {new Date(event.startDate).toLocaleDateString()})
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}

              <Select
                name="venueId"
                value={formData.venueId}
                onChange={handleChange}
                error={errors.venueId}
                required
                options={[
                  { value: "", label: "Select a Venue" },
                  ...venues.map((v) => ({
                    value: v._id,
                    label: `${v.name} - $${v.pricing.basePrice} (${v.capacity.min}-${v.capacity.max} guests)`,
                  })),
                ]}
              />

              {/* Display selected venue details */}
              {formData.venueId && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                  {(() => {
                    const venue = venues.find(
                      (v) => v._id === formData.venueId
                    );
                    return venue ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {venue.name}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Base Price:
                            </span>
                            <p className="font-bold text-purple-600">
                              ${venue.pricing.basePrice}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Capacity:
                            </span>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {venue.capacity.min}-{venue.capacity.max}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">
                              Amenities:
                            </span>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {venue.amenities.length}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {venue.amenities.map((amenity, idx) => (
                            <Badge key={idx} className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Guest Count Warning */}
              {warnings.guestCount && (
                <div
                  className={`mt-4 p-3 border-2 rounded-lg flex items-start gap-2 ${
                    warnings.guestCount.type === "error"
                      ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                      : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                  }`}
                >
                  <AlertTriangle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      warnings.guestCount.type === "error"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      warnings.guestCount.type === "error"
                        ? "text-red-800 dark:text-red-300"
                        : "text-yellow-800 dark:text-yellow-300"
                    }`}
                  >
                    {warnings.guestCount.message}
                  </span>
                </div>
              )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pricing with Discount Type */}
              <Card className="p-5 border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Pricing
                  </h4>
                </div>
                <div className="space-y-4">
                  <Input
                    label="Base Price (from venue)"
                    name="pricing.basePrice"
                    type="number"
                    step="0.01"
                    value={formData.pricing.basePrice}
                    onChange={handleChange}
                    error={errors["pricing.basePrice"]}
                    prefix="$"
                    disabled
                  />

                  {/* Discount with Type Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      Discount
                    </label>
                    <div className="flex gap-2">
                      <Input
                        name="pricing.discount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.pricing.discount}
                        onChange={handleChange}
                        prefix={
                          formData.pricing.discountType === "percentage"
                            ? "%"
                            : "$"
                        }
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            pricing: {
                              ...prev.pricing,
                              discountType:
                                prev.pricing.discountType === "fixed"
                                  ? "percentage"
                                  : "fixed",
                            },
                          }))
                        }
                        className={`px-4 py-2 rounded-lg border-2 font-medium transition-all flex items-center justify-center min-w-[60px] ${
                          formData.pricing.discountType === "percentage"
                            ? "bg-orange-50 border-orange-500 text-orange-700"
                            : "bg-gray-50 border-gray-300 text-gray-700 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200"
                        }`}
                      >
                        {formData.pricing.discountType === "percentage" ? (
                          <Percent className="w-5 h-5" />
                        ) : (
                          "$"
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.pricing.discountType === "percentage"
                        ? "Percentage discount"
                        : "Fixed amount discount"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Partners with Preview */}
              <Card className="p-5 border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-500" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Service Partners
                  </h4>
                </div>
                <div className="space-y-3">
                  {/* Partner Selection with Preview */}
                  <div className="flex gap-2">
                    <Select
                      value={selectedPartner}
                      onChange={(e) => setSelectedPartner(e.target.value)}
                      options={[
                        { value: "", label: "Select Partner" },
                        ...partners.map((p) => ({
                          value: p._id,
                          label: `${p.name} - $${p.hourlyRate}/hr`,
                        })),
                      ]}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      icon={Plus}
                      onClick={handleAddPartner}
                      disabled={!selectedPartner}
                    >
                      Add
                    </Button>
                  </div>

                  {/* Partner Preview */}
                  {selectedPartner && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      {(() => {
                        const partner = partners.find(
                          (p) => p._id === selectedPartner
                        );
                        const hours = calculateEventHours();
                        const cost = partner
                          ? getPartnerCostForHours(partner, hours)
                          : 0;
                        return partner ? (
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {partner.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                ${partner.hourlyRate}/hr × {hours}h = $
                                {cost.toFixed(2)}
                              </p>
                            </div>
                            <Info className="w-4 h-4 text-blue-500" />
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  {/* Added Partners List */}
                  {formData.partners.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                              <div className="text-xs text-gray-600 dark:text-gray-300">
                                ${partner.hourlyRate}/hr ×{" "}
                                {calculateEventHours()}h = $
                                {getPartnerCostForHours(
                                  partner,
                                  calculateEventHours()
                                ).toFixed(2)}
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
              </Card>
            </div>

            {/* Price Summary */}
            <Card className="p-6 border-l-4 border-orange-500 bg-orange-50 dark:bg-gray-700 shadow-lg">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-orange-600" />
                <span className="dark:text-white">Price Summary</span>
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-gray-600 rounded-lg shadow text-center transform hover:scale-105 transition-transform">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Venue Price
                  </div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    ${venuePrice.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-600 rounded-lg shadow text-center transform hover:scale-105 transition-transform">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Partners
                  </div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    ${partnersTotal.toFixed(2)}
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-gray-600 rounded-lg shadow text-center transform hover:scale-105 transition-transform">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Discount
                  </div>
                  <div className="font-bold text-lg text-red-600">
                    -
                    {formData.pricing.discountType === "percentage"
                      ? `${formData.pricing.discount || 0}%`
                      : `$${(parseFloat(formData.pricing.discount) || 0).toFixed(2)}`}
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
            </Card>
          </div>
        )}

        {/* Step 4: Payment Information */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
            <Card className="border-l-4 border-indigo-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-indigo-500" />
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
              <Card className="border-l-4 border-blue-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
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
                    <div className="flex justify-between py-2 border-b dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">
                        Venue:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {venues.find((v) => v._id === formData.venueId)?.name ||
                          "N/A"}
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

              <Card className="border-l-4 border-green-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
                <div className="p-5">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    Financial Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Venue Price:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${venuePrice.toFixed(2)}
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
                            <span>
                              $
                              {getPartnerCostForHours(
                                p,
                                calculateEventHours()
                              ).toFixed(2)}
                            </span>
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
                            -
                            {formData.pricing.discountType === "percentage"
                              ? `${formData.pricing.discount}%`
                              : `$${parseFloat(formData.pricing.discount).toFixed(2)}`}
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

            <Card className="border-l-4 border-purple-500 shadow-md hover:shadow-lg transition-shadow bg-white dark:bg-gray-700">
              <div className="p-5">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
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

            {/* NEW: Auto-generate Invoice Option */}
            {!isEditMode && (
              <Card className="border-l-4 border-indigo-500 shadow-md hover:shadow-lg transition-shadow bg-indigo-50 dark:bg-gray-700">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-6 h-6 text-indigo-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Auto-Generate Invoice
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Create a draft invoice for this event automatically
                        </p>
                      </div>
                    </div>
                    <Toggle
                      enabled={formData.createInvoice}
                      onChange={(val) =>
                        setFormData((prev) => ({ ...prev, createInvoice: val }))
                      }
                    />
                  </div>
                </div>
              </Card>
            )}
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
  // Sticky Price Summary (visible from step 3 onwards)
  const showStickySummary = currentStep >= 3 && formData.venueId;
  // Return modal or page layout
  if (isModal) {
    return (
      <>
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
        {/* Sticky Price Summary */}
        <StickyPriceSummary
          venuePrice={venuePrice}
          partnersTotal={partnersTotal}
          discount={parseFloat(formData.pricing.discount) || 0}
          discountType={formData.pricing.discountType}
          totalPrice={totalPrice}
          visible={showStickySummary}
        />
      </>
    );
  }
  // Page layout
  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">{formContent}</div>
        </div>
      </div>
      {/* Sticky Price Summary */}
      <StickyPriceSummary
        venuePrice={venuePrice}
        partnersTotal={partnersTotal}
        discount={parseFloat(formData.pricing.discount) || 0}
        discountType={formData.pricing.discountType}
        totalPrice={totalPrice}
        visible={showStickySummary}
      />
    </>
  );
};
export default EventForm;
