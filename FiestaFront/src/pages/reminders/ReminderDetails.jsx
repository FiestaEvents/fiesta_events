import React from 'react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { format } from 'date-fns';

const ReminderDetails = ({ reminder, onEdit }) => {
  if (!reminder) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {reminder.title || 'Untitled Reminder'}
        </h2>
        <Badge color={reminder.status === 'completed' ? 'green' : 'gray'}>
          {reminder.status || 'pending'}
        </Badge>
      </div>

      <div className="space-y-2 text-gray-700 dark:text-gray-300">
        <p><span className="font-medium">Type:</span> {reminder.type || 'general'}</p>
        <p><span className="font-medium">Date:</span> {reminder.date ? format(new Date(reminder.date), 'PPpp') : '-'}</p>
        <p><span className="font-medium">Description:</span> {reminder.description || 'No description provided.'}</p>
      </div>

      <div className="flex justify-end mt-4">
        <Button onClick={onEdit}>Edit Reminder</Button>
      </div>
    </div>
  );
};

export default ReminderDetails;
