import React from 'react';
import { AlignLeft, Calendar, Tag, Link2, User } from 'lucide-react';

const InfoBlock = ({ icon: Icon, label, children, className = "" }) => (
  <div className={`flex items-start gap-4 ${className}`}>
    <div className="p-3 rounded-lg bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 mt-1">
      <Icon size={20} />
    </div>
    <div className="flex-1">
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </h4>
      <div className="text-gray-900 dark:text-white text-base font-medium">
        {children}
      </div>
    </div>
  </div>
);

const ReminderInfo = ({ reminder, formatDate }) => {
  if (!reminder) return null;

  return (
    <div className="space-y-8">
      {/* Description */}
      <InfoBlock icon={AlignLeft} label="Description">
        {reminder.description ? (
          <p className="leading-relaxed whitespace-pre-wrap">{reminder.description}</p>
        ) : (
          <span className="text-gray-400 italic">No description provided.</span>
        )}
      </InfoBlock>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Date & Time */}
        <InfoBlock icon={Calendar} label="Due Date">
          <p>{formatDate ? formatDate(reminder.reminderDate) : reminder.reminderDate}</p>
          <p className="text-gray-500 text-sm mt-1">Time: {reminder.reminderTime}</p>
        </InfoBlock>

        {/* Type & Priority */}
        <InfoBlock icon={Tag} label="Category">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm capitalize">
              {reminder.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm capitalize ${
              reminder.priority === 'urgent' ? 'bg-red-100 text-red-700' :
              reminder.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {reminder.priority} Priority
            </span>
          </div>
        </InfoBlock>
      </div>

      {/* Linked Items (If any) */}
      {(reminder.relatedEvent || reminder.relatedClient || reminder.relatedTask) && (
        <InfoBlock icon={Link2} label="Linked To">
          <div className="flex flex-wrap gap-2">
            {reminder.relatedEvent && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 text-sm">
                Event: {reminder.relatedEvent.title || "Event"}
              </span>
            )}
            {reminder.relatedClient && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-green-50 text-green-700 border border-green-100 text-sm">
                Client: {reminder.relatedClient.name || "Client"}
              </span>
            )}
            {reminder.relatedTask && (
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-sm">
                Task: {reminder.relatedTask.title || "Task"}
              </span>
            )}
          </div>
        </InfoBlock>
      )}

      {/* Created By */}
      {reminder.createdBy && (
        <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <User size={16} />
            <span>Created by {reminder.createdBy.name || "User"} on {new Date(reminder.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderInfo;