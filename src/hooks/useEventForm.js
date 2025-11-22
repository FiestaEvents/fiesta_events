import { useState, useEffect, useCallback } from "react";
import { useToast } from "./useToast"; // ✅ CUSTOM TOAST
import {
  eventService,
  clientService,
  partnerService,
  venueSpacesService,
} from "../api/index";

export const useEventForm = (eventId, isEditMode, selectedEvent, initialDate) => {
  const { showError, showSuccess } = useToast(); // ✅ Hook usage

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
    pricing: { basePrice: "", discount: "", discountType: "fixed", taxRate: 19 },
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
        showError("Failed to load form data. Please refresh."); // ✅ Toast
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, []);

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
            const mappedPartners = (event.partners || []).map(p => ({
              partner: p.partner?._id || p.partner,
              partnerName: p.partner?.name || p.partnerName || "Partner",
              service: p.service,
              priceType: p.priceType || "fixed",
              rate: p.rate || 0,
              hours: p.hours || 0,
              cost: p.cost, // Ensure database cost is respected on load
              status: p.status
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
              notes: event.notes || "",
              createInvoice: false
            };

            setFormData(mappedData);
            setSelectedClient(mappedData.clientId);
          }
        } catch (error) {
          console.error(error);
          showError("Failed to load event details"); // ✅ Toast
        } finally {
          setFetchLoading(false);
        }
      };
      loadEvent();
    }
  }, [eventId, isEditMode]);

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
        const [parent, child] = name.split('.');
        return { ...prev, [parent]: { ...prev[parent], [child]: value } };
      }
      return { ...prev, [name]: value };
    });

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
      setSelectedClient(null);
      setFormData(prev => ({ ...prev, clientId: "" }));
    } else {
      setSelectedClient(clientId);
      setFormData(prev => ({ ...prev, clientId }));
      setErrors(prev => ({ ...prev, clientId: null }));
    }
  }, [selectedClient]);

  return {
    formData, setFormData,
    selectedClient, setSelectedClient,
    clients, setClients,
    partners, setPartners,
    venueSpaces, setVenueSpaces,
    existingEvents,
    loading, setLoading,
    fetchLoading, setFetchLoading,
    errors, setErrors,
    warnings, setWarnings,
    handleChange,
    handleSelectClient
  };
};