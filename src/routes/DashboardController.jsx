// src/routes/DashboardController.jsx
import { useAuth } from "../context/AuthContext";
import VenueDashboard from "../pages/dashboards/VenueDashboard";
import ServiceDashboard from "../pages/dashboards/ServiceDashboard.jsx";
import DriverDashboard from "../pages/dashboards/DriverDashboard.jsx";

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