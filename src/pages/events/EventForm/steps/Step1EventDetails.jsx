import React from "react";
import { Calendar, Clock, Users, AlertTriangle, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEventContext } from "../EventFormContext"; 

// ✅ Generic Components
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
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* ✅ Conflict Error Banner (Styled) */}
      {errors.dateConflict && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-4 shadow-sm">
          <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
              {t('eventForm.step1.conflictTitle', 'Scheduling Conflict')}
            </h3>
            <p className="mt-1 text-sm text-red-700 dark:text-red-400 leading-relaxed">
              {errors.dateConflict}
            </p>
            <p className="mt-2 text-xs text-red-600 dark:text-red-500 font-semibold uppercase tracking-wide">
              {t('eventForm.step1.conflictAction', 'Please adjust the Date or Time to resolve this.')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* --- Left Column: Basic Details --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('eventForm.step1.eventDetails')}
            </h4>
          </div>
          
          <div className="space-y-5">
            <Input 
              label={t('eventForm.step1.eventTitle')} 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              error={errors.title} 
              required 
              placeholder={t('eventForm.step1.titlePlaceholder', 'e.g., Summer Gala 2025')}
            />
            
            <Select 
              label={t('eventForm.step1.eventType')} 
              name="type" 
              value={formData.type} 
              onChange={handleChange} 
              options={eventTypeOptions} 
              error={errors.type} 
              required 
            />
            
            <Textarea 
              label={t('eventForm.step1.eventDescription')} 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows={5}
              placeholder={t('eventForm.step1.descPlaceholder', 'Add details about the event nature, specific requirements...')}
              className="resize-none"
            />
          </div>
        </div>

        {/* --- Right Column: Schedule --- */}
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full transition-shadow duration-300 ${errors.dateConflict ? 'ring-2 ring-red-500 dark:ring-red-500 shadow-red-100 dark:shadow-none' : ''}`}>
          
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className={`p-2 rounded-lg ${errors.dateConflict ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'} dark:bg-gray-700`}>
              <Clock className={`w-5 h-5 ${errors.dateConflict ? 'text-red-500' : 'text-orange-500'}`} />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('eventForm.step1.dateTime')}
            </h4>
          </div>

          <div className="space-y-5">
            
            {/* Same Day Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t('eventForm.step1.sameDayEvent')}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('eventForm.step1.sameDayHint', 'Start and end on the same date')}
                </span>
              </div>
              <Toggle 
                enabled={formData.sameDayEvent} 
                onChange={(val) => handleChange({ target: { name: "sameDayEvent", value: val } })} 
              />
            </div>
            
            {/* Date Selection Logic */}
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
              <div className="grid grid-cols-2 gap-4">
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
                  min={formData.startDate} // Logical constraint
                />
              </div>
            )}

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label={t('eventForm.step1.startTime')} 
                name="startTime" 
                type="time" 
                value={formData.startTime} 
                onChange={handleChange} 
                error={errors.dateConflict ? " " : null} // Hide text if banner exists, just show red border
                className="w-full"
              />
              <Input 
                label={t('eventForm.step1.endTime')} 
                name="endTime" 
                type="time" 
                value={formData.endTime} 
                onChange={handleChange} 
                error={errors.endTime} 
                className="w-full"
              />
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1EventDetails;