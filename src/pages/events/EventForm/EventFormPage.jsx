import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { eventService } from "../../../api"; 
import { EventFormWizard } from "./EventFormWizard"; 

const EventFormPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(isEditMode);

  // Helper: Force YYYY-MM-DD string
  const toDateString = (dateVal) => {
     if (!dateVal) return "";
     if (typeof dateVal === "string") return dateVal.split("T")[0];
     if (dateVal instanceof Date) return dateVal.toISOString().split("T")[0];
     return "";
  };

  const [initialData, setInitialData] = useState(() => {
    // 1. Edit Mode: Wait for fetch
    if (isEditMode) return null;
    
    // 2. Create Mode: Use navigation state
    if (location.state) {
      return {
         clientId: location.state.prefillClient?._id, 
         // ✅ FIX: Ensure this is a string
         startDate: toDateString(location.state.initialDate),
         
         // Setup Partner logic...
         partners: location.state.prefillPartner 
            ? [{
                partner: location.state.prefillPartner._id,
                partnerName: location.state.prefillPartner.name,
                service: location.state.prefillPartner.category || "Service",
                priceType: location.state.prefillPartner.priceType || "hourly",
                rate: location.state.prefillPartner.hourlyRate || location.state.prefillPartner.fixedRate || 0,
                cost: 0 
              }]
            : []
      };
    }
    return null;
  });

  // Fetch Logic (Updated helper usage here too)
  useEffect(() => {
    if (!isEditMode) return;
    const fetchEvent = async () => {
      try {
        const res = await eventService.getById(id);
        const event = res.event || res.data; 

        const formattedData = {
          ...event,
          venueSpaceId: event.venueSpaceId?._id || event.venueSpaceId,
          clientId: event.clientId?._id || event.clientId,
          // ✅ FIX: Ensure string format on edit fetch
          startDate: toDateString(event.startDate),
          endDate: toDateString(event.endDate),
          sameDayEvent: toDateString(event.startDate) === toDateString(event.endDate),
          // Map Relations...
          partners: (event.partners || []).map(p => ({
             partner: p.partner?._id || p.partner, 
             partnerName: p.partner?.name, // For Display
             service: p.service,
             // FORCE LOWERCASE: "Fixed" -> "fixed"
             priceType: (p.priceType || "fixed").toLowerCase(),
             rate: Number(p.rate) || Number(p.cost) || 0, // Ensure Number
             hours: p.hours ? Number(p.hours) : undefined,
             cost: Number(p.cost) || 0
          })),
          supplies: (event.supplies || []).map(s => ({
             ...s,
             supply: s.supply?._id || s.supply,
             supplyName: s.supplyName || s.supply?.name
          }))
        };
        setInitialData(formattedData);
      } catch (error) {
        console.error("Failed to load event", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, isEditMode]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return <EventFormWizard isEditMode={isEditMode} defaultValues={initialData} />;
};

export default EventFormPage;