import { useState, useEffect } from "react";
import { partnerService, eventService } from "../api";

export const usePartnerDetail = (id) => {
  const [partnerData, setPartnerData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPartnerData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch partner details
      const partnerResponse = await partnerService.getById(id);

      let partnerData = null;
      if (partnerResponse?.data?.partner) {
        partnerData = partnerResponse.data.partner;
      } else if (partnerResponse?.partner) {
        partnerData = partnerResponse.partner;
      } else if (partnerResponse?.data?.data) {
        partnerData = partnerResponse.data.data;
      } else if (partnerResponse?.data) {
        partnerData = partnerResponse.data;
      } else if (partnerResponse) {
        partnerData = partnerResponse;
      }

      // Handle MongoDB $oid format
      if (partnerData?._id?.$oid) {
        partnerData._id = partnerData._id.$oid;
      }

      if (!partnerData || !partnerData._id) {
        throw new Error("Partner not found");
      }

      setPartnerData(partnerData);

      // Fetch partner events
      try {
        const eventsResponse = await eventService.getAll({
          limit: 100,
          page: 1,
        });

        let eventsData = [];
        if (eventsResponse?.data?.data?.events) {
          eventsData = eventsResponse.data.data.events;
        } else if (eventsResponse?.data?.events) {
          eventsData = eventsResponse.data.events;
        } else if (eventsResponse?.events) {
          eventsData = eventsResponse.events;
        } else if (Array.isArray(eventsResponse?.data)) {
          eventsData = eventsResponse.data;
        } else if (Array.isArray(eventsResponse)) {
          eventsData = eventsResponse;
        }

        // Filter events that include this partner
        const partnerEvents = eventsData.filter((event) => {
          if (!event.partners || !Array.isArray(event.partners)) return false;

          return event.partners.some((p) => {
            const partnerId =
              p.partner?._id?.$oid || p.partner?._id || p.partner;
            return partnerId === id || partnerId === partnerData._id;
          });
        });

        setEvents(partnerEvents);
      } catch (eventsError) {
        console.error("Error fetching events:", eventsError);
        setEvents([]);
      }
    } catch (err) {
      console.error("Error fetching partner:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load partner details";
      setError(new Error(errorMessage));
      setPartnerData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPartnerData();
    }
  }, [id]);

  return {
    partnerData,
    events,
    loading,
    error,
    refreshData: fetchPartnerData,
  };
};
