import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EventFormProvider } from "./EventFormContext";
import SharedEventForm from "./SharedEventForm";
import { useToast } from "../../../hooks/useToast";

const EditEventPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess } = useToast();

  // Extract navigation state (where user came from)
  const fromClient = location.state?.fromClient;
  const fromPartner = location.state?.fromPartner;
  const fromCalendar = location.state?.fromCalendar;
  const clientData = location.state?.clientData;

  // Debug logging
  useEffect(() => {
    console.group("✏️ EditEventPage - Navigation State");
    console.log("eventId:", id);
    console.log("location.state:", location.state);
    console.log("fromClient:", fromClient);
    console.log("fromPartner:", fromPartner);
    console.log("fromCalendar:", fromCalendar);
    console.log("clientData:", clientData);
    console.groupEnd();
  }, [id, location.state, fromClient, fromPartner, fromCalendar, clientData]);

  // Validate event ID
  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg
              className="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t("eventForm.errors.invalidEventId", "Invalid Event ID")}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            {t("eventForm.errors.invalidEventIdDescription", "The event ID is missing or invalid.")}
          </p>
          <button
            onClick={() => navigate("/events")}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            {t("common.backToEvents", "Back to Events")}
          </button>
        </div>
      </div>
    );
  }

  const handleSuccess = (response) => {
    showSuccess(t("eventForm.messages.eventUpdated", "Event updated successfully"));

    // Navigate back to origin
    if (fromClient) {
      navigate(`/clients/${fromClient}`);
    } else if (fromPartner) {
      navigate(`/partners/${fromPartner}`);
    } else if (fromCalendar) {
      navigate("/calendar");
    } else {
      // Default: go to event detail or events list
      const eventId = response?.event?._id || response?.data?._id || id;
      navigate(`/events/${eventId}/detail`);
    }
  };

  return (
    <div className="w-full">
      <EventFormProvider eventId={id} isEditMode={true}>
        <SharedEventForm onSuccess={handleSuccess} />
      </EventFormProvider>
    </div>
  );
};

export default EditEventPage;