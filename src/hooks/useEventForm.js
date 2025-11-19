// src/components/events/EventForm/hooks/useEventForm.js
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
  eventService,
  clientService,
  partnerService,
  venueSpacesService,
} from "../api/index";

export const useEventForm = (eventId, isEditMode, selectedEvent) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    venueSpaceId: "",
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
      discountType: "fixed" 
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
    createInvoice: false,
  });

  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [venueSpaces, setVenueSpaces] = useState([]);
  const [existingEvents, setExistingEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  // Sync selectedClient with formData.clientId
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      clientId: selectedClient || "",
    }));
  }, [selectedClient]);

  // Sync same day event dates
  useEffect(() => {
    if (formData.sameDayEvent && formData.startDate) {
      setFormData((prev) => ({ ...prev, endDate: prev.startDate }));
    }
  }, [formData.sameDayEvent, formData.startDate]);

  // Enhanced data extraction function
  const extractData = useCallback((response, dataKey = null) => {
    console.log("Extracting data from response:", response);

    if (response.status === "rejected") {
      console.warn("Response was rejected:", response.reason);
      return [];
    }

    const data = response.value;
    console.log("Response value:", data);

    // Check if it's already an array
    if (Array.isArray(data)) {
      console.log("Data is array, length:", data.length);
      return data;
    }

    // Check for data.data.clients (your API structure)
    if (data?.data?.clients && Array.isArray(data.data.clients)) {
      console.log("Found data.data.clients, length:", data.data.clients.length);
      return data.data.clients;
    }

    // Check for data.data.partners
    if (data?.data?.partners && Array.isArray(data.data.partners)) {
      console.log("Found data.data.partners, length:", data.data.partners.length);
      return data.data.partners;
    }

    // Check for data.data.events
    if (data?.data?.events && Array.isArray(data.data.events)) {
      console.log("Found data.data.events, length:", data.data.events.length);
      return data.data.events;
    }

    // Check for data.data.spaces (venue spaces)
    if (data?.data?.spaces && Array.isArray(data.data.spaces)) {
      console.log("Found data.data.spaces, length:", data.data.spaces.length);
      return data.data.spaces;
    }

    // Generic check for data.data as array
    if (data?.data && Array.isArray(data.data)) {
      console.log("Found data.data as array, length:", data.data.length);
      return data.data;
    }

    // Check for data.data.records
    if (data?.data?.records && Array.isArray(data.data.records)) {
      console.log("Found data.data.records, length:", data.data.records.length);
      return data.data.records;
    }

    // Check for specific key if provided
    if (dataKey && data?.[dataKey] && Array.isArray(data[dataKey])) {
      console.log(`Found data.${dataKey}, length:`, data[dataKey].length);
      return data[dataKey];
    }

    console.warn("No matching data structure found, returning empty array");
    return [];
  }, []);

  // Initialize form - fetch all dropdown data
  useEffect(() => {
    const initializeForm = async () => {
      try {
        setFetchLoading(true);

        const [clientsRes, partnersRes, venueSpacesRes, eventsRes] =
          await Promise.allSettled([
            clientService.getAll({ limit: 100 }),
            partnerService.getAll({ limit: 100 }),
            venueSpacesService.getAll({ limit: 100 }),
            eventService.getAll({ limit: 100 }),
          ]);

        // Extract clients
        const clientsList = extractData(clientsRes, "clients");
        console.log("📋 Clients extracted:", clientsList.length, clientsList);
        setClients(clientsList);

        // Extract partners
        const partnersList = extractData(partnersRes, "partners");
        console.log("🤝 Partners extracted:", partnersList.length, partnersList);
        setPartners(partnersList);

        // Extract venue spaces
        let spacesList = [];
        if (venueSpacesRes.status === "fulfilled") {
          const venueData = venueSpacesRes.value;

          if (venueData?.data?.spaces && Array.isArray(venueData.data.spaces)) {
            spacesList = venueData.data.spaces;
          } else if (venueData?.spaces && Array.isArray(venueData.spaces)) {
            spacesList = venueData.spaces;
          } else if (Array.isArray(venueData)) {
            spacesList = venueData;
          }
        }
        console.log("🏢 Venue spaces extracted:", spacesList.length, spacesList);
        setVenueSpaces(spacesList);

        // Extract events
        const eventsList = extractData(eventsRes, "events");
        console.log("📅 Events extracted:", eventsList.length, eventsList);
        setExistingEvents(eventsList);

        // Final check - log what we have
        console.log("✅ Final state:", {
          clients: clientsList.length,
          partners: partnersList.length,
          venueSpaces: spacesList.length,
          events: eventsList.length,
        });
      } catch (error) {
        console.error("❌ Error initializing form:", error);
        toast.error("Failed to load form data");
      } finally {
        setFetchLoading(false);
      }
    };

    initializeForm();
  }, [extractData]);

  // Load event data when editing
  useEffect(() => {
    const loadEventData = async () => {
      // Case 1: Using passed event data directly
      if (selectedEvent && isEditMode) {
        console.log("=== LOADING FROM PASSED EVENT DATA ===");
        console.log("Selected Event:", selectedEvent);
        
        // Extract venue space ID properly - handle both populated and string formats
        const venueSpaceIdValue = typeof selectedEvent.venueSpaceId === 'object' 
          ? selectedEvent.venueSpaceId?._id 
          : selectedEvent.venueSpaceId;
        
        const clientIdValue = typeof selectedEvent.clientId === 'object'
          ? selectedEvent.clientId?._id 
          : selectedEvent.clientId;

        console.log("Extracted venueSpaceId:", venueSpaceIdValue);
        console.log("Extracted clientId:", clientIdValue);

        setFormData({
          title: selectedEvent.title || "",
          description: selectedEvent.description || "",
          type: selectedEvent.type || "",
          venueSpaceId: venueSpaceIdValue || "",
          clientId: clientIdValue || "",
          sameDayEvent: selectedEvent.startDate === selectedEvent.endDate,
          startDate: selectedEvent.startDate
            ? new Date(selectedEvent.startDate).toISOString().split("T")[0]
            : "",
          endDate: selectedEvent.endDate
            ? new Date(selectedEvent.endDate).toISOString().split("T")[0]
            : "",
          startTime: selectedEvent.startTime || "",
          endTime: selectedEvent.endTime || "",
          guestCount: selectedEvent.guestCount || "",
          status: selectedEvent.status || "pending",
          pricing: {
            basePrice: selectedEvent.pricing?.basePrice || "",
            discount: selectedEvent.pricing?.discount || "",
            discountType: selectedEvent.pricing?.discountType || "fixed",
          },
          partners: selectedEvent.partners?.map((p) => ({
            partner: p.partner?._id || p.partner,
            partnerName: p.partner?.name || p.partnerName || "Unknown Partner",
            service: p.service || "General Service",
            priceType: p.priceType || p.partner?.priceType || "fixed",
            rate: p.priceType === "hourly" 
              ? (p.hourlyRate || p.partner?.hourlyRate || 0)
              : (p.fixedRate || p.partner?.fixedRate || 0),
            hours: p.hours || 0,
            cost: p.cost || 0,
            status: p.status || "pending",
          })) || [],
          notes: selectedEvent.notes || "",
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
        
        console.log("=== PASSED EVENT DATA LOADED SUCCESSFULLY ===");
        console.log("venueSpaceId set to:", venueSpaceIdValue);
        return;
      }

      // Case 2: Fetch from API when eventId is provided
      if (eventId && isEditMode) {
        console.log("=== FETCHING EVENT DATA FROM DATABASE ===");
        console.log("Event ID:", eventId);
        
        try {
          setFetchLoading(true);
          
          // Fetch the complete event with populated relationships
          const response = await eventService.getById(eventId);
          const event = response?.data || response?.event || response;
          
          console.log("Fetched Event:", event);

          if (!event) {
            console.error("No event data received");
            return;
          }

          // Extract venue space ID properly
          const venueSpaceIdValue = typeof event.venueSpaceId === 'object'
            ? event.venueSpaceId?._id
            : event.venueSpaceId;

          const clientIdValue = typeof event.clientId === 'object'
            ? event.clientId?._id
            : event.clientId;

          console.log("Extracted venueSpaceId:", venueSpaceIdValue);
          console.log("Extracted clientId:", clientIdValue);

          // Transform event data to form structure
          const transformedData = {
            title: event.title || "",
            description: event.description || "",
            type: event.type || "",
            venueSpaceId: venueSpaceIdValue || "",
            clientId: clientIdValue || "",
            sameDayEvent: event.startDate === event.endDate,
            startDate: event.startDate ? event.startDate.split("T")[0] : "",
            endDate: event.endDate ? event.endDate.split("T")[0] : "",
            startTime: event.startTime || "",
            endTime: event.endTime || "",
            guestCount: event.guestCount || "",
            status: event.status || "pending",
            pricing: {
              basePrice: event.pricing?.basePrice || "",
              discount: event.pricing?.discount || "",
              discountType: event.pricing?.discountType || "fixed",
            },
            partners: event.partners?.map((p) => ({
              partner: p.partner?._id || p.partner,
              partnerName: p.partner?.name || p.partnerName || "Unknown Partner",
              service: p.service || "General Service",
              priceType: p.priceType || p.partner?.priceType || "fixed",
              rate: p.priceType === "hourly"
                ? (p.hourlyRate || p.partner?.hourlyRate || 0)
                : (p.fixedRate || p.partner?.fixedRate || 0),
              hours: p.hours || 0,
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
            createInvoice: false,
          };

          console.log("Transformed Event Data:", transformedData);
          console.log("venueSpaceId set to:", transformedData.venueSpaceId);
          
          setFormData(transformedData);
          
          if (transformedData.clientId) {
            setSelectedClient(transformedData.clientId);
          }
          
          console.log("=== EVENT DATA LOADED SUCCESSFULLY ===");
        } catch (error) {
          console.error("Error fetching event:", error);
          toast.error("Failed to load event data");
        } finally {
          setFetchLoading(false);
        }
      }
    };

    loadEventData();
  }, [eventId, isEditMode, selectedEvent]);

  // UNIFIED handleChange - handles both direct calls and event objects
  const handleChange = useCallback((fieldOrEvent, value) => {
    // Case 1: Called with event object { target: { name, value } }
    if (fieldOrEvent && typeof fieldOrEvent === 'object' && fieldOrEvent.target) {
      const { name, value: eventValue } = fieldOrEvent.target;
      
      // Handle nested fields (pricing.basePrice, payment.amount, etc.)
      if (name && typeof name === 'string' && name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: eventValue
          }
        }));
      } else {
        // Handle direct fields
        setFormData(prev => ({
          ...prev,
          [name]: eventValue
        }));
      }
      
      // Clear errors
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
      return;
    }
    
    // Case 2: Called with (field, value) parameters
    const field = fieldOrEvent;
    
    if (!field || typeof field !== 'string') {
      console.warn('handleChange called with invalid field:', field);
      return;
    }
    
    // Handle nested fields (pricing.basePrice, payment.amount, etc.)
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      // Handle direct fields
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear errors for the changed field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Unified client selection handler
  const handleSelectClient = useCallback((clientId) => {
    setSelectedClient((prevSelected) => {
      const isDeselection = prevSelected === clientId;
      const newSelection = isDeselection ? null : clientId;

      if (!isDeselection) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.clientId;
          return newErrors;
        });
      }

      return newSelection;
    });

    // Also update formData.clientId for consistency
    setFormData(prev => ({ 
      ...prev, 
      clientId: prev.clientId === clientId ? "" : clientId 
    }));
  }, []);

  // Additional utility functions
  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    
    // Clear errors for updated fields
    Object.keys(updates).forEach(field => {
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    });
  }, [errors]);

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      type: "",
      venueSpaceId: "",
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
    setSelectedClient(null);
    setErrors({});
    setWarnings({});
  }, []);

  return {
    // State
    formData,
    selectedClient,
    clients,
    partners,
    venueSpaces,
    existingEvents,
    loading,
    fetchLoading,
    errors,
    warnings,
    
    // Setters
    setFormData,
    setSelectedClient,
    setClients,
    setPartners,
    setVenueSpaces,
    setExistingEvents,
    setLoading,
    setFetchLoading,
    setErrors,
    setWarnings,
    
    // Handlers
    handleChange,           // Unified handler - works with both event objects and direct calls
    handleSelectClient,     // Unified client selection
    updateFormData,         // Batch updates
    resetForm,              // Reset form to initial state
  };
};