// src/pages/settings/SettingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { venueService, authService } from "../../api/index";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Users,
  DollarSign,
  Clock,
  Settings,
  CreditCard,
} from "lucide-react";
import { toast } from "react-hot-toast";

const SettingPage = () => {
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FIXED: Fetch current user's venue using getMe()
  const fetchVenue = async () => {
    try {
      setLoading(true);
      setError(null);

      // API service handleResponse returns { venue: {...} }
      const response = await venueService.getMe();
      const venueData = response?.venue || response;

      if (venueData) {
        setVenue(venueData);
      } else {
        setError("No venue found for your account");
      }
    } catch (err) {
      console.error("Error fetching venue:", err);
      setError(err.message || "Failed to load venue information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenue();
  }, []);

  const handleEditVenue = () => {
    // Navigate to dedicated venue settings page
    navigate("/settings/venue");
  };

  const handleEditProfile = () => {
    navigate("/settings/profile");
  };

  const handleManageTeam = () => {
    navigate("/team");
  };

  const handleManageSubscription = () => {
    navigate("/settings/subscription");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 "  >
        <div className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Error Loading Settings
              </h3>
              <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
            <Button variant="outline" onClick={fetchVenue}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 ">
        <div className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No venue information available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8  dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-base text-gray-600 dark:text-gray-300">
          Manage your venue, profile, team, and subscription settings
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={handleEditVenue}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Venue
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Edit details
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={handleEditProfile}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Profile
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your account
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={handleManageTeam}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Team
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage users
              </p>
            </div>
          </div>
        </div>

        <div
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={handleManageSubscription}
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Subscription
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Billing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Venue Overview */}
      <div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Venue Information
            </h2>
            <Button variant="outline" onClick={handleEditVenue}>
              Edit Venue
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span>Venue Name</span>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {venue.name}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Address</span>
                </div>
                <p className="text-gray-900 dark:text-white">
                  {venue.address?.street}
                  <br />
                  {venue.address?.city}, {venue.address?.state}{" "}
                  {venue.address?.zipCode}
                  <br />
                  {venue.address?.country}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Time Zone</span>
                </div>
                <p className="text-gray-900 dark:text-white">
                  {venue.timeZone || "UTC"}
                </p>
              </div>
            </div>

            {/* Contact & Capacity */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Phone className="w-4 h-4" />
                  <span>Phone</span>
                </div>
                <p className="text-gray-900 dark:text-white">
                  {venue.contact?.phone || "Not set"}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
                <p className="text-gray-900 dark:text-white">
                  {venue.contact?.email || "Not set"}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Users className="w-4 h-4" />
                  <span>Capacity</span>
                </div>
                <p className="text-gray-900 dark:text-white">
                  {venue.capacity?.min} - {venue.capacity?.max} guests
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span>Base Price</span>
                </div>
                <p className="text-gray-900 dark:text-white font-semibold">
                  ${venue.pricing?.basePrice?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {venue.description && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Description
              </h3>
              <p className="text-gray-900 dark:text-white">
                {venue.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                Amenities
              </h3>
              <div className="flex flex-wrap gap-2">
                {venue.amenities.map((amenity, index) => (
                  <Badge key={index} variant="purple">
                    {amenity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Status */}
      {venue.subscription && (
        <div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Subscription Status
              </h2>
              <Button variant="outline" onClick={handleManageSubscription}>
                Manage
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Plan
                </p>
                <Badge variant="purple" size="lg">
                  {venue.subscription.plan?.toUpperCase()}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Status
                </p>
                <Badge
                  variant={
                    venue.subscription.status === "active"
                      ? "success"
                      : venue.subscription.status === "pending"
                        ? "warning"
                        : venue.subscription.status === "cancelled"
                          ? "danger"
                          : "gray"
                  }
                  size="lg"
                >
                  {venue.subscription.status?.toUpperCase()}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${venue.subscription.amount}
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                    /
                    {venue.subscription.plan === "monthly"
                      ? "mo"
                      : venue.subscription.plan === "annual"
                        ? "yr"
                        : ""}
                  </span>
                </p>
              </div>
            </div>

            {venue.subscription.startDate && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Start Date:{" "}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(
                        venue.subscription.startDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  {venue.subscription.endDate && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        End Date:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {new Date(
                          venue.subscription.endDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Operating Hours */}
      {venue.operatingHours && (
        <div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Operating Hours
            </h2>

            <div className="space-y-3">
              {Object.entries(venue.operatingHours).map(([day, hours]) => (
                <div
                  key={day}
                  className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {day}
                  </span>
                  {hours.closed ? (
                    <Badge variant="gray">Closed</Badge>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400">
                      {hours.open} - {hours.close}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingPage;
