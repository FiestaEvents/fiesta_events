import React from "react";
import { Users, AlertTriangle, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 

// Generic Components
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Textarea from "../../../../components/common/Textarea";
import Toggle from "../../../../components/common/Toggle";
import DateInput from "../../../../components/common/DateInput"; 

const Step1EventDetails = () => {
  const { t } = useTranslation();
  const { formData, handleChange, errors } = useEventContext();

  const eventTypeOptions = [
    { value: "", label: t('eventForm.step1.selectEventType', 'Select Type') },
    { value: "wedding", label: t('eventForm.step1.eventTypes.wedding', 'Wedding') },
    { value: "birthday", label: t('eventForm.step1.eventTypes.birthday', 'Birthday') },
    { value: "corporate", label: t('eventForm.step1.eventTypes.corporate', 'Corporate') },
    { value: "conference", label: t('eventForm.step1.eventTypes.conference', 'Conference') },
    { value: "other", label: t('eventForm.step1.eventTypes.other', 'Other') },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* SECTION 1: GENERAL INFO */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
          {t('eventForm.step1.generalInfo', 'General Information')}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
          Basic details about the event.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Title - Full Width */}
          <div className="md:col-span-2">
            <Input 
              label={t('eventForm.step1.eventTitle')} 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              error={errors.title} 
              required 
              placeholder="e.g., Summer Gala 2025"
              className="bg-white dark:bg-gray-800"
            />
          </div>
          
          {/* Type */}
          <Select 
            label={t('eventForm.step1.eventType')} 
            name="type" 
            value={formData.type} 
            onChange={handleChange} 
            options={eventTypeOptions} 
            error={errors.type} 
            required 
          />
          
          {/* Guest Count */}
          <Input 
            label={t('eventForm.step1.guestCount')} 
            name="guestCount" 
            type="number" 
            min="1" 
            value={formData.guestCount} 
            onChange={handleChange} 
            icon={Users} 
            error={errors.guestCount}
            placeholder="0"
          />

          {/* Description - Full Width */}
          <div className="md:col-span-2">
            <Textarea 
              label={t('eventForm.step1.eventDescription')} 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={4}
              placeholder={t('eventForm.step1.descPlaceholder', 'Add details about the event nature, specific requirements...')}
              className="resize-none bg-white dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      {/* DIVIDER */}
      <hr className="border-gray-100 dark:border-gray-700" />

      {/* SECTION 2: SCHEDULE */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
              {t('eventForm.step1.schedule', 'Date & Time')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Set the duration of the event.
            </p>
          </div>
          
          {/* Same Day Toggle - FIXED: Better mobile layout */}
          <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-800/50 px-3 sm:px-4 py-2 rounded-lg border border-gray-100 dark:border-gray-700 self-start sm:self-auto">
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {t('eventForm.step1.sameDayEvent')}
            </span>
            <Toggle 
              enabled={formData.sameDayEvent} 
              onChange={(val) => handleChange({ target: { name: "sameDayEvent", value: val } })} 
            />
          </div>
        </div>

        {/* Conflict Error Banner - FIXED: Better mobile spacing */}
        {errors.dateConflict && (
          <div className="mb-4 sm:mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-red-800 dark:text-red-300">
                {t('eventForm.step1.conflictTitle', 'Scheduling Conflict')}
              </h4>
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400 mt-1">
                {errors.dateConflict}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Dates */}
          {formData.sameDayEvent ? (
            <div className="md:col-span-2">
              <DateInput 
                label={t('eventForm.step1.eventDate')} 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                error={errors.startDate} 
                required 
              />
            </div>
          ) : (
            <>
              <DateInput 
                label={t('eventForm.step1.startDate')} 
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                error={errors.startDate} 
                required 
              />
              <DateInput 
                label={t('eventForm.step1.endDate')} 
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                error={errors.endDate} 
                required 
                min={formData.startDate}
              />
            </>
          )}

          {/* Times */}
          <Input 
            label={t('eventForm.step1.startTime')} 
            name="startTime" 
            type="time" 
            value={formData.startTime} 
            onChange={handleChange} 
            error={errors.startTime}
            required
          />
          <Input 
            label={t('eventForm.step1.endTime')} 
            name="endTime" 
            type="time" 
            value={formData.endTime} 
            onChange={handleChange} 
            error={errors.endTime}
            required
          />
        </div>
        
        {/* Helper Note - FIXED: Better mobile sizing */}
        {!errors.dateConflict && (
          <div className="mt-3 sm:mt-4 flex gap-1.5 sm:gap-2 items-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
            <Info size={12} className="sm:w-[14px] sm:h-[14px] shrink-0" />
            <span>Duration is calculated automatically based on start and end times.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Step1EventDetails;