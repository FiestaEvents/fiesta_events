// src/components/events/EventForm/steps/Step1EventDetails.jsx
import React from "react";
import { Calendar, Clock, Users, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Textarea from "../../../../components/common/Textarea";
import Toggle from "../../../../components/common/Toggle";
import DateInput from "../../../../components/common/DateInput"; 

const Step1EventDetails = () => {
  const { t } = useTranslation();
  const { formData, handleChange, errors } = useEventContext();

  const eventTypeOptions = [
    { value: "", label: t('eventForm.step1.selectEventType') },
    { value: "wedding", label: t('eventForm.step1.eventTypes.wedding') },
    { value: "birthday", label: t('eventForm.step1.eventTypes.birthday') },
    { value: "corporate", label: t('eventForm.step1.eventTypes.corporate') },
    { value: "conference", label: t('eventForm.step1.eventTypes.conference') },
    { value: "other", label: t('eventForm.step1.eventTypes.other') },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      
      {/* ✅ NEW: Conflict Error Banner */}
      {errors.dateConflict && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg animate-pulse">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Scheduling Conflict</h3>
              <div className="mt-1 text-sm text-red-700">
                {errors.dateConflict}
              </div>
              <p className="mt-2 text-xs text-red-600 font-medium">
                Please adjust the Date or Time to resolve this.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">{t('eventForm.step1.eventDetails')}</h4>
          </div>
          <div className="space-y-4">
            <Input label={t('eventForm.step1.eventTitle')} name="title" value={formData.title} onChange={handleChange} error={errors.title} required />
            <Select label={t('eventForm.step1.eventType')} name="type" value={formData.type} onChange={handleChange} options={eventTypeOptions} error={errors.type} required />
            <Textarea label={t('eventForm.step1.eventDescription')} name="description" value={formData.description} onChange={handleChange} rows={4} />
          </div>
        </div>

        {/* Right Column */}
        <div className={`bg-white dark:bg-gray-800/50 border rounded-lg p-5 ${errors.dateConflict ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">{t('eventForm.step1.dateTime')}</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('eventForm.step1.sameDayEvent')}</span>
              <Toggle enabled={formData.sameDayEvent} onChange={(val) => handleChange({ target: { name: "sameDayEvent", value: val } })} />
            </div>
            
            {formData.sameDayEvent ? (
              <DateInput 
                label={t('eventForm.step1.eventDate')} 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                error={errors.startDate || (errors.dateConflict ? " " : null)} 
                required 
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <DateInput label={t('eventForm.step1.startDate')} name="startDate" value={formData.startDate} onChange={handleChange} error={errors.startDate} required />
                <DateInput label={t('eventForm.step1.endDate')} name="endDate" value={formData.endDate} onChange={handleChange} error={errors.endDate} required />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input 
                label={t('eventForm.step1.startTime')} 
                name="startTime" 
                type="time" 
                value={formData.startTime} 
                onChange={handleChange} 
                error={errors.dateConflict ? "Time conflict" : null}
              />
              <Input 
                label={t('eventForm.step1.endTime')} 
                name="endTime" 
                type="time" 
                value={formData.endTime} 
                onChange={handleChange} 
                error={errors.endTime} 
              />
            </div>

            <Input label={t('eventForm.step1.guestCount')} name="guestCount" type="number" min="1" value={formData.guestCount} onChange={handleChange} icon={Users} error={errors.guestCount} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1EventDetails;