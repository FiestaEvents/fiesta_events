// src/components/events/EventForm/steps/Step1EventDetails.jsx
import React from "react";
import { Calendar, Clock, Users } from "lucide-react";
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Textarea from "../../../../components/common/Textarea";
import Toggle from "../../../../components/common/Toggle";

const eventTypeOptions = [
  { value: "", label: "Select Event Type" },
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "corporate", label: "Corporate" },
  { value: "conference", label: "Conference" },
  { value: "party", label: "Party" },
  { value: "other", label: "Other" },
];

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const Step1EventDetails = ({ formData, handleChange, errors }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-5 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Details Card */}
        <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Event Details</h4>
          </div>
          <div className="space-y-4">
            <Input
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
              placeholder="Enter event title..."
            />

            <Select
              label="Event Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={eventTypeOptions}
              error={errors.type}
              required
            />

            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={statusOptions}
            />

            <Textarea
              label="Event Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the event, special requirements, etc..."
            />
          </div>
        </div>

        {/* Date & Time Card */}
        <div className="bg-white dark:bg-gray-800/50 border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Date & Time</h4>
          </div>
          <div className="space-y-3">
            {/* Same Day Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Same Day Event
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
                label="Event Date"
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
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  error={errors.startDate}
                  required
                />
                <Input
                  label="End Date"
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
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleChange}
              />
              <Input
                label="End Time"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleChange}
                error={errors.endTime}
              />
            </div>

            {/* Guest Count */}
            <Input
              label="Guest Count"
              name="guestCount"
              type="number"
              min="1"
              value={formData.guestCount}
              onChange={handleChange}
              icon={Users}
              error={errors.guestCount}
              placeholder="Expected number of guests"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1EventDetails;