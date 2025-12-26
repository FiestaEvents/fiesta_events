import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { eventService } from "../../../api"; 
import EventFormController from "./EventFormController";

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
    if (isEditMode) return null;
    
    // Create Mode: Use navigation state
    if (location.state) {
      return {
         clientId: location.state.prefillClient?._id, 
         startDate: toDateString(location.state.initialDate),
         // Optional partner prefill
         partners: location.state.prefillPartner ? [{/*...*/}] : []
      };
    }
    return null;
  });

  useEffect(() => {
    if (!isEditMode) return;
    const fetchEvent = async () => {
      try {
        const res = await eventService.getById(id);
        const event = res.event || res.data; 

        // ✅ SAFE MAPPING (Works for Venues AND Services)
        const formattedData = {
          ...event,
          // Use optional chaining because Service Events won't have venueSpaceId
          venueSpaceId: event.resourceId?._id || event.resourceId || event.venueSpaceId?._id, 
          clientId: event.clientId?._id || event.clientId,
          startDate: toDateString(event.startDate),
          endDate: toDateString(event.endDate),
          sameDayEvent: toDateString(event.startDate) === toDateString(event.endDate),
          
          partners: (event.partners || []).map(p => ({
             partner: p.partner?._id || p.partner, 
             partnerName: p.partner?.name, 
             service: p.service,
             priceType: (p.priceType || "fixed").toLowerCase(),
             rate: Number(p.rate) || Number(p.cost) || 0,
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

  return <EventFormController isEditMode={isEditMode} defaultValues={initialData} />;
};

export default EventFormPage;