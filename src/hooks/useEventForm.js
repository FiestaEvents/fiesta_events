import { useState, useEffect, useCallback } from "react";
import { useToast } from "./useToast";
import {
  eventService,
  clientService,
  partnerService,
  venueSpacesService,
} from "../api/index";

export const useEventForm = (eventId, isEditMode, selectedEvent, initialDate) => {
  const { showError, showSuccess } = useToast();

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
      discountType: "fixed", 
      taxRate: 19 
    },
    partners: [],
    // ⭐ SUPPLY MANAGEMENT
    supplies: [],
    supplySummary: {
      totalCost: 0,
      totalCharge: 0,
      totalMargin: 0,
      includeInBasePrice: true
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

  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [venueSpaces, setVenueSpaces] = useState([]);
  const [existingEvents, setExistingEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState({});

  // Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        const [clientsRes, partnersRes, spacesRes, eventsRes] = await Promise.allSettled([
          clientService.getAll({ limit: 100 }),
          partnerService.getAll({ limit: 100 }),
          venueSpacesService.getAll({ limit: 100 }),
          eventService.getAll({ limit: 200, includeArchived: false })
        ]);

        const getArr = (res, key) => res.status === 'fulfilled' ? (res.value[key] || res.value.data?.[key] || res.value.data || []) : [];

        setClients(getArr(clientsRes, 'clients'));
        setPartners(getArr(partnersRes, 'partners'));
        setVenueSpaces(getArr(spacesRes, 'spaces'));
        setExistingEvents(getArr(eventsRes, 'events'));

      } catch (error) {
        console.error("Init Error:", error);
        showError("Failed to load form data. Please refresh.");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [showError]);

  // Date Prefill
  useEffect(() => {
    if (initialDate && !isEditMode) {
      const dateObj = new Date(initialDate);
      const dateStr = dateObj.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, startDate: dateStr, endDate: dateStr }));
    }
  }, [initialDate, isEditMode]);

  // Auto-Populate Venue Price
  useEffect(() => {
    if (formData.venueSpaceId && venueSpaces.length > 0) {
      const selectedSpace = venueSpaces.find(s => s._id === formData.venueSpaceId);
      if (selectedSpace) {
        setFormData(prev => ({
          ...prev,
          pricing: { ...prev.pricing, basePrice: selectedSpace.basePrice || 0 }
        }));
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors["pricing.basePrice"];
          return newErrors;
        });
      }
    }
  }, [formData.venueSpaceId, venueSpaces]);

  // Edit Mode Loading
  useEffect(() => {
    if (isEditMode && eventId) {
      const loadEvent = async () => {
        try {
          setFetchLoading(true);
          const response = await eventService.getById(eventId);
          const event = response.event || response.data;

          if (event) {
            // Map Partners with full details
            const mappedPartners = (event.partners || []).map(p => ({
              partner: p.partner?._id || p.partner,
              partnerName: p.partner?.name || p.partnerName || "Partner",
              service: p.service,
              priceType: p.priceType || p.partner?.priceType || "fixed",
              rate: p.rate || (p.partner?.priceType === "hourly" ? p.partner?.hourlyRate : p.partner?.fixedRate) || 0,
              hours: p.hours || 0,
              cost: p.cost, // Preserve database cost
              status: p.status
            }));

            // ⭐ MAP SUPPLIES with all required fields
            const mappedSupplies = (event.supplies || []).map(s => ({
              supply: s.supply?._id || s.supply,
              supplyName: s.supplyName || s.supply?.name || "",
              supplyCategoryId: s.supplyCategoryId?._id || s.supplyCategoryId,
              supplyCategoryName: s.supplyCategoryName || s.supplyCategoryId?.name || "",
              supplyUnit: s.supplyUnit || s.supply?.unit || "",
              quantityRequested: s.quantityRequested || s.quantityAllocated || 0,
              quantityAllocated: s.quantityAllocated || 0,
              costPerUnit: s.costPerUnit || s.supply?.costPerUnit || 0,
              chargePerUnit: s.chargePerUnit || s.supply?.chargePerUnit || 0,
              pricingType: s.pricingType || s.supply?.pricingType || "included",
              status: s.status || "pending",
              currentStock: s.supply?.currentStock || 0,
              // Preserve additional fields if they exist
              totalCost: s.totalCost,
              totalCharge: s.totalCharge,
              deliveryDate: s.deliveryDate,
              notes: s.notes
            }));

            const mappedData = {
              ...formData,
              title: event.title,
              description: event.description || "",
              type: event.type,
              venueSpaceId: typeof event.venueSpaceId === 'object' ? event.venueSpaceId._id : event.venueSpaceId,
              clientId: typeof event.clientId === 'object' ? event.clientId._id : event.clientId,
              sameDayEvent: event.startDate?.split('T')[0] === event.endDate?.split('T')[0],
              startDate: event.startDate?.split('T')[0],
              endDate: event.endDate?.split('T')[0],
              startTime: event.startTime,
              endTime: event.endTime,
              guestCount: event.guestCount,
              status: event.status,
              pricing: {
                basePrice: event.pricing?.basePrice || 0,
                discount: event.pricing?.discount || 0,
                discountType: event.pricing?.discountType || "fixed",
                taxRate: event.pricing?.taxRate !== undefined ? event.pricing.taxRate : 19
              },
              partners: mappedPartners,
              // ⭐ SUPPLIES
              supplies: mappedSupplies,
              supplySummary: event.supplySummary || {
                totalCost: 0,
                totalCharge: 0,
                totalMargin: 0,
                includeInBasePrice: true
              },
              notes: event.notes || "",
              createInvoice: false
            };

            setFormData(mappedData);
            setSelectedClient(mappedData.clientId);
          }
        } catch (error) {
          console.error(error);
          showError("Failed to load event details");
        } finally {
          setFetchLoading(false);
        }
      };
      loadEvent();
    }
  }, [eventId, isEditMode, showError]);

  // Handle Change (supports nested paths like "pricing.discount" and "supplySummary.includeInBasePrice")
  const handleChange = useCallback((eOrName, valueVal) => {
    let name, value;
    if (typeof eOrName === 'string') {
      name = eOrName;
      value = valueVal;
    } else {
      name = eOrName.target.name;
      value = eOrName.target.type === 'checkbox' ? eOrName.target.checked : eOrName.target.value;
    }

    setFormData(prev => {
      if (name.includes('.')) {
        const keys = name.split('.');
        const newData = { ...prev };
        let current = newData;
        
        // Navigate to the nested property
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }
        
        // Set the final value
        current[keys[keys.length - 1]] = value;
        return newData;
      }
      return { ...prev, [name]: value };
    });

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSelectClient = useCallback((clientId) => {
    if (selectedClient === clientId) {
      // Deselect (toggle off)
      setSelectedClient(null);
      setFormData(prev => ({ ...prev, clientId: "" }));
    } else {
      // Select client
      setSelectedClient(clientId);
      setFormData(prev => ({ ...prev, clientId }));
      
      // Remove error completely
      setErrors(prev => {
        const { clientId: removedError, ...rest } = prev;
        return rest;
      });
    }
  }, [selectedClient]);

  return {
    formData, 
    setFormData,
    selectedClient, 
    setSelectedClient,
    clients, 
    setClients,
    partners, 
    setPartners,
    venueSpaces, 
    setVenueSpaces,
    existingEvents,
    loading, 
    setLoading,
    fetchLoading, 
    setFetchLoading,
    errors, 
    setErrors,
    warnings, 
    setWarnings,
    handleChange,
    handleSelectClient
  };
};