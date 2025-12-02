import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EventFormProvider } from "./EventFormContext";
import SharedEventForm from "./SharedEventForm";
import { useToast } from "../../../hooks/useToast";

const CreateEventPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  // Handle data passed via navigation state
  const initialDate = location.state?.initialDate;
  const prefillClient = location.state?.prefillClient;
  const prefillPartner = location.state?.prefillPartner;

  const handleSuccess = (response) => {
    showSuccess(
      t("eventForm.messages.eventCreated", "Event created successfully")
    );
    navigate("/events");
  };

  return (
    <div className="w-full ">
      <EventFormProvider
        isEditMode={false}
        initialDate={initialDate}
        prefillClient={prefillClient}
        prefillPartner={prefillPartner}
      >
        <SharedEventForm onSuccess={handleSuccess} />
      </EventFormProvider>
    </div>
  );
};

export default CreateEventPage;
