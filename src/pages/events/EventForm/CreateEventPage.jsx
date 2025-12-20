import React, { useEffect } from "react";
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

  // Extract navigation state
  const initialDate = location.state?.initialDate;
  const prefillClient = location.state?.prefillClient;
  const prefillPartner = location.state?.prefillPartner;
  const fromClient = location.state?.fromClient;
  const fromPartner = location.state?.fromPartner;

  // Debug logging
  useEffect(() => {
    console.group("📍 CreateEventPage - Navigation State");
    console.log("location.state:", location.state);
    console.log("prefillClient:", prefillClient);
    console.log("prefillPartner:", prefillPartner);
    console.log("initialDate:", initialDate);
    console.log("fromClient:", fromClient);
    console.log("fromPartner:", fromPartner);
    console.groupEnd();
  }, [location.state, prefillClient, prefillPartner, initialDate, fromClient, fromPartner]);

  const handleSuccess = (response) => {
    showSuccess(t("eventForm.messages.eventCreated"));

    // Navigate back to origin
    if (fromClient) {
      navigate(`/clients/${fromClient}`);
    } else if (fromPartner) {
      navigate(`/partners/${fromPartner}`);
    } else {
      navigate("/events");
    }
  };

  return (
    <div className="w-full">
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