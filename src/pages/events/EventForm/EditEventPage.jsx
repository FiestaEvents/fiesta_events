import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EventFormProvider } from "./EventFormContext";
import SharedEventForm from "./SharedEventForm";

const EditEventPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  if (!id) return <div>Invalid Event ID</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl bg-white dark:bg-gray-800">
      <EventFormProvider 
        eventId={id} 
        isEditMode={true}
      >
        <SharedEventForm />
      </EventFormProvider>
    </div>
  );
};

export default EditEventPage;