import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EventFormProvider } from "./EventFormContext";
import SharedEventForm from "./SharedEventForm";
import { useToast } from "../../../hooks/useToast";

const EditEventPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  if (!id) return <div>Invalid Event ID</div>;

  const handleSuccess = (response) => {
    showSuccess(t('eventForm.messages.eventUpdated', 'Event updated successfully'));
    navigate("/events");
  };

  return (
    <div className="container mx-auto max-w-5xl">
      <EventFormProvider 
        eventId={id} 
        isEditMode={true}
      >
        <SharedEventForm onSuccess={handleSuccess} />
      </EventFormProvider>
    </div>
  );
};

export default EditEventPage;