import React from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EventFormProvider } from "./EventFormContext";
import SharedEventForm from "./SharedEventForm";

const CreateEventPage = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Handle data passed via navigation state (e.g. from calendar click or client page)
  const initialDate = location.state?.initialDate;
  const prefillClient = location.state?.prefillClient;
  const prefillPartner = location.state?.prefillPartner;

  return (
    <div className="w-full mx-auto max-w-7xl bg-white dark:bg-gray-800">
      <EventFormProvider 
        isEditMode={false}
        initialDate={initialDate}
        prefillClient={prefillClient}
        prefillPartner={prefillPartner}
      >
        <SharedEventForm />
      </EventFormProvider>
    </div>
  );
};

export default CreateEventPage;