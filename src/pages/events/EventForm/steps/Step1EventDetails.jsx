//src/pages/events/EventForm/steps/Step1EventDetails.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 

// Generic Components
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Textarea from "../../../../components/common/Textarea";
import DateInput from "../../../../components/common/DateInput"; 

// --- Segmented Control Helper ---
const SegmentedControl = ({ options, value, onChange, name }) => (
  <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg w-full sm:w-auto">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange({ target: { name, value: opt.value } })}
        className={`
          flex-1 sm:flex-none px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200
          ${value === opt.value 
            ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm" 
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          }
        `}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const Step1EventDetails = () => {
  const { t } = useTranslation();
  const { formData, handleChange, errors } = useEventContext();

  const eventTypeOptions = [
    { value: "wedding", label: t('eventForm.step1.eventTypes.wedding') },
    { value: "birthday", label: t('eventForm.step1.eventTypes.birthday') },
    { value: "corporate", label: t('eventForm.step1.eventTypes.corporate') },
    { value: "conference", label: t('eventForm.step1.eventTypes.conference') },
    { value: "other", label: t('eventForm.step1.eventTypes.other') },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Event Basics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Define the core details of the event.</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Full Width Title */}
        <div className="md:col-span-2">
          <Input 
            label={t('eventForm.step1.eventTitle')} 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            error={errors.title} 
            required 
            placeholder="e.g. Summer Wedding Gala"
            className="text-lg py-3 w-full" 
          />
        </div>

        {/* Type & Guests */}
        <Select 
          label={t('eventForm.step1.eventType')} 
          name="type" 
          value={formData.type} 
          onChange={handleChange} 
          options={[{ value: "", label: "Select Type" }, ...eventTypeOptions]}
          error={errors.type} 
          required 
        />
        
        <Input 
          label={t('eventForm.step1.guestCount')} 
          name="guestCount" 
          type="number" 
          min="1" 
          value={formData.guestCount} 
          onChange={handleChange} 
          error={errors.guestCount}
         />

        {/* Description */}
        <div className="md:col-span-2">
          <Textarea 
            label={t('eventForm.step1.eventDescription')} 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            rows={3}
            className="w-full"
          />
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Schedule</h3>
            <p className="text-xs text-gray-500">Date and duration management.</p>
          </div>
          
          {/* Segmented Control for Same Day */}
          <SegmentedControl 
            name="sameDayEvent"
            value={formData.sameDayEvent}
            onChange={(e) => handleChange({ target: { name: "sameDayEvent", value: e.target.value } })}
            options={[
              { label: "Multi-Day", value: false },
              { label: "Same Day", value: true }
            ]}
          />
        </div>

        {errors.dateConflict && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm font-medium border border-red-200">
            {errors.dateConflict}
          </div>
        )}

        {/* --- FIXED LAYOUT GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 1. Start Date 
              If Same Day: Spans full width (col-span-2) for better aesthetics
              If Multi Day: Spans 1 column, End Date takes the other
          */}
          <div className={formData.sameDayEvent ? "md:col-span-2" : ""}>
            <DateInput 
              label={formData.sameDayEvent ? t('eventForm.step1.eventDate') : t('eventForm.step1.startDate')} 
              name="startDate" 
              value={formData.startDate} 
              onChange={handleChange} 
              error={errors.startDate} 
              required 
              className="w-full"
            />
          </div>
          
          {/* 2. End Date (Only visible if Multi-Day) */}
          {!formData.sameDayEvent && (
            <DateInput 
              label={t('eventForm.step1.endDate')} 
              name="endDate" 
              value={formData.endDate} 
              onChange={handleChange} 
              error={errors.endDate} 
              required 
              min={formData.startDate}
              className="w-full"
            />
          )}

          {/* 3 & 4. Times 
              These now sit directly in the grid.
              In "Same Day" mode: They form the second row (split 50/50).
              In "Multi Day" mode: They form the second row (split 50/50).
          */}
          <Input 
            label={t('eventForm.step1.startTime')} 
            name="startTime" 
            type="time" 
            value={formData.startTime} 
            onChange={handleChange} 
            error={errors.startTime}
            required
            className="w-full"
          />
          <Input 
            label={t('eventForm.step1.endTime')} 
            name="endTime" 
            type="time" 
            value={formData.endTime} 
            onChange={handleChange} 
            error={errors.endTime}
            required
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Step1EventDetails;