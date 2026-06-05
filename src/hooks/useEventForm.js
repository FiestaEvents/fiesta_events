//src/hooks/useEventForm.js
import { useState, useEffect, useCallback } from "react";
import { eventService, clientService, partnerService, venueService } from "../api/index";

export const useEventForm = (eventId, isEditMode, prefillClient, prefillPartner, initialDate) => {
  // ============================================
  // INITIAL STATE
  // ============================================
  const getInitialFormData = () => ({
    title: "",
    description: "",
    type: "wedding",
    venueSpaceId: "",
    clientId: prefillClient?._id || "",
    sameDayEvent: true,
    startDate: initialDate 
    ? (typeof initialDate === "string" ? initialDate : initialDate.toISOString().split("T")[0])
    : "",
   endDate: initialDate 
    ? (typeof initialDate === "string" ? initialDate : initialDate.toISOString().split("T")[0])
    : "",
    startTime: "",
    endTime: "",
    guestCount: "",
    status: "pending",
    pricing: {
      basePrice: 0,
      discount: 0,
      discountType: "fixed",
      taxRate: 19,
    },
    partners: [],
    supplies: [],
    supplySummary: {
      totalCost: 0,
      totalCharge: 0,
      totalMargin: 0,
      includeInBasePrice: true,
    },
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

  // ============================================
  // STATE
  // ============================================
  const [formData, setFormData] = useState(getInitialFormData());
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedVenueSpace, setSelectedVenueSpace] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  //  NEW: Resource Lists
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [venueSpaces, setVenueSpaces] = useState([]);

  // ============================================
  // FETCH RESOURCES ON MOUNT
  // ============================================
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [clientsRes, partnersRes, spacesRes] = await Promise.all([
          clientService.getAll(),
          partnerService.getAll(),
          venueService.getSpaces(),
        ]);

        setClients(clientsRes?.data?.clients || clientsRes?.clients || []);
        setPartners(partnersRes?.data?.partners || partnersRes?.partners || []);
        setVenueSpaces(spacesRes?.data?.spaces || spacesRes?.spaces || []);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      }
    };

    fetchResources();
  }, []);

  // ============================================
  // HANDLE PREFILL (CREATE MODE)
  // ============================================
  useEffect(() => {
    if (!isEditMode && clients.length > 0) {
      // Auto-select prefilled client
      if (prefillClient && !selectedClient) {
        const foundClient = clients.find(c => c._id === prefillClient._id);
        if (foundClient) {
          console.log(" Auto-selecting prefilled client:", foundClient.name);
          setSelectedClient(foundClient);
          setFormData(prev => ({ ...prev, clientId: foundClient._id }));
        }
      }
    }
  }, [prefillClient, clients, isEditMode, selectedClient]);

  // ============================================
  // LOAD EVENT DATA (EDIT MODE)
  // ============================================
  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId || !isEditMode) return;

      try {
        setLoading(true);
        const response = await eventService.getById(eventId);
        const event = response?.data?.event || response?.event || response;

        if (!event) {
          console.error("No event data found");
          return;
        }

        // Map partners
        const mappedPartners = (event.partners || []).map(p => ({
          partner: p.partner?._id || p.partner,
          partnerName: p.partner?.name || p.partnerName || "Partner",
          service: p.service,
          priceType: p.priceType || p.partner?.priceType || "fixed",
          rate: p.rate || 0,
          hours: p.hours || 0,
          cost: p.cost,
          status: p.status,
        }));

        // Map supplies
        const mappedSupplies = (event.supplies || []).map(s => ({
          supply: s.supply?._id || s.supply,
          supplyName: s.supplyName || s.supply?.name || "",
          supplyCategoryId: s.supplyCategoryId?._id || s.supplyCategoryId,
          supplyCategoryName: s.supplyCategoryName || s.supplyCategoryId?.name || "",
          supplyUnit: s.supplyUnit || s.supply?.unit || "",
          quantityRequested: s.quantityRequested || 0,
          quantityAllocated: s.quantityAllocated || 0,
          costPerUnit: s.costPerUnit || 0,
          chargePerUnit: s.chargePerUnit || 0,
          pricingType: s.pricingType || "included",
          status: s.status || "pending",
          currentStock: s.supply?.currentStock || 0,
        }));

        const transformedData = {
          title: event.title || "",
          description: event.description || "",
          type: event.type || "wedding",
          venueSpaceId: typeof event.venueSpaceId === "object" ? event.venueSpaceId._id : event.venueSpaceId || "",
          clientId: typeof event.clientId === "object" ? event.clientId._id : event.clientId || "",
          sameDayEvent: event.startDate?.split("T")[0] === event.endDate?.split("T")[0],
          startDate: event.startDate?.split("T")[0] || "",
          endDate: event.endDate?.split("T")[0] || "",
          startTime: event.startTime || "",
          endTime: event.endTime || "",
          guestCount: event.guestCount?.toString() || "",
          status: event.status || "pending",
          pricing: {
            basePrice: event.pricing?.basePrice || 0,
            discount: event.pricing?.discount || 0,
            discountType: event.pricing?.discountType || "fixed",
            taxRate: event.pricing?.taxRate ?? 19,
          },
          partners: mappedPartners,
          supplies: mappedSupplies,
          supplySummary: event.supplySummary || {
            totalCost: 0,
            totalCharge: 0,
            totalMargin: 0,
            includeInBasePrice: true,
          },
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

        setFormData(transformedData);

        // Set selected client
        if (event.clientId && clients.length > 0) {
          const clientData = typeof event.clientId === "object" ? event.clientId : clients.find(c => c._id === event.clientId);
          if (clientData) setSelectedClient(clientData);
        }

        // Set selected venue space
        if (event.venueSpaceId && venueSpaces.length > 0) {
          const spaceData = typeof event.venueSpaceId === "object" ? event.venueSpaceId : venueSpaces.find(s => s._id === event.venueSpaceId);
          if (spaceData) setSelectedVenueSpace(spaceData);
        }

        console.log(" Event data loaded successfully");
      } catch (error) {
        console.error("❌ Error loading event data:", error);
        setErrors({ fetch: "Failed to load event data" });
      } finally {
        setLoading(false);
      }
    };

    if (clients.length > 0 && venueSpaces.length > 0) {
      loadEventData();
    }
  }, [eventId, isEditMode, clients, venueSpaces]);

  // ============================================
  // FORM HANDLERS
  // ============================================
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    if (name.includes(".")) {
      // Nested field (e.g., "pricing.discount")
      const keys = name.split(".");
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = fieldValue;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: fieldValue }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSelectClient = useCallback((clientOrId) => {
    const clientId = typeof clientOrId === "object" ? clientOrId._id : clientOrId;
    const clientObj = typeof clientOrId === "object" ? clientOrId : clients.find(c => c._id === clientOrId);

    if (selectedClient?._id === clientId) {
      // Deselect
      setSelectedClient(null);
      setFormData(prev => ({ ...prev, clientId: "" }));
    } else {
      // Select
      setSelectedClient(clientObj || { _id: clientId });
      setFormData(prev => ({ ...prev, clientId }));
      
      // Clear error
      setErrors(prev => {
        const { clientId: _, ...rest } = prev;
        return rest;
      });
    }
  }, [selectedClient, clients]);

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setSelectedClient(prefillClient || null);
    setSelectedVenueSpace(null);
    setErrors({});
  }, [prefillClient]);

  // ============================================
  // RETURN
  // ============================================
  return {
    // Form Data
    formData,
    setFormData,
    handleChange,
    
    // Selections
    selectedClient,
    setSelectedClient,
    handleSelectClient,
    selectedVenueSpace,
    setSelectedVenueSpace,
    
    // Resources
    clients,
    setClients,
    partners,
    venueSpaces,
    
    // State
    errors,
    setErrors,
    loading,
    setLoading,
    resetForm,
  };
};
