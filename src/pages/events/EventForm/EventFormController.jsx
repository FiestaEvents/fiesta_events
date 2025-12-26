import React from "react";
import { useAuth } from "../../../context/AuthContext";
import VenueEventForm from "./VenueEventForm";
import ServiceJobForm from "./ServiceJobForm";
import OrbitLoader from "../../../components/common/LoadingSpinner";

const EventFormController = (props) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="h-64 flex justify-center items-center"><OrbitLoader /></div>;

  const category = user?.business?.category || "venue";

  // 1. Venue Owners -> The Complex Wizard
  if (category === "venue") {
    return <VenueEventForm {...props} />;
  }

  // 2. Everyone else (Photographers, Drivers) -> The Simple Job Form
  return <ServiceJobForm {...props} category={category} />;
};

export default EventFormController;