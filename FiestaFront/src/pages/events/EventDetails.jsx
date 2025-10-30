// EventDetails.jsx
import React from 'react';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { CalendarIcon, MapPinIcon, UsersIcon, FileTextIcon } from '../../components/icons/IconComponents';

const EventDetails = ({ event, onEdit }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'green';
      case 'cancelled':
        return 'red';
      case 'pending':
      default:
        return 'yellow';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          {event.title || 'Untitled Event'}
        </h3>
        <Badge color={getBadgeColor(event.status)}>
          {event.status || 'pending'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300 border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <span className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{formatDate(event.date)}</span>
        </span>
        <span className="flex items-center">
          <MapPinIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{event.location || 'No location'}</span>
        </span>
        <span className="flex items-center">
          <UsersIcon className="h-4 w-4 mr-2 flex-shrink-0" />
          {event.guests || 0} guests
        </span>
      </div>

      {event.description && (
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Description</h4>
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
            {event.description}
          </p>
        </div>
      )}

      {event.notes && (
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
            <FileTextIcon className="h-4 w-4 mr-2 text-gray-400" /> Staff Notes
          </h4>
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg dark:bg-orange-500/10 dark:text-orange-200">
            <p className="whitespace-pre-wrap">{event.notes}</p>
          </div>
        </div>
      )}

      {onEdit && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onEdit} variant="primary" className="w-full">
            Edit Event
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventDetails;