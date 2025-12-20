// hooks/useClientDetail.js - FIXED VERSION
import { useCallback, useMemo } from "react";
import { clientService } from "../api/index";
import { useApiDetail } from "./useApi";

export const useClientDetail = (clientId) => {
  const {
    item: clientData, // Now this should be the direct client object
    loading: clientLoading,
    error: clientError,
    refetch: refetchClient,
  } = useApiDetail(clientService.getById, clientId, {
    manual: false,
    cache: true,
    cacheDuration: 60 * 1000,
    retry: false,
  });

  console.log('🔍 useClientDetail: clientData:', clientData);

  // Events array (always an array)
  const events = useMemo(() => {
    if (!clientData) return [];
    const rawEvents = clientData.events || [];
    return Array.isArray(rawEvents) ? rawEvents : [];
  }, [clientData]);

  // Stats calculation
  const eventsStats = useMemo(() => {
    if (!clientData) {
      return {
        totalEvents: 0,
        totalRevenue: 0,
        totalPaid: 0,
        pendingAmount: 0,
        upcomingEvents: 0,
        totalSpent: 0,
      };
    }
    
    const s = clientData.stats || {};
    return {
      totalEvents: Number(s.totalEvents ?? events.length ?? 0),
      totalRevenue: Number(s.totalRevenue ?? s.totalSpent ?? 0),
      totalPaid: Number(s.totalPaid ?? 0),
      pendingAmount: Number(s.pendingAmount ?? 0),
      upcomingEvents: Number(s.upcomingEvents ?? 0),
      totalSpent: Number(s.totalSpent ?? 0),
    };
  }, [clientData, events.length]);

  const refreshData = useCallback(() => {
    refetchClient();
  }, [refetchClient]);

  return {
    clientData,
    events,
    eventsStats,
    loading: clientLoading,
    error: clientError,
    refreshData,
  };
};