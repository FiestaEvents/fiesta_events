// src/components/events/EventForm/steps/Step1EventDetails.jsx
import React from "react";
import { Calendar, Clock, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Textarea from "../../../../components/common/Textarea";
import Toggle from "../../../../components/common/Toggle";

const Step1EventDetails = ({ formData, handleChange, errors }) => {
  const { t } = useTranslation();

  const eventTypeOptions = [
    { value: "", label: t('eventForm.step1.selectEventType') },
    { value: "wedding", label: t('eventForm.step1.eventTypes.wedding') },
    { value: "birthday", label: t('eventForm.step1.eventTypes.birthday') },
    { value: "corporate", label: t('eventForm.step1.eventTypes.corporate') },
    { value: "conference", label: t('eventForm.step1.eventTypes.conference') },
    { value: "party", label: t('eventForm.step1.eventTypes.party') },
    { value: "other", label: t('eventForm.step1.eventTypes.other') },
  ];

  const statusOptions = [
    { value: "pending", label: t('eventForm.step1.statusOptions.pending') },
    { value: "confirmed", label: t('eventForm.step1.statusOptions.confirmed') },
    { value: "in-progress", label: t('eventForm.step1.statusOptions.inProgress') },
    { value: "completed", label: t('eventForm.step1.statusOptions.completed') },
    { value: "cancelled", label: t('eventForm.step1.statusOptions.cancelled') },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Details Card */}
        <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {t('eventForm.step1.eventDetails')}
            </h4>
          </div>
          <div className="space-y-4">
            <Input
              label={t('eventForm.step1.eventTitle')}
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              placeholder={t('eventForm.step1.eventTitlePlaceholder')}
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

            <Select
              label={t('eventForm.step1.status')}
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
            />

            <Textarea
              label={t('eventForm.step1.eventDescription')}
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder={t('eventForm.step1.eventDescriptionPlaceholder')}
            />
          </div>
        </div>

        {/* Date & Time Card */}
        <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {t('eventForm.step1.dateTime')}
            </h4>
          </div>
          <div className="space-y-3">
            {/* Same Day Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('eventForm.step1.sameDayEvent')}
              </span>
              <Toggle
                enabled={formData.sameDayEvent}
                onChange={(val) =>
                  handleChange({ target: { name: "sameDayEvent", value: val } })
                }
              />
            </div>

            {/* Date Inputs */}
            {formData.sameDayEvent ? (
              <Input
                label={t('eventForm.step1.eventDate')}
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
                required
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={t('eventForm.step1.startDate')}
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  required
                />
                <Input
                  label={t('eventForm.step1.endDate')}
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  error={errors.endDate}
                  required
                />
              </div>
            )}

            {/* Time Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t('eventForm.step1.startTime')}
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
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
              placeholder={t('eventForm.step1.guestCountPlaceholder')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1EventDetails;