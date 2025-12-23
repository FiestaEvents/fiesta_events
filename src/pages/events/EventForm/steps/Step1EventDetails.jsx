import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormInput } from "../../../../components/forms/FormInput";
import { FormSelect } from "../../../../components/forms/FormSelect";
import { Calendar, AlignLeft, Users } from "lucide-react";

const Step1EventDetails = () => {
  const { t } = useTranslation();
  const { control, register, setValue } = useFormContext();

  // Watch specific fields to trigger re-renders when they change
  const sameDayEvent = useWatch({ control, name: "sameDayEvent" });
  const startDate = useWatch({ control, name: "startDate" });

  const eventTypeOptions = [
    {
      value: "wedding",
      label: t("eventForm.step1.eventTypes.wedding") || "Wedding",
    },
    {
      value: "birthday",
      label: t("eventForm.step1.eventTypes.birthday") || "Birthday",
    },
    {
      value: "corporate",
      label: t("eventForm.step1.eventTypes.corporate") || "Corporate",
    },
    {
      value: "conference",
      label: t("eventForm.step1.eventTypes.conference") || "Conference",
    },
    {
      value: "party",
      label: t("eventForm.step1.eventTypes.party") || "Private Party",
    },
    { value: "other", label: t("eventForm.step1.eventTypes.other") || "Other" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* --- HEADER --- */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Event Basics
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Define the core identity and schedule of the event.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TITLE */}
        <div className="md:col-span-2">
          <FormInput
            name="title"
            label={t("eventForm.step1.eventTitle")}
            placeholder="e.g. Summer Wedding Gala 2024"
            className="w-full text-lg"
            autoFocus
          />
        </div>

        {/* TYPE */}
        <FormSelect
          name="type"
          label={t("eventForm.step1.eventType")}
          options={eventTypeOptions}
          placeholder="Select event type..."
        />

        {/* GUESTS */}
        <div className="relative">
          <FormInput
            name="guestCount"
            type="number"
            label={t("eventForm.step1.guestCount")}
            min="1"
            placeholder="e.g. 150"
          />
          <Users className="absolute right-3 top-9 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* --- SCHEDULE SECTION --- */}
      <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
        {/* Section Header with Custom Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Time & Duration
            </h3>
          </div>

          {/* Custom Segmented Control for RHF */}
          <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg flex text-xs font-medium">
            <button
              type="button"
              onClick={() => setValue("sameDayEvent", true)}
              className={`px-4 py-1.5 rounded-md transition-all shadow-sm ${sameDayEvent ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
            >
              One Day
            </button>
            <button
              type="button"
              onClick={() => setValue("sameDayEvent", false)}
              className={`px-4 py-1.5 rounded-md transition-all shadow-sm ${!sameDayEvent ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
            >
              Multi-Day
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Start Date - Spans 2 cols if single day */}
          <div className={sameDayEvent ? "md:col-span-2" : ""}>
            <FormInput name="startDate" type="date" label="Start Date" />
          </div>

          {/* End Date (Conditionally Rendered) */}
          {!sameDayEvent && (
            <div className="animate-in fade-in slide-in-from-left-4">
              <FormInput
                name="endDate"
                type="date"
                label="End Date"
                min={startDate} // Validates logical end date
              />
            </div>
          )}

          {/* Time Inputs */}
          <FormInput name="startTime" type="time" label="Start Time" />
          <FormInput name="endTime" type="time" label="End Time" />
        </div>
      </div>

      {/* --- DESCRIPTION / NOTES --- */}
      <div>
        <label
          htmlFor="notes"
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          <AlignLeft className="w-4 h-4" />
          <span>Description / Notes</span>
        </label>
        <textarea
          id="notes"
          {...register("notes")}
          rows={3}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors placeholder:text-gray-400"
          placeholder="Add specific instructions, agenda details, or internal notes here..."
        />
      </div>
    </div>
  );
};

export default Step1EventDetails;
