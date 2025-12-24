// src/routes/DashboardController.jsx
import { useAuth } from "../context/AuthContext";
import VenueDashboard from "./dashboards/VenueDashboard";
import ServiceDashboard from "./dashboards/ServiceDashboard";
import DriverDashboard from "./dashboards/DriverDashboard";

const DashboardController = () => {
  const { user } = useAuth();
  const category = user?.business?.category || "venue"; 

  switch (category) {
    case "venue":
      return <VenueDashboard />;
    case "driver":
      return <DriverDashboard />;
    case "photography":
    case "videography":
      return <ServiceDashboard type="visual" />;
    case "bakery":
    case "catering":
      return <ServiceDashboard type="food" />;
    default:
      return <ServiceDashboard type="generic" />;
  }
};
export default DashboardController;